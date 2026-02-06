/**
 * @file laboratorio-tab.tsx
 * @description Tab 6: Laboratorio & Medicamentos conectado a Supabase
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Skeleton } from "@red-salud/ui";
import { supabase } from "@/lib/supabase/client";
import { FlaskConical, Pill, AlertCircle } from "lucide-react";

interface LaboratorioTabProps {
  doctorId: string;
  dateRange: { start: Date; end: Date };
}

interface LabStats {
  totalExamenes: number;
  totalMedicamentos: number;
  topExamenes: Array<{ nombre: string; count: number }>;
  topMedicamentos: Array<{ nombre: string; count: number }>;
}

export function LaboratorioTab({ doctorId, dateRange }: LaboratorioTabProps) {
  const [stats, setStats] = useState<LabStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLaboratorio = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener exámenes de laboratorio
      const { data: labResults } = await supabase
        .from('laboratory_results')
        .select('test_name')
        .eq('doctor_id', doctorId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Obtener medicamentos recipedos
      const { data: medications } = await supabase
        .from('medications')
        .select('name')
        .eq('doctor_id', doctorId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Procesar exámenes
      const examenesMap = new Map<string, number>();
      labResults?.forEach(result => {
        if (result.test_name) {
          examenesMap.set(result.test_name, (examenesMap.get(result.test_name) || 0) + 1);
        }
      });

      const topExamenes = Array.from(examenesMap.entries())
        .map(([nombre, count]) => ({ nombre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Procesar medicamentos
      const medicamentosMap = new Map<string, number>();
      medications?.forEach(med => {
        if (med.name) {
          medicamentosMap.set(med.name, (medicamentosMap.get(med.name) || 0) + 1);
        }
      });

      const topMedicamentos = Array.from(medicamentosMap.entries())
        .map(([nombre, count]) => ({ nombre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalExamenes: labResults?.length || 0,
        totalMedicamentos: medications?.length || 0,
        topExamenes,
        topMedicamentos,
      });
    } catch (error) {
      console.error("Error loading laboratorio:", error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, dateRange]);

  useEffect(() => {
    loadLaboratorio();
  }, [loadLaboratorio]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-64 w-full" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exámenes de Laboratorio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Exámenes Más Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topExamenes.length > 0 ? (
              <div className="space-y-4">
                {stats.topExamenes.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {index + 1}. {item.nombre}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${stats.topExamenes[0] ? (item.count / stats.topExamenes[0].count) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total de exámenes: <span className="font-semibold">{stats.totalExamenes}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="h-5 w-5" />
                <p>No hay datos de exámenes en el período</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medicamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medicamentos Más recipedos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topMedicamentos.length > 0 ? (
              <div className="space-y-4">
                {stats.topMedicamentos.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {index + 1}. {item.nombre}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${stats.topMedicamentos[0] ? (item.count / stats.topMedicamentos[0].count) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total de recipe: <span className="font-semibold">{stats.totalMedicamentos}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="h-5 w-5" />
                <p>No hay datos de medicamentos en el período</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
