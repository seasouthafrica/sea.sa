import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const SIM_LABELS = { 21: 'Prompt Engineering', 31: 'Logo Maker', 41: 'Facebook Ad Simulator', 51: 'Code Playground', 52: 'Website Prompt Generator' };
const SESSION_LABELS = { 1: 'Introduction to Entrepreneurship', 2: 'Market Research', 3: 'Branding & Identity', 4: 'Digital Advertising', 5: 'Web Development with AI' };
const ASSIGNMENT_IDS = [2, 3, 4, 5];
const SIMULATOR_IDS = [21, 31, 41, 51, 52];
const SESSION_PROGRESS_IDS = [101, 102, 103, 104, 105];
const TOTAL_REQUIREMENTS = 19; // 5 sessions + 4 assignments + 5 simulators + 5 quizzes

function isSimulator(id) { return id in SIM_LABELS; }

function parseSimData(explanation) {
  try {
    const p = JSON.parse(explanation);
    if (p?.type === 'simulator') return p;
  } catch {}
  return null;
}

function parsePayload(explanation) {
  try { return JSON.parse(explanation); } catch { return null; }
}

export default function AdminLearnerDetail() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, first_name, last_name, location, age_range, gender, education_level, employment_status, disability_status, created_at')
      .eq('id', userId)
      .single()
      .then(({ data }) => { if (!cancelled) setProfile(data); });

    supabase
      .from('activity_events')
      .select('id, event_type, progress_value, occurred_at, lessons(title)')
      .eq('user_id', userId).order('occurred_at', { ascending: false })
      .limit(200)
      .then(({ data }) => { if (!cancelled) setEvents(data ?? []); });

    supabase
      .from('assignment_submissions')
      .select('id, chapter_id, status, explanation, youtube_url, file_url, submitted_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .then(({ data }) => { if (!cancelled) setSubmissions(data ?? []); });

    return () => { cancelled = true; };
  }, [userId]);

  if (!profile) return <div className="p-8">Loading…</div>;

  const completedIds = new Set(submissions.filter((s) => s.status === 'submitted').map((s) => s.chapter_id));
  const simSubmissions = submissions.filter((s) => SIMULATOR_IDS.includes(s.chapter_id));
  const assignmentSubmissions = submissions.filter((s) => ASSIGNMENT_IDS.includes(s.chapter_id));
  const quizSubmissions = submissions.filter((s) => parsePayload(s.explanation)?.type === 'quiz');
  const completedAssignments = ASSIGNMENT_IDS.filter((id) => completedIds.has(id)).length;
  const completedSimulators = SIMULATOR_IDS.filter((id) => completedIds.has(id)).length;
  const completedSessions = SESSION_PROGRESS_IDS.filter((id) => completedIds.has(id)).length;
  const completedQuizzes = quizSubmissions.filter((s) => s.status === 'submitted').length;
  const totalActivities = completedAssignments + completedSimulators + completedSessions + completedQuizzes;
  const progressPct = Math.min(100, Math.round((totalActivities / TOTAL_REQUIREMENTS) * 100));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/admin/learners" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-sea-teal hover:underline">
        ← All learners
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{profile.first_name} {profile.last_name}</h1>
          <p className="text-gray-500">{profile.location}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-emerald-600">Overall Progress</p>
          <p className="text-2xl font-bold text-emerald-700">{progressPct}%</p>
          <p className="text-xs text-emerald-500">{totalActivities}/{TOTAL_REQUIREMENTS} requirements</p>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Uplift programme result</p>
            <h2 className="mt-1 text-2xl font-black">{progressPct === 100 ? 'Successfully completed' : 'In progress'}</h2>
            <p className="mt-1 text-sm text-emerald-50">Sessions, assignments, practical activities and knowledge checks are included.</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/40 bg-white/15 text-2xl font-black">
            {progressPct}%
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ResultMetric label="Sessions" value={`${completedSessions}/5`} />
          <ResultMetric label="Assignments" value={`${completedAssignments}/4`} />
          <ResultMetric label="Simulators" value={`${completedSimulators}/5`} />
          <ResultMetric label="Quizzes" value={`${completedQuizzes}/5`} />
        </div>
      </div>

      {/* Profile Details */}
      <div className="mb-8 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 text-sm sm:grid-cols-3">
        <Field label="Age range" value={profile.age_range} />
        <Field label="Gender" value={profile.gender} />
        <Field label="Education level" value={profile.education_level} />
        <Field label="Employment status" value={profile.employment_status} />
        <Field label="Disability status" value={profile.disability_status} />
        <Field label="Registered" value={new Date(profile.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })} />
      </div>

      {/* Scores & Simulators */}
      <h2 className="mb-3 text-lg font-bold text-slate-900">Simulator Activities</h2>
      {simSubmissions.length === 0 ? (
        <p className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No simulator activities completed yet.</p>
      ) : (
        <div className="mb-8 space-y-3">
          {simSubmissions.map((s) => {
            const simData = parseSimData(s.explanation);
            return (
              <div key={s.id} className="rounded-xl border border-purple-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                      {SIM_LABELS[s.chapter_id]}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.status === 'submitted' ? '✓ Done' : s.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {s.submitted_at ? new Date(s.submitted_at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
                {simData?.data && <SimDataDetail chapterId={s.chapter_id} data={simData.data} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Session Assignments */}
      <h2 className="mb-3 text-lg font-bold text-slate-900">Session Assignments</h2>
      {assignmentSubmissions.length === 0 ? (
        <p className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No assignments submitted yet.</p>
      ) : (
        <div className="mb-8 space-y-3">
          {assignmentSubmissions.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    {SESSION_LABELS[s.chapter_id] || `Session ${s.chapter_id}`}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.status === 'submitted' ? '✓ Submitted' : s.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {s.submitted_at ? new Date(s.submitted_at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>

              {s.explanation && !parseSimData(s.explanation) && (
                <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-sm text-slate-700">{s.explanation}</p>
              )}

              {s.file_url && (
                <div className="mt-2">
                  {s.file_url.match(/\.(png|jpe?g|svg)$/i) ? (
                    <img src={s.file_url} alt="Submission" className="max-h-32 rounded-lg border" />
                  ) : (
                    <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-sea-teal underline">View file ↗</a>
                  )}
                </div>
              )}

              {s.youtube_url && (
                <p className="mt-2 text-sm text-slate-600">
                  Video: <a href={s.youtube_url} target="_blank" rel="noopener noreferrer" className="text-sea-teal underline">{s.youtube_url}</a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Session Completion Overview */}
      <h2 className="mb-3 text-lg font-bold text-slate-900">Progress Summary</h2>
      <div className="mb-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-2.5 font-semibold text-slate-600">Activity</th>
              <th className="px-4 py-2.5 font-semibold text-slate-600">Type</th>
              <th className="px-4 py-2.5 font-semibold text-slate-600 text-center">Status</th>
              <th className="px-4 py-2.5 font-semibold text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[2, 21, 3, 31, 4, 41, 5, 51, 52].map((id) => {
              const sub = submissions.find((s) => s.chapter_id === id);
              const done = sub?.status === 'submitted';
              return (
                <tr key={id} className={done ? 'bg-emerald-50/50' : ''}>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{SIM_LABELS[id] || SESSION_LABELS[id] || `Ch ${id}`}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isSimulator(id) ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isSimulator(id) ? 'Simulator' : 'Assignment'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {done ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">✓</span>
                    ) : (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">
                    {sub?.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Knowledge check results */}
      <h2 className="mb-3 text-lg font-bold text-slate-900">Knowledge Check Results</h2>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {quizSubmissions.map((submission) => {
          const result = parsePayload(submission.explanation);
          return (
            <div key={submission.id} className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-violet-950">{result.quizKey}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">Passed</p>
                </div>
                <span className="rounded-full bg-violet-600 px-3 py-1 text-sm font-black text-white">{result.pct}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500" style={{ width: `${Math.min(100, result.pct)}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">Score: {result.score} out of {result.total}</p>
            </div>
          );
        })}
      </div>

      {/* Activity Timeline */}
      <h2 className="mb-3 text-lg font-bold text-slate-900">Activity Timeline</h2>
      {events.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No activity recorded yet.</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y">
          {events.map((e) => (
            <div key={e.id} className="flex justify-between p-3 text-sm">
              <span>{e.lessons?.title} — {e.event_type} {e.progress_value != null && `(${e.progress_value})`}</span>
              <span className="text-gray-400">{new Date(e.occurred_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SimDataDetail({ chapterId, data }) {
  if (chapterId === 21) {
    const completed = data.challengesScored || data.completed || 0;
    const total = data.total || 3;
    return (
      <div className="mt-2 text-sm font-semibold text-indigo-700">
        {completed}/{total} prompt challenges completed
      </div>
    );
  }
  if (chapterId === 31) {
    return (
      <div className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
        <span><b className="text-purple-700">Brand:</b> {data.brandName}</span>
        <span><b className="text-purple-700">Slogan:</b> {data.slogan || '—'}</span>
        <span><b className="text-purple-700">Font:</b> {data.font}, {data.fontSize}px</span>
        <div className="flex items-center gap-1">
          <b className="text-purple-700">Colors:</b>
          {[data.textColor, data.bgColor].filter(Boolean).map((c, i) => (
            <span key={i} className="inline-block h-4 w-4 rounded border border-purple-200" style={{ background: c }} title={c} />
          ))}
        </div>
      </div>
    );
  }
  if (chapterId === 41) {
    return (
      <div className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
        <span><b className="text-blue-700">Brand:</b> {data.brandName}</span>
        <span><b className="text-blue-700">Objective:</b> {data.objective}</span>
        <span><b className="text-blue-700">Audience:</b> {data.audience}</span>
        <span><b className="text-blue-700">Budget:</b> R{data.dailyBudget}/day × {data.duration} days</span>
        <span><b className="text-blue-700">CTA:</b> {data.ctaButton}</span>
        <span><b className="text-blue-700">Headline:</b> {data.headline}</span>
      </div>
    );
  }
  if (chapterId === 51) {
    const pct = Math.round(((data.completed || 0) / (data.total || 10)) * 100);
    return (
      <div className="mt-2 flex items-center gap-3 text-sm">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-amber-200">
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-bold text-amber-700">{data.completed}/{data.total} challenges ({pct}%)</span>
      </div>
    );
  }
  if (chapterId === 52) {
    return (
      <div className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
        <span><b className="text-indigo-700">Business:</b> {data.businessName}</span>
        <span><b className="text-indigo-700">Type:</b> {data.businessType}</span>
        <span><b className="text-indigo-700">Style:</b> {data.style}</span>
      </div>
    );
  }
  return null;
}

function ResultMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
      <p className="text-xs text-emerald-100">{label}</p>
      <p className="mt-0.5 text-lg font-black">{value}</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  );
}
