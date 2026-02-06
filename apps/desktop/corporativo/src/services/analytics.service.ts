/**
 * Corporate Analytics Service
 * Centralized service for all corporate KPIs and metrics
 */

import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export interface CorporateKPIs {
    totalUsers: number;
    doctors: number;
    pharmacies: number;
    patients: number;
    corporateUsers: number;
    pendingTickets: number;
    verifiedPharmacies: number;
    growthRate: number;
    growthTrend: 'up' | 'down' | 'stable';
}

export interface GrowthDataPoint {
    month: string;
    date: string;
    doctors: number;
    pharmacies: number;
    patients: number;
    total: number;
}

export interface RoleDistribution {
    role: string;
    count: number;
    percentage: number;
    color: string;
}

export interface ActivityMetrics {
    activeToday: number;
    activeThisWeek: number;
    activeThisMonth: number;
    inactiveUsers: number;
}

export type DateRange = '7d' | '30d' | '90d' | '6m' | '1y';

// ============================================
// COLOR PALETTE
// ============================================

const ROLE_COLORS: Record<string, string> = {
    medico: '#3b82f6',      // blue
    farmacia: '#6366f1',    // indigo
    paciente: '#10b981',    // emerald
    admin: '#f59e0b',       // amber
    gerente: '#eab308',     // yellow
    administrador: '#a855f7', // purple
    contador: '#06b6d4',    // cyan
    rrhh: '#ec4899',        // pink
    soporte: '#f97316',     // orange
    analista: '#84cc16',    // lime
    supervisor: '#14b8a6',  // teal
    corporate: '#f59e0b',   // amber
    default: '#64748b'      // slate
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Get all corporate KPIs in a single call
 */
export async function getCorporateKPIs(): Promise<CorporateKPIs> {
    try {
        console.log('[getCorporateKPIs] Fetching KPIs...');

        // Parallel queries for efficiency
        const [
            totalRes,
            doctorsRes,
            pharmaciesRes,
            patientsRes,
            verifiedPharmaciesRes,
            ticketsRes,
            corporateRes,
            lastMonthRes
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'medico'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmacia'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'paciente'),
            supabase.from('profiles').select('*', { count: 'exact', head: true })
                .eq('role', 'farmacia')
                .eq('sacs_verificado', true),
            supabase.from('support_tickets').select('*', { count: 'exact', head: true })
                .in('status', ['open', 'pending', 'in_progress']),
            supabase.from('profiles').select('*', { count: 'exact', head: true })
                .in('role', ['gerente', 'administrador', 'contador', 'rrhh', 'soporte', 'analista', 'supervisor', 'admin', 'corporate']),
            // Get count from last month for growth calculation
            supabase.from('profiles').select('*', { count: 'exact', head: true })
                .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        const total = totalRes.count || 0;
        const lastMonthTotal = lastMonthRes.count || 0;
        const newUsers = total - lastMonthTotal;
        const growthRate = lastMonthTotal > 0 ? ((newUsers / lastMonthTotal) * 100) : 0;

        const kpis: CorporateKPIs = {
            totalUsers: total,
            doctors: doctorsRes.count || 0,
            pharmacies: pharmaciesRes.count || 0,
            patients: patientsRes.count || 0,
            corporateUsers: corporateRes.count || 0,
            pendingTickets: ticketsRes.count || 0,
            verifiedPharmacies: verifiedPharmaciesRes.count || 0,
            growthRate: Math.round(growthRate * 10) / 10,
            growthTrend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable'
        };

        console.log('[getCorporateKPIs] KPIs:', kpis);
        return kpis;

    } catch (error) {
        console.error('[getCorporateKPIs] Error:', error);
        return {
            totalUsers: 0,
            doctors: 0,
            pharmacies: 0,
            patients: 0,
            corporateUsers: 0,
            pendingTickets: 0,
            verifiedPharmacies: 0,
            growthRate: 0,
            growthTrend: 'stable'
        };
    }
}

/**
 * Get growth history for the last N months
 */
export async function getGrowthHistory(months: number = 6): Promise<GrowthDataPoint[]> {
    try {
        console.log('[getGrowthHistory] Fetching last', months, 'months...');

        // Get all profiles with created_at
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('role, created_at')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by month
        const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        const dataPoints: GrowthDataPoint[] = [];

        for (let i = months - 1; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            // Count cumulative registrations up to this month
            const upToThisMonth = profiles?.filter(p =>
                new Date(p.created_at) <= endOfMonth
            ) || [];

            const doctors = upToThisMonth.filter(p => p.role === 'medico').length;
            const pharmacies = upToThisMonth.filter(p => p.role === 'farmacia').length;
            const patients = upToThisMonth.filter(p => p.role === 'paciente').length;

            dataPoints.push({
                month: monthLabels[targetDate.getMonth()],
                date: targetDate.toISOString().split('T')[0],
                doctors,
                pharmacies,
                patients,
                total: doctors + pharmacies + patients
            });
        }

        console.log('[getGrowthHistory] Data points:', dataPoints.length);
        return dataPoints;

    } catch (error) {
        console.error('[getGrowthHistory] Error:', error);
        return [];
    }
}

/**
 * Get role distribution for pie/donut chart
 */
export async function getRoleDistribution(): Promise<RoleDistribution[]> {
    try {
        console.log('[getRoleDistribution] Fetching...');

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('role');

        if (error) throw error;

        // Count by role
        const counts: Record<string, number> = {};
        profiles?.forEach(p => {
            counts[p.role] = (counts[p.role] || 0) + 1;
        });

        const total = profiles?.length || 1;
        const distribution: RoleDistribution[] = Object.entries(counts)
            .map(([role, count]) => ({
                role,
                count,
                percentage: Math.round((count / total) * 100),
                color: ROLE_COLORS[role] || ROLE_COLORS.default
            }))
            .sort((a, b) => b.count - a.count);

        console.log('[getRoleDistribution] Distribution:', distribution);
        return distribution;

    } catch (error) {
        console.error('[getRoleDistribution] Error:', error);
        return [];
    }
}

/**
 * Get new registrations for current period vs previous
 */
export async function getRegistrationComparison(range: DateRange = '30d'): Promise<{
    current: number;
    previous: number;
    change: number;
    changePercent: number;
}> {
    try {
        const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : range === '6m' ? 180 : 365;
        const now = new Date();
        const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

        const [currentRes, previousRes] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true })
                .gte('created_at', currentStart.toISOString()),
            supabase.from('profiles').select('*', { count: 'exact', head: true })
                .gte('created_at', previousStart.toISOString())
                .lt('created_at', currentStart.toISOString())
        ]);

        const current = currentRes.count || 0;
        const previous = previousRes.count || 0;
        const change = current - previous;
        const changePercent = previous > 0 ? Math.round((change / previous) * 100) : 0;

        return { current, previous, change, changePercent };

    } catch (error) {
        console.error('[getRegistrationComparison] Error:', error);
        return { current: 0, previous: 0, change: 0, changePercent: 0 };
    }
}

/**
 * Get pharmacy network statistics
 */
export async function getPharmacyNetworkStats(): Promise<{
    total: number;
    verified: number;
    pending: number;
    verificationRate: number;
    byCity: { city: string; count: number }[];
}> {
    try {
        const { data: pharmacies, error } = await supabase
            .from('profiles')
            .select('sacs_verificado, ciudad')
            .eq('role', 'farmacia');

        if (error) throw error;

        const total = pharmacies?.length || 0;
        const verified = pharmacies?.filter(p => p.sacs_verificado === true).length || 0;
        const pending = total - verified;

        // Group by city
        const cityCounts: Record<string, number> = {};
        pharmacies?.forEach(p => {
            const city = p.ciudad || 'Sin especificar';
            cityCounts[city] = (cityCounts[city] || 0) + 1;
        });

        const byCity = Object.entries(cityCounts)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            total,
            verified,
            pending,
            verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0,
            byCity
        };

    } catch (error) {
        console.error('[getPharmacyNetworkStats] Error:', error);
        return { total: 0, verified: 0, pending: 0, verificationRate: 0, byCity: [] };
    }
}

/**
 * Export metrics to CSV format
 */
export function exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}
