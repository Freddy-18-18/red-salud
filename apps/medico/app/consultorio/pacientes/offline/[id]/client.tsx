"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  Alert,
  AlertDescription
} from "@red-salud/design-system";
import {
  ArrowLeft,
  User,
  Droplet,
  AlertCircle,
  Pill,
  FileText,
  Edit,
  Clock,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { ConsultationActionButton } from "@/components/dashboard/medico/pacientes/consultation-action-button";
import { toast } from "sonner";

// Interactive Components
import { MedicalFlipCard } from "./_components/medical-flip-card";
import { AutoSaveNotes } from "./_components/auto-save-notes";
import { ContactFlipCard } from "./_components/contact-flip-card";

interface OfflinePatient {
  id: string;
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  tipo_sangre: string | null;
  alergias: string[] | null;
  condiciones_cronicas: string[] | null;
  medicamentos_actuales: string[] | null;
  notas_medico: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function OfflinePatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<OfflinePatient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPatient = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      const { data, error } = await supabase
        .from("offline_patients")
        .select("*")
        .eq("id", params.id)
        .eq("doctor_id", user.id)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (err) {
      console.error("Error loading patient:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const handleUpdateTags = useCallback(async (field: keyof OfflinePatient, action: 'add' | 'remove', item: string) => {
    if (!patient) return;

    const currentList = (patient[field] as string[]) || [];
    let newList = [...currentList];

    if (action === 'add') {
      if (!newList.includes(item)) newList.push(item);
    } else {
      newList = newList.filter(i => i !== item);
    }

    // Optimistic Update
    setPatient(prev => prev ? { ...prev, [field]: newList } : null);

    try {
      const { error } = await supabase
        .from("offline_patients")
        .update({ [field]: newList })
        .eq("id", patient.id);

      if (error) throw error;
      toast.success(`${field === 'alergias' ? 'Alergia' : 'Item'} actualizada`);
    } catch (err) {
      console.error("Error updating tags:", err);
      toast.error("Error al actualizar");
      // Revert on error
      setPatient(prev => prev ? { ...prev, [field]: currentList } : null);
    }
  }, [patient]);

  const handleSaveNotes = useCallback(async (newNotes: string) => {
    if (!patient) return;

    try {
      const { error } = await supabase
        .from("offline_patients")
        .update({ notas_medico: newNotes })
        .eq("id", patient.id);

      if (error) throw error;
      setPatient(prev => prev ? { ...prev, notas_medico: newNotes } : null);
    } catch (err) {
      console.error("Error saving notes:", err);
      throw err;
    }
  }, [patient]);

  const handleUpdateContact = useCallback(async (newData: Record<string, unknown>) => {
    if (!patient) return;

    const sanitizedData = Object.fromEntries(
      Object.entries(newData).map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === "" ? null : (typeof value === 'string' ? value.trim() : value)
      ])
    );

    setPatient(prev => prev ? { ...prev, ...sanitizedData } : null);

    try {
      const { error } = await supabase
        .from("offline_patients")
        .update(sanitizedData)
        .eq("id", patient.id);

      if (error) throw error;

      toast.success("Información de contacto actualizada");
      loadPatient();
    } catch (err) {
      console.error("Error updating contact:", err);
      toast.error(err instanceof Error ? err.message : "Error al actualizar contacto");
      loadPatient();
    }
  }, [patient, loadPatient]);

  const age = useMemo(() => {
    if (!patient?.fecha_nacimiento) return null;
    const today = new Date();
    const birth = new Date(patient.fecha_nacimiento);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, [patient?.fecha_nacimiento]);

  const initials = useMemo(() => {
    if (!patient?.nombre_completo) return "";
    return patient.nombre_completo
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [patient?.nombre_completo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "No se pudo cargar la información del paciente"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <VerificationGuard>
      <div className="h-[calc(100vh-4rem)] p-4 md:p-6 overflow-hidden flex flex-col gap-4">
        {/* Header Compacto */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Perfil de Paciente</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Paciente Offline (Sin Cuenta)
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar Datos
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-0">
          {/* Main Column (Left - 8 cols) */}
          <div className="md:col-span-8 flex flex-col gap-4 h-full min-h-0">
            {/* Hero Card - Identity */}
            <Card className="shrink-0 border-none shadow-md bg-gradient-to-br from-card to-accent/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <User className="w-32 h-32" />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {patient.nombre_completo}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                        <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
                          C.I. {patient.cedula}
                        </Badge>
                        {age && (
                          <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                            {age} años
                          </Badge>
                        )}
                        <Badge variant={patient.genero === "M" ? "default" : "secondary"} className="px-2 py-0.5 text-xs font-normal">
                          {patient.genero === "M" ? "Masculino" : "Femenino"}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-center md:justify-start">
                      <ConsultationActionButton
                        patientId={patient.id}
                        patientType="offline"
                        className="w-full md:w-auto min-w-[200px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Interactive Grid */}
            <div className="grid grid-cols-3 gap-4 shrink-0 h-40">
              {/* 1. Blood Type (Simple Card, No Flip needed really but keeping consistency or simple card) */}
              {/* Actually user mentioned flip cards for lists. Blood type is single value. 
                    Let's keep Blood Type static for now or maybe make it editable later. */}
              <Card className="bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20 h-full flex flex-col justify-center">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Droplet className="h-4 w-4" /> Tipo de Sangre
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <span className="text-3xl font-bold text-foreground">
                    {patient.tipo_sangre || "--"}
                  </span>
                </CardContent>
              </Card>

              {/* 2. Allergies (Flip Card) */}
              <MedicalFlipCard
                title="Alergias"
                icon={<AlertCircle className="h-4 w-4" />}
                items={patient.alergias}
                colorClass="text-orange-600 dark:text-orange-400"
                bgClass="bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20"
                onAdd={(item) => handleUpdateTags("alergias", "add", item)}
                onRemove={(item) => handleUpdateTags("alergias", "remove", item)}
              />

              {/* 3. Medications (Flip Card) - Using 'medicamentos_actuales' */}
              <MedicalFlipCard
                title="Medicación"
                icon={<Pill className="h-4 w-4" />}
                items={patient.medicamentos_actuales}
                colorClass="text-blue-600 dark:text-blue-400"
                bgClass="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20"
                onAdd={(item) => handleUpdateTags("medicamentos_actuales", "add", item)}
                onRemove={(item) => handleUpdateTags("medicamentos_actuales", "remove", item)}
              />
            </div>

            {/* Auto-Saving Notes Section */}
            <Card className="flex-1 min-h-0 flex flex-col overflow-hidden relative group">
              <CardHeader className="shrink-0 pb-3 border-b bg-muted/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Notas Médicas
                </CardTitle>
              </CardHeader>
              <div className="flex-1 overflow-hidden relative bg-card">
                <AutoSaveNotes
                  initialValue={patient.notas_medico}
                  onSave={handleSaveNotes}
                  placeholder="Escriba notas clínicas, observaciones o antecedentes relevantes aquí..."
                  className="h-full"
                />
              </div>
            </Card>
          </div>

          {/* Sidebar (Right - 4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4 h-full min-h-0">
            {/* Registration Alert */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50 p-4 shrink-0">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-200 text-sm">Paciente no registrado</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                    Al registrarse con cédula <strong>{patient.cedula}</strong>, su historial se vinculará automáticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info (Flip Card) */}
            <div className="shrink-0">
              <ContactFlipCard
                patient={{
                  telefono: patient.telefono,
                  email: patient.email,
                  direccion: patient.direccion,
                  fecha_nacimiento: patient.fecha_nacimiento
                }}
                onSave={handleUpdateContact}
              />
            </div>

            {/* System Info */}
            <Card className="flex-1 min-h-0 flex flex-col bg-muted/20 border-border/50">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Metadatos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Registrado el</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(patient.created_at), "PPP", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Edit className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Última actualización</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(patient.updated_at), "PPP", { locale: es })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </VerificationGuard>
  );
}
