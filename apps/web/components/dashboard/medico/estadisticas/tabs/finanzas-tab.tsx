/**
 * @file finanzas-tab.tsx
 * @description Tab 4: Finanzas & RCM conectado a Supabase
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Skeleton } from "@red-salud/ui";
import { supabase } from "@/lib/supabase/client";
import { DollarSign, TrendingUp, CreditCard, Clock } from "lucide-react";

interface FinanzasTabProps {
  doctorId: string;
  dateRange: { start: Date; end: Date };
}

interface FinanzasStats {
  ingresosTotal: number;
  ingresosMesActual: number;
  ingresosMesAnterior: number;
  ticketPromedio: number;
  citasPagadas: number;
  citasPendientes: number;
  tasaCobro: number;
}

export function FinanzasTab({ doctorId, dateRange }: FinanzasTabProps) {
  const [stats, setStats] = useState<FinanzasStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinanzas();
  }, [loadFinanzas]);

  const loadFinanzas = useCallback(async () => {
    try {
      setLoading(true);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Ingresos totales
      const { data: todasCitas } = await supabase
        .from('appointments')
        .select('price, status')
        .eq('doctor_id', doctorId)
        .eq('status', 'completed');

      const ingresosTotal = todasCitas?.reduce((sum, cita) => sum + (cita.price || 0), 0) || 0;

      // Ingresos mes actual
      const { data: citasMesActual } = await supabase
        .from('appointments')
        .select('price')
        .eq('doctor_id', doctorId)
        .eq('status', 'completed')
        .gte('appointment_date', startOfMonth.toISOString());

      const ingresosMesActual = citasMesActual?.reduce((sum, cita) => sum + (cita.price || 0), 0) || 0;

      // Ingresos mes anterior
      const { data: citasMesAnterior } = await supabase
        .from('appointments')
        .select('price')
        .eq('doctor_id', doctorId)
        .eq('status', 'completed')
        .gte('appointment_date', startOfLastMonth.toISOString())
        .lte('appointment_date', endOfLastMonth.toISOString());

      const ingresosMesAnterior = citasMesAnterior?.reduce((sum, cita) => sum + (cita.price || 0), 0) || 0;

      // Citas pagadas y pendientes
      const { count: citasPagadas } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('status', 'completed');

      const { count: citasPendientes } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('status', 'scheduled');

      const ticketPromedio = citasPagadas && citasPagadas > 0 ? ingresosTotal / citasPagadas : 0;
      const tasaCobro = (citasPagadas || 0) + (citasPendientes || 0) > 0
        ? ((citasPagadas || 0) / ((citasPagadas || 0) + (citasPendientes || 0))) * 100
        : 0;

      setStats({
        ingresosTotal,
        ingresosMesActual,
        ingresosMesAnterior,
        ticketPromedio,
        citasPagadas: citasPagadas || 0,
        citasPendientes: citasPendientes || 0,
        tasaCobro,
      });
    } catch (error) {
      console.error("Error loading finanzas:", error);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cambioIngresos = stats.ingresosMesAnterior > 0
    ? ((stats.ingresosMesActual - stats.ingresosMesAnterior) / stats.ingresosMesAnterior) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  ${stats.ingresosTotal.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Histórico completo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mes Actual
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  ${stats.ingresosMesActual.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className={`text-xs mt-2 ${cambioIngresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {cambioIngresos >= 0 ? '+' : ''}{cambioIngresos.toFixed(1)}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ticket Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  ${Math.round(stats.ticketPromedio).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Por consulta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tasa de Cobro
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.tasaCobro.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Citas cobradas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Citas pagadas</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {stats.citasPagadas}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Citas pendientes</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {stats.citasPendientes}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos mes anterior</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ${stats.ingresosMesAnterior.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
