/**
 * @file brotes-tab.tsx
 * @description Tab 8: Detección de Brotes Epidemiológicos conectado a Supabase
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Skeleton } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { supabase } from "@/lib/supabase/client";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";

interface BrotesTabProps {
  doctorId: string;
  dateRange: { start: Date; end: Date };
}

interface BroteDetectado {
  diagnostico: string;
  casos: number;
  tendencia: number;
  nivel: 'bajo' | 'medio' | 'alto';
}

export function BrotesTab({ doctorId, dateRange }: BrotesTabProps) {
  const [brotes, setBrotes] = useState<BroteDetectado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectarBrotes();
  }, [detectarBrotes]);

  const detectarBrotes = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener diagnósticos del período actual
      const { data: recordsActuales } = await supabase
        .from('medical_records')
        .select('diagnosis, created_at')
        .eq('doctor_id', doctorId)
        .not('diagnosis', 'is', null)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Obtener diagnósticos del período anterior (mismo rango de tiempo)
      const diasPeriodo = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const periodoAnteriorStart = new Date(dateRange.start);
      periodoAnteriorStart.setDate(periodoAnteriorStart.getDate() - diasPeriodo);
      const periodoAnteriorEnd = new Date(dateRange.start);

      const { data: recordsAnteriores } = await supabase
        .from('medical_records')
        .select('diagnosis')
        .eq('doctor_id', doctorId)
        .not('diagnosis', 'is', null)
        .gte('created_at', periodoAnteriorStart.toISOString())
        .lte('created_at', periodoAnteriorEnd.toISOString());

      // Contar casos actuales
      const casosActuales = new Map<string, number>();
      recordsActuales?.forEach(record => {
        if (record.diagnosis) {
          casosActuales.set(record.diagnosis, (casosActuales.get(record.diagnosis) || 0) + 1);
        }
      });

      // Contar casos anteriores
      const casosAnteriores = new Map<string, number>();
      recordsAnteriores?.forEach(record => {
        if (record.diagnosis) {
          casosAnteriores.set(record.diagnosis, (casosAnteriores.get(record.diagnosis) || 0) + 1);
        }
      });

      // Detectar brotes (incremento significativo)
      const brotesDetectados: BroteDetectado[] = [];

      casosActuales.forEach((casosNuevos, diagnostico) => {
        const casosViejos = casosAnteriores.get(diagnostico) || 0;
        const incremento = casosViejos > 0 ? ((casosNuevos - casosViejos) / casosViejos) * 100 : 100;

        // Solo considerar brotes si hay al menos 3 casos y un incremento > 50%
        if (casosNuevos >= 3 && incremento > 50) {
          let nivel: 'bajo' | 'medio' | 'alto' = 'bajo';
          if (incremento > 200) nivel = 'alto';
          else if (incremento > 100) nivel = 'medio';

          brotesDetectados.push({
            diagnostico,
            casos: casosNuevos,
            tendencia: incremento,
            nivel,
          });
        }
      });

      // Ordenar por nivel de alerta y casos
      brotesDetectados.sort((a, b) => {
        const nivelOrder = { alto: 3, medio: 2, bajo: 1 };
        if (nivelOrder[a.nivel] !== nivelOrder[b.nivel]) {
          return nivelOrder[b.nivel] - nivelOrder[a.nivel];
        }
        return b.casos - a.casos;
      });

      setBrotes(brotesDetectados);
    } catch (error) {
      console.error("Error detecting brotes:", error);
    } finally {
      setLoading(false);
    }
  }, [doctorId, dateRange]);

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

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'alto': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medio': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'bajo': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Brotes Detectados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {brotes.length}
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              En el período actual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Nivel Alto
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {brotes.filter(b => b.nivel === 'alto').length}
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  En Monitoreo
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {brotes.filter(b => b.nivel === 'medio' || b.nivel === 'bajo').length}
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Nivel medio y bajo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Brotes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Brotes Epidemiológicos Detectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {brotes.length > 0 ? (
            <div className="space-y-4">
              {brotes.map((brote, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {brote.diagnostico}
                      </h4>
                      <Badge className={getNivelColor(brote.nivel)}>
                        {brote.nivel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {brote.casos} casos
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        +{brote.tendencia.toFixed(0)}% vs período anterior
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No se detectaron brotes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay incrementos significativos en diagnósticos durante este período
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del Algoritmo */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre la Detección de Brotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              El sistema detecta brotes comparando el número de casos en el período actual
              con el período anterior de igual duración.
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100">Criterios de detección:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Mínimo 3 casos en el período actual</li>
              <li>Incremento mayor al 50% respecto al período anterior</li>
              <li><span className="font-semibold text-red-600">Alto:</span> Incremento &gt; 200%</li>
              <li><span className="font-semibold text-orange-600">Medio:</span> Incremento 100-200%</li>
              <li><span className="font-semibold text-yellow-600">Bajo:</span> Incremento 50-100%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
