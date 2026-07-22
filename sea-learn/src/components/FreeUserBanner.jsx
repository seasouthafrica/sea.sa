import { useEffect, useState } from 'react';

const WHATSAPP_NUMBER = '27671459311';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hi SEA! I would like to purchase the Uplift Digital Accelerator Course for R99. Please send me the payment details.'
);
const DISMISS_KEY = 'sea-free-banner-dismissed';

function isNightWindow() {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 10;
}

export default function FreeUserBanner({ profile }) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.role === 'admin' || profile.role === 'super_admin') return;
    if (profile.role === 'paid') return;

    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    if (!isNightWindow()) return;

    const timer = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setAnimate(true));
    }, 3000);
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-300 ${animate ? 'scale-100' : 'scale-95'}`}>
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-sea-teal via-emerald-500 to-cyan-500 px-6 py-5 text-white">
          <button onClick={dismiss} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h3 className="text-lg font-bold">Congratulations{profile?.first_name ? `, ${profile.first_name}` : ''}!</h3>
              <p className="text-sm text-white/90">You're making the most of this free opportunity</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-700">
            Well done for taking advantage of this free access period to grow your digital skills! You're already ahead of the curve.
          </p>

          {/* Upgrade offer */}
          <div className="mt-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">SPECIAL OFFER</span>
              <span className="text-xl font-black text-emerald-700">R99</span>
            </div>
            <p className="text-sm text-emerald-800 leading-relaxed">
              Get <strong>full unrestricted access</strong> to the entire Uplift Digital Accelerator Course — all chapters, simulators, assignments, and a certificate of completion.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-bold text-white shadow-md transition hover:bg-[#1fb855] hover:shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Purchase on WhatsApp
            </a>
          </div>

          {/* Free option */}
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-600">
              Prefer to wait for free access? No problem — follow us on social media for updates on when the next free window opens.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a href="https://www.facebook.com/seasouthafrica" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-200">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Facebook
              </a>
              <a href="https://twitter.com/SEA_SouthAfrica" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-300">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                X / Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
          <button onClick={dismiss} className="w-full text-center text-sm font-semibold text-slate-500 transition hover:text-slate-700">
            Continue with free access
          </button>
        </div>
      </div>
    </div>
  );
}
