'use client';

import { Settings, Bell, User, Shield } from 'lucide-react';
import { Card, CardContent } from "@red-salud/design-system";

export default function ConfiguracionPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-violet-600" />
          Configuracion
        </h1>
        <p className="text-sm text-muted-foreground">Ajustes de tu cuenta de secretaria</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-50 rounded-lg">
                <User className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold">Perfil</h3>
                <p className="text-sm text-muted-foreground mt-1">Datos personales y foto</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Notificaciones</h3>
                <p className="text-sm text-muted-foreground mt-1">Alertas de citas y mensajes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Mis Permisos</h3>
                <p className="text-sm text-muted-foreground mt-1">Ver permisos asignados por el doctor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
