import { useCallback, useRef } from 'react';

export default function Certificate({ name, date }) {
  const canvasRef = useRef(null);

  const draw = useCallback((canvas) => {
    if (!canvas) return;
    canvasRef.current = canvas;
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

    // Gold accent line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200, 120);
    ctx.lineTo(w - 200, 120);
    ctx.stroke();

    // Header
    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SOCIAL ENTERPRISE ACADEMY AFRICA', w / 2, 100);

    // Certificate title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText('Certificate of Completion', w / 2, 180);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('This is to certify that', w / 2, 230);

    // Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText(name || 'Learner', w / 2, 285);

    // Underline under name
    const nameWidth = ctx.measureText(name || 'Learner').width;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - nameWidth / 2 - 20, 295);
    ctx.lineTo(w / 2 + nameWidth / 2 + 20, 295);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#334155';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('has successfully completed all sessions, assignments, simulators, and quizzes of the', w / 2, 340);

    // Course name
    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('Uplift Digital Accelerator Course', w / 2, 385);

    // Partnership
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Powered by Africa Forward, One Family Foundation & Mastercard Foundation', w / 2, 420);

    // Date
    ctx.fillStyle = '#334155';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText(`Issued on ${date || new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}`, w / 2, 470);

    // Bottom accent
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200, 500);
    ctx.lineTo(w - 200, 500);
    ctx.stroke();

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('sea-learn.vercel.app', w / 2, 530);
  }, [name, date]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `SEA-Certificate-${(name || 'Learner').replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={draw}
        width={900}
        height={560}
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
