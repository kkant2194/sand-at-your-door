# AGENTS.md

## Project

Sand At Your Door is a Next.js business app for Digit Infra Pvt LTD. It provides a public sand delivery page, English/Hindi language toggle, live daily pricing from Supabase, a quote form, WhatsApp handoff, and a separate Supabase-protected admin dashboard.

## Run Locally

```sh
cd /Users/krishnakant/sand-at-your-door
npm run dev
```

Public app:

```text
http://localhost:3000/
```

Admin app:

```text
http://localhost:3000/admin
```

## Important Files

- `app/page.jsx`: public bilingual app, quote form, price ticker, WhatsApp handoff.
- `app/admin/page.jsx`: admin dashboard for pricing and enquiry status.
- `app/api/queries/route.js`: server-side public enquiry insert using Supabase service role.
- `app/api/admin/bootstrap/route.js`: validates logged-in admins with `profiles.is_admin`.
- `lib/supabaseClient.js`: browser Supabase client.
- `supabase/schema.sql`: database tables, RLS policies, and seed pricing.
- `styles.css`: shared dark responsive UI styling.
- `app/globals.css`: Next-specific and admin-specific styling.

## Current Behavior

- Public navigation does not expose an admin link.
- Admins visit `/admin` directly.
- Admin access is controlled by `profiles.is_admin = true` in Supabase.
- Daily vehicle prices are stored in Supabase `pricing.rates`.
- Customer enquiries are inserted into Supabase `user_queries`.
- Public users do not need to log in.
- WhatsApp buttons use inline SVG icons.

## Environment

Required local and deployment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Do not commit `.env.local`.

## UI Guidelines

- Keep the app dark themed.
- Keep the public UI focused: hero, ticker, products, quote form, contact.
- Do not expose admin navigation to normal users.
- Keep admin dashboard English-only unless explicitly requested otherwise.
