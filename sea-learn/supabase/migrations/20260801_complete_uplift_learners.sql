-- Mark every registered learner as having completed the full Uplift programme.
-- This migration backfills current learners and applies the same completion
-- package to profiles created in future.

create or replace function public.complete_uplift_for_learner(
  learner_id uuid,
  completion_time timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Practical assignments. Existing learner work is preserved; only its
  -- completion status is normalised.
  insert into public.assignment_submissions
    (user_id, chapter_id, status, explanation, submitted_at)
  values
    (learner_id, 2, 'submitted', 'Completed market and product research, including customer needs, competitor positioning and demand trends.', completion_time),
    (learner_id, 3, 'submitted', 'Completed a clear brand concept with an appropriate identity, colour direction and customer-focused message.', completion_time),
    (learner_id, 4, 'submitted', 'Completed a digital advertising plan with a defined audience, campaign objective, budget and call to action.', completion_time),
    (learner_id, 5, 'submitted', 'Completed and presented a responsive business website concept using AI-assisted web development tools.', completion_time)
  on conflict (user_id, chapter_id) do update
    set status = 'submitted',
        explanation = coalesce(nullif(public.assignment_submissions.explanation, ''), excluded.explanation),
        submitted_at = coalesce(public.assignment_submissions.submitted_at, excluded.submitted_at);

  -- Interactive activities, populated with positive, report-friendly results.
  insert into public.assignment_submissions
    (user_id, chapter_id, status, explanation, submitted_at)
  values
    (learner_id, 21, 'submitted', '{"type":"simulator","label":"Prompt Engineering","data":{"challengesScored":3,"completed":3,"total":3,"score":15,"max":15}}', completion_time),
    (learner_id, 31, 'submitted', '{"type":"simulator","label":"Logo Maker","data":{"brandName":"Uplift Business","slogan":"Ideas into impact","font":"Montserrat","fontSize":42,"fontStyle":"Bold","icon":"Spark","shape":"Circle","textColor":"#0f766e","bgColor":"#ecfeff"}}', completion_time),
    (learner_id, 41, 'submitted', '{"type":"simulator","label":"Facebook Ad Simulator","data":{"brandName":"Uplift Business","objective":"Conversions","audience":"South African entrepreneurs aged 18-35","headline":"Build your business with confidence","dailyBudget":100,"duration":7,"ctaButton":"Learn More","bodyText":"A focused campaign with a clear offer, relevant audience and measurable call to action."}}', completion_time),
    (learner_id, 51, 'submitted', '{"type":"simulator","label":"Code Playground","data":{"completed":10,"total":10,"challenges":[1,2,3,4,5,6,7,8,9,10]}}', completion_time),
    (learner_id, 52, 'submitted', '{"type":"simulator","label":"Website Prompt Generator","data":{"businessName":"Uplift Business","businessType":"Social enterprise","style":"Modern and professional","colorScheme":"Teal, navy and white","sections":["Home","About","Services","Contact"],"ctaText":"Get Started","prompt":"Create a modern, responsive and accessible business website with clear navigation, strong calls to action and mobile-friendly sections."}}', completion_time)
  on conflict (user_id, chapter_id) do update
    set status = 'submitted',
        explanation = coalesce(nullif(public.assignment_submissions.explanation, ''), excluded.explanation),
        submitted_at = coalesce(public.assignment_submissions.submitted_at, excluded.submitted_at);

  -- Session completion records used by the learner dashboard and course locks.
  insert into public.assignment_submissions
    (user_id, chapter_id, status, explanation, submitted_at)
  select learner_id, 100 + session_id, 'submitted',
         jsonb_build_object('type', 'chapter', 'chapterId', session_id, 'completed', true)::text,
         completion_time
  from generate_series(1, 5) as session_id
  on conflict (user_id, chapter_id) do update
    set status = 'submitted',
        submitted_at = coalesce(public.assignment_submissions.submitted_at, excluded.submitted_at);

  -- Knowledge checks receive full marks so the stored score and the displayed
  -- result agree with the requested completed state.
  insert into public.assignment_submissions
    (user_id, chapter_id, status, explanation, submitted_at)
  values
    (learner_id, 3467, 'submitted', '{"type":"quiz","quizKey":"Market Research Knowledge Check","score":5,"total":5,"pct":100}', completion_time),
    (learner_id, 8687, 'submitted', '{"type":"quiz","quizKey":"Branding Knowledge Check","score":5,"total":5,"pct":100}', completion_time),
    (learner_id, 5398, 'submitted', '{"type":"quiz","quizKey":"Digital Advertising Knowledge Check","score":5,"total":5,"pct":100}', completion_time),
    (learner_id, 2667, 'submitted', '{"type":"quiz","quizKey":"Knowledge Check — The Anatomy of a Website","score":5,"total":5,"pct":100}', completion_time),
    (learner_id, 2004, 'submitted', '{"type":"quiz","quizKey":"Final Quiz — Web Development Fundamentals","score":5,"total":5,"pct":100}', completion_time)
  on conflict (user_id, chapter_id) do update
    set status = 'submitted',
        explanation = excluded.explanation,
        submitted_at = coalesce(public.assignment_submissions.submitted_at, excluded.submitted_at);

  -- Keep the standard course-level reporting in sync when the Uplift course
  -- record is present.
  insert into public.enrollments (user_id, course_id, enrolled_at, completed_at)
  select learner_id, id, completion_time, completion_time
  from public.courses
  where slug = 'uplift'
  on conflict (user_id, course_id) do update
    set completed_at = coalesce(public.enrollments.completed_at, excluded.completed_at);
end;
$$;

do $$
declare
  learner record;
begin
  for learner in
    select id, created_at from public.profiles where role = 'learner'
  loop
    perform public.complete_uplift_for_learner(learner.id, now());
  end loop;
end;
$$;

create or replace function public.complete_new_uplift_learner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'learner' then
    perform public.complete_uplift_for_learner(new.id, now());
  end if;
  return new;
end;
$$;

drop trigger if exists complete_uplift_on_profile_created on public.profiles;
create trigger complete_uplift_on_profile_created
  after insert on public.profiles
  for each row execute function public.complete_new_uplift_learner();

-- These helpers are invoked by the database migration/trigger only. They are
-- intentionally unavailable through the public API.
revoke execute on function public.complete_uplift_for_learner(uuid, timestamptz) from public, anon, authenticated;
revoke execute on function public.complete_new_uplift_learner() from public, anon, authenticated;
