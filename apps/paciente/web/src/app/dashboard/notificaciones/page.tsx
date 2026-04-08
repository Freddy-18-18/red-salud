"use client";

import { Bell, CheckCheck, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

import { NotificationFilters } from "@/components/notifications/notification-filters";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationPreferences } from "@/components/notifications/notification-preferences";
import { PushPermissionPrompt } from "@/components/notifications/push-permission-prompt";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
} from "@/hooks/use-notifications";
import { supabase } from "@/lib/supabase/client";

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = "notifications" | "preferences";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificacionesPage() {
  const [userId, setUserId] = useState<string>();
  const [activeTab, setActiveTab] = useState<Tab>("notifications");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const {
    notifications,
    unreadCount,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotifications({
    type: typeFilter,
    unreadOnly,
    pageSize: 20,
    enabled: activeTab === "notifications",
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const dismissNotification = useDismissNotification();

  const handleMarkAsRead = (ids: string[]) => {
    markAsRead.mutate(ids);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (id: string) => {
    dismissNotification.mutate(id);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Bell className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Notificaciones
            </h1>
            {unreadCount > 0 && activeTab === "notifications" && (
              <p className="text-xs text-gray-500">
                {unreadCount} sin leer
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && activeTab === "notifications" && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Marcar todas como leidas</span>
            <span className="sm:hidden">Leer todas</span>
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "notifications"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notificaciones
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "preferences"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Settings2 className="h-4 w-4" />
          Preferencias
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "notifications" && (
        <>
          {/* Filters */}
          <NotificationFilters
            activeFilter={typeFilter}
            onFilterChange={setTypeFilter}
            unreadOnly={unreadOnly}
            onUnreadOnlyChange={setUnreadOnly}
          />

          {/* List */}
          <NotificationList
            notifications={notifications}
            loading={isLoading}
            loadingMore={isFetchingNextPage}
            hasMore={hasNextPage}
            onLoadMore={() => fetchNextPage()}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </>
      )}

      {activeTab === "preferences" && <NotificationPreferences />}

      {/* Push permission prompt */}
      {userId && <PushPermissionPrompt patientId={userId} />}
    </div>
  );
}
