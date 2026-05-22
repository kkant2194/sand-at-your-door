"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const fallbackPhoneNumber = "917259987874";

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

const emptyQuote = {
  name: "",
  phone: "",
  address: "",
  sandType: "Residential Sand",
  quantity: 1,
  vehicleId: "tractor",
  delivery: "Same day",
  scheduleDate: "",
  scheduleTime: "",
  notes: "",
};

const copy = {
  en: {
    products: "Products",
    quote: "Quote",
    contact: "Contact",
    rates: "Today rates",
    eyebrow: "Same day sand delivery in Patna",
    title: "Reliable sand supply for homes, contractors, and commercial sites.",
    lead:
      "Order construction sand without hidden charges. Get clear pricing, scheduled delivery, and a fast callback from the Digit Infra team.",
    estimateCta: "Get instant estimate",
    whatsappCta: "WhatsApp now",
    productsEyebrow: "Sand for every project",
    productsTitle: "Choose the right material before ordering.",
    residential: "Residential Sand",
    residentialText: "For home construction, repairs, flooring base, small masonry jobs, and landscaping work.",
    commercial: "Commercial Supply",
    commercialText: "Reliable scheduled supply for shops, warehouses, offices, site preparation, and maintenance teams.",
    construction: "Construction Sand",
    constructionText: "High-volume delivery for contractors, builders, and civil work requiring dependable transport.",
    fastQuote: "Fast quote",
    quoteTitle: "Estimate your sand order and send it for confirmation.",
    quoteText:
      "This calculator gives an indicative price. Final pricing is confirmed after location, access, quantity, and unloading requirements are checked.",
    customerName: "Customer name",
    mobile: "Mobile number",
    address: "Delivery address",
    sandType: "Sand type",
    quantity: "Quantity",
    vehicle: "Vehicle",
    timing: "Delivery timing",
    date: "Delivery date",
    time: "Delivery time",
    notes: "Notes",
    save: "Save and notify WhatsApp",
    whatsappOnly: "Send on WhatsApp only",
    contactTitle: "Talk to Digit Infra Pvt LTD.",
    saved: "Enquiry saved. Opening WhatsApp for quick confirmation.",
  },
  hi: {
    products: "उत्पाद",
    quote: "भाव",
    contact: "संपर्क",
    rates: "आज का रेट",
    eyebrow: "पटना में उसी दिन बालू डिलीवरी",
    title: "घर, ठेकेदार और कमर्शियल साइट के लिए भरोसेमंद बालू सप्लाई।",
    lead: "बिना छिपे शुल्क के बालू ऑर्डर करें। साफ रेट, तय समय पर डिलीवरी और Digit Infra टीम से तेज कॉलबैक।",
    estimateCta: "तुरंत भाव देखें",
    whatsappCta: "व्हाट्सऐप करें",
    productsEyebrow: "हर काम के लिए बालू",
    productsTitle: "ऑर्डर से पहले सही सामग्री चुनें।",
    residential: "घरेलू बालू",
    residentialText: "घर निर्माण, मरम्मत, फ्लोरिंग बेस, छोटे मिस्त्री काम और लैंडस्केपिंग के लिए।",
    commercial: "कमर्शियल सप्लाई",
    commercialText: "दुकान, गोदाम, ऑफिस, साइट तैयारी और मेंटेनेंस टीम के लिए तय समय पर सप्लाई।",
    construction: "निर्माण बालू",
    constructionText: "ठेकेदार, बिल्डर और सिविल काम के लिए बड़ी मात्रा में भरोसेमंद सप्लाई।",
    fastQuote: "तेज भाव",
    quoteTitle: "अपना बालू ऑर्डर अनुमान लगाएं और कन्फर्मेशन के लिए भेजें।",
    quoteText: "यह केवल अनुमानित भाव है। फाइनल रेट लोकेशन, रास्ता, मात्रा और अनलोडिंग देखकर कन्फर्म होगा।",
    customerName: "ग्राहक का नाम",
    mobile: "मोबाइल नंबर",
    address: "डिलीवरी पता",
    sandType: "बालू का प्रकार",
    quantity: "मात्रा",
    vehicle: "वाहन",
    timing: "डिलीवरी समय",
    date: "डिलीवरी तारीख",
    time: "डिलीवरी समय",
    notes: "नोट्स",
    save: "सेव करके व्हाट्सऐप भेजें",
    whatsappOnly: "सिर्फ व्हाट्सऐप भेजें",
    contactTitle: "Digit Infra Pvt LTD से बात करें।",
    saved: "क्वेरी सेव हो गई। कन्फर्मेशन के लिए व्हाट्सऐप खुल रहा है।",
  },
};

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizePhoneNumber(value) {
  return String(value || "").replace(/\D/g, "") || fallbackPhoneNumber;
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
  if (!Array.isArray(row.rates.vehicles)) return defaultPricing;

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

function vehicleLabel(vehicle) {
  return vehicle.name;
}

function WhatsAppIcon() {
  return (
    <svg className="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M16 3.4c-6.9 0-12.5 5.6-12.5 12.4 0 2.3.6 4.4 1.7 6.2L3.9 28.6l6.8-1.8c1.7.9 3.5 1.4 5.4 1.4 6.9 0 12.5-5.6 12.5-12.4S22.9 3.4 16 3.4Z"
        fill="#25d366"
      />
      <path
        d="M22.9 19.3c-.4 1.1-2 2.1-2.8 2.2-.8.1-1.8.2-4.9-1.1-4.1-1.8-6.7-5.9-6.9-6.2-.2-.3-1.6-2.1-1.6-4 0-1.9 1-2.8 1.4-3.2.3-.4.8-.5 1.1-.5h.8c.3 0 .6 0 .9.7.3.8 1.1 2.7 1.2 2.9.1.2.1.5 0 .8-.1.3-.2.5-.4.7-.2.2-.4.5-.6.7-.2.2-.4.5-.2.9.2.4.9 1.5 1.9 2.4 1.3 1.2 2.4 1.6 2.8 1.8.4.2.7.1.9-.1.3-.3 1-1.2 1.3-1.6.3-.4.6-.3.9-.2.4.1 2.4 1.1 2.8 1.3.4.2.7.3.8.5.1.1.1.9-.3 2Z"
        fill="#fff"
      />
    </svg>
  );
}

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [quote, setQuote] = useState(emptyQuote);
  const [pricing, setPricing] = useState(defaultPricing);
  const [contactPhone, setContactPhone] = useState(fallbackPhoneNumber);
  const [quoteStatus, setQuoteStatus] = useState("");
  const t = copy[language];
  const phoneNumber = normalizePhoneNumber(contactPhone);
  const displayPhone = formatPhoneNumber(phoneNumber);

  const selectedVehicle = pricing.vehicles.find((vehicle) => vehicle.id === quote.vehicleId) || pricing.vehicles[0];
  const selectedRate = Number(selectedVehicle?.price || 0);
  const total = Math.round(selectedRate * Number(quote.quantity || 1) + (quote.delivery === "Same day" ? 350 : 0));

  const tickerItems = useMemo(
    () =>
      pricing.vehicles.map((vehicle) => ({
        key: vehicle.id,
        label: vehicleLabel(vehicle),
        value: currency(vehicle.price),
      })),
    [pricing.vehicles],
  );

  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi-IN" : "en-IN";
  }, [language]);

  useEffect(() => {
    async function loadPageData() {
      if (!isSupabaseConfigured) return;

      const [pricingResult, phoneResult] = await Promise.all([
        supabase.from("pricing").select("*").order("price_date", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("site_settings").select("value").eq("key", "contact_phone").maybeSingle(),
      ]);

      if (!pricingResult.error && pricingResult.data) {
        const nextPricing = normalizePricing(pricingResult.data);
        setPricing(nextPricing);
        setQuote((current) => ({
          ...current,
          vehicleId: nextPricing.vehicles[0]?.id || current.vehicleId,
        }));
      }

      if (!phoneResult.error && phoneResult.data?.value) {
        setContactPhone(normalizePhoneNumber(phoneResult.data.value));
      }
    }

    loadPageData();
  }, []);

  function updateQuote(field, value) {
    setQuote((current) => ({
      ...current,
      [field]: value,
      ...(field === "delivery" && value !== "Scheduled" ? { scheduleDate: "", scheduleTime: "" } : {}),
    }));
  }

  function currentLead() {
    return {
      ...quote,
      quantity: Math.max(Number(quote.quantity) || 1, 1),
      vehicleName: selectedVehicle ? vehicleLabel(selectedVehicle) : "Vehicle",
      rate: selectedRate,
      priceDate: pricing.priceDate,
      total,
    };
  }

  function leadMessage(lead) {
    return [
      "New sand requirement",
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Address: ${lead.address}`,
      `Material: ${lead.sandType}`,
      `Vehicle: ${lead.vehicleName}`,
      `Quantity: ${lead.quantity}`,
      `Rate date: ${lead.priceDate}`,
      `Rate: ${currency(lead.rate)}`,
      `Timing: ${lead.delivery}`,
      lead.scheduleDate ? `Scheduled date: ${lead.scheduleDate}` : "",
      lead.scheduleTime ? `Scheduled time: ${lead.scheduleTime}` : "",
      `Estimate: ${currency(lead.total)}`,
      lead.notes ? `Notes: ${lead.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function openWhatsApp(lead) {
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(leadMessage(lead))}`, "_blank", "noopener,noreferrer");
  }

  async function saveQuote(event) {
    event.preventDefault();
    const lead = currentLead();

    try {
      const response = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Could not save enquiry.");
      }

      setQuoteStatus(t.saved);
    } catch (error) {
      setQuoteStatus(`${error.message} Opening WhatsApp instead.`);
    }

    openWhatsApp(lead);
    setQuote({ ...emptyQuote, vehicleId: pricing.vehicles[0]?.id || "" });
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Sand At Your Door home">
          <span className="brand-mark">SA</span>
          <span>
            <strong>Sand At Your Door</strong>
            <small>Digit Infra Pvt LTD</small>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#products">{t.products}</a>
          <a href="#calculator">{t.quote}</a>
          <a href="#contact">{t.contact}</a>
        </nav>
        <div className="language-toggle" role="group" aria-label="Language selector">
          <button className={language === "en" ? "active" : ""} type="button" onClick={() => setLanguage("en")}>
            English
          </button>
          <button className={language === "hi" ? "active" : ""} type="button" onClick={() => setLanguage("hi")}>
            हिंदी
          </button>
        </div>
        <a className="header-call" href={`tel:+${phoneNumber}`}>
          {displayPhone}
        </a>
      </header>

      <section className="ticker" aria-label="Today vehicle price banner">
        <div className="ticker-badge">
          <span className="live-dot" aria-hidden="true" />
          <strong>
            {t.rates} · {pricing.priceDate}
          </strong>
        </div>
        <div className="ticker-track">
          <span>
            {tickerItems.map((item) => (
              <em key={item.key}>
                {item.label} <b>{item.value}</b>
              </em>
            ))}
          </span>
          <span aria-hidden="true">
            {tickerItems.map((item) => (
              <em key={item.key}>
                {item.label} <b>{item.value}</b>
              </em>
            ))}
          </span>
        </div>
      </section>

      <main id="home">
        <section className="hero">
          <div className="hero-media" role="img" aria-label="Sand delivery truck at a construction site" />
          <div className="hero-content">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p>{t.lead}</p>
            <div className="hero-actions">
              <a className="button primary" href="#calculator">
                {t.estimateCta}
              </a>
              <a className="button secondary" href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noreferrer">
                <WhatsAppIcon />
                {t.whatsappCta}
              </a>
            </div>
          </div>
        </section>

        <div className="mobile-cta" aria-label="Quick contact actions">
          <a href={`tel:+${phoneNumber}`}>Call</a>
          <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>

        <section id="products" className="section">
          <div className="section-heading">
            <p className="eyebrow">{t.productsEyebrow}</p>
            <h2>{t.productsTitle}</h2>
          </div>
          <div className="product-grid">
            <ProductCard
              image="https://static.wixstatic.com/media/089437_1ebc91aae6414e9cabca7ae1722c8ae2~mv2.jpg/v1/fill/w_900,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG-20230116-WA0004.jpg"
              title={t.residential}
              text={t.residentialText}
              tag={`From ${currency(pricing.vehicles[0]?.price || 0)}`}
            />
            <ProductCard
              image="https://static.wixstatic.com/media/089437_2541a4bf378c4963b1c0afe9b979a272~mv2.jpg/v1/fill/w_900,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/josh-withers--c4MV3rKm9c-unsplash.jpg"
              title={t.commercial}
              text={t.commercialText}
              tag="Bulk rates available"
            />
            <ProductCard
              image="https://static.wixstatic.com/media/089437_ca446ad21105402f83d7c0fa48a8081c~mv2.jpg/v1/fill/w_900,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/jandira-sonnendeck-0DUxxHkRucs-unsplash.jpg"
              title={t.construction}
              text={t.constructionText}
              tag="Contract pricing"
            />
          </div>
        </section>

        <section id="calculator" className="section quote-section">
          <div className="quote-copy">
            <p className="eyebrow">{t.fastQuote}</p>
            <h2>{t.quoteTitle}</h2>
            <p>{t.quoteText}</p>
          </div>

          <form className="quote-form" onSubmit={saveQuote}>
            <div className="field-pair">
              <label>
                {t.customerName}
                <input value={quote.name} onChange={(event) => updateQuote("name", event.target.value)} required />
              </label>
              <label>
                {t.mobile}
                <input value={quote.phone} onChange={(event) => updateQuote("phone", event.target.value)} type="tel" required />
              </label>
            </div>
            <label>
              {t.address}
              <textarea value={quote.address} onChange={(event) => updateQuote("address", event.target.value)} rows="3" required />
            </label>
            <div className="field-pair">
              <label>
                {t.sandType}
                <select value={quote.sandType} onChange={(event) => updateQuote("sandType", event.target.value)}>
                  <option value="Residential Sand">Residential Sand</option>
                  <option value="Commercial Sand">Commercial Sand</option>
                  <option value="Construction Sand">Construction Sand</option>
                </select>
              </label>
              <label>
                {t.quantity}
                <input
                  value={quote.quantity}
                  onChange={(event) => updateQuote("quantity", event.target.value)}
                  type="number"
                  min="1"
                  max="100"
                  required
                />
              </label>
            </div>
            <div className="field-pair">
              <label>
                {t.vehicle}
                <select value={quote.vehicleId} onChange={(event) => updateQuote("vehicleId", event.target.value)}>
                  {pricing.vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicleLabel(vehicle)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t.timing}
                <select value={quote.delivery} onChange={(event) => updateQuote("delivery", event.target.value)}>
                  <option value="Same day">Same day</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </label>
            </div>
            {quote.delivery === "Scheduled" ? (
              <div className="field-pair schedule-fields">
                <label>
                  {t.date}
                  <input
                    value={quote.scheduleDate}
                    onChange={(event) => updateQuote("scheduleDate", event.target.value)}
                    type="date"
                    required
                  />
                </label>
                <label>
                  {t.time}
                  <input
                    value={quote.scheduleTime}
                    onChange={(event) => updateQuote("scheduleTime", event.target.value)}
                    type="time"
                    required
                  />
                </label>
              </div>
            ) : null}
            <label>
              {t.notes}
              <textarea value={quote.notes} onChange={(event) => updateQuote("notes", event.target.value)} rows="2" />
            </label>
            <output className="estimate">
              Estimated total: {currency(total)} ({currency(selectedRate)} per {selectedVehicle?.name || "vehicle"})
            </output>
            <div className="form-actions">
              <button className="button primary" type="submit">
                {t.save}
              </button>
              <button className="button secondary" type="button" onClick={() => openWhatsApp(currentLead())}>
                <WhatsAppIcon />
                {t.whatsappOnly}
              </button>
            </div>
            <p className="status-text" role="status">
              {quoteStatus}
            </p>
          </form>
        </section>

        <section id="contact" className="section contact-section">
          <div>
            <p className="eyebrow">{t.contact}</p>
            <h2>{t.contactTitle}</h2>
            <p>Patna Bihar, 800020</p>
          </div>
          <div className="contact-cards">
            <a href={`tel:+${phoneNumber}`}>
              <strong>Phone</strong>
              <span>{displayPhone}</span>
            </a>
            <a href="mailto:digitInfra@gmail.com">
              <strong>Email</strong>
              <span>digitInfra@gmail.com</span>
            </a>
            <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noreferrer">
              <strong>
                <WhatsAppIcon />
                WhatsApp
              </strong>
              <span>Send your requirement</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Copyright {new Date().getFullYear()} Digit Infra Pvt LTD. Sand At Your Door.</p>
        <a href="#home">Back to top</a>
      </footer>
    </>
  );
}

function ProductCard({ image, title, text, tag }) {
  return (
    <article className="product-card">
      <Image src={image} alt={title} width={900} height={600} sizes="(max-width: 980px) 50vw, 33vw" />
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        <span>{tag}</span>
      </div>
    </article>
  );
}
