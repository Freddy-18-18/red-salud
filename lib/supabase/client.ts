/**
 * Cliente de Supabase para el lado del cliente
 */

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// También exportar la función createClient para compatibilidad
export function createClient() {
  return supabase;
}

// Tipos para las métricas
export interface DashboardMetrics {
  total_patients: number;
  total_doctors: number;
  total_specialties: number;
  satisfaction_percentage: number;
}

// Función para obtener las métricas del dashboard
export async function getDashboardMetrics(): Promise<DashboardMetrics | null> {
  try {
    const res = await fetch('/api/public-metrics', { cache: 'no-store' });
    if (!res.ok) {
      console.warn('Fallo /api/public-metrics, usando fallback');
      return {
        total_patients: 0,
        total_doctors: 0,
        total_specialties: 12,
        satisfaction_percentage: 0,
      };
    }
    const data = await res.json();
    return data as DashboardMetrics;
  } catch (error) {
    console.error("Error in getDashboardMetrics:", error);
    return null;
  }
}
