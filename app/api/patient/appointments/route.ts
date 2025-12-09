import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  Appointment,
  ConsultationType,
  MedicalSpecialty,
} from "@/lib/supabase/types/appointments";

interface AppointmentRow {
  id: string;
  paciente_id: string;
  medico_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  status: string;
  tipo_cita?: ConsultationType | null;
  motivo?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  doctor?: {
    id: string;
    nombre_completo?: string;
    avatar_url?: string;
    doctor_profile?: {
      consultation_price?: number | string;
      consultation_duration?: number;
      specialty?: MedicalSpecialty | null;
    } | null;
  } | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedPatientId = searchParams.get("patientId");

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  if (requestedPatientId && requestedPatientId !== user.id) {
    return NextResponse.json(
      { success: false, error: "Paciente no coincide" },
      { status: 403 }
    );
  }

  const targetPatientId = requestedPatientId || user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url,
          doctor_profile:doctor_details(
            tarifa_consulta,
            specialty:specialties(id, name, description, icon)
          )
        )
      `)
      .eq("paciente_id", targetPatientId)
      .order("fecha_hora", { ascending: false });

    if (error) throw error;

    const appointments: Appointment[] = (data || []).map((apt) => {
      const row = apt as any; // Using any to bypass strict type check for now as we changed DB schema
      const fechaHora = new Date(row.fecha_hora);
      return {
        id: row.id,
        patient_id: row.paciente_id,
        doctor_id: row.medico_id,
        appointment_date: fechaHora.toISOString().split("T")[0],
        appointment_time: fechaHora.toTimeString().split(" ")[0],
        duration: row.duracion_minutos,
        status:
          row.status === "pendiente"
            ? "pending"
            : row.status === "confirmada"
            ? "confirmed"
            : row.status === "completada"
            ? "completed"
            : "cancelled",
        consultation_type: row.tipo_cita || "video",
        reason: row.motivo,
        notes: row.notas,
        created_at: row.created_at,
        updated_at: row.updated_at,
        doctor: {
          id: row.doctor?.id,
          verified: true,
          created_at: row.created_at,
          updated_at: row.updated_at,
          profile: {
            id: row.doctor?.id,
            nombre_completo: row.doctor?.nombre_completo,
            avatar_url: row.doctor?.avatar_url,
          },
          specialty:
            row.doctor?.doctor_profile?.specialty || {
              id: "",
              name: "Medicina General",
              description: null,
              icon: "stethoscope",
              created_at: row.created_at,
            },
          tarifa_consulta:
            row.doctor?.doctor_profile?.tarifa_consulta
              ? Number(row.doctor?.doctor_profile?.tarifa_consulta)
              : undefined,
          consultation_duration: 30,
        },
      };
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("[patient-appointments] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
