import { z } from "zod";

// Medical data validation schemas

// Allergy validation schema
export const allergySchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre de la alergia debe tener al menos 2 caracteres")
    .max(100, "El nombre de la alergia es demasiado largo"),
  
  tipo: z
    .enum(["medicamento", "alimento", "ambiental", "otro"]),
  
  severidad: z
    .enum(["leve", "moderada", "severa"]),
  
  reaccion: z
    .string()
    .max(500, "La descripción de la reacción es demasiado larga")
    .optional(),
  
  fecha_diagnostico: z
    .string()
    .or(z.date())
    .optional(),
  
  notas: z
    .string()
    .max(1000, "Las notas son demasiado largas")
    .optional(),
});

// Medication validation schema
export const medicationSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre del medicamento debe tener al menos 2 caracteres")
    .max(200, "El nombre del medicamento es demasiado largo"),
  
  dosis: z
    .string()
    .min(1, "La dosis es requerida")
    .max(100, "La dosis es demasiado larga"),
  
  frecuencia: z
    .string()
    .min(1, "La frecuencia es requerida")
    .max(100, "La frecuencia es demasiado larga"),
  
  via_administracion: z
    .enum(["oral", "intravenosa", "intramuscular", "subcutanea", "topica", "otra"])
    .optional(),
  
  fecha_inicio: z
    .string()
    .or(z.date())
    .optional(),
  
  fecha_fin: z
    .string()
    .or(z.date())
    .optional(),
  
  prescrito_por: z
    .string()
    .max(100, "El nombre del médico es demasiado largo")
    .optional(),
  
  notas: z
    .string()
    .max(1000, "Las notas son demasiado largas")
    .optional(),
  
  activo: z
    .boolean()
    .default(true),
});

// Medical history validation schema
export const medicalHistorySchema = z.object({
  condiciones_cronicas: z
    .array(z.string())
    .default([]),
  
  cirugias_previas: z
    .array(z.object({
      nombre: z.string(),
      fecha: z.string().or(z.date()),
      notas: z.string().optional(),
    }))
    .default([]),
  
  antecedentes_familiares: z
    .string()
    .max(2000, "Los antecedentes familiares son demasiado largos")
    .optional(),
  
  notas_medicas: z
    .string()
    .max(5000, "Las notas médicas son demasiado largas")
    .optional(),
  
  grupo_sanguineo: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  
  factor_rh: z
    .enum(["positivo", "negativo"])
    .optional(),
});

// Vital signs validation schema
export const vitalSignsSchema = z.object({
  presion_arterial_sistolica: z
    .number()
    .int("La presión arterial sistólica debe ser un número entero")
    .min(50, "La presión arterial sistólica es demasiado baja")
    .max(250, "La presión arterial sistólica es demasiado alta")
    .optional(),
  
  presion_arterial_diastolica: z
    .number()
    .int("La presión arterial diastólica debe ser un número entero")
    .min(30, "La presión arterial diastólica es demasiado baja")
    .max(150, "La presión arterial diastólica es demasiado alta")
    .optional(),
  
  frecuencia_cardiaca: z
    .number()
    .int("La frecuencia cardíaca debe ser un número entero")
    .min(30, "La frecuencia cardíaca es demasiado baja")
    .max(220, "La frecuencia cardíaca es demasiado alta")
    .optional(),
  
  temperatura: z
    .number()
    .min(35, "La temperatura es demasiado baja")
    .max(42, "La temperatura es demasiado alta")
    .optional(),
  
  frecuencia_respiratoria: z
    .number()
    .int("La frecuencia respiratoria debe ser un número entero")
    .min(8, "La frecuencia respiratoria es demasiado baja")
    .max(40, "La frecuencia respiratoria es demasiado alta")
    .optional(),
  
  saturacion_oxigeno: z
    .number()
    .int("La saturación de oxígeno debe ser un número entero")
    .min(70, "La saturación de oxígeno es demasiado baja")
    .max(100, "La saturación de oxígeno es demasiado alta")
    .optional(),
  
  peso: z
    .number()
    .min(0.5, "El peso es demasiado bajo")
    .max(500, "El peso es demasiado alto")
    .optional(),
  
  altura: z
    .number()
    .min(30, "La altura es demasiado baja")
    .max(250, "La altura es demasiado alta")
    .optional(),
  
  fecha_medicion: z
    .string()
    .or(z.date())
    .optional(),
  
  notas: z
    .string()
    .max(500, "Las notas son demasiado largas")
    .optional(),
});

// Diagnosis validation schema
export const diagnosisSchema = z.object({
  codigo_icd: z
    .string()
    .min(1, "El código ICD es requerido")
    .max(20, "El código ICD es demasiado largo"),
  
  nombre: z
    .string()
    .min(2, "El nombre del diagnóstico debe tener al menos 2 caracteres")
    .max(500, "El nombre del diagnóstico es demasiado largo"),
  
  tipo: z
    .enum(["principal", "secundario", "provisional"])
    .default("principal"),
  
  fecha_diagnostico: z
    .string()
    .or(z.date()),
  
  estado: z
    .enum(["activo", "resuelto", "cronico"])
    .default("activo"),
  
  notas: z
    .string()
    .max(2000, "Las notas son demasiado largas")
    .optional(),
});

// Medical record validation schema
export const medicalRecordSchema = z.object({
  paciente_id: z
    .string()
    .uuid("ID de paciente inválido"),
  
  doctor_id: z
    .string()
    .uuid("ID de doctor inválido"),
  
  fecha_consulta: z
    .string()
    .or(z.date()),
  
  motivo_consulta: z
    .string()
    .min(5, "El motivo de consulta debe tener al menos 5 caracteres")
    .max(1000, "El motivo de consulta es demasiado largo"),
  
  sintomas: z
    .string()
    .max(2000, "La descripción de síntomas es demasiado larga")
    .optional(),
  
  examen_fisico: z
    .string()
    .max(2000, "El examen físico es demasiado largo")
    .optional(),
  
  diagnosticos: z
    .array(diagnosisSchema)
    .default([]),
  
  tratamiento: z
    .string()
    .max(2000, "El tratamiento es demasiado largo")
    .optional(),
  
  medicamentos_recetados: z
    .array(medicationSchema)
    .default([]),
  
  examenes_solicitados: z
    .array(z.string())
    .default([]),
  
  recomendaciones: z
    .string()
    .max(2000, "Las recomendaciones son demasiado largas")
    .optional(),
  
  proxima_cita: z
    .string()
    .or(z.date())
    .optional(),
  
  notas_adicionales: z
    .string()
    .max(3000, "Las notas adicionales son demasiado largas")
    .optional(),
});

// Laboratory result validation schema
export const laboratoryResultSchema = z.object({
  nombre_examen: z
    .string()
    .min(2, "El nombre del examen debe tener al menos 2 caracteres")
    .max(200, "El nombre del examen es demasiado largo"),
  
  tipo_examen: z
    .enum(["sangre", "orina", "heces", "imagen", "biopsia", "otro"]),
  
  fecha_realizacion: z
    .string()
    .or(z.date()),
  
  resultados: z
    .string()
    .min(1, "Los resultados son requeridos")
    .max(5000, "Los resultados son demasiado largos"),
  
  valores_referencia: z
    .string()
    .max(1000, "Los valores de referencia son demasiado largos")
    .optional(),
  
  interpretacion: z
    .string()
    .max(2000, "La interpretación es demasiado larga")
    .optional(),
  
  laboratorio: z
    .string()
    .max(200, "El nombre del laboratorio es demasiado largo")
    .optional(),
  
  documento_url: z
    .string()
    .url("URL de documento inválida")
    .optional(),
});

// Appointment validation schema
export const appointmentSchema = z.object({
  paciente_id: z
    .string()
    .uuid("ID de paciente inválido"),
  
  doctor_id: z
    .string()
    .uuid("ID de doctor inválido"),
  
  fecha: z
    .string()
    .or(z.date()),
  
  hora: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  
  tipo: z
    .enum(["presencial", "telemedicina"]),
  
  motivo: z
    .string()
    .min(5, "El motivo debe tener al menos 5 caracteres")
    .max(500, "El motivo es demasiado largo"),
  
  estado: z
    .enum(["programada", "confirmada", "en_curso", "completada", "cancelada", "no_asistio"])
    .default("programada"),
  
  notas: z
    .string()
    .max(1000, "Las notas son demasiado largas")
    .optional(),
});

// Type exports
export type AllergyFormData = z.infer<typeof allergySchema>;
export type MedicationFormData = z.infer<typeof medicationSchema>;
export type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;
export type VitalSignsFormData = z.infer<typeof vitalSignsSchema>;
export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;
export type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;
export type LaboratoryResultFormData = z.infer<typeof laboratoryResultSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
