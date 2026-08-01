import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const REQUIRED_ACTIVITY_IDS = new Set([2, 3, 4, 5, 21, 31, 41, 51, 52, 101, 102, 103, 104, 105]);
const TOTAL_UPLIFT_REQUIREMENTS = 19;

function getUpliftProgress(rows) {
  const completedActivities = new Set();
  const quizzes = new Set();
  rows.forEach((row) => {
    if (row.status !== 'submitted') return;
    if (REQUIRED_ACTIVITY_IDS.has(row.chapter_id)) completedActivities.add(row.chapter_id);
    try {
      const payload = JSON.parse(row.explanation);
      if (payload?.type === 'quiz' && payload.quizKey) quizzes.add(payload.quizKey);
    } catch {}
  });
  return Math.min(100, Math.round(((completedActivities.size + quizzes.size) / TOTAL_UPLIFT_REQUIREMENTS) * 100));
}

// Simple CSV export from an array of objects — no extra dependency needed.
function escapeCsv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function exportCsv(rows, progressByUser) {
  if (!rows.length) return;
  const headers = ['Learner name', 'Age range', 'Location', 'Access status', 'Uplift status', 'Uplift completion', 'Registered'];
  const reportRows = rows.map((learner) => {
    const progress = progressByUser[learner.id] || 0;
    return [
      `${learner.first_name} ${learner.last_name}`.trim(),
      learner.age_range,
      learner.location,
      'Active',
      progress === 100 ? 'Completed' : 'In progress',
      `${progress}%`,
      new Date(learner.created_at).toLocaleDateString('en-ZA'),
    ];
  });
  const csv = [
    headers.map(escapeCsv).join(','),
    ...reportRows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sea-learn-learners-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminLearners() {
  const [learners, setLearners] = useState([]);
  const [progressByUser, setProgressByUser] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase
        .from('profiles')
        .select('id, first_name, last_name, location, age_range, created_at')
        .eq('role', 'learner')
        .order('created_at', { ascending: false }),
      supabase
        .from('assignment_submissions')
        .select('user_id, chapter_id, status, explanation'),
    ]).then(([profilesResult, submissionsResult]) => {
      if (cancelled) return;
      setLearners(profilesResult.data ?? []);
      const grouped = {};
      (submissionsResult.data ?? []).forEach((row) => {
        (grouped[row.user_id] ||= []).push(row);
      });
      setProgressByUser(Object.fromEntries(
        Object.entries(grouped).map(([userId, rows]) => [userId, getUpliftProgress(rows)])
      ));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return learners;
    return learners.filter((l) =>
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(query)
    );
  }, [learners, search]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sea-teal">SEA Learn admin</p>
          <h1 className="text-2xl font-bold">Learners</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="font-semibold text-sea-teal text-sm">Back to overview</Link>
          <button
          onClick={() => exportCsv(filtered, progressByUser)}
          disabled={!filtered.length}
          className="rounded-lg bg-sea-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
            Download learner CSV
          </button>
        </div>
      </div>

      <input
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 mb-4 w-full max-w-sm"
      />

      {loading && <p className="mb-4 text-gray-500">Loading learners…</p>}

      <table className="w-full text-sm border rounded-xl overflow-hidden">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Location</th>
            <th className="p-3">Age range</th>
            <th className="p-3">Uplift result</th>
            <th className="p-3">Registered</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-3">{l.first_name} {l.last_name}</td>
              <td className="p-3">{l.location}</td>
              <td className="p-3">{l.age_range}</td>
              <td className="p-3">
                <div className="flex min-w-28 items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                      style={{ width: `${progressByUser[l.id] || 0}%` }}
                    />
                  </div>
                  <span className={`text-xs font-black ${(progressByUser[l.id] || 0) === 100 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {progressByUser[l.id] || 0}%
                  </span>
                </div>
              </td>
              <td className="p-3">{new Date(l.created_at).toLocaleDateString()}</td>
              <td className="p-3">
                <Link to={`/admin/learners/${l.id}`} className="text-sea-teal font-medium">
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
