import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { supabase } from '../../lib/supabaseClient';

const COLORS = ['#2CBCB4', '#C2185B', '#F2A900', '#6C5CE7', '#00B894', '#636E72'];

const REQUIRED_ACTIVITY_IDS = new Set([2, 3, 4, 5, 21, 31, 41, 51, 52, 101, 102, 103, 104, 105]);
const TOTAL_UPLIFT_REQUIREMENTS = 19;

function groupCount(rows, field) {
  const counts = {};
  rows.forEach((r) => {
    const key = r[field] || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function AdminOverview() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase
        .from('profiles')
        .select('id, gender, age_range, employment_status, education_level')
        .eq('role', 'learner'),
      supabase
        .from('assignment_submissions')
        .select('user_id, chapter_id, status, explanation'),
    ]).then(([profilesResult, submissionsResult]) => {
      if (cancelled) return;
      if (profilesResult.error) setError(profilesResult.error.message);
      if (submissionsResult.error) setError((prev) => prev ? `${prev}; ${submissionsResult.error.message}` : submissionsResult.error.message);
      setProfiles(profilesResult.data ?? []);
      setSubmissions(submissionsResult.data ?? []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const totalLearners = profiles.length;

  const { completedLearners, completionRate } = useMemo(() => {
    const grouped = {};
    submissions.forEach((row) => {
      (grouped[row.user_id] ||= []).push(row);
    });
    let done = 0;
    Object.values(grouped).forEach((rows) => {
      const activities = new Set();
      const quizzes = new Set();
      rows.forEach((row) => {
        if (row.status !== 'submitted') return;
        if (REQUIRED_ACTIVITY_IDS.has(row.chapter_id)) activities.add(row.chapter_id);
        try {
          const p = JSON.parse(row.explanation);
          if (p?.type === 'quiz' && p.quizKey) quizzes.add(p.quizKey);
        } catch {}
      });
      if (activities.size + quizzes.size >= TOTAL_UPLIFT_REQUIREMENTS) done++;
    });
    const rate = totalLearners ? Math.round((done / totalLearners) * 100) : 0;
    return { completedLearners: done, completionRate: rate };
  }, [submissions, totalLearners]);

  const genderData = useMemo(() => groupCount(profiles, 'gender'), [profiles]);
  const ageData = useMemo(() => groupCount(profiles, 'age_range'), [profiles]);
  const employmentData = useMemo(() => groupCount(profiles, 'employment_status'), [profiles]);
  const educationData = useMemo(() => groupCount(profiles, 'education_level'), [profiles]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sea-teal">SEA Learn admin</p>
          <h1 className="text-2xl font-bold">Overview</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/courses" className="text-sea-teal font-medium text-sm">Courses</Link>
          <Link to="/admin/submissions" className="text-sea-teal font-medium text-sm">Submissions</Link>
          <Link to="/admin/learners" className="text-sea-teal font-medium text-sm">Learners</Link>
          <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">Learner view</Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/login', { replace: true }); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      </div>

      {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700" role="alert">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-3">
            <StatCard label="Total registered learners" value={totalLearners} />
            <StatCard label="Completed Uplift" value={completedLearners} />
            <StatCard label="Uplift completion rate" value={`${completionRate}%`} />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <ChartCard title="Gender">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Age range">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageData}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2CBCB4" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Employment status">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={employmentData}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#C2185B" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Education level">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={educationData}>
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F2A900" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border rounded-xl p-5">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="border rounded-xl p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
