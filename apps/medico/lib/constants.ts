/**
 * Constantes globales de la App Médico
 * 
 * Esta app es exclusiva para el rol "medico".
 * Las rutas públicas (blog, precios, servicios) viven en el Portal Público.
 */

export const APP_NAME = "Red-Salud";
export const APP_DESCRIPTION = "Plataforma integral de servicios de salud";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// Rutas internas de la App Médico
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  REGISTER_MEDICO: "/register",
  DASHBOARD: "/consultorio",
  CONSULTORIO: "/consultorio",
  PERFIL_SETUP: "/consultorio/perfil/setup",
  TERMINOS: "/terminos",
  PRIVACIDAD: "/privacidad",
  // Red Salud Academy (dentro de la App Médico)
  ACADEMY: "/academy",
  ACADEMY_ESPECIALIDADES: "/academy/especialidades",
  ACADEMY_PRICING: "/academy/pricing",
} as const;

export const SOCIAL_LINKS = {
  FACEBOOK: "#",
  TWITTER: "#",
  INSTAGRAM: "#",
  LINKEDIN: "#",
} as const;

export const CONTACT_INFO = {
  EMAIL: "contacto@red-salud.com",
  PHONE: "+1 (555) 123-4567",
  ADDRESS: "123 Av. Principal, Ciudad, País",
} as const;

// Rutas de autenticación
export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CALLBACK: "/callback",
} as const;

// Rol único de esta app
export const APP_ROLE = "medico" as const;
export type UserRole = "medico";

// Configuración del rol médico
export const ROLE_CONFIG = {
  medico: {
    label: "Médico",
    description: "Atiende pacientes y gestiona consultas",
    icon: "Stethoscope",
    dashboardPath: "/dashboard/medico",
  },
} as const;

// Legacy — mantenido por compatibilidad con componentes existentes
export const USER_ROLES = {
  MEDICO: "medico",
} as const;

// Configuración de módulos de paciente (para compatibilidad)
export const PATIENT_MODULE_CONFIG = {} as Record<string, { label: string; icon: string; route: string; color?: string }>;
