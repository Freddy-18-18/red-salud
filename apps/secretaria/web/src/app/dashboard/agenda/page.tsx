'use client';

import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from "@red-salud/design-system";

export default function AgendaPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-violet-600" />
          Agenda del Doctor
        </h1>
        <p className="text-sm text-muted-foreground">Visualiza y gestiona los horarios disponibles</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Calendario semanal de la agenda</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
