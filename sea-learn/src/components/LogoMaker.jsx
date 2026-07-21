import { useRef, useState } from 'react';
import SimulatorSaveBar from './SimulatorSaveBar';

const FONTS = [
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Courier', family: '"Courier New", monospace' },
  { name: 'Impact', family: 'Impact, sans-serif' },
  { name: 'Verdana', family: 'Verdana, sans-serif' },
  { name: 'Trebuchet', family: '"Trebuchet MS", sans-serif' },
  { name: 'Palatino', family: '"Palatino Linotype", serif' },
  { name: 'Lucida', family: '"Lucida Console", monospace' },
];

const FONT_STYLES = ['Normal', 'Bold', 'Italic', 'Bold Italic'];

const SHAPE_OPTIONS = [
  { id: 'none', label: 'None', icon: '—' },
  { id: 'circle', label: 'Circle', icon: '⬤' },
  { id: 'rounded', label: 'Rounded', icon: '▢' },
  { id: 'square', label: 'Square', icon: '■' },
  { id: 'diamond', label: 'Diamond', icon: '◆' },
];

const ICON_OPTIONS = [
  '', '🚀', '💡', '🎯', '⭐', '🔥', '💎', '🌍', '🛒', '🎨', '📱', '🏠', '🍽️', '✈️', '🎓', '💼',
];

const BRAND_PALETTES = [
  { name: 'Ocean Teal', colors: ['#009da0', '#00c4c8', '#005f60', '#e0f7f7'] },
  { name: 'Sunset Pink', colors: ['#bb1e6d', '#e84393', '#6c1340', '#fce4ec'] },
  { name: 'Forest Green', colors: ['#2d6a4f', '#52b788', '#1b4332', '#d8f3dc'] },
  { name: 'Royal Blue', colors: ['#1d3557', '#457b9d', '#a8dadc', '#f1faee'] },
  { name: 'Golden Hour', colors: ['#e76f51', '#f4a261', '#264653', '#2a9d8f'] },
  { name: 'Midnight', colors: ['#0f0f0f', '#333333', '#666666', '#f5f5f5'] },
  { name: 'Berry', colors: ['#7b2d8e', '#c084fc', '#4a1259', '#f3e8ff'] },
  { name: 'Earth Tone', colors: ['#8b5e3c', '#d4a373', '#3e2723', '#fefae0'] },
];

const LAYOUT_OPTIONS = [
  { id: 'stacked', label: 'Stacked', desc: 'Icon on top, name below' },
  { id: 'inline', label: 'Inline', desc: 'Icon beside name' },
  { id: 'badge', label: 'Badge', desc: 'Inside a shape' },
];

export default function LogoMaker({ userId }) {
  const [step, setStep] = useState(0);
  const [brandName, setBrandName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(36);
  const [fontStyle, setFontStyle] = useState('Bold');
  const [textColor, setTextColor] = useState('#1d3557');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [sloganColor, setSloganColor] = useState('#666666');
  const [icon, setIcon] = useState('');
  const [shape, setShape] = useState('none');
  const [shapeColor, setShapeColor] = useState('#009da0');
  const [layout, setLayout] = useState('stacked');
  const [activePalette, setActivePalette] = useState(null);
  const canvasRef = useRef(null);

  const steps = [
    { title: 'Brand Name & Slogan', icon: '✏️' },
    { title: 'Font & Style', icon: '🔤' },
    { title: 'Colours & Palette', icon: '🎨' },
    { title: 'Icon & Shape', icon: '✨' },
    { title: 'Preview & Download', icon: '🖼️' },
  ];

  const applyPalette = (palette) => {
    setActivePalette(palette.name);
    setTextColor(palette.colors[0]);
    setShapeColor(palette.colors[1]);
    setSloganColor(palette.colors[2]);
    setBgColor(palette.colors[3]);
  };

  const getFontWeight = () => fontStyle.includes('Bold') ? 'bold' : 'normal';
  const getFontStyleCSS = () => fontStyle.includes('Italic') ? 'italic' : 'normal';

  const renderLogoPreview = (size = 'normal') => {
    const scale = size === 'large' ? 1.5 : size === 'small' ? 0.6 : 1;
    const fs = fontSize * scale;
    const sloganFs = Math.max(10, fs * 0.35);
    const iconFs = fs * 1.2;
    const padding = fs * 0.6;

    const textEl = (
      <>
        <div style={{
          fontFamily: selectedFont.family,
          fontSize: `${fs}px`,
          fontWeight: getFontWeight(),
          fontStyle: getFontStyleCSS(),
          color: textColor,
          lineHeight: 1.1,
          letterSpacing: '0.02em',
        }}>
          {brandName || 'Your Brand'}
        </div>
        {slogan && (
          <div style={{
            fontFamily: selectedFont.family,
            fontSize: `${sloganFs}px`,
            color: sloganColor,
            marginTop: `${sloganFs * 0.3}px`,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {slogan}
          </div>
        )}
      </>
    );

    const iconEl = icon ? (
      <span style={{ fontSize: `${iconFs}px`, lineHeight: 1 }}>{icon}</span>
    ) : null;

    const innerContent = layout === 'inline' ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: `${padding * 0.4}px` }}>
        {iconEl}
        <div>{textEl}</div>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${padding * 0.3}px` }}>
        {iconEl}
        {textEl}
      </div>
    );

    const shapeStyles = {
      none: {},
      circle: { borderRadius: '50%', width: `${fs * 4}px`, height: `${fs * 4}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: shapeColor },
      rounded: { borderRadius: `${fs * 0.4}px`, padding: `${padding}px ${padding * 1.5}px`, background: shapeColor },
      square: { padding: `${padding}px ${padding * 1.5}px`, background: shapeColor },
      diamond: { transform: 'rotate(45deg)', padding: `${padding * 1.2}px`, background: shapeColor, width: `${fs * 3.5}px`, height: `${fs * 3.5}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    };

    const needsLightText = shape !== 'none' && isColorDark(shapeColor);

    return (
      <div style={{
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${padding * 1.5}px`,
        minHeight: `${fs * 5}px`,
      }}>
        <div style={{
          textAlign: 'center',
          ...shapeStyles[shape],
          ...(needsLightText && shape !== 'none' ? { color: '#ffffff' } : {}),
        }}>
          {shape === 'diamond' ? (
            <div style={{ transform: 'rotate(-45deg)' }}>{innerContent}</div>
          ) : innerContent}
        </div>
      </div>
    );
  };

  const downloadLogo = () => {
    const el = canvasRef.current;
    if (!el) return;
    const svgData = logoToSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(brandName || 'logo').replace(/\s+/g, '-').toLowerCase()}-logo.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logoToSVG = () => {
    const w = 600, h = 400;
    const fs = fontSize * 1.2;
    const sloganFs = Math.max(12, fs * 0.35);
    const fw = getFontWeight();
    const fst = getFontStyleCSS();
    let nameY = h / 2;
    let iconSVG = '';
    if (icon) {
      iconSVG = `<text x="${w / 2}" y="${nameY - fs * 0.5}" text-anchor="middle" font-size="${fs * 1.2}px">${icon}</text>`;
      nameY += fs * 0.4;
    }
    const sloganSVG = slogan
      ? `<text x="${w / 2}" y="${nameY + sloganFs * 1.8}" text-anchor="middle" font-family="${selectedFont.family}" font-size="${sloganFs}px" fill="${sloganColor}" letter-spacing="0.1em">${escapeXml(slogan.toUpperCase())}</text>`
      : '';
    let shapeSVG = '';
    if (shape === 'circle') shapeSVG = `<circle cx="${w / 2}" cy="${h / 2}" r="${fs * 2}" fill="${shapeColor}"/>`;
    else if (shape === 'rounded') shapeSVG = `<rect x="${w / 2 - fs * 3}" y="${h / 2 - fs * 1.5}" width="${fs * 6}" height="${fs * 3}" rx="${fs * 0.4}" fill="${shapeColor}"/>`;
    else if (shape === 'square') shapeSVG = `<rect x="${w / 2 - fs * 3}" y="${h / 2 - fs * 1.5}" width="${fs * 6}" height="${fs * 3}" fill="${shapeColor}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bgColor}"/>
  ${shapeSVG}
  ${iconSVG}
  <text x="${w / 2}" y="${nameY}" text-anchor="middle" dominant-baseline="central" font-family="${selectedFont.family}" font-size="${fs}px" font-weight="${fw}" font-style="${fst}" fill="${shape !== 'none' && isColorDark(shapeColor) ? '#ffffff' : textColor}">${escapeXml(brandName || 'Your Brand')}</text>
  ${sloganSVG}
</svg>`;
  };

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Brand Name *</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Fresh Bakes"
                maxLength={30}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold text-slate-900 outline-none focus:border-sea-teal focus:ring-2 focus:ring-sea-teal/20"
              />
              <p className="mt-1 text-xs text-slate-400">{brandName.length}/30 characters</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Slogan / Tagline</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="e.g. Baked with love"
                maxLength={50}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-sea-teal focus:ring-2 focus:ring-sea-teal/20"
              />
              <p className="mt-1 text-xs text-slate-400">{slogan.length}/50 characters</p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Font Family</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FONTS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFont(f)}
                    className={`rounded-lg border-2 p-3 text-center transition ${selectedFont.name === f.name ? 'border-sea-teal bg-sea-teal/5' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <span style={{ fontFamily: f.family, fontSize: '18px' }}>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Font Size: {fontSize}px</label>
              <input
                type="range"
                min={18}
                max={64}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-sea-teal"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>18px</span><span>64px</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Font Style</label>
              <div className="flex flex-wrap gap-2">
                {FONT_STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontStyle(s)}
                    className={`rounded-lg border-2 px-4 py-2 text-sm transition ${fontStyle === s ? 'border-sea-teal bg-sea-teal/5 font-bold text-sea-teal' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <span style={{ fontWeight: s.includes('Bold') ? 'bold' : 'normal', fontStyle: s.includes('Italic') ? 'italic' : 'normal' }}>{s}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {LAYOUT_OPTIONS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    className={`rounded-lg border-2 p-3 text-center transition ${layout === l.id ? 'border-sea-teal bg-sea-teal/5' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <span className="block text-sm font-bold text-slate-700">{l.label}</span>
                    <span className="text-xs text-slate-400">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Brand Colour Palettes</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BRAND_PALETTES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPalette(p)}
                    className={`rounded-lg border-2 p-2 transition ${activePalette === p.name ? 'border-sea-teal ring-2 ring-sea-teal/20' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="mb-1.5 flex gap-0.5 overflow-hidden rounded">
                      {p.colors.map((c, i) => (
                        <div key={i} className="h-6 flex-1" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-600">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ColorPicker label="Text" value={textColor} onChange={setTextColor} />
              <ColorPicker label="Slogan" value={sloganColor} onChange={setSloganColor} />
              <ColorPicker label="Background" value={bgColor} onChange={setBgColor} />
              <ColorPicker label="Shape" value={shapeColor} onChange={setShapeColor} />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Icon / Emoji</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((ic, i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(ic)}
                    className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 text-xl transition ${icon === ic ? 'border-sea-teal bg-sea-teal/5' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {ic || '✕'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Shape</label>
              <div className="flex flex-wrap gap-2">
                {SHAPE_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition ${shape === s.id ? 'border-sea-teal bg-sea-teal/5' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <span className="text-lg" style={{ color: s.id !== 'none' ? shapeColor : undefined }}>{s.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div ref={canvasRef} className="overflow-hidden rounded-2xl border-2 border-slate-200 shadow-lg">
              {renderLogoPreview('large')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="mb-2 text-center text-xs font-semibold text-slate-500">Light Background</p>
                <div style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
                  {renderLogoPreview('small')}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="mb-2 text-center text-xs font-semibold text-slate-500">Dark Background</p>
                <div style={{ background: '#1a1a2e', borderRadius: '8px', overflow: 'hidden' }}>
                  {renderLogoPreview('small')}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-slate-700">Your Brand Kit</h4>
              <div className="flex flex-wrap gap-3">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold">Font:</span> {selectedFont.name}, {fontSize}px, {fontStyle}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="font-semibold">Colors:</span>
                  {[textColor, sloganColor, shapeColor, bgColor].map((c, i) => (
                    <span key={i} className="inline-block h-4 w-4 rounded border border-slate-300" style={{ background: c }} title={c} />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={downloadLogo}
              className="w-full rounded-xl bg-sea-teal px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-sea-teal/90 active:scale-[0.98]"
            >
              Download Logo (SVG)
            </button>
            {userId && (
              <SimulatorSaveBar
                userId={userId}
                simId={31}
                label="Logo Maker"
                snapshotData={{ brandName, slogan, font: selectedFont.name, fontSize, fontStyle, textColor, bgColor, icon, shape }}
                onReset={() => {
                  setBrandName(''); setSlogan(''); setSelectedFont(FONTS[0]); setFontSize(36);
                  setFontStyle('Bold'); setTextColor('#1d3557'); setBgColor('#ffffff');
                  setSloganColor('#666666'); setIcon(''); setShape('none'); setShapeColor('#009da0');
                  setLayout('stacked'); setActivePalette(null); setStep(0);
                }}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border-2 border-purple-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-4 text-white">
        <h3 className="text-lg font-bold">Logo Maker</h3>
        <p className="text-sm text-white/80">Design your brand logo step by step</p>
      </div>

      {/* Step Indicators */}
      <div className="flex border-b border-slate-100 bg-slate-50 px-2 overflow-x-auto">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition sm:text-sm ${
              step === i
                ? 'border-purple-500 text-purple-700'
                : i < step
                ? 'border-transparent text-emerald-600'
                : 'border-transparent text-slate-400'
            }`}
          >
            <span>{i < step ? '✓' : s.icon}</span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        {/* Controls */}
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <span>{steps[step].icon}</span> {steps[step].title}
          </h4>
          {stepContent()}
          <div className="mt-5 flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
            )}
            {step < steps.length - 1 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !brandName.trim()}
                className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-40"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Live Preview (always visible on desktop, collapsed label on mobile for steps 0-3) */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Live Preview
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            {renderLogoPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border-0"
        />
        <span className="text-xs font-mono text-slate-500">{value}</span>
      </div>
    </div>
  );
}

function isColorDark(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
