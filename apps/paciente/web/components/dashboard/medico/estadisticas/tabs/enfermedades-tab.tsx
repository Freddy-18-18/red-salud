/**
 * @file enfermedades-tab.tsx
 * @description Tab 3: Enfermedades & Epidemiología conectado a Supabase
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Skeleton } from "@red-salud/design-system";
import { supabase } from "@/lib/supabase/client";
import { Activity, AlertCircle } from "lucide-react";

interface EnfermedadesTabProps {
  doctorId: string;
  dateRange: { start: Date; end: Date };
}

interface DiagnosticoCount {
  diagnostico: string;
  count: number;
}

export function EnfermedadesTab({ doctorId, dateRange }: EnfermedadesTabProps) {
  const [topDiagnosticos, setTopDiagnosticos] = useState<DiagnosticoCount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnfermedades = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener diagnósticos de las consultas médicas
      const { data: records } = await supabase
        .from('medical_records')
        .select('diagnosis')
        .eq('doctor_id', doctorId)
        .not('diagnosis', 'is', null)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      if (records) {
        // Contar diagnósticos
        const diagnosticosMap = new Map<string, number>();
        records.forEach(record => {
          if (record.diagnosis) {
            const count = diagnosticosMap.get(record.diagnosis) || 0;
            diagnosticosMap.set(record.diagnosis, count + 1);
          }
        });

        // Convertir a array y ordenar
        const sorted = Array.from(diagnosticosMap.entries())
          .map(([diagnostico, count]) => ({ diagnostico, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopDiagnosticos(sorted);
      }
    } catch (error) {
      console.error("Error loading enfermedades:", error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, dateRange]);

  useEffect(() => {
    loadEnfermedades();
  }, [loadEnfermedades]);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Top 10 Diagnósticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topDiagnosticos.length > 0 ? (
            <div className="space-y-4">
              {topDiagnosticos.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {index + 1}. {item.diagnostico}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {item.count} casos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${topDiagnosticos[0] ? (item.count / topDiagnosticos[0].count) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="h-5 w-5" />
              <p>No hay datos de diagnósticos en el período seleccionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
