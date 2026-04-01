'use client';

import {
  MessageSquare,
  Mail,
  Bell,
  Smartphone,
  Send,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@red-salud/design-system';

export default function ComunicacionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Comunicaciones</h1>
          <p className="text-muted-foreground">
            Centro de comunicacion con pacientes y personal
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-20">
            <div className="text-center max-w-lg mx-auto">
              {/* Icon cluster */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30">
                  <MessageSquare className="h-7 w-7 text-blue-600" />
                </div>
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950/30">
                  <Mail className="h-7 w-7 text-green-600" />
                </div>
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/30">
                  <Bell className="h-7 w-7 text-purple-600" />
                </div>
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-950/30">
                  <Smartphone className="h-7 w-7 text-orange-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">Modulo en Desarrollo</h2>
              <p className="text-muted-foreground mb-6">
                Estamos trabajando en herramientas de comunicacion avanzadas para
                tu farmacia.
              </p>

              {/* Upcoming features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Send className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">SMS Automatizados</p>
                    <p className="text-xs text-muted-foreground">
                      Recordatorios de medicamentos y recetas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Mail className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Emails Automatizados</p>
                    <p className="text-xs text-muted-foreground">
                      Promociones y alertas de vencimiento
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Users className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Chat con Pacientes</p>
                    <p className="text-xs text-muted-foreground">
                      Mensajeria directa integrada
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <Bell className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Notificaciones Push</p>
                    <p className="text-xs text-muted-foreground">
                      Avisos en tiempo real
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
