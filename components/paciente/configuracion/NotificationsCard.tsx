"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import type { NotificationSettings } from "@/hooks/paciente/useConfiguracion";

type Props = {
  notifications: NotificationSettings | null;
  setNotifications: (n: NotificationSettings) => void;
  saving: boolean;
  onSave: () => Promise<void>;
};

export function NotificationsCard({ notifications, setNotifications, saving, onSave }: Props) {
  const notifs =
    notifications ?? {
      login_alerts: false,
      account_changes: false,
      appointment_reminders: true,
      lab_results: true,
      doctor_messages: true,
    };

  const toggle = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications({ ...notifs, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Notificaciones</CardTitle>
        <CardDescription>Elige qué notificaciones deseas recibir</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          {
            key: "login_alerts" as const,
            title: "Alertas de Inicio de Sesión",
            desc: "Notificación cuando alguien accede a tu cuenta",
          },
          {
            key: "account_changes" as const,
            title: "Cambios en la Cuenta",
            desc: "Notificación de cambios importantes en tu cuenta",
          },
          {
            key: "appointment_reminders" as const,
            title: "Recordatorios de Citas",
            desc: "Recordatorios antes de tus citas médicas",
          },
          {
            key: "lab_results" as const,
            title: "Resultados de Laboratorio",
            desc: "Notificación cuando tus resultados estén listos",
          },
          {
            key: "doctor_messages" as const,
            title: "Mensajes de Doctores",
            desc: "Notificación de nuevos mensajes de tus doctores",
          },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{item.title}</Label>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <Switch checked={!!notifs[item.key]} onCheckedChange={(checked) => toggle(item.key, checked)} />
          </div>
        ))}

        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Notificaciones
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
