"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

import { DEFAULT_SAME_DAY_SURCHARGE, getSameDaySurcharge } from "../lib/deliveryPricing";

import { initAnalytics, trackQuoteEvent } from "../lib/analytics";
import { createQuoteJourney } from "../lib/quoteAnalytics";

const fallbackPhoneNumber = "917259987874";
const fallbackEmail = "digitInfra@gmail.com";

function getPatnaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

function formatRateDate(date, language) {
  if (!date) return "";
  return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T12:00:00+05:30`));
}

const defaultVehicles = [
  { id: "tractor", name: "Tractor load", wheels: 2, price: 4200 },
  { id: "truck6", name: "6-wheel truck", wheels: 6, price: 12500 },
  { id: "truck10", name: "10-wheel truck", wheels: 10, price: 18500 },
  { id: "truck12", name: "12-wheel truck", wheels: 12, price: 22500 },
  { id: "truck16", name: "16-wheel truck", wheels: 16, price: 29500 },
];

const defaultPricing = {
  priceDate: null,
  vehicles: defaultVehicles,
};

const emptyQuote = {
  name: "",
  phone: "",
  address: "",
  sandType: "",
  quantity: 0,
  vehicleId: "",
  delivery: "Same day",
  scheduleDate: "",
  notes: "",
};

const copy = {
  en: {
    requirement: "Your requirement", deliveryDetails: "Delivery details", contactDetails: "Contact details", loads: "Number of loads", capacity: "Load capacity: confirm with our team", choose: "Select application", selected: "Selected", estimate: "Your estimate", subtotal: "Load subtotal", surcharge: "Same-day surcharge", estimatedTotal: "Estimated total", priceNote: "Final price depends on delivery location, site access and unloading. Capacity and delivery availability will be confirmed by our team.", todayLabel: "Today's Rate", examples: "Example rates · Contact us to confirm", sameDay: "Same day", tomorrow: "Tomorrow", scheduled: "Choose a date", optional: "optional", call: "Call", email: "Email", sendDetails: "Send details on WhatsApp", savedTitle: "Your enquiry is saved", reference: "Enquiry reference", nextSteps: "Our team will contact you to confirm pricing and delivery. You can also send these details on WhatsApp.", errorName: "Enter your name.", errorPhone: "Enter a valid Indian mobile number.", errorAddress: "Enter your delivery address.", errorQuantity: "Choose between 1 and 100 whole loads.", errorDate: "Choose today or a future date.", errorTime: "Choose a delivery time.", errorVehicle: "Select a vehicle.", saveError: "We couldn’t save your enquiry. Your details are still here. Please retry or contact us on WhatsApp.", namePlaceholder: "Your full name", phonePlaceholder: "10-digit mobile number", addressPlaceholder: "Site address, locality, PIN code and nearby landmark", notesPlaceholder: "Site access, unloading needs or sand specifications", coverage: "Delivery in Patna", coverageText: "Share your site location so our team can confirm delivery coverage and access.", business: "Digit Infra Pvt LTD", businessText: "Patna, Bihar · 800020", availability: "Confirm delivery availability", availabilityText: "Call or WhatsApp for operating hours and available delivery slots.", illustration: "Illustrative construction images", back: "Back to top", perLoad: "per load", saving: "Sending…", startAgain: "Request another quote",
    errorApplication: "Select a sand application.",
    products: "Applications",
    quote: "Quote",
    contact: "Contact",
    rates: "Vehicle rates",
    pricePending: "Our team will confirm your vehicle and price.",
    ratesLoading: "Loading vehicle rates…",
    ratesUnavailable: "Vehicle rates unavailable · Contact us for a quote",
    eyebrow: "Same day sand delivery in Patna",
    title: "Sand delivered to your site in Patna.",
    savingsTitle: "Guaranteed savings. Lower than market price.",
    savingsNote: "Compare equivalent sand quality and quantity delivered to the same address. Share your local quote with our team to confirm your savings and final delivered price.",
    lead:
      "Order construction sand without hidden charges. Get clear pricing, scheduled delivery, and a fast callback from the Digit Infra team.",
    estimateCta: "Get a quote",
    whatsappCta: "WhatsApp now",
    productsEyebrow: "Sand for every project",
    productsTitle: "Tell us why you need sand.",
    plaster: "Plaster",
    plasterText: "Sand requirements for walls and ceilings.",
    rcc: "RCC (General)",
    rccText: "Share the sand specifications for your concrete work.",
    terrace: "Terrace Slab",
    terraceText: "Plan the quantity and timing for your roof slab pour.",
    raft: "Raft Foundation",
    raftText: "Coordinate sand supply for your foundation pour.",
    fastQuote: "Fast quote",
    quoteTitle: "Get an estimate for your delivery.",
    quoteText:
      "This calculator gives an indicative price. Final pricing is confirmed after location, access, quantity, and unloading requirements are checked.",
    customerName: "Customer name",
    mobile: "Mobile number",
    address: "Delivery address",
    sandType: "Sand application",
    quantity: "Quantity",
    vehicle: "Vehicle",
    timing: "Delivery timing",
    date: "Delivery date",
    time: "Delivery time",
    notes: "Notes",
    save: "Request a quote",
    whatsappOnly: "Send on WhatsApp only",
    contactTitle: "Talk to Digit Infra Pvt LTD.",
    saved: "Enquiry saved. Opening WhatsApp for quick confirmation.",
  },
  hi: {
    requirement: "आपकी जरूरत", deliveryDetails: "डिलीवरी की जानकारी", contactDetails: "संपर्क की जानकारी", loads: "लोड की संख्या", capacity: "लोड क्षमता: टीम से पुष्टि करें", choose: "उपयोग चुनें", selected: "चुना गया", estimate: "आपका अनुमान", subtotal: "लोड की कीमत", surcharge: "उसी दिन डिलीवरी शुल्क", estimatedTotal: "अनुमानित कुल", priceNote: "अंतिम रेट लोकेशन, साइट के रास्ते और अनलोडिंग पर निर्भर है। हमारी टीम क्षमता और डिलीवरी की उपलब्धता की पुष्टि करेगी।", todayLabel: "आज का रेट", examples: "उदाहरण रेट · पुष्टि के लिए संपर्क करें", sameDay: "उसी दिन", tomorrow: "कल", scheduled: "तारीख चुनें", optional: "वैकल्पिक", call: "कॉल करें", email: "ईमेल", sendDetails: "जानकारी व्हाट्सऐप पर भेजें", savedTitle: "आपका अनुरोध सेव हो गया", reference: "अनुरोध संदर्भ", nextSteps: "हमारी टीम रेट और डिलीवरी की पुष्टि के लिए संपर्क करेगी। आप यह जानकारी व्हाट्सऐप पर भी भेज सकते हैं।", errorName: "अपना नाम लिखें।", errorPhone: "सही भारतीय मोबाइल नंबर लिखें।", errorAddress: "डिलीवरी का पता लिखें।", errorQuantity: "1 से 100 तक पूरे लोड चुनें।", errorDate: "आज या आगे की तारीख चुनें।", errorTime: "डिलीवरी का समय चुनें।", errorVehicle: "वाहन चुनें।", saveError: "अनुरोध सेव नहीं हुआ। आपकी जानकारी सुरक्षित है। फिर कोशिश करें या व्हाट्सऐप पर संपर्क करें।", namePlaceholder: "आपका पूरा नाम", phonePlaceholder: "10 अंकों का मोबाइल नंबर", addressPlaceholder: "साइट का पता, इलाका, पिन कोड और पास की पहचान", notesPlaceholder: "साइट का रास्ता, अनलोडिंग या बालू की आवश्यकताएं", coverage: "पटना में डिलीवरी", coverageText: "डिलीवरी क्षेत्र और रास्ते की पुष्टि के लिए साइट की लोकेशन बताएं।", business: "Digit Infra Pvt LTD", businessText: "पटना, बिहार · 800020", availability: "डिलीवरी की उपलब्धता पूछें", availabilityText: "काम के समय और डिलीवरी स्लॉट के लिए कॉल या व्हाट्सऐप करें।", illustration: "निर्माण के उदाहरणात्मक चित्र", back: "ऊपर जाएं", perLoad: "प्रति लोड", saving: "भेजा जा रहा है…", startAgain: "नया अनुरोध भेजें",
    errorApplication: "बालू का उपयोग चुनें।",
    products: "उपयोग",
    quote: "भाव",
    contact: "संपर्क",
    rates: "वाहनों के रेट",
    pricePending: "हमारी टीम वाहन और कीमत की पुष्टि करेगी।",
    ratesLoading: "वाहनों के रेट लोड हो रहे हैं…",
    ratesUnavailable: "वाहनों के रेट उपलब्ध नहीं हैं · भाव के लिए संपर्क करें",
    eyebrow: "पटना में उसी दिन बालू डिलीवरी",
    title: "पटना में आपकी साइट तक बालू डिलीवरी।",
    savingsTitle: "बचत की गारंटी। बाजार से कम कीमत।",
    savingsNote: "एक ही पते पर डिलीवरी के लिए समान गुणवत्ता और मात्रा वाले बालू की कीमत से तुलना करें। बचत और अंतिम डिलीवरी कीमत की पुष्टि के लिए अपना स्थानीय भाव हमारी टीम को भेजें।",
    lead: "बिना छिपे शुल्क के बालू ऑर्डर करें। साफ रेट, तय समय पर डिलीवरी और Digit Infra टीम से तेज कॉलबैक।",
    estimateCta: "भाव मांगें",
    whatsappCta: "व्हाट्सऐप करें",
    productsEyebrow: "हर काम के लिए बालू",
    productsTitle: "बताएं, आपको बालू किस काम के लिए चाहिए।",
    plaster: "प्लास्टर",
    plasterText: "दीवार या छत के प्लास्टर का काम बताएं, ताकि बालू की जरूरत की पुष्टि की जा सके।",
    rcc: "आरसीसी (सामान्य)",
    rccText: "आरसीसी काम के लिए साइट की जरूरत और तय बालू ग्रेड हमारी टीम को बताएं।",
    terrace: "छत की स्लैब",
    terraceText: "छत की ढलाई के लिए मात्रा और डिलीवरी का समय बताएं।",
    raft: "राफ्ट फाउंडेशन",
    raftText: "नींव के काम के लिए साइट टीम की बताई मात्रा और आवश्यकताओं के अनुसार सप्लाई तय करें।",
    fastQuote: "तेज भाव",
    quoteTitle: "अपनी डिलीवरी का अनुमानित भाव देखें।",
    quoteText: "यह केवल अनुमानित भाव है। फाइनल रेट लोकेशन, रास्ता, मात्रा और अनलोडिंग देखकर कन्फर्म होगा।",
    customerName: "ग्राहक का नाम",
    mobile: "मोबाइल नंबर",
    address: "डिलीवरी पता",
    sandType: "बालू का उपयोग",
    quantity: "लोड की संख्या (वैकल्पिक)",
    vehicle: "वाहन",
    timing: "डिलीवरी समय",
    date: "डिलीवरी तारीख",
    time: "डिलीवरी समय",
    notes: "नोट्स",
    save: "भाव का अनुरोध भेजें",
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
  const [today, setToday] = useState(() => getPatnaDate());
  const [quote, setQuote] = useState(emptyQuote);
  const [pricing, setPricing] = useState(defaultPricing);
  const [pricingStatus, setPricingStatus] = useState("loading");
  const [sameDaySurcharge, setSameDaySurcharge] = useState(DEFAULT_SAME_DAY_SURCHARGE);
  const [contactPhone, setContactPhone] = useState(fallbackPhoneNumber);
  const [contactEmail, setContactEmail] = useState(fallbackEmail);
  const [quoteStatus, setQuoteStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedLead, setSavedLead] = useState(null);
  const [errors, setErrors] = useState({});
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const journeyRef = useRef(null);
  const formVisible = useRef(false);
  const pageTracked = useRef(false);
  const analyticsContext = useRef({});
  const t = copy[language];
  const pricingDateSummary = pricing.priceDate
    ? `${t.todayLabel}: ${formatRateDate(today, language)}`
    : t.examples;
  const phoneNumber = normalizePhoneNumber(contactPhone);
  const displayPhone = formatPhoneNumber(phoneNumber);

  const selectedVehicle = pricing.vehicles.find((vehicle) => vehicle.id === quote.vehicleId);
  const selectedRate = Number(selectedVehicle?.price || 0);
  const total = selectedVehicle ? Math.round(selectedRate * Number(quote.quantity || 0) + (quote.delivery === "Same day" ? sameDaySurcharge : 0)) : null;

  const applications = [{ value: "Plaster", key: "plaster" }, { value: "RCC (General)", key: "rcc" }, { value: "Terrace Slab", key: "terrace" }, { value: "Raft Foundation", key: "raft" }];
  useEffect(() => {
    const timer = window.setInterval(() => setToday(getPatnaDate()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  function quoteProperties(current = quote) {
    return { language, application: current.sandType,
      vehicle_type: ["tractor", "truck6", "truck10", "truck12", "truck16"].includes(current.vehicleId) ? current.vehicleId : current.vehicleId ? "custom" : "unavailable",
      delivery_type: current.delivery };
  }
  analyticsContext.current = quoteProperties();
  function journey() {
    if (!journeyRef.current) journeyRef.current = createQuoteJourney(trackQuoteEvent, crypto.randomUUID());
    return journeyRef.current;
  }
  function startJourney(source = "form", current = quote) {
    const active = journey();
    if (formVisible.current) active.viewed(quoteProperties(current));
    active.start(quoteProperties(current), source);
    return active;
  }
  function newJourney() {
    journeyRef.current = createQuoteJourney(trackQuoteEvent, crypto.randomUUID());
    if (formVisible.current) journeyRef.current.viewed(quoteProperties());
    setSavedLead(null);
  }
  useEffect(() => {
    void initAnalytics();
    if (!pageTracked.current) {
      pageTracked.current = true;
      trackQuoteEvent("page_viewed", { language: analyticsContext.current.language });
    }
    const section = document.getElementById("calculator");
    if (!section || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(([entry]) => {
      formVisible.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        if (!journeyRef.current) journeyRef.current = createQuoteJourney(trackQuoteEvent, crypto.randomUUID());
        journeyRef.current.viewed(analyticsContext.current);
      }
    }, { threshold: 0 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    journeyRef.current?.stages(quote, pricing.vehicles.map((vehicle) => vehicle.id), today, analyticsContext.current);
  }, [quote, pricing, language, today]);
  function displayVehicle(vehicle) {
    if (language === "en") return vehicle.name;
    if (vehicle.id === "tractor") return "ट्रैक्टर लोड";
    if (/^truck/.test(vehicle.id) && vehicle.wheels) return `${vehicle.wheels} पहियों वाला ट्रक`;
    return vehicle.name;
  }
  useEffect(() => {
    try { if (localStorage.getItem("sand-language") === "hi") setLanguage("hi"); } catch {}
    const viewport = window.visualViewport;
    const resize = () => setKeyboardOpen(viewport ? viewport.height < window.innerHeight * 0.75 : false);
    viewport?.addEventListener("resize", resize);
    return () => viewport?.removeEventListener("resize", resize);
  }, []);
  function changeLanguage(value) {
    setLanguage(value);
    try { localStorage.setItem("sand-language", value); } catch {}
  }
  function validate(action = "quote") {
    const next = {};
    if (!quote.name.trim()) next.name = t.errorName;
    if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(quote.phone.replace(/[ ()-]/g, ""))) next.phone = t.errorPhone;
    if (!quote.address.trim()) next.address = t.errorAddress;
    if ((selectedVehicle || Number(quote.quantity) > 0) && (!Number.isInteger(Number(quote.quantity)) || Number(quote.quantity) < 1 || Number(quote.quantity) > 100)) next.quantity = t.errorQuantity;
    if (quote.delivery === "Scheduled" && quote.scheduleDate) {
      if (!quote.scheduleDate || quote.scheduleDate < today) next.scheduleDate = t.errorDate;
    }
    setErrors(next);
    if (Object.keys(next).length && action === "quote") journey().event("quote_validation_failed", { ...quoteProperties(), invalid_fields: Object.keys(next) });
    if (Object.keys(next).length) requestAnimationFrame(() => document.getElementById(`quote-${Object.keys(next)[0]}`)?.focus());
    return !Object.keys(next).length;
  }
  function fieldError(name) { return errors[name] ? <span className="field-error" id={`error-${name}`}>{errors[name]}</span> : null; }
  function fieldProps(name) { return { onFocus: () => startJourney().fieldStarted(name, quoteProperties()), id: `quote-${name}`, "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `error-${name}` : undefined }; }
  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi-IN" : "en-IN";
  }, [language]);

  useEffect(() => {
    async function loadPageData() {
      if (!isSupabaseConfigured) {
        setPricingStatus("unavailable");
        return;
      }

      const [pricingResponse, phoneResponse] = await Promise.allSettled([
        supabase.from("pricing").select("*").lte("price_date", new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())).order("price_date", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("site_settings").select("key, value").in("key", ["contact_phone", "contact_email", "same_day_surcharge"]),
      ]);

      const pricingResult = pricingResponse.status === "fulfilled" ? pricingResponse.value : null;
      const phoneResult = phoneResponse.status === "fulfilled" ? phoneResponse.value : null;
      if (pricingResult && !pricingResult.error && pricingResult.data) {
        const nextPricing = normalizePricing(pricingResult.data);
        const validRates = nextPricing.priceDate && nextPricing.vehicles.length > 0
          && nextPricing.vehicles.every((vehicle) => Number.isFinite(vehicle.price) && vehicle.price > 0);
        setPricingStatus(validRates ? "ready" : "unavailable");
        if (validRates) setPricing(nextPricing);
        setQuote((current) => ({
          ...current,
          vehicleId: current.vehicleId,
        }));
      }

      if (!pricingResult || pricingResult.error || !pricingResult.data) setPricingStatus("unavailable");

      if (phoneResult && !phoneResult.error && Array.isArray(phoneResult.data)) {
        const settings = Object.fromEntries(phoneResult.data.map((row) => [row.key, row.value]));
        setSameDaySurcharge(getSameDaySurcharge(settings.same_day_surcharge));
        if (settings.contact_phone) setContactPhone(normalizePhoneNumber(settings.contact_phone));
        if (settings.contact_email) setContactEmail(String(settings.contact_email));
      }
    }

    loadPageData();
  }, []);

  function updateQuote(field, value, source = "form") {
    if (journeyRef.current?.completed) newJourney();
    startJourney(source, { ...quote, [field]: value }).fieldStarted(field, quoteProperties({ ...quote, [field]: value }));
    setSavedLead(null);
    setErrors((current) => ({ ...current, [field]: undefined }));
    setQuote((current) => ({
      ...current,
      [field]: value,
      ...(field === "delivery" && value !== "Scheduled" ? { scheduleDate: "" } : {}),
    }));
  }

  function currentLead() {
    return {
      ...quote,
      quantity: Math.max(Number(quote.quantity) || 0, 0),
      vehicleName: selectedVehicle ? vehicleLabel(selectedVehicle) : "Vehicle",
      rate: selectedRate,
      priceDate: pricing.priceDate,
      total,
    };
  }

  function leadMessage(lead) {
    const details = [
      `${t.customerName}: ${lead.name}`,
      `${t.mobile}: ${lead.phone}`,
      `${t.address}: ${lead.address}`,
      lead.sandType ? `${t.sandType}: ${t[applications.find((item) => item.value === lead.sandType)?.key] || lead.sandType}` : "",
      lead.vehicleId ? `${t.vehicle}: ${lead.vehicleName}` : "",
      lead.quantity ? `${t.loads}: ${lead.quantity}` : "",
      lead.delivery ? `${t.timing}: ${t[lead.delivery === "Same day" ? "sameDay" : lead.delivery === "Tomorrow" ? "tomorrow" : "scheduled"]}` : "",
      lead.scheduleDate ? `${t.date}: ${lead.scheduleDate}` : "",
      lead.vehicleId ? `${t.rates}: ${currency(lead.rate)}` : "",
      lead.total != null && lead.vehicleId ? `${t.estimatedTotal}: ${currency(lead.total)}` : "",
      lead.notes ? `${t.notes}: ${lead.notes}` : "",
    ].filter(Boolean).join("\n");
    const introduction = lead.reference
      ? `I just submitted Enquiry #${lead.reference} with the following details:`
      : "I would like a quote. Here are my details:";
    return `Hi Digit Infra,\n\n${introduction}\n\n${details}\n\nPlease confirm the final delivered price.`;
  }

  function openWhatsApp(lead, location = "quote_form") {
    journey().event("whatsapp_clicked", { ...quoteProperties(lead), whatsapp_location: location });
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(leadMessage(lead))}`, "_blank", "noopener,noreferrer");
  }

  async function saveQuote(event) {
    event.preventDefault();
    if (saving) return;
    const activeJourney = startJourney();
    activeJourney.event("quote_submit_attempted", quoteProperties());
    if (!validate()) return;
    activeJourney.stages(quote, pricing.vehicles.map((vehicle) => vehicle.id), today, quoteProperties());
    setQuoteStatus("");
    setSaving(true);
    setSavedLead(null);
    const lead = currentLead();

    let failureType = "network";
    try {
      const response = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      failureType = "server";
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Could not save enquiry.");
      }

      const result = await response.json();
      if (!result.success || !result.id) throw new Error("Invalid save response");
      activeJourney.saved(quoteProperties(lead));
      setSavedLead({ ...lead, ...result });
      setQuoteStatus("");
      requestAnimationFrame(() => document.getElementById("quote-success")?.focus());
      setQuote({ ...emptyQuote });
    } catch (error) {
      activeJourney.event("quote_save_failed", { ...quoteProperties(lead), failure_type: failureType });
      setQuoteStatus(t.saveError);
    } finally {
      setSaving(false);
    }
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
          <button className={language === "en" ? "active" : ""} type="button" aria-pressed={language === "en"} onClick={() => changeLanguage("en")}>
            English
          </button>
          <button className={language === "hi" ? "active" : ""} type="button" aria-pressed={language === "hi"} onClick={() => changeLanguage("hi")}>
            हिंदी
          </button>
        </div>
        <a className="header-call" href={`tel:+${phoneNumber}`} onClick={() => trackQuoteEvent("phone_clicked", { language, phone_location: "header" })}>
          {displayPhone}
        </a>
      </header>

      <section className="ticker" aria-label={t.rates} aria-busy={pricingStatus === "loading"}>
        <div className="ticker-badge">{pricingStatus === "ready" && <span className="rates-indicator" aria-hidden="true" />}<strong role="status">{pricingStatus === "loading" ? t.ratesLoading : pricingStatus === "unavailable" ? t.ratesUnavailable : pricingDateSummary}</strong></div>
        {pricingStatus === "ready" && <div className="ticker-track">{[0, 1].map((repeat) => <span key={repeat} aria-hidden={repeat === 1 ? true : undefined}>{pricing.vehicles.map((vehicle) => <em key={vehicle.id}>{displayVehicle(vehicle)} <b>{currency(vehicle.price)}</b></em>)}</span>)}</div>}
      </section>
      <main id="home">
        <section className="hero">
          <div className="hero-media" role="img" aria-label="Sand delivery truck at a construction site" />
          <div className="hero-content">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p>{t.lead}</p>
            <div className="hero-savings">
              <strong>{t.savingsTitle}</strong>
              <p>{t.savingsNote}</p>
            </div>
            <div className="hero-actions">
              <a className="button primary" href="#calculator">
                {t.estimateCta}
              </a>
            </div>
          </div>
        </section>

        <div className={`mobile-cta ${keyboardOpen ? "keyboard-open" : ""}`} aria-label={t.contact}>
          <a href={`tel:+${phoneNumber}`} onClick={() => trackQuoteEvent("phone_clicked", { language, phone_location: "mobile_bar" })}>{t.call}</a>
          <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noreferrer" onClick={() => trackQuoteEvent("whatsapp_clicked", { language, whatsapp_location: "mobile_bar" })}><WhatsAppIcon /> WhatsApp</a>
          <a href="#calculator">{t.estimateCta}</a>
        </div>
        <section id="products" className="section">
          <div className="section-heading">
            <p className="eyebrow">{t.productsEyebrow}</p>
            <h2>{t.productsTitle}</h2>
          </div>
          <p className="muted">{t.illustration}</p>
          <div className="product-grid">{applications.map(({ value, key }) => <ProductCard key={key} image={`/images/${key}.jpg`} title={t[key]} text={t[`${key}Text`]} selected={quote.sandType === value} action={quote.sandType === value ? t.selected : t.choose} onSelect={() => updateQuote("sandType", value)} />)}</div>
        </section>

        <section id="calculator" className="section quote-section">
          <div className="quote-copy">
            <p className="eyebrow">{t.fastQuote}</p>
            <h2>{t.quoteTitle}</h2>
            <p>{t.quoteText}</p>
          </div>

          <div>
          {savedLead ? <section className="success-panel" data-clarity-mask="true" id="quote-success" tabIndex={-1} aria-labelledby="success-title">
            <span className="success-check" aria-hidden="true">✓</span><h3 id="success-title">{t.savedTitle}</h3><p>{t.nextSteps}</p>
            <small>{t.reference}</small><code>{savedLead.reference}</code><p>{savedLead.priced ? <>{t.estimatedTotal}: <strong>{currency(savedLead.total)}</strong></> : t.pricePending}</p>
            <button className="button primary" onClick={() => openWhatsApp(savedLead, "saved_confirmation")}><WhatsAppIcon />{t.sendDetails}</button>
            <button className="button secondary" onClick={newJourney}>{t.startAgain}</button>
          </section> : <form className="quote-form" onSubmit={saveQuote} noValidate data-clarity-mask="true">
            <fieldset><legend><span>01</span>{t.requirement}</legend>
              <div className="field-pair"><label>{t.sandType} ({t.optional})<select {...fieldProps("sandType")} value={quote.sandType} onChange={(event) => updateQuote("sandType", event.target.value)}><option value="">{t.choose}</option>{applications.map(({ value, key }) => <option key={key} value={value}>{t[key]}</option>)}</select>{fieldError("sandType")}</label>
              <div className="quantity-field">
                <label htmlFor="quote-quantity">{t.loads}</label>
                <div className="quantity-stepper">
                  <button type="button" aria-label={language === "hi" ? "एक लोड कम करें" : "Decrease loads"} disabled={Number(quote.quantity) <= 0} onClick={() => updateQuote("quantity", Math.max(0, (Number(quote.quantity) || 0) - 1))}>−</button>
                  <input {...fieldProps("quantity")} value={quote.quantity} onChange={(event) => updateQuote("quantity", event.target.value)} type="number" inputMode="numeric" min="0" max="100" step="1" aria-describedby={errors.quantity ? "error-quantity quantity-help" : "quantity-help"} />
                  <button type="button" aria-label={language === "hi" ? "एक लोड बढ़ाएं" : "Increase loads"} disabled={Number(quote.quantity) >= 100} onClick={() => updateQuote("quantity", Math.min(100, (Number(quote.quantity) || 0) + 1))}>+</button>
                </div>
                <small className="muted" id="quantity-help">{language === "hi" ? "पता न हो तो 0 छोड़ें या 1–100 लोड लिखें।" : "Leave 0 if unsure, or enter 1–100 loads."}</small>
                {fieldError("quantity")}
              </div></div>
              <fieldset className="vehicle-fieldset"><legend>{t.vehicle} ({t.optional})</legend><div className="vehicle-options">{pricing.vehicles.map((vehicle) => <label className={`vehicle-option ${quote.vehicleId === vehicle.id ? "selected" : ""}`} key={vehicle.id}><input type="radio" name="vehicle" value={vehicle.id} checked={quote.vehicleId === vehicle.id} onChange={() => updateQuote("vehicleId", vehicle.id)} /><span>{displayVehicle(vehicle)}<strong>{currency(vehicle.price)}</strong></span></label>)}</div><small className="muted">{t.capacity}</small>{fieldError("vehicleId")}</fieldset>
            </fieldset>
            <fieldset><legend><span>02</span>{t.deliveryDetails}</legend>
              <label>{t.address}<textarea {...fieldProps("address")} value={quote.address} onChange={(event) => updateQuote("address", event.target.value)} placeholder={t.addressPlaceholder} autoComplete="street-address" maxLength={1000} rows="3" required />{fieldError("address")}</label>
              <label>{t.timing}<select value={quote.delivery} onChange={(event) => updateQuote("delivery", event.target.value)}><option value="Same day">{t.sameDay}</option><option value="Tomorrow">{t.tomorrow}</option><option value="Scheduled">{t.scheduled}</option></select></label>
              {quote.delivery === "Scheduled" && <div><label>{t.date}<input {...fieldProps("scheduleDate")} type="date" min={today} value={quote.scheduleDate} onChange={(event) => updateQuote("scheduleDate", event.target.value)} />{fieldError("scheduleDate")}</label></div>}
              <label>{t.notes} ({t.optional})<textarea value={quote.notes} onChange={(event) => updateQuote("notes", event.target.value)} placeholder={t.notesPlaceholder} maxLength={2000} rows="2" /></label>
            </fieldset>
            <fieldset><legend><span>03</span>{t.contactDetails}</legend><div className="field-pair">
              <label>{t.customerName}<input {...fieldProps("name")} value={quote.name} onChange={(event) => updateQuote("name", event.target.value)} placeholder={t.namePlaceholder} autoComplete="name" maxLength={100} required />{fieldError("name")}</label>
              <label>{t.mobile}<input {...fieldProps("phone")} value={quote.phone} onChange={(event) => updateQuote("phone", event.target.value)} placeholder={t.phonePlaceholder} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} required />{fieldError("phone")}</label>
            </div></fieldset>
            <section className="estimate-summary" aria-labelledby="estimate-title"><h3 id="estimate-title">{t.estimate}</h3><p className="muted">{pricingDateSummary}</p>{selectedVehicle ? <dl><div><dt>{t.subtotal} ({currency(selectedRate)} × {quote.quantity || 0})</dt><dd>{currency(selectedRate * Number(quote.quantity || 0))}</dd></div><div><dt>{t.surcharge}</dt><dd>{currency(quote.delivery === "Same day" ? sameDaySurcharge : 0)}</dd></div><div className="estimate-total"><dt>{t.estimatedTotal}</dt><dd><output>{currency(total)}</output></dd></div></dl> : <p>{t.pricePending}</p>}<p className="muted">{t.priceNote}</p></section>
            <div className="form-actions"><button className="button primary" type="submit" disabled={saving} aria-busy={saving}>{saving ? t.saving : t.save}</button><button className="button secondary" type="button" onClick={() => { startJourney(); if (validate("whatsapp")) openWhatsApp(currentLead()); }}><WhatsAppIcon />{t.whatsappOnly}</button></div>
            {quoteStatus && <p className="field-error" role="alert">{quoteStatus}</p>}
          </form>}
          </div>
        </section>

        <section className="service-details section" aria-label={t.contact}><article><span>01</span><h3>{t.coverage}</h3><p>{t.coverageText}</p></article><article><span>02</span><h3>{t.business}</h3><p>{t.businessText}</p></article><article><span>03</span><h3>{t.availability}</h3><p>{t.availabilityText}</p></article></section>
        <section id="contact" className="section contact-section">
          <div>
            <p className="eyebrow">{t.contact}</p>
            <h2>{t.contactTitle}</h2>
            <p>{t.businessText}</p>
          </div>
          <div className="contact-cards">
            <a href={`tel:+${phoneNumber}`} onClick={() => trackQuoteEvent("phone_clicked", { language, phone_location: "contact_section" })}>
              <strong>{t.call}</strong>
              <span>{displayPhone}</span>
            </a>
            <a href={`mailto:${contactEmail}`}>
              <strong>{t.email}</strong>
              <span>{contactEmail}</span>
            </a>
            <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noreferrer" onClick={() => trackQuoteEvent("whatsapp_clicked", { language, whatsapp_location: "contact_section" })}>
              <strong>
                <WhatsAppIcon />
                WhatsApp
              </strong>
              <span>{t.sendDetails}</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Copyright {new Date().getFullYear()} Digit Infra Pvt LTD. Sand At Your Door.</p>
        <a href="#home">{t.back}</a>
      </footer>
    </>
  );
}

function ProductCard({ image, title, text, selected, action, onSelect }) {
  return (
    <a className={`product-card ${selected ? "selected" : ""}`} href="#calculator" onClick={onSelect} aria-label={`${action}: ${title}`}>
      <Image src={image} alt={title} width={900} height={600} sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw" />
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        <span className="card-action">{action} <span aria-hidden="true">→</span></span>
      </div>
    </a>
  );
}
