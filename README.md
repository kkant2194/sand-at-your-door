# Sand At Your Door

**Product requirements:** [Read the PRD](https://app.notion.com/p/Sand-At-Your-Door-f343f7bd24ef4478aa3a32176794089a)

**Live demo:** [sand-at-your-door.vercel.app](https://sand-at-your-door.vercel.app)

**For buyers:** Request a sand quote from Digit Infra in Patna in English or Hindi, without an account, with an indicative estimate and operator follow-up.

Pilot-ready quote-request and admin-pricing app for Digit Infra Pvt LTD. Public acquisition is blocked until the launch safeguards in the rollout plan below are implemented and verified.

## Technology stack

Built with Next.js 14 App Router and React 18, using JavaScript and custom CSS. Supabase provides Postgres, admin authentication, and row-level security. Server-side API routes validate enquiries and calculate selected-vehicle prices from saved rates. The app is hosted on Vercel. Product and site analytics use Mixpanel and Vercel Analytics.

## Product brief

**Status:** Pre-pilot; internal soft launch planned. Pilot-ready describes the MVP scope, not approval for public launch.

**Positioning:** A no-middleman sand quoting tool built for small construction site operators in tier-2 Patna.

Sand procurement can require buyers to call three to five suppliers to compare rates, load quantities, and delivery charges. The four-week MVP aims to take a buyer from no information to a saved enquiry in under two minutes. It serves small contractors/site operators, homeowners, and local retailers; users can arrive from a shared WhatsApp link or a QR link on Digit Infra’s visiting card. The Digit Infra operator follows up to confirm serviceability and the final delivered price.

The pilot’s primary target is **40 serviceable enquiries per week by the end of week 6**. This is a proposed target, not a measured result.

The PRD estimates an initial market of about 500 active small-contractor builders and 60–80 building-material retailers in Patna micro-markets such as Danapur, Bailey Road, and Bypass. Validate these estimates during the pilot; they are not verified market counts.

Vehicle owners and drivers are a future delivery-partner segment; the current product does not onboard partners, assign trips, or track payouts.

## What the product does

- Lets homeowners, small construction site operators, and sand retailers in Patna request a quote in English or Hindi without creating an account.
- Shows dated vehicle rates and an indicative estimate when a vehicle is selected. The team confirms serviceability and the final delivered price.
- Saves enquiries through a server API and offers an optional WhatsApp handoff or phone contact.
- Gives authorized Digit Infra admins a protected dashboard to manage rates, same-day surcharge, contact settings, and enquiry follow-up.

A saved enquiry is a quote request, not a confirmed delivery or paid order. The homepage carries the savings promise, but savings must be verified against equivalent sand quality, quantity, delivery address, and included charges before a final delivered price is confirmed.

## Local development

Requirements: Node.js and npm.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The public site is at `/`; the admin portal is at `/admin` and requires an authorized Supabase admin account.

## Environment variables

Configure these in `.env.local` for local development and in Vercel for deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-server-api
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-project-token
NEXT_PUBLIC_MIXPANEL_REGION=EU
NEXT_PUBLIC_ENABLE_MIXPANEL_ON_LOCALHOST=false
NEXT_PUBLIC_MIXPANEL_DEBUG=false
```

The Supabase anon key and Mixpanel project token are browser-facing values. Keep `SUPABASE_SERVICE_ROLE_KEY` private and server-side only. Set the Mixpanel region to match the project’s data residency (`US`, `EU`, or `IN`). Mixpanel is disabled on localhost unless explicitly enabled. These `NEXT_PUBLIC_` values are included at build time; redeploy after changing production values.

## Supabase setup

1. Create a Supabase project and configure the environment variables above.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
3. For an existing database, also run [`supabase/migrations/20261001_protect_admin_privileges.sql`](supabase/migrations/20261001_protect_admin_privileges.sql). Confirm that non-admin users cannot grant themselves admin access and approved admins can still manage rates.
4. Create admin accounts in Supabase Auth. Grant the intended account admin access by setting its profile flag:

   ```sql
   update public.profiles
   set is_admin = true
   where id = (select id from auth.users where email = 'owner@example.com');
   ```

   Replace the example email with the authorized admin’s email. Do not expose the service-role key to the browser or commit `.env.local`.

## Analytics

Mixpanel tracks the quote journey, field completion, submission outcomes, and phone/WhatsApp clicks. Names, phone numbers, addresses, and notes are excluded from custom analytics events. Heatmaps and Session Replay are configured in Mixpanel with form inputs masked and the saved confirmation blocked. Vercel Analytics provides site-level analytics. Microsoft Clarity is not currently loaded by the app: `app/ClarityScript.jsx` remains as unused code, and its unused environment configuration has been removed. The active integrations are Mixpanel and Vercel Analytics; verify ingestion on the deployed build before relying on reports.

See [`docs/mixpanel-setup.md`](docs/mixpanel-setup.md) for project setup, event definitions, reports, and verification. Supabase remains the source of truth for saved enquiries; a client analytics event can be missed even if the database save succeeded.

## Rollout and launch blockers

The three-week rollout starts with internal testing and a small buyer cohort. Do not start the Week 3 open pilot or public acquisition until the launch gate is complete.

| Stage | Timing | Work and exit criteria |
| --- | --- | --- |
| Internal soft launch | Week 1 | Limit access to the Digit Infra team. Submit 20 test enquiries, resolve admin workflow issues, verify the rate card, and exclude test enquiries from pilot metrics. |
| Network launch | Week 2 | Invite 30 real buyers from Digit Infra’s existing network. Collect feedback with a three-question WhatsApp survey after submission; check the 15-serviceable-enquiry weekly floor and response-time target. |
| **Open-pilot launch gate — blocker** | Before Week 3 | Implement and verify server-side rate limiting and bot protection for enquiry submissions. Also implement and verify database-backed idempotency so retries cannot create duplicate enquiries. Do not activate open acquisition until these controls pass testing. |
| Open pilot | Week 3, only after gate passes | Activate three channels: share the link in five relevant Patna construction WhatsApp groups per week, place QR cards at active construction sites during Digit Infra deliveries, and add the website link to Digit Infra’s Google Business Profile. Track link visits, saved enquiries, and conversion by source; hold a daily operator check-in on lead quality and follow-up. |
| Optimize and expand | After pilot evidence | Review the PRD metrics, channel success criterion, buyer feedback, fulfilment outcomes, and unit economics before adding partner dispatch, repeat buying, payment, or new service areas. |

Detailed metric definitions and proposed targets are in the [PRD](https://app.notion.com/p/Sand-At-Your-Door-f343f7bd24ef4478aa3a32176794089a). Do not present proposed targets as measured outcomes.

The PRD defines these pilot metrics and targets; they are goals, not achieved results:

| Metric | Target | Horizon / source |
| --- | --- | --- |
| Serviceable enquiries saved per week | 40 by week 6; floor of 15 by week 2 | Supabase with operator serviceability qualification; exclude tests and spam |
| Quote-attempt conversion (`lead_saved` ÷ `quote_started`) | 55%; baseline hypothesis is about 35% | End of week 4; Mixpanel |
| Median enquiry completion time (`quote_started` to `lead_saved` for the same saved attempt) | Under 2 minutes | Week 4; Mixpanel |
| Saved-to-WhatsApp click rate | 60% | Week 4; Mixpanel; a click does not prove message delivery |
| First-contact response time | Under 30 minutes during staffed hours | Week 2; manual pilot log |
| Serviceable enquiry-to-delivery conversion | 35%; approximately 14 eventual deliveries from 40 weekly enquiries | Week 6; manual cohort log with verified delivery confirmation; manual admin statuses alone are insufficient |
| Savings-promise honour rate | At least 70% of comparable buyer-shared quotes are beaten | Week 4; manual pilot log |
| Repeat buying | Establish a baseline; no MVP target | Deferred until buyer linkage exists |

The per-order contribution objective is to remain positive after driver and operating costs from pilot week 2 onward. The under-two-minute product target measures completion of a saved enquiry; the final quote requires operator follow-up. Both require pilot measurement.

At the week-four review, use started-to-saved conversion to decide the next step. Payment remains proposed work, subject to pilot evidence and launch safeguards.

| Started-to-saved conversion | Proposed next step |
| --- | --- |
| 55% or above | Target met; scope payment integration for week 5. |
| 35% to below 55% | Interview five buyers who dropped off, fix the top friction point, and remeasure for two weeks. |
| 20% to below 35% | Review ten Mixpanel session replays and simplify the form before adding features. |
| Below 20% | Pause development and revisit problem framing and market fit. |

## MVP scope and operating limits

Only name, valid phone number, and delivery address are required. Application and vehicle start unselected; load count starts at 0 (unspecified). Selecting a vehicle requires 1–100 whole loads. Supplied optional details are validated. Without a vehicle, show “Price to be confirmed”; database compatibility placeholders are not customer prices or quantities.

Show a 10-character reference only after saving successfully; retain the full ID internally. Failed submissions preserve input for retry. WhatsApp requires an explicit buyer action, includes only supplied details and the saved reference when available, and asks the team to confirm the final delivered price. A click does not prove that a message was sent.

The admin queue shows the latest 200 enquiries, with search, filters, and manual status updates. It lacks status history and first-contact timestamps; use a manual pilot log for serviceability, response time, outcome reasons, delivery confirmation, comparable buyer quotes, and order contribution.

Before committing to a final quote, the operator verifies material, quantity, coverage, site access, unloading, timing, and included charges. Define savings-guarantee eligibility, comparison rules, validity, minimum saving, and remedy, and agree measurable load capacity and sand quality with operations. These remain open operating issues in the PRD.

Customer accounts, checkout/payments, automated competitor comparison or guarantee processing, automated outbound WhatsApp, partner dispatch/payouts, GPS tracking, verified weight measurement, and multi-supplier or geographic expansion are outside the MVP.

## Useful commands

```sh
npm run dev
npm run build
npm run start
node --test tests/quoteAnalytics.test.mjs tests/analytics.test.mjs tests/queries.test.mjs
```

The development server uses `.next-dev`; production builds use `.next`.
