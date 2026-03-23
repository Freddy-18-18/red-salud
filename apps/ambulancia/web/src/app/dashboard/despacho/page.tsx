'use client';

import { Radio, Plus, Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";

export default function DespachoPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-600" />
            Despacho de Emergencias
          </h1>
          <p className="text-sm text-muted-foreground">Asignar y gestionar llamadas de emergencia</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Phone className="h-4 w-4 mr-2" />
          Nueva Emergencia
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Cola de Emergencias</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Radio className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No hay emergencias en cola</p>
                <p className="text-sm mt-1">Las llamadas entrantes apareceran aqui</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Unidades Disponibles</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No hay unidades disponibles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Hospitales Cercanos</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Configura hospitales de destino</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
