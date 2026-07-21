import { useEffect, useRef, useState } from 'react';
import SimulatorSaveBar from './SimulatorSaveBar';

const OBJECTIVES = [
  { id: 'awareness', label: 'Brand Awareness', icon: '📢', desc: 'Get your brand in front of new people', cpmRange: [4, 12] },
  { id: 'traffic', label: 'Website Traffic', icon: '🔗', desc: 'Drive people to your website', cpmRange: [6, 18] },
  { id: 'engagement', label: 'Engagement', icon: '❤️', desc: 'Get more likes, comments & shares', cpmRange: [3, 10] },
  { id: 'leads', label: 'Lead Generation', icon: '📋', desc: 'Collect contact info from interested people', cpmRange: [10, 30] },
  { id: 'sales', label: 'Sales / Conversions', icon: '🛒', desc: 'Drive purchases on your website', cpmRange: [15, 40] },
];

const AUDIENCES = [
  { id: 'broad', label: 'Broad Audience', desc: 'All adults 18-65', size: 15000000, icon: '🌍' },
  { id: 'interest', label: 'Interest-Based', desc: 'People interested in your niche', size: 2500000, icon: '🎯' },
  { id: 'local', label: 'Local Area', desc: 'People within 20km of your business', size: 350000, icon: '📍' },
  { id: 'lookalike', label: 'Lookalike', desc: 'People similar to your best customers', size: 1200000, icon: '👥' },
  { id: 'retarget', label: 'Retargeting', desc: 'People who visited your page/site', size: 50000, icon: '🔄' },
];

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55-65+'];

const CTA_BUTTONS = ['Learn More', 'Shop Now', 'Sign Up', 'Book Now', 'Contact Us', 'Get Offer', 'Send Message'];

const AD_TIPS = {
  awareness: [
    'Use eye-catching visuals — video performs 2x better than images for awareness.',
    'Keep text short: your brand name + one value proposition.',
    'Broad targeting works best here — let Facebook find your audience.',
  ],
  traffic: [
    'Your landing page must match your ad promise — consistency = conversions.',
    'Use a clear CTA button — "Learn More" or "Shop Now" work best.',
    'Test different headlines: question vs. statement vs. offer.',
  ],
  engagement: [
    'Ask questions to encourage comments.',
    'Use carousel ads to tell a story — they get 72% more clicks.',
    'Post at peak hours: 1-3pm on weekdays, 12-1pm on weekends.',
  ],
  leads: [
    'Offer something free: eBook, discount, consultation.',
    'Keep your lead form short — name + email is enough to start.',
    'Use a strong value proposition in your headline.',
  ],
  sales: [
    'Show your product in use — lifestyle images outperform product-only shots.',
    'Include social proof: reviews, testimonials, user count.',
    'Create urgency: limited time, low stock, countdown.',
  ],
};

export default function FacebookAdSimulator({ userId }) {
  const [screen, setScreen] = useState('build');
  const [objective, setObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [ageRange, setAgeRange] = useState([true, true, true, true, true]);
  const [dailyBudget, setDailyBudget] = useState(50);
  const [duration, setDuration] = useState(7);
  const [brandName, setBrandName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [ctaButton, setCtaButton] = useState('Learn More');
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewImage(ev.target.result);
      setImageUrl(file.name);
    };
    reader.readAsDataURL(file);
  };

  const selectedObjective = OBJECTIVES.find((o) => o.id === objective);
  const selectedAudience = AUDIENCES.find((a) => a.id === audience);

  const estimateResults = () => {
    if (!selectedObjective || !selectedAudience) return null;
    const totalBudget = dailyBudget * duration;
    const cpmAvg = (selectedObjective.cpmRange[0] + selectedObjective.cpmRange[1]) / 2;
    const audienceSize = selectedAudience.size;
    const selectedAges = ageRange.filter(Boolean).length;
    const ageFactor = selectedAges / AGE_RANGES.length;
    const adjustedAudience = Math.round(audienceSize * ageFactor);

    const impressions = Math.round((totalBudget / cpmAvg) * 1000);
    const reach = Math.min(Math.round(impressions * 0.7), adjustedAudience);
    const ctr = objective === 'engagement' ? 3.2 : objective === 'awareness' ? 1.1 : objective === 'traffic' ? 1.8 : objective === 'leads' ? 2.1 : 1.5;
    const clicks = Math.round(impressions * (ctr / 100));
    const conversions = objective === 'sales' ? Math.round(clicks * 0.025) : objective === 'leads' ? Math.round(clicks * 0.08) : 0;
    const cpc = clicks > 0 ? (totalBudget / clicks).toFixed(2) : '0.00';
    const costPerResult = objective === 'sales' && conversions > 0 ? (totalBudget / conversions).toFixed(2) : objective === 'leads' && conversions > 0 ? (totalBudget / conversions).toFixed(2) : null;
    const frequency = reach > 0 ? (impressions / reach).toFixed(1) : '0';

    return { totalBudget, impressions, reach, clicks, ctr, cpc, conversions, costPerResult, frequency, adjustedAudience };
  };

  const isReady = objective && audience && brandName.trim() && headline.trim() && bodyText.trim();

  const renderAdPreview = () => (
    <div className="mx-auto max-w-sm overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md">
      {/* Facebook post header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {(brandName || 'B').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">{brandName || 'Your Brand'}</div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            Sponsored · <svg viewBox="0 0 16 16" className="inline h-3 w-3" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>
        <span className="text-gray-400">···</span>
      </div>

      {/* Body text */}
      <div className="px-3 pb-2 text-sm text-gray-800 leading-5">
        {bodyText || 'Your ad copy will appear here. Write something that grabs attention!'}
      </div>

      {/* Image */}
      <div className="relative aspect-[1.91/1] w-full bg-gradient-to-br from-gray-100 to-gray-200">
        {previewImage ? (
          <img src={previewImage} alt="Ad" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <div className="text-center">
              <span className="text-4xl">🖼️</span>
              <p className="mt-1 text-xs">Upload an image above</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA bar */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-gray-500 uppercase">yourwebsite.com</div>
          <div className="truncate text-sm font-semibold text-gray-900">{headline || 'Your Headline Here'}</div>
        </div>
        <button className="ml-3 shrink-0 rounded bg-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-800">
          {ctaButton}
        </button>
      </div>

      {/* Reactions bar */}
      <div className="flex items-center justify-between border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">👍</span>
            <span className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">❤️</span>
          </span>
          <span className="ml-1">42</span>
        </div>
        <span>8 comments · 3 shares</span>
      </div>
    </div>
  );

  const results = estimateResults();

  if (screen === 'results' && results) {
    const tips = AD_TIPS[objective] || [];
    return (
      <div className="rounded-2xl border-2 border-blue-200 bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-4 text-white">
          <h3 className="text-lg font-bold">Ad Campaign Results</h3>
          <p className="text-sm text-blue-100">Estimated performance for your {duration}-day campaign</p>
        </div>

        <div className="p-5 space-y-6">
          {/* Phone Preview */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-500 uppercase tracking-wide">Your Ad Preview</h4>
            {renderAdPreview()}
          </div>

          {/* Metrics Dashboard */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-500 uppercase tracking-wide">Estimated Performance</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <MetricCard label="Total Budget" value={`R${results.totalBudget}`} icon="💰" color="emerald" />
              <MetricCard label="Impressions" value={formatNum(results.impressions)} icon="👁️" color="blue" />
              <MetricCard label="Reach" value={formatNum(results.reach)} icon="📡" color="purple" />
              <MetricCard label="Clicks" value={formatNum(results.clicks)} icon="👆" color="amber" />
              <MetricCard label="CTR" value={`${results.ctr}%`} icon="📊" color="cyan" />
              <MetricCard label="Cost per Click" value={`R${results.cpc}`} icon="🏷️" color="pink" />
              <MetricCard label="Frequency" value={`${results.frequency}x`} icon="🔁" color="orange" />
              {results.conversions > 0 && (
                <MetricCard label={objective === 'leads' ? 'Leads' : 'Sales'} value={results.conversions} icon={objective === 'leads' ? '📋' : '🛒'} color="green" />
              )}
            </div>
          </div>

          {/* Audience Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-2 text-sm font-bold text-slate-700">Campaign Summary</h4>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="text-slate-500">Objective:</span> <span className="font-semibold">{selectedObjective?.label}</span></div>
              <div><span className="text-slate-500">Audience:</span> <span className="font-semibold">{selectedAudience?.label}</span></div>
              <div><span className="text-slate-500">Target Size:</span> <span className="font-semibold">{formatNum(results.adjustedAudience)} people</span></div>
              <div><span className="text-slate-500">Duration:</span> <span className="font-semibold">{duration} days</span></div>
              <div><span className="text-slate-500">Daily Budget:</span> <span className="font-semibold">R{dailyBudget}/day</span></div>
              <div><span className="text-slate-500">Age Range:</span> <span className="font-semibold">{AGE_RANGES.filter((_, i) => ageRange[i]).join(', ')}</span></div>
            </div>
          </div>

          {/* Performance Gauge */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="mb-3 text-sm font-bold text-slate-700">Budget Efficiency</h4>
            <BudgetGauge cpc={parseFloat(results.cpc)} objective={objective} />
          </div>

          {/* Tips */}
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
            <h4 className="mb-2 text-sm font-bold text-amber-900">💡 Pro Tips for {selectedObjective?.label}</h4>
            <ul className="space-y-1.5">
              {tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="mt-0.5 text-amber-500">▸</span>{t}
                </li>
              ))}
            </ul>
          </div>

          {userId && (
            <SimulatorSaveBar
              userId={userId}
              simId={41}
              label="Facebook Ad Simulator"
              snapshotData={{ objective, audience, dailyBudget, duration, brandName, headline, bodyText, ctaButton }}
              onReset={() => {
                setObjective(''); setAudience(''); setBrandName(''); setHeadline(''); setBodyText('');
                setDailyBudget(50); setDuration(7); setPreviewImage(null); setImageUrl('');
                setAgeRange([true, true, true, true, true]); setScreen('build');
              }}
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setScreen('build')}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              ← Edit Campaign
            </button>
            <button
              onClick={() => {
                setObjective(''); setAudience(''); setBrandName(''); setHeadline(''); setBodyText('');
                setDailyBudget(50); setDuration(7); setPreviewImage(null); setImageUrl('');
                setAgeRange([true, true, true, true, true]); setScreen('build');
              }}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Start New Campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.95c5.05-.5 9-4.76 9-9.95z"/>
          </svg>
          <div>
            <h3 className="text-lg font-bold">Facebook Ad Simulator</h3>
            <p className="text-sm text-blue-100">Build a mock campaign and see estimated results</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-5">
        {/* Build Form — 3 cols */}
        <div className="space-y-5 lg:col-span-3">

          {/* Step 1: Objective */}
          <Section number={1} title="Campaign Objective" subtitle="What do you want to achieve?">
            <div className="grid gap-2 sm:grid-cols-2">
              {OBJECTIVES.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setObjective(o.id)}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition ${objective === o.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="mt-0.5 text-xl">{o.icon}</span>
                  <div>
                    <span className="text-sm font-bold text-slate-800">{o.label}</span>
                    <p className="text-xs text-slate-500">{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Step 2: Audience */}
          <Section number={2} title="Target Audience" subtitle="Who should see your ad?">
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {AUDIENCES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAudience(a.id)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition ${audience === a.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <span className="mt-0.5 text-xl">{a.icon}</span>
                    <div>
                      <span className="text-sm font-bold text-slate-800">{a.label}</span>
                      <p className="text-xs text-slate-500">{a.desc}</p>
                      <span className="text-xs text-blue-600 font-medium">{formatNum(a.size)} people</span>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Age Range</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((r, i) => (
                    <button
                      key={r}
                      onClick={() => {
                        const next = [...ageRange];
                        next[i] = !next[i];
                        if (next.some(Boolean)) setAgeRange(next);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${ageRange[i] ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-400'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Step 3: Budget */}
          <Section number={3} title="Budget & Duration" subtitle="How much will you spend?">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Daily Budget: R{dailyBudget}</label>
                <input type="range" min={10} max={500} step={10} value={dailyBudget} onChange={(e) => setDailyBudget(Number(e.target.value))} className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-slate-400"><span>R10</span><span>R500</span></div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Duration: {duration} days</label>
                <input type="range" min={1} max={30} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-slate-400"><span>1 day</span><span>30 days</span></div>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-blue-50 px-4 py-2.5 text-sm">
              <span className="text-blue-600 font-semibold">Total Budget: </span>
              <span className="font-bold text-blue-900">R{dailyBudget * duration}</span>
              <span className="text-blue-500 ml-1">over {duration} days</span>
            </div>
          </Section>

          {/* Step 4: Ad Creative */}
          <Section number={4} title="Ad Creative" subtitle="Design your ad content">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Brand / Page Name *</label>
                <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Fresh Bakes" maxLength={30} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Headline *</label>
                <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. 50% Off Your First Order!" maxLength={40} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                <p className="mt-0.5 text-xs text-slate-400">{headline.length}/40 — keep it punchy</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Body Text *</label>
                <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} placeholder="Write your ad copy here. What problem do you solve? What's the offer?" maxLength={125} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none" />
                <p className="mt-0.5 text-xs text-slate-400">{bodyText.length}/125 — Facebook recommends under 125 characters</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Ad Image</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 transition hover:border-blue-400 hover:text-blue-600 w-full justify-center">
                  {imageUrl ? `✓ ${imageUrl}` : '📷 Upload Image (recommended 1200×628)'}
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Call-to-Action Button</label>
                <div className="flex flex-wrap gap-2">
                  {CTA_BUTTONS.map((c) => (
                    <button key={c} onClick={() => setCtaButton(c)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${ctaButton === c ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <button
            onClick={() => setScreen('results')}
            disabled={!isReady}
            className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🚀 Launch Campaign Simulation
          </button>
        </div>

        {/* Live Preview — 2 cols */}
        <div className="lg:col-span-2">
          <div className="sticky top-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Live Ad Preview
            </div>
            {renderAdPreview()}
            {selectedObjective && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                <span className="font-bold">Est. CPM:</span> R{selectedObjective.cpmRange[0]} – R{selectedObjective.cpmRange[1]} (cost per 1,000 views)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, subtitle, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{number}</span>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    pink: 'bg-pink-50 border-pink-200 text-pink-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold opacity-70">{label}</span>
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function BudgetGauge({ cpc, objective }) {
  const thresholds = {
    awareness: [2, 5, 10],
    traffic: [3, 8, 15],
    engagement: [1.5, 4, 8],
    leads: [5, 15, 30],
    sales: [8, 20, 40],
  };
  const t = thresholds[objective] || [3, 8, 15];
  const rating = cpc <= t[0] ? 'Excellent' : cpc <= t[1] ? 'Good' : cpc <= t[2] ? 'Average' : 'Expensive';
  const ratingColor = cpc <= t[0] ? 'text-green-600' : cpc <= t[1] ? 'text-blue-600' : cpc <= t[2] ? 'text-amber-600' : 'text-red-600';
  const barColor = cpc <= t[0] ? 'bg-green-500' : cpc <= t[1] ? 'bg-blue-500' : cpc <= t[2] ? 'bg-amber-500' : 'bg-red-500';
  const pct = Math.min(100, Math.max(5, (1 - cpc / (t[2] * 1.5)) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Cost per Click: <span className="font-bold">R{cpc}</span></span>
        <span className={`font-bold ${ratingColor}`}>{rating}</span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>Cheap</span><span>Expensive</span>
      </div>
    </div>
  );
}

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}
