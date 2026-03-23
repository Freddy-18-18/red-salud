'use client';

import { FlaskConical, ClipboardList, FileCheck, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function LaboratorioOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-orange-600" />
          Panel de Laboratorio
        </h1>
        <p className="text-sm text-muted-foreground">Resumen de ordenes y resultados del dia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <ClipboardList className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Ordenes Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Valores Anormales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ordenes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay ordenes recientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultados por Validar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay resultados pendientes de validacion</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
