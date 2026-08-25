-- Add SA ID / passport number to profiles.
-- Run this in the Supabase SQL editor.

alter table public.profiles add column if not exists id_number text;

-- Update the trigger to capture id_number on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, first_name, last_name, age_range, location,
    education_level, employment_status, disability_status, gender,
    country, phone, province, ethnicity, referral_channel, referral_other,
    id_number
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
    new.raw_user_meta_data->>'id_number'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Allow authenticated users to update their own id_number
grant update (id_number) on table public.profiles to authenticated;
