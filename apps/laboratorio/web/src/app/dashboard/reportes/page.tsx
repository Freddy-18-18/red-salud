'use client';

import { BarChart3, TrendingUp, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function ReportesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-orange-600" />
          Reportes
        </h1>
        <p className="text-sm text-muted-foreground">Estadisticas y reportes del laboratorio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Examenes Este Mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">-- hrs</p>
                <p className="text-xs text-muted-foreground">Tiempo Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Reportes Generados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Volumen de Examenes por Mes</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Grafico de volumen mensual</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
