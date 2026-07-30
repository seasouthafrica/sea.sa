import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';
import { withTimeout } from '../lib/withTimeout';

const LOGIN_TIMEOUT_MS = 12_000;

function getLoginErrorMessage(loginError) {
  const message = loginError?.message || '';

  if (/invalid api key/i.test(message)) {
    return 'SEA Learn is not connected to Supabase correctly. Please ask the site administrator to update the Supabase API key.';
  }

  if (/timed out/i.test(message)) {
    return message;
  }

  return message || 'Unable to log in. Please check your connection and try again.';
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading: authLoading, profileLoading, refreshAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const adminMode = searchParams.get('admin') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) return;
    if (adminMode && !isAdmin) return;
    const intendedPath = location.state?.from?.pathname;
    if (isAdmin) {
      navigate(intendedPath?.startsWith('/admin') ? intendedPath : '/admin', { replace: true });
    } else {
      navigate(intendedPath && !intendedPath.startsWith('/admin') ? intendedPath : '/uplift/session/1', { replace: true });
    }
  }, [user, isAdmin, authLoading, profileLoading, adminMode, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: loginError } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        LOGIN_TIMEOUT_MS,
        'Login timed out. Please check your connection and try again.',
      );
      if (loginError) {
        setError(getLoginErrorMessage(loginError));
        return;
      }

      const { profile: prof } = await refreshAuth(data.user);
      const intendedPath = location.state?.from?.pathname;

      if (prof?.role === 'admin' || prof?.role === 'super_admin') {
        navigate(intendedPath?.startsWith('/admin') ? intendedPath : '/admin', { replace: true });
      } else {
        navigate(intendedPath && !intendedPath.startsWith('/admin') ? intendedPath : '/uplift/session/1', { replace: true });
      }
    } catch (loginError) {
      setError(getLoginErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="p-8">Loading…</div>;

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-6">
        {adminMode ? 'Admin log in' : 'Log in to SEA Learn'}
      </h1>
      {adminMode && user && !isAdmin && !profileLoading && (
        <p className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          You are logged in but your account does not have admin access. Please log in with an admin account.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        <input required type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-sea-teal text-white py-3 rounded-lg font-semibold disabled:opacity-50">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <button
        type="button"
        disabled={resetLoading}
        onClick={async () => {
          if (!email.trim()) { setError('Enter your email above, then click Forgot password.'); return; }
          setResetLoading(true);
          setError('');
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/login`,
          });
          setResetLoading(false);
          if (resetError) { setError(resetError.message); return; }
          setResetSent(true);
        }}
        className="mt-3 text-sm text-sea-teal hover:underline disabled:opacity-50"
      >
        {resetLoading ? 'Sending…' : resetSent ? '✓ Reset link sent — check your email' : 'Forgot password?'}
      </button>
      {!adminMode && (
        <p className="text-sm text-gray-500 mt-4">
          New here? <Link to="/signup" className="text-sea-teal">Create an account</Link>
        </p>
      )}
    </div>
  );
}
