import type { SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export function createAuthSdk(supabase: SupabaseClient) {
    return {
        /**
         * Get the current session
         */
        async getSession(): Promise<Session | null> {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return session;
        },

        /**
         * Get the current user
         */
        async getUser(): Promise<User | null> {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user;
        },

        /**
         * Sign out the current user
         */
        async signOut(): Promise<void> {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },

        /**
         * Subscribe to auth state changes
         */
        onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
            return subscription;
        }
    };
}
