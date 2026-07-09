import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { supabase } from '../../lib/supabaseClient';

const COLORS = ['#2CBCB4', '#C2185B', '#F2A900', '#6C5CE7', '#00B894', '#636E72'];

function groupCount(rows, field) {
  const counts = {};
  rows.forEach((r) => {
    const key = r[field] || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function AdminOverview() {
  const [profiles, setProfiles] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase
        .from('profiles')
        .select('id, gender, age_range, employment_status, education_level')
        .eq('role', 'learner'),
      supabase.from('enrollments').select('id, completed_at'),
    ]).then(([profilesResult, enrollmentsResult]) => {
      if (cancelled) return;
      setProfiles(profilesResult.data ?? []);
      setEnrollments(enrollmentsResult.data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLearners = profiles.length;
  const completed = enrollments.filter((e) => e.completed_at).length;
  const completionRate = enrollments.length ? Math.round((completed / enrollments.length) * 100) : 0;
  const genderData = useMemo(() => groupCount(profiles, 'gender'), [profiles]);
  const ageData = useMemo(() => groupCount(profiles, 'age_range'), [profiles]);
  const employmentData = useMemo(() => groupCount(profiles, 'employment_status'), [profiles]);
  const educationData = useMemo(() => groupCount(profiles, 'education_level'), [profiles]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin — Overview</h1>
        <Link to="/admin/learners" className="text-sea-teal font-medium">View all learners →</Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="Total registered learners" value={totalLearners} />
        <StatCard label="Enrollments" value={enrollments.length} />
        <StatCard label="Uplift completion rate" value={`${completionRate}%`} />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <ChartCard title="Gender">
          <PieChart width={300} height={250}>
            <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={90} label>
              {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Age range">
          <BarChart width={300} height={250} data={ageData}>
            <XAxis dataKey="name" fontSize={10} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2CBCB4" />
          </BarChart>
        </ChartCard>

        <ChartCard title="Employment status">
          <BarChart width={300} height={250} data={employmentData}>
            <XAxis dataKey="name" fontSize={10} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#C2185B" />
          </BarChart>
        </ChartCard>

        <ChartCard title="Education level">
          <BarChart width={300} height={250} data={educationData}>
            <XAxis dataKey="name" fontSize={10} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#F2A900" />
          </BarChart>
        </ChartCard>
      </div>

      {/* TODO: CSV export button + PDF summary report generation */}
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
