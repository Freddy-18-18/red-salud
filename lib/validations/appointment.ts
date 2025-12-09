import { z } from "zod";
import { isBefore, startOfDay } from "date-fns";

// Base schema without refinements for proper type inference
const baseAppointmentSchema = z.object({
  paciente_id: z.string().min(1, "Debes seleccionar un paciente"),
  fecha: z.string().refine((date) => {
    const today = startOfDay(new Date());
    const selectedDate = startOfDay(new Date(date));
    return !isBefore(selectedDate, today);
  }, "La fecha no puede ser en el pasado"),
  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  duracion_minutos: z.number().min(5, "La duración mínima es 5 minutos").max(480, "La duración máxima es 8 horas"),
  tipo_cita: z.enum(["presencial", "telemedicina", "urgencia", "seguimiento", "primera_vez"]),
  motivo: z.string().optional(),
  notas_internas: z.string().optional(),
  precio: z.string().optional(),
  metodo_pago: z.enum(["efectivo", "transferencia", "tarjeta", "seguro"]),
  enviar_recordatorio: z.boolean(),
});

export const appointmentSchema = baseAppointmentSchema.refine((data) => {
  // Validación combinada de fecha y hora
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (data.fecha === todayStr) {
    const [hours, minutes] = data.hora.split(':').map(Number);
    const selectedTime = new Date(now);
    selectedTime.setHours(hours, minutes, 0, 0);

    // Permitir si es al menos 1 minuto en el futuro para evitar problemas de sincronización
    return selectedTime > new Date(now.getTime() - 60000);
  }
  return true;
}, {
  message: "La hora seleccionada ya pasó",
  path: ["hora"],
});

// Use z.infer for form values - this matches what the form expects
export type AppointmentFormValues = z.infer<typeof baseAppointmentSchema>;


