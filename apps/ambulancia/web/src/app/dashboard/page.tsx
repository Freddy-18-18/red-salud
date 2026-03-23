'use client';

import { Map, Truck, Radio, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";

export default function AmbulanciaOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="h-6 w-6 text-red-600" />
          Centro de Despacho
        </h1>
        <p className="text-sm text-muted-foreground">Vista en tiempo real de unidades y emergencias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Radio className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">En Servicio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Emergencias Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Atendidas Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Mapa en Tiempo Real
            <Badge variant="outline" className="text-xs">En vivo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] " />
            <div className="text-center z-10">
              <Map className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-muted-foreground text-sm font-medium">Mapa de rastreo GPS</p>
              <p className="text-muted-foreground text-xs mt-1">Ubicacion de unidades en tiempo real</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Emergencias Activas</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay emergencias activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Unidades en Servicio</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay unidades en servicio</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
