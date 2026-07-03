# SEA Learn — Starter Scaffold

## Setup

1. Create a new Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor. This creates every
   table, the `handle_new_user` trigger, and all RLS policies.
3. Copy `.env.example` to `.env` and fill in your project's URL + anon key
   (Supabase project settings → API).
4. `npm install`
5. `npm run dev`

## Granting admin access (multiple SEA team members)

By default every new sign-up gets `role = 'learner'`. To make someone an
admin, run this in the Supabase SQL editor once their profile exists:

```sql
update public.profiles set role = 'admin' where id = '<their-user-uuid>';
```

`super_admin` is reserved for you if you later want a tier that can promote
other admins from within the app itself (not built yet — currently that's a
manual SQL step).

## Adding Uplift's content

The `courses` table already has an `Uplift` row (unpublished). To populate it:

1. Insert rows into `modules` for `course_id` = the Uplift course id.
2. Insert `lessons` rows under each module:
   - `type = 'video'`, `content_url` = full YouTube URL
   - `type = 'pdf'` or `'slides'`, `content_url` = a public Supabase Storage
     URL (upload PDFs/slide exports to a Storage bucket first)
3. Set `courses.published = true` once content is ready to go live.

This is currently a manual/SQL step — a proper "Add Lesson" admin UI is the
natural next build phase once the core tracking flow is confirmed working.

## What's stubbed vs. what's real here

**Working:**
- Sign-up with all demographic fields → Supabase Auth + `profiles` trigger
- Login/logout
- RLS: learners see only their own data, admins see everyone's
- Video progress tracking (YouTube IFrame API, 25/50/75/100% milestones)
- PDF/slide page-view tracking
- Admin overview charts (gender, age, employment, education)
- Admin learner table with CSV export
- Admin learner drill-down with activity timeline

**Not yet built (next phases, per the development plan):**
- Certificate generation/issuing on course completion
- Admin "Add/Edit Lesson" UI (currently via SQL)
- PDF summary report export (one-pager for funders)
- Learner-facing % complete calculation from `activity_events`
  (currently a placeholder 0% bar on the dashboard)
- Password reset flow UI
