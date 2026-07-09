import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import VideoLesson from '../components/VideoLesson.jsx';
import PdfLesson from '../components/PdfLesson.jsx';

export default function CoursePlayer() {
  const { courseSlug } = useParams();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', courseSlug)
        .single();
      if (!course) return;

      const { data: modules } = await supabase
        .from('modules')
        .select('id, title, order_index, lessons(id, title, type, content_url, order_index)')
        .eq('course_id', course.id)
        .order('order_index');

      if (cancelled) return;

      const flatLessons = (modules ?? []).flatMap((m) =>
        (m.lessons ?? [])
          .slice()
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      );
      setLessons(flatLessons);
      setActiveLesson(flatLessons[0] ?? null);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [courseSlug]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4 space-y-1">
        <h2 className="font-semibold mb-3">Lessons</h2>
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => setActiveLesson(lesson)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              activeLesson?.id === lesson.id ? 'bg-sea-teal text-white' : 'hover:bg-gray-100'
            }`}
          >
            {lesson.title}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6">
        {activeLesson?.type === 'video' && (
          <VideoLesson lesson={activeLesson} userId={user.id} />
        )}
        {(activeLesson?.type === 'pdf' || activeLesson?.type === 'slides') && (
          <PdfLesson lesson={activeLesson} userId={user.id} />
        )}
      </main>
    </div>
  );
}
