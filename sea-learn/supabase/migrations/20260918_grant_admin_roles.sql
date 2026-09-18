-- Admin login was refused for every SEA team account.
--
-- The browser used to promote admins itself, by writing profiles.role. The
-- security-hardening migration revoked update on public.profiles and re-granted
-- a fixed column list that deliberately excludes `role`, so that write has been
-- denied ever since. Granting the role is a trusted SQL action, so set it here.
--
-- Run this in the Supabase SQL editor for the SEA Learn project.

update public.profiles as p
set role = 'admin'
from auth.users as u
where u.id = p.id
  and lower(btrim(u.email)) in (
    'lungi09@gmail.com',
    'seasa@gmail.com',
    'ntoyantosabele@gmail.com',
    'sabele@socialenterprise.academy'
  )
  and coalesce(p.role, '') not in ('admin', 'super_admin');

-- Confirm the result — each listed address should come back with role 'admin'.
select u.email, p.role
from public.profiles as p
join auth.users as u on u.id = p.id
where lower(btrim(u.email)) in (
  'lungi09@gmail.com',
  'seasa@gmail.com',
  'ntoyantosabele@gmail.com',
  'sabele@socialenterprise.academy'
);

-- A signed-in admin whose profile row is missing entirely would also be refused.
-- This lists any auth user that never got a profile row from the signup trigger.
select u.id, u.email
from auth.users as u
left join public.profiles as p on p.id = u.id
where p.id is null;
