import { supabase } from "../../client";
import type {
  MedicationCatalog,
  Prescription,
  MedicationReminder,
  MedicationIntakeLog,
  AdherenceStats,
  ActiveMedicationsSummary,
} from "./medications.types";

// ============ CATÁLOGO DE MEDICAMENTOS ============

// Buscar medicamentos en el catálogo
export async function searchMedicationsCatalog(searchTerm: string) {
  try {
    const { data, error } = await supabase
      .from("medications_catalog")
      .select("*")
      .eq("activo", true)
      .or(
        `nombre_comercial.ilike.%${searchTerm}%,nombre_generico.ilike.%${searchTerm}%,principio_activo.ilike.%${searchTerm}%`
      )
      .order("nombre_comercial")
      .limit(20);

    if (error) throw error;
    return { success: true, data: data as MedicationCatalog[] };
  } catch (error) {
    console.error("Error searching medications:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener medicamento por ID
export async function getMedicationById(medicationId: string) {
  try {
    const { data, error } = await supabase
      .from("medications_catalog")
      .select("*")
      .eq("id", medicationId)
      .single();

    if (error) throw error;
    return { success: true, data: data as MedicationCatalog };
  } catch (error) {
    console.error("Error fetching medication:", error);
    return { success: false, error, data: null };
  }
}

// ============ PRESCRIPCIONES ============

// Obtener prescripciones del paciente
export async function getPatientPrescriptions(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        medico:profiles!prescriptions_medico_id_fkey(
          id,
          nombre_completo,
          especialidad
        ),
        medications:prescription_medications(
          *,
          medication:medications_catalog(*)
        )
      `)
      .eq("paciente_id", patientId)
      .order("fecha_prescripcion", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as Prescription[] };
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener prescripción específica
export async function getPrescription(prescriptionId: string) {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        medico:profiles!prescriptions_medico_id_fkey(
          id,
          nombre_completo,
          especialidad,
          avatar_url
        ),
        medications:prescription_medications(
          *,
          medication:medications_catalog(*)
        )
      `)
      .eq("id", prescriptionId)
      .single();

    if (error) throw error;
    return { success: true, data: data as Prescription };
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return { success: false, error, data: null };
  }
}

// ============ RECORDATORIOS ============

// Obtener recordatorios activos del paciente
export async function getPatientReminders(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("paciente_id", patientId)
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as MedicationReminder[] };
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return { success: false, error, data: [] };
  }
}

// ============ REGISTRO DE TOMAS ============

// Obtener registro de tomas del día
export async function getTodayIntakeLog(patientId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from("medication_intake_log")
      .select(`
        *,
        reminder:medication_reminders(*)
      `)
      .eq("paciente_id", patientId)
      .gte("fecha_programada", today.toISOString())
      .lt("fecha_programada", tomorrow.toISOString())
      .order("fecha_programada");

    if (error) throw error;
    return { success: true, data: data as MedicationIntakeLog[] };
  } catch (error) {
    console.error("Error fetching today intake log:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener estadísticas de adherencia
export async function getAdherenceStats(patientId: string, days: number = 30): Promise<{ success: boolean; data: AdherenceStats | null; error?: any }> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("medication_intake_log")
      .select("status, fecha_programada, fecha_tomada")
      .eq("paciente_id", patientId)
      .gte("fecha_programada", startDate.toISOString())
      .lte("fecha_programada", new Date().toISOString());

    if (error) throw error;

    const total = data.length;
    const tomadas = data.filter(log => log.status === 'tomado').length;
    const omitidas = data.filter(log => log.status === 'omitido').length;
    const retrasadas = data.filter(log => log.status === 'retrasado').length;

    // Calcular racha actual
    let rachaActual = 0;
    let mejorRacha = 0;
    let rachaTemp = 0;

    const sortedData = [...data].sort((a, b) => 
      new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime()
    );

    for (const log of sortedData) {
      if (log.status === 'tomado') {
        rachaTemp++;
        if (rachaTemp > mejorRacha) mejorRacha = rachaTemp;
      } else {
        rachaTemp = 0;
      }
    }
    rachaActual = rachaTemp;

    const stats: AdherenceStats = {
      total_tomas_programadas: total,
      tomas_completadas: tomadas,
      tomas_omitidas: omitidas,
      tomas_retrasadas: retrasadas,
      porcentaje_adherencia: total > 0 ? Math.round((tomadas / total) * 100) : 0,
      racha_actual: rachaActual,
      mejor_racha: mejorRacha,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error calculating adherence stats:", error);
    return { success: false, error, data: null };
  }
}

// Obtener resumen de medicamentos activos
export async function getActiveMedicationsSummary(patientId: string): Promise<{ success: boolean; data: ActiveMedicationsSummary | null; error?: any }> {
  try {
    const { data: reminders, error } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("paciente_id", patientId)
      .eq("activo", true);

    if (error) throw error;

    const now = new Date();
    let proximaToma: any = null;
    let minMinutos = Infinity;

    const medicamentosActivos = reminders.map((reminder: any) => {
      // Encontrar próxima toma
      const horarios = reminder.horarios as string[];
      for (const hora of horarios) {
        const [hours, minutes] = hora.split(':');
        const horaDate = new Date();
        horaDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (horaDate > now) {
          const minutosRestantes = Math.floor((horaDate.getTime() - now.getTime()) / 60000);
          if (minutosRestantes < minMinutos) {
            minMinutos = minutosRestantes;
            proximaToma = {
              medicamento: reminder.nombre_medicamento,
              hora: hora,
              minutos_restantes: minutosRestantes,
            };
          }
        }
      }

      return {
        nombre: reminder.nombre_medicamento,
        dosis: reminder.dosis,
        frecuencia: `${horarios.length} veces al día`,
        proxima_toma: horarios[0],
      };
    });

    const summary: ActiveMedicationsSummary = {
      total_medicamentos: reminders.length,
      total_recordatorios: reminders.reduce((sum: number, r: any) => sum + r.horarios.length, 0),
      proxima_toma: proximaToma,
      medicamentos_activos: medicamentosActivos,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error fetching active medications summary:", error);
    return { success: false, error, data: null };
  }
}
