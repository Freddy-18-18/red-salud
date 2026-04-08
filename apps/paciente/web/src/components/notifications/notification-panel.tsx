"use client";

import {
  Bell,
  CalendarCheck,
  CheckCheck,
  FlaskConical,
  Loader2,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/use-notifications";
import { getNotificationConfig } from "./notification-type-config";
import type { AppNotification } from "@/lib/services/notification-service";

interface NotificationPanelProps {
  onClose: () => void;
}

function formatTimeAgo(dateStr: string): string {
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

function PanelNotificationItem({
  notification,
  onMarkRead,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        !notification.is_read ? "bg-emerald-50/40" : ""
      }`}
    >
      {/* Left accent for unread */}
      {!notification.is_read && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-500 rounded-full" />
      )}

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full ${config.bgColor} flex items-center justify-center`}
      >
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug line-clamp-1 ${
            !notification.is_read
              ? "text-gray-900 font-medium"
              : "text-gray-700"
          }`}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {notification.body}
          </p>
        )}
      </div>

      {/* Time + unread dot */}
      <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
        <span className="text-[11px] text-gray-400 whitespace-nowrap">
          {formatTimeAgo(notification.created_at)}
        </span>
      </div>
    </button>
  );
}

function PanelEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
          <Bell className="h-7 w-7 text-gray-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
          <CalendarCheck className="h-3 w-3 text-blue-400" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
          <MessageCircle className="h-2.5 w-2.5 text-green-400" />
        </div>
        <div className="absolute top-0 -left-2 w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center">
          <FlaskConical className="h-2.5 w-2.5 text-purple-400" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700">
        Sin notificaciones
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Tus alertas de citas, resultados y mensajes apareceran aca.
      </p>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-gray-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5 py-0.5">
            <div className="h-3.5 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-50 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
  } = useNotifications({ pageSize: 5 });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkRead = (id: string) => {
    markAsRead.mutate([id]);
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Notificaciones
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending}
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Marcar todas como leidas
          </button>
        )}
      </div>

      {/* Notification items */}
      <div className="max-h-[360px] overflow-y-auto">
        {isLoading ? (
          <PanelSkeleton />
        ) : recentNotifications.length === 0 ? (
          <PanelEmptyState />
        ) : (
          <div className="divide-y divide-gray-50">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="relative">
                <PanelNotificationItem
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2.5">
        <a
          href="/dashboard/notificaciones"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors py-1"
        >
          Ver todas las notificaciones
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
