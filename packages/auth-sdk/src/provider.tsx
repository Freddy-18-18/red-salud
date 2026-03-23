'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { createBrowserAuthClient } from './clients';
import type { AuthConfig, AuthState, AuthUser, LoginCredentials, RegisterData, UserRole } from './types';

interface AuthContextValue extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  config: AuthConfig;
  children: ReactNode;
}

export function AuthProvider({ config, children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = useMemo(() => createBrowserAuthClient(config), [config]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const role = (session.user.user_metadata?.role as UserRole) ?? 'paciente';
          const user: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            role,
            fullName: session.user.user_metadata?.full_name,
            avatarUrl: session.user.user_metadata?.avatar_url,
            emailVerified: !!session.user.email_confirmed_at,
            metadata: session.user.user_metadata ?? {},
          };

          setState({
            user,
            session: {
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: session.expires_at ?? 0,
            },
            role,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            session: null,
            role: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
  }, [supabase]);

  const signUp = useCallback(async (data: RegisterData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
          ...data.metadata,
        },
      },
    });
    if (error) throw error;
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  const hasRole = useCallback(
    (role: UserRole) => state.role === role,
    [state.role],
  );

  const value = useMemo(
    () => ({ ...state, signIn, signUp, signOut, hasRole }),
    [state, signIn, signUp, signOut, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}
