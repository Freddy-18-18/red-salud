"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@red-salud/design-system";
import { Stethoscope, Loader2, Play } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ConsultationActionButtonProps {
  patientId: string;
  patientType: "registered" | "offline";
  className?: string;
}

export function ConsultationActionButton({ patientId, patientType, className }: ConsultationActionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<{ id: string; status: string } | null>(null);

  const checkActiveConsultation = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("appointments")
        .select("id, status")
        .eq("medico_id", user.id)
        // Filtro de seguridad: Solo considerar citas de las últimas 24h hasta el final del día de hoy
        // Esto evita que citas futuras (ej: 2026) o muy antiguas secuestren el botón
        .gte("fecha_hora", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .lte("fecha_hora", new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
        .not("status", "in", '("completada","cancelada")'); // Excluir finalizadas (usar solo valores válidos del enum)

      if (patientType === "registered") {
        query = query.eq("paciente_id", patientId);
      } else {
        query = query.eq("offline_patient_id", patientId);
      }

      // Ordenar por fecha para obtener la más reciente si hay múltiples
      const { data, error } = await query
        .order("fecha_hora", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking active consultation:", JSON.stringify(error));
      }

      if (data) {
        setActiveAppointment(data);
      } else {
        setActiveAppointment(null);
      }
    } catch (err) {
      console.error("Error in checkActiveConsultation:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId, patientType]);

  useEffect(() => {
    checkActiveConsultation();
  }, [checkActiveConsultation]);

  const handleStartOrResume = async () => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      // 1. Si ya hay una activa, navegar a ella
      if (activeAppointment) {
        const params = new URLSearchParams();
        params.set("appointment_id", activeAppointment.id);
        params.set("paciente_id", patientId);
        params.set("from", "patient_profile");

        router.push(`/dashboard/medico/pacientes/consulta?${params.toString()}`);
        return;
      }

      // 2. Si no, crear una nueva "en_consulta" inmediatamente
      const now = new Date();

      const newAppointmentData: {
        medico_id: string;
        fecha_hora: string;
        duracion_minutos: number;
        status: string;
        motivo: string;
        tipo_cita: string;
        paciente_id?: string;
        offline_patient_id?: string;
      } = {
        medico_id: user.id,
        fecha_hora: now.toISOString(),
        duracion_minutos: 30, // Default
        status: "en_consulta",
        motivo: "Consulta Iniciada desde Perfil",
        tipo_cita: "presencial",
      };

      if (patientType === "registered") {
        newAppointmentData.paciente_id = patientId;
      } else {
        newAppointmentData.offline_patient_id = patientId;
      }

      const { data: newAppt, error: createError } = await supabase
        .from("appointments")
        .insert(newAppointmentData)
        .select()
        .single();

      if (createError) throw createError;

      // Navegar a la nueva consulta
      const params = new URLSearchParams();
      params.set("appointment_id", newAppt.id);
      params.set("paciente_id", patientId);
      params.set("from", "patient_profile");

      router.push(`/dashboard/medico/pacientes/consulta?${params.toString()}`);

    } catch (err) {
      console.error("Error starting consultation:", err);
      toast.error("Error", {
        description: "No se pudo iniciar la consulta: " + (err instanceof Error ? err.message : "Error desconocido"),
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled variant="outline" className={`h-auto py-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleStartOrResume}
      disabled={actionLoading}
      className={`h-auto py-4 ${activeAppointment ? "bg-green-600 hover:bg-green-700 text-white" : ""} ${className}`}
      variant={activeAppointment ? "default" : "outline"}
    >
      <div className="flex flex-col items-center gap-2">
        {actionLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : activeAppointment ? (
          <Play className="h-6 w-6 fill-current" />
        ) : (
          <Stethoscope className="h-6 w-6" />
        )}
        <span>{activeAppointment ? "Continuar Consulta" : "Iniciar Consulta"}</span>
      </div>
    </Button>
  );
}
