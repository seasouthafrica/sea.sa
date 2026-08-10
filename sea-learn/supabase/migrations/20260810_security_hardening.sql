-- SEA Learn deployment security hardening.
-- Apply this migration to every existing Supabase project before deployment.

-- Prevent authenticated browser clients from changing authorization or
-- payment state. Admin promotion remains a trusted SQL/service-role action.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

revoke update on table public.profiles from authenticated;
grant update (
  first_name, last_name, age_range, location, education_level,
  employment_status, disability_status, gender,
  country, phone, province, ethnicity, referral_channel, referral_other
) on table public.profiles to authenticated;

-- Learners may submit their own work, but cannot self-approve it or write
-- reviewer-only fields. Admins retain review access.
drop policy if exists "submissions_insert_own" on public.assignment_submissions;
drop policy if exists "submissions_update_own_or_admin" on public.assignment_submissions;
drop policy if exists "submissions_update_own" on public.assignment_submissions;
drop policy if exists "submissions_update_admin" on public.assignment_submissions;

create policy "submissions_insert_own" on public.assignment_submissions
  for insert with check (
    auth.uid() = user_id
    and status in ('draft', 'submitted')
    and reviewed_at is null
    and reviewer_notes is null
  );

create policy "submissions_update_own" on public.assignment_submissions
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and status in ('draft', 'submitted')
    and reviewed_at is null
    and reviewer_notes is null
  );

create policy "submissions_update_admin" on public.assignment_submissions
  for update using (public.is_admin()) with check (public.is_admin());

-- Security-definer helpers must not inherit an attacker-controlled search path.
alter function public.is_admin() set search_path = '';

-- Provision the assignment bucket consistently and reject active SVG content.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assignments',
  'assignments',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "assignment_files_insert_own" on storage.objects;
create policy "assignment_files_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'assignments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "assignment_files_update_own" on storage.objects;
create policy "assignment_files_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'assignments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[2] = auth.uid()::text
    )
  )
  with check (
    bucket_id = 'assignments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[2] = auth.uid()::text
    )
  );

drop policy if exists "assignment_files_select_own_or_admin" on storage.objects;
create policy "assignment_files_select_own_or_admin" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'assignments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (storage.foldername(name))[2] = auth.uid()::text
      or public.is_admin()
    )
  );
