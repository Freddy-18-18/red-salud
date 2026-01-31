/**
 * @file citas-mega-menu-config.tsx
 * @description Configuración del mega menú para la página de citas
 * @module Dashboard/Medico/Citas
 */

import {
  Calendar,
  Building2,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface MegaMenuItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

export interface MegaMenuSection {
  id: string;
  label: string;
  icon: LucideIcon;
  items: MegaMenuItem[];
}

/**
 * Configuración del mega menú de citas
 */
export const CITAS_MEGA_MENU: MegaMenuSection[] = [
  {
    id: "vistas",
    label: "Vistas",
    icon: Calendar,
    items: [
      {
        id: "agenda",
        label: "Agenda",
        description: "Calendario completo",
        icon: Calendar,
        href: "/dashboard/medico/citas",
      },
      {
        id: "estadisticas",
        label: "Estadísticas",
        description: "Análisis de citas",
        icon: BarChart3,
        href: "/dashboard/medico/estadisticas",
      },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    items: [
      {
        id: "consultorios",
        label: "Consultorios",
        description: "Gestionar ubicaciones",
        icon: Building2,
        href: "/dashboard/medico/configuracion?tab=consultorios",
      },
      {
        id: "horarios",
        label: "Horarios",
        description: "Disponibilidad",
        icon: Settings,
        href: "/dashboard/medico/configuracion?tab=horarios",
      },
    ],
  },
];
