"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import type { UserPreferences } from "@/hooks/paciente/useConfiguracion";

type Props = {
  preferences: UserPreferences | null;
  setPreferences: (p: UserPreferences) => void;
  saving: boolean;
  onSave: () => Promise<void>;
};

export function PreferencesCard({ preferences, setPreferences, saving, onSave }: Props) {
  const pref = preferences ?? {
    language: "es",
    timezone: "America/Caracas",
    dark_mode: false,
    desktop_notifications: false,
    sound_notifications: false,
    preferred_contact_method: "email",
    newsletter_subscribed: false,
    promotions_subscribed: false,
    surveys_subscribed: false,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias de la Aplicación</CardTitle>
        <CardDescription>Personaliza tu experiencia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo Oscuro</Label>
              <p className="text-sm text-gray-500">Activa el tema oscuro de la aplicación</p>
            </div>
            <Switch checked={!!pref.dark_mode} onCheckedChange={(checked) => setPreferences({ ...pref, dark_mode: checked })} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones de Escritorio</Label>
              <p className="text-sm text-gray-500">Recibe notificaciones en tu navegador</p>
            </div>
            <Switch checked={!!pref.desktop_notifications} onCheckedChange={(checked) => setPreferences({ ...pref, desktop_notifications: checked })} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sonidos de Notificación</Label>
              <p className="text-sm text-gray-500">Reproduce sonidos para alertas</p>
            </div>
            <Switch checked={!!pref.sound_notifications} onCheckedChange={(checked) => setPreferences({ ...pref, sound_notifications: checked })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select value={pref.language} onValueChange={(value) => setPreferences({ ...pref, language: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Select value={pref.timezone} onValueChange={(value) => setPreferences({ ...pref, timezone: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Caracas">Caracas (GMT-4)</SelectItem>
              <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
              <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
              <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
              <SelectItem value="America/Lima">Lima (GMT-5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_method">Método de Contacto Preferido</Label>
          <Select value={pref.preferred_contact_method} onValueChange={(value) => setPreferences({ ...pref, preferred_contact_method: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Suscripciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Boletín Informativo</Label>
                <p className="text-sm text-gray-500">Recibe noticias y consejos de salud</p>
              </div>
              <Switch checked={!!pref.newsletter_subscribed} onCheckedChange={(checked) => setPreferences({ ...pref, newsletter_subscribed: checked })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Promociones</Label>
                <p className="text-sm text-gray-500">Ofertas especiales y descuentos</p>
              </div>
              <Switch checked={!!pref.promotions_subscribed} onCheckedChange={(checked) => setPreferences({ ...pref, promotions_subscribed: checked })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Encuestas</Label>
                <p className="text-sm text-gray-500">Ayúdanos a mejorar con tu opinión</p>
              </div>
              <Switch checked={!!pref.surveys_subscribed} onCheckedChange={(checked) => setPreferences({ ...pref, surveys_subscribed: checked })} />
            </div>
          </div>
        </div>

        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Preferencias
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
