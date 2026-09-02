import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';

const COLORS = ['#0f766e', '#db2777', '#d97706', '#7c3aed', '#059669', '#475569'];
const REQUIRED_ACTIVITY_IDS = new Set([2, 3, 4, 5, 21, 31, 41, 51, 52, 101, 102, 103, 104, 105]);
const TOTAL_UPLIFT_REQUIREMENTS = 19;
const REPORTING_FIELDS = [
  'age_range',
  'gender',
  'employment_status',
  'education_level',
  'ethnicity',
  'province',
  'country',
  'disability_status',
  'referral_channel',
];

function formatLabel(value) {
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function groupCount(rows, field) {
  const counts = {};
  rows.forEach((row) => {
    const raw = typeof row[field] === 'string' ? row[field].trim() : row[field];
    const key = raw ? formatLabel(raw) : 'Not provided';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function countProvided(values) {
  return values.filter((item) => item.name !== 'Not provided').reduce((sum, item) => sum + item.value, 0);
}

export default function AdminOverview() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setError('');
      try {
        const [profilesResult, submissionsResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('role', 'learner'),
          supabase.from('assignment_submissions').select('user_id, chapter_id, status, explanation, file_url'),
        ]);
        if (cancelled) return;

        const errors = [profilesResult.error, submissionsResult.error].filter(Boolean);
        if (errors.length) {
          console.error('[admin/overview] Unable to load dashboard data.', errors);
          setError(errors.map((queryError) => queryError.message).join('; '));
        }
        setProfiles(profilesResult.data ?? []);
        setSubmissions(submissionsResult.data ?? []);
      } catch (loadError) {
        if (!cancelled) {
          console.error('[admin/overview] Unexpected dashboard error.', loadError);
          setError(loadError.message || 'Unable to load dashboard information.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();
    return () => { cancelled = true; };
  }, []);

  const totalLearners = profiles.length;

  const participation = useMemo(() => {
    const learnerIds = new Set(profiles.map((profile) => profile.id));
    const grouped = {};
    submissions.forEach((row) => {
      if (!learnerIds.has(row.user_id)) return;
      (grouped[row.user_id] ||= []).push(row);
    });

    let completedLearners = 0;
    let engagedLearners = 0;
    Object.values(grouped).forEach((rows) => {
      const activities = new Set();
      const quizzes = new Set();
      rows.forEach((row) => {
        if (row.status !== 'submitted') return;
        if (REQUIRED_ACTIVITY_IDS.has(row.chapter_id)) activities.add(row.chapter_id);
        try {
          const payload = JSON.parse(row.explanation);
          if (payload?.type === 'quiz' && payload.quizKey) quizzes.add(payload.quizKey);
        } catch {}
      });
      if (activities.size + quizzes.size > 0) engagedLearners += 1;
      if (rows.some((row) => row.chapter_id === 3 && row.status === 'submitted' && row.file_url)) completedLearners += 1;
    });

    return {
      engagedLearners,
      completedLearners,
      inProgressLearners: Math.max(0, engagedLearners - completedLearners),
      engagementRate: percentage(engagedLearners, totalLearners),
      completionRate: percentage(completedLearners, totalLearners),
    };
  }, [submissions, totalLearners]);

  const genderData = useMemo(() => groupCount(profiles, 'gender'), [profiles]);
  const ageData = useMemo(() => groupCount(profiles, 'age_range'), [profiles]);
  const employmentData = useMemo(() => groupCount(profiles, 'employment_status'), [profiles]);
  const educationData = useMemo(() => groupCount(profiles, 'education_level'), [profiles]);
  const ethnicityData = useMemo(() => groupCount(profiles, 'ethnicity'), [profiles]);
  const provinceData = useMemo(() => groupCount(profiles, 'province'), [profiles]);
  const countryData = useMemo(() => groupCount(profiles, 'country'), [profiles]);
  const disabilityData = useMemo(() => groupCount(profiles, 'disability_status'), [profiles]);
  const referralData = useMemo(() => groupCount(profiles, 'referral_channel'), [profiles]);

  const evidence = useMemo(() => {
    const completedFields = profiles.reduce((total, profile) => (
      total + REPORTING_FIELDS.filter((field) => String(profile[field] ?? '').trim()).length
    ), 0);
    const totalFields = profiles.length * REPORTING_FIELDS.length;
    const women = profiles.filter((profile) => profile.gender?.toLowerCase() === 'female').length;
    const unemployed = profiles.filter((profile) => profile.employment_status?.toLowerCase() === 'unemployed').length;

    return {
      dataCompleteness: percentage(completedFields, totalFields),
      womenRate: percentage(women, totalLearners),
      unemployedRate: percentage(unemployed, totalLearners),
      countriesReached: countryData.filter((item) => item.name !== 'Not provided').length,
      regionsReached: provinceData.filter((item) => item.name !== 'Not provided').length,
    };
  }, [countryData, profiles, provinceData, totalLearners]);

  const reportDate = new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <main className="funder-report min-h-screen bg-slate-100 text-slate-950">
      <nav className="print-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">SEA Learn admin</p>
            <p className="text-sm text-slate-500">Impact reporting workspace</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <Link to="/admin/courses" className="text-slate-600 hover:text-teal-700">Courses</Link>
            <Link to="/admin/submissions" className="text-slate-600 hover:text-teal-700">Submissions</Link>
            <Link to="/admin/learners" className="text-slate-600 hover:text-teal-700">Learners</Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              Print / save PDF
            </button>
            <button
              type="button"
              onClick={async () => { await supabase.auth.signOut(); navigate('/login', { replace: true }); }}
              className="text-red-600 hover:text-red-700"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-10 text-white shadow-xl sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="relative max-w-4xl">
            <div className="mb-6 inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
              Live programme evidence · {reportDate}
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-pink-300">Uplift Digital Accelerator</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Impact dashboard</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              A live view of programme reach, learner participation and inclusion across SEA Learn. Figures are drawn directly from registration and learning activity records.
            </p>
          </div>
        </header>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
            Some reporting data could not be loaded: {error}
          </p>
        )}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading dashboard">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-white" />)}
          </div>
        ) : (
          <>
            <section className="-mt-5 grid gap-4 px-3 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
              <MetricCard label="Learners reached" value={totalLearners} detail="Registered learner profiles" tone="teal" />
              <MetricCard label="Engaged learners" value={participation.engagedLearners} detail={`${participation.engagementRate}% of registrations`} tone="blue" />
              <MetricCard label="Programme completions" value={participation.completedLearners} detail={`${participation.completionRate}% completion rate`} tone="pink" />
              <MetricCard label="Geographic reach" value={evidence.regionsReached} detail={`${evidence.countriesReached} countr${evidence.countriesReached === 1 ? 'y' : 'ies'} represented`} tone="amber" />
            </section>

            {totalLearners === 0 && !error ? (
              <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                No learner profiles are available yet. This report will populate as registrations are received.
              </p>
            ) : (
              <>
                <section className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                  <article className="rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-7 text-white shadow-lg sm:p-9">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-200">Executive snapshot</p>
                    <h2 className="mt-3 text-2xl font-black sm:text-3xl">From access to active participation</h2>
                    <p className="mt-4 max-w-2xl leading-7 text-teal-50">
                      SEA Learn has registered <strong>{totalLearners}</strong> learner{totalLearners === 1 ? '' : 's'}.
                      {' '}<strong>{participation.engagedLearners}</strong> have recorded at least one completed learning activity,
                      and <strong>{participation.completedLearners}</strong> have completed the programme by uploading their logo creation activity.
                    </p>
                    <div className="mt-7 grid gap-3 sm:grid-cols-3">
                      <MiniMetric label="Engagement" value={`${participation.engagementRate}%`} />
                      <MiniMetric label="Completion" value={`${participation.completionRate}%`} />
                      <MiniMetric label="In progress" value={participation.inProgressLearners} />
                    </div>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Evidence quality</p>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      <p className="text-5xl font-black text-slate-950">{evidence.dataCompleteness}%</p>
                      <p className="pb-1 text-right text-sm text-slate-500">profile fields<br />complete</p>
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width: `${evidence.dataCompleteness}%` }} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      Based on nine demographic, geographic and referral fields per learner. Missing responses remain visible as “Not provided”.
                    </p>
                  </article>
                </section>

                <ReportSection
                  eyebrow="Reach and inclusion"
                  title="Who the programme is reaching"
                  description="A demographic view of registered learners, with non-responses retained for transparent reporting."
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    <ChartCard title="Gender representation" description={`${evidence.womenRate}% of registered learners identify as female.`} data={genderData}>
                      <DonutChart data={genderData} />
                    </ChartCard>
                    <ChartCard title="Age profile" description="Distribution across registered age groups." data={ageData}>
                      <HorizontalBarChart data={ageData} color="#0f766e" />
                    </ChartCard>
                    <ChartCard title="Employment status" description={`${evidence.unemployedRate}% registered as unemployed.`} data={employmentData}>
                      <HorizontalBarChart data={employmentData} color="#db2777" />
                    </ChartCard>
                    <ChartCard title="Education level" description="Highest education level reported at registration." data={educationData}>
                      <HorizontalBarChart data={educationData} color="#d97706" />
                    </ChartCard>
                    <ChartCard title="Ethnicity" description="Self-described ethnicity of registered learners." data={ethnicityData}>
                      <DonutChart data={ethnicityData} />
                    </ChartCard>
                    <ChartCard title="Disability inclusion" description="Self-reported disability status." data={disabilityData}>
                      <DonutChart data={disabilityData} />
                    </ChartCard>
                  </div>
                </ReportSection>

                <ReportSection
                  eyebrow="Geographic footprint"
                  title="Where learners are based"
                  description={`${countProvided(countryData)} learners provided a country and ${countProvided(provinceData)} provided a province or region.`}
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    <RankedList title="Countries represented" data={countryData} total={totalLearners} />
                    <RankedList title="Provinces and regions" data={provinceData} total={totalLearners} />
                  </div>
                </ReportSection>

                <ReportSection
                  eyebrow="Programme discovery"
                  title="How learners find SEA Learn"
                  description="Referral data helps partners understand which outreach channels are contributing to programme access."
                >
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    {referralData.length ? <HorizontalBarChart data={referralData} color="#7c3aed" height={300} /> : <EmptyChart />}
                  </div>
                </ReportSection>

                <footer className="mt-12 border-t border-slate-300 py-7 text-sm leading-6 text-slate-500">
                  <p className="font-bold text-slate-700">Reporting methodology</p>
                  <p className="mt-1 max-w-4xl">
                    Reach is based on learner profiles. Engagement requires at least one submitted learning activity. Completion is awarded when a learner uploads the logo creation activity. Dashboard figures are a live operational snapshot and should be read alongside qualitative learner outcomes.
                  </p>
                  <p className="mt-3">Generated from SEA Learn on {reportDate}.</p>
                </footer>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({ label, value, detail, tone }) {
  const tones = {
    teal: 'border-teal-200 text-teal-800',
    blue: 'border-blue-200 text-blue-800',
    pink: 'border-pink-200 text-pink-800',
    amber: 'border-amber-200 text-amber-800',
  };
  return (
    <article className={`relative rounded-2xl border bg-white p-6 shadow-md ${tones[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-teal-200">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function ReportSection({ eyebrow, title, description, children }) {
  return (
    <section className="print-break mt-14">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
        <p className="mt-3 leading-7 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ChartCard({ title, description, data, children }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{description}</p>
      <div className="mt-4">{data.length ? children : <EmptyChart />}</div>
    </article>
  );
}

function DonutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={270}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={2} label>
          {data.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(value) => [`${value} learner${value === 1 ? '' : 's'}`, 'Count']} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarChart({ data, color, height = 270 }) {
  const chartHeight = Math.max(height, data.length * 42);
  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 25, bottom: 5, left: 22 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={112} fontSize={11} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => [`${value} learner${value === 1 ? '' : 's'}`, 'Count']} />
        <Bar dataKey="value" fill={color} radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RankedList({ title, data, total }) {
  const visible = data.filter((item) => item.name !== 'Not provided').slice(0, 10);
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      {visible.length ? (
        <ol className="mt-5 space-y-4">
          {visible.map((item, index) => (
            <li key={item.name}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-slate-700"><span className="mr-2 text-slate-400">{index + 1}.</span>{item.name}</span>
                <span className="font-black text-slate-900">{item.value} <span className="font-medium text-slate-400">({percentage(item.value, total)}%)</span></span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-600" style={{ width: `${percentage(item.value, total)}%` }} />
              </div>
            </li>
          ))}
        </ol>
      ) : <EmptyChart />}
    </article>
  );
}

function EmptyChart() {
  return <div className="flex h-48 items-center justify-center text-sm text-slate-400">No information available</div>;
}
