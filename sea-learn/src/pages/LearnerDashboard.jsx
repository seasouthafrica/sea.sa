import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';

export default function LearnerDashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('courses')
      .select('*, enrollments(completed_at)')
      .eq('published', true)
      .then(({ data }) => setCourses(data ?? []));
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-1">
        Welcome{profile ? `, ${profile.first_name}` : ''}
      </h1>
      <p className="text-gray-500 mb-8">Here's your learning progress on SEA Learn.</p>

      <div className="space-y-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.slug}`}
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
