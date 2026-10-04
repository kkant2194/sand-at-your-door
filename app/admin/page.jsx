"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";

import { DEFAULT_SAME_DAY_SURCHARGE, getSameDaySurcharge, parseSameDaySurcharge } from "../../lib/deliveryPricing";

const defaultVehicles = [
  { id: "tractor", name: "Tractor load", wheels: 2, price: 4200 },
  { id: "truck6", name: "6-wheel truck", wheels: 6, price: 12500 },
  { id: "truck10", name: "10-wheel truck", wheels: 10, price: 18500 },
  { id: "truck12", name: "12-wheel truck", wheels: 12, price: 22500 },
  { id: "truck16", name: "16-wheel truck", wheels: 16, price: 29500 },
];

const defaultPricing = {
  priceDate: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()),
  vehicles: defaultVehicles,
};

const fallbackPhoneNumber = "917259987874";
const fallbackEmail = "digitInfra@gmail.com";

const emptyAuth = {
  email: "",
  password: "",
};

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizePhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return fallbackPhoneNumber;
  if (digits.length === 10) return `91${digits}`;

  return digits;
}

function formatPhoneNumber(value) {
  const digits = normalizePhoneNumber(value);

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return `+${digits}`;
}

function normalizePricing(row) {
  if (!row?.rates) return defaultPricing;

  if (Array.isArray(row.rates.vehicles)) {
    return {
      priceDate: row.price_date || defaultPricing.priceDate,
      vehicles: row.rates.vehicles.map((vehicle) => ({
        id: String(vehicle.id || crypto.randomUUID()),
        name: String(vehicle.name || "Vehicle"),
        wheels: Number(vehicle.wheels || 0),
        price: Number(vehicle.price || 0),
      })),
    };
  }

  return defaultPricing;
}

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authForm, setAuthForm] = useState(emptyAuth);
  const [pricing, setPricing] = useState(defaultPricing);
  const [settings, setSettings] = useState({ contactPhone: fallbackPhoneNumber, contactEmail: fallbackEmail, sameDaySurcharge: DEFAULT_SAME_DAY_SURCHARGE });
  const [queries, setQueries] = useState([]);
  const [authStatus, setAuthStatus] = useState("");
  const [pricingStatus, setPricingStatus] = useState("");
  const [settingsStatus, setSettingsStatus] = useState("");

  const [activeTab, setActiveTab] = useState("enquiries");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [queryStatus, setQueryStatus] = useState("");
  const [busy, setBusy] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const statuses = ["new", "contacted", "confirmed", "delivered", "cancelled"];
  const filteredQueries = queries.filter((query) => (statusFilter === "all" || query.status === statusFilter) && [query.name, query.phone, query.address, query.sand_type, query.id].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase())));
  async function runAction(name, action, event) {
    event?.preventDefault();
    if (busy) return;
    setBusy(name);
    try { await action(event || { preventDefault() {} }); }
    catch { if (name === "auth") setAuthStatus("Unable to connect. Please retry."); else if (name === "pricing") setPricingStatus("Could not save prices. Please retry."); else if (name === "settings") setSettingsStatus("Could not save settings. Please retry."); else setQueryStatus("Unable to update this enquiry. Please retry."); }
    finally { setBusy(""); }
  }
  const isAdmin = Boolean(profile?.is_admin);

  useEffect(() => {
    async function bootstrap() {
      if (!isSupabaseConfigured) return;

      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;
      setUser(currentUser);

      if (currentUser && data.session?.access_token) {
        await bootstrapProfile(data.session.access_token);
      }

      await Promise.all([loadPricing(), loadSiteSettings()]);
    }

    bootstrap().catch(() => setAuthStatus("Could not restore your session. Please sign in again.")).finally(() => setCheckingSession(false));

    if (!isSupabaseConfigured) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.access_token) {
        await bootstrapProfile(session.access_token);
      } else {
        setProfile(null);
        setQueries([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadQueries().catch(() => setQueryStatus("Could not load enquiries. Please refresh."));
    }
  }, [isAdmin]);

  async function bootstrapProfile(token) {
    const response = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => null);
    if (response.ok) {
      setProfile(data.profile);
      setAuthStatus(data.profile?.is_admin ? "Admin access active." : "Access denied.");
    } else {
      setProfile(null);
      setQueries([]);
      setAuthStatus(data?.error || "Could not load admin profile.");
    }
  }

  async function handleAuth(event) {
    event.preventDefault();
    setAuthStatus("");

    if (!isSupabaseConfigured) {
      setAuthStatus("Add Supabase environment variables before using admin login.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: authForm.email,
      password: authForm.password,
    });

    setAuthStatus(error ? error.message : "Signed in.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAuthStatus("Signed out.");
  }

  async function loadPricing() {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from("pricing")
      .select("*")
      .order("price_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) setPricing(normalizePricing(data));
  }

  async function loadSiteSettings() {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase.from("site_settings").select("key, value").in("key", ["contact_phone", "contact_email", "same_day_surcharge"]);
    if (!error && Array.isArray(data)) {
      const loadedSettings = Object.fromEntries(data.map((row) => [row.key, row.value]));
      setSettings({
        contactPhone: normalizePhoneNumber(loadedSettings.contact_phone),
        contactEmail: loadedSettings.contact_email || fallbackEmail,
        sameDaySurcharge: getSameDaySurcharge(loadedSettings.same_day_surcharge),
      });
    }
  }

  async function loadQueries() {
    setLoadingQueries(true);
    setQueryStatus("");
    try {
      const { data, error } = await supabase.from("user_queries").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) setQueryStatus("Could not load enquiries. Please refresh.");
      else setQueries(data || []);
    } catch { setQueryStatus("Could not load enquiries. Check your connection and refresh."); }
    finally { setLoadingQueries(false); }
  }

  function addVehicle() {
    setPricing((current) => ({
      ...current,
      vehicles: [...current.vehicles, { id: crypto.randomUUID(), name: "New vehicle", wheels: 0, price: 0 }],
    }));
  }

  function updateVehicle(id, field, value) {
    setPricing((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) =>
        vehicle.id === id
          ? {
              ...vehicle,
              [field]: field === "name" ? value : Math.max(Number(value) || 0, 0),
            }
          : vehicle,
      ),
    }));
  }

  function removeVehicle(id) {
    setPricing((current) => ({
      ...current,
      vehicles: current.vehicles.filter((vehicle) => vehicle.id !== id),
    }));
  }

  async function savePricing(event) {
    event.preventDefault();
    if (!isAdmin) {
      setPricingStatus("Admin access is required.");
      return;
    }

    const vehicles = pricing.vehicles
      .filter((vehicle) => vehicle.name.trim())
      .map((vehicle) => ({
        id: vehicle.id,
        name: vehicle.name.trim(),
        wheels: Number(vehicle.wheels || 0),
        price: Number(vehicle.price || 0),
      }));

    if (!vehicles.length || vehicles.some((vehicle) => !Number.isFinite(vehicle.price) || vehicle.price <= 0 || !Number.isInteger(vehicle.wheels))) {
      setPricingStatus("Add at least one vehicle with a positive price and a whole wheel count.");
      return;
    }

    const { error } = await supabase.from("pricing").upsert(
      {
        price_date: pricing.priceDate,
        rates: { vehicles },
        updated_by: user.id,
      },
      { onConflict: "price_date" },
    );

    if (error) {
      setPricingStatus(error.message);
      return;
    }

    setPricing((current) => ({ ...current, vehicles }));
    setPricingStatus(`Prices saved for ${pricing.priceDate}.`);
  }

  async function saveSettings(event) {
    event.preventDefault();
    if (!isAdmin) {
      setSettingsStatus("Admin access is required.");
      return;
    }

    const sameDaySurcharge = parseSameDaySurcharge(settings.sameDaySurcharge);
    if (sameDaySurcharge === null) {
      setSettingsStatus("Enter a whole-rupee surcharge between ₹0 and ₹100,000.");
      return;
    }
    const contactPhone = normalizePhoneNumber(settings.contactPhone);
    const contactEmail = String(settings.contactEmail || "").trim() || fallbackEmail;
    const { error } = await supabase.from("site_settings").upsert(
      [
        {
          key: "contact_phone",
          value: contactPhone,
          updated_by: user.id,
        },
        {
          key: "contact_email",
          value: contactEmail,
          updated_by: user.id,
        },
        { key: "same_day_surcharge", value: String(sameDaySurcharge), updated_by: user.id },
      ],
      { onConflict: "key" },
    );

    if (error) {
      setSettingsStatus(error.message);
      return;
    }

    setSettings({ contactPhone, contactEmail, sameDaySurcharge });
    setSettingsStatus(`Website settings saved. Same-day surcharge: ${currency(sameDaySurcharge)}.`);
  }

  async function updateQueryStatus(id, status) {
    const { error } = await supabase.from("user_queries").update({ status }).eq("id", id);
    if (!error) { await loadQueries(); setQueryStatus("Enquiry status updated."); }
    else setQueryStatus("Could not update enquiry status. Please retry.");
  }

  return (
    <div className="admin-shell">
      <header className="admin-header"><a className="brand" href="/admin"><span className="brand-mark">SA</span><span><strong>Sand At Your Door</strong><small>Business dashboard</small></span></a><div className="admin-header-actions"><a href="/" className="button secondary">View website ↗</a>{user && <button className="button secondary" disabled={Boolean(busy)} onClick={() => runAction("logout", handleLogout)}>Sign out</button>}</div></header>
      <main className="admin-main">
        {checkingSession ? <div className="admin-empty" role="status">Checking your session…</div> : !isAdmin ? <section className="admin-login">
          <div className="admin-login-copy"><p className="eyebrow">Digit Infra Pvt LTD</p><h1>Your business,<br />in one place.</h1><p>Manage incoming enquiries, keep vehicle rates up to date, and update your public contact details.</p><div className="admin-login-features"><span>01 · Customer enquiries</span><span>02 · Vehicle pricing</span><span>03 · Website settings</span></div></div>
          {user ? <div className="admin-panel"><h2>Admin access required</h2><p>{user.email}</p><p role="status">{authStatus || "This account does not have admin permission."}</p></div> : <form className="admin-panel admin-login-form" onSubmit={(event) => runAction("auth", handleAuth, event)}><p className="eyebrow">Admin portal</p><h2>Welcome back</h2><p className="muted">Sign in with your approved admin account.</p><label>Email address<input type="email" autoComplete="username" placeholder="you@company.com" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label><label>Password<input type="password" autoComplete="current-password" placeholder="Enter your password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required minLength={6} /></label><button className="button primary" disabled={Boolean(busy)}>{busy === "auth" ? "Signing in…" : "Sign in"}</button>{authStatus && <p className="admin-feedback" role="status">{authStatus}</p>}</form>}
        </section> : <>
          <div className="admin-title"><div><p className="eyebrow">Business overview</p><h1>Dashboard</h1><p className="muted">Manage your sand delivery business.</p></div><div className="admin-account"><span className="admin-online">Admin access active</span><small>{user.email}</small></div></div>
          <div className="admin-stats">{[{label:"Loaded enquiries",value:queries.length},{label:"New enquiries",value:queries.filter((query)=>query.status==="new").length},{label:"Confirmed",value:queries.filter((query)=>query.status==="confirmed").length},{label:"Vehicles in editor",value:pricing.vehicles.length}].map((stat)=><article key={stat.label}><span>{stat.label}</span><strong>{loadingQueries ? "—" : stat.value}</strong></article>)}</div>
          <nav className="admin-tabs" aria-label="Dashboard sections">{["enquiries","pricing","settings"].map((tab)=><button key={tab} aria-current={activeTab===tab ? "page" : undefined} className={activeTab===tab ? "active" : ""} onClick={()=>setActiveTab(tab)}>{tab === "enquiries" ? "Customer enquiries" : tab === "pricing" ? "Vehicle pricing" : "Website settings"}</button>)}</nav>
          {activeTab === "enquiries" && <section className="admin-panel" aria-labelledby="enquiries-title"><div className="admin-panel-heading"><div><h2 id="enquiries-title">Customer enquiries</h2><p className="muted">Latest 200 enquiries · newest first</p></div><button className="button secondary" disabled={loadingQueries} onClick={loadQueries}>{loadingQueries ? "Refreshing…" : "↻ Refresh"}</button></div><div className="admin-filters"><label>Search enquiries<input type="search" placeholder="Name, phone, address or reference" value={search} onChange={(event)=>setSearch(event.target.value)} /></label><label>Status<select value={statusFilter} onChange={(event)=>setStatusFilter(event.target.value)}><option value="all">All statuses</option>{statuses.map((status)=><option key={status} value={status}>{status.charAt(0).toUpperCase()+status.slice(1)}</option>)}</select></label><span className="muted">{filteredQueries.length} results</span></div>{queryStatus && <p role="status" className="admin-feedback">{queryStatus}</p>}
          {loadingQueries ? <div className="admin-empty" role="status">Loading enquiries…</div> : !filteredQueries.length ? <div className="admin-empty"><h3>{queries.length ? "No matching enquiries" : "No enquiries yet"}</h3><p>{queries.length ? "Try another search or status filter." : "Customer quote requests will appear here."}</p>{queries.length > 0 && <button className="button secondary" onClick={()=>{setSearch("");setStatusFilter("all");}}>Clear filters</button>}</div> : <div className="admin-table-scroll" role="region" aria-label="Customer enquiries table" tabIndex={0}><table className="admin-enquiry-table"><caption className="sr-only">Customer enquiries, newest first</caption><thead><tr><th scope="col">Customer</th><th scope="col">Delivery address</th><th scope="col">Requirement</th><th scope="col">Estimate</th><th scope="col">Delivery</th><th scope="col">Received</th><th scope="col">Status</th></tr></thead><tbody>{filteredQueries.map((query)=><tr key={query.id}><td><strong>{query.name}</strong><a href={`tel:+${normalizePhoneNumber(query.phone)}`}>{query.phone}</a><details className="enquiry-extra"><summary>Reference & notes</summary><small>{query.id}</small><p>{query.notes || "No notes provided."}</p></details></td><td className="table-address">{query.address}</td><td><strong>{query.sand_type}</strong><span>{query.unit_label || query.unit}</span><small>{query.unit !== "unspecified" && `${query.quantity} ${Number(query.quantity) === 1 ? "load" : "loads"}`}</small></td><td className="table-price">{query.unit === "unspecified" ? "Price to be confirmed" : currency(query.total)}</td><td>{query.delivery}{query.schedule_date && <small>{query.schedule_date}<br/>{query.schedule_time || ""}</small>}</td><td><span>{new Date(query.created_at).toLocaleDateString("en-IN", {timeZone:"Asia/Kolkata"})}</span><small>{new Date(query.created_at).toLocaleTimeString("en-IN", {timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit"})} IST</small></td><td><label className="sr-only" htmlFor={`status-${query.id}`}>Status for {query.name}</label><select id={`status-${query.id}`} className={`table-status status-${query.status}`} disabled={Boolean(busy)} value={query.status || "new"} onChange={(event)=>runAction("status",()=>updateQueryStatus(query.id,event.target.value))}>{statuses.map((status)=><option key={status} value={status}>{status.charAt(0).toUpperCase()+status.slice(1)}</option>)}</select></td></tr>)}</tbody></table></div>}</section>}
          {activeTab === "pricing" && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Vehicle pricing</h2><p className="muted">Set the price per load for each vehicle. Future dates take effect on that date.</p></div></div><form className="admin-edit-form" onSubmit={(event)=>runAction("pricing",savePricing,event)}><label className="admin-date">Effective date<input type="date" required value={pricing.priceDate} onChange={(event)=>setPricing({...pricing,priceDate:event.target.value})}/></label><div className="admin-vehicle-editor">{pricing.vehicles.map((vehicle,index)=><article key={vehicle.id} className="admin-vehicle-row"><span className="vehicle-number">{String(index+1).padStart(2,"0")}</span><label>Vehicle name<input required maxLength={100} value={vehicle.name} onChange={(event)=>updateVehicle(vehicle.id,"name",event.target.value)} /></label><label>Wheels<input type="number" min={0} step={1} required value={vehicle.wheels} onChange={(event)=>updateVehicle(vehicle.id,"wheels",event.target.value)} /></label><label>Price per load (₹)<input type="number" min={1} step="any" required value={vehicle.price} onChange={(event)=>updateVehicle(vehicle.id,"price",event.target.value)} /></label><button className="admin-remove" type="button" disabled={pricing.vehicles.length===1 || Boolean(busy)} aria-label={`Remove ${vehicle.name}`} onClick={()=>removeVehicle(vehicle.id)}>Remove</button></article>)}</div><div className="admin-save-bar"><button className="button secondary" type="button" disabled={Boolean(busy)} onClick={addVehicle}>+ Add vehicle</button><button className="button primary" disabled={Boolean(busy)}>{busy === "pricing" ? "Saving…" : "Save prices"}</button></div>{pricingStatus && <p className="admin-feedback" role="status">{pricingStatus}</p>}</form></section>}
          {activeTab === "settings" && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Website settings</h2><p className="muted">Manage public contact details and the same-day delivery surcharge.</p></div></div><div className="admin-settings-grid"><form className="admin-edit-form" onSubmit={(event)=>runAction("settings",saveSettings,event)}><label>Phone & WhatsApp<input type="tel" autoComplete="tel" required value={settings.contactPhone} onChange={(event)=>setSettings({...settings,contactPhone:event.target.value})} /><small className="muted">Include the country code, e.g. 91 followed by your mobile number.</small></label><label>Contact email<input type="email" autoComplete="email" required value={settings.contactEmail} onChange={(event)=>setSettings({...settings,contactEmail:event.target.value})} /></label><label>Same-day surcharge (₹)<input type="number" inputMode="numeric" min={0} max={100000} step={1} required value={settings.sameDaySurcharge} onChange={(event)=>setSettings({...settings,sameDaySurcharge:event.target.value})} /><small className="muted">Added once per enquiry for same-day delivery. Set 0 to waive it.</small></label><button className="button primary" disabled={Boolean(busy)}>{busy === "settings" ? "Saving…" : "Save settings"}</button>{settingsStatus && <p className="admin-feedback" role="status">{settingsStatus}</p>}</form><aside className="admin-contact-preview"><p className="eyebrow">Public contact preview</p><h3>Talk to Digit Infra Pvt LTD.</h3><p>{formatPhoneNumber(settings.contactPhone)}</p><p>{settings.contactEmail}</p><p>Same-day surcharge: {currency(settings.sameDaySurcharge)}</p><small className="muted">Preview of your current edits. Save to update the website.</small></aside></div></section>}
        </>}
      </main><footer className="admin-footer">Digit Infra Pvt LTD · Sand At Your Door</footer>
    </div>
  );
}
