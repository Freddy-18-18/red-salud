'use client';

import { BookOpen, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function CatalogoPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-orange-600" />
            Catalogo de Examenes
          </h1>
          <p className="text-sm text-muted-foreground">Tipos de examenes y rangos de referencia</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Nuevo Examen</Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar examen por nombre o categoria..." />
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Catalogo vacio</p>
            <p className="text-sm mt-1">Configura los tipos de examenes que ofrece tu laboratorio</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
