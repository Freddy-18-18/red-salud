'use client';

import { Users, Plus, UserCheck, Clock, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";

export default function PersonalPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Personal
          </h1>
          <p className="text-sm text-muted-foreground">Gestion de staff y turnos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Personal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Total Personal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Activos Hoy</p>
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
                <p className="text-xs text-muted-foreground">En Turno</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Turnos Programados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Directorio de Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay personal registrado</p>
            <p className="text-sm mt-1">Agrega medicos, enfermeras y personal administrativo</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calendario de Turnos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Vista de calendario semanal de turnos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
