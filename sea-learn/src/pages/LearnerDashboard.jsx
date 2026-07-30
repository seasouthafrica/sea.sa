import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import { upliftSessions } from '../data/courseChapters';
import { getCourseProgress } from '../lib/courseProgress';

const PROGRESS_KEY = 'uplift-chapter-progress';

function loadLocalProgress(userId) {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}-${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [error, setError] = useState('');
  const [chapterProgress, setChapterProgress] = useState({});

  const completedChapters = upliftSessions.filter((c) => chapterProgress[c.id]).length;
  const upliftPercent = Math.round((completedChapters / upliftSessions.length) * 100);

  useEffect(() => {
    if (!user) return;
    const local = loadLocalProgress(user.id);
    setChapterProgress(local);
    supabase
      .from('assignment_submissions')
      .select('chapter_id, status, explanation')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data) return;
        const fromDb = {};
        data.forEach((s) => {
          try {
            const parsed = JSON.parse(s.explanation);
            if (parsed?.type === 'chapter' && s.status === 'submitted') {
              fromDb[parsed.chapterId] = true;
            }
          } catch {}
        });
        const merged = { ...local, ...fromDb };
        setChapterProgress(merged);
        localStorage.setItem(`${PROGRESS_KEY}-${user.id}`, JSON.stringify(merged));
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      supabase
        .from('courses')
        .select('id, slug, title, description, modules(id, lessons(id))')
        .eq('published', true)
        .order('created_at', { ascending: true }),
      supabase
        .from('activity_events')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('event_type', 'completed'),
    ]).then(([coursesResult, eventsResult]) => {
      if (cancelled) return;
      if (coursesResult.error || eventsResult.error) {
        setError(coursesResult.error?.message || eventsResult.error?.message);
        return;
      }
      setCourses(coursesResult.data ?? []);
      setCompletedIds(new Set((eventsResult.data ?? []).map((event) => event.lesson_id)));
    });
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">
          Welcome{profile ? `, ${profile.first_name}` : ''}
        </h1>
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate('/login', { replace: true }); }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Log out
        </button>
      </div>
      <p className="text-gray-500 mb-8">Here's your learning progress on SEA Learn.</p>
      {error && <p className="mb-5 rounded-lg bg-red-50 p-4 text-red-700" role="alert">{error}</p>}

      <div className="space-y-4">
        {/* Uplift Course Card */}
        <Link
          to="/uplift"
          className="block rounded-2xl border border-sea-teal/30 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sea-teal hover:shadow-md"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sea-teal">
            Continue learning
          </p>
          <h2 className="text-xl font-bold text-gray-950">Uplift Digital Accelerator Course</h2>
          <p className="mt-1 text-sm text-gray-500">By Social Enterprise Academy and Africa Forward</p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {upliftSessions.map((c) => (
              <div key={c.id} className={`rounded-lg p-2 text-center text-xs ${chapterProgress[c.id] ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                <span className="block font-semibold">Session {c.id}</span>
                <span className="block truncate">{chapterProgress[c.id] ? '✓' : '—'}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-600">{upliftPercent}% complete</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-sea-teal transition-all" style={{ width: `${upliftPercent}%` }} />
          </div>

          <div className="mt-5 inline-flex rounded-full bg-sea-teal px-5 py-2 text-sm font-bold text-white">
            Open Course
          </div>
        </Link>

        {/* Other DB-driven courses */}
        {courses.filter((course) => course.slug !== 'uplift').map((course) => {
          const progress = getCourseProgress(course, completedIds);
          return (
            <Link
              key={course.id}
              to={`/course/${course.slug}`}
              className="block border rounded-xl p-5 hover:border-sea-teal transition"
            >
              <h2 className="font-semibold text-lg">{course.title}</h2>
              <p className="text-gray-500 text-sm">{course.description}</p>
              <p className="mt-3 text-sm font-semibold text-gray-600">{progress}% complete</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                <div className="bg-sea-teal h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
