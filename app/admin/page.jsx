"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";

const defaultVehicles = [
  { id: "tractor", name: "Tractor load", wheels: 2, price: 4200 },
  { id: "truck6", name: "6-wheel truck", wheels: 6, price: 12500 },
  { id: "truck10", name: "10-wheel truck", wheels: 10, price: 18500 },
  { id: "truck12", name: "12-wheel truck", wheels: 12, price: 22500 },
  { id: "truck16", name: "16-wheel truck", wheels: 16, price: 29500 },
];

const defaultPricing = {
  priceDate: new Date().toISOString().slice(0, 10),
  vehicles: defaultVehicles,
};

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
  const [queries, setQueries] = useState([]);
  const [authStatus, setAuthStatus] = useState("");
  const [pricingStatus, setPricingStatus] = useState("");

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

      await loadPricing();
    }

    bootstrap();

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
      loadQueries();
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

  async function loadQueries() {
    const { data, error } = await supabase
      .from("user_queries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error) setQueries(data || []);
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

    if (!vehicles.length) {
      setPricingStatus("Add at least one vehicle.");
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

  async function updateQueryStatus(id, status) {
    const { error } = await supabase.from("user_queries").update({ status }).eq("id", id);
    if (!error) await loadQueries();
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Sand At Your Door home">
          <span className="brand-mark">SA</span>
          <span>
            <strong>Admin</strong>
            <small>Sand At Your Door</small>
          </span>
        </a>
        <nav className="main-nav" aria-label="Admin navigation">
          <a href="/">Public site</a>
          {isAdmin ? <a href="#pricing">Pricing</a> : null}
          {isAdmin ? <a href="#enquiries">Enquiries</a> : null}
        </nav>
        {user ? (
          <button className="button secondary" type="button" onClick={handleLogout}>
            Sign out
          </button>
        ) : null}
      </header>

      <main>
        <section className="section account-section">
          <div>
            <p className="eyebrow">Admin portal</p>
            <h1>Admin dashboard.</h1>
            <p className="status-text">This page is restricted to users with admin permission.</p>
          </div>

          {user ? (
            <div className="profile-card">
              <strong>{isAdmin ? "Admin access active" : "Access denied"}</strong>
              <span className="status-text">{user.email}</span>
              <p className="status-text">{authStatus}</p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleAuth}>
              <label>
                Owner email
                <input
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  type="email"
                  required
                />
              </label>
              <label>
                Password
                <input
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  type="password"
                  minLength="6"
                  required
                />
              </label>
              <button className="button primary" type="submit">
                Sign in
              </button>
              <p className="status-text">{authStatus}</p>
            </form>
          )}
        </section>

        {isAdmin ? (
          <>
            <section id="pricing" className="section admin-section">
              <div className="admin-copy">
                <p className="eyebrow">Daily pricing</p>
                <h2>Add vehicles and update today&apos;s rates.</h2>
                <p>Each vehicle can have its own wheel count and daily price.</p>
              </div>
              <form className="admin-form" onSubmit={savePricing}>
                <label>
                  Price date
                  <input
                    type="date"
                    value={pricing.priceDate}
                    onChange={(event) => setPricing((current) => ({ ...current, priceDate: event.target.value }))}
                    required
                  />
                </label>
                <div className="vehicle-editor">
                  {pricing.vehicles.map((vehicle) => (
                    <article key={vehicle.id} className="vehicle-row">
                      <label>
                        Vehicle name
                        <input value={vehicle.name} onChange={(event) => updateVehicle(vehicle.id, "name", event.target.value)} />
                      </label>
                      <label>
                        Wheels
                        <input
                          value={vehicle.wheels}
                          onChange={(event) => updateVehicle(vehicle.id, "wheels", event.target.value)}
                          type="number"
                          min="0"
                        />
                      </label>
                      <label>
                        Price
                        <input
                          value={vehicle.price}
                          onChange={(event) => updateVehicle(vehicle.id, "price", event.target.value)}
                          type="number"
                          min="0"
                          step="50"
                        />
                      </label>
                      <button className="button text" type="button" onClick={() => removeVehicle(vehicle.id)}>
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
                <div className="form-actions">
                  <button className="button secondary" type="button" onClick={addVehicle}>
                    Add vehicle
                  </button>
                  <button className="button primary" type="submit">
                    Save daily prices
                  </button>
                </div>
                <p className="status-text">{pricingStatus}</p>
              </form>
            </section>

            <section id="enquiries" className="section admin-section">
              <div className="admin-copy">
                <p className="eyebrow">Customer enquiries</p>
                <h2>Latest saved leads from the quote form.</h2>
                <button className="button secondary" type="button" onClick={loadQueries}>
                  Refresh
                </button>
              </div>
              <div className="lead-list">
                {queries.length ? (
                  queries.map((query) => (
                    <article key={query.id}>
                      <div>
                        <strong>
                          {query.name} · {query.phone}
                        </strong>
                        <p>{query.address}</p>
                        <p>
                          {query.sand_type} · {query.unit_label || query.unit} · {currency(query.total)}
                        </p>
                        <small>{new Date(query.created_at).toLocaleString("en-IN")}</small>
                      </div>
                      <label>
                        Status
                        <select value={query.status || "new"} onChange={(event) => updateQueryStatus(query.id, event.target.value)}>
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </label>
                    </article>
                  ))
                ) : (
                  <div className="price-summary">
                    <article>
                      <span>No saved enquiries yet</span>
                    </article>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}
