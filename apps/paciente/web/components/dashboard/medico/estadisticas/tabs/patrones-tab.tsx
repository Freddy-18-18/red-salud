/**
 * @file patrones-tab.tsx
 * @description Tab 5: Patrones Temporales conectado a Supabase
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Skeleton } from "@red-salud/design-system";
import { supabase } from "@/lib/supabase/client";
import { Clock, Calendar } from "lucide-react";

interface PatronesTabProps {
  doctorId: string;
  dateRange: { start: Date; end: Date };
}

interface PatronHorario {
  hora: number;
  count: number;
}

interface PatronDiario {
  dia: string;
  count: number;
}

export function PatronesTab({ doctorId, dateRange }: PatronesTabProps) {
  const [patronesHorarios, setPatronesHorarios] = useState<PatronHorario[]>([]);
  const [patronesDiarios, setPatronesDiarios] = useState<PatronDiario[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatrones = useCallback(async () => {
    try {
      setLoading(true);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('doctor_id', doctorId)
        .gte('appointment_date', dateRange.start.toISOString())
        .lte('appointment_date', dateRange.end.toISOString());

      if (appointments) {
        // Patrones horarios
        const horariosMap = new Map<number, number>();
        const diasMap = new Map<string, number>();
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        appointments.forEach(apt => {
          const fecha = new Date(apt.appointment_date);
          const hora = fecha.getHours();
          const dia = diasSemana[fecha.getDay()];

          horariosMap.set(hora, (horariosMap.get(hora) || 0) + 1);
          if (dia) {
            diasMap.set(dia, (diasMap.get(dia) || 0) + 1);
          }
        });

        const horarios = Array.from(horariosMap.entries())
          .map(([hora, count]) => ({ hora, count }))
          .sort((a, b) => a.hora - b.hora);

        const dias = diasSemana.map(dia => ({
          dia,
          count: diasMap.get(dia) || 0
        }));

        setPatronesHorarios(horarios);
        setPatronesDiarios(dias);
      }
    } catch (error) {
      console.error("Error loading patrones:", error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, dateRange]);

  useEffect(() => {
    loadPatrones();
  }, [loadPatrones]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxHorario = Math.max(...patronesHorarios.map(p => p.count), 1);
  const maxDiario = Math.max(...patronesDiarios.map(p => p.count), 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Distribución Horaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patronesHorarios.map((patron) => (
              <div key={patron.hora} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {patron.hora.toString().padStart(2, '0')}:00
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {patron.count} citas
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(patron.count / maxHorario) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Distribución Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patronesDiarios.map((patron) => (
              <div key={patron.dia} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {patron.dia}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {patron.count} citas
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(patron.count / maxDiario) * 100}%` }}
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
