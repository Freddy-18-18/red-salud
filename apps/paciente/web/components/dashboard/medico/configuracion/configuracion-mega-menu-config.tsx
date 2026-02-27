/**
 * @file configuracion-mega-menu-config.tsx
 * @description Configuración del mega menú para la página de configuración del médico.
 * Define las secciones y items de navegación del menú de configuración.
 * @module Dashboard/Medico/Configuracion
 */

import {
  User,
  Briefcase,
  FileText,
  MapPin,
  Clock,
  Users,
  Bell,
  Palette,
  Keyboard,
  Shield,
  Eye,
  Activity,
  CreditCard,
  Settings,
  Calendar,
} from "lucide-react";

/**
 * Tipo para un item individual del mega menú
 */
export interface MegaMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href?: string;
}

/**
 * Tipo para una sección del mega menú
 */
export interface MegaMenuSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MegaMenuItem[];
}

/**
 * Configuración completa del mega menú de configuración
 * Organizada en 4 secciones principales con sus sub-items
 */
export const CONFIGURACION_MEGA_MENU: MegaMenuSection[] = [
  {
    id: "perfil",
    label: "Mi Perfil",
    icon: User,
    items: [
      {
        id: "perfil",
        label: "Perfil Básico",
        icon: User,
        description: "Datos personales",
      },
      {
        id: "info-profesional",
        label: "Info. Profesional",
        icon: Briefcase,
        description: "Bio y certificados",
      },
      {
        id: "documentos",
        label: "Documentos",
        icon: FileText,
        description: "Verificación",
      },
    ],
  },
  {
    id: "consultorio",
    label: "Consultorio",
    icon: MapPin,
    items: [
      {
        id: "consultorios",
        label: "Consultorios",
        icon: MapPin,
        description: "Ubicaciones",
      },
      {
        id: "horarios",
        label: "Horarios",
        icon: Clock,
        description: "Atención",
      },
      {
        id: "integraciones",
        label: "Integraciones",
        icon: Calendar,
        description: "Google Calendar",
      },
      {
        id: "secretarias",
        label: "Secretarias",
        icon: Users,
        description: "Equipo",
      },
      {
        id: "configuracion-recetas",
        label: "Recetas",
        icon: Settings,
        description: "Diseño y datos",
        href: "/dashboard/medico/recetas/configuracion"
      },
    ],
  },
  /* 
  // Removed separate Recetas section as per user request
  {
    id: "recetas",
    label: "Recetas",
    icon: FileText,
    items: [
      {
        id: "configuracion-recetas",
        label: "Configuración",
        icon: Settings,
        description: "Diseño y datos",
        href: "/dashboard/medico/recetas/configuracion"
      },
    ]
  }, 
  */

  {
    id: "sistema",
    label: "Sistema",
    icon: Settings,
    items: [
      {
        id: "notificaciones",
        label: "Notificaciones",
        icon: Bell,
        description: "Alertas",
      },
      {
        id: "preferencias",
        label: "Preferencias",
        icon: Palette,
        description: "Tema e idioma",
      },
      {
        id: "shortcuts",
        label: "Atajos",
        icon: Keyboard,
        description: "Teclas rápidas",
      },
    ],
  },
  {
    id: "cuenta",
    label: "Cuenta",
    icon: Shield,
    items: [
      {
        id: "seguridad",
        label: "Seguridad",
        icon: Shield,
        description: "Cuenta",
      },
      {
        id: "privacidad",
        label: "Privacidad",
        icon: Eye,
        description: "Datos",
      },
      {
        id: "actividad",
        label: "Actividad",
        icon: Activity,
        description: "Historial",
      },
      {
        id: "facturacion",
        label: "Facturación",
        icon: CreditCard,
        description: "Pagos",
      },
    ],
  },
];
