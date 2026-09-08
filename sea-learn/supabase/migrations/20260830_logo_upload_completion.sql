-- Award Uplift completion when a learner has genuinely uploaded the logo
-- creation activity (chapter 3). This replaces the former rule that completed
-- every learner profile automatically.

drop trigger if exists complete_uplift_on_profile_created on public.profiles;

create or replace function public.sync_uplift_logo_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  learner_id uuid;
  uplift_course_id uuid;
  logo_uploaded_at timestamptz;
begin
  if tg_op = 'DELETE' then
    learner_id := old.user_id;
    if old.chapter_id <> 3 then return old; end if;
  else
    learner_id := new.user_id;
    if new.chapter_id <> 3 then return new; end if;
  end if;

  select id into uplift_course_id
  from public.courses
  where slug = 'uplift'
  limit 1;

  if uplift_course_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select min(submitted_at) into logo_uploaded_at
  from public.assignment_submissions
  where user_id = learner_id
    and chapter_id = 3
    and status = 'submitted'
    and nullif(btrim(file_url), '') is not null;

  if logo_uploaded_at is not null then
    insert into public.enrollments (user_id, course_id, enrolled_at, completed_at)
    values (learner_id, uplift_course_id, logo_uploaded_at, logo_uploaded_at)
    on conflict (user_id, course_id) do update
      set completed_at = excluded.completed_at;
  else
    update public.enrollments
    set completed_at = null,
        certificate_issued_at = null
    where user_id = learner_id
      and course_id = uplift_course_id;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists sync_uplift_logo_completion_on_submission on public.assignment_submissions;
create trigger sync_uplift_logo_completion_on_submission
  after insert or update or delete
  on public.assignment_submissions
  for each row
  execute function public.sync_uplift_logo_completion();

-- Recalculate existing Uplift enrolments and create completion records for
-- learners who uploaded a logo before this rule was introduced.
update public.enrollments as enrollment
set completed_at = (
      select min(submission.submitted_at)
      from public.assignment_submissions as submission
      where submission.user_id = enrollment.user_id
        and submission.chapter_id = 3
        and submission.status = 'submitted'
        and nullif(btrim(submission.file_url), '') is not null
    ),
    certificate_issued_at = case
      when exists (
        select 1
        from public.assignment_submissions as submission
        where submission.user_id = enrollment.user_id
          and submission.chapter_id = 3
          and submission.status = 'submitted'
          and nullif(btrim(submission.file_url), '') is not null
      ) then enrollment.certificate_issued_at
      else null
    end
where enrollment.course_id in (select id from public.courses where slug = 'uplift');

insert into public.enrollments (user_id, course_id, enrolled_at, completed_at)
select submission.user_id, course.id, min(submission.submitted_at), min(submission.submitted_at)
from public.assignment_submissions as submission
cross join public.courses as course
where course.slug = 'uplift'
  and submission.chapter_id = 3
  and submission.status = 'submitted'
  and nullif(btrim(submission.file_url), '') is not null
group by submission.user_id, course.id
on conflict (user_id, course_id) do update
  set completed_at = excluded.completed_at;

revoke execute on function public.sync_uplift_logo_completion() from public, anon, authenticated;
