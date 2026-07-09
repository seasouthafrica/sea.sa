import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const adminMode = searchParams.get('admin') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }

    // Route admins straight to the admin dashboard, everyone else to their learner dashboard.
    const { profile: prof } = await refreshAuth();
    const intendedPath = location.state?.from?.pathname;

    if (prof?.role === 'admin' || prof?.role === 'super_admin') {
      navigate(intendedPath?.startsWith('/admin') ? intendedPath : '/admin', { replace: true });
    } else {
      navigate(intendedPath && !intendedPath.startsWith('/admin') ? intendedPath : '/uplift/week-1', { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-6">
        {adminMode ? 'Admin log in' : 'Log in to SEA Learn'}
      </h1>
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
      {!adminMode && (
        <p className="text-sm text-gray-500 mt-4">
          New here? <Link to="/signup" className="text-sea-teal">Create an account</Link>
        </p>
      )}
    </div>
  );
}
