const form = document.querySelector("#quoteForm");
const estimate = document.querySelector("#estimate");
const whatsappButton = document.querySelector("#whatsappButton");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminLoginStatus = document.querySelector("#adminLoginStatus");
const adminLogout = document.querySelector("#adminLogout");
const pricingForm = document.querySelector("#pricingForm");
const resetPrices = document.querySelector("#resetPrices");
const priceSummary = document.querySelector("#priceSummary");
const pricingStatus = document.querySelector("#pricingStatus");
const priceTicker = document.querySelector("#priceTicker");
const priceTickerClone = document.querySelector("#priceTickerClone");
const tickerLabel = document.querySelector("#tickerLabel");
const tractorProductRate = document.querySelector("#tractorProductRate");
const scheduleFields = document.querySelector("#scheduleFields");
const year = document.querySelector("#year");

const STORAGE_KEY = "sand-at-your-door-leads";
const PRICING_KEY = "sand-at-your-door-pricing";
const ADMIN_AUTH_KEY = "sand-at-your-door-admin-auth";
const LANGUAGE_KEY = "sand-at-your-door-language";
const phoneNumber = "917259987874";
const adminCredentials = {
  username: "admin",
  password: "admin123",
};

const vehicleLabels = {
  tractor: "Tractor load",
  truck6: "6-wheel truck",
  truck10: "10-wheel truck",
  truck12: "12-wheel truck",
  truck16: "16-wheel truck",
};

const vehicleHindiLabels = {
  tractor: "ट्रैक्टर",
  truck6: "6 पहिया ट्रक",
  truck10: "10 पहिया ट्रक",
  truck12: "12 पहिया ट्रक",
  truck16: "16 पहिया ट्रक",
};

const languageContent = {
  en: {
    navProducts: "Products",
    navQuote: "Quote",
    navContact: "Contact",
    tickerLabel: "Today rates",
    heroEyebrow: "Same day sand delivery in Patna",
    heroTitle: "Reliable sand supply for homes, contractors, and commercial sites.",
    heroLead: "Order construction sand without hidden charges. Get clear pricing, 7-day delivery, and a fast callback from the Digit Infra team.",
    primaryCta: "Get instant estimate",
    whatsappCta: "WhatsApp now",
    statSupport: "phone support",
    statDelivery: "delivery available",
    statPatna: "and bulk outer-city orders",
    callNow: "Call now",
    mobileWhatsapp: "WhatsApp",
    productsEyebrow: "Sand for every project",
    productsTitle: "Choose the right material before ordering.",
    residentialTitle: "Residential Sand",
    residentialText: "For home construction, repairs, flooring base, small masonry jobs, and landscaping work.",
    commercialTitle: "Commercial Supply",
    commercialText: "Reliable scheduled supply for shops, warehouses, offices, site preparation, and maintenance teams.",
    bulkRate: "Bulk rates available",
    constructionTitle: "Construction Sand",
    constructionText: "High-volume delivery for contractors, builders, and civil work requiring dependable transport.",
    contractRate: "Contract pricing",
    quoteEyebrow: "Fast quote",
    quoteTitle: "Estimate your sand order and send it for confirmation.",
    quoteText: "This calculator gives an indicative price. Final pricing is confirmed after location, access, quantity, and unloading requirements are checked.",
    quoteItemOne: "Residential, commercial, and construction use cases",
    quoteItemTwo: "Same day delivery requests supported",
    quoteItemThree: "Every saved enquiry opens WhatsApp for instant team notification",
    nameLabel: "Customer name",
    phoneLabel: "Mobile number",
    addressLabel: "Delivery address",
    sandTypeLabel: "Sand type",
    quantityLabel: "Quantity",
    unitLabel: "Vehicle",
    timingLabel: "Delivery timing",
    scheduleDateLabel: "Delivery date",
    scheduleTimeLabel: "Delivery time",
    notesLabel: "Notes",
    saveNotify: "Save and notify WhatsApp",
    sendWhatsapp: "Send on WhatsApp",
    contactEyebrow: "Contact",
    contactTitle: "Talk to Digit Infra Pvt LTD.",
    contactHelp: "Patna Bihar, 800020",
    phoneCard: "Phone",
    phoneValue: "Phone: +91 72599 87874",
    emailCard: "Email",
    emailValue: "Email: digitInfra@gmail.com",
    whatsappCard: "WhatsApp",
    whatsappValue: "Send your requirement",
    backTop: "Back to top",
  },
  hi: {
    navProducts: "उत्पाद",
    navQuote: "भाव",
    navContact: "संपर्क",
    tickerLabel: "आज का रेट",
    heroEyebrow: "पटना में उसी दिन बालू डिलीवरी",
    heroTitle: "घर, ठेकेदार और कमर्शियल साइट के लिए भरोसेमंद बालू सप्लाई।",
    heroLead: "बिना छिपे शुल्क के बालू ऑर्डर करें। साफ रेट, 7 दिन डिलीवरी और Digit Infra टीम से तेज कॉलबैक।",
    primaryCta: "तुरंत भाव देखें",
    whatsappCta: "व्हाट्सऐप करें",
    statSupport: "फोन सहायता",
    statDelivery: "डिलीवरी उपलब्ध",
    statPatna: "शहर के बाहर बल्क ऑर्डर",
    callNow: "कॉल करें",
    mobileWhatsapp: "व्हाट्सऐप",
    productsEyebrow: "हर काम के लिए बालू",
    productsTitle: "ऑर्डर से पहले सही बालू और वाहन चुनें।",
    residentialTitle: "घरेलू बालू",
    residentialText: "घर निर्माण, मरम्मत, फ्लोरिंग बेस, छोटे मिस्त्री काम और लैंडस्केपिंग के लिए।",
    commercialTitle: "कमर्शियल सप्लाई",
    commercialText: "दुकान, गोदाम, ऑफिस, साइट तैयारी और मेंटेनेंस टीम के लिए तय समय पर सप्लाई।",
    bulkRate: "बल्क रेट उपलब्ध",
    constructionTitle: "निर्माण बालू",
    constructionText: "ठेकेदार, बिल्डर और सिविल काम के लिए बड़ी मात्रा में भरोसेमंद सप्लाई।",
    contractRate: "कॉन्ट्रैक्ट रेट",
    quoteEyebrow: "तेज भाव",
    quoteTitle: "अपना बालू ऑर्डर अनुमान लगाएं और कन्फर्मेशन के लिए भेजें।",
    quoteText: "यह केवल अनुमानित भाव है। फाइनल रेट लोकेशन, रास्ता, मात्रा और अनलोडिंग देखकर कन्फर्म होगा।",
    quoteItemOne: "घर, कमर्शियल और कंस्ट्रक्शन काम",
    quoteItemTwo: "उसी दिन डिलीवरी अनुरोध",
    quoteItemThree: "हर सेव की गई क्वेरी व्हाट्सऐप पर जाती है",
    nameLabel: "ग्राहक का नाम",
    phoneLabel: "मोबाइल नंबर",
    addressLabel: "डिलीवरी पता",
    sandTypeLabel: "बालू का प्रकार",
    quantityLabel: "मात्रा",
    unitLabel: "वाहन",
    timingLabel: "डिलीवरी समय",
    scheduleDateLabel: "डिलीवरी तारीख",
    scheduleTimeLabel: "डिलीवरी समय",
    notesLabel: "नोट्स",
    saveNotify: "सेव करके व्हाट्सऐप भेजें",
    sendWhatsapp: "व्हाट्सऐप भेजें",
    contactEyebrow: "संपर्क",
    contactTitle: "Digit Infra Pvt LTD से बात करें।",
    contactHelp: "पटना बिहार, 800020",
    phoneCard: "फोन",
    phoneValue: "फोन: +91 72599 87874",
    emailCard: "ईमेल",
    emailValue: "ईमेल: digitInfra@gmail.com",
    whatsappCard: "व्हाट्सऐप",
    whatsappValue: "अपनी जरूरत भेजें",
    backTop: "ऊपर जाएं",
  },
};

const defaultPricing = {
  priceDate: new Date().toISOString().slice(0, 10),
  rates: {
    tractor: 4200,
    truck6: 12500,
    truck10: 18500,
    truck12: 22500,
    truck16: 29500,
  },
};

year.textContent = new Date().getFullYear();
let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "hi";
document.documentElement.lang = currentLanguage === "hi" ? "hi-IN" : "en-IN";
enableAdminMode();
applyLanguage(currentLanguage);

function enableAdminMode() {
  const params = new URLSearchParams(window.location.search);
  const isAdminMode = params.get("admin") === "1" || window.location.hash === "#backend";
  const isAuthenticated = sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";

  document.body.classList.toggle("admin-mode", isAdminMode);
  document.body.classList.toggle("admin-enabled", isAdminMode && isAuthenticated);

  if (!isAdminMode && window.location.hash === "#backend") {
    window.location.hash = "";
  }
}

function vehicleLabel(key) {
  return currentLanguage === "hi" ? vehicleHindiLabels[key] : vehicleLabels[key];
}

function text(key) {
  return languageContent[currentLanguage][key];
}

function setText(selector, key) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text(key);
}

function setPlaceholder(selector, en, hi) {
  const element = document.querySelector(selector);
  if (element) element.placeholder = currentLanguage === "hi" ? hi : en;
}

function setSelectOptions(selectName, values) {
  const select = document.querySelector(`select[name="${selectName}"]`);
  if (!select) return;
  values.forEach(([value, en, hi]) => {
    const option = select.querySelector(`option[value="${value}"]`);
    if (option) option.textContent = currentLanguage === "hi" ? hi : en;
  });
}

function applyLanguage(language) {
  currentLanguage = language;
  localStorage.setItem(LANGUAGE_KEY, language);
  document.documentElement.lang = language === "hi" ? "hi-IN" : "en-IN";

  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.classList.toggle("active", button.dataset.langButton === language);
  });

  document.querySelectorAll(".quote-form label").forEach((label) => {
    label.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = "";
    });
  });

  const mappings = [
    [".main-nav a[href='#products']", "navProducts"],
    [".main-nav a[href='#calculator']", "navQuote"],
    [".main-nav a[href='#contact']", "navContact"],
    ["#tickerLabel", "tickerLabel"],
    [".hero .eyebrow", "heroEyebrow"],
    [".hero h1", "heroTitle"],
    [".hero-content > p:nth-of-type(3)", "heroLead"],
    [".hero-actions .primary", "primaryCta"],
    [".hero-actions .secondary", "whatsappCta"],
    [".hero-stats div:nth-child(1) dd", "statSupport"],
    [".hero-stats div:nth-child(2) dd", "statDelivery"],
    [".hero-stats div:nth-child(3) dd", "statPatna"],
    [".mobile-cta a:nth-child(1)", "callNow"],
    [".mobile-cta a:nth-child(2)", "mobileWhatsapp"],
    ["#products .eyebrow", "productsEyebrow"],
    ["#products h2", "productsTitle"],
    [".product-card:nth-child(1) h3", "residentialTitle"],
    [".product-card:nth-child(1) p:not(.hindi-line)", "residentialText"],
    [".product-card:nth-child(2) h3", "commercialTitle"],
    [".product-card:nth-child(2) p:not(.hindi-line)", "commercialText"],
    [".product-card:nth-child(2) span", "bulkRate"],
    [".product-card:nth-child(3) h3", "constructionTitle"],
    [".product-card:nth-child(3) p:not(.hindi-line)", "constructionText"],
    [".product-card:nth-child(3) span", "contractRate"],
    ["#calculator .eyebrow", "quoteEyebrow"],
    ["#calculator h2", "quoteTitle"],
    [".quote-copy > p:not(.eyebrow):not(.hindi-line)", "quoteText"],
    [".check-list li:nth-child(1)", "quoteItemOne"],
    [".check-list li:nth-child(2)", "quoteItemTwo"],
    [".check-list li:nth-child(3)", "quoteItemThree"],
    [".quote-form .field-pair:nth-of-type(1) label:nth-child(1) span", "nameLabel"],
    [".quote-form .field-pair:nth-of-type(1) label:nth-child(2) span", "phoneLabel"],
    [".quote-form > label:nth-of-type(1) span", "addressLabel"],
    [".quote-form .field-pair:nth-of-type(2) label:nth-child(1) span", "sandTypeLabel"],
    [".quote-form .field-pair:nth-of-type(2) label:nth-child(2) span", "quantityLabel"],
    [".quote-form .field-pair:nth-of-type(3) label:nth-child(1) span", "unitLabel"],
    [".quote-form .field-pair:nth-of-type(3) label:nth-child(2) span", "timingLabel"],
    ["#scheduleFields label:nth-child(1) span", "scheduleDateLabel"],
    ["#scheduleFields label:nth-child(2) span", "scheduleTimeLabel"],
    [".quote-form > label:nth-of-type(2) span", "notesLabel"],
    [".quote-form .form-actions .primary", "saveNotify"],
    [".quote-form .form-actions .secondary", "sendWhatsapp"],
    ["#contact .eyebrow", "contactEyebrow"],
    ["#contact h2", "contactTitle"],
    ["#contactHelp", "contactHelp"],
    [".contact-cards a:nth-child(1) strong", "phoneCard"],
    [".contact-cards a:nth-child(1) span", "phoneValue"],
    [".contact-cards a:nth-child(2) strong", "emailCard"],
    [".contact-cards a:nth-child(2) span", "emailValue"],
    [".contact-cards a:nth-child(3) strong", "whatsappCard"],
    [".contact-cards a:nth-child(3) span", "whatsappValue"],
    [".site-footer a", "backTop"],
  ];

  mappings.forEach(([selector, key]) => setText(selector, key));

  setPlaceholder('input[name="name"]', "Your name", "आपका नाम");
  setPlaceholder('textarea[name="address"]', "Area, landmark, city", "एरिया, लैंडमार्क, शहर");
  setPlaceholder('textarea[name="notes"]', "Gate access, unloading help, preferred time", "गेट, अनलोडिंग, पसंदीदा समय");

  setSelectOptions("sandType", [
    ["Residential Sand", "Residential Sand", "घरेलू बालू"],
    ["Commercial Sand", "Commercial Sand", "कमर्शियल बालू"],
    ["Construction Sand", "Construction Sand", "निर्माण बालू"],
  ]);

  setSelectOptions("unit", [
    ["tractor", "Tractor load", "ट्रैक्टर लोड"],
    ["truck6", "6-wheel truck", "6 पहिया ट्रक"],
    ["truck10", "10-wheel truck", "10 पहिया ट्रक"],
    ["truck12", "12-wheel truck", "12 पहिया ट्रक"],
    ["truck16", "16-wheel truck", "16 पहिया ट्रक"],
  ]);

  setSelectOptions("delivery", [
    ["Same day", "Same day", "आज"],
    ["Tomorrow", "Tomorrow", "कल"],
    ["Scheduled", "Scheduled", "तय तारीख"],
  ]);

  renderPricing();
  updateEstimate();
}

function track(eventName, tags = {}) {
  if (typeof window.trackBusinessEvent === "function") {
    window.trackBusinessEvent(eventName, tags);
  }
}

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPricing() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRICING_KEY));
    if (saved?.rates) {
      return {
        priceDate: saved.priceDate || defaultPricing.priceDate,
        rates: { ...defaultPricing.rates, ...saved.rates },
      };
    }
  } catch {
    return defaultPricing;
  }

  return defaultPricing;
}

function setPricing(pricing) {
  localStorage.setItem(PRICING_KEY, JSON.stringify(pricing));
}

function rateForVehicle(vehicle) {
  return Number(getPricing().rates[vehicle] || 0);
}

function readForm() {
  const data = new FormData(form);
  const quantity = Math.max(Number(data.get("quantity")) || 1, 1);
  const unit = data.get("unit");
  const baseRate = rateForVehicle(unit);
  const deliveryPremium = data.get("delivery") === "Same day" ? 350 : 0;
  const scheduleDate = data.get("delivery") === "Scheduled" ? data.get("scheduleDate") : "";
  const scheduleTime = data.get("delivery") === "Scheduled" ? data.get("scheduleTime") : "";
  const total = Math.round(baseRate * quantity + deliveryPremium);

  return {
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    name: data.get("name").trim(),
    phone: data.get("phone").trim(),
    address: data.get("address").trim(),
    sandType: data.get("sandType"),
    quantity,
    unit,
    unitLabel: vehicleLabel(unit) || unit,
    rate: baseRate,
    priceDate: getPricing().priceDate,
    delivery: data.get("delivery"),
    scheduleDate,
    scheduleTime,
    notes: data.get("notes").trim(),
    total,
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character]));
}

function updateEstimate() {
  const lead = readForm();
  estimate.textContent = currentLanguage === "hi"
    ? `अनुमानित कुल: ${currency(lead.total)} (${lead.unitLabel} का रेट ${currency(lead.rate)})`
    : `Estimated total: ${currency(lead.total)} (${currency(lead.rate)} per ${lead.unitLabel})`;
  return lead;
}

function getLeads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function setLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function leadMessage(lead) {
  return [
    "New sand requirement",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Address: ${lead.address}`,
    `Material: ${lead.sandType}`,
    `Vehicle: ${lead.unitLabel || lead.unit}`,
    `Quantity: ${lead.quantity}`,
    `Rate date: ${lead.priceDate || getPricing().priceDate}`,
    `Rate: ${currency(lead.rate || rateForVehicle(lead.unit))}`,
    `Timing: ${lead.delivery}`,
    lead.scheduleDate ? `Scheduled date: ${lead.scheduleDate}` : "",
    lead.scheduleTime ? `Scheduled time: ${lead.scheduleTime}` : "",
    `Estimate: ${currency(lead.total)}`,
    lead.notes ? `Notes: ${lead.notes}` : "",
  ].filter(Boolean).join("\n");
}

function openWhatsApp(lead) {
  const encoded = encodeURIComponent(leadMessage(lead));
  window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, "_blank", "noopener,noreferrer");
}

function renderPricing() {
  const pricing = getPricing();
  pricingForm.elements.priceDate.value = pricing.priceDate;

  Object.entries(vehicleLabels).forEach(([key]) => {
    pricingForm.elements[key].value = pricing.rates[key];
  });

  priceSummary.innerHTML = Object.entries(vehicleLabels).map(([key, label]) => `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${currency(pricing.rates[key])}</strong>
    </article>
  `).join("");

  const tickerItems = currentLanguage === "hi"
    ? [
      `अपडेट: ${pricing.priceDate}`,
      ...Object.keys(vehicleLabels).map((key) => `${vehicleHindiLabels[key]} <b>${currency(pricing.rates[key])}</b>`),
      `बुकिंग: +91 72599 87874`,
    ]
    : [
      `Updated: ${pricing.priceDate}`,
      ...Object.keys(vehicleLabels).map((key) => `${vehicleLabels[key]} <b>${currency(pricing.rates[key])}</b>`),
      `Booking: +91 72599 87874`,
    ];
  const tickerText = tickerItems.map((item) => `<em>${item}</em>`).join("");

  priceTicker.innerHTML = tickerText;
  priceTickerClone.innerHTML = tickerText;
  tractorProductRate.textContent = currentLanguage === "hi"
    ? `${currency(pricing.rates.tractor)} / ट्रैक्टर से शुरू`
    : `From ${currency(pricing.rates.tractor)} / tractor`;
}

form.addEventListener("input", updateEstimate);
form.elements.delivery.addEventListener("change", updateScheduleFields);

document.querySelectorAll("[data-lang-button]").forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.langButton));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const lead = updateEstimate();
  const leads = [lead, ...getLeads()].slice(0, 25);
  setLeads(leads);
  track("lead_saved", {
    sand_type: lead.sandType,
    unit: lead.unit,
    vehicle: lead.unitLabel,
    delivery: lead.delivery,
    estimate: lead.total,
  });
  openWhatsApp(lead);
  form.reset();
  updateScheduleFields();
  updateEstimate();
});

whatsappButton.addEventListener("click", () => {
  if (!form.reportValidity()) return;
  const lead = updateEstimate();
  track("whatsapp_quote_started", {
    sand_type: lead.sandType,
    unit: lead.unit,
    vehicle: lead.unitLabel,
    delivery: lead.delivery,
    estimate: lead.total,
  });
  openWhatsApp(lead);
});

adminLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(adminLoginForm);
  const username = String(data.get("username") || "").trim();
  const password = String(data.get("password") || "");

  if (username === adminCredentials.username && password === adminCredentials.password) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    adminLoginStatus.textContent = "Login successful.";
    enableAdminMode();
    window.location.hash = "backend";
    return;
  }

  adminLoginStatus.textContent = "Invalid username or password.";
});

adminLogout.addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  enableAdminMode();
  window.location.hash = "adminLogin";
});

window.addEventListener("hashchange", enableAdminMode);

pricingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(pricingForm);
  const pricing = {
    priceDate: data.get("priceDate"),
    rates: Object.fromEntries(Object.keys(vehicleLabels).map((key) => [
      key,
      Math.max(Number(data.get(key)) || 0, 0),
    ])),
  };

  setPricing(pricing);
  renderPricing();
  updateEstimate();
  pricingStatus.textContent = `Prices saved for ${pricing.priceDate}.`;
  track("admin_prices_saved", { price_date: pricing.priceDate });
});

resetPrices.addEventListener("click", () => {
  setPricing(defaultPricing);
  renderPricing();
  updateEstimate();
  pricingStatus.textContent = "Default prices restored.";
});

function updateScheduleFields() {
  const isScheduled = form.elements.delivery.value === "Scheduled";
  scheduleFields.hidden = !isScheduled;
  form.elements.scheduleDate.required = isScheduled;
  form.elements.scheduleTime.required = isScheduled;

  if (!isScheduled) {
    form.elements.scheduleDate.value = "";
    form.elements.scheduleTime.value = "";
  }
}

renderPricing();
updateScheduleFields();
updateEstimate();
