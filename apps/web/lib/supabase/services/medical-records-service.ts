import { supabase } from "../client";
import type {
  MedicalRecord,
  CreateMedicalRecordData,
  MedicalRecordFilters,
  MedicalHistorySummary,
} from "../types/medical-records";
import { tauriApiService } from "@/lib/services/tauri-api-service";

// Obtener historial médico de un paciente
export async function getPatientMedicalRecords(
  patientId: string,
  filters?: MedicalRecordFilters,
  accessToken?: string
) {
  try {
    let query = supabase
      .from("medical_records")
      .select(`
        *,
        medico:profiles!medical_records_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url,
          especialidad
        ),
        appointment:appointments!medical_records_appointment_id_fkey(
          id,
          fecha_hora,
          motivo
        )
      `)
      .eq("paciente_id", patientId)
      .order("created_at", { ascending: false });

    // Aplicar filtros
    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }
    if (filters?.medicoId) {
      query = query.eq("medico_id", filters.medicoId);
    }
    if (filters?.searchTerm) {
      query = query.or(
        `diagnostico.ilike.%${filters.searchTerm}%,sintomas.ilike.%${filters.searchTerm}%,tratamiento.ilike.%${filters.searchTerm}%`
      );
    }



    if (tauriApiService.isDesktop() && accessToken) {
      let endpoint = `/rest/v1/medical_records?select=*,medico:profiles!medical_records_medico_id_fkey(id,nombre_completo,avatar_url,especialidad),appointment:appointments!medical_records_appointment_id_fkey(id,fecha_hora,motivo)&paciente_id=eq.${patientId}&order=created_at.desc`;

      // Simple filter support
      if (filters?.medicoId) {
        endpoint += `&medico_id=eq.${filters.medicoId}`;
      }

      const data = await tauriApiService.supabaseGet<MedicalRecord[]>(
        endpoint,
        accessToken,
        `medical_records_patient_${patientId}`
      );
      return { success: true, data: data || [] };
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data as MedicalRecord[] };
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener un registro médico específico
export async function getMedicalRecord(recordId: string) {
  try {
    const { data, error } = await supabase
      .from("medical_records")
      .select(`
        *,
        medico:profiles!medical_records_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url,
          especialidad
        ),
        appointment:appointments!medical_records_appointment_id_fkey(
          id,
          fecha_hora,
          motivo
        ),
        paciente:profiles!medical_records_paciente_id_fkey(
          id,
          nombre_completo,
          fecha_nacimiento,
          avatar_url
        )
      `)
      .eq("id", recordId)
      .single();

    if (error) throw error;

    return { success: true, data: data as MedicalRecord };
  } catch (error) {
    console.error("Error fetching medical record:", error);
    return { success: false, error, data: null };
  }
}

// Crear un nuevo registro médico (para doctores)
export async function createMedicalRecord(recordData: CreateMedicalRecordData) {
  try {
    const { data, error } = await supabase
      .from("medical_records")
      .insert(recordData)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: recordData.medico_id,
      activity_type: "medical_record_created",
      description: `Registro médico creado para paciente ${recordData.paciente_id}`,
      status: "success",
    });

    return { success: true, data: data as MedicalRecord };
  } catch (error) {
    console.error("Error creating medical record:", error);
    return { success: false, error, data: null };
  }
}

// Actualizar un registro médico (para doctores)
export async function updateMedicalRecord(
  recordId: string,
  updates: Partial<CreateMedicalRecordData>
) {
  try {
    const { data, error } = await supabase
      .from("medical_records")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recordId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as MedicalRecord };
  } catch (error) {
    console.error("Error updating medical record:", error);
    return { success: false, error, data: null };
  }
}

// Obtener resumen del historial médico
export async function getMedicalHistorySummary(
  patientId: string
): Promise<{ success: boolean; data: MedicalHistorySummary | null; error?: unknown }> {
  try {
    // Obtener todos los registros
    const { data: records, error: recordsError } = await supabase
      .from("medical_records")
      .select(`
        *,
        medico:profiles!medical_records_medico_id_fkey(
          id,
          nombre_completo,
          especialidad
        )
      `)
      .eq("paciente_id", patientId)
      .order("created_at", { ascending: false });

    if (recordsError) throw recordsError;

    if (!records || records.length === 0) {
      return {
        success: true,
        data: {
          total_consultas: 0,
          diagnosticos_frecuentes: [],
          medicamentos_actuales: [],
          examenes_pendientes: [],
          doctores_consultados: [],
        },
      };
    }

    // Calcular estadísticas
    interface DoctorConsulted {
      id: string;
      nombre: string;
      especialidad: string;
      consultas: number;
    }
    const diagnosticosMap = new Map<string, number>();
    const medicamentosSet = new Set<string>();
    const examenesSet = new Set<string>();
    const doctoresMap = new Map<string, DoctorConsulted>();

    records.forEach((record) => {
      // Diagnósticos frecuentes
      if (record.diagnostico) {
        diagnosticosMap.set(
          record.diagnostico,
          (diagnosticosMap.get(record.diagnostico) || 0) + 1
        );
      }

      // Medicamentos actuales (últimos 3 meses)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (
        record.medicamentos &&
        new Date(record.created_at) > threeMonthsAgo
      ) {
        record.medicamentos.split(",").forEach((med: string) => {
          const trimmed = med.trim();
          if (trimmed) medicamentosSet.add(trimmed);
        });
      }

      // Exámenes pendientes (últimos 6 meses sin resultados)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (
        record.examenes_solicitados &&
        new Date(record.created_at) > sixMonthsAgo
      ) {
        record.examenes_solicitados.split(",").forEach((exam: string) => {
          const trimmed = exam.trim();
          if (trimmed) examenesSet.add(trimmed);
        });
      }

      // Doctores consultados
      if (record.medico) {
        const doctorId = record.medico.id;
        if (doctoresMap.has(doctorId)) {
          doctoresMap.get(doctorId).consultas++;
        } else {
          doctoresMap.set(doctorId, {
            id: doctorId,
            nombre: record.medico.nombre_completo,
            especialidad: record.medico.especialidad || "General",
            consultas: 1,
          });
        }
      }
    });

    // Convertir a arrays y ordenar
    const diagnosticos_frecuentes = Array.from(diagnosticosMap.entries())
      .map(([diagnostico, count]) => ({ diagnostico, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const doctores_consultados = Array.from(doctoresMap.values()).sort(
      (a, b) => b.consultas - a.consultas
    );

    const summary: MedicalHistorySummary = {
      total_consultas: records.length,
      ultima_consulta: records[0]?.created_at,
      diagnosticos_frecuentes,
      medicamentos_actuales: Array.from(medicamentosSet),
      examenes_pendientes: Array.from(examenesSet),
      doctores_consultados,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error fetching medical history summary:", error);
    return { success: false, error, data: null };
  }
}

// Buscar en el historial médico
export async function searchMedicalRecords(
  patientId: string,
  searchTerm: string
) {
  try {
    const { data, error } = await supabase
      .from("medical_records")
      .select(`
        *,
        medico:profiles!medical_records_medico_id_fkey(
          nombre_completo,
          especialidad
        )
      `)
      .eq("paciente_id", patientId)
      .or(
        `diagnostico.ilike.%${searchTerm}%,sintomas.ilike.%${searchTerm}%,tratamiento.ilike.%${searchTerm}%,medicamentos.ilike.%${searchTerm}%`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data as MedicalRecord[] };
  } catch (error) {
    console.error("Error searching medical records:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener registros médicos por cita
export async function getMedicalRecordByAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("medical_records")
      .select(`
        *,
        medico:profiles!medical_records_medico_id_fkey(
          nombre_completo,
          avatar_url,
          especialidad
        )
      `)
      .eq("appointment_id", appointmentId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return { success: true, data: data as MedicalRecord | null };
  } catch (error) {
    console.error("Error fetching medical record by appointment:", error);
    return { success: false, error, data: null };
  }
}

// Exportar historial médico (para generar PDF o compartir)
export async function exportMedicalHistory(patientId: string) {
  try {
    const { data: records, error } = await supabase
      .from("medical_records")
      .select(`
        *,
        medico:profiles!medical_records_medico_id_fkey(
          nombre_completo,
          especialidad
        ),
        appointment:appointments!medical_records_appointment_id_fkey(
          fecha_hora,
          motivo
        )
      `)
      .eq("paciente_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Obtener información del paciente
    const { data: patient } = await supabase
      .from("profiles")
      .select("nombre_completo, fecha_nacimiento, email")
      .eq("id", patientId)
      .single();

    // Obtener detalles médicos del paciente
    const { data: patientDetails } = await supabase
      .from("patient_details")
      .select("*")
      .eq("profile_id", patientId)
      .single();

    return {
      success: true,
      data: {
        patient,
        patientDetails,
        records,
        exportDate: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error exporting medical history:", error);
    return { success: false, error, data: null };
  }
}
