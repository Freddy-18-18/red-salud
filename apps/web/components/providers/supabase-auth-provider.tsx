
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface UserContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useSupabaseAuth() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to sync session with server
  const syncSessionWithServer = async (session: Session | null) => {
    try {
      if (session) {
        const response = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          }),
        });

        if (!response.ok) {
          console.warn(`[Auth] Session sync returned ${response.status}`);
        }
      }
    } catch (error) {
      // Silently handle fetch errors (network issues, server not ready, etc.)
      // These are non-critical as middleware/proxy also handles session cookies
      if (process.env.NODE_ENV === 'development') {
        console.debug("[Auth] Session sync failed (non-critical):", error instanceof Error ? error.message : String(error));
      }
    }
  };

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session) {
          console.log("✅ [Auth] Sesión inicial detectada");
          // Optional: sync on mount if needed, but often middleware/proxy handles it
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`📧 [Auth] Event: ${event}`);

      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      // Only sync on SIGNED_IN to avoid excessive API calls
      // TOKEN_REFRESHED happens frequently and middleware/proxy handles it
      if (event === "SIGNED_IN") {
        await syncSessionWithServer(newSession);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}
