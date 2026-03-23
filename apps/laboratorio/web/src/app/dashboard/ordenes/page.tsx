'use client';

import { ClipboardList, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function OrdenesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-orange-600" />
            Ordenes de Laboratorio
          </h1>
          <p className="text-sm text-muted-foreground">Gestion de ordenes de examenes</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Nueva Orden</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por paciente, numero de orden..." />
        </div>
        <select className="border rounded-lg px-3 py-2 text-sm bg-background">
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completada">Completada</option>
        </select>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay ordenes</p>
            <p className="text-sm mt-1">Las ordenes de laboratorio apareceran aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
