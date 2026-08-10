-- Add new registration fields to profiles table.
-- Run this in the Supabase SQL editor.

-- New columns
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists province text;
alter table public.profiles add column if not exists ethnicity text;
alter table public.profiles add column if not exists referral_channel text;
alter table public.profiles add column if not exists referral_other text;

-- Relax the location column (no longer required — replaced by country + province)
alter table public.profiles alter column location drop not null;

-- Widen gender constraint to accept new options
alter table public.profiles drop constraint if exists profiles_gender_check;
alter table public.profiles add constraint profiles_gender_check
  check (gender in ('female', 'male', 'non_binary', 'other', 'prefer_not_to_say'));

-- Widen age_range constraint for the new labels
alter table public.profiles drop constraint if exists profiles_age_range_check;
alter table public.profiles add constraint profiles_age_range_check
  check (age_range in (
    'under_18', '18_24', '25_34', '35_44', '45_54', '55_plus',
    'under 18', '18–24', '25–34', '35–44', '45–54', '55+',
    'prefer_not_to_say'
  ));

-- Update the trigger to capture all new fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, first_name, last_name, age_range, location,
    education_level, employment_status, disability_status, gender,
    country, phone, province, ethnicity, referral_channel, referral_other
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
    new.raw_user_meta_data->>'referral_other'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Preserve the restricted profile-update model while allowing users to edit
-- the newly introduced non-privileged fields in future profile screens.
grant update (
  country, phone, province, ethnicity, referral_channel, referral_other
) on table public.profiles to authenticated;
