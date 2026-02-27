import { z } from 'zod';

export const appointmentStatusSchema = z.enum(['pendiente', 'confirmada', 'completada', 'cancelada', 'ausente']);

export const appointmentSchema = z.object({
    id: z.string().uuid(),
    paciente_id: z.string().uuid(),
    medico_id: z.string().uuid(),
    fecha_hora: z.string().datetime(),
    duracion_minutos: z.number().min(5),
    tipo_cita: z.string().optional(),
    status: appointmentStatusSchema.default('pendiente'),
    motivo: z.string().optional().nullable(),
    notas_internas: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    price: z.number().optional().nullable(),
    meeting_url: z.string().url().optional().nullable(),
    metodo_pago: z.string().optional().nullable(),
    enviar_recordatorio: z.boolean().default(true),
    location_id: z.string().uuid().optional().nullable(),
    offline_patient_id: z.string().uuid().optional().nullable(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type AppointmentT = z.infer<typeof appointmentSchema>;

export const appointmentFormSchema = z.object({
    paciente_id: z.string().min(1, "Selecciona un paciente"),
    fecha: z.string().min(1, "Selecciona una fecha"),
    hora: z.string().min(1, "Selecciona una hora"),
    duracion_minutos: z.coerce.number().min(5, "Mínimo 5 minutos"),
    tipo_cita: z.enum(["presencial", "telemedicina", "urgencia", "seguimiento", "primera_vez"]),
    motivo: z.string().min(1, "El motivo es requerido"),
    notas_internas: z.string().optional(),
    precio: z.string().optional(),
    metodo_pago: z.string().default("efectivo"),
    enviar_recordatorio: z.boolean().default(true),
    new_patient_data: z
        .object({
            nombre_completo: z.string(),
            cedula: z.string(),
            email: z.string().optional().nullable(),
        })
        .optional(),
    dental_details: z
        .object({
            chairId: z.string().optional(),
            hygienistId: z.string().optional(),
            assistantId: z.string().optional(),
            procedureCode: z.string().optional(),
            procedureName: z.string().optional(),
            toothNumbers: z.array(z.number()).default([]),
            surfaces: z.array(z.string()).default([]),
            quadrant: z.number().min(1).max(4).optional(),
            requiresAnesthesia: z.boolean().default(false),
            anesthesiaType: z.string().optional(),
            requiresSedation: z.boolean().default(false),
            sedationType: z.string().optional(),
            materialsNeeded: z.array(z.string()).default([]),
            materialsPrepared: z.boolean().default(false),
            specialEquipment: z.array(z.string()).default([]),
            estimatedCost: z.number().optional(),
            insuranceAuthorization: z.string().optional(),
            preopNotes: z.string().default(""),
            postopNotes: z.string().default(""),
            complications: z.string().default(""),
        })
        .optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
