import { z } from "zod";

export const patientSchema = z.object({
  cedula: z
    .string()
    .min(6, "La cédula debe tener al menos 6 dígitos")
    .regex(/^\d+$/, "La cédula solo debe contener números"),
  nombre_completo: z.string().min(3, "El nombre completo es requerido"),
  fecha_nacimiento: z.string().optional().or(z.literal("")),
  genero: z.enum(["M", "F"]).optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
