/**
 * @file eficiencia-tab.tsx
 * @description Tab 7: Eficiencia Operativa conectado a Supabase
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Skeleton } from "@red-salud/ui";
import { supabase } from "@/lib/supabase/client";
import { TrendingUp, Clock, XCircle, CheckCircle } from "lucide-react";

interface EficienciaTabProps {
  doctorId: string;
  dateRange: { start: Date; end: Date };
}

interface EficienciaStats {
  consultasPorDia: number;
  tasaNoShows: number;
  tasaCancelaciones: number;
  tasaCompletadas: number;
  totalCitas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasNoShow: number;
}

export function EficienciaTab({ doctorId, dateRange }: EficienciaTabProps) {
  const [stats, setStats] = useState<EficienciaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEficiencia();
  }, [loadEficiencia]);

  const loadEficiencia = useCallback(async () => {
    try {
      setLoading(true);

      // Total de citas en el período
      const { count: totalCitas } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('appointment_date', dateRange.start.toISOString())
        .lte('appointment_date', dateRange.end.toISOString());

      // Citas completadas
      const { count: citasCompletadas } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('status', 'completed')
        .gte('appointment_date', dateRange.start.toISOString())
        .lte('appointment_date', dateRange.end.toISOString());

      // Citas canceladas
      const { count: citasCanceladas } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('status', 'cancelled')
        .gte('appointment_date', dateRange.start.toISOString())
        .lte('appointment_date', dateRange.end.toISOString());

      // No-shows (simulado como citas no completadas ni canceladas)
      const citasNoShow = (totalCitas || 0) - (citasCompletadas || 0) - (citasCanceladas || 0);

      // Calcular días en el período
      const dias = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const consultasPorDia = dias > 0 ? (totalCitas || 0) / dias : 0;

      const tasaCompletadas = totalCitas ? ((citasCompletadas || 0) / totalCitas) * 100 : 0;
      const tasaCancelaciones = totalCitas ? ((citasCanceladas || 0) / totalCitas) * 100 : 0;
      const tasaNoShows = totalCitas ? (citasNoShow / totalCitas) * 100 : 0;

      setStats({
        consultasPorDia,
        tasaNoShows,
        tasaCancelaciones,
        tasaCompletadas,
        totalCitas: totalCitas || 0,
        citasCompletadas: citasCompletadas || 0,
        citasCanceladas: citasCanceladas || 0,
        citasNoShow,
      });
    } catch (error) {
      console.error("Error loading eficiencia:", error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, dateRange]);

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Consultas/Día
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.consultasPorDia.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Promedio del período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tasa Completadas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.tasaCompletadas.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.citasCompletadas} de {stats.totalCitas} citas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tasa Cancelación
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.tasaCancelaciones.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.citasCanceladas} citas canceladas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tasa No-Show
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.tasaNoShows.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.citasNoShow} pacientes no asistieron
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Eficiencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Citas Completadas</span>
                <span className="text-sm font-semibold text-green-600">
                  {stats.citasCompletadas} ({stats.tasaCompletadas.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.tasaCompletadas}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Citas Canceladas</span>
                <span className="text-sm font-semibold text-orange-600">
                  {stats.citasCanceladas} ({stats.tasaCancelaciones.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.tasaCancelaciones}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">No-Shows</span>
                <span className="text-sm font-semibold text-red-600">
                  {stats.citasNoShow} ({stats.tasaNoShows.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.tasaNoShows}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
