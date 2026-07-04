import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adminMode = searchParams.get('admin') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      return;
    }
    // Route admins straight to the admin dashboard, everyone else to their learner dashboard.
    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    if (prof?.role === 'admin' || prof?.role === 'super_admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
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
        <button type="submit" className="w-full bg-sea-teal text-white py-3 rounded-lg font-semibold">
          Log in
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
