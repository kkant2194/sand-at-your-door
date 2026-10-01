import { QUOTE_EVENTS, sanitizeQuoteProperties } from "./quoteAnalytics";
let clientPromise;
const HOSTS = { US: "https://api.mixpanel.com", EU: "https://api-eu.mixpanel.com", IN: "https://api-in.mixpanel.com" };

export function analyticsEnabled() {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return false;
  if (!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN?.trim()) return false;
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname);
  return !local || process.env.NEXT_PUBLIC_ENABLE_MIXPANEL_ON_LOCALHOST === "true";
}

export function initAnalytics() {
  if (!analyticsEnabled()) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("mixpanel-browser").then(({ default: mixpanel }) => {
      mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN.trim(), {
        api_host: HOSTS[process.env.NEXT_PUBLIC_MIXPANEL_REGION || "US"] || HOSTS.US,
        autocapture: false, track_pageview: false, record_sessions_percent: 0,
        persistence: "localStorage", ip: false, save_referrer: false,
        skip_first_touch_marketing: true, stop_utm_persistence: true,
        property_blacklist: ["$current_url", "$referrer", "$initial_referrer", "$referring_domain", "$initial_referring_domain"],
        debug: process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === "true",
      });
      return mixpanel;
    }).catch(() => null);
  }
  return clientPromise;
}

export function trackQuoteEvent(event, properties = {}) {
  if (!QUOTE_EVENTS.has(event) || !analyticsEnabled()) return;
  const safe = sanitizeQuoteProperties({ ...properties, device_type: window.innerWidth < 640 ? "mobile" : window.innerWidth < 980 ? "tablet" : "desktop" });
  void initAnalytics().then((client) => {
    if (!client || !analyticsEnabled()) return;
    try { client.track(event, safe, { transport: "sendBeacon", send_immediately: true }); } catch {}
  }).catch(() => {});
}
