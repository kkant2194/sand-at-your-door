# Sand At Your Door

Sand At Your Door is a bilingual (English and Hindi) web app that lets small contractors, homeowners, and local retailers in Patna request a direct quote for sand delivery in under 2 minutes, without creating an account. It replaces the typical process of calling 3 to 5 suppliers to compare rates. Built as a  4-week MVP for Digit Infra, a friend’s family-run sand supply business that currently operates via phone and WhatsApp.

**Primary Target**: 40 serviceable saved enquiries per week within 6 weeks of pilot launch.

**Current Status**: Pre-Pilot phase.Internal soft launch planned.

Live demo: [https://sand-at-your-door.vercel.app](https://sand-at-your-door.vercel.app)  |  GitHub: [https://github.com/kkant2194/sand-at-your-door/tree/main](https://github.com/kkant2194/sand-at-your-door/tree/main) |  Loom: Will add later

## Problem

A small contractor in Patna today calls 3 to 5 suppliers for every sand order to compare prices. There is no price transparency, no quality assurance, and no digital quote channel. For a 50-load delivery over a 3-month build cycle, this means roughly 150 phone calls just to procure one material. Suppliers like Digit Infra receive these calls across phone and WhatsApp, often with incomplete information (missing site address, unclear vehicle preference, no timing), which makes pricing and follow-up expensive. Delivery partners (tractor and truck owners) face idle time between jobs because demand is not aggregated. All three sides lose time and money to a coordination problem.

These challenges indicate a need for a simple, accessible way to communicate requirements, obtain comparable quotes, and coordinate supply and delivery. For Digit Infra, addressing them could improve enquiry quality, follow-up, and conversion into sustainable fulfilled business. The extent of these problems remains to be validated through interviews and operating data.

## Market and Competitive Landscape

- Target Audience: ~500 active small-contractor builders (10–50 unit residential projects) and 60–80 building material retailers across micro-markets (e.g., Danapur, Bailey Road, Bypass).
- Pricing unit: The app quotes ₹ per vehicle load and displays approximate capacity in cft/load when available. Vehicle prices cannot be compared with a per-brass market rate until capacity, sand quality, delivery location, and included charges are matched.
- Working market estimate: ₹7,500–₹8,500 per 100 cft (1 brass), delivered. The source, collection date, covered locations, material specification, and included charges are not yet documented; validate these figures during pilot week 2 before using them as a savings benchmark. The proposed 20%–30% supply-chain markup is also an unverified hypothesis.
- Unit reference: 100 cft is approximately 2.832 cubic metres. Assuming a bulk density of 1.5–1.7 tonnes per cubic metre gives approximately 4.25–4.81 tonnes, not 10 tonnes. This is an illustrative conversion, not a verified delivered weight; moisture and compaction affect density. Volume conversion reference: [NIST Handbook 44](https://www.nist.gov/system/files/documents/2019/11/05/appc-20-hb44_final.pdf).
- Comparable-price method: For an evidenced capacity, an approximate comparison rate is vehicle-load price × 100 ÷ capacity in cft. This normalization is a manual comparison method, not an implemented public price-per-brass calculator. Include equivalent delivery and unloading costs before comparing offers; do not calculate a comparison rate for an unknown capacity.
- Competitive Landscape: Highly fragmented and informal, controlled by 2–3 local brokers per neighborhood. No digital quoting option we found serving small buyers in Patna.
- Note: Baseline metrics to be validated during Week 2 of the pilot.

## Objectives

1. Reduce time-to-first-quote for small construction buyers in Patna from ~30 minutes (3 phone calls) to under 2 minutes.
2. Validate the demand signal: 40 serviceable saved enquiries per week within 6 weeks of pilot launch.
3. Evaluate competitive pricing with evidence: At least 70 percent of comparable quotes come in lower than the shared buyer quote.
4. Keep per-order contribution positive after driver and operations cost: positive gross margin per fulfilled order from pilot week 2 onwards.
5. Learn before we scale: identify the top 3 drop-off points in the quote flow and the top 3 reasons enquiries do not convert to delivery.

## Constraints

1. Single supplier and geography: Digit Infra serves validated coverage in Patna. The MVP does not offer supplier comparison.
2. Manual confirmation: Final pricing, serviceability, and delivery timing depend on operator follow-up; customers wait for a response.
3. Vehicle-load pricing: Each vehicle can have an optional positive approximate capacity in cft/load maintained by the operator. Capacity is an operating estimate, not measured delivered volume or weight. Unknown capacities remain explicitly unconfirmed. Material specifications and the measurement basis still require agreement with Digit Infra.
4. No customer login: This reduces friction but limits durable customer history and self-service order tracking.
5. Operator capacity and records: The dashboard shows the latest 200 enquiries. Statuses are manual and lack timestamps/history; inconsistent updates can distort commercial metrics. Growth requires pagination and reporting.
6. Pricing fallback: Display defaults keep the form usable when live rates fail, but may differ from current rates. Saved selected-vehicle totals use authoritative server pricing.
7. WhatsApp handoff: Buyers explicitly initiate contact. Messages can remain unsent, and conversation outcomes are not tracked.

## User Persona

Illustrative behavior-based profiles; names and businesses are fictional.

1. **Primary user: Manoj Kumar** — Site operator / small contractor
A 32-year-old contractor managing 3–5 active residential sites in Patna. Primarily uses his phone and is more comfortable in Hindi than English.
**Pain**: Makes 3–5 calls per order to compare rates and often requests the wrong vehicle size on the first call.
**Desired outcome**: Get a rate in one place, flag details he is unsure about, and receive an operator follow-up.
2. **Homeowner: Sunita Devi** — First-time home builder, Kankarbagh
Manages procurement without technical knowledge. Comfortable with English but prefers Hindi for pricing discussions.
**Pain**: Unsure which vehicle size to choose, whether quoted rates are fair, and whether there are hidden delivery charges.
**Desired outcome**: Submit basic details and receive supplier guidance on vehicle size and total delivered cost.
3. **Small retailer: Pankaj Prasad** — Local sand shop owner
Purchases multiple loads of sand for resale.
**Pain**: Thin margins make replenishment costs critical to resale viability.
**Desired outcome:** Get transparent delivered costs for orders of 10 or more loads and discuss bulk pricing directly with the supplier.
4. **Primary admin user: Asha Singh** — Digit Infra operator
Manages the rate card, incoming enquiries, follow-up calls, and delivery coordination.
**Pain:** Enquiries are scattered across phone, WhatsApp, and the admin tool, with no unified queue or visibility into response times.
**Desired outcome:** Manage enquiries in a single filterable queue, update statuses manually, and maintain rates in a protected admin area.
5. **Deferred persona:** Suresh Yadav — Tractor owner / local delivery partner
Represents delivery partners considered for a future phase.
**Pain:** Idle time between trips and uncertainty about return trips.
**Future opportunity:** Match verified buyer demand with available tractor capacity as part of V2.

## Customer Pain Points and Solutions

The pain points and benefits below remain hypotheses to validate.

| Pain-point hypothesis | MVP response | Expected benefit | How to validate |
| --- | --- | --- | --- |
| Customers must call several people to get a usable estimate. | Published vehicle rates and a live estimate. | Faster initial price discovery. | Interview buyers and time quote completion. |
| Buyers cannot tell whether a price is competitive. | An invitation to share another seller’s quote for manual comparison; no guaranteed saving. | A reason to enquire and request a verified saving. | Manually compare equivalent delivered quotes and record the final customer price. |
| Language or account creation makes online buying difficult. | English/Hindi interface and no customer login. | Easier completion on a phone. | Compare funnel conversion by language/device and observe usability sessions. |
| Delivery urgency is unclear. | Same-day, tomorrow, or scheduled-date preference; configurable same-day surcharge. | Clearer expectations before follow-up. | Compare requested dates against actual serviceability. |
| Customers are unsure whether a request was received. | Saved-enquiry reference and explicit WhatsApp handoff. | More confidence and easier follow-up. | Ask buyers whether confirmation is understandable. |
| Operators lose enquiries in scattered conversations. | Saved database records and admin statuses. | A visible follow-up queue. | Audit lead handling and ageing during the pilot. |
| Rates change and staff repeat outdated prices. | Admin-managed effective-date pricing and server-calculated saved totals. | More consistent quoted estimates. | Monitor displayed/saved differences and rate freshness. |

## Core User Journey and Acceptance Criteria

Entry points: Users discover and access the website through a shared WhatsApp link, or a link printed on Digit Infra’s visiting card.

| Step | Core user journey | Acceptance criteria |
| --- | --- | --- |
| 1. Discover | Buyer visits the homepage and understands the service. | Mobile-friendly page supports English/Hindi and clearly explains direct purchasing and the invitation to share another seller’s quote without promising a guaranteed saving. |
| 2. View rates | Buyer explores vehicle rates and indicative pricing. | Rates show an effective date, loading state, and unavailable message if fetching fails. Display approximate capacity in cft/load beside each vehicle price when available; otherwise show “Capacity awaiting confirmation.” Support English/Hindi labels. Estimates are clearly distinguished from confirmed prices. |
| 3. Enter required details | Buyer enters name, phone number, and delivery address. | All three fields are required. Invalid or missing details show field-level errors. No signup is needed. |
| 4. Add requirements | Buyer optionally selects application, vehicle, load count, and delivery details. | Application and vehicle are initially unselected. Buyers can submit without them. Supplied optional values are validated. |
| 5. Review estimate | Buyer checks the indicative cost. | Selected-vehicle estimates reflect load count and applicable surcharge. Without a vehicle selection, display “Price to be confirmed,” not ₹0. |
| 6. Submit enquiry | Buyer requests a quote. | Valid enquiries are saved server-side. Selected-vehicle pricing is calculated by the server. Failed submissions preserve input and allow retry. |
| 7. Receive confirmation | Buyer receives a saved enquiry reference. | Show a reference only after successful saving, alongside the estimate or pending-price message and capacity when available. Preserve the capacity from authoritative server pricing in the saved vehicle-label snapshot, so later pricing edits do not change earlier enquiry details. Clarify that this is not a confirmed delivery or paid order. |
| 8. Contact the team | Buyer continues through WhatsApp or phone. | Contact links open the appropriate channel. WhatsApp requires an explicit user action. Direct contact is available without submitting the form. |
| 9. Finalize the quote | Operator clarifies requirements and confirms the delivered price. | Manually verify material, quantity, serviceability, site access, unloading, timing, and final price before confirming the request. |
| 10. Manage follow-up | Operator reviews and updates the enquiry. | Only authorized admins can access enquiries, search/filter records, and update statuses. Manual status labels are not proof of delivery or payment. |

## Decision Log and Rationale

| Decision | Why | Trade-off accepted |
| --- | --- | --- |
| Single supplier only | A multi-supplier marketplace requires supplier onboarding, trust mechanisms, and payment flows that would exceed the MVP timeline. Start with Digit Infra to validate channel demand. | Limited supplier choice and rate comparison during the pilot. Consider adding suppliers once demand is validated, avoiding premature scaling. |
| No customer login | Login adds a step before the buyer has seen any value, at the exact moment we are trying to prove the enquiry channel works. Most of our buyers will be first-time visitors on a phone. Phone number is already captured, so we lose little by skipping accounts. | No persistent customer history at launch. Consider lightweight WhatsApp OTP login once the app’s value is proven. |
| Vehicle-load pricing instead of volume or weight | Precise volume or weight pricing requires measurement equipment at the supplier’s end. Vehicle-load pricing follows existing industry practice and is familiar to buyers. | Show approximate cft/load alongside ₹/load, while retaining vehicle-load totals. Compare offers only after matching material, volume, address, and included charges; approximate capacity does not establish verified delivered quantity. |

## Features In

We scoped the MVP against 2 criteria: must enable a buyer to go from 'no information' to 'enquiry saved' in under 2 minutes, and must give the operator a reliable follow-up queue. Features 1 to 5 serve the buyer path. Feature 6 serves the operator path. We deferred everything else, including payment, dispatch, and multisupplier comparison, until the pilot validates core demand.

### Feature 1 — Mobile-friendly bilingual homepage and quote comparison

1. Provide a public homepage optimized for mobile use.
2. Support English/Hindi through a language toggle.
3. Present the English headline: “Share another seller's quote. We'll try to beat it.” Communicate that comparison is manual and depends on equivalent quality, quantity, delivery address, and included charges; this is not a price-match or refund guarantee. Align the Hindi translation with the same meaning before bilingual release.
4. Explain comparison on an equivalent delivered-price basis and invite buyers to share a comparable local quote.
5. Why it matters: Give cost-conscious local buyers a clear reason to request a direct quote.

### Feature 2 — Current vehicle rates and indicative estimates

1. Display saved vehicle rates with their effective date and approximate capacity in cft per load when confirmed by Digit Infra. Unknown capacities remain explicitly unconfirmed; never infer capacity from wheel count.
2. Show loading and unavailable banner states. Display “Capacity awaiting confirmation” when a vehicle has no capacity; do not invent a capacity for legacy records.
3. Calculate an indicative vehicle/load-based estimate with a configurable same-day surcharge.
4. Calculate selected-vehicle pricing server-side when saving the enquiry. Read capacity from authoritative saved pricing, not the buyer payload; snapshot it in the enquiry vehicle label and return it for confirmation and WhatsApp when available.
5. Why it matters: Provide a usable estimate and prevent manipulated browser totals from becoming stored quotes.

### Feature 3 — Flexible quote request without customer signup

1. Require only name, valid phone number, and delivery address.
2. Keep application and vehicle selection optional and initially unselected.
3. Start load quantity at 0 (unspecified). When a vehicle is selected, require 1–100 whole loads. Support delivery preference, optional scheduled date, and notes.
4. Validate supplied optional values.
5. Save requests without a vehicle as unspecified and display “Price to be confirmed.”
6. Treat database numeric compatibility placeholders as internal values, not customer prices.
7. Why it matters: Let buyers request help even when they cannot specify the load or vehicle.

### Feature 4 — Durable enquiry saving and clear confirmation

1. Persist requests server-side.
2. Display a 10-character customer reference only after a successful save; retain the full database ID internally.
3. Retain entered information after a failed submission and allow retry.
4. Show an estimate or “Price to be confirmed” in the confirmation, depending on whether a vehicle was selected.
5. Why it matters: Provide dependable receipt confirmation and a durable lead record.

### Feature 5 — Explicit WhatsApp handoff and phone contact

1. Provide WhatsApp and phone contact links.
2. Require an explicit buyer action to initiate WhatsApp handoff.
3. Format the WhatsApp handoff with the short reference after saving, required contact details, and any optional details the buyer filled in. Omit blank fields and the rate update date; ask the team to confirm the final delivered price. Before saving, use quote-request wording without claiming an enquiry was submitted.
4. Why it matters: Make clarification and follow-up accessible through familiar channels.

### Feature 6 — Protected admin pricing and enquiry management

1. Restrict access to authorized admins.
2. Show the latest 200 enquiries.
3. Support search, filters, and manual status updates.
4. Allow operators to maintain vehicle rates, optional positive approximate capacities in cft per load, effective dates, contact settings, and the same-day surcharge. Replace the numeric wheel-count editor with estimated capacity; retain vehicle names and IDs. Save the server-selected capacity with enquiry vehicle labels and show it in confirmations and WhatsApp when available.
5. Accept positive finite decimal capacities or a blank value for unknown capacity. Reject zero, negative, and invalid supplied values; retain capacities through admin save/reload. Keep vehicle IDs, names, and prices compatible with older records without capacity.
6. Why it matters: Give a small operation a manageable pricing and follow-up workflow.

## Features Out

The following capabilities are deferred or excluded from the MVP.

| Excluded feature | Scope excluded | Reason for exclusion or deferral |
| --- | --- | --- |
| Feature 1 — Automated competitor comparison and guarantee processing | Automatic competitor-price lookup, price matching, savings calculation, and guarantee refunds. | Savings verification remains manual; a pricing engine and guarantee-processing workflow are outside the MVP. |
| Feature 2 — Customer accounts and repeat purchasing | Buyer accounts, saved sites, reordering, and retailer wholesale/credit workflows. | Preserve a low-friction enquiry flow; durable customer history and repeat-buying capabilities are future work. |
| Feature 3 — Vehicle-partner platform | Vehicle-owner onboarding, live availability, dispatch, payout tracking, and a partner app. | Future phase. Before launch, define and record vehicle suitability, agreed trip charges, delivery confirmation, and payout status. |
| Feature 4 — Automated fulfillment visibility | Real-time inventory, guaranteed slots, GPS tracking, and proof of delivery. | The current product supports enquiries and manual follow-up rather than confirmed fulfillment commitments. |
| Feature 5 — Transactions and outbound automation | Online checkout, payments, invoicing, refunds, and automated outbound WhatsApp messaging. | Validate demand before building payment and fulfillment commitments; WhatsApp remains an explicit customer action. |
| Feature 6 — Marketplace and geographic expansion | Multi-supplier marketplace and expansion beyond validated operating coverage. | Maintain a single-supplier, Patna-focused operating scope and direct customer relationship. |
| Feature 7 — Precise quantity calculation and measurement | Building-dimension quantity calculator and verified load-weight measurement. | Use current vehicle/load pricing without implying unsupported volume or weight precision. |

## Metrics

**Business outcome metric:** Saved ****serviceable enquiries per week in Patna.

**Target:** 40 per week by end of week 6 of pilot.

**Floor:** 15 per week by end of week 2.

**Primary MVP product metric:** Quote-attempt conversion from quote_started to lead_saved.

**Target:** 55 percent by end of week 4.

**Baseline hypothesis:** ~35 percent

| **Metric** | **Definition** | **Target** | **Horizon** | **Source** |
| --- | --- | --- | --- | --- |
| **Serviceable saved enquiries per week** | Count of successfully saved enquiries within Patna delivery coverage, excluding tests and spam. | 40 per week | By pilot week 6 | Supabase, with operator serviceability qualification |
| **Median enquiry completion time** | Median time from quote_started to lead_saved for the same successfully saved quote attempt. | Under 2 minutes | By pilot week 4 | Mixpanel |
| **Started-to-saved conversion** | Successfully saved quote attempts ÷ started quote attempts. | 55% | By pilot week 4 | Mixpanel |
| **Saved-to-WhatsApp click rate** | Saved attempts with a WhatsApp click on the confirmation screen ÷ total saved attempts. | 60% | By pilot week 4 | Mixpanel |
| **First-contact response time** | Time from a saved enquiry to the first operator contact. | Under 30 minutes during staffed hours | By pilot week 2 | Manual pilot log; future first-contact timestamps |
| **Serviceable enquiry-to-delivery conversion** | Serviceable saved enquiries resulting in a verified completed delivery ÷ total serviceable saved enquiries in the same cohort. | 35%; approximately 14 eventual deliveries from 40 weekly enquiries | By pilot week 6 | Manual pilot log with delivery confirmation; future status history |
| **Contribution per fulfilled order** | Delivered price minus sand cost, transport cost, and any additional surcharge-related cost, without double-counting costs. | Positive per fulfilled order | From pilot week 2 | Manual pilot log with Digit Infra |
| **Repeat buying** | Buyers with multiple fulfilled purchases. | Baseline measurement only; no MVP target | Deferred | Future buyer linkage required |
| **Comparable-quote beat rate** | Comparable buyer quotes beaten ÷ total comparable quotes shared by buyers. | 70%+ | By pilot week 4 | Manual pilot log |

## Decision  at 4 week

| Started to Saved Conversion | Proposed next step |
| --- | --- |
| 55% or above | Target hit. Scope payment integration for week 5. |
| 35% to 55% | Above baseline, below target. Run 5 usability interviews with drop-offs, fix the top friction point, re-measure for 2 weeks. |
| 20% to 35%  | At or below baseline. Watch 10 session replays in Mixpanel, simplify the form before adding anything new. |
| Below 20% | Pause build. Revisit problem framing and market fit before deciding to revise or restart. |

## GTM Approach

The pilot will focus on Patna, with Digit Infra managing supply, enquiries, and delivery coordination. We will test three acquisition channels during weeks 3–6, with an initial performance review at the end of week 6.

| Channel | Planned activity | Measurement |
| --- | --- | --- |
| WhatsApp groups | Share the app link in five relevant Patna construction WhatsApp groups per week. | Link clicks, saved enquiries, and started-to-saved conversion by source. |
| On-site QR cards | Leave cards with a QR code at active construction sites during existing Digit Infra deliveries. | QR visits and saved enquiries attributed to the cards. |
| Google Business Profile | Add the app link to Digit Infra’s business profile to help local searchers access the quote flow. | Website visits and saved enquiries attributed to the profile. |

**Success criteria:** Generate **40 serviceable saved enquiries per week by week 6**, excluding tests, spam, and requests outside Patna delivery coverage. Achieve **55% started-to-saved conversion** and a **median enquiry completion time under 2 minutes by week 4**. Target **35% serviceable enquiry-to-delivery conversion by week 6**, equivalent to approximately **14 eventual deliveries from 40 weekly enquiries**

## Launch and Rollout Plan

A three-week staged rollout will validate internal workflows, collect buyer feedback, and prepare for broader acquisition. Public acquisition is blocked until the submission safeguards below are implemented and verified.

| Stage | Planned activities |
| --- | --- |
| Week 1: Internal soft launch | Limit access to the Digit Infra team. Submit 20 test enquiries, resolve admin workflow issues, and verify rate card accuracy. Exclude test enquiries from pilot metrics. |
| Week 2: Network launch | Invite 30 real buyers through Digit Infra’s existing network. Collect feedback through a three-question WhatsApp survey after enquiry submission. |
| Public-launch gate: Before Week 3 | Implement and verify server-side rate limiting, bot protection, and database-backed idempotency. Do not begin open acquisition until these controls pass testing. |
| Week 3: Open pilot begins, only after gate passes | Activate the three acquisition channels above. Track conversion by source and hold a daily check-in with the Digit Infra operator to review enquiry quality and follow-up issues. |

## Tech stack / build decisions

Built with Next.js 14 App Router and React 18, using JavaScript and custom CSS, with Supabase Postgres, Auth, and row-level security. The app supports English and Hindi through an in-app language toggle. Server-side API routes validate enquiries and calculate prices from saved rates. It’s hosted on Vercel, with Mixpanel, Vercel Analytics for analytics. The admin dashboard uses custom UI components.

## Open Issues and Mitigation Plan

| Severity | Issue / factor | What could go wrong | How to address it |
| --- | --- | --- | --- |
| Medium | Manual comparison of another seller’s quote | Buyers may interpret “We’ll try to beat it” as a guaranteed saving, or compare different quantities, materials, and delivery charges. | Explain that comparison is manual and subject to equivalent requirements. Record the competing quote and confirm the final delivered price before payment. No automatic price matching or refund guarantee is offered. Align English/Hindi messaging. |
| High | Approximate load capacity and material comparability | Published cft/load estimates may differ from delivered quantities because vehicle bodies, loading practices, and material conditions vary, causing misleading comparisons or delivery disputes. | Capacity capture and enquiry snapshots are implemented, but actual values still need confirmation by Digit Infra. Document the measurement basis and confirmation date in operating records; define acceptable variation and sand specifications. Keep unknown capacities explicitly unconfirmed. Match quantity, material, address, and included charges before comparing offers. |
| High | Public-launch submission safeguards | An unprotected endpoint can admit spam or excessive submissions, while retries can create duplicate enquiries and distort pilot metrics. | Treat tested server-side rate limiting, bot protection, and database-backed idempotency as blockers before the Week 3 open pilot. Verify protection and retry behavior before public acquisition; these controls remain required work. |
| Medium | Unverified market benchmark | Unsourced market prices or markup assumptions can create unsupported savings comparisons. | Record actual sources, dates, service areas, sand specifications, and included charges. Validate in pilot week 2; do not attribute figures to supplier conversations that have not been documented. |
| High | Manual lead follow-ups | Without ownership, first-contact timestamps, or status history, enquiries may go unanswered and conversion reporting may be unreliable. This directly threatens pilot outcomes. | Assign an owner, define staffed hours, and set a response-time target. Use a manual pilot log, then add timestamps, status history, qualification and outcome reasons, and delivery confirmation. |
| Medium | Indicative rates versus final delivered price | Buyers may mistake an indicative rate for a confirmed price or booking, although address, site access, unloading, and availability can affect the final cost. | Clearly label indicative prices and included charges. Require team confirmation of the delivered price and availability before customer commitment; clarify that submitting an enquiry does not reserve a delivery slot. |
| Medium | Quote requests without a vehicle or quantity | Staff may mistake the database’s placeholder quantity for the buyer’s actual request, causing incorrect quotes or reporting. | Highlight “Price to be confirmed” in the admin workflow. Clearly distinguish unknown quantities and exclude placeholder values from customer selections and quantity reporting. |
| Medium | Vehicle partner economics and trip volume | Lower payouts without sufficient additional trips could reduce driver earnings. Unsupported promises of daily work could damage partner trust. | Before activating the deferred partner model, run a small manual pilot. Agree on payouts, waiting terms, and payment schedules; compare earnings against costs. Avoid guaranteed-work claims until demand supports them. |