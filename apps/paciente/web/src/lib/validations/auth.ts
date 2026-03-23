import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email valido'),
  password: z
    .string()
    .min(1, 'La contrasena es requerida'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, 'El nombre solo puede contener letras'),
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Ingresa un email valido'),
    password: z
      .string()
      .min(8, 'La contrasena debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
      .regex(/[a-z]/, 'Debe contener al menos una minuscula')
      .regex(/[0-9]/, 'Debe contener al menos un numero'),
    confirmPassword: z
      .string()
      .min(1, 'Confirma tu contrasena'),
    phone: z
      .string()
      .regex(/^\+58\s?(4\d{2})\s?(\d{3})\s?(\d{4})$/, 'Formato: +58 412 123 4567')
      .or(z.literal('')),
    date_of_birth: z
      .string()
      .min(1, 'La fecha de nacimiento es requerida')
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 18 && age <= 120;
      }, 'Debes ser mayor de 18 anos'),
    gender: z.enum(['masculino', 'femenino', 'otro', ''], {
      errorMap: () => ({ message: 'Selecciona tu genero' }),
    }),
    state: z.string().min(1, 'Selecciona tu estado'),
    city: z.string().min(1, 'Selecciona tu ciudad'),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'Debes aceptar los terminos y condiciones'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email valido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Password strength calculator
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Debil', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Regular', color: 'bg-orange-500' };
  if (score <= 4) return { score, label: 'Buena', color: 'bg-yellow-500' };
  if (score <= 5) return { score, label: 'Fuerte', color: 'bg-emerald-500' };
  return { score, label: 'Muy fuerte', color: 'bg-emerald-600' };
}
