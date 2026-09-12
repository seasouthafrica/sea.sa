import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import {
  workReadinessSessions,
  workReadinessMeta,
  REQUIRED_WORK_READINESS_QUIZ_KEYS,
} from '../data/workReadinessSessions';
import WorkReadinessCertificate from '../components/WorkReadinessCertificate';

const QUIZ_KEY = 'work-readiness-quiz-scores';
const PASS_PCT = 67; // 2 of 3 questions correct

// Namespaced away from the Quarter 1 course, which uses +100 / +200.
const supabaseChapterId = (sessionId) => sessionId + 400;

function loadLocal(key, userId) {
  try {
    const raw = localStorage.getItem(`${key}-${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLocal(key, userId, data) {
  try { localStorage.setItem(`${key}-${userId}`, JSON.stringify(data)); } catch { /* storage unavailable */ }
}

function SessionVideo({ video, placeholder }) {
  if (video?.id) {
    return (
      <div>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black shadow-lg">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${video.id}`}
            title={video.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {video.title}
          {video.channel ? ` — ${video.channel}` : ''}
          {video.duration ? ` (${video.duration})` : ''}
        </p>
      </div>
    );
  }

  if (!placeholder) return null;
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Video to be added</p>
      <p className="mt-2 text-sm text-amber-900">
        A video under 5 minutes about <strong>{placeholder.topic}</strong> goes here.
      </p>
      <p className="mt-2 text-sm text-amber-800">
        Suggested search: <span className="font-mono">“{placeholder.searchQuery}”</span>
      </p>
    </div>
  );
}

function Quiz({ quiz, onScore, savedScore }) {
  const questions = quiz.questions;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(!!savedScore);

  const score = submitted
    ? (savedScore?.score ?? questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0))
    : 0;

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  const handleSubmit = () => {
    setSubmitted(true);
    const s = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    onScore?.(quiz.key, s, questions.length);
  };

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-6">
      <h3 className="mb-1 text-lg font-bold text-violet-900">{quiz.key}</h3>
      <p className="mb-6 text-sm text-violet-700">
        {submitted
          ? `You scored ${score} out of ${questions.length} (${Math.round((score / questions.length) * 100)}%)`
          : `${questions.length} questions — select the best answer for each.`}
      </p>
      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div
            key={qi}
            className={`rounded-xl p-4 ${
              submitted
                ? answers[qi] === q.correct
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-red-50 border border-red-200'
                : 'bg-white border border-violet-100'
            }`}
          >
            <p className="mb-3 font-semibold text-slate-800">{qi + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                    submitted
                      ? oi === q.correct
                        ? 'bg-emerald-100 text-emerald-900 font-semibold'
                        : oi === answers[qi] && oi !== q.correct
                          ? 'bg-red-100 text-red-800 line-through'
                          : 'text-gray-500'
                      : answers[qi] === oi
                        ? 'bg-violet-100 text-violet-900 font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`wr-quiz-${quiz.key}-${qi}`}
                    disabled={submitted}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers({ ...answers, [qi]: oi })}
                    className="mt-0.5 accent-violet-600"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit answers
        </button>
      )}
    </div>
  );
}

function SessionBody({ session }) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-sea-teal/30 bg-teal-50/60 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-sea-teal">Learning Outcomes</h3>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          {session.learningOutcomes.map((o) => <li key={o}>{o}</li>)}
        </ol>
      </div>

      {session.sections.map((sec) => (
        <div key={sec.heading}>
          <h3 className="mb-3 text-xl font-bold text-slate-900">{sec.heading}</h3>
          {sec.paragraphs?.map((p) => (
            <p key={p} className="mb-3 leading-relaxed text-slate-700">{p}</p>
          ))}
          {sec.bullets && (
            <ul className="mt-3 space-y-2">
              {sec.bullets.map((b) => (
                <li key={b.label} className="flex gap-2 text-slate-700">
                  <span className="text-sea-teal">•</span>
                  <span><strong className="text-slate-900">{b.label}:</strong> {b.text}</span>
                </li>
              ))}
            </ul>
          )}
          {sec.numbered && (
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              {sec.numbered.map((n) => (
                <li key={n.label} className="text-slate-700">
                  <strong className="text-slate-900">{n.label}:</strong> {n.text}
                </li>
              ))}
            </ol>
          )}
          {sec.groups && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sec.groups.map((g) => (
                <div key={g.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-bold text-slate-900">{g.label}</p>
                  <ul className="mt-2 space-y-1.5">
                    {g.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-slate-600">
                        <span className="text-sea-teal">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {sec.quote && (
            <blockquote className="mt-5 rounded-2xl border-l-4 border-sea-teal bg-teal-50/70 p-5 text-base font-semibold italic text-slate-800">
              {sec.quote}
            </blockquote>
          )}
          {sec.reflection && (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-700">{sec.reflection.title}</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-violet-900">
                {sec.reflection.questions.map((q) => <li key={q}>{q}</li>)}
              </ol>
            </div>
          )}
        </div>
      ))}

      {session.template && (
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-6">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">{session.template.title}</h4>
          <p className="rounded-xl bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 shadow-sm">
            {session.template.body}
          </p>
        </div>
      )}

      {session.prompt && (
        <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-6">
          <h4 className="text-sm font-bold uppercase tracking-wide text-sky-800">{session.prompt.title}</h4>
          <p className="mb-3 text-xs text-sky-700">{session.prompt.subtitle}</p>
          <p className="rounded-xl bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 shadow-sm">
            {session.prompt.body}
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(session.prompt.body)}
            className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
          >
            Copy prompt
          </button>
        </div>
      )}

      {session.proTip && (
        <div className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-900"><strong>Pro-Tip:</strong> {session.proTip}</p>
        </div>
      )}

      <SessionVideo video={session.video} placeholder={session.videoPlaceholder} />

      <div className="rounded-2xl border-l-4 border-sea-teal bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-800"><strong>Practical Action Item:</strong> {session.actionItem}</p>
      </div>

      {session.source && (
        <p className="text-xs italic text-slate-400">{session.source}</p>
      )}
    </div>
  );
}

export default function WorkReadinessCourse() {
  const { user, profile } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [quizScores, setQuizScores] = useState({});

  useEffect(() => {
    if (!user) return;
    setQuizScores(loadLocal(QUIZ_KEY, user.id));
  }, [user]);

  const saveQuizScore = useCallback((quizKey, score, total) => {
    const pct = Math.round((score / total) * 100);
    setQuizScores((prev) => {
      const next = { ...prev, [quizKey]: { score, total, pct } };
      if (user) {
        saveLocal(QUIZ_KEY, user.id, next);
        const session = workReadinessSessions.find((s) => s.quiz.key === quizKey);
        if (session) {
          supabase.from('assignment_submissions').upsert({
            user_id: user.id,
            chapter_id: supabaseChapterId(session.id),
            status: 'submitted',
            explanation: JSON.stringify({ course: 'work-readiness', quizKey, score, total, pct }),
            submitted_at: new Date().toISOString(),
          }, { onConflict: 'user_id,chapter_id' });
        }
      }
      return next;
    });
  }, [user]);

  const passedCount = useMemo(
    () => REQUIRED_WORK_READINESS_QUIZ_KEYS.filter((k) => (quizScores[k]?.pct ?? 0) >= PASS_PCT).length,
    [quizScores]
  );
  const allPassed = passedCount === REQUIRED_WORK_READINESS_QUIZ_KEYS.length;
  const percent = Math.round((passedCount / REQUIRED_WORK_READINESS_QUIZ_KEYS.length) * 100);

  const active = sessionId ? workReadinessSessions.find((s) => String(s.id) === String(sessionId)) : null;

  if (sessionId && !active) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Session not found</h1>
        <Link to="/work-readiness" className="mt-4 inline-block font-semibold text-sea-teal">← Back to course overview</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-sea-teal">{workReadinessMeta.quarter}</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">{workReadinessMeta.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Partners: {workReadinessMeta.partners.join(' & ')}
        </p>
        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-sea-teal transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {passedCount} of {REQUIRED_WORK_READINESS_QUIZ_KEYS.length} quizzes passed — {percent}% complete
          </p>
        </div>
      </header>

      {!active && (
        <>
          <div className="mb-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Programme intro video</p>
            <p className="mt-2 text-sm text-slate-700">{workReadinessMeta.introVideoNote}</p>
          </div>

          <div className="space-y-3">
            {workReadinessSessions.map((s) => {
              const sc = quizScores[s.quiz.key];
              const passed = (sc?.pct ?? 0) >= PASS_PCT;
              return (
                <Link
                  key={s.id}
                  to={`/work-readiness/session/${s.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sea-teal hover:shadow-md"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {passed ? '✓' : s.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">Session {s.id}: {s.title}</span>
                    <span className="mt-0.5 block text-sm text-slate-500">
                      {sc ? `Quiz: ${sc.score}/${sc.total} (${sc.pct}%)` : `${s.learningOutcomes.length} learning outcomes`}
                    </span>
                  </span>
                  <span className="text-slate-400">→</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-10">
            {allPassed ? (
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Certificate of Completion</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Congratulations{profile?.first_name ? `, ${profile.first_name}` : ''}! You have passed all {REQUIRED_WORK_READINESS_QUIZ_KEYS.length} quizzes.
                </p>
                <WorkReadinessCertificate
                  name={profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Learner'}
                  date={new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-600">
                  Pass all {REQUIRED_WORK_READINESS_QUIZ_KEYS.length} session quizzes to unlock your Certificate of Completion.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {active && (
        <>
          <Link to="/work-readiness" className="mb-6 inline-block text-sm font-semibold text-sea-teal">← All sessions</Link>
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Session {active.id}: {active.title}</h2>
          <SessionBody session={active} />
          <div className="mt-10">
            <Quiz quiz={active.quiz} onScore={saveQuizScore} savedScore={quizScores[active.quiz.key]} />
          </div>
          <div className="mt-8 flex items-center justify-between gap-4">
            {active.id > 1 ? (
              <button type="button" onClick={() => navigate(`/work-readiness/session/${active.id - 1}`)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                ← Session {active.id - 1}
              </button>
            ) : <span />}
            {active.id < workReadinessSessions.length ? (
              <button type="button" onClick={() => navigate(`/work-readiness/session/${active.id + 1}`)} className="rounded-xl bg-sea-teal px-5 py-2.5 text-sm font-bold text-white shadow transition hover:brightness-110">
                Session {active.id + 1} →
              </button>
            ) : (
              <Link to="/work-readiness" className="rounded-xl bg-sea-teal px-5 py-2.5 text-sm font-bold text-white shadow transition hover:brightness-110">
                Finish course →
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  );
}
