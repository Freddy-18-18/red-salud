"use client";

import {
  Trash2,
  ExternalLink,
  Check,
} from "lucide-react";

import { getNotificationConfig } from "./notification-type-config";
import type { AppNotification } from "@/lib/services/notification-service";

// ─── Props ───────────────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  /** Whether this card is selected for bulk actions. */
  selected?: boolean;
  /** Callback when selection checkbox toggled. */
  onToggleSelect?: (id: string) => void;
  /** Show selection checkbox. */
  showSelect?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  selected = false,
  onToggleSelect,
  showSelect = false,
}: NotificationCardProps) {
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const actionLabel = notification.action_label || config.actionLabel;
  const actionUrl = notification.action_url;

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`relative group flex gap-3 p-3.5 rounded-xl transition-all duration-200 ${
        notification.is_read
          ? "bg-white hover:bg-gray-50"
          : "bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50/80"
      }`}
    >
      {/* Unread indicator bar */}
      {!notification.is_read && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-emerald-500 rounded-full" />
      )}

      {/* Selection checkbox */}
      {showSelect && (
        <div className="flex items-center flex-shrink-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(notification.id)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            aria-label={`Seleccionar: ${notification.title}`}
          />
        </div>
      )}

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center cursor-pointer`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
      >
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }}
          >
            <p
              className={`text-sm leading-snug ${
                notification.is_read
                  ? "text-gray-700"
                  : "text-gray-900 font-medium"
              }`}
            >
              {notification.title}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
            <span className="text-[11px] text-gray-400">
              {formatTime(notification.created_at)}
            </span>
          </div>
        </div>

        {notification.body && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-2">
          {/* Primary action button — type-specific */}
          {actionUrl && (
            <a
              href={actionUrl}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {actionLabel}
            </a>
          )}

          {/* Mark as read (only if unread and no action URL) */}
          {!notification.is_read && !actionUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Check className="h-3 w-3" />
              Marcar como leida
            </button>
          )}

          {/* Delete — shows on hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="ml-auto p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
            aria-label="Eliminar notificacion"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
