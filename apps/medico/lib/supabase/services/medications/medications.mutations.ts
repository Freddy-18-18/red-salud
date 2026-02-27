import { supabase } from "../../client";
import type {
  Prescription,
  MedicationReminder,
  MedicationIntakeLog,
  CreatePrescriptionData,
  CreateReminderData,
} from "./medications.types";

// ============ PRESCRIPCIONES ============

// Crear prescripción (para doctores)
export async function createPrescription(prescriptionData: CreatePrescriptionData) {
  try {
    // Crear la prescripción
    const { data: prescription, error: prescriptionError } = await supabase
      .from("prescriptions")
      .insert({
        paciente_id: prescriptionData.paciente_id || null,
        offline_patient_id: prescriptionData.offline_patient_id || null,
        medico_id: prescriptionData.medico_id,
        medical_record_id: prescriptionData.medical_record_id,
        appointment_id: prescriptionData.appointment_id,
        fecha_prescripcion: prescriptionData.fecha_prescripcion || new Date().toISOString().split('T')[0],
        fecha_vencimiento: prescriptionData.fecha_vencimiento,
        diagnostico: prescriptionData.diagnostico,
        instrucciones_generales: prescriptionData.instrucciones_generales,
      })
      .select()
      .single();

    if (prescriptionError) throw prescriptionError;

    // Agregar medicamentos (support both 'medications' and 'medicamentos' keys)
    const meds = prescriptionData.medications || prescriptionData.medicamentos || [];
    if (meds.length > 0) {
      const medicationsToInsert = meds.map((med) => ({
        prescription_id: prescription.id,
        medication_id: med.medication_id,
        nombre_medicamento: med.nombre_medicamento,
        dosis: med.dosis,
        frecuencia: med.frecuencia,
        via_administracion: med.via_administracion,
        duracion_dias: med.duracion_dias,
        cantidad_total: med.cantidad_total,
        instrucciones_especiales: med.instrucciones_especiales,
      }));

      const { error: medicationsError } = await supabase
        .from("prescription_medications")
        .insert(medicationsToInsert);

      if (medicationsError) throw medicationsError;
    }

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: prescriptionData.medico_id,
      activity_type: "prescription_created",
      description: `Prescripción creada para paciente ${prescriptionData.paciente_id}`,
      status: "success",
    });

    return { success: true, data: prescription as Prescription };
  } catch (error) {
    console.error("Error creating prescription:", error);
    return { success: false, error, data: null };
  }
}

// Marcar prescripción como surtida
export async function markPrescriptionAsFilled(prescriptionId: string, pharmacyId?: string) {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .update({
        status: "surtida",
        fecha_surtida: new Date().toISOString(),
        farmacia_id: pharmacyId,
      })
      .eq("id", prescriptionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as Prescription };
  } catch (error) {
    console.error("Error marking prescription as filled:", error);
    return { success: false, error, data: null };
  }
}

// ============ RECORDATORIOS ============

// Crear recordatorio
export async function createReminder(reminderData: CreateReminderData) {
  try {
    const { data, error } = await supabase
      .from("medication_reminders")
      .insert({
        paciente_id: reminderData.paciente_id,
        prescription_medication_id: reminderData.prescription_medication_id,
        nombre_medicamento: reminderData.nombre_medicamento,
        dosis: reminderData.dosis,
        horarios: reminderData.horarios,
        dias_semana: reminderData.dias_semana,
        fecha_inicio: reminderData.fecha_inicio,
        fecha_fin: reminderData.fecha_fin,
        notificar_email: reminderData.notificar_email || false,
        notificar_push: reminderData.notificar_push !== false,
        notas: reminderData.notas,
      })
      .select()
      .single();

    if (error) throw error;

    // Crear registros de tomas programadas para los próximos 7 días
    await generateIntakeSchedule(data.id, reminderData);

    return { success: true, data: data as MedicationReminder };
  } catch (error) {
    console.error("Error creating reminder:", error);
    return { success: false, error, data: null };
  }
}

// Generar horario de tomas
async function generateIntakeSchedule(reminderId: string, reminderData: CreateReminderData) {
  const intakeLogs = [];
  const startDate = new Date(reminderData.fecha_inicio);
  const endDate = reminderData.fecha_fin ? new Date(reminderData.fecha_fin) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();

    // Si hay días específicos, verificar si este día aplica
    if (reminderData.dias_semana && !reminderData.dias_semana.includes(dayOfWeek)) {
      continue;
    }

    // Crear entrada para cada horario del día
    for (const time of reminderData.horarios) {
      const parts = time.split(':');
      const hours = parts[0];
      const minutes = parts[1];
      if (hours === undefined || minutes === undefined) continue;

      const scheduledDate = new Date(date);
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      intakeLogs.push({
        reminder_id: reminderId,
        paciente_id: reminderData.paciente_id,
        fecha_programada: scheduledDate.toISOString(),
        status: 'pendiente',
      });
    }
  }

  if (intakeLogs.length > 0) {
    await supabase.from("medication_intake_log").insert(intakeLogs);
  }
}

// Actualizar recordatorio
export async function updateReminder(reminderId: string, updates: Partial<MedicationReminder>) {
  try {
    const { data, error } = await supabase
      .from("medication_reminders")
      .update(updates)
      .eq("id", reminderId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as MedicationReminder };
  } catch (error) {
    console.error("Error updating reminder:", error);
    return { success: false, error, data: null };
  }
}

// Desactivar recordatorio
export async function deactivateReminder(reminderId: string) {
  return updateReminder(reminderId, { activo: false });
}

// ============ REGISTRO DE TOMAS ============

// Registrar toma de medicamento
export async function recordMedicationIntake(intakeId: string, status: 'tomado' | 'omitido', notes?: string) {
  try {
    const { data, error } = await supabase
      .from("medication_intake_log")
      .update({
        status,
        fecha_tomada: status === 'tomado' ? new Date().toISOString() : null,
        notas: notes,
      })
      .eq("id", intakeId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as MedicationIntakeLog };
  } catch (error) {
    console.error("Error recording intake:", error);
    return { success: false, error, data: null };
  }
}
