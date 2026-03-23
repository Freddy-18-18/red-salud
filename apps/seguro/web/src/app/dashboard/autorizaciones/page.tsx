'use client';

import { ClipboardCheck, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function AutorizacionesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-indigo-600" />
          Pre-Autorizaciones
        </h1>
        <p className="text-sm text-muted-foreground">Aprobacion previa de procedimientos</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div><p className="text-xl font-bold">0</p><p className="text-xs text-muted-foreground">Pendientes</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div><p className="text-xl font-bold">0</p><p className="text-xs text-muted-foreground">Aprobadas</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <div><p className="text-xl font-bold">0</p><p className="text-xs text-muted-foreground">Denegadas</p></div>
          </CardContent>
        </Card>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar autorizacion..." />
      </div>
      <Card>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No hay solicitudes de autorizacion</p>
            <p className="text-sm mt-1">Las pre-autorizaciones apareceran aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
