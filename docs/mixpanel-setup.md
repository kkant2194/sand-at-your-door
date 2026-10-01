# Mixpanel quote-to-lead analytics

Production website: https://sand-at-your-door.vercel.app

## Connect your project

1. Create a Mixpanel project (a separate test project is recommended for local testing).
2. Copy the **Project Token** from project settings. Do not use an API secret or service-account credential.
3. In Vercel, open the project for this website → Settings → Environment Variables. Set:

```env
NEXT_PUBLIC_MIXPANEL_TOKEN=your-project-token
NEXT_PUBLIC_MIXPANEL_REGION=US
NEXT_PUBLIC_ENABLE_MIXPANEL_ON_LOCALHOST=false
NEXT_PUBLIC_MIXPANEL_DEBUG=false
```

Use `EU` or `IN` instead of `US` when that is your Mixpanel project's data residency. The token is a public browser token. These NEXT_PUBLIC variables are built into the app, so redeploy after adding/changing them. Deploy the updated repository code as well; local edits do not update Vercel automatically.

For local testing, add the same variables to `.env.local`, preferably using a test-project token. Set `NEXT_PUBLIC_ENABLE_MIXPANEL_ON_LOCALHOST=true` and optionally `NEXT_PUBLIC_MIXPANEL_DEBUG=true`, then restart `npm run dev -- --port 3000`. No token or localhost disabled means no Mixpanel initialization or requests.

## Event definitions

| Event | Definition |
| --- | --- |
| quote_viewed | Quote section intersects the viewport, once per attempt. |
| quote_started | First field change, application-card selection or submit action. If an application card is selected before the quote is visible, emission waits for visibility so the main funnel remains ordered. |
| requirement_completed | Application, vehicle and 1–100 integer quantity are valid after the journey starts. Defaults can satisfy this milestone after interaction; it measures section readiness, not separate clicks on every field. |
| delivery_completed | Address and delivery choice are valid; scheduled delivery includes a valid non-past date. |
| contact_completed | Name and Indian mobile number are valid. |
| quote_submit_attempted | Request a quote is submitted, before validation; repeats on retries. |
| quote_validation_failed | Quote submission is blocked; invalid_fields contains field names only. |
| lead_saved | A successful API response confirms a saved enquiry; once per attempt. |
| quote_save_failed | Network failure or server/invalid response; repeats on retries. |
| whatsapp_clicked | WhatsApp handoff clicked, with location: mobile_bar, contact_section, quote_form, saved_confirmation. It does not confirm message delivery. |

An attempt lasts until successful save and starting another quote, or a page reload. React Strict Mode and repeated intersection callbacks do not duplicate milestones. Form-section completion events are historical milestones; clearing a previously valid field does not retract them. Each attempt gets a random quote_attempt_id, separate from the customer/enquiry ID. Events from the quote journey carry language, application, vehicle_type, delivery_type and entry_point. Standard vehicle IDs are categorized; custom vehicles are recorded as `custom`, not arbitrary user-editable names.

## Create reports

In Mixpanel's Funnels report, select these events in this order:

1. quote_viewed
2. quote_started
3. quote_submit_attempted
4. lead_saved

Start with a 30-minute conversion window and hold `quote_attempt_id` constant across steps to avoid combining different quotes from the same anonymous visitor. The default unique-user funnel measures visitors; use the report's available conversion counting options if you want attempt-level totals. Label the metric accordingly. Save as **Quote to lead** on a board. Add a shorter quote_started → lead_saved report for conversion among starters.

Break down by language, device_type, application or vehicle_type. Create separate quote_started → requirement_completed, quote_started → delivery_completed, and quote_started → contact_completed funnels because sections can be completed in any order. Add Insights reports for quote_validation_failed (break down invalid_fields), quote_save_failed (failure_type) and whatsapp_clicked (whatsapp_location).

## Verify

- In Mixpanel Events / Live View, scroll to the quote section: quote_viewed appears once.
- Select an application or edit a field: quote_started appears once. Revisiting/editing doesn't duplicate milestones.
- Complete each section, including Hindi and scheduled-date use; verify section events.
- Submit invalid details: attempted + validation_failed, without lead_saved.
- Complete a real test enquiry: attempted + lead_saved only after successful saving.
- Simulate offline/API failure: save_failed, with no lead_saved. Retry and confirm one saved milestone.
- Start another quote: a new quote_attempt_id appears.
- Test every WhatsApp location; direct contact links do not count as saved leads.
- Inspect request payloads: no names, phone numbers, addresses, notes, full URLs/query strings or raw errors.
- Visit /admin: this integration does not initialize or track admin activity.

## Privacy and limits

Only explicitly allowed custom events/properties are sent. Autocapture, automatic page views and Mixpanel session replay are off. Anonymous SDK identification is used; no identify()/People profiles are created. URL/referrer properties and IP-based geolocation enrichment are disabled. Anonymous localStorage IDs persist within the browser; this is pseudonymous tracking, not zero-data tracking. Browser/device metadata may still be sent by the SDK. Respect existing opt-out/DNT behavior and describe analytics in your privacy notice. Existing Clarity recording is separate; the form and confirmation are masked.

Client-side lead_saved can be missed by blockers, navigation or network failure even when the database save succeeds. Use Supabase as the source of truth for lead totals. Tracking errors never block quote submission. No Mixpanel project/reports are created automatically by this code.

References: https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript and https://docs.mixpanel.com/docs/reports/funnels
