-- Only trusted server credentials may grant admin privileges.
revoke insert, update on public.profiles from anon, authenticated;
grant update (full_name, phone, address) on public.profiles to authenticated;
drop policy if exists "profiles_insert_own" on public.profiles;
-- New profiles are created by the auth trigger or the server bootstrap.
