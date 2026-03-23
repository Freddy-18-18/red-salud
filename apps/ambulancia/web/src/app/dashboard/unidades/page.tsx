'use client';

import { Truck, Plus, Wrench, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";

export default function UnidadesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-red-600" />
            Flota de Unidades
          </h1>
          <p className="text-sm text-muted-foreground">Gestion de ambulancias y vehiculos</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Nueva Unidad</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div><p className="text-xl font-bold">0</p><p className="text-xs text-muted-foreground">Operativas</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-yellow-500" />
            <div><p className="text-xl font-bold">0</p><p className="text-xs text-muted-foreground">En Mantenimiento</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <div><p className="text-xl font-bold">0</p><p className="text-xs text-muted-foreground">Fuera de Servicio</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay unidades registradas</p>
            <p className="text-sm mt-1">Registra las ambulancias y vehiculos de tu flota</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
