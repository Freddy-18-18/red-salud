"use client";

import type { AppNotification } from "@/lib/services/notification-service";
import { groupNotificationsByDate } from "@/hooks/use-notifications";
import { NotificationCard } from "./notification-card";
import { Loader2, BellOff } from "lucide-react";

interface NotificationListProps {
  notifications: AppNotification[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationList({
  notifications,
  loading,
  hasMore,
  onLoadMore,
  onMarkAsRead,
  onDelete,
}: NotificationListProps) {
  if (!loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <BellOff className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Sin notificaciones</p>
        <p className="text-sm text-gray-400 mt-1">
          Cuando haya novedades, aparecerán aqui
        </p>
      </div>
    );
  }

  const groups = groupNotificationsByDate(notifications);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
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
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
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

      {/* Initial loading state */}
      {loading && notifications.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <div className="w-10 h-10 rounded-full skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-3 w-1/2 skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
