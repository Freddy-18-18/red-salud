/**
 * @file estadisticas-mega-menu-config.tsx
 * @description Configuración del mega menú para la página de estadísticas
 * @module Dashboard/Medico/Estadisticas
 */

import {
  BarChart3,
  Users,
  Activity,
  DollarSign,
  Clock,
  FlaskConical,
  TrendingUp,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export interface MegaMenuItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface MegaMenuSection {
  id: string;
  label: string;
  icon: LucideIcon;
  items: MegaMenuItem[];
}

/**
 * Configuración del mega menú de estadísticas
 * Organizado en una sola sección con todos los tabs
 */
export const ESTADISTICAS_MEGA_MENU: MegaMenuSection[] = [
  {
    id: "estadisticas",
    label: "Estadísticas",
    icon: BarChart3,
    items: [
      {
        id: "resumen",
        label: "Resumen",
        description: "Vista general",
        icon: BarChart3,
      },
      {
        id: "pacientes",
        label: "Pacientes",
        description: "Demografía",
        icon: Users,
      },
      {
        id: "enfermedades",
        label: "Enfermedades",
        description: "Epidemiología",
        icon: Activity,
      },
      {
        id: "finanzas",
        label: "Finanzas",
        description: "Ingresos",
        icon: DollarSign,
      },
      {
        id: "patrones",
        label: "Patrones",
        description: "Temporales",
        icon: Clock,
      },
      {
        id: "laboratorio",
        label: "Laboratorio",
        description: "Análisis",
        icon: FlaskConical,
      },
      {
        id: "eficiencia",
        label: "Eficiencia",
        description: "Operativa",
        icon: TrendingUp,
      },
      {
        id: "brotes",
        label: "Brotes",
        description: "Detección",
        icon: AlertTriangle,
      },
    ],
  },
];
