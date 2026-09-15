import { useMemo, useState } from 'react';

const INITIAL_VALUES = {
  businessName: '',
  offering: '',
  audience: '',
  colours: '',
  personality: '',
  symbol: '',
  avoid: '',
};

const FIELDS = [
  { key: 'businessName', label: 'Business name', placeholder: 'e.g. Ubuntu Fresh Foods' },
  { key: 'offering', label: 'Product or service', placeholder: 'e.g. healthy prepared meals' },
  { key: 'audience', label: 'Target audience', placeholder: 'e.g. busy professionals in Johannesburg' },
  { key: 'colours', label: 'Preferred colours', placeholder: 'e.g. forest green, cream and gold' },
  { key: 'personality', label: 'Brand personality or values', placeholder: 'e.g. trustworthy, warm and sustainable' },
  { key: 'symbol', label: 'Symbol or icon', placeholder: 'e.g. a leaf forming the letter U' },
  { key: 'avoid', label: 'Styles to avoid', placeholder: 'e.g. gradients, thin text and complex details' },
];

export default function LogoPromptBuilder() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => {
    const value = (key, fallback) => values[key].trim() || fallback;
    return `Create a modern and professional logo for a business called "${value('businessName', '[BUSINESS NAME]')}". The business provides ${value('offering', '[PRODUCT OR SERVICE]')} and serves ${value('audience', '[TARGET AUDIENCE]')}. Use ${value('colours', '[PREFERRED COLOURS]')} as the main colours. The logo should communicate ${value('personality', '[BRAND PERSONALITY OR VALUES]')}. Include ${value('symbol', '[PREFERRED SYMBOL OR ICON, IF ANY]')}. The design must be simple, memorable, scalable and suitable for a website, social media profile, printed material and favicon. Avoid ${value('avoid', '[ELEMENTS OR STYLES TO AVOID]')}. Return three distinct logo concepts and briefly explain the idea, typography and colour choices for each.`;
  }, [values]);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className={field.key === 'avoid' ? 'md:col-span-2' : ''}>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">{field.label}</span>
            <input
              type="text"
              value={values[field.key]}
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-sea-teal focus:ring-2 focus:ring-sea-teal/15"
            />
          </label>
        ))}
      </div>

      <div className="rounded-xl bg-slate-950 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Generated logo prompt</span>
          <button
            type="button"
            onClick={copyPrompt}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white transition ${copied ? 'bg-emerald-500' : 'bg-sea-teal hover:bg-sea-teal/90'}`}
          >
            {copied ? 'Copied!' : 'Copy prompt'}
          </button>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-7 text-emerald-200">{prompt}</p>
      </div>
    </div>
  );
}
