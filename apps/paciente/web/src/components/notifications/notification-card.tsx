"use client";

import {
  Pill,
  CalendarCheck,
  FlaskConical,
  MessageCircle,
  Trophy,
  Shield,
  Siren,
  Users,
  Info,
  Trash2,
  ExternalLink,
} from "lucide-react";

import type { AppNotification, NotificationType } from "@/lib/services/notification-service";

interface NotificationCardProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Pill; color: string; bgColor: string; darkBgColor: string; darkColor: string }
> = {
  appointment: {
    icon: CalendarCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    darkColor: "dark:text-blue-400",
    darkBgColor: "dark:bg-blue-950/40",
  },
  message: {
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    darkColor: "dark:text-green-400",
    darkBgColor: "dark:bg-green-950/40",
  },
  lab_result: {
    icon: FlaskConical,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    darkColor: "dark:text-purple-400",
    darkBgColor: "dark:bg-purple-950/40",
  },
  medication: {
    icon: Pill,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    darkColor: "dark:text-orange-400",
    darkBgColor: "dark:bg-orange-950/40",
  },
  reward: {
    icon: Trophy,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    darkColor: "dark:text-amber-400",
    darkBgColor: "dark:bg-amber-950/40",
  },
  insurance: {
    icon: Shield,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    darkColor: "dark:text-indigo-400",
    darkBgColor: "dark:bg-indigo-950/40",
  },
  emergency: {
    icon: Siren,
    color: "text-red-600",
    bgColor: "bg-red-50",
    darkColor: "dark:text-red-400",
    darkBgColor: "dark:bg-red-950/40",
  },
  community: {
    icon: Users,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    darkColor: "dark:text-teal-400",
    darkBgColor: "dark:bg-teal-950/40",
  },
  system: {
    icon: Info,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    darkColor: "dark:text-gray-400",
    darkBgColor: "dark:bg-gray-800",
  },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHour < 24) return `hace ${diffHour}h`;
  if (diffDay === 1) return "ayer";
  if (diffDay < 7) return `hace ${diffDay}d`;

  return date.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`relative group flex gap-3 p-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
        notification.is_read
          ? "bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-800/60"
          : "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30"
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      {/* Unread indicator bar */}
      {!notification.is_read && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-emerald-500 rounded-full" />
      )}

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} ${config.darkBgColor} flex items-center justify-center`}
      >
        <Icon className={`h-5 w-5 ${config.color} ${config.darkColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              notification.is_read
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-900 dark:text-white font-medium"
            }`}
          >
            {notification.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {formatTime(notification.created_at)}
            </span>
          </div>
        </div>

        {notification.body && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-2">
          {notification.action_url && (
            <a
              href={notification.action_url}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {notification.action_label || "Ver detalle"}
            </a>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="ml-auto p-1 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 dark:hover:text-red-400 transition-all"
            aria-label="Eliminar notificacion"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
