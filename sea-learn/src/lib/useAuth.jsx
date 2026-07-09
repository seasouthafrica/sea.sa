import { useCallback, useEffect, useState, createContext, useContext } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (sessionUser, { commit = true } = {}) => {
    if (!sessionUser) {
      if (commit) setProfile(null);
      return null;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, role')
      .eq('id', sessionUser.id)
      .single();

    if (commit) setProfile(data ?? null);
    return data ?? null;
  }, []);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const sessionUser = session?.user ?? null;
    setUser(sessionUser);
    const sessionProfile = await loadProfile(sessionUser);
    setLoading(false);
    return { user: sessionUser, profile: sessionProfile };
  }, [loadProfile]);

  useEffect(() => {
    let active = true;

    // Initial load: resolve BOTH the session and the profile before we
    // mark loading complete, so route guards (e.g. admin-only) never run
    // against a half-loaded auth state on refresh/deep-link.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u);
      const sessionProfile = await loadProfile(u, { commit: false });
      if (active) setProfile(sessionProfile);
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u);
      const sessionProfile = await loadProfile(u, { commit: false });
      if (active) setProfile(sessionProfile);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
