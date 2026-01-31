/**
 * @file pacientes-tab.tsx
 * @description Tab 2: Pacientes & Demografía conectado a Supabase
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Skeleton } from "@red-salud/ui";
import { supabase } from "@/lib/supabase/client";
import { Users, MapPin, Heart, Activity } from "lucide-react";

interface PacientesTabProps {
  doctorId: string;
  dateRange: { start: Date; end: Date };
}

interface DemografiaStats {
  totalPacientes: number;
  porGenero: { masculino: number; femenino: number; otro: number };
  porEdad: { [key: string]: number };
  pacientesActivos: number;
  pacientesNuevos: number;
  promedioEdad: number;
}

export function PacientesTab({ doctorId, dateRange }: PacientesTabProps) {
  const [stats, setStats] = useState<DemografiaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemografia();
  }, [loadDemografia]);

  const loadDemografia = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener todos los pacientes del médico
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          created_at,
          patients:patient_id (
            id,
            gender,
            date_of_birth
          )
        `)
        .eq('doctor_id', doctorId)
        .not('patient_id', 'is', null);

      if (!appointments) {
        setStats({
          totalPacientes: 0,
          porGenero: { masculino: 0, femenino: 0, otro: 0 },
          porEdad: {},
          pacientesActivos: 0,
          pacientesNuevos: 0,
          promedioEdad: 0,
        });
        setLoading(false);
        return;
      }

      // Obtener pacientes únicos
      const pacientesUnicos = new Map();
      appointments.forEach(apt => {
        if (apt.patients && !pacientesUnicos.has(apt.patient_id)) {
          pacientesUnicos.set(apt.patient_id, {
            ...apt.patients,
            firstVisit: apt.created_at
          });
        }
      });

      const pacientes = Array.from(pacientesUnicos.values());

      // Calcular estadísticas por género
      const porGenero = {
        masculino: pacientes.filter(p => p.gender === 'male').length,
        femenino: pacientes.filter(p => p.gender === 'female').length,
        otro: pacientes.filter(p => p.gender !== 'male' && p.gender !== 'female').length,
      };

      // Calcular distribución por edad
      const porEdad: { [key: string]: number } = {
        '0-17': 0,
        '18-30': 0,
        '31-45': 0,
        '46-60': 0,
        '61+': 0,
      };

      let sumaEdades = 0;
      let countEdades = 0;

      pacientes.forEach(p => {
        if (p.date_of_birth) {
          const edad = new Date().getFullYear() - new Date(p.date_of_birth).getFullYear();
          sumaEdades += edad;
          countEdades++;

          if (edad < 18) porEdad['0-17']++;
          else if (edad <= 30) porEdad['18-30']++;
          else if (edad <= 45) porEdad['31-45']++;
          else if (edad <= 60) porEdad['46-60']++;
          else porEdad['61+']++;
        }
      });

      // Pacientes activos (con cita en los últimos 90 días)
      const hace90Dias = new Date();
      hace90Dias.setDate(hace90Dias.getDate() - 90);

      const { count: pacientesActivos } = await supabase
        .from('appointments')
        .select('patient_id', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('appointment_date', hace90Dias.toISOString());

      // Pacientes nuevos (primer cita en el rango de fechas)
      const pacientesNuevos = pacientes.filter(p => {
        const firstVisit = new Date(p.firstVisit);
        return firstVisit >= dateRange.start && firstVisit <= dateRange.end;
      }).length;

      setStats({
        totalPacientes: pacientes.length,
        porGenero,
        porEdad,
        pacientesActivos: pacientesActivos || 0,
        pacientesNuevos,
        promedioEdad: countEdades > 0 ? Math.round(sumaEdades / countEdades) : 0,
      });
    } catch (error) {
      console.error("Error loading demografia:", error);
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
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Pacientes únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pacientes Activos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.pacientesActivos}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Últimos 90 días
            </p>
          </CardContent>
        </Card>

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
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              En el período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Edad Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.promedioEdad} años
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              De todos los pacientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Género */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Género</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Masculino</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {stats.porGenero.masculino} ({stats.totalPacientes > 0 ? ((stats.porGenero.masculino / stats.totalPacientes) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalPacientes > 0 ? (stats.porGenero.masculino / stats.totalPacientes) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Femenino</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {stats.porGenero.femenino} ({stats.totalPacientes > 0 ? ((stats.porGenero.femenino / stats.totalPacientes) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-pink-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalPacientes > 0 ? (stats.porGenero.femenino / stats.totalPacientes) * 100 : 0}%` }}
                />
              </div>
            </div>

            {stats.porGenero.otro > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Otro</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {stats.porGenero.otro} ({stats.totalPacientes > 0 ? ((stats.porGenero.otro / stats.totalPacientes) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalPacientes > 0 ? (stats.porGenero.otro / stats.totalPacientes) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distribución por Edad */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Edad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.porEdad).map(([rango, cantidad]) => (
              <div key={rango} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{rango} años</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {cantidad} ({stats.totalPacientes > 0 ? ((cantidad / stats.totalPacientes) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalPacientes > 0 ? (cantidad / stats.totalPacientes) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
