import { z } from 'zod';

export const prescriptionStatusSchema = z.enum(['activa', 'surtida', 'vencida', 'cancelada']);

export const medicationCatalogSchema = z.object({
    id: z.string().uuid(),
    nombre_comercial: z.string(),
    nombre_generico: z.string(),
    principio_activo: z.string().optional().nullable(),
    concentracion: z.string().optional().nullable(),
    forma_farmaceutica: z.string().optional().nullable(),
    fabricante: z.string().optional().nullable(),
    requiere_receta: z.boolean().default(true),
    activo: z.boolean().default(true),
});

export const prescriptionMedicationSchema = z.object({
    id: z.string().uuid().optional(),
    prescription_id: z.string().uuid().optional(),
    medication_id: z.string().uuid().optional().nullable(),
    nombre_medicamento: z.string().min(1),
    dosis: z.string().min(1),
    frecuencia: z.string().min(1),
    via_administracion: z.string().optional().nullable(),
    duracion_dias: z.number().optional().nullable(),
    cantidad_total: z.string().optional().nullable(),
    instrucciones_especiales: z.string().optional().nullable(),
});

export const prescriptionSchema = z.object({
    id: z.string().uuid(),
    paciente_id: z.string().uuid(),
    medico_id: z.string().uuid(),
    medical_record_id: z.string().uuid().optional().nullable(),
    appointment_id: z.string().uuid().optional().nullable(),
    fecha_prescripcion: z.string().datetime(),
    fecha_vencimiento: z.string().datetime().optional().nullable(),
    diagnostico: z.string().optional().nullable(),
    instrucciones_generales: z.string().optional().nullable(),
    status: prescriptionStatusSchema.default('activa'),
    folio: z.string().optional().nullable(),
    medications: z.array(prescriptionMedicationSchema).optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type PrescriptionT = z.infer<typeof prescriptionSchema>;

export const createPrescriptionSchema = prescriptionSchema.omit({
    id: true,
    created_at: true,
    updated_at: true
}).extend({
    medications: z.array(prescriptionMedicationSchema.omit({ id: true, prescription_id: true }))
});

export type CreatePrescriptionDataT = z.infer<typeof createPrescriptionSchema>;
