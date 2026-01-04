import { z } from "zod";

// Regex patterns
const NOMBRE_REGEX = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
const CEDULA_REGEX = /^[VE]-?\d{6,8}$/i;
const TELEFONO_REGEX = /^\+?58\d{10}$/;

// Profile validation schemas
export const profileSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo")
    .regex(NOMBRE_REGEX, "El nombre solo puede contener letras"),
  
  cedula: z
    .string()
    .regex(CEDULA_REGEX, "Formato de cédula inválido (ej: V-12345678)")
    .optional(),
  
  email: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase(),
  
  telefono: z
    .string()
    .regex(TELEFONO_REGEX, "Formato de teléfono inválido (ej: +584121234567)")
    .optional(),
  
  fecha_nacimiento: z
    .string()
    .or(z.date())
    .optional(),
  
  sexo: z
    .enum(["masculino", "femenino", "otro"])
    .optional(),
  
  tipo_sangre: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  
  direccion: z
    .string()
    .max(200, "La dirección es demasiado larga")
    .optional(),
  
  ciudad: z
    .string()
    .max(100, "El nombre de la ciudad es demasiado largo")
    .optional(),
  
  estado: z
    .string()
    .max(100, "El nombre del estado es demasiado largo")
    .optional(),
  
  codigo_postal: z
    .string()
    .regex(/^\d{4}$/, "El código postal debe tener 4 dígitos")
    .optional(),
});

// Doctor profile validation schema
export const doctorProfileSchema = profileSchema.extend({
  especialidad: z
    .string()
    .min(3, "La especialidad debe tener al menos 3 caracteres")
    .max(100, "La especialidad es demasiado larga")
    .optional(),
  
  mpps: z
    .string()
    .regex(/^\d{6,8}$/, "El número MPPS debe tener entre 6 y 8 dígitos")
    .optional(),
  
  cms: z
    .string()
    .regex(/^\d{6,8}$/, "El número CMS debe tener entre 6 y 8 dígitos")
    .optional(),
  
  anos_experiencia: z
    .number()
    .int("Los años de experiencia deben ser un número entero")
    .min(0, "Los años de experiencia no pueden ser negativos")
    .max(70, "Los años de experiencia no pueden exceder 70")
    .optional(),
  
  biografia: z
    .string()
    .max(1000, "La biografía es demasiado larga")
    .optional(),
  
  idiomas: z
    .array(z.string())
    .optional(),
  
  horario_atencion: z
    .string()
    .max(500, "El horario de atención es demasiado largo")
    .optional(),
});

// Emergency contact validation schema
export const emergencyContactSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo")
    .regex(NOMBRE_REGEX, "El nombre solo puede contener letras"),
  
  relacion: z
    .string()
    .min(2, "La relación debe tener al menos 2 caracteres")
    .max(50, "La relación es demasiado larga"),
  
  telefono: z
    .string()
    .regex(TELEFONO_REGEX, "Formato de teléfono inválido (ej: +584121234567)"),
  
  email: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase()
    .optional(),
});

// Cedula validation schema
export const cedulaValidationSchema = z.object({
  nacionalidad: z.enum(["V", "E"]),
  
  cedula: z
    .string()
    .min(6, "El número de cédula debe tener al menos 6 dígitos")
    .max(8, "El número de cédula debe tener máximo 8 dígitos")
    .regex(/^\d+$/, "El número de cédula solo puede contener dígitos"),
});

// Profile update partial schema (for partial updates)
export const profileUpdateSchema = profileSchema.partial();

// Type exports
export type ProfileFormData = z.infer<typeof profileSchema>;
export type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;
export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;
export type CedulaValidationData = z.infer<typeof cedulaValidationSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
