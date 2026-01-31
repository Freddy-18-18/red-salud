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


});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
