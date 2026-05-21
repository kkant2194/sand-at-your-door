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
```

The anon key is safe for browser usage. The service role key must stay server-side only.

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

## Deployment

Recommended:

- App hosting: Vercel
- Auth/database: Supabase

Set the same environment variables in Vercel. Build command:

```sh
npm run build
```
