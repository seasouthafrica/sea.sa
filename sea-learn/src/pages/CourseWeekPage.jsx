import { useEffect, useState } from 'react';
import Flipbook from '../components/Flipbook.jsx';
import { supabase } from '../lib/supabaseClient.js';

function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default function CourseWeekPage({ course }) {
  const [presentationUrl, setPresentationUrl] = useState(course.presentationUrl);

  useEffect(() => {
    if (course.presentationUrl || !course.courseSlug) return;
    let cancelled = false;

    async function loadUploadedPresentation() {
      const { data: courseRow } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', course.courseSlug)
        .single();

      if (!courseRow) return;

      const { data: modules } = await supabase
        .from('modules')
        .select('id, order_index, lessons(id, title, type, content_url, order_index)')
        .eq('course_id', courseRow.id)
        .order('order_index', { ascending: true });

      const lessons = (modules ?? [])
        .flatMap((module) => module.lessons ?? [])
        .filter((lesson) => lesson.type === 'pdf' || lesson.type === 'slides')
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

      const weekMatch = lessons.find((lesson) =>
        lesson.title?.toLowerCase().includes(`week ${course.weekNumber}`)
      );

      if (!cancelled) setPresentationUrl((weekMatch ?? lessons[0])?.content_url ?? '');
    }

    loadUploadedPresentation();
    return () => {
      cancelled = true;
    };
  }, [course.courseSlug, course.presentationUrl, course.weekNumber]);

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-white via-cyan-50 to-emerald-50">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
          <div className="mb-8 max-w-4xl">
            <p className="mb-3 inline-flex rounded-full bg-sea-teal/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-sea-teal">
              Week {course.weekNumber}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {course.programmeTitle}
            </h1>
            <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-700 sm:text-3xl">
              Week {course.weekNumber}: {course.weekTitle}
            </h2>
          </div>

          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-300/80 ring-1 ring-slate-200 sm:rounded-3xl">
            <div className="relative aspect-[16/9] w-full min-h-[180px] max-h-[72vh]">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={getYouTubeEmbedUrl(course.videoUrl)}
                title={`${course.programmeTitle} Week ${course.weekNumber} opening video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_360px] lg:py-14">
        <article className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 sm:p-8">
          <h2 className="text-3xl font-black text-slate-950">
            Week {course.weekNumber}: {course.weekTitle}
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-slate-700">
            {course.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg shadow-slate-200/70">
          <h3 className="text-xl font-black">Learning Outcomes</h3>
          <p className="mt-2 text-sm leading-6 text-cyan-100">
            By the end of this week, participants will be able to:
          </p>
          <ul className="mt-5 space-y-3">
            {course.learningOutcomes.map((outcome) => (
              <li key={outcome} className="flex gap-3 text-sm leading-6">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sea-teal text-white" aria-hidden="true">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                    <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:pb-20">
        <Flipbook
          fileUrl={presentationUrl}
          storageKey={`course-week-${course.programmeTitle}-${course.weekNumber}-page`}
          title={`Week ${course.weekNumber}: ${course.weekTitle}`}
        />
      </section>
    </main>
  );
}
