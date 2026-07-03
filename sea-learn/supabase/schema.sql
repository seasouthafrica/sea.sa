-- ============================================================
-- SEA LEARN — SUPABASE SCHEMA
-- Run this in the Supabase SQL editor on a fresh project.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  age_range text not null check (age_range in
    ('under_18','18_24','25_34','35_44','45_54','55_plus','prefer_not_to_say')),
  location text,
  education_level text check (education_level in
    ('no_schooling','some_primary','primary','some_secondary','matric',
     'certificate_diploma','degree_plus','prefer_not_to_say')),
  employment_status text check (employment_status in
    ('unemployed','employed','self_employed','student','prefer_not_to_say')),
  disability_status text check (disability_status in
    ('yes','no','prefer_not_to_say')),
  gender text check (gender in
    ('female','male','non_binary','other','prefer_not_to_say')),
  role text not null default 'learner' check (role in ('learner','admin','super_admin')),
  created_at timestamptz not null default now()
);

-- Auto-create profile row when a user signs up.
-- Demographic fields are passed in via supabase.auth.signUp({ options: { data: {...} } })
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, first_name, last_name, age_range, location,
    education_level, employment_status, disability_status, gender
  )
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'age_range',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'education_level',
    new.raw_user_meta_data->>'employment_status',
    new.raw_user_meta_data->>'disability_status',
    new.raw_user_meta_data->>'gender'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 2. COURSES / MODULES / LESSONS
-- ------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  published boolean not null default false,
  certificate_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index int not null default 0
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  type text not null check (type in ('video','pdf','slides')),
  content_url text not null,       -- YouTube URL, or Supabase Storage path for pdf/slides
  order_index int not null default 0,
  estimated_minutes int
);

-- ------------------------------------------------------------
-- 3. ENROLLMENTS
-- ------------------------------------------------------------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  certificate_issued_at timestamptz,
  unique (user_id, course_id)
);

-- ------------------------------------------------------------
-- 4. ACTIVITY EVENTS (core tracking table)
-- ------------------------------------------------------------
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  event_type text not null check (event_type in
    ('started','progress','completed','pdf_page_viewed')),
  progress_value int,               -- % for video, page number for pdf
  occurred_at timestamptz not null default now()
);

create index idx_activity_events_user on public.activity_events(user_id);
create index idx_activity_events_lesson on public.activity_events(lesson_id);

-- ------------------------------------------------------------
-- 5. QUIZ RESULTS (optional, for future assessments)
-- ------------------------------------------------------------
create table public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score int not null,
  max_score int not null,
  submitted_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. CERTIFICATES
-- ------------------------------------------------------------
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  issued_at timestamptz not null default now(),
  certificate_number text unique not null,
  unique (user_id, course_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.activity_events enable row level security;
alter table public.quiz_results enable row level security;
alter table public.certificates enable row level security;

-- Helper: is the current user an admin/super_admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','super_admin')
  );
$$ language sql security definer stable;

-- PROFILES: learners see/edit only their own row; admins see all.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- COURSES / MODULES / LESSONS: published content is publicly readable
-- (so the catalogue page can show course info before signup);
-- only admins can write.
create policy "courses_select_published_or_admin" on public.courses
  for select using (published = true or public.is_admin());
create policy "courses_write_admin_only" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

create policy "modules_select_all" on public.modules
  for select using (true);
create policy "modules_write_admin_only" on public.modules
  for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons_select_all" on public.lessons
  for select using (true);
create policy "lessons_write_admin_only" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- ENROLLMENTS: learners manage their own; admins see all.
create policy "enrollments_select_own_or_admin" on public.enrollments
  for select using (auth.uid() = user_id or public.is_admin());
create policy "enrollments_insert_own" on public.enrollments
  for insert with check (auth.uid() = user_id);
create policy "enrollments_update_own_or_admin" on public.enrollments
  for update using (auth.uid() = user_id or public.is_admin());

-- ACTIVITY EVENTS: learners insert/read their own; admins read all.
-- No update/delete policy on purpose — events are an append-only log.
create policy "activity_select_own_or_admin" on public.activity_events
  for select using (auth.uid() = user_id or public.is_admin());
create policy "activity_insert_own" on public.activity_events
  for insert with check (auth.uid() = user_id);

-- QUIZ RESULTS: same pattern as activity events.
create policy "quiz_select_own_or_admin" on public.quiz_results
  for select using (auth.uid() = user_id or public.is_admin());
create policy "quiz_insert_own" on public.quiz_results
  for insert with check (auth.uid() = user_id);

-- CERTIFICATES: learners read their own; only admins/backend issue them.
create policy "certificates_select_own_or_admin" on public.certificates
  for select using (auth.uid() = user_id or public.is_admin());
create policy "certificates_write_admin_only" on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- SEED: the Uplift course shell (edit/add lessons via admin UI later)
-- ============================================================
insert into public.courses (title, slug, description, published, certificate_enabled)
values ('Uplift', 'uplift', 'The first course on SEA Learn.', false, true);
