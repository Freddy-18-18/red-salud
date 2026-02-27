import { z } from 'zod';

export const medicalRecordSchema = z.object({
    id: z.string().uuid(),
    paciente_id: z.string().uuid(),
    medico_id: z.string().uuid(),
    appointment_id: z.string().uuid().optional().nullable(),
    diagnostico: z.string().min(1, "El diagnóstico es requerido"),
    sintomas: z.string().optional().nullable(),
    tratamiento: z.string().optional().nullable(),
    medicamentos: z.string().optional().nullable(),
    examenes_solicitados: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type MedicalRecordT = z.infer<typeof medicalRecordSchema>;

export const createMedicalRecordSchema = medicalRecordSchema.omit({
    id: true,
    created_at: true,
    updated_at: true
});

export type CreateMedicalRecordDataT = z.infer<typeof createMedicalRecordSchema>;
