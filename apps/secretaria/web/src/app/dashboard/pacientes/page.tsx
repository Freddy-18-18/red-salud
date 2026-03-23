'use client';

import { Users, Plus, Search } from 'lucide-react';
import { Card, CardContent } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function PacientesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-violet-600" />
            Pacientes
          </h1>
          <p className="text-sm text-muted-foreground">Registro e informacion de pacientes</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Registrar Paciente</Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar paciente por nombre, email o cedula..." />
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay pacientes registrados</p>
            <p className="text-sm mt-1">Los pacientes apareceran aqui cuando se registren</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
