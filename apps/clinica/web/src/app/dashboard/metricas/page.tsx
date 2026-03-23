'use client';

import { BarChart3, TrendingUp, DollarSign, Clock, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function MetricasPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Metricas Operacionales
        </h1>
        <p className="text-sm text-muted-foreground">KPIs y rendimiento de la clinica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Tasa de Ocupacion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Promedio semanal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Tiempo de Espera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-- min</p>
            <p className="text-xs text-muted-foreground mt-1">Promedio de espera del paciente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Pacientes Atendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0</p>
            <p className="text-xs text-muted-foreground mt-1">Ingresos del mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Tasa de No-Show
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground mt-1">Citas no asistidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              DSO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-- dias</p>
            <p className="text-xs text-muted-foreground mt-1">Days Sales Outstanding</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendencia de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Grafico de tendencia mensual</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
