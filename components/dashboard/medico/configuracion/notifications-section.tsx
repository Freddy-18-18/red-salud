"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Users,
  Save,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface NotificationSettings {
  email_nuevas_citas: boolean;
  email_cancelaciones: boolean;
  email_recordatorios: boolean;
  email_mensajes: boolean;
  push_nuevas_citas: boolean;
  push_recordatorios: boolean;
  push_mensajes: boolean;
  recordatorio_24h: boolean;
  recordatorio_1h: boolean;
}

export function NotificationsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_nuevas_citas: true,
    email_cancelaciones: true,
    email_recordatorios: true,
    email_mensajes: true,
    push_nuevas_citas: true,
    push_recordatorios: true,
    push_mensajes: true,
    recordatorio_24h: true,
    recordatorio_1h: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notification_settings")
        .upsert({
          user_id: user.id,
          settings: settings,
        });

      if (error) throw error;

      alert("Preferencias guardadas correctamente");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar preferencias");
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Notificaciones por Email</h3>
            <p className="text-sm text-gray-600">
              Recibe actualizaciones importantes en tu correo
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="font-medium">Nuevas Citas</Label>
              <p className="text-sm text-gray-600">
                Cuando un paciente agenda una cita
              </p>
            </div>
            <Switch
              checked={settings.email_nuevas_citas}
              onCheckedChange={() => toggleSetting("email_nuevas_citas")}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="font-medium">Cancelaciones</Label>
              <p className="text-sm text-gray-600">
                Cuando se cancela una cita
              </p>
            </div>
            <Switch
              checked={settings.email_cancelaciones}
              onCheckedChange={() => toggleSetting("email_cancelaciones")}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="font-medium">Recordatorios</Label>
              <p className="text-sm text-gray-600">
                Recordatorios de citas próximas
              </p>
            </div>
            <Switch
              checked={settings.email_recordatorios}
              onCheckedChange={() => toggleSetting("email_recordatorios")}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="font-medium">Mensajes de Pacientes</Label>
              <p className="text-sm text-gray-600">
                Cuando recibes un mensaje nuevo
              </p>
            </div>
            <Switch
              checked={settings.email_mensajes}
              onCheckedChange={() => toggleSetting("email_mensajes")}
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bell className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notificaciones Push</h3>
              <Badge variant="secondary">Próximamente</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Recibe notificaciones en tiempo real
            </p>
          </div>
        </div>

        <div className="space-y-4 opacity-50">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="font-medium">Nuevas Citas</Label>
              <p className="text-sm text-gray-600">
                Notificación instantánea de nuevas citas
              </p>
            </div>
            <Switch
              checked={settings.push_nuevas_citas}
              onCheckedChange={() => toggleSetting("push_nuevas_citas")}
              disabled
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="font-medium">Recordatorios</Label>
              <p className="text-sm text-gray-600">
                Alertas de citas próximas
              </p>
            </div>
            <Switch
              checked={settings.push_recordatorios}
              onCheckedChange={() => toggleSetting("push_recordatorios")}
              disabled
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="font-medium">Mensajes</Label>
              <p className="text-sm text-gray-600">
                Notificación de mensajes nuevos
              </p>
            </div>
            <Switch
              checked={settings.push_mensajes}
              onCheckedChange={() => toggleSetting("push_mensajes")}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Recordatorios de Citas</h3>
            <p className="text-sm text-gray-600">
              Configura cuándo recibir recordatorios
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label className="font-medium">24 horas antes</Label>
              <p className="text-sm text-gray-600">
                Recordatorio un día antes de la cita
              </p>
            </div>
            <Switch
              checked={settings.recordatorio_24h}
              onCheckedChange={() => toggleSetting("recordatorio_24h")}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="font-medium">1 hora antes</Label>
              <p className="text-sm text-gray-600">
                Recordatorio una hora antes de la cita
              </p>
            </div>
            <Switch
              checked={settings.recordatorio_1h}
              onCheckedChange={() => toggleSetting("recordatorio_1h")}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving}>
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
      </div>
    </div>
  );
}
