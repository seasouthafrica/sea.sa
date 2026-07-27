-- SEA Learn LMS upgrade: protect draft curricula and speed up progress queries.
-- Run once in the Supabase SQL editor on an existing SEA Learn project.

drop policy if exists "modules_select_all" on public.modules;
drop policy if exists "modules_select_published_or_admin" on public.modules;
create policy "modules_select_published_or_admin" on public.modules
  for select using (
    public.is_admin() or (
      auth.uid() is not null and exists (
        select 1 from public.courses
        where courses.id = modules.course_id and courses.published = true
      )
    )
  );

drop policy if exists "lessons_select_all" on public.lessons;
drop policy if exists "lessons_select_published_or_admin" on public.lessons;
create policy "lessons_select_published_or_admin" on public.lessons
  for select using (
    public.is_admin() or (
      auth.uid() is not null and exists (
        select 1 from public.modules
        join public.courses on courses.id = modules.course_id
        where modules.id = lessons.module_id and courses.published = true
      )
    )
  );

create index if not exists idx_modules_course_order
  on public.modules(course_id, order_index);

create index if not exists idx_lessons_module_order
  on public.lessons(module_id, order_index);

create index if not exists idx_activity_events_completion
  on public.activity_events(user_id, event_type, lesson_id);
