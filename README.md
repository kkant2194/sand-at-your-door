# Sand At Your Door

Production-ready enquiry and admin pricing app for Digit Infra Pvt LTD, built with Next.js and Supabase.

## Stack

- Next.js App Router
- React
- Supabase Auth for admin login
- Supabase Postgres with Row Level Security
- Server-side Supabase service role for public enquiry saving
- Vercel or Render for deployment

## Local Setup

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-server-api
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-project-id
NEXT_PUBLIC_ENABLE_CLARITY_ON_LOCALHOST=false
```

The anon key is safe for browser usage. The service role key must stay server-side only.
The Clarity project ID is safe for browser usage. Keep localhost tracking disabled unless you are testing analytics.

## Microsoft Clarity

1. Create a project at `https://clarity.microsoft.com`.
2. Copy the Clarity project ID from the tracking code.
3. Add it to `.env.local`:

```env
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-project-id
NEXT_PUBLIC_ENABLE_CLARITY_ON_LOCALHOST=false
```

4. Add the same values in your deployment provider environment variables.

The script loads after the page becomes interactive and is skipped on `localhost` by default.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create admin users in Supabase Auth.
4. Mark each admin user with `is_admin = true`:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'owner@example.com');
```

Replace `owner@example.com` with the admin email. Repeat this for every admin user.

## Features

- Public website with English/Hindi toggle
- Public quote form without customer login
- Enquiries saved through a server API
- WhatsApp notification flow
- Separate hidden `/admin` portal
- Admin access based on `profiles.is_admin = true`
- No public admin link and no admin signup
- Admin enquiry list with status updates
- Admin vehicle management with wheel count and daily price
- Daily pricing stored in Supabase
- Public contact phone and email stored in Supabase and editable from admin settings

## Deployment

Recommended:

- App hosting: Vercel
- Auth/database: Supabase

Set the same environment variables in Vercel. Build command:

```sh
npm run build
```

## Security migration for existing databases

Run `supabase/migrations/20261001_protect_admin_privileges.sql` in the Supabase SQL editor before launch. This prevents authenticated users from inserting profiles with admin privileges or updating `is_admin`. New profiles still come from the auth trigger and server bootstrap. Verify that a non-admin cannot update `is_admin` through the Data API, and that approved admins can still edit prices.

Enquiry prices are calculated server-side using the latest effective pricing in India time. Saved enquiries return a reference; customers explicitly click WhatsApp to send the saved details. Failed saves preserve their input. Rate limiting, bot protection and database-backed idempotency remain required before a public launch.

Admins can edit the same-day surcharge under Website settings. It is stored as `site_settings.same_day_surcharge` and applied once per same-day enquiry. Existing databases need no schema change: saving settings creates the key. Missing configuration defaults to ₹500; zero disables the surcharge. Refresh the public page after changing settings.

## Funnel analytics

Mixpanel setup, production environment variables, event definitions and report instructions are in [docs/mixpanel-setup.md](docs/mixpanel-setup.md). Run `node --test tests/quoteAnalytics.test.mjs` to verify milestone ordering and privacy filtering. Development uses `.next-dev`; production builds use `.next` so they do not overwrite each other.
