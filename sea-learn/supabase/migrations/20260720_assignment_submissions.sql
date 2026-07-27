-- Assignment submissions for Uplift course chapters 3 & 4.
-- Run this in the Supabase SQL editor.

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id int not null,
  youtube_url text,
  file_url text,
  explanation text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewed')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

create index if not exists idx_assignment_submissions_user on public.assignment_submissions(user_id);
create index if not exists idx_assignment_submissions_chapter on public.assignment_submissions(chapter_id);

alter table public.assignment_submissions enable row level security;

-- Learners manage their own submissions; admins see all.
create policy "submissions_select_own_or_admin" on public.assignment_submissions
  for select using (auth.uid() = user_id or public.is_admin());

create policy "submissions_insert_own" on public.assignment_submissions
  for insert with check (auth.uid() = user_id);

create policy "submissions_update_own_or_admin" on public.assignment_submissions
  for update using (auth.uid() = user_id or public.is_admin());

-- Create a storage bucket for assignment file uploads (logos etc.)
-- NOTE: If the bucket already exists this will error harmlessly.
-- You may need to create it manually in the Supabase dashboard:
--   Storage > New bucket > name: "assignments", public: true
-- Then add a policy allowing authenticated users to upload to their own folder.

-- Update gender constraint to allow only male/female for new registrations.
-- Existing rows with other values are preserved.
alter table public.profiles drop constraint if exists profiles_gender_check;
alter table public.profiles add constraint profiles_gender_check
  check (gender in ('female', 'male'));
