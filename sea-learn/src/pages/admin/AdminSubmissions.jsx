import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

const SIM_LABELS = { 21: 'Prompt Engineering', 31: 'Logo Maker', 41: 'Facebook Ad Simulator', 51: 'Code Playground', 52: 'Website Prompt Generator' };
const CHAPTER_LABELS = { 1: 'Session 1', 2: 'Session 2', 3: 'Session 3', 4: 'Session 4', 5: 'Session 5' };
const ASSIGNMENT_IDS = new Set([2, 3, 4, 5]);

function getLabel(chapterId) {
  return SIM_LABELS[chapterId] || CHAPTER_LABELS[chapterId] || `Session ${chapterId}`;
}

function isSimulator(chapterId) {
  return chapterId in SIM_LABELS;
}

function parseSimData(explanation) {
  try {
    const parsed = JSON.parse(explanation);
    if (parsed?.type === 'simulator') return parsed;
  } catch {}
  return null;
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('assignment_submissions')
      .select('*, profiles(first_name, last_name)')
      .order('submitted_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setSubmissions(data ?? []);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const reviewableSubmissions = submissions.filter((s) => ASSIGNMENT_IDS.has(s.chapter_id) || isSimulator(s.chapter_id));
  const filtered = reviewableSubmissions.filter((s) => {
    if (filter === 'simulators' && !isSimulator(s.chapter_id)) return false;
    if (filter === 'assignments' && isSimulator(s.chapter_id)) return false;
    if (search) {
      const name = `${s.profiles?.first_name || ''} ${s.profiles?.last_name || ''}`.toLowerCase();
      if (!name.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const simCount = reviewableSubmissions.filter((s) => isSimulator(s.chapter_id)).length;
  const assignmentCount = reviewableSubmissions.filter((s) => ASSIGNMENT_IDS.has(s.chapter_id)).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sea-teal">SEA Learn admin</p>
          <h1 className="text-3xl font-bold">Submissions & Scores</h1>
        </div>
        <Link to="/admin" className="font-semibold text-sea-teal">Back to overview</Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Completed Activities" value={reviewableSubmissions.length} color="blue" />
        <StatCard label="Assignments" value={assignmentCount} color="amber" />
        <StatCard label="Simulator Activities" value={simCount} color="purple" />
        <StatCard label="Unique Learners" value={new Set(submissions.map((s) => s.user_id)).size} color="emerald" />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          {[
            { id: 'all', label: 'All' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'simulators', label: 'Simulators' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-sm font-medium transition ${filter === f.id ? 'bg-sea-teal text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by learner name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sea-teal focus:ring-2 focus:ring-sea-teal/20 w-64"
        />
        <span className="text-sm text-slate-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading submissions…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No submissions match your filters.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => {
            const sim = isSimulator(s.chapter_id);
            const simData = sim ? parseSimData(s.explanation) : null;

            return (
              <div key={s.id} className={`rounded-2xl border bg-white p-5 ${sim ? 'border-purple-200' : 'border-slate-200'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to={`/admin/learners/${s.user_id}`} className="text-lg font-bold text-slate-900 hover:text-sea-teal transition">
                      {s.profiles?.first_name} {s.profiles?.last_name}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${sim ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {getLabel(s.chapter_id)}
                      </span>
                      <span>·</span>
                      <span>{s.submitted_at ? new Date(s.submitted_at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    s.status === 'submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.status === 'submitted' ? '✓ Completed' : s.status}
                  </span>
                </div>

                {/* Simulator data display */}
                {sim && simData?.data && (
                  <SimulatorDataView chapterId={s.chapter_id} data={simData.data} />
                )}

                {/* Regular assignment display */}
                {!sim && s.explanation && (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{s.explanation}</p>
                )}

                {s.file_url && (
                  <div className="mt-3">
                    {s.file_url.match(/\.(png|jpe?g|svg)$/i) ? (
                      <img src={s.file_url} alt="Submission" className="max-h-48 rounded-lg border" />
                    ) : (
                      <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-sea-teal underline">View uploaded file ↗</a>
                    )}
                  </div>
                )}

                {s.youtube_url && getYouTubeEmbedUrl(s.youtube_url) && (
                  <div className="mt-3 relative aspect-[16/9] max-w-md overflow-hidden rounded-lg">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={getYouTubeEmbedUrl(s.youtube_url)}
                      title="Submission video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function SimulatorDataView({ chapterId, data }) {
  if (chapterId === 21) {
    const completed = data.challengesScored || data.completed || 0;
    const total = data.total || 3;
    const pct = Math.min(100, Math.round((completed / total) * 100));
    return (
      <div className="mt-3 rounded-xl bg-indigo-50 p-4">
        <h4 className="mb-2 text-sm font-bold text-indigo-800">Prompt Engineering Results</h4>
        <div className="flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-indigo-100">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-black text-indigo-700">{completed}/{total} ({pct}%)</span>
        </div>
      </div>
    );
  }
  if (chapterId === 31) {
    return (
      <div className="mt-3 rounded-xl bg-purple-50 p-4">
        <h4 className="mb-2 text-sm font-bold text-purple-800">Logo Design Details</h4>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <Field label="Brand Name" value={data.brandName} />
          <Field label="Slogan" value={data.slogan || '—'} />
          <Field label="Font" value={`${data.font}, ${data.fontSize}px, ${data.fontStyle}`} />
          <Field label="Icon" value={data.icon || 'None'} />
          <Field label="Shape" value={data.shape || 'None'} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-600 font-semibold">Colors:</span>
            {[data.textColor, data.bgColor].filter(Boolean).map((c, i) => (
              <span key={i} className="inline-block h-5 w-5 rounded border border-purple-200" style={{ background: c }} title={c} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (chapterId === 41) {
    return (
      <div className="mt-3 rounded-xl bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-bold text-blue-800">Facebook Ad Campaign</h4>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <Field label="Brand" value={data.brandName} />
          <Field label="Objective" value={data.objective} />
          <Field label="Audience" value={data.audience} />
          <Field label="Headline" value={data.headline} />
          <Field label="Daily Budget" value={`R${data.dailyBudget}`} />
          <Field label="Duration" value={`${data.duration} days (R${data.dailyBudget * data.duration} total)`} />
          <Field label="CTA" value={data.ctaButton} />
          {data.bodyText && <div className="sm:col-span-2"><Field label="Ad Copy" value={data.bodyText} /></div>}
        </div>
      </div>
    );
  }

  if (chapterId === 51) {
    const total = data.total || 10;
    const done = data.completed || 0;
    const pct = Math.round((done / total) * 100);
    return (
      <div className="mt-3 rounded-xl bg-amber-50 p-4">
        <h4 className="mb-2 text-sm font-bold text-amber-800">Code Playground Progress</h4>
        <div className="flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-amber-200">
            <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-bold text-amber-700">{done}/{total} challenges</span>
        </div>
        {data.challenges && (
          <p className="mt-1 text-xs text-amber-600">Completed: {data.challenges.join(', ')}</p>
        )}
      </div>
    );
  }

  if (chapterId === 52) {
    return (
      <div className="mt-3 rounded-xl bg-indigo-50 p-4">
        <h4 className="mb-2 text-sm font-bold text-indigo-800">Website Prompt</h4>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <Field label="Business" value={data.businessName} />
          <Field label="Business Type" value={data.businessType} />
          <Field label="Style" value={data.style} />
          <Field label="Colour Scheme" value={data.colorScheme} />
          <Field label="Sections" value={data.sections?.join(', ')} />
          <Field label="CTA" value={data.ctaText} />
          {data.prompt && <div className="sm:col-span-3"><Field label="Generated Prompt" value={data.prompt} /></div>}
        </div>
      </div>
    );
  }

  return null;
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-xs font-semibold opacity-60">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}
