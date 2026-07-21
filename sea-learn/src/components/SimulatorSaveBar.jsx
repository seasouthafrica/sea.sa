import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const LS_KEY = 'sim-completion';

function loadLocal(userId, simId) {
  try {
    const raw = localStorage.getItem(`${LS_KEY}-${userId}-${simId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocal(userId, simId, data) {
  localStorage.setItem(`${LS_KEY}-${userId}-${simId}`, JSON.stringify(data));
}

function clearLocal(userId, simId) {
  localStorage.removeItem(`${LS_KEY}-${userId}-${simId}`);
}

export default function SimulatorSaveBar({ userId, simId, label, snapshotData, onReset }) {
  const [status, setStatus] = useState('idle');
  const [savedAt, setSavedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;
    supabase
      .from('assignment_submissions')
      .select('status, submitted_at, explanation')
      .eq('user_id', userId)
      .eq('chapter_id', simId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.status === 'submitted') {
          setStatus('completed');
          setSavedAt(data.submitted_at);
        } else {
          const local = loadLocal(userId, simId);
          if (local?.completed) {
            setStatus('completed');
            setSavedAt(local.savedAt);
          }
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId, simId]);

  const handleComplete = useCallback(async () => {
    if (!userId) return;
    setStatus('saving');

    const now = new Date().toISOString();
    const payload = {
      user_id: userId,
      chapter_id: simId,
      status: 'submitted',
      explanation: JSON.stringify({ type: 'simulator', label, data: snapshotData }),
      submitted_at: now,
    };

    const { error } = await supabase
      .from('assignment_submissions')
      .upsert(payload, { onConflict: 'user_id,chapter_id' });

    if (error) {
      saveLocal(userId, simId, { completed: true, savedAt: now, label, data: snapshotData });
    }

    setStatus('completed');
    setSavedAt(now);
  }, [userId, simId, label, snapshotData]);

  const handleRestart = useCallback(() => {
    setStatus('idle');
    setSavedAt(null);
    clearLocal(userId, simId);
    onReset?.();
  }, [userId, simId, onReset]);

  if (loading) return null;

  if (status === 'completed') {
    return (
      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                <path d="M5 10.5 8.2 14 15 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <span className="text-sm font-bold text-emerald-800">{label} — Completed</span>
              {savedAt && (
                <p className="text-xs text-emerald-600">
                  Saved {new Date(savedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-sm font-semibold text-blue-800">Ready to submit your {label.toLowerCase()}?</span>
          <p className="text-xs text-blue-600">This will count as a completed activity for your progress.</p>
        </div>
        <button
          onClick={handleComplete}
          disabled={status === 'saving'}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : '✓ Mark as Done'}
        </button>
      </div>
    </div>
  );
}
