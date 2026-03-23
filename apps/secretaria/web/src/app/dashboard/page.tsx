'use client';

import { CalendarDays, Users, Clock, CheckCircle2, XCircle, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function SecretariaOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agenda de Hoy</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 rounded-lg">
                <CalendarDays className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Citas Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Confirmadas</p>
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
                <p className="text-xs text-muted-foreground">En Espera</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Proximas Citas</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay citas programadas para hoy</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Acciones Rapidas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-violet-500" />
                Nueva Cita
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Registrar Paciente
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                Llamar para Confirmar
              </button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Mensajes Sin Leer</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">No hay mensajes nuevos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
