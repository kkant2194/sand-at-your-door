import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requiredText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server-side Supabase credentials are not configured." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || !requiredText(body.name) || !requiredText(body.phone) || !requiredText(body.address)) {
    return NextResponse.json({ error: "Invalid enquiry payload." }, { status: 400 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { error } = await adminClient.from("user_queries").insert({
    name: body.name.trim(),
    phone: body.phone.trim(),
    address: body.address.trim(),
    sand_type: body.sandType || "Sand",
    quantity: Math.max(Number(body.quantity) || 1, 1),
    unit: body.vehicleId || "vehicle",
    unit_label: body.vehicleName || "Vehicle",
    delivery: body.delivery || "Same day",
    schedule_date: body.scheduleDate || null,
    schedule_time: body.scheduleTime || null,
    notes: body.notes || null,
    total: Number(body.total || 0),
    rate: Number(body.rate || 0),
    price_date: body.priceDate || null,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
