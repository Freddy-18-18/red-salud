"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase-client";

interface UserContextType {
    user: User | null;
    session: Session | null;
    availableRoles: string[];
    activeRole: string | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    switchRole: (role: string) => void;
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
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserRoles = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('roles(name)')
                .eq('user_id', userId);

            if (!error && data) {
                const roles = data.map((d: any) => d.roles?.name).filter(Boolean);
                setAvailableRoles(roles);

                const savedRole = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('active_role='))
                    ?.split('=')[1];

                if (savedRole && roles.includes(savedRole)) {
                    setActiveRole(savedRole);
                } else if (roles.length > 0) {
                    setActiveRole(roles[0]);
                }
            }
        } catch (err) {
            console.error("[Auth] Error fetching roles:", err);
        }
    };

    const switchRole = (role: string) => {
        if (availableRoles.includes(role)) {
            setActiveRole(role);
            document.cookie = `active_role=${role}; path=/; max-age=31536000`;

            // Mapeo de puertos para desarrollo
            const portMap: Record<string, string> = {
                'landing': '3000',
                'medico': '3001',
                'paciente': '3002',
                'farmacia': '3003',
                'laboratorio': '3004',
                'academia': '3005'
            };

            const targetPort = portMap[role] || '3000';
            const isDev = window.location.hostname === 'localhost';

            if (isDev) {
                window.location.href = `http://localhost:${targetPort}/dashboard/${role}`;
            } else {
                // En producción usamos subdominios
                window.location.href = `https://${role}.red-salud.org/dashboard/${role}`;
            }
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    await fetchUserRoles(currentSession.user.id);
                }
            } catch (error: any) {
                if (error?.message?.includes('refresh_token_not_found')) {
                    await supabase.auth.signOut();
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, newSession: Session | null) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (event === "SIGNED_IN" && newSession?.user) {
                await fetchUserRoles(newSession.user.id);
            } else if (event === "SIGNED_OUT") {
                setAvailableRoles([]);
                setActiveRole(null);
                document.cookie = "active_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }

            setIsLoading(false);
        });

        return () => subscription?.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <UserContext.Provider value={{
            user,
            session,
            availableRoles,
            activeRole,
            isLoading,
            signOut,
            switchRole
        }}>
            {children}
        </UserContext.Provider>
    );
}
