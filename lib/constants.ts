/**
 * Constantes globales de la aplicación Red-Salud
 */

export const APP_NAME = "Red-Salud";
export const APP_DESCRIPTION = "Plataforma integral de servicios de salud";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ROUTES = {
  HOME: "/",
  SERVICIOS: "/servicios",
  PRECIOS: "/precios",
  NOSOTROS: "/nosotros",
  SOPORTE: "/soporte",
  CONTACTO: "/soporte/contacto",
  BLOG: "/blog",
  FAQ: "/soporte/faq",
  GUIAS: "/soporte/guias",
  ESTADO: "/soporte/estado",
  CHAT: "/soporte/chat",
  AGENDAR_LLAMADA: "/soporte/agendar-llamada",
  TERMINOS: "/terminos",
  PRIVACIDAD: "/privacidad",
  // Red Salud Academy
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

// Tipos de usuario (roles)
export const USER_ROLES = {
  PACIENTE: "paciente",
  MEDICO: "medico",
  FARMACIA: "farmacia",
  LABORATORIO: "laboratorio",
  CLINICA: "clinica",
  ASEGURADORA: "seguro",
  AMBULANCIA: "ambulancia",
  SECRETARIA: "secretaria",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Configuración de roles
export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    description: string;
    icon: string;
    dashboardPath: string;
  }
> = {
  [USER_ROLES.PACIENTE]: {
    label: "Paciente",
    description: "Gestiona tus citas, historial médico y salud",
    icon: "UserCircle",
    dashboardPath: "/dashboard/paciente",
  },
  [USER_ROLES.MEDICO]: {
    label: "Médico",
    description: "Atiende pacientes y gestiona consultas",
    icon: "Stethoscope",
    dashboardPath: "/dashboard/medico",
  },
  [USER_ROLES.FARMACIA]: {
    label: "Farmacia",
    description: "Gestiona recetas y entregas de medicamentos",
    icon: "Pill",
    dashboardPath: "/dashboard/farmacia",
  },
  [USER_ROLES.LABORATORIO]: {
    label: "Laboratorio",
    description: "Procesa exámenes y entrega resultados",
    icon: "FlaskConical",
    dashboardPath: "/dashboard/laboratorio",
  },
  [USER_ROLES.CLINICA]: {
    label: "Clínica",
    description: "Coordina servicios médicos y hospitalización",
    icon: "Hospital",
    dashboardPath: "/dashboard/clinica",
  },
  [USER_ROLES.ASEGURADORA]: {
    label: "Aseguradora",
    description: "Gestiona pólizas y autorizaciones médicas",
    icon: "Shield",
    dashboardPath: "/dashboard/seguro",
  },
  [USER_ROLES.AMBULANCIA]: {
    label: "Ambulancia",
    description: "Coordina traslados y emergencias médicas",
    icon: "Ambulance",
    dashboardPath: "/dashboard/ambulancia",
  },
  [USER_ROLES.SECRETARIA]: {
    label: "Secretaria Médica",
    description: "Gestiona agenda y pacientes del médico",
    icon: "UserCog",
    dashboardPath: "/dashboard/secretaria",
  },
};

// Módulos disponibles para pacientes
export const PATIENT_MODULES = {
  VISTA_GENERAL: "vista_general",
  PERFIL: "perfil",
  CITAS: "citas",
  HISTORIAL: "historial",
  MEDICAMENTOS: "medicamentos",
  METRICAS: "metricas",
  MENSAJERIA: "mensajeria",
  LABORATORIO: "laboratorio",
  TELEMEDICINA: "telemedicina",
  CALIFICACIONES: "calificaciones",
} as const;

export type PatientModule = typeof PATIENT_MODULES[keyof typeof PATIENT_MODULES];

// Configuración de módulos del paciente
export const PATIENT_MODULE_CONFIG: Record<
  PatientModule,
  {
    label: string;
    description: string;
    icon: string;
    route: string;
    color: string;
  }
> = {
  [PATIENT_MODULES.VISTA_GENERAL]: {
    label: "Vista General",
    description: "Panel principal con resumen de salud",
    icon: "LayoutDashboard",
    route: "/dashboard/paciente",
    color: "blue",
  },
  [PATIENT_MODULES.PERFIL]: {
    label: "Mi Perfil",
    description: "Información personal y configuración",
    icon: "User",
    route: "/dashboard/paciente/perfil",
    color: "gray",
  },
  [PATIENT_MODULES.CITAS]: {
    label: "Citas Médicas",
    description: "Agenda y gestiona tus citas",
    icon: "Calendar",
    route: "/dashboard/paciente/citas",
    color: "green",
  },
  [PATIENT_MODULES.HISTORIAL]: {
    label: "Historial Clínico",
    description: "Consulta diagnósticos y tratamientos",
    icon: "FileText",
    route: "/dashboard/paciente/historial",
    color: "purple",
  },
  [PATIENT_MODULES.MEDICAMENTOS]: {
    label: "Medicamentos",
    description: "Recetas y recordatorios de tomas",
    icon: "Pill",
    route: "/dashboard/paciente/medicamentos",
    color: "orange",
  },
  [PATIENT_MODULES.METRICAS]: {
    label: "Métricas de Salud",
    description: "Seguimiento de signos vitales",
    icon: "Activity",
    route: "/dashboard/paciente/metricas",
    color: "red",
  },
  [PATIENT_MODULES.MENSAJERIA]: {
    label: "Mensajes",
    description: "Comunícate con médicos y clínicas",
    icon: "MessageSquare",
    route: "/dashboard/paciente/mensajeria",
    color: "cyan",
  },
  [PATIENT_MODULES.LABORATORIO]: {
    label: "Resultados de Lab",
    description: "Visualiza resultados de exámenes",
    icon: "FlaskConical",
    route: "/dashboard/paciente/laboratorio",
    color: "teal",
  },
  [PATIENT_MODULES.TELEMEDICINA]: {
    label: "Telemedicina",
    description: "Consultas virtuales por video",
    icon: "Video",
    route: "/dashboard/paciente/telemedicina",
    color: "indigo",
  },
  [PATIENT_MODULES.CALIFICACIONES]: {
    label: "Calificaciones",
    description: "Evalúa servicios recibidos",
    icon: "Star",
    route: "/dashboard/paciente/calificaciones",
    color: "yellow",
  },
};
