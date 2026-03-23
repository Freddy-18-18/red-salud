'use client';

import { Box, Plus, Bed, Stethoscope, Monitor, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";

export default function RecursosPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Box className="h-6 w-6 text-blue-600" />
            Recursos
          </h1>
          <p className="text-sm text-muted-foreground">Equipos, salas y camas</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Recurso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bed className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Camas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Stethoscope className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Consultorios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Monitor className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Quirofanos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Wrench className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">En Mantenimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plano de Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Vista de plano interactivo con recursos</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Box className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay recursos registrados</p>
            <p className="text-sm mt-1">Agrega camas, consultorios, quirofanos y equipos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
