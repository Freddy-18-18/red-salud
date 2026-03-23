'use client';

import { History, Search, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function HistorialPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-red-600" />
          Historial de Llamadas
        </h1>
        <p className="text-sm text-muted-foreground">Registro de emergencias atendidas</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por paciente, direccion, unidad..." />
        </div>
        <input type="date" className="border rounded-lg px-3 py-2 text-sm bg-background" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Estadisticas de Respuesta</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Grafico de tiempos de respuesta</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay registros</p>
            <p className="text-sm mt-1">El historial de emergencias atendidas aparecera aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
