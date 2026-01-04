"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import type { PrivacySettings } from "@/hooks/paciente/useConfiguracion";

type Props = {
  privacy: PrivacySettings | null;
  setPrivacy: (p: PrivacySettings) => void;
  saving: boolean;
  onSave: () => Promise<void>;
};

export function PrivacyCard({ privacy, setPrivacy, saving, onSave }: Props) {
  const priv =
    privacy ?? {
      profile_public: false,
      share_medical_history: false,
      show_profile_photo: true,
      share_location: false,
      anonymous_data_research: false,
      analytics_cookies: false,
    };

  const toggle = (key: keyof PrivacySettings, value: boolean) => setPrivacy({ ...priv, [key]: value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Privacidad</CardTitle>
        <CardDescription>Controla quién puede ver tu información</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          {
            key: "profile_public" as const,
            title: "Perfil Público",
            desc: "Permite que otros usuarios vean tu perfil básico",
          },
          {
            key: "share_medical_history" as const,
            title: "Compartir Historial Médico",
            desc: "Permite que doctores accedan a tu historial",
          },
          {
            key: "show_profile_photo" as const,
            title: "Mostrar Foto de Perfil",
            desc: "Tu foto será visible en consultas y mensajes",
          },
          {
            key: "share_location" as const,
            title: "Compartir Ubicación",
            desc: "Permite usar tu ubicación para servicios cercanos",
          },
          {
            key: "anonymous_data_research" as const,
            title: "Datos Anónimos para Investigación",
            desc: "Contribuye con datos anónimos para estudios médicos",
          },
          {
            key: "analytics_cookies" as const,
            title: "Cookies de Análisis",
            desc: "Ayúdanos a mejorar la plataforma con datos de uso",
          },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{item.title}</Label>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <Switch checked={!!priv[item.key]} onCheckedChange={(checked) => toggle(item.key, checked)} />
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
              Guardar Privacidad
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
