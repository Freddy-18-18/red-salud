"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Button, Textarea } from "@red-salud/design-system";
import { Loader2, Save, Heart, AlertTriangle, UserCog, Phone, Activity, Pill } from "lucide-react";

interface PatientDetails {
  grupo_sanguineo?: string;
  alergias?: string[];
  peso_kg?: number;
  altura_cm?: number;
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string;
  cirugias_previas?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "No sé"];

export default function MedicoConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [details, setDetails] = useState<PatientDetails>({});

  useEffect(() => {
    loadPatientDetails();
  }, []);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("patient_medical_info")
        .select("*")
        .eq("patient_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setDetails({
          grupo_sanguineo: data.grupo_sanguineo || "",
          alergias: data.alergias || [],
          peso_kg: data.peso_kg || undefined,
          altura_cm: data.altura_cm || undefined,
          enfermedades_cronicas: data.enfermedades_cronicas || [],
          medicamentos_actuales: data.medicamentos_actuales || "",
          cirugias_previas: data.cirugias_previas || "",
          contacto_emergencia_nombre: data.contacto_emergencia_nombre || "",
          contacto_emergencia_telefono: data.contacto_emergencia_telefono || "",
          contacto_emergencia_relacion: data.contacto_emergencia_relacion || "",
        });
      }
    } catch (error) {
      console.error("Error loading medical info:", error);
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
        .from("patient_medical_info")
        .upsert({
          patient_id: user.id,
          grupo_sanguineo: details.grupo_sanguineo,
          alergias: details.alergias || [],
          peso_kg: details.peso_kg,
          altura_cm: details.altura_cm,
          enfermedades_cronicas: details.enfermedades_cronicas || [],
          medicamentos_actuales: details.medicamentos_actuales,
          cirugias_previas: details.cirugias_previas,
          contacto_emergencia_nombre: details.contacto_emergencia_nombre,
          contacto_emergencia_telefono: details.contacto_emergencia_telefono,
          contacto_emergencia_relacion: details.contacto_emergencia_relacion,
          updated_at: new Date().toISOString(),
        }, { onConflict: "patient_id" });

      if (error) throw error;

      setMessage({ type: "success", text: "Información médica guardada correctamente" });
    } catch (error) {
      console.error("Error saving medical info:", error);
      setMessage({ type: "error", text: "Error al guardar la información médica" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información médica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Información Médica
        </h1>
        <p className="text-gray-600 mt-1">
          Datos médicos importantes para tu atención sanitaria
        </p>
      </div>

      {/* Mensaje */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Datos Básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Datos Básicos
          </CardTitle>
          <CardDescription>
            Información física básica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="blood-type">Grupo Sanguíneo</Label>
              <select
                id="blood-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={details.grupo_sanguineo || ""}
                onChange={(e) => setDetails({ ...details, grupo_sanguineo: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={details.altura_cm || ""}
                onChange={(e) => setDetails({ ...details, altura_cm: Number(e.target.value) || undefined })}
                placeholder="175"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={details.peso_kg || ""}
                onChange={(e) => setDetails({ ...details, peso_kg: Number(e.target.value) || undefined })}
                placeholder="70"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alergias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Alergias
          </CardTitle>
          <CardDescription>
            Lista de alergias known para que los médicos puedan evitarlas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            id="allergies"
            rows={3}
            value={details.alergias?.join(", ") || ""}
            onChange={(e) =>
              setDetails({
                ...details,
                alergias: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="Penicilina, Alergi a frutos secos, Aspirina..."
          />
          <p className="text-sm text-gray-500">
            Separa las alergias con comas
          </p>
        </CardContent>
      </Card>

      {/* Condiciones Crónicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Condiciones Crónicas
          </CardTitle>
          <CardDescription>
            Enfermedades o condiciones médicas persistentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            id="chronic"
            rows={3}
            value={details.enfermedades_cronicas?.join(", ") || ""}
            onChange={(e) =>
              setDetails({
                ...details,
                enfermedades_cronicas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="Diabetes, Hipertensión, Asma..."
          />
          <p className="text-sm text-gray-500">
            Separa las condiciones con comas
          </p>
        </CardContent>
      </Card>

      {/* Medicamentos Actuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicamentos Actuales
          </CardTitle>
          <CardDescription>
            Lista de medicamentos que estás tomando actualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            id="medications"
            rows={4}
            value={details.medicamentos_actuales || ""}
            onChange={(e) => setDetails({ ...details, medicamentos_actuales: e.target.value })}
            placeholder="列出你当前服用的所有药物，包括剂量和频率"
          />
        </CardContent>
      </Card>

      {/* Cirugías Previas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Cirugías Previas
          </CardTitle>
          <CardDescription>
            Operaciones o procedimientos quirúrgicos anteriores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            id="surgeries"
            rows={3}
            value={details.cirugias_previas || ""}
            onChange={(e) => setDetails({ ...details, cirugias_previas: e.target.value })}
            placeholder="Appendicectomía 2018, Cesárea 2020..."
          />
        </CardContent>
      </Card>

      {/* Contacto de Emergencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Phone className="h-5 w-5" />
            Contacto de Emergencia
          </CardTitle>
          <CardDescription>
            Persona a contactar en caso de emergencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emergency-name">Nombre Completo</Label>
              <Input
                id="emergency-name"
                value={details.contacto_emergencia_nombre || ""}
                onChange={(e) => setDetails({ ...details, contacto_emergencia_nombre: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-phone">Teléfono</Label>
              <Input
                id="emergency-phone"
                value={details.contacto_emergencia_telefono || ""}
                onChange={(e) => setDetails({ ...details, contacto_emergencia_telefono: e.target.value })}
                placeholder="+57 300 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency-relation">Relación</Label>
              <Input
                id="emergency-relation"
                value={details.contacto_emergencia_relacion || ""}
                onChange={(e) => setDetails({ ...details, contacto_emergencia_relacion: e.target.value })}
                placeholder="Cónyuge, Padre, Hermano..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón Guardar */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
