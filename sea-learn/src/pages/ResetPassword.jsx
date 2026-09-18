import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    // Supabase puts the recovery token in the URL hash and exchanges it for a
    // session, firing PASSWORD_RECOVERY. On a reload the session may already
    // exist, so accept either route in.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) {
        setReady(true);
      } else if (!window.location.hash.includes('access_token')) {
        setLinkError('This reset link is invalid or has already expired. Request a new one from the login page.');
      }
    });

    // An expired or malformed token is never exchanged for a session and fires
    // no event, so fall back rather than leaving the learner on a spinner.
    const timer = window.setTimeout(() => {
      if (active) {
        setReady((alreadyReady) => {
          if (!alreadyReady) {
            setLinkError('This reset link is invalid or has already expired. Request a new one from the login page.');
          }
          return alreadyReady;
        });
      }
    }, 8000);

    return () => {
      active = false;
      window.clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    // Sign the recovery session out so the next login proves the new password.
    await supabase.auth.signOut();
    window.setTimeout(() => navigate('/login', { replace: true }), 2500);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sea-teal">Learner portal</p>
        <h1 className="mb-2 text-2xl font-bold">Choose a new password</h1>

        {done ? (
          <>
            <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              Password updated. Taking you to the login page…
            </p>
            <Link to="/login" className="text-sm font-semibold text-sea-teal hover:underline">
              Go to login now
            </Link>
          </>
        ) : linkError ? (
          <>
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{linkError}</p>
            <Link to="/login" className="text-sm font-semibold text-sea-teal hover:underline">
              Back to login
            </Link>
          </>
        ) : !ready ? (
          <p className="text-sm text-slate-500">Checking your reset link…</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-slate-500">
              Enter a new password for your account. You will be asked to log in with it straight after.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="password"
                autoComplete="new-password"
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              />
              <input
                required
                type="password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-sea-teal py-3 font-semibold text-white transition hover:bg-sea-teal/90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
