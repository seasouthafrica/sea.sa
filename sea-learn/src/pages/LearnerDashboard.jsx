import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import { upliftWeek1 } from '../data/courseWeeks';

export default function LearnerDashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from('courses')
      .select('id, slug, title, description')
      .eq('published', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!cancelled) setCourses(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-1">
        Welcome{profile ? `, ${profile.first_name}` : ''}
      </h1>
      <p className="text-gray-500 mb-8">Here's your learning progress on SEA Learn.</p>

      <div className="space-y-4">
        <Link
          to="/uplift/week-1"
          className="block rounded-2xl border border-sea-teal/30 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sea-teal hover:shadow-md"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sea-teal">
            Continue learning
          </p>
          <h2 className="text-xl font-bold text-gray-950">{upliftWeek1.programmeTitle}</h2>
          <p className="mt-1 font-semibold text-gray-700">
            Week {upliftWeek1.weekNumber}: {upliftWeek1.weekTitle}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Start the opening video and interactive presentation for Week 1.
          </p>
          <div className="mt-5 inline-flex rounded-full bg-sea-teal px-5 py-2 text-sm font-bold text-white">
            Open Week 1
          </div>
        </Link>

        {courses.map((course) => (
          <Link
            key={course.id}
            to={course.slug === 'uplift' ? '/uplift/week-1' : `/course/${course.slug}`}
            className="block border rounded-xl p-5 hover:border-sea-teal transition"
          >
            <h2 className="font-semibold text-lg">{course.title}</h2>
            <p className="text-gray-500 text-sm">{course.description}</p>
            {/* TODO: replace with real % from activity_events aggregation */}
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div className="bg-sea-teal h-2 rounded-full" style={{ width: '0%' }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
