/**
 * @file task-constants.ts
 * @description Constantes y configuración para el widget de tareas.
 *
 * @module Dashboard/Widgets/Tasks
 */

import type { TaskPriority } from "@red-salud/types";
import {
  Clock,
  AlertCircle,
  AlertTriangle,
  Zap,
  LucideIcon,
} from "lucide-react";

/** Configuración de prioridades con iconos distintivos */
export const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColor: string;
    hoverBg: string;
    icon: LucideIcon;
    description: string;
  }
> = {
  low: {
    label: "Baja",
    shortLabel: "Baja",
    color: "text-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    hoverBg: "hover:bg-slate-200 dark:hover:bg-slate-700",
    icon: Clock,
    description: "Sin prisa",
  },
  medium: {
    label: "Media",
    shortLabel: "Media",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    hoverBg: "hover:bg-blue-200 dark:hover:bg-blue-800",
    icon: AlertCircle,
    description: "Normal",
  },
  high: {
    label: "Alta",
    shortLabel: "Alta",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
    hoverBg: "hover:bg-orange-200 dark:hover:bg-orange-800",
    icon: AlertTriangle,
    description: "Importante",
  },
  urgent: {
    label: "Urgente",
    shortLabel: "Urgente",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/50",
    hoverBg: "hover:bg-red-200 dark:hover:bg-red-800",
    icon: Zap,
    description: "¡Ahora!",
  },
};
