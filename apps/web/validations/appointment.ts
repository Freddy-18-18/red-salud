import { z } from "zod";

export const appointmentSchema = z.object({
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
    new_patient_data: z.object({
        nombre_completo: z.string(),
        cedula: z.string(),
        email: z.string().optional().nullable(),
    }).optional(),
    // Campos odontológicos (opcionales)
    dental_details: z.object({
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
    }).optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

