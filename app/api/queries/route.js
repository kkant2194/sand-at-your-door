import { parseEstimatedCapacity } from "../../../lib/vehicleCapacity";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getSameDaySurcharge, parseSameDaySurcharge } from "../../../lib/deliveryPricing";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requiredText(value, max = 1000) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server-side Supabase credentials are not configured." },
      { status: 503 },
    );
  }

  if (Number(request.headers.get("content-length")) > 16384) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  const raw = await request.text();
  if (raw.length > 16384) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch { body = null; }
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  if (!body || !requiredText(body.name) || !requiredText(body.phone) || !requiredText(body.address) || !requiredText(body.name, 100)
    || typeof body.phone !== "string" || !/^(?:\+?91|0)?[6-9]\d{9}$/.test(body.phone.replace(/[ ()-]/g, ""))
    || (body.quantity != null && body.quantity !== "" && (body.quantity !== 0 || body.vehicleId)
      && (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 100))
    || (body.sandType && !["Plaster", "RCC (General)", "Terrace Slab", "Raft Foundation"].includes(body.sandType))
    || (body.delivery && !["Same day", "Tomorrow", "Scheduled"].includes(body.delivery))
    || (body.vehicleId && !requiredText(body.vehicleId, 100)) || (body.notes && !requiredText(body.notes, 2000))
    || (body.delivery === "Scheduled" && body.scheduleDate && (!/^\d{4}-\d{2}-\d{2}$/.test(body.scheduleDate || "")
      || !Number.isFinite(Date.parse(body.scheduleDate)) || new Date(body.scheduleDate).toISOString().slice(0, 10) !== body.scheduleDate
      || body.scheduleDate < today))) {
    return NextResponse.json({ error: "Invalid enquiry payload." }, { status: 400 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data: pricing, error: pricingError } = await adminClient.from("pricing").select("price_date, rates")
    .lte("price_date", today).order("price_date", { ascending: false }).limit(1).maybeSingle();
  const vehicle = Array.isArray(pricing?.rates?.vehicles) ? pricing.rates.vehicles.find((item) => item.id === body.vehicleId) : null;
  if (body.vehicleId && (pricingError || !vehicle || !Number.isFinite(Number(vehicle.price)) || Number(vehicle.price) <= 0)) {
    return NextResponse.json({ error: "Current pricing is unavailable. Please contact us for a quote." }, { status: 503 });
  }
  let sameDaySurcharge = 0;
  if (vehicle && body.delivery === "Same day") {
    const { data: setting, error: settingError } = await adminClient.from("site_settings")
      .select("value").eq("key", "same_day_surcharge").maybeSingle();
    if (settingError || (setting && parseSameDaySurcharge(setting.value) === null)) {
      return NextResponse.json({ error: "Delivery pricing is temporarily unavailable. Please retry." }, { status: 503 });
    }
    sameDaySurcharge = getSameDaySurcharge(setting?.value);
  }
  const estimatedCapacityCft = parseEstimatedCapacity(vehicle?.estimatedCapacityCft);
  const quantity = body.quantity || 1;
  const rate = vehicle ? Number(vehicle.price) : 0;
  const total = vehicle ? Math.round(rate * quantity + sameDaySurcharge) : 0;
  const { data, error } = await adminClient.from("user_queries").insert({
    name: body.name.trim(),
    phone: body.phone.trim(),
    address: body.address.trim(),
    sand_type: body.sandType || "Sand",
    quantity: Math.max(Number(body.quantity) || 1, 1),
    unit: body.vehicleId || "unspecified",
    unit_label: vehicle ? `${vehicle.name}${estimatedCapacityCft ? ` · Approx. ${estimatedCapacityCft} cft/load` : ""}` : "To be confirmed",
    delivery: body.delivery || "To be confirmed",
    schedule_date: body.delivery === "Scheduled" ? body.scheduleDate || null : null,
    schedule_time: null,
    notes: body.notes || null,
    total: total,
    rate: rate,
    price_date: vehicle ? pricing.price_date : null,
    status: "new",
  }).select("id").single();

  if (error) {
    return NextResponse.json({ error: "Could not save your enquiry. Please retry or contact us directly." }, { status: 500 });
  }

  const reference = data.id.replaceAll("-", "").slice(0, 10).toUpperCase();
  return NextResponse.json({ success: true, id: data.id, reference, rate, total, estimatedCapacityCft, priceDate: vehicle ? pricing.price_date : null, vehicleName: vehicle?.name || "To be confirmed", priced: Boolean(vehicle) });
}
