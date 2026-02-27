"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Switch } from "@red-salud/design-system";
import { Loader2, Save, Bell, Shield, Mail, MessageSquare, Calendar, FileText } from "lucide-react";

interface NotificationSettings {
  login_alerts: boolean;
  account_changes: boolean;
  appointment_reminders: boolean;
  lab_results: boolean;
  doctor_messages: boolean;
}

export default function NotificacionesConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    login_alerts: true,
    account_changes: true,
    appointment_reminders: true,
    lab_results: true,
    doctor_messages: true,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setNotifications({
          login_alerts: data.login_alerts ?? true,
          account_changes: data.account_changes ?? true,
          appointment_reminders: data.appointment_reminders ?? true,
          lab_results: data.lab_results ?? true,
          doctor_messages: data.doctor_messages ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
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
        .from("notification_settings")
        .upsert({
          user_id: user.id,
          ...notifications,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;

      setMessage({ type: "success", text: "Notificaciones guardadas correctamente" });
    } catch (error) {
      console.error("Error saving notifications:", error);
      setMessage({ type: "error", text: "Error al guardar las notificaciones" });
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Notificaciones</h1>
        <p className="text-gray-600 mt-1">Controla qué notificaciones recibes</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Notificaciones de Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cuenta y Seguridad
          </CardTitle>
          <CardDescription>Notificaciones relacionadas con tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Inicio de Sesión</p>
              <p className="text-sm text-gray-500">Notifica cuando alguien inicie sesión en tu cuenta</p>
            </div>
            <Switch
              checked={notifications.login_alerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, login_alerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cambios en la Cuenta</p>
              <p className="text-sm text-gray-500">Notifica cambios en tu perfil o configuración</p>
            </div>
            <Switch
              checked={notifications.account_changes}
              onCheckedChange={(checked) => setNotifications({ ...notifications, account_changes: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones de Citas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Citas Médicas
          </CardTitle>
          <CardDescription>Notificaciones sobre tus citas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Recordatorios de Citas</p>
              <p className="text-sm text-gray-500">Recibe recordatorios antes de tus citas programadas</p>
            </div>
            <Switch
              checked={notifications.appointment_reminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, appointment_reminders: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resultados Médicos
          </CardTitle>
          <CardDescription>Notificaciones sobre resultados de laboratorios y estudios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Resultados de Laboratorio</p>
              <p className="text-sm text-gray-500">Notifica cuando tus resultados estén disponibles</p>
            </div>
            <Switch
              checked={notifications.lab_results}
              onCheckedChange={(checked) => setNotifications({ ...notifications, lab_results: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mensajes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensajes
          </CardTitle>
          <CardDescription>Notificaciones de mensajes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mensajes de Médicos</p>
              <p className="text-sm text-gray-500">Notifica cuando recibas mensajes de profesionales de salud</p>
            </div>
            <Switch
              checked={notifications.doctor_messages}
              onCheckedChange={(checked) => setNotifications({ ...notifications, doctor_messages: checked })}
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
