"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
  Button,
} from "@red-salud/design-system";
import { Loader2, Save, Mail, Smartphone } from "lucide-react";

import type { NotificationSettings } from "@/hooks/paciente/useSettings";

interface TabNotificationsProps {
  notifications: NotificationSettings;
  setNotifications: (notifications: NotificationSettings) => void;
  saving: boolean;
  onSave: () => void;
}

interface NotifRowProps {
  label: string;
  description: string;
  emailChecked: boolean;
  pushChecked: boolean;
  onEmailChange: (checked: boolean) => void;
  onPushChange: (checked: boolean) => void;
  showEmail?: boolean;
  showPush?: boolean;
}

function NotifRow({
  label,
  description,
  emailChecked,
  pushChecked,
  onEmailChange,
  onPushChange,
  showEmail = true,
  showPush = true,
}: NotifRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-[hsl(var(--border))] last:border-0">
      <div className="space-y-0.5 flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        {showEmail && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Switch checked={emailChecked} onCheckedChange={onEmailChange} />
          </div>
        )}
        {showPush && (
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Switch checked={pushChecked} onCheckedChange={onPushChange} />
          </div>
        )}
      </div>
    </div>
  );
}

export function TabNotifications({
  notifications,
  setNotifications,
  saving,
  onSave,
}: TabNotificationsProps) {
  const update = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications({ ...notifications, [field]: value });
  };

  const emailFields: (keyof NotificationSettings)[] = [
    "citas_email",
    "mensajes_doctores_email",
    "resultados_lab_email",
    "novedades_email",
  ];

  const pushFields: (keyof NotificationSettings)[] = [
    "citas_push",
    "mensajes_doctores_push",
    "resultados_lab_push",
    "recordatorios_medicamentos_push",
  ];

  const allEmailChecked = emailFields.every((f) => notifications[f]);
  const allPushChecked = pushFields.every((f) => notifications[f]);

  const toggleAllEmail = (checked: boolean) => {
    const updated = { ...notifications };
    for (const field of emailFields) {
      updated[field] = checked;
    }
    setNotifications(updated);
  };

  const toggleAllPush = (checked: boolean) => {
    const updated = { ...notifications };
    for (const field of pushFields) {
      updated[field] = checked;
    }
    setNotifications(updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de notificaciones</CardTitle>
          <CardDescription>
            Configura como y cuando quieres recibir notificaciones
          </CardDescription>
          {/* Column headers with select-all toggles */}
          <div className="flex justify-end gap-4 mt-3 pt-3 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Email</span>
              <Switch
                checked={allEmailChecked}
                onCheckedChange={toggleAllEmail}
                aria-label="Seleccionar todo email"
              />
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Push</span>
              <Switch
                checked={allPushChecked}
                onCheckedChange={toggleAllPush}
                aria-label="Seleccionar todo push"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          <NotifRow
            label="Recordatorios de citas"
            description="Avisos antes de tus citas medicas programadas"
            emailChecked={notifications.citas_email}
            pushChecked={notifications.citas_push}
            onEmailChange={(v) => update("citas_email", v)}
            onPushChange={(v) => update("citas_push", v)}
          />

          <NotifRow
            label="Mensajes de doctores"
            description="Nuevos mensajes de tus doctores"
            emailChecked={notifications.mensajes_doctores_email}
            pushChecked={notifications.mensajes_doctores_push}
            onEmailChange={(v) => update("mensajes_doctores_email", v)}
            onPushChange={(v) => update("mensajes_doctores_push", v)}
          />

          <NotifRow
            label="Resultados de laboratorio"
            description="Notificacion cuando tus resultados esten listos"
            emailChecked={notifications.resultados_lab_email}
            pushChecked={notifications.resultados_lab_push}
            onEmailChange={(v) => update("resultados_lab_email", v)}
            onPushChange={(v) => update("resultados_lab_push", v)}
          />

          <NotifRow
            label="Recordatorios de medicamentos"
            description="Alertas para tomar tus medicamentos a tiempo"
            emailChecked={false}
            pushChecked={notifications.recordatorios_medicamentos_push}
            onEmailChange={() => {}}
            onPushChange={(v) => update("recordatorios_medicamentos_push", v)}
            showEmail={false}
          />

          <NotifRow
            label="Novedades de Red Salud"
            description="Nuevas funcionalidades, consejos de salud y actualizaciones"
            emailChecked={notifications.novedades_email}
            pushChecked={false}
            onEmailChange={(v) => update("novedades_email", v)}
            onPushChange={() => {}}
            showPush={false}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
