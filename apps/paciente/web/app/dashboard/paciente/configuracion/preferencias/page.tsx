"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Switch } from "@red-salud/design-system";
import { Loader2, Save, Globe, Moon, Bell, Mail, Sun } from "lucide-react";

interface UserPreferences {
  language: string;
  timezone: string;
  dark_mode: boolean;
  desktop_notifications: boolean;
  sound_notifications: boolean;
  preferred_contact_method: string;
  newsletter_subscribed: boolean;
  promotions_subscribed: boolean;
  surveys_subscribed: boolean;
}

const LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "pt", name: "Português" },
];

const TIMEZONES = [
  { value: "America/Bogota", label: "Colombia (GMT-5)" },
  { value: "America/Lima", label: "Perú (GMT-5)" },
  { value: "America/Mexico_City", label: "México (GMT-6)" },
  { value: "America/New_York", label: "Nueva York (GMT-5)" },
  { value: "Europe/Madrid", label: "España (GMT+1)" },
];

export default function PreferenciasConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "es",
    timezone: "America/Bogota",
    dark_mode: false,
    desktop_notifications: true,
    sound_notifications: true,
    preferred_contact_method: "email",
    newsletter_subscribed: true,
    promotions_subscribed: true,
    surveys_subscribed: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setPreferences({
          language: data.language || "es",
          timezone: data.timezone || "America/Bogota",
          dark_mode: data.dark_mode || false,
          desktop_notifications: data.desktop_notifications ?? true,
          sound_notifications: data.sound_notifications ?? true,
          preferred_contact_method: data.preferred_contact_method || "email",
          newsletter_subscribed: data.newsletter_subscribed ?? true,
          promotions_subscribed: data.promotions_subscribed ?? true,
          surveys_subscribed: data.surveys_subscribed ?? false,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;

      setMessage({ type: "success", text: "Preferencias guardadas correctamente" });
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage({ type: "error", text: "Error al guardar las preferencias" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Preferencias</h1>
        <p className="text-gray-600 mt-1">Personaliza tu experiencia en Red-Salud</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Idioma y Zona Horaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Idioma y Ubicación
          </CardTitle>
          <CardDescription>Configura tu idioma y zona horaria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Idioma</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Zona Horaria</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apariencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Apariencia
          </CardTitle>
          <CardDescription>Personaliza cómo se ve la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo Oscuro</p>
              <p className="text-sm text-gray-500">Usa tema oscuro para la aplicación</p>
            </div>
            <Switch
              checked={preferences.dark_mode}
              onCheckedChange={(checked) => setPreferences({ ...preferences, dark_mode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura cómo recibes notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificaciones de Escritorio</p>
              <p className="text-sm text-gray-500">Recibe notificaciones en tu navegador</p>
            </div>
            <Switch
              checked={preferences.desktop_notifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, desktop_notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sonido de Notificaciones</p>
              <p className="text-sm text-gray-500">Reproducir sonido al recibir notificaciones</p>
            </div>
            <Switch
              checked={preferences.sound_notifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, sound_notifications: checked })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Método de Contacto Preferido</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={preferences.preferred_contact_method}
              onChange={(e) => setPreferences({ ...preferences, preferred_contact_method: e.target.value })}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Suscripciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Suscripciones
          </CardTitle>
          <CardDescription>Elige qué correos recibir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Newsletter</p>
              <p className="text-sm text-gray-500">Recibe noticias y actualizaciones de Red-Salud</p>
            </div>
            <Switch
              checked={preferences.newsletter_subscribed}
              onCheckedChange={(checked) => setPreferences({ ...preferences, newsletter_subscribed: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Promociones</p>
              <p className="text-sm text-gray-500">Recibe ofertas y promociones especiales</p>
            </div>
            <Switch
              checked={preferences.promotions_subscribed}
              onCheckedChange={(checked) => setPreferences({ ...preferences, promotions_subscribed: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Encuestas</p>
              <p className="text-sm text-gray-500">Participa en encuestas para mejorar el servicio</p>
            </div>
            <Switch
              checked={preferences.surveys_subscribed}
              onCheckedChange={(checked) => setPreferences({ ...preferences, surveys_subscribed: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
