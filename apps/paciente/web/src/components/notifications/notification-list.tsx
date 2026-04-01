"use client";

import { BellOff, Loader2, Bell, CalendarCheck, MessageCircle, FlaskConical } from "lucide-react";

import { NotificationCard } from "./notification-card";

import { groupNotificationsByDate } from "@/hooks/use-notifications";
import type { AppNotification } from "@/lib/services/notification-service";

interface NotificationListProps {
  notifications: AppNotification[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {/* Illustration */}
      <div className="relative mb-6">
        {/* Background ring */}
        <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
        {/* Floating mini-icons */}
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center animate-float">
          <CalendarCheck className="h-4 w-4 text-blue-400 dark:text-blue-500" />
        </div>
        <div className="absolute -bottom-1 -left-2 w-7 h-7 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center animate-float delay-200">
          <MessageCircle className="h-3.5 w-3.5 text-green-400 dark:text-green-500" />
        </div>
        <div className="absolute top-1 -left-3 w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center animate-float delay-400">
          <FlaskConical className="h-3 w-3 text-purple-400 dark:text-purple-500" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
        No tenes notificaciones
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs leading-relaxed">
        Las notificaciones de citas, mensajes y resultados de laboratorio aparecerán aca.
      </p>
    </div>
  );
}

function FilterEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center mb-4">
        <BellOff className="h-7 w-7 text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Sin resultados
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        No hay notificaciones con este filtro
      </p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3.5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 skeleton" />
            <div className="h-3 w-1/2 skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationList({
  notifications,
  loading,
  hasMore,
  onLoadMore,
  onMarkAsRead,
  onDelete,
}: NotificationListProps) {
  // Initial loading
  if (loading && notifications.length === 0) {
    return <SkeletonList />;
  }

  // Truly empty — no notifications at all
  if (!loading && notifications.length === 0) {
    return <EmptyState />;
  }

  const groups = groupNotificationsByDate(notifications);

  // Filter returned empty (notifications exist but filter excludes all)
  if (groups.length === 0 && !loading) {
    return <FilterEmptyState />;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
            {group.label}
          </h3>
          <div className="space-y-1">
            {group.items.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar mas"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
