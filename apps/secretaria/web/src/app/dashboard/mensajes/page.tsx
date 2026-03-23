'use client';

import { MessageSquare, Search } from 'lucide-react';
import { Card, CardContent } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";

export default function MensajesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-violet-600" />
          Mensajes
        </h1>
        <p className="text-sm text-muted-foreground">Comunicacion con pacientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar conversacion..." />
          </div>
          <Card className="flex-1">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center py-8">No hay conversaciones</p>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Selecciona una conversacion</p>
                <p className="text-sm mt-1">Elige un paciente de la lista para ver sus mensajes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
