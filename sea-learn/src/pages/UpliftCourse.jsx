import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import { upliftSessions } from '../data/courseChapters';
import AssignmentSubmission from '../components/AssignmentSubmission';
import CodePlayground from '../components/CodePlayground';
import LogoMaker from '../components/LogoMaker';
import FacebookAdSimulator from '../components/FacebookAdSimulator';
import WebsitePromptSimulator from '../components/WebsitePromptSimulator';
import PromptSimulator from '../components/PromptSimulator';
import FreeUserBanner from '../components/FreeUserBanner';
import Certificate from '../components/Certificate';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function ResponsiveVideo({ url, title }) {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black shadow-lg">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function ResourceList({ resources }) {
  if (!resources?.length) return null;
  return (
    <div className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-6">
      <h3 className="mb-4 text-lg font-bold text-slate-900">Additional Resources</h3>
      <div className="space-y-3">
        {resources.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md hover:border-sea-teal border border-transparent"
          >
            <span className="font-semibold text-sea-teal">{r.title}</span>
            <span className="ml-1.5 text-xs text-gray-400">↗</span>
            <p className="mt-1 text-sm text-gray-600">{r.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

const PROGRESS_KEY = 'uplift-chapter-progress';
const QUIZ_KEY = 'uplift-quiz-scores';
const SK_ACADEMY_LEARNERS_LICENCE_URL = 'https://skonlineacademy.thinkific.com/users/sign_in';
const SIM_TO_SESSION = { 21: 2, 31: 3, 41: 4, 51: 5 };
const REQUIRED_QUIZ_KEYS = [
  'Market Research Knowledge Check',
  'Branding Knowledge Check',
  'Digital Advertising Knowledge Check',
  'Knowledge Check — The Anatomy of a Website',
  'Final Quiz — Web Development Fundamentals',
];

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function loadLocal(key, userId) {
  try {
    const raw = localStorage.getItem(`${key}-${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLocal(key, userId, data) {
  localStorage.setItem(`${key}-${userId}`, JSON.stringify(data));
}

function saveProgressToSupabase(userId, chapterId, type, data) {
  const simId = type === 'chapter' ? chapterId + 100 : chapterId + 200;
  supabase.from('assignment_submissions').upsert({
    user_id: userId,
    chapter_id: simId,
    status: 'submitted',
    explanation: JSON.stringify({ type, chapterId, ...data }),
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'user_id,chapter_id' });
}

export default function UpliftCourse() {
  const { chapterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isFinalTask = location.pathname.endsWith('/final-task');

  const chapterNum = parseInt(chapterId || '1', 10);
  const chapter = upliftSessions.find((c) => c.id === chapterNum) || upliftSessions[0];

  const [completedChapters, setCompletedChapters] = useState({});
  const [completedSims, setCompletedSims] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submissions, setSubmissions] = useState({});
  const [quizScores, setQuizScores] = useState({});
  const [submittedQuizKeys, setSubmittedQuizKeys] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    setCompletedChapters(loadLocal(PROGRESS_KEY, user.id));
    setQuizScores(loadLocal(QUIZ_KEY, user.id));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from('assignment_submissions')
      .select('chapter_id, status, youtube_url, file_url, explanation')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map = {};
        const chProgress = {};
        const qScores = {};
        const simsDone = {};
        data.forEach((s) => {
          map[s.chapter_id] = s;
          if (s.chapter_id in SIM_TO_SESSION && s.status === 'submitted') {
            simsDone[SIM_TO_SESSION[s.chapter_id]] = true;
          }
          if (s.explanation) {
            try {
              const parsed = JSON.parse(s.explanation);
              if (parsed.type === 'chapter' && s.status === 'submitted') {
                chProgress[parsed.chapterId] = true;
              }
              if (parsed.type === 'quiz' && s.status === 'submitted') {
                qScores[parsed.quizKey] = { score: parsed.score, total: parsed.total, pct: parsed.pct };
              }
            } catch {}
          }
        });
        setSubmissions(map);
        setCompletedSims(simsDone);
        setSubmittedQuizKeys(new Set(Object.keys(qScores)));
        const mergedProgress = { ...loadLocal(PROGRESS_KEY, user.id), ...chProgress };
        setCompletedChapters(mergedProgress);
        saveLocal(PROGRESS_KEY, user.id, mergedProgress);
        const mergedQuiz = { ...loadLocal(QUIZ_KEY, user.id), ...qScores };
        setQuizScores(mergedQuiz);
        saveLocal(QUIZ_KEY, user.id, mergedQuiz);
      });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    const handleActivitySubmitted = (event) => {
      const sessionId = SIM_TO_SESSION[event.detail?.activityId];
      if (sessionId) {
        setCompletedSims((current) => ({ ...current, [sessionId]: true }));
      }
    };
    window.addEventListener('sea:activity-submitted', handleActivitySubmitted);
    return () => window.removeEventListener('sea:activity-submitted', handleActivitySubmitted);
  }, []);

  const markComplete = useCallback(() => {
    if (!user) return;
    const next = { ...completedChapters, [chapter.id]: true };
    setCompletedChapters(next);
    saveLocal(PROGRESS_KEY, user.id, next);
    saveProgressToSupabase(user.id, chapter.id, 'chapter', { completed: true });
  }, [user, chapter.id, completedChapters]);

  const saveQuizScore = useCallback(async (quizKey, score, total) => {
    if (!user) return;
    const pct = Math.round((score / total) * 100);
    const next = { ...quizScores, [quizKey]: { score, total, pct } };
    setQuizScores(next);
    saveLocal(QUIZ_KEY, user.id, next);
    const simId = (Math.abs(hashStr(quizKey)) % 9000) + 1000;
    const { error } = await supabase.from('assignment_submissions').upsert({
      user_id: user.id,
      chapter_id: simId,
      status: 'submitted',
      explanation: JSON.stringify({ type: 'quiz', quizKey, score, total, pct }),
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_id,chapter_id' });
    if (!error) {
      setSubmittedQuizKeys((current) => new Set([...current, quizKey]));
    }
  }, [user, quizScores]);

  const overallProgress = useMemo(() => {
    const done = upliftSessions.filter((c) => completedChapters[c.id]).length;
    return Math.round((done / upliftSessions.length) * 100);
  }, [completedChapters]);

  const sessionsComplete = upliftSessions.every((session) => completedChapters[session.id]);
  const requiredAssignmentIds = upliftSessions.filter((session) => session.hasAssignment).map((session) => session.id);
  const assignmentsSubmitted = requiredAssignmentIds.every((id) => submissions[id]?.status === 'submitted');
  const simulatorsSubmitted = Object.values(SIM_TO_SESSION).every((sessionId) => completedSims[sessionId]);
  const quizzesSubmitted = REQUIRED_QUIZ_KEYS.every((key) => submittedQuizKeys.has(key));
  const finalTaskUnlocked = sessionsComplete && assignmentsSubmitted && simulatorsSubmitted && quizzesSubmitted;

  const isUnlocked = useCallback((id) => id === 1 || completedChapters[id - 1], [completedChapters]);

  useEffect(() => {
    if (!isFinalTask && !isUnlocked(chapterNum)) {
      const lastUnlocked = upliftSessions.reduce((max, c) => isUnlocked(c.id) ? c.id : max, 1);
      navigate(`/uplift/session/${lastUnlocked}`, { replace: true });
    }
  }, [chapterNum, isFinalTask, isUnlocked, navigate]);

  const goTo = (id) => {
    if (!isUnlocked(id)) return;
    navigate(`/uplift/session/${id}`);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const goToFinalTask = () => {
    navigate('/uplift/final-task');
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b bg-white p-4 lg:hidden">
        <h1 className="text-lg font-bold text-slate-900">Uplift Digital Accelerator</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold">
          {sidebarOpen ? 'Close' : 'Sessions'}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} w-full border-b bg-white p-5 lg:block lg:w-72 lg:border-b-0 lg:border-r lg:min-h-screen`}>
        <h1 className="text-xl font-bold text-slate-900">Uplift Digital Accelerator</h1>
        <p className="mt-1 text-xs text-gray-500">By SEA &amp; Africa Forward</p>

        <div className="my-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-sea-teal transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="mb-5 text-sm font-semibold text-gray-600">{overallProgress}% complete</p>

        <nav className="space-y-1.5">
          {upliftSessions.map((c) => {
            const locked = !isUnlocked(c.id);
            return (
            <button
              key={c.id}
              onClick={() => goTo(c.id)}
              disabled={locked}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                locked
                  ? 'cursor-not-allowed opacity-50'
                  : !isFinalTask && c.id === chapter.id
                    ? 'bg-sea-teal text-white shadow-md'
                    : 'hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                {locked ? (
                  <span className="shrink-0">🔒</span>
                ) : completedChapters[c.id] ? (
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
                    <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
                <span>
                  <span className="block font-semibold">Session {c.id}</span>
                  <span className={`block text-xs ${locked ? 'text-gray-400' : !isFinalTask && c.id === chapter.id ? 'text-white/80' : 'text-gray-500'}`}>{c.title}</span>
                </span>
              </span>
            </button>
            );
          })}
          <button
            type="button"
            onClick={goToFinalTask}
            disabled={!finalTaskUnlocked}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
              isFinalTask
                ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-md'
                : finalTaskUnlocked
                  ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
                  : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
            }`}
          >
            <span className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5">{finalTaskUnlocked ? '★' : '🔒'}</span>
              <span>
                <span className="block font-semibold">Final Task</span>
                <span className={`block text-xs ${isFinalTask ? 'text-slate-800' : finalTaskUnlocked ? 'text-amber-800' : 'text-gray-400'}`}>
                  Learner&apos;s Licence Course
                </span>
              </span>
            </span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:py-12">
          {isFinalTask ? (
            <FinalTask
              unlocked={finalTaskUnlocked}
              sessionsComplete={sessionsComplete}
              assignmentsSubmitted={assignmentsSubmitted}
              simulatorsSubmitted={simulatorsSubmitted}
              quizzesSubmitted={quizzesSubmitted}
              profile={profile}
            />
          ) : (
          <>
          <p className="mb-2 inline-flex rounded-full bg-sea-teal/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-sea-teal">
            Session {chapter.id}
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {chapter.title}
          </h2>

          <div className="mt-8 space-y-10">
            <ChapterContent chapter={chapter} userId={user?.id} submissions={submissions} quizScores={quizScores} onQuizScore={saveQuizScore} onSubmissionChange={() => {
              if (!user) return;
              supabase
                .from('assignment_submissions')
                .select('chapter_id, status, youtube_url, file_url, explanation')
                .eq('user_id', user.id)
                .then(({ data }) => {
                  if (!data) return;
                  const map = {};
                  data.forEach((s) => { map[s.chapter_id] = s; });
                  setSubmissions(map);
                });
            }} />
          </div>

          {/* Summary & Recap */}
          {chapter.summary && (
            <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="mb-3 text-lg font-bold text-emerald-900">Session Summary</h3>
              <div className="space-y-2 text-sm text-emerald-800">
                {chapter.summary.map((s, i) => <p key={i}>{s}</p>)}
              </div>
              <div className="mt-4 rounded-xl bg-emerald-100 p-4">
                <h4 className="mb-2 font-semibold text-emerald-900">Recap</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-800">
                  {(chapter.learningOutcomes || []).map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Mark Complete & Navigation */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {!completedChapters[chapter.id] ? (
              <button
                onClick={markComplete}
                disabled={chapter.hasAssignment && !submissions[chapter.id] && !completedSims[chapter.id]}
                className="rounded-xl bg-sea-teal px-6 py-3 font-bold text-white shadow-md transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Session as Complete
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-3 font-bold text-emerald-800">
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                  <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Session Completed
              </span>
            )}

            <div className="flex gap-3">
              {chapter.id > 1 && (
                <button
                  onClick={() => goTo(chapter.id - 1)}
                  className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-sea-teal hover:text-sea-teal"
                >
                  ← Previous
                </button>
              )}
              {chapter.id < upliftSessions.length && (
                <button
                  onClick={() => goTo(chapter.id + 1)}
                  disabled={!completedChapters[chapter.id]}
                  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completedChapters[chapter.id] ? `Continue to Session ${chapter.id + 1} →` : '🔒 Complete this session first'}
                </button>
              )}
            </div>
          </div>

          {chapter.hasAssignment && !submissions[chapter.id] && !completedSims[chapter.id] && (
            <p className="mt-3 text-sm text-amber-700">Submit the assignment or complete the simulator above to mark this session as complete.</p>
          )}
          </>
          )}
        </div>
      </main>
      <FreeUserBanner profile={profile} />
    </div>
  );
}

function FinalTask({ unlocked, sessionsComplete, assignmentsSubmitted, simulatorsSubmitted, quizzesSubmitted, profile }) {
  const requirements = [
    { label: 'Complete 100% of the course sessions', complete: sessionsComplete },
    { label: 'Submit every practical assignment', complete: assignmentsSubmitted },
    { label: 'Submit every interactive simulator activity', complete: simulatorsSubmitted },
    { label: 'Submit every knowledge check and quiz', complete: quizzesSubmitted },
  ];

  return (
    <section>
      <p className="mb-2 inline-flex rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-amber-800">
        Final Task
      </p>
      <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Learner&apos;s Licence Course
      </h2>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Your final task is the SK Academy Learner&apos;s Licence course, which has helped more than 30,000 students prepare for and pass their learner&apos;s licence.
      </p>

      <div className={`mt-8 rounded-3xl border-2 p-6 sm:p-8 ${unlocked ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-start gap-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${unlocked ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-500'}`} aria-hidden="true">
            {unlocked ? '★' : '🔒'}
          </span>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {unlocked ? 'Final task unlocked' : 'Complete the course to unlock this task'}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {unlocked
                ? 'You have completed every session and properly submitted every required activity.'
                : 'The SK Academy course link unlocks only after every requirement below is complete.'}
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {requirements.map((requirement) => (
            <li key={requirement.label} className="flex items-center gap-3 rounded-xl border border-white bg-white p-4 text-sm shadow-sm">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold ${requirement.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {requirement.complete ? '✓' : '—'}
              </span>
              <span className={requirement.complete ? 'font-semibold text-emerald-800' : 'text-slate-600'}>{requirement.label}</span>
            </li>
          ))}
        </ul>

        {unlocked && (
          <a
            href={SK_ACADEMY_LEARNERS_LICENCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center rounded-xl bg-sea-teal px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start the Learner&apos;s Licence Course
            <span className="ml-2" aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      {unlocked && (
        <div className="mt-10 rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8">
          <div className="mb-6 text-center">
            <span className="text-4xl">🎓</span>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Your Certificate</h3>
            <p className="mt-1 text-sm text-slate-600">
              Congratulations{profile?.first_name ? `, ${profile.first_name}` : ''}! Download your certificate of completion below.
            </p>
          </div>
          <Certificate
            name={profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Learner'}
            date={new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
          />
        </div>
      )}
    </section>
  );
}

function ChapterContent({ chapter, userId, submissions, onSubmissionChange, onQuizScore, quizScores }) {
  switch (chapter.id) {
    case 1: return <Chapter1 chapter={chapter} />;
    case 2: return <Chapter2 chapter={chapter} userId={userId} submission={submissions[2]} onSubmissionChange={onSubmissionChange} onQuizScore={onQuizScore} quizScores={quizScores} />;
    case 3: return <Chapter3 chapter={chapter} userId={userId} submission={submissions[3]} onSubmissionChange={onSubmissionChange} onQuizScore={onQuizScore} quizScores={quizScores} />;
    case 4: return <Chapter4 chapter={chapter} userId={userId} submission={submissions[4]} onSubmissionChange={onSubmissionChange} onQuizScore={onQuizScore} quizScores={quizScores} />;
    case 5: return <Chapter5 chapter={chapter} userId={userId} submission={submissions[5]} onSubmissionChange={onSubmissionChange} onQuizScore={onQuizScore} quizScores={quizScores} />;
    default: return null;
  }
}

function Chapter1({ chapter }) {
  return (
    <>
      <ResponsiveVideo url={chapter.introVideo} title="Uplift Programme Introduction" />

      <div className="space-y-4 text-lg leading-8 text-slate-700">
        {chapter.intro.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h3 className="text-xl font-bold">What Participants Will Learn</h3>
        <p className="mt-2 text-sm text-cyan-100">By completing this course, participants will learn how to:</p>
        <ul className="mt-4 space-y-2.5">
          {chapter.learningOutcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sea-teal">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      <ResponsiveVideo url={chapter.breakdownVideo} title="Programme Breakdown" />
    </>
  );
}

function Chapter2({ chapter, userId, submission, onSubmissionChange, onQuizScore, quizScores }) {
  return (
    <>
      <div className="space-y-4 text-lg leading-8 text-slate-700">
        <p>{chapter.introText}</p>
      </div>

      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h3 className="text-xl font-bold">Learning Objectives</h3>
        <p className="mt-2 text-sm text-cyan-100">Participants should learn how to:</p>
        <ul className="mt-4 space-y-2.5">
          {chapter.learningOutcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sea-teal">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      <ResponsiveVideo url={chapter.mainVideo} title="Market and Product Research" />

      {/* Visual Research Steps */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">The 5-Step Research Process</h3>
        <p className="mb-6 text-slate-600">Follow this proven framework to validate any business idea before investing time and money.</p>
        <div className="space-y-4">
          {chapter.researchSteps.map((s) => {
            const colors = { blue: 'border-blue-300 bg-blue-50', purple: 'border-purple-300 bg-purple-50', pink: 'border-pink-300 bg-pink-50', amber: 'border-amber-300 bg-amber-50', emerald: 'border-emerald-300 bg-emerald-50' };
            const textColors = { blue: 'text-blue-900', purple: 'text-purple-900', pink: 'text-pink-900', amber: 'text-amber-900', emerald: 'text-emerald-900' };
            const subColors = { blue: 'text-blue-700', purple: 'text-purple-700', pink: 'text-pink-700', amber: 'text-amber-700', emerald: 'text-emerald-700' };
            return (
              <div key={s.step} className={`flex items-start gap-4 rounded-xl border-2 p-5 ${colors[s.color]}`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                  {s.icon}
                </div>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${subColors[s.color]}`}>Step {s.step}</span>
                  <h4 className={`text-lg font-bold ${textColors[s.color]}`}>{s.title}</h4>
                  <p className={`mt-1 text-sm ${subColors[s.color]}`}>{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 text-lg leading-8 text-slate-700">
        {chapter.writtenLesson.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* Customer Persona Template */}
      <div className="rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6">
        <h3 className="mb-2 text-lg font-bold text-cyan-900">🧑‍💼 {chapter.personaTemplate.title}</h3>
        <p className="mb-4 text-sm text-cyan-700">Fill this in for your ideal customer. The clearer the picture, the better your marketing.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {chapter.personaTemplate.fields.map((f, i) => (
            <div key={i} className="rounded-lg border border-cyan-200 bg-white p-3">
              <label className="block text-xs font-bold uppercase tracking-wide text-cyan-600">{f}</label>
              <input type="text" placeholder={`Enter ${f.toLowerCase()}...`} className="mt-1 w-full border-0 border-b border-cyan-100 bg-transparent p-1 text-sm text-slate-700 outline-none focus:border-cyan-400 placeholder:text-gray-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Interview Questions */}
      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h3 className="mb-1 text-lg font-bold">🎤 Customer Interview Script</h3>
        <p className="mb-5 text-sm text-cyan-200">Use these open-ended questions when interviewing potential customers:</p>
        <ol className="space-y-3">
          {chapter.interviewQuestions.map((q, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sea-teal/20 text-sm font-bold text-sea-teal">{i + 1}</span>
              <span className="text-sm leading-relaxed text-gray-200">&ldquo;{q}&rdquo;</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-cyan-300">💡 Pro tip: Record their answers (with permission) and look for patterns across all interviews. Three or more people mentioning the same problem is a strong signal.</p>
      </div>

      {/* Prompt Engineering Simulator */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Master AI Prompts</h3>
        <p className="mb-4 text-slate-600">Learn how to write effective prompts that get the best results from AI tools like ChatGPT and Claude — a skill you will use throughout this course and your business.</p>
        <PromptSimulator userId={userId} />
      </div>

      <ResourceList resources={chapter.resources} />

      <Quiz questions={chapter.quiz} title="Market Research Knowledge Check" onScore={onQuizScore} savedScore={quizScores?.['Market Research Knowledge Check']} />

      {/* Google Trends Assignment */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
        <h3 className="mb-2 text-lg font-bold text-amber-900">Practical Assignment — Google Trends Research</h3>
        <div className="mb-4 space-y-3 text-sm text-amber-800">
          <p className="font-semibold">Follow these steps:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Go to <a href="https://trends.google.com" target="_blank" rel="noopener noreferrer" className="font-bold text-sea-teal underline">Google Trends</a> and set the location to <strong>South Africa</strong>.</li>
            <li>Search for a keyword related to your business idea or product (e.g. "meal kits", "tutoring", "cleaning services").</li>
            <li>Look at the <strong>Interest over time</strong> graph — is it going up, down, or staying flat?</li>
            <li>Scroll down and check <strong>Related topics</strong> and <strong>Related queries</strong> for new insights.</li>
            <li>Write your findings in the text box below using the format provided.</li>
          </ol>
        </div>
        <p className="mb-4 text-sm text-amber-800">{chapter.assignmentInstructions}</p>
        <AssignmentSubmission
          chapterId={chapter.id}
          type="text-explanation"
          userId={userId}
          existingSubmission={submission}
          onSubmissionChange={onSubmissionChange}
        />
      </div>
    </>
  );
}

function Chapter3({ chapter, userId, submission, onSubmissionChange, onQuizScore, quizScores }) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(chapter.aiPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <div className="space-y-4 text-lg leading-8 text-slate-700">
        <p>{chapter.introText}</p>
      </div>

      {chapter.videos.map((v, i) => (
        <div key={i}>
          <h3 className="mb-3 text-lg font-bold text-slate-800">{v.title}</h3>
          <ResponsiveVideo url={v.url} title={v.title} />
        </div>
      ))}

      {/* Colour Psychology */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">🎨 Colour Psychology in Branding</h3>
        <p className="mb-5 text-slate-600">Colours trigger emotions. Choose brand colours that align with the feeling you want customers to associate with your business.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chapter.colorPsychology.map((c) => (
            <div key={c.color} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="h-3" style={{ background: c.hex }} />
              <div className="p-4">
                <h4 className="font-bold" style={{ color: c.hex }}>{c.color}</h4>
                <p className="mt-1 text-sm text-gray-600">{c.meaning}</p>
                <p className="mt-2 text-xs text-gray-400">Used by: {c.brands}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Types */}
      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h3 className="mb-1 text-lg font-bold">Types of Logos</h3>
        <p className="mb-5 text-sm text-cyan-200">Choose the style that best fits your business:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {chapter.logoTypes.map((l) => (
            <div key={l.type} className="rounded-xl bg-white/5 p-4">
              <span className="text-2xl">{l.icon}</span>
              <h4 className="mt-2 font-bold text-white">{l.type}</h4>
              <p className="mt-1 text-sm text-gray-300">{l.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Maker */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Practice Logo Design</h3>
        <p className="mb-4 text-slate-600">Put your branding knowledge into practice — create a logo for your business using the tool below.</p>
        <LogoMaker userId={userId} />
      </div>

      {/* Brand Identity Checklist */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6">
        <h3 className="mb-2 text-lg font-bold text-emerald-900">✅ Brand Identity Checklist</h3>
        <p className="mb-4 text-sm text-emerald-700">Make sure you have all five elements before launching:</p>
        <div className="space-y-3">
          {chapter.brandChecklist.map((b, i) => (
            <label key={i} className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4 border border-emerald-100 transition hover:shadow-sm">
              <input type="checkbox" className="mt-1 h-5 w-5 rounded accent-emerald-600" />
              <div>
                <span className="mr-2 text-lg">{b.icon}</span>
                <span className="font-bold text-emerald-900">{b.item}</span>
                <p className="mt-0.5 text-sm text-emerald-700">{b.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <ResourceList resources={chapter.resources} />

      {/* Quiz */}
      <Quiz questions={chapter.quiz} title="Branding Knowledge Check" onScore={onQuizScore} savedScore={quizScores?.['Branding Knowledge Check']} />

      {/* AI Prompt with step-by-step */}
      <div className="rounded-2xl border-2 border-sea-teal/30 bg-white p-6">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Logo Design AI Prompt</h3>
        <p className="mb-4 text-sm text-gray-600">Follow these steps to generate your logo using AI:</p>

        <div className="mb-6 space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-sea-teal/20 bg-sea-teal/5 p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sea-teal text-sm font-bold text-white">1</span>
            <div className="text-sm text-slate-700"><strong>Read the prompt below</strong> — the yellow highlighted sections are where you fill in your own details.</div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-sea-teal/20 bg-sea-teal/5 p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sea-teal text-sm font-bold text-white">2</span>
            <div className="text-sm text-slate-700"><strong>Replace each highlighted field</strong> with your actual business information (e.g. replace <span className="rounded bg-yellow-200 px-1 font-mono text-xs">[BUSINESS NAME]</span> with your business name).</div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-sea-teal/20 bg-sea-teal/5 p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sea-teal text-sm font-bold text-white">3</span>
            <div className="text-sm text-slate-700"><strong>Copy the completed prompt</strong> and paste it into <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="font-bold text-sea-teal underline">ChatGPT</a>, <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="font-bold text-sea-teal underline">Claude</a>, or any AI design tool.</div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-sea-teal/20 bg-sea-teal/5 p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sea-teal text-sm font-bold text-white">4</span>
            <div className="text-sm text-slate-700"><strong>Download or screenshot</strong> the logo the AI generates and submit it in the assignment below.</div>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-sm leading-8 text-gray-800 font-mono">
          Create a modern and professional logo for a business called <span className="rounded bg-yellow-200 px-1.5 py-0.5 font-bold">[BUSINESS NAME]</span>. The business provides <span className="rounded bg-yellow-200 px-1.5 py-0.5 font-bold">[PRODUCT OR SERVICE]</span> and serves <span className="rounded bg-yellow-200 px-1.5 py-0.5 font-bold">[TARGET AUDIENCE]</span>. Use <span className="rounded bg-yellow-200 px-1.5 py-0.5 font-bold">[PREFERRED COLOURS]</span> as the main colours. The logo should communicate <span className="rounded bg-yellow-200 px-1.5 py-0.5 font-bold">[BRAND PERSONALITY OR VALUES]</span>. Include <span className="rounded bg-yellow-200 px-1.5 py-0.5 font-bold">[PREFERRED SYMBOL OR ICON, IF ANY]</span>. The design must be simple, memorable, scalable and suitable for a website, social media profile, printed material and favicon. Avoid <span className="rounded bg-yellow-200 px-1.5 py-0.5 font-bold">[ELEMENTS OR STYLES TO AVOID]</span>.
        </div>
        <button
          onClick={copyPrompt}
          className="mt-4 rounded-lg bg-sea-teal px-5 py-2.5 font-semibold text-white transition hover:bg-sea-teal/90"
        >
          {copied ? '✓ Copied!' : 'Copy Prompt'}
        </button>
      </div>

      {/* Assignment */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
        <h3 className="mb-2 text-lg font-bold text-amber-900">Logo Assignment</h3>
        <p className="mb-4 text-sm text-amber-800">{chapter.assignmentInstructions}</p>
        <AssignmentSubmission
          chapterId={chapter.id}
          type="logo-upload"
          userId={userId}
          existingSubmission={submission}
          onSubmissionChange={onSubmissionChange}
        />
      </div>
    </>
  );
}

function Quiz({ questions, title, onScore, savedScore }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(!!savedScore);

  const score = submitted
    ? (savedScore?.score ?? questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0))
    : 0;

  const handleSubmit = () => {
    setSubmitted(true);
    const s = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    onScore?.(title, s, questions.length);
  };

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-6">
      <h3 className="mb-1 text-lg font-bold text-violet-900">{title}</h3>
      <p className="mb-6 text-sm text-violet-700">
        {submitted
          ? `You scored ${score} out of ${questions.length} (${Math.round((score / questions.length) * 100)}%)`
          : `${questions.length} questions — select the best answer for each.`}
      </p>
      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className={`rounded-xl p-4 ${submitted ? (answers[qi] === q.correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200') : 'bg-white border border-violet-100'}`}>
            <p className="mb-3 font-semibold text-slate-800">{qi + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
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
                    name={`quiz-${title}-${qi}`}
                    disabled={submitted}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers({ ...answers, [qi]: oi })}
                    className="accent-violet-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-lg px-4 py-2 text-sm font-bold ${score >= questions.length * 0.7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {score >= questions.length * 0.7 ? '✅ Passed' : '⚠️ Try again to improve'}
          </span>
          <button
            onClick={() => { setAnswers({}); setSubmitted(false); }}
            className="rounded-xl border-2 border-violet-300 px-6 py-3 font-bold text-violet-700 transition hover:bg-violet-100"
          >
            Retry Quiz
          </button>
        </div>
      )}
    </div>
  );
}

function Chapter4({ chapter, userId, submission, onSubmissionChange, onQuizScore, quizScores }) {
  return (
    <>
      <div className="space-y-4 text-lg leading-8 text-slate-700">
        <p>{chapter.introText}</p>
      </div>

      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h3 className="text-xl font-bold">Learning Objectives</h3>
        <ul className="mt-4 space-y-2.5">
          {chapter.learningOutcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sea-teal">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      {/* Ad Platforms Comparison */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">📱 Advertising Platforms Compared</h3>
        <p className="mb-5 text-slate-600">Each platform has different strengths. Choose based on your goal and audience.</p>
        <div className="space-y-4">
          {chapter.adPlatforms.map((p) => (
            <div key={p.name} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3">
                <span className="text-2xl">{p.icon}</span>
                <h4 className="text-lg font-bold text-slate-900">{p.name}</h4>
                <span className="ml-auto rounded-full bg-sea-teal/10 px-3 py-1 text-xs font-bold text-sea-teal">{p.reach}</span>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Best For</span>
                  <p className="mt-1 text-sm text-slate-700">{p.bestFor}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Targeting</span>
                  <p className="mt-1 text-sm text-slate-700">{p.targeting}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Min Budget</span>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">{p.minBudget}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Funnel */}
      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h3 className="mb-2 text-lg font-bold">🔻 The Advertising Funnel (AIDA)</h3>
        <p className="mb-6 text-sm text-cyan-200">Every customer goes through these four stages. Your ads should target each one.</p>
        <div className="space-y-3">
          {chapter.adFunnel.map((f, i) => {
            const widths = ['w-full', 'w-11/12', 'w-10/12', 'w-9/12'];
            const bgColors = { blue: 'from-blue-500/20 to-blue-600/10', purple: 'from-purple-500/20 to-purple-600/10', pink: 'from-pink-500/20 to-pink-600/10', emerald: 'from-emerald-500/20 to-emerald-600/10' };
            const borderColors = { blue: 'border-blue-400/30', purple: 'border-purple-400/30', pink: 'border-pink-400/30', emerald: 'border-emerald-400/30' };
            return (
              <div key={f.stage} className={`${widths[i]} mx-auto rounded-xl border bg-gradient-to-r p-4 ${bgColors[f.color]} ${borderColors[f.color]}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <h4 className="font-bold">{f.stage}</h4>
                    <p className="text-sm text-gray-300">{f.description}</p>
                    <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs text-cyan-300">Measure: {f.metric}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {chapter.videos.map((v, i) => (
        <div key={i}>
          <h3 className="mb-3 text-lg font-bold text-slate-800">{v.title}</h3>
          <ResponsiveVideo url={v.url} title={v.title} />
        </div>
      ))}

      {/* WhatsApp Ad Step-by-Step Guide */}
      <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white text-xl">💬</span>
          <div>
            <h3 className="text-xl font-bold text-slate-900">How to Create a WhatsApp Ad — Step by Step</h3>
            <p className="text-sm text-slate-600">Follow along with the video above to set up your first WhatsApp ad.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-green-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">1</span>
              <div>
                <h4 className="font-bold text-slate-900">Download WhatsApp Business</h4>
                <p className="mt-1 text-sm text-slate-600">Go to the <strong>Google Play Store</strong> (Android) or <strong>App Store</strong> (iPhone) and search for <strong>&quot;WhatsApp Business&quot;</strong>. Download and install the app — it has a green icon with a &quot;B&quot; inside. This is different from the regular WhatsApp app.</p>
                <div className="mt-2 flex gap-2">
                  <a href="https://play.google.com/store/apps/details?id=com.whatsapp.w4b" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition">Google Play ↗</a>
                  <a href="https://apps.apple.com/app/whatsapp-business/id1386412985" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition">App Store ↗</a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">2</span>
              <div>
                <h4 className="font-bold text-slate-900">Set Up Your Business Profile</h4>
                <p className="mt-1 text-sm text-slate-600">Register with your business phone number. Then go to <strong>Settings → Business Tools → Business Profile</strong> and fill in your business name, category, description, address, business hours, email, and website. A complete profile builds trust with customers.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">3</span>
              <div>
                <h4 className="font-bold text-slate-900">Open the Advertise Feature</h4>
                <p className="mt-1 text-sm text-slate-600">From the WhatsApp Business home screen, tap the <strong>&quot;Advertise&quot;</strong> button (it may appear as a megaphone icon or in the three-dot menu at the top right). You can also find it under <strong>Settings → Business Tools → Advertise on Facebook</strong>.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">4</span>
              <div>
                <h4 className="font-bold text-slate-900">Create Your Ad</h4>
                <p className="mt-1 text-sm text-slate-600">Choose a photo or image for your ad. Write a short, compelling message that tells customers what you offer and why they should contact you. Keep it clear and direct — for example: <em>&quot;Fresh meal kits delivered to your door in Soweto. Order now!&quot;</em></p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">5</span>
              <div>
                <h4 className="font-bold text-slate-900">Choose Your Audience</h4>
                <p className="mt-1 text-sm text-slate-600">Select who should see your ad. You can choose <strong>Automatic</strong> (WhatsApp picks for you) or <strong>Custom</strong> to set specific targeting by location, age, gender, and interests. Start with your local area if you serve customers in person.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">6</span>
              <div>
                <h4 className="font-bold text-slate-900">Set Your Budget &amp; Duration</h4>
                <p className="mt-1 text-sm text-slate-600">Choose how much you want to spend per day and how many days the ad should run. You can start as low as <strong>R20/day</strong>. WhatsApp will show you an estimated reach based on your budget. Start small — you can always increase later based on results.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">7</span>
              <div>
                <h4 className="font-bold text-slate-900">Add Payment &amp; Publish</h4>
                <p className="mt-1 text-sm text-slate-600">Add a payment method (debit/credit card). Review your ad preview — this is how it will appear on Facebook and Instagram with a <strong>&quot;Send WhatsApp Message&quot;</strong> button. When you are happy, tap <strong>Create Ad</strong>. Your ad will be reviewed and go live within a few hours.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="font-bold text-amber-900">How It Works for Customers</h4>
                <p className="mt-1 text-sm text-amber-800">When someone sees your ad on Facebook or Instagram, they tap the <strong>&quot;Send WhatsApp Message&quot;</strong> button and land directly in a WhatsApp chat with your business. This is called a <strong>click-to-WhatsApp ad</strong> — one of the highest-converting ad types for small businesses in South Africa.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">📊 Key Advertising Metrics</h3>
        <p className="mb-5 text-slate-600">You need to understand these numbers to know if your ads are working.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chapter.adMetrics.map((m) => (
            <div key={m.metric} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <span className="text-2xl">{m.icon}</span>
              <h4 className="mt-2 font-bold text-slate-900">{m.metric}</h4>
              <p className="mt-1 text-sm text-gray-600">{m.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Facebook Ad Simulator */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Build Your Own Facebook Ad</h3>
        <p className="mb-4 text-slate-600">Practice creating a real Facebook ad campaign — choose your objective, audience, budget, and creative, then see estimated results.</p>
        <FacebookAdSimulator userId={userId} />
      </div>

      {/* Google Ads Placeholder */}
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-700">Google Ads Lesson</h3>
        <p className="mt-2 text-sm text-gray-500">
          The Google Ads video will be added here by the course administrator.
        </p>
        <p className="mt-1 text-xs text-gray-400">Placeholder — replace with a direct YouTube video URL in the admin panel.</p>
      </div>

      <ResourceList resources={chapter.resources} />

      {/* Quiz */}
      <Quiz questions={chapter.quiz} title="Digital Advertising Knowledge Check" onScore={onQuizScore} savedScore={quizScores?.['Digital Advertising Knowledge Check']} />

      {/* Assignment */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
        <h3 className="mb-2 text-lg font-bold text-amber-900">Practical Assignment</h3>
        <p className="mb-4 text-sm text-amber-800">{chapter.assignmentInstructions}</p>
        <AssignmentSubmission
          chapterId={chapter.id}
          type="youtube-link"
          userId={userId}
          existingSubmission={submission}
          onSubmissionChange={onSubmissionChange}
        />
      </div>
    </>
  );
}

function Chapter5({ chapter, userId, submission, onSubmissionChange, onQuizScore, quizScores }) {
  return (
    <>
      {/* Intro */}
      <div className="space-y-4 text-lg leading-8 text-slate-700">
        <p>{chapter.introText}</p>
      </div>

      {/* Learning Objectives */}
      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h3 className="text-xl font-bold">Learning Objectives</h3>
        <p className="mt-2 text-sm text-cyan-100">By completing this session you will be able to:</p>
        <ul className="mt-4 space-y-2.5">
          {chapter.learningOutcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sea-teal">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      {/* The Human Metaphor */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-xl font-bold text-slate-900">The Human Body Metaphor</h3>
        <p className="mb-6 text-slate-600">Just as the human body requires bones, skin, and organs to function, a website depends on HTML, CSS, and JavaScript working in perfect harmony.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-5 text-center">
            <img src="/images/chapter7/image7.png" alt="Skeleton — HTML" className="mx-auto mb-3 h-32 object-contain" />
            <h4 className="font-bold text-blue-900">HTML</h4>
            <p className="mt-1 text-sm text-blue-700">The Skeleton</p>
            <p className="mt-2 text-xs text-blue-600">Structure and content — headings, paragraphs, buttons, links</p>
          </div>
          <div className="rounded-xl bg-pink-50 p-5 text-center">
            <img src="/images/chapter7/image9.png" alt="Skin — CSS" className="mx-auto mb-3 h-32 object-contain" />
            <h4 className="font-bold text-pink-900">CSS</h4>
            <p className="mt-1 text-sm text-pink-700">The Skin &amp; Face</p>
            <p className="mt-2 text-xs text-pink-600">Visual identity — colours, fonts, spacing, layout</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-5 text-center">
            <img src="/images/chapter7/image11.png" alt="Organs — JavaScript" className="mx-auto mb-3 h-32 object-contain" />
            <h4 className="font-bold text-amber-900">JavaScript</h4>
            <p className="mt-1 text-sm text-amber-700">The Vital Organs</p>
            <p className="mt-2 text-xs text-amber-600">Logic and interactivity — clicks, animations, data</p>
          </div>
        </div>
      </div>

      {/* HTML: The Skeleton */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-slate-900">HTML: The Skeleton</h3>
        <p className="mb-4 text-slate-700">The dashed bones running through the figure — spine, ribcage, and limbs — represent HyperText Markup Language. Without these structural elements, the website would collapse into an unorganised heap of data.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {chapter.htmlElements.map((el, i) => (
            <div key={i} className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <span className="text-2xl">{el.icon}</span>
              <h4 className="mt-2 font-bold text-blue-900">{el.name}</h4>
              <p className="mt-1 text-sm text-blue-700">{el.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CSS: The Skin */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-slate-900">CSS: The Skin &amp; Face</h3>
        <p className="mb-4 text-slate-700">Cascading Style Sheets are the features that make a body unique: face features, warm skin tones, and ear shapes. CSS defines the visual identity — colours, fonts, and spacing — allowing one website to look vastly different from another.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {chapter.cssElements.map((el, i) => (
            <div key={i} className="rounded-xl border border-pink-200 bg-pink-50 p-4">
              <span className="text-2xl">{el.icon}</span>
              <h4 className="mt-2 font-bold text-pink-900">{el.name}</h4>
              <p className="mt-1 text-sm text-pink-700">{el.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* JavaScript: The Organs */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-slate-900">JavaScript: The Vital Organs</h3>
        <p className="mb-4 text-slate-700">JavaScript is represented by the glowing brain, heart, and lungs. It is what gives the page life. JS handles logic, responds to clicks, and animates elements. Without it, the website is static and unresponsive.</p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🧠</span>
            <div>
              <h4 className="font-bold text-amber-900">98% of Modern Websites Use JavaScript</h4>
              <p className="mt-1 text-sm text-amber-700">In today's digital landscape, JavaScript is the brain behind complex applications like Netflix, Instagram, and Gmail, handling real-time data and seamless animations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Web Adoption Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-xl font-bold text-slate-900">Global Web Adoption</h3>
        <img src="/images/chapter7/image13.png" alt="Web language adoption — HTML 100%, CSS 99.2%, JavaScript 98.1%" className="mx-auto max-w-lg" />
        <p className="mt-4 text-center text-sm text-slate-500">The combination of these three languages is non-negotiable for professional web development.</p>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <h3 className="mb-6 text-xl font-bold">The Evolution of the Web</h3>
        <div className="relative border-l-2 border-sea-teal/40 pl-6 space-y-6">
          {chapter.timeline.map((t, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-sea-teal" />
              <span className="text-sm font-bold text-sea-teal">{t.year}</span>
              <p className="mt-0.5 text-sm text-gray-300">{t.event}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Intro Quiz */}
      <Quiz questions={chapter.introQuiz} title="Knowledge Check — The Anatomy of a Website" onScore={onQuizScore} savedScore={quizScores?.['Knowledge Check — The Anatomy of a Website']} />

      {/* Interactive Code Playground */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Try It Yourself — Code Playground</h3>
        <p className="mb-4 text-slate-600">Now put theory into practice! Work through these guided challenges to build real HTML, CSS, and JavaScript — just like a developer.</p>
        <CodePlayground userId={userId} />
      </div>

      {/* Website Prompt Generator */}
      <div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Generate Your Website with AI</h3>
        <p className="mb-4 text-slate-600">Use this tool to describe your dream website — pick your business type, colours, and sections, then copy the generated prompt into any AI tool to build it instantly.</p>
        <WebsitePromptSimulator />
      </div>

      {/* Video Lesson */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-slate-800">Building a Website with AI</h3>
        <p className="mb-4 text-slate-600">Watch this practical demonstration of building a website using AI tools. Pay attention to how HTML, CSS, and JavaScript concepts are applied.</p>
        <ResponsiveVideo url={chapter.mainVideo} title="Web Development with AI" />
      </div>

      {/* Written Lesson */}
      <div className="space-y-4 text-lg leading-8 text-slate-700">
        {chapter.writtenLesson.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <ResourceList resources={chapter.resources} />

      {/* Final Quiz */}
      <Quiz questions={chapter.finalQuiz} title="Final Quiz — Web Development Fundamentals" onScore={onQuizScore} savedScore={quizScores?.['Final Quiz — Web Development Fundamentals']} />

      {/* Assignment */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
        <h3 className="mb-2 text-lg font-bold text-amber-900">Practical Assignment — Build Your Website</h3>
        <p className="mb-4 text-sm text-amber-800">{chapter.assignmentInstructions}</p>
        <AssignmentSubmission
          chapterId={chapter.id}
          type="youtube-link"
          userId={userId}
          existingSubmission={submission}
          onSubmissionChange={onSubmissionChange}
        />
      </div>
    </>
  );
}
