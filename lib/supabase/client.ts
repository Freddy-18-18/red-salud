/**
 * Cliente de Supabase para el lado del cliente
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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
    const { data, error } = await supabase
      .from("dashboard_metrics")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching metrics:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getDashboardMetrics:", error);
    return null;
  }
}
