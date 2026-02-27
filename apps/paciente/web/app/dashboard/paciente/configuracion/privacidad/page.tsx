"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Switch } from "@red-salud/design-system";
import { Loader2, Save, Shield, Eye, EyeOff, Users, Database } from "lucide-react";

interface PrivacySettings {
  profile_public: boolean;
  share_medical_history: boolean;
  show_profile_photo: boolean;
  share_location: boolean;
  anonymous_data_research: boolean;
  analytics_cookies: boolean;
}

export default function PrivacidadConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_public: false,
    share_medical_history: false,
    show_profile_photo: true,
    share_location: false,
    anonymous_data_research: true,
    analytics_cookies: true,
  });

  useEffect(() => {
    loadPrivacy();
  }, []);

  const loadPrivacy = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setPrivacy({
          profile_public: data.profile_public ?? false,
          share_medical_history: data.share_medical_history ?? false,
          show_profile_photo: data.show_profile_photo ?? true,
          share_location: data.share_location ?? false,
          anonymous_data_research: data.anonymous_data_research ?? true,
          analytics_cookies: data.analytics_cookies ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading privacy:", error);
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
        .from("privacy_settings")
        .upsert({
          user_id: user.id,
          ...privacy,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;

      setMessage({ type: "success", text: "Configuración de privacidad guardada correctamente" });
    } catch (error) {
      console.error("Error saving privacy:", error);
      setMessage({ type: "error", text: "Error al guardar la configuración de privacidad" });
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Privacidad</h1>
        <p className="text-gray-600 mt-1">Controla quién puede ver tu información</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Perfil Público */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visibilidad del Perfil
          </CardTitle>
          <CardDescription>Configura quién puede ver tu perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Perfil Público</p>
              <p className="text-sm text-gray-500">Permite que otros usuarios vean tu perfil básico</p>
            </div>
            <Switch
              checked={privacy.profile_public}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, profile_public: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mostrar Foto de Perfil</p>
              <p className="text-sm text-gray-500">Tu foto será visible para otros usuarios</p>
            </div>
            <Switch
              checked={privacy.show_profile_photo}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, show_profile_photo: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compartir Información Médica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Compartir Información Médica
          </CardTitle>
          <CardDescription>Configura qué información médica compartes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compartir Historial Médico</p>
              <p className="text-sm text-gray-500">Permite que médicos vean tu historial médico completo</p>
            </div>
            <Switch
              checked={privacy.share_medical_history}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, share_medical_history: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compartir Ubicación</p>
              <p className="text-sm text-gray-500">Permite compartir tu ubicación para encontrar médicos cercanos</p>
            </div>
            <Switch
              checked={privacy.share_location}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, share_location: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datos y Cookies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Datos y Cookies
          </CardTitle>
          <CardDescription>Configura el uso de tus datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Datos Anónimos para Investigación</p>
              <p className="text-sm text-gray-500">Contribuye con datos anónimos para mejorar los servicios de salud</p>
            </div>
            <Switch
              checked={privacy.anonymous_data_research}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, anonymous_data_research: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cookies Analíticas</p>
              <p className="text-sm text-gray-500">Permite el uso de cookies para mejorar la experiencia</p>
            </div>
            <Switch
              checked={privacy.analytics_cookies}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, analytics_cookies: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>Acciones irreversibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-800">Eliminar Cuenta</p>
              <p className="text-sm text-red-600">Eliminar permanentemente tu cuenta y todos tus datos</p>
            </div>
            <Button variant="destructive">Eliminar Cuenta</Button>
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
