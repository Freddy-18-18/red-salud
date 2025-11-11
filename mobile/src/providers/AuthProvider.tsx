import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { supabase } from '@mobile/services/supabaseClient';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, user: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session, user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
