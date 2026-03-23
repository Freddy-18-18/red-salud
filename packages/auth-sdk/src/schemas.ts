import { z } from 'zod';

export const authSchemas = {
  login: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
  }),

  register: z.object({
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    fullName: z.string().min(2, 'Nombre muy corto').max(100, 'Nombre muy largo'),
    role: z.enum([
      'paciente',
      'medico',
      'secretaria',
      'farmacia',
      'laboratorio',
      'clinica',
      'seguro',
      'ambulancia',
    ]),
  }),

  resetPassword: z.object({
    email: z.string().email('Email inválido'),
  }),

  updatePassword: z.object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
  }),
} as const;
