import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from 'react';
import { supabase } from './supabaseClient';
import { withTimeout } from './withTimeout';

const AuthContext = createContext(null);
const PROFILE_TIMEOUT_MS = 10_000;
const INITIAL_AUTH_TIMEOUT_MS = 8_000;
const ADMIN_EMAILS = new Set([
  'lungi09@gmail.com',
  'seasa@gmail.com',
]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const profileRequests = useRef(new Map());
  const authVersion = useRef(0);

  const loadProfile = useCallback(async (sessionUser) => {
    if (!sessionUser) return null;

    // Auth events and form submissions can arrive together. Reuse an in-flight
    // request so signing in never causes two identical profile round trips.
    const existingRequest = profileRequests.current.get(sessionUser.id);
    if (existingRequest) return existingRequest;

    const request = withTimeout(
      supabase
        .from('profiles')
        // Keep authentication compatible with databases that predate the
        // optional paid-access migration. Admin routing only depends on role.
        .select('id, first_name, last_name, role')
        .eq('id', sessionUser.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          return data ?? null;
        })
        .then(async (profile) => {
          const email = sessionUser.email?.trim().toLowerCase();
          if (!profile || !ADMIN_EMAILS.has(email) || ['admin', 'super_admin'].includes(profile.role)) {
            return profile;
          }

          const { data, error } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', sessionUser.id)
            .select('id, first_name, last_name, role')
            .single();
          if (error) throw error;
          return data;
        }),
      PROFILE_TIMEOUT_MS,
      'Your account was authenticated, but loading its profile timed out.',
    )
      .finally(() => {
        profileRequests.current.delete(sessionUser.id);
      });

    profileRequests.current.set(sessionUser.id, request);
    return request;
  }, []);

  const refreshAuth = useCallback(async (knownUser) => {
    const version = ++authVersion.current;
    let sessionUser = knownUser;

    if (sessionUser === undefined) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      sessionUser = session?.user ?? null;
    }

    setUser(sessionUser);
    setLoading(false);

    if (!sessionUser) {
      setProfile(null);
      setProfileLoading(false);
      return { user: null, profile: null };
    }

    setProfileLoading(true);
    try {
      const sessionProfile = await loadProfile(sessionUser);
      if (version === authVersion.current) setProfile(sessionProfile);
      return { user: sessionUser, profile: sessionProfile };
    } finally {
      if (version === authVersion.current) setProfileLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    let active = true;
    let profileTimer;
    const initialAuthTimer = window.setTimeout(() => {
      if (active) {
        setLoading(false);
        setProfileLoading(false);
      }
    }, INITIAL_AUTH_TIMEOUT_MS);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      window.clearTimeout(initialAuthTimer);
      const sessionUser = session?.user ?? null;
      const version = ++authVersion.current;

      setUser(sessionUser);
      setLoading(false);

      if (!sessionUser) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      window.clearTimeout(profileTimer);

      // Supabase auth callbacks run while the auth client holds its lock.
      // Defer database work until the callback has returned so it cannot block
      // signInWithPassword from resolving.
      profileTimer = window.setTimeout(async () => {
        try {
          const sessionProfile = await loadProfile(sessionUser);
          if (active && version === authVersion.current) setProfile(sessionProfile);
        } catch (error) {
          console.error('Unable to load the signed-in user profile.', error);
          if (active && version === authVersion.current) setProfile(null);
        } finally {
          if (active && version === authVersion.current) setProfileLoading(false);
        }
      }, 0);
    });

    return () => {
      active = false;
      window.clearTimeout(initialAuthTimer);
      window.clearTimeout(profileTimer);
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isPaid = !!profile?.paid || isAdmin;

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, isPaid, loading, profileLoading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
