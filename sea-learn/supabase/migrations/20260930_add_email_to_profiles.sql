-- Mirror the account email onto profiles so the admin learner export can show it.
-- Run this in the Supabase SQL editor.
--
-- Why a mirror rather than a join: auth.users is not exposed through PostgREST,
-- and reading it needs the service-role key, which can never ship in a browser
-- bundle. Copying the address onto profiles at signup — the same way first_name
-- and phone already arrive — keeps the admin screens on the anon key.

alter table public.profiles add column if not exists email text;

-- Backfill the learners who registered before this column existed.
update public.profiles as p
set email = u.email
from auth.users as u
where u.id = p.id
  and p.email is distinct from u.email;

-- Keep it in step from now on. Mirrors 20260825_add_id_number.sql, plus email,
-- which comes off the auth record itself rather than out of the signup metadata.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, first_name, last_name, age_range, location,
    education_level, employment_status, disability_status, gender,
    country, phone, province, ethnicity, referral_channel, referral_other,
    id_number, email
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'age_range', 'prefer_not_to_say'),
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'education_level',
    new.raw_user_meta_data->>'employment_status',
    new.raw_user_meta_data->>'disability_status',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'province',
    new.raw_user_meta_data->>'ethnicity',
    new.raw_user_meta_data->>'referral_channel',
    new.raw_user_meta_data->>'referral_other',
    new.raw_user_meta_data->>'id_number',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- An address change still has to go through Supabase Auth, so the mirror is
-- deliberately not granted to `authenticated` for update — unlike phone or
-- province, a learner cannot edit this one directly.

-- Verification: every row below should report 0 once the backfill has run.
-- select count(*) as profiles_missing_email from public.profiles where email is null;
