import {
  CalendarCheck,
  CalendarX,
  Clock,
  FlaskConical,
  Pill,
  MessageCircle,
  HeartPulse,
  Tag,
  ClipboardCheck,
  Star,
  Trophy,
  Shield,
  Siren,
  Users,
  Info,
  type LucideIcon,
} from "lucide-react";

import type { NotificationType } from "@/lib/services/notification-service";

// ─── Type Configuration ──────────────────────────────────────────────────────

export interface NotificationTypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
  /** Default action label for this notification type */
  actionLabel: string;
}

const TYPE_CONFIG: Record<string, NotificationTypeConfig> = {
  // --- New granular types ---
  appointment_confirmed: {
    icon: CalendarCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Cita confirmada",
    actionLabel: "Ver cita",
  },
  appointment_cancelled: {
    icon: CalendarX,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Cita cancelada",
    actionLabel: "Ver detalle",
  },
  appointment_reminder: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Recordatorio de cita",
    actionLabel: "Ver cita",
  },
  lab_results_ready: {
    icon: FlaskConical,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Resultados listos",
    actionLabel: "Ver resultados",
  },
  prescription_expiring: {
    icon: Pill,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Receta por vencer",
    actionLabel: "Ver receta",
  },
  message_received: {
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Mensaje recibido",
    actionLabel: "Abrir chat",
  },
  chronic_alert: {
    icon: HeartPulse,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    label: "Alerta cronica",
    actionLabel: "Registrar lectura",
  },
  price_alert: {
    icon: Tag,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: "Alerta de precio",
    actionLabel: "Ver precio",
  },
  follow_up_due: {
    icon: ClipboardCheck,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    label: "Seguimiento pendiente",
    actionLabel: "Ver seguimiento",
  },
  rating_requested: {
    icon: Star,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    label: "Valoracion solicitada",
    actionLabel: "Valorar",
  },

  // --- Legacy compatibility types ---
  appointment: {
    icon: CalendarCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Cita",
    actionLabel: "Ver cita",
  },
  medication: {
    icon: Pill,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Medicamento",
    actionLabel: "Ver receta",
  },
  lab_result: {
    icon: FlaskConical,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Laboratorio",
    actionLabel: "Ver resultados",
  },
  message: {
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Mensaje",
    actionLabel: "Abrir chat",
  },
  reward: {
    icon: Trophy,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: "Recompensa",
    actionLabel: "Ver detalle",
  },
  insurance: {
    icon: Shield,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    label: "Seguro",
    actionLabel: "Ver detalle",
  },
  emergency: {
    icon: Siren,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Emergencia",
    actionLabel: "Ver detalle",
  },
  community: {
    icon: Users,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    label: "Comunidad",
    actionLabel: "Ver detalle",
  },
  system: {
    icon: Info,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    label: "Sistema",
    actionLabel: "Ver detalle",
  },
};

const FALLBACK_CONFIG: NotificationTypeConfig = {
  icon: Info,
  color: "text-gray-600",
  bgColor: "bg-gray-100",
  label: "Notificacion",
  actionLabel: "Ver detalle",
};

/**
 * Get the display configuration for a notification type.
 */
export function getNotificationConfig(
  type: NotificationType | string,
): NotificationTypeConfig {
  return TYPE_CONFIG[type] ?? FALLBACK_CONFIG;
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

export interface NotificationFilterTab {
  label: string;
  value: string | undefined;
  icon: LucideIcon;
}

export const NOTIFICATION_FILTER_TABS: NotificationFilterTab[] = [
  { label: "Todas", value: undefined, icon: Info },
  { label: "Citas", value: "appointment", icon: CalendarCheck },
  { label: "Lab", value: "lab_result", icon: FlaskConical },
  { label: "Recetas", value: "medication", icon: Pill },
  { label: "Mensajes", value: "message", icon: MessageCircle },
  { label: "Alertas", value: "chronic_alert", icon: HeartPulse },
];
