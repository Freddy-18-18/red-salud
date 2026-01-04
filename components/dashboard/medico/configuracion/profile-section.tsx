/**
 * @file profile-section.tsx
 * @description Sección de Perfil Básico en la configuración del médico.
 * Permite editar datos personales, foto, teléfono y especialidades.
 * Nombre y cédula son de solo lectura tras verificación SACS.
 * @module Dashboard/Medico/Configuracion
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Loader2,
  Lock,
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { SpecialtyCombobox } from "@/components/ui/specialty-combobox";
import { SpecialtyMultiSelect } from "@/components/ui/specialty-multi-select";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Datos del perfil del médico
 */
interface ProfileData {
  /** Nombre completo (solo lectura tras verificación) */
  nombre_completo: string;
  /** Correo electrónico (solo lectura) */
  email: string;
  /** Teléfono con formato +58 XXX XXX XXXX */
  telefono: string;
  /** Cédula (solo lectura, ID del médico) */
  cedula: string;
  /** Especialidad principal verificada */
  especialidad: string;
  /** Especialidades adicionales del SACS */
  especialidades_adicionales: string[];
  /** Biografía profesional */
  biografia: string;
  /** URL del avatar */
  avatar_url: string | null;
  /** Si el perfil está verificado en SACS */
  is_verified: boolean;
  /** Especialidades permitidas desde SACS */
  especialidades_permitidas: string[];
}

/**
 * Props del componente ProfileSection
 */
interface ProfileSectionProps {
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Sección de Perfil Básico para la configuración del médico
 */
export function ProfileSection({ className }: ProfileSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improvingBio, setImprovingBio] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    nombre_completo: "",
    email: "",
    telefono: "+58 ",
    cedula: "",
    especialidad: "",
    especialidades_adicionales: [],
    biografia: "",
    avatar_url: null,
    is_verified: false,
    especialidades_permitidas: [],
  });
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  /**
   * Carga el perfil del médico desde Supabase
   */
  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar perfil básico
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Cargar detalles del médico
      const { data: doctorData } = await supabase
        .from("doctor_details")
        .select(`
          *,
          especialidad:specialties(id, name)
        `)
        .eq("profile_id", user.id)
        .single();

      // Obtener especialidades permitidas (del SACS o todas si no hay restricción)
      let especialidadesPermitidas: string[] = [];

      // Intentar obtener del sacs_data si existe
      if (doctorData?.sacs_data?.especialidades) {
        especialidadesPermitidas = doctorData.sacs_data.especialidades;
      } else {
        // Si no hay datos SACS, cargar todas las especialidades disponibles
        const { data: allSpecialties } = await supabase
          .from("specialties")
          .select("name")
          .order("name");

        especialidadesPermitidas = allSpecialties?.map(s => s.name) || [];
      }

      setProfile({
        nombre_completo: profileData?.nombre_completo || "",
        email: user.email || "",
        telefono: profileData?.telefono || "+58 ",
        cedula: profileData?.cedula || "",
        especialidad: doctorData?.especialidad?.name || "",
        especialidades_adicionales: doctorData?.subespecialidades || [],
        biografia: doctorData?.biografia || "",
        avatar_url: profileData?.avatar_url || null,
        is_verified: doctorData?.verified || false,
        especialidades_permitidas: especialidadesPermitidas,
      });
    } catch (error) {
      console.error("[ProfileSection] Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Guarda los cambios del perfil
   */
  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      // Actualizar perfil básico (sin nombre ni cédula si está verificado)
      const profileUpdate: Record<string, any> = {
        telefono: profile.telefono,
      };

      // Solo actualizar nombre si NO está verificado
      if (!profile.is_verified) {
        profileUpdate.nombre_completo = profile.nombre_completo;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Actualizar detalles del médico
      const { error: doctorError } = await supabase
        .from("doctor_details")
        .update({
          biografia: profile.biografia,
          subespecialidades: profile.especialidades_adicionales,
        })
        .eq("profile_id", user.id);

      if (doctorError) throw doctorError;

      setSaveMessage({ type: "success", text: "Perfil guardado correctamente" });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      console.error("[ProfileSection] Error saving profile:", error);
      setSaveMessage({ type: "error", text: error.message || "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Mejora la biografía usando IA
   */
  const handleImproveBio = async () => {
    if (!profile.biografia.trim() || profile.biografia.length < 20) {
      setSaveMessage({ type: "error", text: "Escribe al menos 20 caracteres para mejorar" });
      return;
    }

    setImprovingBio(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/ai/improve-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          biografia: profile.biografia,
          nombre: profile.nombre_completo,
          especialidad: profile.especialidad,
        }),
      });

      if (!response.ok) throw new Error("Error al mejorar la biografía");

      const data = await response.json();

      if (data.improved_bio) {
        setProfile({ ...profile, biografia: data.improved_bio });
        setSaveMessage({ type: "success", text: "Biografía mejorada. No olvides guardar los cambios." });
      }
    } catch (error) {
      console.error("[ProfileSection] Error improving bio:", error);
      setSaveMessage({ type: "error", text: "Error al mejorar la biografía" });
    } finally {
      setImprovingBio(false);
    }
  };

  /**
   * Actualiza la URL del avatar
   */
  const handleAvatarUpload = (url: string) => {
    setProfile({ ...profile, avatar_url: url });
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header con Avatar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b dark:border-gray-700">
        <AvatarUpload
          currentUrl={profile.avatar_url}
          onUpload={handleAvatarUpload}
          userName={profile.nombre_completo}
          size="xl"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {profile.nombre_completo || "Completa tu perfil"}
            </h3>
            {profile.is_verified && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{profile.especialidad}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Cédula: {profile.cedula || "No registrada"}
          </p>
        </div>
      </div>

      {/* Aviso de campos bloqueados */}
      {profile.is_verified && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-300">
              Perfil verificado por SACS
            </p>
            <p className="text-blue-600 dark:text-blue-400 mt-0.5">
              El nombre y la cédula están vinculados a tu verificación profesional y no pueden modificarse.
            </p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre Completo */}
        <div className="space-y-2">
          <Label htmlFor="nombre" className="flex items-center gap-2">
            Nombre Completo
            {profile.is_verified && <Lock className="h-3 w-3 text-gray-400" />}
          </Label>
          <Input
            id="nombre"
            value={profile.nombre_completo}
            onChange={(e) => setProfile({ ...profile, nombre_completo: e.target.value })}
            placeholder="Dr. Juan Pérez"
            disabled={profile.is_verified}
            className={cn(profile.is_verified && "bg-gray-50 dark:bg-gray-800 cursor-not-allowed")}
          />
        </div>

        {/* Correo Electrónico */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            Correo Electrónico
            <Lock className="h-3 w-3 text-gray-400" />
          </Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <PhoneInput
            value={profile.telefono}
            onChange={(value) => setProfile({ ...profile, telefono: value })}
          />
        </div>

        {/* Cédula */}
        <div className="space-y-2">
          <Label htmlFor="cedula" className="flex items-center gap-2">
            Cédula (ID)
            <Lock className="h-3 w-3 text-gray-400" />
          </Label>
          <Input
            id="cedula"
            value={profile.cedula}
            disabled
            className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed font-mono"
          />
        </div>

        {/* Especialidad Principal */}
        <div className="space-y-2">
          <Label htmlFor="especialidad" className="flex items-center gap-2">
            Especialidad Principal
            {profile.is_verified && <Lock className="h-3 w-3 text-gray-400" />}
          </Label>
          <SpecialtyCombobox
            id="especialidad"
            value={profile.especialidad}
            onChange={(value) => setProfile({ ...profile, especialidad: value })}
            allowedSpecialties={profile.especialidades_permitidas}
            readOnly={profile.is_verified}
            placeholder="Seleccionar especialidad"
          />
        </div>
      </div>

      {/* Especialidades Adicionales */}
      <div className="space-y-3">
        <Label>Especialidades Adicionales</Label>
        <SpecialtyMultiSelect
          selected={profile.especialidades_adicionales}
          onChange={(newValues) => setProfile({ ...profile, especialidades_adicionales: newValues })}
          exclude={[profile.especialidad]}
          placeholder="Buscar especialidades adicionales"
        />
        <p className="text-xs text-muted-foreground">
          Agrega otras especialidades o subespecialidades que practiques.
        </p>
      </div>

      {/* Biografía Profesional */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="biografia">Biografía Profesional</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImproveBio}
            disabled={improvingBio || profile.biografia.length < 20}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
          >
            {improvingBio ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Mejorando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Mejorar con IA
              </>
            )}
          </Button>
        </div>
        <Textarea
          id="biografia"
          value={profile.biografia}
          onChange={(e) => setProfile({ ...profile, biografia: e.target.value })}
          placeholder="Cuéntanos sobre tu experiencia y formación profesional. La IA puede ayudarte a mejorar la gramática y estructura..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Esta información será visible para tus pacientes. Mínimo 20 caracteres para usar la mejora con IA.
        </p>
      </div>

      {/* Mensaje de estado */}
      {saveMessage && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg text-sm",
          saveMessage.type === "success"
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        )}>
          {saveMessage.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {saveMessage.text}
        </div>
      )}

      {/* Botón Guardar */}
      <div className="flex justify-end pt-4 border-t dark:border-gray-700">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
