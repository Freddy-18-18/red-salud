"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { PushPermissionPrompt } from "@/components/notifications/push-permission-prompt";

export default function NotificacionesPage() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    filter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    changeFilter,
  } = useNotifications({ patientId: userId });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500">
                {unreadCount} sin leer
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leidas
          </button>
        )}
      </div>

      {/* Filters */}
      <NotificationFilters
        activeFilter={filter}
        onFilterChange={changeFilter}
      />

      {/* List */}
      <NotificationList
        notifications={notifications}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />

      {/* Push permission prompt */}
      {userId && <PushPermissionPrompt patientId={userId} />}
    </div>
  );
}
