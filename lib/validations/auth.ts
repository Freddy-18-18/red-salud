import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre es demasiado largo")
      .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "El nombre solo puede contener letras"),
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Correo electrónico inválido")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña es demasiado larga")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo electrónico inválido")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "La contraseña es requerida"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
