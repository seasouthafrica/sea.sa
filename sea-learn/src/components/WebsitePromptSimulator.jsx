import { useCallback, useRef, useState } from 'react';
import SimulatorSaveBar from './SimulatorSaveBar';

const BUSINESS_TYPES = [
  { id: 'restaurant', label: 'Restaurant / Café', icon: '🍽️' },
  { id: 'salon', label: 'Hair & Beauty Salon', icon: '💇' },
  { id: 'shop', label: 'Online Shop', icon: '🛒' },
  { id: 'agency', label: 'Service / Agency', icon: '💼' },
  { id: 'portfolio', label: 'Portfolio / Freelancer', icon: '🎨' },
  { id: 'ngo', label: 'NGO / Non-Profit', icon: '🌍' },
  { id: 'fitness', label: 'Fitness / Wellness', icon: '💪' },
  { id: 'education', label: 'Education / Tutoring', icon: '🎓' },
];

const COLOR_SCHEMES = [
  { id: 'teal', label: 'Ocean Teal', primary: '#009da0', secondary: '#e0f7f7', accent: '#005f60', text: '#1a2744' },
  { id: 'pink', label: 'Bold Pink', primary: '#bb1e6d', secondary: '#fce4ec', accent: '#6c1340', text: '#2d2d2d' },
  { id: 'forest', label: 'Forest Green', primary: '#2d6a4f', secondary: '#d8f3dc', accent: '#1b4332', text: '#1a1a1a' },
  { id: 'royal', label: 'Royal Blue', primary: '#1d3557', secondary: '#e8f4f8', accent: '#457b9d', text: '#1d3557' },
  { id: 'golden', label: 'Golden Hour', primary: '#e76f51', secondary: '#fef3e8', accent: '#264653', text: '#264653' },
  { id: 'midnight', label: 'Midnight Dark', primary: '#6c63ff', secondary: '#1a1a2e', accent: '#e94560', text: '#eee' },
  { id: 'earth', label: 'Earth Tone', primary: '#8b5e3c', secondary: '#fefae0', accent: '#3e2723', text: '#3e2723' },
  { id: 'berry', label: 'Berry Purple', primary: '#7b2d8e', secondary: '#f3e8ff', accent: '#4a1259', text: '#2d2d2d' },
];

const SECTION_OPTIONS = [
  { id: 'hero', label: 'Hero / Banner', default: true },
  { id: 'about', label: 'About Us', default: true },
  { id: 'services', label: 'Services / Menu', default: true },
  { id: 'gallery', label: 'Photo Gallery', default: false },
  { id: 'testimonials', label: 'Testimonials', default: true },
  { id: 'pricing', label: 'Pricing / Packages', default: false },
  { id: 'team', label: 'Our Team', default: false },
  { id: 'faq', label: 'FAQ', default: false },
  { id: 'contact', label: 'Contact / Map', default: true },
  { id: 'newsletter', label: 'Newsletter Signup', default: false },
];

const STYLE_OPTIONS = [
  { id: 'modern', label: 'Modern & Clean', desc: 'Lots of white space, rounded elements' },
  { id: 'bold', label: 'Bold & Vibrant', desc: 'Strong colours, large typography' },
  { id: 'minimal', label: 'Minimal & Elegant', desc: 'Simple, serif fonts, understated' },
  { id: 'playful', label: 'Playful & Friendly', desc: 'Rounded, colourful, approachable' },
];

export default function WebsitePromptSimulator({ userId }) {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [colorScheme, setColorScheme] = useState('teal');
  const [style, setStyle] = useState('modern');
  const [sections, setSections] = useState(() => SECTION_OPTIONS.filter((s) => s.default).map((s) => s.id));
  const [ctaText, setCtaText] = useState('Get Started');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [screen, setScreen] = useState('build');
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const promptRef = useRef(null);

  const colors = COLOR_SCHEMES.find((c) => c.id === colorScheme) || COLOR_SCHEMES[0];
  const bType = BUSINESS_TYPES.find((b) => b.id === businessType);
  const styleObj = STYLE_OPTIONS.find((s) => s.id === style);

  const toggleSection = (id) => {
    setSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const steps = [
    { title: 'Business Info', icon: '📋' },
    { title: 'Look & Feel', icon: '🎨' },
    { title: 'Sections', icon: '📐' },
    { title: 'Generate', icon: '🚀' },
  ];

  const generatePrompt = useCallback(() => {
    const sectionNames = sections.map((id) => SECTION_OPTIONS.find((s) => s.id === id)?.label).filter(Boolean);
    return `Create a ${styleObj?.label.toLowerCase() || 'modern'} one-page website for "${businessName || 'My Business'}"${bType ? `, a ${bType.label.toLowerCase()}` : ''}.

BRAND DETAILS:
- Business name: ${businessName || '[Your Business Name]'}
- Tagline: "${tagline || '[Your Tagline]'}"
- Description: ${description || '[Brief description of what you do]'}
- Primary colour: ${colors.primary}
- Secondary/background colour: ${colors.secondary}
- Accent colour: ${colors.accent}
- Style: ${styleObj?.label || 'Modern & Clean'} — ${styleObj?.desc || ''}

SECTIONS TO INCLUDE (in this order):
${sectionNames.map((n, i) => `${i + 1}. ${n}`).join('\n')}

CALL-TO-ACTION:
- Main CTA button text: "${ctaText}"
${phone ? `- Phone: ${phone}` : ''}
${email ? `- Email: ${email}` : ''}

REQUIREMENTS:
- Fully responsive (mobile, tablet, desktop)
- Use HTML, CSS, and JavaScript in a single file
- Use Google Fonts for typography
- Include smooth scroll navigation
- Add hover effects on buttons and cards
- Make it professional and ready to deploy
- Include a sticky/fixed navigation bar
- Use Font Awesome or emoji icons for visual elements
- Add a simple contact form in the contact section
- Footer with copyright © ${new Date().getFullYear()} ${businessName || '[Business Name]'}`;
  }, [businessName, businessType, tagline, description, colorScheme, style, sections, ctaText, phone, email, colors, bType, styleObj]);

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const renderPreview = () => {
    const isDark = colorScheme === 'midnight';
    const bg = colors.secondary;
    const tx = colors.text;
    const pr = colors.primary;
    const ac = colors.accent;
    const name = businessName || 'Your Business';
    const tag = tagline || 'Your amazing tagline goes here';
    const desc = description || 'We provide exceptional services tailored to your needs. Our team is dedicated to delivering quality and excellence.';
    const borderRadius = style === 'modern' || style === 'playful' ? '12px' : style === 'minimal' ? '2px' : '8px';
    const fontFamily = style === 'minimal' ? 'Georgia, serif' : style === 'playful' ? '"Comic Sans MS", cursive, sans-serif' : '-apple-system, sans-serif';
    const sectionLabels = sections.map((id) => SECTION_OPTIONS.find((s) => s.id === id)).filter(Boolean);

    return (
      <div style={{
        fontFamily,
        background: bg,
        color: tx,
        fontSize: previewDevice === 'mobile' ? '10px' : '11px',
        lineHeight: 1.5,
        overflow: 'hidden',
        borderRadius: '8px',
        border: `1px solid ${isDark ? '#333' : '#ddd'}`,
      }}>
        {/* Nav */}
        <div style={{
          background: pr,
          color: '#fff',
          padding: previewDevice === 'mobile' ? '8px 12px' : '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10px',
        }}>
          <span style={{ fontWeight: 700, fontSize: '12px' }}>{name}</span>
          {previewDevice !== 'mobile' && (
            <div style={{ display: 'flex', gap: '12px', fontSize: '9px', opacity: 0.9 }}>
              {sectionLabels.slice(0, 5).map((s) => (
                <span key={s.id}>{s.label}</span>
              ))}
            </div>
          )}
          {previewDevice === 'mobile' && <span style={{ fontSize: '14px' }}>☰</span>}
        </div>

        {/* Hero */}
        {sections.includes('hero') && (
          <div style={{
            background: `linear-gradient(135deg, ${pr}, ${ac})`,
            color: '#fff',
            padding: previewDevice === 'mobile' ? '24px 16px' : '36px 28px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: previewDevice === 'mobile' ? '16px' : '20px', fontWeight: 800, marginBottom: '6px' }}>{name}</div>
            <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '12px' }}>{tag}</div>
            <div style={{
              display: 'inline-block',
              background: '#fff',
              color: pr,
              padding: '6px 16px',
              borderRadius,
              fontWeight: 700,
              fontSize: '10px',
            }}>{ctaText}</div>
          </div>
        )}

        {/* About */}
        {sections.includes('about') && (
          <div style={{ padding: previewDevice === 'mobile' ? '16px' : '20px 28px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: pr }}>About Us</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{desc}</div>
          </div>
        )}

        {/* Services */}
        {sections.includes('services') && (
          <div style={{ padding: previewDevice === 'mobile' ? '16px' : '20px 28px', background: isDark ? '#222' : '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: pr }}>
              {businessType === 'restaurant' ? 'Our Menu' : 'Our Services'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr 1fr', gap: '8px' }}>
              {['Service One', 'Service Two', 'Service Three'].map((s, i) => (
                <div key={i} style={{
                  background: bg,
                  border: `1px solid ${isDark ? '#444' : '#e5e5e5'}`,
                  borderRadius,
                  padding: '10px',
                  textAlign: 'center',
                  fontSize: '9px',
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                    {['⭐', '🎯', '💡'][i]}
                  </div>
                  <div style={{ fontWeight: 600 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {sections.includes('testimonials') && (
          <div style={{ padding: previewDevice === 'mobile' ? '16px' : '20px 28px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: pr }}>What People Say</div>
            <div style={{
              background: isDark ? '#222' : '#fff',
              borderLeft: `3px solid ${pr}`,
              padding: '10px 14px',
              borderRadius: '0 8px 8px 0',
              fontSize: '9px',
              fontStyle: 'italic',
              opacity: 0.85,
            }}>
              "An absolutely wonderful experience. Highly recommended!"<br />
              <span style={{ fontWeight: 600, fontStyle: 'normal', marginTop: '4px', display: 'inline-block' }}>— Happy Customer</span>
            </div>
          </div>
        )}

        {/* Gallery */}
        {sections.includes('gallery') && (
          <div style={{ padding: previewDevice === 'mobile' ? '16px' : '20px 28px', background: isDark ? '#222' : '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: pr }}>Gallery</div>
            <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '6px' }}>
              {[pr, ac, colors.primary + '99', colors.accent + '99'].map((c, i) => (
                <div key={i} style={{ background: c, borderRadius: '6px', paddingTop: '70%', opacity: 0.7 }} />
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        {sections.includes('pricing') && (
          <div style={{ padding: previewDevice === 'mobile' ? '16px' : '20px 28px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: pr }}>Pricing</div>
            <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr 1fr', gap: '8px' }}>
              {[{ name: 'Basic', price: 'R199' }, { name: 'Standard', price: 'R399' }, { name: 'Premium', price: 'R699' }].map((p, i) => (
                <div key={i} style={{
                  border: `2px solid ${i === 1 ? pr : (isDark ? '#444' : '#e5e5e5')}`,
                  borderRadius,
                  padding: '12px',
                  textAlign: 'center',
                  background: i === 1 ? pr : 'transparent',
                  color: i === 1 ? '#fff' : tx,
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, margin: '4px 0' }}>{p.price}</div>
                  <div style={{ fontSize: '8px', opacity: 0.7 }}>per month</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {sections.includes('team') && (
          <div style={{ padding: previewDevice === 'mobile' ? '16px' : '20px 28px', background: isDark ? '#222' : '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: pr }}>Our Team</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {['👩‍💼', '👨‍💻', '👩‍🎨'].map((e, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px' }}>{e}</div>
                  <div style={{ fontSize: '9px', fontWeight: 600, marginTop: '2px' }}>Team Member</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {sections.includes('faq') && (
          <div style={{ padding: previewDevice === 'mobile' ? '16px' : '20px 28px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: pr }}>FAQ</div>
            {['How do I get started?', 'What are your hours?'].map((q, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${isDark ? '#444' : '#e5e5e5'}`, padding: '6px 0', fontSize: '9px' }}>
                <div style={{ fontWeight: 600 }}>▸ {q}</div>
              </div>
            ))}
          </div>
        )}

        {/* Contact */}
        {sections.includes('contact') && (
          <div style={{ padding: previewDevice === 'mobile' ? '16px' : '20px 28px', background: isDark ? '#222' : '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: pr }}>Contact Us</div>
            <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr', gap: '6px' }}>
              <div style={{ background: bg, border: `1px solid ${isDark ? '#444' : '#ddd'}`, borderRadius: '4px', padding: '5px 8px', fontSize: '9px', opacity: 0.5 }}>Your name</div>
              <div style={{ background: bg, border: `1px solid ${isDark ? '#444' : '#ddd'}`, borderRadius: '4px', padding: '5px 8px', fontSize: '9px', opacity: 0.5 }}>Your email</div>
            </div>
            <div style={{ background: bg, border: `1px solid ${isDark ? '#444' : '#ddd'}`, borderRadius: '4px', padding: '5px 8px', fontSize: '9px', opacity: 0.5, marginTop: '6px' }}>Your message...</div>
            <div style={{ background: pr, color: '#fff', padding: '5px 14px', borderRadius, fontSize: '9px', fontWeight: 700, display: 'inline-block', marginTop: '8px' }}>Send Message</div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          background: ac,
          color: '#fff',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '8px',
          opacity: 0.9,
        }}>
          © {new Date().getFullYear()} {name}. All rights reserved.
          {(phone || email) && (
            <div style={{ marginTop: '3px' }}>
              {phone && <span>{phone}</span>}
              {phone && email && <span> · </span>}
              {email && <span>{email}</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Business Name *</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Fresh Bakes Bakery" maxLength={40} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Business Type *</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BUSINESS_TYPES.map((b) => (
                  <button key={b.id} onClick={() => setBusinessType(b.id)} className={`rounded-xl border-2 p-3 text-center transition ${businessType === b.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className="text-xl">{b.icon}</span>
                    <span className="mt-1 block text-xs font-medium text-slate-700">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tagline / Slogan</label>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Baked fresh daily with love" maxLength={60} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Business Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us what your business does, who you serve, and what makes you special..." maxLength={200} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
              <p className="mt-1 text-xs text-slate-400">{description.length}/200</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone (optional)</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27 12 345 6789" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email (optional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@yourbusiness.com" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Colour Scheme</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {COLOR_SCHEMES.map((c) => (
                  <button key={c.id} onClick={() => setColorScheme(c.id)} className={`rounded-xl border-2 p-2.5 transition ${colorScheme === c.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="mb-1.5 flex gap-0.5 overflow-hidden rounded-lg">
                      {[c.primary, c.secondary, c.accent].map((hex, i) => (
                        <div key={i} className="h-6 flex-1" style={{ background: hex }} />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-600">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Design Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s.id)} className={`rounded-xl border-2 p-3 text-left transition ${style === s.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className="block text-sm font-bold text-slate-800">{s.label}</span>
                    <span className="text-xs text-slate-500">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">CTA Button Text</label>
              <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="e.g. Get Started" maxLength={25} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <p className="mb-3 text-sm text-slate-500">Choose which sections your website should have. Drag to reorder isn't needed — the prompt will list them in order.</p>
            <div className="space-y-2">
              {SECTION_OPTIONS.map((s) => (
                <label key={s.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${sections.includes(s.id) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={sections.includes(s.id)} onChange={() => toggleSection(s.id)} className="h-4.5 w-4.5 rounded accent-indigo-600" />
                  <span className="text-sm font-medium text-slate-800">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Generated Prompt</span>
                <button onClick={copyPrompt} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}>
                  {copied ? '✓ Copied!' : '📋 Copy Prompt'}
                </button>
              </div>
              <pre ref={promptRef} className="whitespace-pre-wrap text-xs leading-6 text-emerald-300 font-mono max-h-64 overflow-y-auto">{generatePrompt()}</pre>
            </div>
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-indigo-900">How to use this prompt</h4>
              <ol className="space-y-1.5 text-sm text-indigo-800">
                <li className="flex items-start gap-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">1</span> Copy the prompt above</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">2</span> Open ChatGPT, Claude, or any AI assistant</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">3</span> Paste the prompt and press Enter</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">4</span> Copy the generated HTML code</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">5</span> Save it as <code className="rounded bg-indigo-200 px-1.5 py-0.5 font-mono text-xs">index.html</code> and open in your browser</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <div>
            <h3 className="text-lg font-bold">Website Prompt Generator</h3>
            <p className="text-sm text-indigo-100">Build your website using AI — describe it, we generate the prompt</p>
          </div>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50 px-2 overflow-x-auto">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition sm:text-sm ${
            step === i ? 'border-indigo-500 text-indigo-700' : i < step ? 'border-transparent text-emerald-600' : 'border-transparent text-slate-400'
          }`}>
            <span>{i < step ? '✓' : s.icon}</span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        {/* Form */}
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <span>{steps[step].icon}</span> {steps[step].title}
          </h4>
          {stepContent()}
          <div className="mt-5 flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                Back
              </button>
            )}
            {step < steps.length - 1 && (
              <button onClick={() => setStep(step + 1)} disabled={step === 0 && (!businessName.trim() || !businessType)} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40">
                Next
              </button>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Live Preview
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
              {[
                { id: 'mobile', icon: '📱', label: 'Mobile' },
                { id: 'tablet', icon: '📟', label: 'Tablet' },
                { id: 'desktop', icon: '🖥️', label: 'Desktop' },
              ].map((d) => (
                <button key={d.id} onClick={() => setPreviewDevice(d.id)} className={`px-2.5 py-1 text-xs transition ${previewDevice === d.id ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`} title={d.label}>
                  {d.icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div style={{
              width: previewDevice === 'mobile' ? '280px' : previewDevice === 'tablet' ? '400px' : '100%',
              transition: 'width 0.3s ease',
            }}>
              {renderPreview()}
            </div>
          </div>
        </div>
      </div>
      {step === steps.length - 1 && businessName.trim() && businessType && (
        <div className="border-t border-slate-100 p-5">
          <SimulatorSaveBar
            userId={userId}
            simId={52}
            label="Website Prompt Generator"
            snapshotData={{
              businessName,
              businessType,
              tagline,
              description,
              colorScheme,
              style,
              sections,
              ctaText,
              phone,
              email,
              prompt: generatePrompt(),
            }}
          />
        </div>
      )}
    </div>
  );
}
