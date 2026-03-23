'use client';

import { CalendarCheck, Plus, Search } from 'lucide-react';
import { Card, CardContent } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function CitasPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-violet-600" />
            Gestion de Citas
          </h1>
          <p className="text-sm text-muted-foreground">Crear, editar y cancelar citas</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Nueva Cita</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por paciente..." />
        </div>
        <select className="border rounded-lg px-3 py-2 text-sm bg-background">
          <option value="all">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="confirmada">Confirmadas</option>
          <option value="completada">Completadas</option>
        </select>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay citas para mostrar</p>
            <p className="text-sm mt-1">Agenda nuevas citas para tus pacientes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
