import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import VideoLesson from '../components/VideoLesson.jsx';
import PdfLesson from '../components/PdfLesson.jsx';

export default function CoursePlayer() {
  const { courseSlug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('slug', courseSlug)
        .single();
      if (courseError || !courseData) {
        if (!cancelled) setError(courseError?.message || 'Course not found.');
        return;
      }

      const [{ data: modules, error: modulesError }, { data: completedEvents }] = await Promise.all([
        supabase
        .from('modules')
        .select('id, title, order_index, lessons(id, title, type, content_url, order_index)')
        .eq('course_id', courseData.id)
        .order('order_index'),
        supabase
          .from('activity_events')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('event_type', 'completed'),
      ]);

      if (cancelled) return;
      if (modulesError) {
        setError(modulesError.message);
        return;
      }

      const flatLessons = (modules ?? []).flatMap((m) =>
        (m.lessons ?? [])
          .slice()
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map((lesson) => ({ ...lesson, moduleTitle: m.title }))
      );
      setCourse(courseData);
      setLessons(flatLessons);
      setActiveLesson(flatLessons[0] ?? null);
      setCompletedIds(new Set((completedEvents ?? []).map((event) => event.lesson_id)));

      const { error: enrollmentError } = await supabase.from('enrollments').upsert(
        { user_id: user.id, course_id: courseData.id },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true }
      );
      if (!cancelled && enrollmentError) setError(enrollmentError.message);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [courseSlug, user.id]);

  const progress = useMemo(
    () => (lessons.length ? Math.round((lessons.filter((lesson) => completedIds.has(lesson.id)).length / lessons.length) * 100) : 0),
    [completedIds, lessons]
  );

  const handleLessonComplete = useCallback(async (lessonId) => {
    if (completedIds.has(lessonId)) return;

    setCompletedIds((current) => {
      const next = new Set(current);
      next.add(lessonId);
      return next;
    });

    if (!course) return;
    const completedCount = lessons.filter(
      (lesson) => lesson.id === lessonId || completedIds.has(lesson.id)
    ).length;
    if (lessons.length && completedCount >= lessons.length) {
      const { error: completionError } = await supabase
        .from('enrollments')
        .update({ completed_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('course_id', course.id);
      if (completionError) setError(completionError.message);
    }
  }, [completedIds, course, lessons.length, user.id]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full border-b p-4 md:w-72 md:border-b-0 md:border-r">
        <h1 className="text-xl font-bold">{course?.title || 'Course'}</h1>
        <div className="my-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-sea-teal transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mb-4 text-sm font-semibold text-gray-600">{progress}% complete</p>
        <h2 className="mb-3 font-semibold">Lessons</h2>
        <div className="space-y-1">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => setActiveLesson(lesson)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              activeLesson?.id === lesson.id ? 'bg-sea-teal text-white' : 'hover:bg-gray-100'
            }`}
          >
            <span aria-hidden="true">{completedIds.has(lesson.id) ? '✓ ' : ''}</span>{lesson.title}
          </button>
        ))}
        </div>
      </aside>

      <main className="flex-1 p-6">
        {error && <p className="mb-5 rounded-lg bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
        {activeLesson && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-sea-teal">{activeLesson.moduleTitle}</p>
            <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
          </div>
        )}
        {activeLesson?.type === 'video' && (
          <VideoLesson lesson={activeLesson} userId={user.id} onComplete={handleLessonComplete} />
        )}
        {(activeLesson?.type === 'pdf' || activeLesson?.type === 'slides') && (
          <PdfLesson lesson={activeLesson} userId={user.id} onComplete={handleLessonComplete} />
        )}
        {!activeLesson && !error && <p className="text-gray-500">This course does not have any lessons yet.</p>}
      </main>
    </div>
  );
}
