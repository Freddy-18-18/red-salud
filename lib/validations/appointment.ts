import { z } from "zod";
import { isBefore, startOfDay } from "date-fns";

/**
 * Schema base de validación para citas médicas
 * Validaciones centralizadas y reutilizables
 */
const baseAppointmentSchema = z.object({
  paciente_id: z.string().min(1, "Debes seleccionar un paciente"),

  fecha: z.string().refine((date) => {
    const today = startOfDay(new Date());
    const selectedDate = startOfDay(new Date(date));
    return !isBefore(selectedDate, today);
  }, "La fecha no puede ser en el pasado"),

  hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)"),

  duracion_minutos: z
    .number()
    .min(5, "La duración mínima es 5 minutos")
    .max(480, "La duración máxima es 8 horas"),

  tipo_cita: z.enum(["presencial", "telemedicina", "urgencia", "seguimiento", "primera_vez"], {
    message: "Tipo de cita inválido",
  }),

  motivo: z
    .string()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .optional()
    .or(z.literal("")),

  notas_internas: z.string().optional().or(z.literal("")),

  precio: z
    .string()
    .refine(
      (val) => !val || !isNaN(parseFloat(val)),
      "El precio debe ser un número válido"
    )
    .optional()
    .or(z.literal("")),

  metodo_pago: z.enum(["efectivo", "transferencia", "tarjeta", "seguro", "pago_movil", "pendiente"], {
    message: "Método de pago inválido",
  }),

  enviar_recordatorio: z.boolean().default(true),

  // Campos avanzados
  diagnostico_preliminar: z.string().optional().or(z.literal("")).default(""),
  antecedentes_relevantes: z.string().optional().or(z.literal("")).default(""),
  medicamentos_actuales: z.string().optional().or(z.literal("")).default(""),
  alergias: z.string().optional().or(z.literal("")).default(""),
  notas_clinicas: z.string().optional().or(z.literal("")).default(""),
});

/**
 * Schema completo con validación de fecha/hora combinada
 * El hook se encarga de la validación de conflictos
 */
export const appointmentSchema = baseAppointmentSchema.refine((data) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  if (data.fecha === todayStr) {
    const [hours, minutes] = data.hora.split(":").map(Number);
    const selectedTime = new Date(now);
    selectedTime.setHours(hours, minutes, 0, 0);

    return selectedTime > new Date(now.getTime() - 60000);
  }
  return true;
}, {
  message: "La hora seleccionada ya pasó",
  path: ["hora"],
});

// Schema solo para modo simple (sin campos avanzados)
export const appointmentSchemaSimple = baseAppointmentSchema
  .omit({
    diagnostico_preliminar: true,
    antecedentes_relevantes: true,
    medicamentos_actuales: true,
    alergias: true,
    notas_clinicas: true,
  })
  .refine((data) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (data.fecha === todayStr) {
      const [hours, minutes] = data.hora.split(":").map(Number);
      const selectedTime = new Date(now);
      selectedTime.setHours(hours, minutes, 0, 0);

      return selectedTime > new Date(now.getTime() - 60000);
    }
    return true;
  }, {
    message: "La hora seleccionada ya pasó",
    path: ["hora"],
  });

export type AppointmentFormValues = z.input<typeof baseAppointmentSchema>;
export type AppointmentFormSimpleValues = z.input<typeof appointmentSchemaSimple>;
