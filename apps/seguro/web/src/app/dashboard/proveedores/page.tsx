'use client';

import { Network, Plus, Search, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function ProveedoresPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-indigo-600" />
            Red de Proveedores
          </h1>
          <p className="text-sm text-muted-foreground">Clinicas, laboratorios y profesionales afiliados</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Agregar Proveedor</Button>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar proveedor por nombre, especialidad, ubicacion..." />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Mapa de Red</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Mapa interactivo de proveedores afiliados</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay proveedores registrados</p>
            <p className="text-sm mt-1">Agrega clinicas, laboratorios y profesionales a tu red</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
