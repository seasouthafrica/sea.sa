import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

// Simple CSV export from an array of objects — no extra dependency needed.
function exportCsv(rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => `"${r[h] ?? ''}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sea-learn-learners.csv';
  a.click();
}

export default function AdminLearners() {
  const [learners, setLearners] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, first_name, last_name, location, age_range, created_at')
      .eq('role', 'learner')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setLearners(data ?? []);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Learners</h1>
        <button
          onClick={() => exportCsv(filtered)}
          className="bg-sea-teal text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      <input
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 mb-4 w-full max-w-sm"
      />

      <table className="w-full text-sm border rounded-xl overflow-hidden">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Location</th>
            <th className="p-3">Age range</th>
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
