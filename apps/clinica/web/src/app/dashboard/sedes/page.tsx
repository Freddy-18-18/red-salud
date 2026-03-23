'use client';

import { MapPin, Plus, Building2, Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";

export default function SedesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Sedes
          </h1>
          <p className="text-sm text-muted-foreground">Gestiona las ubicaciones de tu clinica</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sede
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder cards for locations */}
        <Card className="border-dashed border-2 hover:border-blue-300 transition-colors">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Sede Principal</h3>
                <Badge variant="default" className="mt-1">Principal</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Configura la direccion
                </p>
                <p className="flex items-center justify-center gap-1">
                  <Phone className="h-3 w-3" />
                  Agrega contacto
                </p>
                <p className="flex items-center justify-center gap-1">
                  <Globe className="h-3 w-3" />
                  Define horarios
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Configurar Sede
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 hover:border-gray-300 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center space-y-3 text-muted-foreground">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-medium">Agregar nueva sede</p>
              <p className="text-xs">Expande tu red de atencion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mapa de Sedes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Mapa interactivo de ubicaciones</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
