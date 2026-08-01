import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import { withTimeout } from '../lib/withTimeout';

const LOGIN_TIMEOUT_MS = 12_000;

function getLoginErrorMessage(loginError) {
  const message = loginError?.message || '';

  if (/invalid api key/i.test(message)) {
    return 'SEA Learn is not connected to Supabase correctly. Please ask the site administrator to update the Supabase API key.';
  }

  if (/timed out/i.test(message)) return message;
  return message || 'Unable to log in. Please check your connection and try again.';
}

export default function Login({ mode = 'personal' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading: authLoading, profileLoading, refreshAuth } = useAuth();
  const adminMode = mode === 'admin';
  const legacyAdminMode = mode === 'personal' && searchParams.get('admin') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (legacyAdminMode || authLoading || profileLoading || !user) return;
    if (adminMode && !isAdmin) return;

    const intendedPath = location.state?.from?.pathname;
    if (adminMode) {
      navigate(intendedPath?.startsWith('/admin') ? intendedPath : '/admin', { replace: true });
    } else {
      navigate(intendedPath && !intendedPath.startsWith('/admin') ? intendedPath : '/dashboard', { replace: true });
    }
  }, [user, isAdmin, authLoading, profileLoading, adminMode, legacyAdminMode, navigate, location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: loginError } = await withTimeout(
        supabase.auth.signInWithPassword({ email: email.trim(), password }),
        LOGIN_TIMEOUT_MS,
        'Login timed out. Please check your connection and try again.',
      );
      if (loginError) {
        setError(getLoginErrorMessage(loginError));
        return;
      }

      const { profile } = await refreshAuth(data.user);
      const signedInAsAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
      const intendedPath = location.state?.from?.pathname;

      if (adminMode && !signedInAsAdmin) {
        await supabase.auth.signOut();
        setError('This account does not have admin access. Use the personal login instead.');
        return;
      }

      if (adminMode) {
        navigate(intendedPath?.startsWith('/admin') ? intendedPath : '/admin', { replace: true });
      } else {
        navigate(intendedPath && !intendedPath.startsWith('/admin') ? intendedPath : '/dashboard', { replace: true });
      }
    } catch (loginError) {
      setError(getLoginErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setError('Enter your email above, then click Forgot password.');
      return;
    }

    setResetLoading(true);
    setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${adminMode ? '/admin/login' : '/login'}`,
    });
    setResetLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setResetSent(true);
  };

  if (authLoading) return <div className="p-8">Loading…</div>;
  if (legacyAdminMode) return <Navigate to="/admin/login" replace state={location.state} />;

  return (
    <main className={`min-h-screen px-6 py-16 ${adminMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`mx-auto max-w-md rounded-2xl border p-7 shadow-sm ${adminMode ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200 bg-white'}`}>
        <p className={`mb-2 text-xs font-bold uppercase tracking-widest ${adminMode ? 'text-cyan-300' : 'text-sea-teal'}`}>
          {adminMode ? 'Administration' : 'Learner portal'}
        </p>
        <h1 className="mb-2 text-2xl font-bold">{adminMode ? 'Admin login' : 'Personal login'}</h1>
        <p className={`mb-6 text-sm ${adminMode ? 'text-slate-300' : 'text-slate-500'}`}>
          {adminMode ? 'Authorised SEA team members only.' : 'Access your courses, progress and certificates.'}
        </p>

        {adminMode && user && !isAdmin && !profileLoading && (
          <p className="mb-4 rounded-lg border border-amber-700 bg-amber-950/60 p-3 text-sm text-amber-200">
            Your current account does not have admin access. Log in with an authorised admin account.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
          <input
            required
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
          {error && <p className={`text-sm ${adminMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-semibold text-white transition disabled:opacity-50 ${adminMode ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-sea-teal hover:bg-sea-teal/90'}`}
          >
            {loading ? 'Logging in…' : adminMode ? 'Enter admin panel' : 'Open my learning'}
          </button>
        </form>

        <button
          type="button"
          disabled={resetLoading}
          onClick={handlePasswordReset}
          className={`mt-3 text-sm hover:underline disabled:opacity-50 ${adminMode ? 'text-cyan-300' : 'text-sea-teal'}`}
        >
          {resetLoading ? 'Sending…' : resetSent ? '✓ Reset link sent — check your email' : 'Forgot password?'}
        </button>

        {!adminMode && (
          <p className="mt-4 text-sm text-slate-500">
            New here? <Link to="/signup" className="font-semibold text-sea-teal">Create an account</Link>
          </p>
        )}

        <div className={`mt-6 border-t pt-4 text-sm ${adminMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-500'}`}>
          {adminMode ? (
            <Link to="/login" className="font-semibold text-cyan-300 hover:underline">Go to personal login</Link>
          ) : (
            <Link to="/admin/login" className="font-semibold text-sea-teal hover:underline">SEA team admin login</Link>
          )}
        </div>
      </div>
    </main>
  );
}
