import { useState } from 'react';
import SimulatorSaveBar from './SimulatorSaveBar';

const TECHNIQUES = [
  { id: 'role', label: 'Role Assignment', icon: '🎭', description: 'Tell the AI who to be', example: 'You are an experienced South African marketing consultant…', tip: 'Giving the AI a role focuses its answers. A "marketing consultant" answers differently from a "software developer".' },
  { id: 'context', label: 'Context & Background', icon: '📋', description: 'Provide relevant details', example: 'I run a small cleaning business in Soweto targeting residential homes…', tip: 'The more context you give, the more relevant the output. Include your industry, location, audience, and goals.' },
  { id: 'task', label: 'Clear Task', icon: '🎯', description: 'State exactly what you want', example: 'Write 5 Facebook ad headlines that highlight affordability and reliability.', tip: 'Be specific. "Write ad headlines" is vague. "Write 5 Facebook ad headlines for a cleaning service" is actionable.' },
  { id: 'format', label: 'Output Format', icon: '📐', description: 'Define how the answer should look', example: 'Present each headline as a numbered list with a one-sentence explanation.', tip: 'Ask for bullet points, tables, numbered lists, or specific word counts to get structured, usable output.' },
  { id: 'constraints', label: 'Constraints & Rules', icon: '⚠️', description: 'Set boundaries and limits', example: 'Keep each headline under 10 words. Use simple English. Do not use jargon.', tip: 'Constraints prevent the AI from going off track. Set word limits, tone rules, or things to avoid.' },
  { id: 'examples', label: 'Examples', icon: '💡', description: 'Show what good looks like', example: 'Good example: "Spotless Homes, Happy Families — Book Today"\nBad example: "We do cleaning and stuff"', tip: 'Giving examples of good and bad output helps the AI understand your quality standard.' },
];

const CHALLENGES = [
  {
    id: 1,
    title: 'Write a Product Description',
    difficulty: 'Beginner',
    color: 'emerald',
    scenario: 'You sell handmade beaded jewellery at a market in Cape Town. Write a prompt that gets the AI to create an Instagram product description.',
    hints: ['Assign a role (e.g. social media copywriter)', 'Mention the product, audience, and platform', 'Ask for specific length (e.g. under 100 words)', 'Request relevant hashtags'],
    sampleAnswer: 'You are a creative social media copywriter. Write an Instagram product description for handmade beaded jewellery sold at a market in Cape Town. The target audience is young women aged 20-35 who love unique, locally made accessories. Keep it under 100 words, use a warm and trendy tone, and include 5 relevant hashtags.',
  },
  {
    id: 2,
    title: 'Create a Business Email',
    difficulty: 'Intermediate',
    color: 'blue',
    scenario: 'You run a tutoring service and want to email local schools offering after-school maths programmes. Write a prompt that generates a professional partnership email.',
    hints: ['Set a professional tone', 'Include who you are and what you offer', 'Specify the email structure (greeting, intro, offer, call to action)', 'Add constraints like word count and formality'],
    sampleAnswer: 'You are a professional business communication specialist. Write a partnership proposal email from a tutoring service called "MathsUp" to a school principal. The email should introduce the service, highlight benefits for learners (improved pass rates, affordable pricing at R200/month), and request a meeting. Use a formal but friendly tone. Structure: greeting, introduction, value proposition, call to action, sign-off. Keep it under 200 words.',
  },
  {
    id: 3,
    title: 'Build a Marketing Strategy',
    difficulty: 'Advanced',
    color: 'purple',
    scenario: 'You are launching a mobile car wash service in Johannesburg. Write a prompt that gets the AI to create a full 30-day social media strategy.',
    hints: ['Assign a strategist role', 'Provide full business context', 'Request a structured weekly plan', 'Specify platforms, content types, and posting frequency', 'Add examples of the tone you want'],
    sampleAnswer: 'You are an experienced digital marketing strategist specialising in small businesses in South Africa. Create a 30-day social media marketing plan for "SparkleWash", a mobile car wash service launching in Sandton, Johannesburg. Target audience: working professionals aged 25-45 who value convenience. Platforms: Instagram and Facebook. Include: Week 1 (brand awareness), Week 2 (engagement), Week 3 (promotions), Week 4 (testimonials and referrals). For each week, provide 3 post ideas with captions. Tone: friendly, professional, energetic. Budget: R500/month for boosted posts. Present as a table with columns: Day, Platform, Content Type, Caption, Goal.',
  },
];

const SCORING_CRITERIA = [
  { label: 'Role assigned', key: 'role', check: (t) => /you are|act as|pretend|role of|as a/i.test(t) },
  { label: 'Context provided', key: 'context', check: (t) => t.length > 80 && /business|service|product|company|sell|offer|provide/i.test(t) },
  { label: 'Clear task stated', key: 'task', check: (t) => /write|create|generate|make|design|build|list|draft|develop/i.test(t) },
  { label: 'Format specified', key: 'format', check: (t) => /bullet|list|table|paragraph|numbered|word|structure|format|column/i.test(t) },
  { label: 'Constraints set', key: 'constraints', check: (t) => /under|maximum|limit|avoid|don't|do not|keep it|at most|no more than|simple/i.test(t) },
  { label: 'Specific details', key: 'details', check: (t) => /\d/.test(t) && t.split(' ').length > 25 },
];

export default function PromptSimulator({ userId }) {
  const [activeTab, setActiveTab] = useState('learn');
  const [expandedTechnique, setExpandedTechnique] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [userPrompts, setUserPrompts] = useState({});
  const [showSample, setShowSample] = useState({});
  const [scored, setScored] = useState({});
  const completedCount = Object.keys(scored).length;

  const scorePrompt = (challengeId) => {
    const text = userPrompts[challengeId] || '';
    const results = SCORING_CRITERIA.map((c) => ({ ...c, passed: c.check(text) }));
    const total = results.filter((r) => r.passed).length;
    setScored((prev) => ({ ...prev, [challengeId]: { results, total, max: results.length } }));
  };

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-2xl">🧠</span>
          <div>
            <h3 className="text-xl font-bold">Prompt Engineering Simulator</h3>
            <p className="text-sm text-white/80">Master the art of writing effective AI prompts</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-indigo-100">
        {[
          { id: 'learn', label: 'Learn Techniques', icon: '📖' },
          { id: 'practice', label: 'Practice Challenges', icon: '🏋️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {activeTab === 'learn' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-4">
              A great prompt has six building blocks. Click each one to learn how it works with a real example.
            </p>
            {TECHNIQUES.map((tech, i) => (
              <div key={tech.id} className="rounded-xl border border-indigo-100 bg-white overflow-hidden">
                <button
                  onClick={() => setExpandedTechnique(expandedTechnique === tech.id ? null : tech.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-indigo-50/50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-lg">{tech.icon}</span>
                  <div className="flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Block {i + 1}</span>
                    <h4 className="font-bold text-slate-900">{tech.label}</h4>
                    <p className="text-xs text-slate-500">{tech.description}</p>
                  </div>
                  <svg className={`h-5 w-5 text-gray-400 transition ${expandedTechnique === tech.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expandedTechnique === tech.id && (
                  <div className="border-t border-indigo-50 bg-indigo-50/30 px-4 py-4 space-y-3">
                    <div className="rounded-lg bg-white border border-indigo-100 p-3">
                      <span className="text-xs font-bold text-indigo-500">EXAMPLE</span>
                      <p className="mt-1 text-sm font-mono text-slate-700 whitespace-pre-line">{tech.example}</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <span className="text-lg">💡</span>
                      <p className="text-sm text-amber-800">{tech.tip}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-center">
              <p className="text-sm font-semibold">Ready to practice?</p>
              <button
                onClick={() => setActiveTab('practice')}
                className="mt-2 rounded-lg bg-white px-5 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
              >
                Start Challenges →
              </button>
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div>
            {/* Challenge selector */}
            <div className="mb-5 flex gap-2">
              {CHALLENGES.map((ch, i) => {
                const done = scored[ch.id];
                const colors = { emerald: 'border-emerald-300 bg-emerald-50 text-emerald-800', blue: 'border-blue-300 bg-blue-50 text-blue-800', purple: 'border-purple-300 bg-purple-50 text-purple-800' };
                const activeColors = { emerald: 'border-emerald-500 bg-emerald-100', blue: 'border-blue-500 bg-blue-100', purple: 'border-purple-500 bg-purple-100' };
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChallenge(i)}
                    className={`flex-1 rounded-xl border-2 p-3 text-center text-xs font-bold transition ${
                      activeChallenge === i ? activeColors[ch.color] : colors[ch.color]
                    }`}
                  >
                    {done && <span className="mr-1">✓</span>}
                    {ch.difficulty}
                  </button>
                );
              })}
            </div>

            {/* Active challenge */}
            {(() => {
              const ch = CHALLENGES[activeChallenge];
              const sc = scored[ch.id];
              const diffColors = { emerald: 'bg-emerald-100 text-emerald-800', blue: 'bg-blue-100 text-blue-800', purple: 'bg-purple-100 text-purple-800' };
              return (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${diffColors[ch.color]}`}>{ch.difficulty}</span>
                      <h4 className="text-lg font-bold text-slate-900">{ch.title}</h4>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900 mb-1">Scenario:</p>
                      <p>{ch.scenario}</p>
                    </div>
                  </div>

                  {/* Hints */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Hints — try to include these:</p>
                    <div className="flex flex-wrap gap-2">
                      {ch.hints.map((h, i) => (
                        <span key={i} className="rounded-full bg-white border border-amber-200 px-3 py-1 text-xs text-amber-800">{h}</span>
                      ))}
                    </div>
                  </div>

                  {/* User input */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Your Prompt:</label>
                    <textarea
                      value={userPrompts[ch.id] || ''}
                      onChange={(e) => setUserPrompts((p) => ({ ...p, [ch.id]: e.target.value }))}
                      placeholder="Write your prompt here… Remember to include a role, context, clear task, format, and constraints."
                      rows={6}
                      className="w-full rounded-xl border-2 border-indigo-200 bg-white p-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{(userPrompts[ch.id] || '').split(' ').filter(Boolean).length} words</span>
                      <button
                        onClick={() => scorePrompt(ch.id)}
                        disabled={!(userPrompts[ch.id] || '').trim()}
                        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Score My Prompt
                      </button>
                    </div>
                  </div>

                  {/* Score results */}
                  {sc && (
                    <div className="rounded-xl border-2 border-indigo-200 bg-white p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900">Prompt Score</h4>
                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${sc.total >= 5 ? 'bg-emerald-100 text-emerald-800' : sc.total >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {sc.total}/{sc.max} {sc.total >= 5 ? '— Excellent!' : sc.total >= 3 ? '— Good start' : '— Keep improving'}
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sc.results.map((r) => (
                          <div key={r.key} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${r.passed ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                            <span className="text-base">{r.passed ? '✅' : '❌'}</span>
                            {r.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sample answer toggle */}
                  <button
                    onClick={() => setShowSample((s) => ({ ...s, [ch.id]: !s[ch.id] }))}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    {showSample[ch.id] ? 'Hide' : 'Show'} sample answer
                  </button>
                  {showSample[ch.id] && (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">Sample Prompt</p>
                      <p className="text-sm font-mono text-slate-700 leading-relaxed whitespace-pre-line">{ch.sampleAnswer}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Progress */}
            <div className="mt-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-indigo-900">Progress: {completedCount}/3 challenges scored</p>
                <div className="mt-1.5 h-2 w-40 overflow-hidden rounded-full bg-indigo-200">
                  <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${(completedCount / 3) * 100}%` }} />
                </div>
              </div>
              {completedCount >= 2 && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Ready to save!</span>
              )}
            </div>
          </div>
        )}
      </div>

      {completedCount >= 2 && (
        <div className="border-t border-indigo-100 p-4">
          <SimulatorSaveBar
            userId={userId}
            simId={21}
            label="Prompt Engineering"
            snapshotData={{
              challengesScored: completedCount,
              scores: Object.entries(scored).map(([id, s]) => ({ challengeId: Number(id), score: s.total, max: s.max })),
            }}
          />
        </div>
      )}
    </div>
  );
}
