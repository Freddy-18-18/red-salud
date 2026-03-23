'use client';

import { Settings, Building2, Users, Bell, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

export default function ConfiguracionPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          Configuracion
        </h1>
        <p className="text-sm text-muted-foreground">Ajustes de la clinica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Datos de la Clinica</h3>
                <p className="text-sm text-muted-foreground mt-1">Nombre, logo, informacion de contacto</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-50 rounded-lg">
                <Users className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold">Roles y Permisos</h3>
                <p className="text-sm text-muted-foreground mt-1">Gestion de accesos del personal</p>
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
                <p className="text-sm text-muted-foreground mt-1">Alertas y recordatorios automaticos</p>
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
                <h3 className="font-semibold">Seguridad</h3>
                <p className="text-sm text-muted-foreground mt-1">Politicas de acceso y auditoria</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold">Integraciones</h3>
                <p className="text-sm text-muted-foreground mt-1">Conexiones con sistemas externos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
