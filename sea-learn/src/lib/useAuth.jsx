import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile(sessionUser) {
      if (!sessionUser) {
        if (active) setProfile(null);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();
      if (active) setProfile(data ?? null);
    }

    // Initial load: resolve BOTH the session and the profile before we
    // mark loading complete, so route guards (e.g. admin-only) never run
    // against a half-loaded auth state on refresh/deep-link.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u);
      await loadProfile(u);
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u);
      await loadProfile(u);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
