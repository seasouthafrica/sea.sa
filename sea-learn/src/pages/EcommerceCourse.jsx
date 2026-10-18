import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import {
  ecommerceSessions,
  ecommerceMeta,
  ecommerceConclusion,
  ecommerceResources,
  REQUIRED_ECOMMERCE_QUIZ_KEYS,
} from '../data/ecommerceSessions';
import FacebookAdSimulator from '../components/FacebookAdSimulator';

const QUIZ_KEY = 'ecommerce-quiz-scores';
const PASS_PCT = 67;
const META_ADS_SIM_ID = 61; // clear of Quarter 1's 21/31/41/51/52

// Namespaced away from Quarter 1 (+100/+200) and Work Readiness (+400).
const supabaseChapterId = (sessionId) => sessionId + 600;

function loadLocal(key, userId) {
  try {
    const raw = localStorage.getItem(`${key}-${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLocal(key, userId, data) {
  try { localStorage.setItem(`${key}-${userId}`, JSON.stringify(data)); } catch { /* storage unavailable */ }
}

const NOTE_STYLES = {
  tip: { ring: 'border-emerald-300 bg-emerald-50', label: 'text-emerald-700', body: 'text-emerald-900', icon: '💡' },
  fact: { ring: 'border-sky-300 bg-sky-50', label: 'text-sky-700', body: 'text-sky-900', icon: '📌' },
  warning: { ring: 'border-amber-300 bg-amber-50', label: 'text-amber-700', body: 'text-amber-900', icon: '⚠️' },
};

function Note({ note }) {
  if (!note) return null;
  const s = NOTE_STYLES[note.type] ?? NOTE_STYLES.tip;
  return (
    <div className={`mt-5 rounded-2xl border-2 border-dashed p-5 ${s.ring}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${s.label}`}>
        <span className="mr-1.5">{s.icon}</span>{note.title}
      </p>
      <p className={`mt-2 text-sm leading-relaxed ${s.body}`}>{note.text}</p>
    </div>
  );
}

function Accordion({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <span className="font-semibold text-slate-900">{item.q}</span>
        <span className={`shrink-0 text-sea-teal transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <ul className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          {item.a.map((line) => (
            <li key={line} className="flex gap-2 text-sm leading-relaxed text-slate-700">
              <span className="text-sea-teal">•</span><span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Timeline({ items }) {
  return (
    <ol className="mt-5 space-y-3 border-l-2 border-sea-teal/30 pl-5">
      {items.map((t) => (
        <li key={t.year} className="relative">
          <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-sea-teal ring-4 ring-white" />
          <span className="block text-sm font-bold text-sea-teal">{t.year}</span>
          <span className="block text-sm text-slate-700">{t.text}</span>
        </li>
      ))}
    </ol>
  );
}

function SessionVideo({ video }) {
  if (!video?.id) return null;
  return (
    <div className="mt-6">
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
        {video.title}{video.channel ? ` — ${video.channel}` : ''}{video.duration ? ` (${video.duration})` : ''}
      </p>
    </div>
  );
}

function Quiz({ quiz, onScore, savedScore }) {
  const questions = quiz.questions;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(!!savedScore);

  const score = submitted
    ? (savedScore?.score ?? questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0))
    : 0;
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  const submit = () => {
    setSubmitted(true);
    const s = questions.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
    onScore?.(quiz.key, s, questions.length);
  };

  return (
    <div className="mt-10 rounded-2xl border-2 border-violet-200 bg-violet-50 p-6">
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
                ? answers[qi] === q.correct ? 'border border-emerald-200 bg-emerald-50' : 'border border-red-200 bg-red-50'
                : 'border border-violet-100 bg-white'
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
                        ? 'bg-emerald-100 font-semibold text-emerald-900'
                        : oi === answers[qi] ? 'bg-red-100 text-red-800 line-through' : 'text-gray-500'
                      : answers[qi] === oi ? 'bg-violet-100 font-semibold text-violet-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`ec-${quiz.key}-${qi}`}
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
          onClick={submit}
          disabled={!allAnswered}
          className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit answers
        </button>
      )}
    </div>
  );
}

function SessionBody({ session, userId }) {
  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-sea-teal/30 bg-teal-50/60 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-sea-teal">Learning Outcomes</h3>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          {session.learningOutcomes.map((o) => <li key={o}>{o}</li>)}
        </ol>
      </div>

      {session.sections.map((sec) => (
        <div key={sec.heading}>
          <h3 className="mb-3 text-xl font-bold text-slate-900">{sec.heading}</h3>
          {sec.paragraphs?.map((p) => <p key={p} className="mb-3 leading-relaxed text-slate-700">{p}</p>)}

          {sec.timeline && <Timeline items={sec.timeline} />}

          {sec.numbered && (
            <ol className="mt-4 list-decimal space-y-2 pl-5">
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
                        <span className="text-sea-teal">•</span><span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {sec.accordions && (
            <div className="mt-5 space-y-2.5">
              {sec.accordions.map((a) => <Accordion key={a.q} item={a} />)}
            </div>
          )}

          <Note note={sec.note} />
        </div>
      ))}

      <SessionVideo video={session.video} />

      {session.simulator && (
        <div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">{session.simulator.heading}</h3>
          <p className="mb-5 leading-relaxed text-slate-700">{session.simulator.intro}</p>
          <FacebookAdSimulator userId={userId} simId={META_ADS_SIM_ID} label="Meta Ads Simulator" />
        </div>
      )}

      {session.actionItem && (
        <div className="rounded-2xl border-l-4 border-sea-teal bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-800"><strong>Practical Action Item:</strong> {session.actionItem}</p>
        </div>
      )}
    </div>
  );
}

export default function EcommerceCourse() {
  const { user } = useAuth();
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
        const session = ecommerceSessions.find((s) => s.quiz?.key === quizKey);
        if (session) {
          supabase.from('assignment_submissions').upsert({
            user_id: user.id,
            chapter_id: supabaseChapterId(session.id),
            status: 'submitted',
            explanation: JSON.stringify({ course: 'ecommerce', quizKey, score, total, pct }),
            submitted_at: new Date().toISOString(),
          }, { onConflict: 'user_id,chapter_id' });
        }
      }
      return next;
    });
  }, [user]);

  const passedCount = useMemo(
    () => REQUIRED_ECOMMERCE_QUIZ_KEYS.filter((k) => (quizScores[k]?.pct ?? 0) >= PASS_PCT).length,
    [quizScores]
  );
  const percent = Math.round((passedCount / REQUIRED_ECOMMERCE_QUIZ_KEYS.length) * 100);

  const active = sessionId ? ecommerceSessions.find((s) => String(s.id) === String(sessionId)) : null;

  if (sessionId && !active) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Session not found</h1>
        <Link to="/ecommerce" className="mt-4 inline-block font-semibold text-sea-teal">← Back to course overview</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-sea-teal">{ecommerceMeta.quarter} · Final course</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">{ecommerceMeta.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Partners: {ecommerceMeta.partners.join(' & ')}</p>
        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-sea-teal transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {passedCount} of {REQUIRED_ECOMMERCE_QUIZ_KEYS.length} quizzes passed — {percent}% complete
          </p>
        </div>
      </header>

      {!active && (
        <>
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-600">Start here</p>
            <SessionVideo video={ecommerceMeta.introVideo} />
          </div>

          <div className="space-y-3">
            {ecommerceSessions.map((s) => {
              const sc = s.quiz ? quizScores[s.quiz.key] : null;
              const passed = (sc?.pct ?? 0) >= PASS_PCT;
              return (
                <Link
                  key={s.id}
                  to={`/ecommerce/session/${s.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sea-teal hover:shadow-md"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {passed ? '✓' : s.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">Session {s.id}: {s.title}</span>
                    <span className="mt-0.5 block text-sm text-slate-500">
                      {sc ? `Quiz: ${sc.score}/${sc.total} (${sc.pct}%)` : s.summary}
                    </span>
                  </span>
                  <span className="text-slate-400">→</span>
                </Link>
              );
            })}
          </div>

          <section className="mt-12">
            <p className="text-xs font-bold uppercase tracking-widest text-sea-teal">The end of the road</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{ecommerceConclusion.heading}</h2>
            {ecommerceConclusion.paragraphs.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-slate-700">{p}</p>
            ))}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {ecommerceConclusion.journey.map((j, i) => (
                <div key={j.course} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-sea-teal">Course {i + 1}</p>
                  <p className="mt-1 font-bold text-slate-900">{j.course}</p>
                  <p className="mt-1 text-sm text-slate-600">{j.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <p className="text-xs font-bold uppercase tracking-widest text-sea-teal">Keep going</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Tools and resources</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ecommerceResources.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sea-teal hover:shadow-md"
                >
                  <span className="font-bold text-sea-teal">{r.title}</span>
                  <span className="ml-1 text-xs text-slate-400">↗</span>
                  <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                </a>
              ))}
            </div>
          </section>
        </>
      )}

      {active && (
        <>
          <Link to="/ecommerce" className="mb-6 inline-block text-sm font-semibold text-sea-teal">← All sessions</Link>
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Session {active.id}: {active.title}</h2>
          <SessionBody session={active} userId={user?.id} />
          {active.quiz && (
            <Quiz quiz={active.quiz} onScore={saveQuizScore} savedScore={quizScores[active.quiz.key]} />
          )}
          <div className="mt-8 flex items-center justify-between gap-4">
            {active.id > 1 ? (
              <button type="button" onClick={() => navigate(`/ecommerce/session/${active.id - 1}`)} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                ← Session {active.id - 1}
              </button>
            ) : <span />}
            {active.id < ecommerceSessions.length ? (
              <button type="button" onClick={() => navigate(`/ecommerce/session/${active.id + 1}`)} className="rounded-xl bg-sea-teal px-5 py-2.5 text-sm font-bold text-white shadow transition hover:brightness-110">
                Session {active.id + 1} →
              </button>
            ) : (
              <Link to="/ecommerce" className="rounded-xl bg-sea-teal px-5 py-2.5 text-sm font-bold text-white shadow transition hover:brightness-110">
                Finish course →
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  );
}
