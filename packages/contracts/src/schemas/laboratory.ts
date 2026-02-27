import { z } from 'zod';

export const labOrderStatusSchema = z.enum([
    'pendiente',
    'muestra_tomada',
    'en_proceso',
    'completada',
    'cancelada',
    'rechazada'
]);

export const labOrderPrioritySchema = z.enum(['normal', 'urgente', 'stat']);

export const labOrderSchema = z.object({
    id: z.string().uuid(),
    paciente_id: z.string().uuid(),
    medico_id: z.string().uuid().optional().nullable(),
    numero_orden: z.string(),
    fecha_orden: z.string().datetime(),
    status: labOrderStatusSchema.default('pendiente'),
    prioridad: labOrderPrioritySchema.default('normal'),
    requiere_ayuno: z.boolean().default(false),
    diagnostico_presuntivo: z.string().optional().nullable(),
    indicaciones_clinicas: z.string().optional().nullable(),
    instrucciones_paciente: z.string().optional().nullable(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type LabOrderT = z.infer<typeof labOrderSchema>;

export const createLabOrderSchema = z.object({
    paciente_id: z.string().uuid(),
    medico_id: z.string().uuid().optional().nullable(),
    diagnostico_presuntivo: z.string().optional().nullable(),
    indicaciones_clinicas: z.string().optional().nullable(),
    prioridad: labOrderPrioritySchema.default('normal'),
    test_type_ids: z.array(z.string().uuid()).min(1, "Debe seleccionar al menos un examen"),
    instrucciones_paciente: z.string().optional().nullable(),
});

export type CreateLabOrderDataT = z.infer<typeof createLabOrderSchema>;
