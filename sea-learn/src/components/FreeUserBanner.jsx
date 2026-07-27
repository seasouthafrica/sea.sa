import { useEffect, useState } from 'react';

const LIVE_URL = 'https://youtube.com/live/En6IEUZW6Oo?feature=share';
const DISMISS_KEY = 'sea-live-rules-road-part-2-dismissed';

export default function FreeUserBanner({ profile }) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.role === 'admin' || profile.role === 'super_admin') return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setAnimate(true));
    }, 1000);

    return () => clearTimeout(timer);
  }, [profile]);

  const dismiss = () => {
    setAnimate(false);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(DISMISS_KEY, '1');
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-notification-title"
    >
      <div className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-300 ${animate ? 'scale-100' : 'scale-95'}`}>
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-sea-magenta px-6 py-6 text-white">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            aria-label="Close live lesson notification"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-red-600 shadow" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                <path d="m9 8 7 4-7 4V8Z" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/85">Live now</p>
              <h3 id="live-notification-title" className="mt-1 text-xl font-black leading-tight">
                Learner&apos;s Licence: Rules of the Road — Part 2
              </h3>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm leading-6 text-slate-700">
            {profile?.first_name ? `${profile.first_name}, the` : 'The'} Rules of the Road Part 2 lesson is live.
            Join the session now on YouTube.
          </p>

          <a
            href={LIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-red-700 hover:shadow-lg"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-white" aria-hidden="true" />
            Watch Part 2 Live on YouTube
          </a>

          <button
            type="button"
            onClick={dismiss}
            className="mt-3 w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            Continue to course
          </button>
        </div>
      </div>
    </div>
  );
}
