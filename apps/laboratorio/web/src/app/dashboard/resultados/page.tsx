'use client';

import { FileCheck, Search } from 'lucide-react';
import { Card, CardContent } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function ResultadosPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-orange-600" />
          Ingreso de Resultados
        </h1>
        <p className="text-sm text-muted-foreground">Captura y validacion de resultados</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar orden para ingresar resultados..." />
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Selecciona una orden</p>
            <p className="text-sm mt-1">Busca una orden de laboratorio para ingresar resultados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
