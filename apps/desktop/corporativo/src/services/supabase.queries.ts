/**
 * Centralized Supabase Queries for Corporate App
 * All data fetching should go through these functions
 */

import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

// ============================================
// STATS & COUNTS
// ============================================

export interface CorporateStats {
    totalUsers: number;
    doctors: number;
    patients: number;
    pharmacies: number;
    corporateUsers: number;
}

/**
 * Get real-time counts for all roles from Supabase
 */
export async function getCorporateStats(): Promise<CorporateStats> {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('role');

        if (error) {
            console.error('[getCorporateStats] Error:', error);
            throw error;
        }

        const counts: Record<string, number> = {};
        profiles?.forEach(p => {
            const role = p.role || 'unknown';
            counts[role] = (counts[role] || 0) + 1;
        });

        return {
            totalUsers: profiles?.length || 0,
            doctors: counts['medico'] || 0,
            patients: counts['paciente'] || 0,
            pharmacies: counts['farmacia'] || 0,
            corporateUsers: (counts['corporate'] || 0) + (counts['admin'] || 0)
        };
    } catch (error) {
        console.error('[getCorporateStats] Failed:', error);
        return {
            totalUsers: 0,
            doctors: 0,
            patients: 0,
            pharmacies: 0,
            corporateUsers: 0
        };
    }
}

/**
 * Get count for a specific role
 */
export async function getRoleCount(role: UserRole): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', role);

        if (error) {
            console.error(`[getRoleCount] Error for ${role}:`, error);
            throw error;
        }

        console.log(`[getRoleCount] ${role} count:`, count);
        return count || 0;
    } catch (error) {
        console.error(`[getRoleCount] Failed for ${role}:`, error);
        return 0;
    }
}

// ============================================
// DOCTORS
// ============================================

export interface DoctorProfile extends Profile {
    role: 'medico';
}

/**
 * Get all doctors with optional filters
 */
export async function getDoctors(options?: {
    searchTerm?: string;
    estado?: string;
    limit?: number;
}): Promise<DoctorProfile[]> {
    try {
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'medico')
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[getDoctors] Error:', error);
            throw error;
        }

        console.log('[getDoctors] Found:', data?.length || 0, 'doctors');

        let result = data as DoctorProfile[] || [];

        // Client-side filtering for search
        if (options?.searchTerm) {
            const term = options.searchTerm.toLowerCase();
            result = result.filter(doc =>
                doc.nombre_completo?.toLowerCase().includes(term) ||
                doc.email?.toLowerCase().includes(term) ||
                doc.especialidad?.toLowerCase().includes(term)
            );
        }

        if (options?.estado) {
            result = result.filter(doc => doc.estado === options.estado);
        }

        return result;
    } catch (error) {
        console.error('[getDoctors] Failed:', error);
        return [];
    }
}

// ============================================
// PATIENTS
// ============================================

export async function getPatients(options?: {
    searchTerm?: string;
    limit?: number;
}): Promise<Profile[]> {
    try {
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'paciente')
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[getPatients] Error:', error);
            throw error;
        }

        console.log('[getPatients] Found:', data?.length || 0, 'patients');
        return data || [];
    } catch (error) {
        console.error('[getPatients] Failed:', error);
        return [];
    }
}

// ============================================
// PHARMACIES
// ============================================

export async function getPharmacies(options?: {
    searchTerm?: string;
    limit?: number;
}): Promise<Profile[]> {
    try {
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'farmacia')
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[getPharmacies] Error:', error);
            throw error;
        }

        console.log('[getPharmacies] Found:', data?.length || 0, 'pharmacies');
        return data || [];
    } catch (error) {
        console.error('[getPharmacies] Failed:', error);
        return [];
    }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to profile changes
 */
export function subscribeToProfiles(
    callback: (payload: { eventType: string; new: Profile | null; old: Profile | null }) => void
) {
    const channel = supabase
        .channel('profiles-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            (payload) => {
                callback({
                    eventType: payload.eventType,
                    new: payload.new as Profile | null,
                    old: payload.old as Profile | null
                });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface DashboardStats {
    poblacion: number;
    farmacias: number;
    doctores: number;
    tickets: number;
    security: 'SECURE' | 'WARNING' | 'CRITICAL';
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const [profilesRes, farmaciasRes, doctoresRes, ticketsRes] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmacia'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'medico'),
            supabase.from('support_tickets').select('*', { count: 'exact', head: true })
        ]);

        console.log('[getDashboardStats] Results:', {
            poblacion: profilesRes.count,
            farmacias: farmaciasRes.count,
            doctores: doctoresRes.count,
            tickets: ticketsRes.count
        });

        return {
            poblacion: profilesRes.count || 0,
            farmacias: farmaciasRes.count || 0,
            doctores: doctoresRes.count || 0,
            tickets: ticketsRes.count || 0,
            security: 'SECURE'
        };
    } catch (error) {
        console.error('[getDashboardStats] Failed:', error);
        return {
            poblacion: 0,
            farmacias: 0,
            doctores: 0,
            tickets: 0,
            security: 'WARNING'
        };
    }
}
