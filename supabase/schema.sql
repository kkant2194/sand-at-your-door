create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  address text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing (
  id uuid primary key default gen_random_uuid(),
  price_date date not null unique,
  rates jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  address text not null,
  sand_type text not null,
  quantity integer not null check (quantity > 0),
  unit text not null,
  unit_label text,
  delivery text not null,
  schedule_date date,
  schedule_time time,
  notes text,
  total numeric not null default 0,
  rate numeric not null default 0,
  price_date date,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.user_queries alter column user_id drop not null;

alter table public.profiles enable row level security;
alter table public.pricing enable row level security;
alter table public.site_settings enable row level security;
alter table public.user_queries enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "pricing_public_read" on public.pricing;
create policy "pricing_public_read"
on public.pricing for select
to anon, authenticated
using (true);

drop policy if exists "pricing_admin_insert" on public.pricing;
create policy "pricing_admin_insert"
on public.pricing for insert
to authenticated
with check (public.is_admin());

drop policy if exists "pricing_admin_update" on public.pricing;
create policy "pricing_admin_update"
on public.pricing for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "site_settings_admin_insert" on public.site_settings;
create policy "site_settings_admin_insert"
on public.site_settings for insert
to authenticated
with check (public.is_admin());

drop policy if exists "site_settings_admin_update" on public.site_settings;
create policy "site_settings_admin_update"
on public.site_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "queries_select_own_or_admin" on public.user_queries;
create policy "queries_select_own_or_admin"
on public.user_queries for select
to authenticated
using ((user_id is not null and user_id = auth.uid()) or public.is_admin());

drop policy if exists "queries_insert_own" on public.user_queries;
create policy "queries_insert_own"
on public.user_queries for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "queries_admin_update" on public.user_queries;
create policy "queries_admin_update"
on public.user_queries for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.pricing (price_date, rates)
values (
  current_date,
  '{"vehicles":[{"id":"tractor","name":"Tractor load","wheels":2,"price":4200},{"id":"truck6","name":"6-wheel truck","wheels":6,"price":12500},{"id":"truck10","name":"10-wheel truck","wheels":10,"price":18500},{"id":"truck12","name":"12-wheel truck","wheels":12,"price":22500},{"id":"truck16","name":"16-wheel truck","wheels":16,"price":29500}]}'::jsonb
)
on conflict (price_date) do nothing;

insert into public.site_settings (key, value)
values ('contact_phone', '917259987874')
on conflict (key) do nothing;

insert into public.site_settings (key, value)
values ('contact_email', 'digitInfra@gmail.com')
on conflict (key) do nothing;

-- After an admin user exists in Supabase Auth, run this for each admin:
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'owner@example.com');

-- Only trusted server credentials may grant admin privileges.
revoke insert, update on public.profiles from anon, authenticated;
grant update (full_name, phone, address) on public.profiles to authenticated;
drop policy if exists "profiles_insert_own" on public.profiles;
-- New profiles are created by the auth trigger or the server bootstrap.
