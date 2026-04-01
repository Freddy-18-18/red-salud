"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";

import { NotificationFilters } from "@/components/notifications/notification-filters";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationPreferences } from "@/components/notifications/notification-preferences";
import { PushPermissionPrompt } from "@/components/notifications/push-permission-prompt";
import { useNotifications } from "@/hooks/use-notifications";
import { supabase } from "@/lib/supabase/client";

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
    unreadOnly,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    changeFilter,
    toggleUnreadOnly,
  } = useNotifications({ patientId: userId });

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Notificaciones
            </h1>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} sin leer
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Marcar todas como leidas</span>
            <span className="sm:hidden">Leer todas</span>
          </button>
        )}
      </div>

      {/* Preferences (collapsible) */}
      <NotificationPreferences />

      {/* Filters */}
      <NotificationFilters
        activeFilter={filter}
        onFilterChange={changeFilter}
        unreadOnly={unreadOnly}
        onUnreadOnlyChange={toggleUnreadOnly}
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
