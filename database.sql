-- ─────────────────────────────────────────────────────────────
-- SEA South Africa — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────


-- ── 1. SUBSCRIBERS ────────────────────────────────────────────
create table if not exists subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz default now()
);

-- Allow anyone to subscribe (insert only, no read access)
alter table subscribers enable row level security;

create policy "Anyone can subscribe"
  on subscribers for insert
  with check (true);


-- ── 2. NEWS ───────────────────────────────────────────────────
create table if not exists news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  excerpt      text,
  content      text,
  image_url    text,
  url          text,
  published_at timestamptz default now(),
  created_at   timestamptz default now()
);

-- Public read access
alter table news enable row level security;

create policy "Anyone can read news"
  on news for select
  using (true);


-- ── 3. PROGRAMMES ─────────────────────────────────────────────
create table if not exists programmes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  image_url   text,
  url         text,
  sort_order  int default 0,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- Public read access
alter table programmes enable row level security;

create policy "Anyone can read programmes"
  on programmes for select
  using (active = true);


-- ── 4. CONTACT ENQUIRIES ──────────────────────────────────────
create table if not exists contact_enquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  organisation text,
  email        text not null,
  message      text not null,
  status       text default 'new',   -- new | read | replied
  created_at   timestamptz default now()
);

-- Anyone can submit, nobody can read via client
alter table contact_enquiries enable row level security;

create policy "Anyone can submit enquiry"
  on contact_enquiries for insert
  with check (true);


-- ─────────────────────────────────────────────────────────────
-- SAMPLE DATA — delete or edit before going live
-- ─────────────────────────────────────────────────────────────

insert into news (title, excerpt, image_url, url, published_at) values
(
  'Social Enterprise Connect - Meet like-minded people at events',
  'Social Enterprise Connect (SEC) is an exciting new Community of Practice (CoP) for social entrepreneurs in South Africa.',
  null,
  '#',
  now() - interval '2 days'
),
(
  'Learner Spotlight: Meet creative impact maker Sikelela',
  'Impact Makers and Creators is an ambitious programme working with ideation-and-growth-stage creative social entrepreneurs.',
  null,
  '#',
  now() - interval '7 days'
),
(
  'Social Enterprise Schools Programme Pitching Event',
  'Our Social Enterprise in Education Programme gives learners the opportunity to pitch the social enterprises they started at their schools.',
  null,
  '#',
  now() - interval '14 days'
);

insert into programmes (title, description, image_url, url, sort_order) values
(
  'Young people and unemployed youth',
  'We empower young people in South Africa who have a desire to see positive change locally and globally, both in and outside of education.',
  null,
  '#',
  1
),
(
  'Social entrepreneurs through Social Enterprise Connect CoP',
  'Our facilitator-led learning and development programmes offer a dynamic space to connect with other changemakers and effect social change.',
  null,
  '#',
  2
),
(
  'International Student Internship Programme: Social Innovation',
  'We empower young people in South Africa who have a desire to see positive change locally and globally, both in and outside of education.',
  null,
  '#',
  3
);
