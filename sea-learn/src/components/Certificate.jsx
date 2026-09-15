import { useCallback, useEffect, useRef, useState } from 'react';

const LOGO_URL = '/images/sea-logo.png';

function titleCase(str) {
  return str.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function drawCertificate(canvas, rawName, date, logoImg) {
  const name = titleCase(rawName || 'Learner');
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Border
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  // Inner border
  ctx.strokeStyle = '#99f6e4';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, w - 64, h - 64);

  // Draw SEA logo at top center
  if (logoImg) {
    const logoMaxW = 220;
    const ratio = logoImg.naturalWidth / logoImg.naturalHeight;
    const logoW = logoMaxW;
    const logoH = logoW / ratio;
    const logoX = (w - logoW) / 2;
    ctx.drawImage(logoImg, logoX, 48, logoW, logoH);
  }

  // Gold accent line
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(200, 150);
  ctx.lineTo(w - 200, 150);
  ctx.stroke();

  // Certificate title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 42px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Completion', w / 2, 200);

  // Subtitle
  ctx.fillStyle = '#64748b';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('This is to certify that', w / 2, 250);

  // Name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText(name, w / 2, 305);

  // Underline under name
  const nameWidth = ctx.measureText(name).width;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - nameWidth / 2 - 20, 315);
  ctx.lineTo(w / 2 + nameWidth / 2 + 20, 315);
  ctx.stroke();

  // Body text
  ctx.fillStyle = '#334155';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('has successfully completed all requirements of the', w / 2, 360);

  // Course name
  ctx.fillStyle = '#0d9488';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('Uplift Digital Accelerator Course', w / 2, 405);

  // Partnership
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText('Powered by Africa Forward', w / 2, 440);

  // Date
  ctx.fillStyle = '#334155';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText(`Issued on ${date || new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}`, w / 2, 490);

  // Bottom accent
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(200, 520);
  ctx.lineTo(w - 200, 520);
  ctx.stroke();

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('Social Enterprise Academy Africa  •  sea-learn.vercel.app', w / 2, 550);
}

function loadLogoImage() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = LOGO_URL;
  });
}

export function downloadCertificateForUser(name, date) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 580;
  loadLogoImage().then((logoImg) => {
    drawCertificate(canvas, name, date, logoImg);
    const link = document.createElement('a');
    link.download = `SEA-Certificate-${(name).replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

export default function Certificate({ name, date }) {
  const canvasRef = useRef(null);
  const [logoImg, setLogoImg] = useState(null);

  useEffect(() => {
    loadLogoImage().then(setLogoImg);
  }, []);

  const draw = useCallback((canvas) => {
    if (!canvas) return;
    canvasRef.current = canvas;
    drawCertificate(canvas, name, date, logoImg);
  }, [name, date, logoImg]);

  useEffect(() => {
    if (canvasRef.current && logoImg) {
      drawCertificate(canvasRef.current, name, date, logoImg);
    }
  }, [logoImg, name, date]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `SEA-Certificate-${(name).replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={draw}
        width={900}
        height={580}
        className="w-full rounded-xl border-2 border-emerald-200 shadow-lg"
      />
      <button
        onClick={download}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M10 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V4a1 1 0 011-1z" />
          <path d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
        </svg>
        Download Certificate
      </button>
    </div>
  );
}
