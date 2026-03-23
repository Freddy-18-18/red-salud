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
  { icon: typeof Pill; color: string; bgColor: string }
> = {
  medication: { icon: Pill, color: "text-blue-600", bgColor: "bg-blue-50" },
  appointment: { icon: CalendarCheck, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  lab_result: { icon: FlaskConical, color: "text-purple-600", bgColor: "bg-purple-50" },
  message: { icon: MessageCircle, color: "text-sky-600", bgColor: "bg-sky-50" },
  reward: { icon: Trophy, color: "text-amber-600", bgColor: "bg-amber-50" },
  insurance: { icon: Shield, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  emergency: { icon: Siren, color: "text-red-600", bgColor: "bg-red-50" },
  community: { icon: Users, color: "text-teal-600", bgColor: "bg-teal-50" },
  system: { icon: Info, color: "text-gray-600", bgColor: "bg-gray-100" },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `hace ${diffMin}min`;
  if (diffHour < 24) return `hace ${diffHour}h`;
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
      className={`flex gap-3 p-3 rounded-xl transition-colors ${
        notification.is_read
          ? "bg-white"
          : "bg-emerald-50/40 border border-emerald-100"
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
      >
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              notification.is_read ? "text-gray-700" : "text-gray-900 font-medium"
            }`}
          >
            {notification.title}
          </p>
          <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">
            {formatTime(notification.created_at)}
          </span>
        </div>

        {notification.body && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-2">
          {notification.action_url && (
            <a
              href={notification.action_url}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
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
            className="ml-auto p-1 text-gray-300 hover:text-red-400 transition-colors"
            aria-label="Eliminar notificacion"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      )}
    </div>
  );
}
