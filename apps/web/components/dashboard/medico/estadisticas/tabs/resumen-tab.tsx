/**
 * @file resumen-tab.tsx
 * @description Tab 1: Resumen Ejecutivo con KPIs principales conectado a Supabase
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Skeleton } from "@red-salud/ui";
import { supabase } from "@/lib/supabase/client";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface ResumenTabProps {
  doctorId: string;
  dateRange: { start: Date; end: Date };
}

interface ResumenStats {
  totalPacientes: number;
  citasHoy: number;
  citasSemana: number;
  citasMes: number;
  ingresosEsteMes: number;
  ingresosMesAnterior: number;
  pacientesNuevos: number;
  tasaAsistencia: number;
  promedioConsultas: number;
  consultasPendientes: number;
}

export function ResumenTab({ doctorId, dateRange }: ResumenTabProps) {
  const [stats, setStats] = useState<ResumenStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const endOfToday = new Date(now.setHours(23, 59, 59, 999));
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Total de pacientes únicos
      const { count: totalPacientes } = await supabase
        .from('appointments')
        .select('patient_id', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .not('patient_id', 'is', null);

      // Citas de hoy
      const { count: citasHoy } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('appointment_date', startOfToday.toISOString())
        .lte('appointment_date', endOfToday.toISOString());

      // Citas de esta semana
      const { count: citasSemana } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('appointment_date', startOfWeek.toISOString());

      // Citas de este mes
      const { count: citasMes } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('appointment_date', startOfMonth.toISOString());

      // Ingresos este mes (simulado - ajustar según tu estructura)
      const { data: citasEsteMes } = await supabase
        .from('appointments')
        .select('price')
        .eq('doctor_id', doctorId)
        .eq('status', 'completed')
        .gte('appointment_date', startOfMonth.toISOString());

      const ingresosEsteMes = citasEsteMes?.reduce((sum, cita) => sum + (cita.price || 0), 0) || 0;

      // Ingresos mes anterior
      const { data: citasMesAnterior } = await supabase
        .from('appointments')
        .select('price')
        .eq('doctor_id', doctorId)
        .eq('status', 'completed')
        .gte('appointment_date', startOfLastMonth.toISOString())
        .lte('appointment_date', endOfLastMonth.toISOString());

      const ingresosMesAnterior = citasMesAnterior?.reduce((sum, cita) => sum + (cita.price || 0), 0) || 0;

      // Pacientes nuevos este mes
      const { count: pacientesNuevos } = await supabase
        .from('appointments')
        .select('patient_id', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('created_at', startOfMonth.toISOString());

      // Tasa de asistencia
      const { count: citasCompletadas } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('status', 'completed')
        .gte('appointment_date', startOfMonth.toISOString());

      const tasaAsistencia = citasMes ? ((citasCompletadas || 0) / citasMes) * 100 : 0;

      // Consultas pendientes
      const { count: consultasPendientes } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString());

      setStats({
        totalPacientes: totalPacientes || 0,
        citasHoy: citasHoy || 0,
        citasSemana: citasSemana || 0,
        citasMes: citasMes || 0,
        ingresosEsteMes,
        ingresosMesAnterior,
        pacientesNuevos: pacientesNuevos || 0,
        tasaAsistencia,
        promedioConsultas: citasMes ? Math.round(citasMes / 30) : 0,
        consultasPendientes: consultasPendientes || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>No se pudieron cargar las estadísticas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cambioIngresos = stats.ingresosMesAnterior > 0
    ? ((stats.ingresosEsteMes - stats.ingresosMesAnterior) / stats.ingresosMesAnterior) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pacientes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Pacientes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.totalPacientes}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Pacientes únicos atendidos
            </p>
          </CardContent>
        </Card>

        {/* Citas Hoy */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Citas Hoy
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.citasHoy}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Programadas para hoy
            </p>
          </CardContent>
        </Card>

        {/* Citas Esta Semana */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Esta Semana
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.citasSemana}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Citas programadas
            </p>
          </CardContent>
        </Card>

        {/* Citas Este Mes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Este Mes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.citasMes}
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Total del mes actual
            </p>
          </CardContent>
        </Card>

        {/* Ingresos Este Mes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ingresos Mes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  ${stats.ingresosEsteMes.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`h-3 w-3 ${cambioIngresos >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <p className={`text-xs ${cambioIngresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cambioIngresos >= 0 ? '+' : ''}{cambioIngresos.toFixed(1)}% vs mes anterior
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pacientes Nuevos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Nuevos Pacientes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.pacientesNuevos}
                </p>
              </div>
              <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Este mes
            </p>
          </CardContent>
        </Card>

        {/* Tasa de Asistencia */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tasa Asistencia
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.tasaAsistencia.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Citas completadas
            </p>
          </CardContent>
        </Card>

        {/* Consultas Pendientes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.consultasPendientes}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Por atender
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Promedio de consultas diarias</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {stats.promedioConsultas} citas/día
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ingreso promedio por consulta</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ${stats.citasMes > 0 ? Math.round(stats.ingresosEsteMes / stats.citasMes).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Crecimiento de pacientes</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                +{stats.pacientesNuevos} este mes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
