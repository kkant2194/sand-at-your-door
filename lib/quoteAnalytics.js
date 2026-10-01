export const QUOTE_EVENTS = new Set([
  "quote_viewed", "quote_started", "requirement_completed", "delivery_completed",
  "contact_completed", "quote_submit_attempted", "quote_validation_failed",
  "lead_saved", "quote_save_failed", "whatsapp_clicked",
]);
const ENUMS = {
  language: ["en", "hi"],
  application: ["Plaster", "RCC (General)", "Terrace Slab", "Raft Foundation"],
  delivery_type: ["Same day", "Tomorrow", "Scheduled"],
  entry_point: ["form", "application_card", "rate_banner"],
  failure_type: ["network", "server"],
  whatsapp_location: ["mobile_bar", "contact_section", "quote_form", "saved_confirmation"],
  device_type: ["mobile", "tablet", "desktop"],
};
const FIELDS = ["name", "phone", "address", "quantity", "vehicleId", "scheduleDate"];

// Explicit allowlist: form contents and arbitrary properties never reach the SDK.
export function sanitizeQuoteProperties(properties = {}) {
  const safe = {};
  for (const [key, choices] of Object.entries(ENUMS)) {
    if (choices.includes(properties[key])) safe[key] = properties[key];
  }
  if (/^[a-f0-9-]{36}$/i.test(properties.quote_attempt_id || "")) safe.quote_attempt_id = properties.quote_attempt_id;
  if (["tractor", "truck6", "truck10", "truck12", "truck16", "custom", "unavailable"].includes(properties.vehicle_type)) safe.vehicle_type = properties.vehicle_type;
  if (Array.isArray(properties.invalid_fields)) safe.invalid_fields = [...new Set(properties.invalid_fields.filter((field) => FIELDS.includes(field)))];
  return safe;
}

export function validQuoteSections(quote, vehicleIds, today) {
  const date = quote.scheduleDate;
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date || "") && Number.isFinite(Date.parse(date))
    && new Date(date).toISOString().slice(0, 10) === date && date >= today;
  return {
    requirement: ENUMS.application.includes(quote.sandType) && vehicleIds.includes(quote.vehicleId)
      && Number.isInteger(Number(quote.quantity)) && Number(quote.quantity) >= 1 && Number(quote.quantity) <= 100,
    delivery: typeof quote.address === "string" && quote.address.trim().length > 0 && quote.address.length <= 1000
      && ENUMS.delivery_type.includes(quote.delivery) && (quote.delivery !== "Scheduled" || validDate),
    contact: typeof quote.name === "string" && quote.name.trim().length > 0 && quote.name.length <= 100
      && typeof quote.phone === "string" && /^(?:\+?91|0)?[6-9]\d{9}$/.test(quote.phone.replace(/[ ()-]/g, "")),
  };
}

export function createQuoteJourney(send, id) {
  const seen = new Set();
  const pending = [];
  let started = false;
  let entryPoint = "form";
  let completed = false;
  function emit(event, props = {}, once = false) {
    if (once && seen.has(event)) return;
    if (once) seen.add(event);
    const payload = { ...props, quote_attempt_id: id, entry_point: entryPoint };
    if (event !== "quote_viewed" && !seen.has("quote_viewed")) pending.push([event, payload]);
    else send(event, payload);
  }
  return {
    get started() { return started; },
    get completed() { return completed; },
    viewed(props) {
      emit("quote_viewed", props, true);
      while (pending.length) { const [event, payload] = pending.shift(); send(event, payload); }
    },
    start(props, source = "form") {
      if (started) return;
      started = true;
      entryPoint = source;
      emit("quote_started", props, true);
    },
    stages(quote, vehicleIds, today, props) {
      if (!started || completed) return;
      const valid = validQuoteSections(quote, vehicleIds, today);
      for (const [stage, isValid] of Object.entries(valid)) if (isValid) emit(`${stage}_completed`, props, true);
    },
    event(event, props) { emit(event, props); },
    saved(props) { completed = true; emit("lead_saved", props, true); },
  };
}
