import { z } from 'zod';

export const appointmentStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'absent']);

export const appointmentSchema = z.object({
    id: z.string().uuid(),
    patient_id: z.string().uuid(),
    doctor_id: z.string().uuid(),
    scheduled_at: z.string().datetime(),
    duration_minutes: z.number().min(5),
    appointment_type: z.string().optional(),
    status: appointmentStatusSchema.default('pending'),
    reason: z.string().optional().nullable(),
    internal_notes: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    price: z.number().optional().nullable(),
    meeting_url: z.string().url().optional().nullable(),
    payment_method: z.string().optional().nullable(),
    send_reminder: z.boolean().default(true),
    location_id: z.string().uuid().optional().nullable(),
    offline_patient_id: z.string().uuid().optional().nullable(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type AppointmentT = z.infer<typeof appointmentSchema>;

export const appointmentFormSchema = z.object({
    patient_id: z.string().min(1, "Select a patient"),
    date: z.string().min(1, "Select a date"),
    time: z.string().min(1, "Select a time"),
    duration_minutes: z.coerce.number().min(5, "Minimum 5 minutes"),
    appointment_type: z.enum(["in_person", "telemedicine", "emergency", "follow_up", "first_visit"]),
    reason: z.string().min(1, "Reason is required"),
    internal_notes: z.string().optional(),
    price: z.string().optional(),
    payment_method: z.string().default("cash"),
    send_reminder: z.boolean().default(true),
    new_patient_data: z
        .object({
            full_name: z.string(),
            id_number: z.string(),
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
