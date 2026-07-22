-- Add paid status to profiles
alter table public.profiles add column if not exists paid boolean not null default false;
alter table public.profiles add column if not exists paid_at timestamptz;
