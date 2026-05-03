"use client";

import { Bell, CheckCheck, Inbox, Settings2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

  // Quick stats for the hero header. We compute against the currently loaded
  // page so they stay accurate against whatever filter is active; the unread
  // total comes from the server-side count exposed by the hook.
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = notifications.filter(
      (n) => new Date(n.created_at).getTime() >= today.getTime()
    ).length;
    return { total: notifications.length, today: todayCount };
  }, [notifications]);

  const showHeaderActions =
    activeTab === "notifications" && unreadCount > 0;

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 sm:p-6 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-[hsl(var(--card))]">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-700/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-teal-200/20 blur-3xl dark:bg-teal-700/10"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <Bell className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                Notificaciones
              </h1>
              <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                {activeTab === "preferences"
                  ? "Configura como y cuando queres recibir cada tipo de aviso"
                  : unreadCount > 0
                    ? `Tenes ${unreadCount} ${unreadCount === 1 ? "alerta sin leer" : "alertas sin leer"} pendientes`
                    : "Estas al dia con todas tus alertas"}
              </p>
            </div>
          </div>

          {showHeaderActions && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-800 dark:bg-[hsl(var(--card))] dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Marcar todas como leidas</span>
              <span className="sm:hidden">Leer todas</span>
            </button>
          )}
        </div>

        {/* Stat chips */}
        {activeTab === "notifications" && (
          <div className="relative mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <StatChip
              icon={<Inbox className="h-4 w-4" />}
              label="Sin leer"
              value={unreadCount}
              tone="emerald"
            />
            <StatChip
              icon={<Sparkles className="h-4 w-4" />}
              label="Hoy"
              value={stats.today}
              tone="amber"
            />
            <StatChip
              icon={<Bell className="h-4 w-4" />}
              label="Total"
              value={stats.total}
              tone="slate"
            />
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-[hsl(var(--muted))]">
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "notifications"
              ? "bg-white text-gray-900 shadow-sm dark:bg-[hsl(var(--card))] dark:text-[hsl(var(--foreground))]"
              : "text-gray-500 hover:text-gray-700 dark:text-[hsl(var(--muted-foreground))] dark:hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notificaciones
          {unreadCount > 0 && (
            <span className="min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preferences"
              ? "bg-white text-gray-900 shadow-sm dark:bg-[hsl(var(--card))] dark:text-[hsl(var(--foreground))]"
              : "text-gray-500 hover:text-gray-700 dark:text-[hsl(var(--muted-foreground))] dark:hover:text-[hsl(var(--foreground))]"
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

// ─── StatChip ────────────────────────────────────────────────────────────────

type ChipTone = "emerald" | "amber" | "slate";

function StatChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: ChipTone;
}) {
  const tones: Record<ChipTone, { bg: string; ring: string; text: string; iconBg: string }> = {
    emerald: {
      bg: "bg-white dark:bg-[hsl(var(--card))]",
      ring: "ring-emerald-100 dark:ring-emerald-900/40",
      text: "text-emerald-700 dark:text-emerald-300",
      iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    amber: {
      bg: "bg-white dark:bg-[hsl(var(--card))]",
      ring: "ring-amber-100 dark:ring-amber-900/40",
      text: "text-amber-700 dark:text-amber-300",
      iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    slate: {
      bg: "bg-white dark:bg-[hsl(var(--card))]",
      ring: "ring-slate-200 dark:ring-slate-800",
      text: "text-slate-700 dark:text-slate-200",
      iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
  };
  const s = tones[tone];

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ring-1 ring-inset shadow-sm ${s.bg} ${s.ring}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.iconBg}`}
      >
        {icon}
      </div>
      <div className="min-w-0 leading-tight">
        <p className={`text-lg font-bold tabular-nums ${s.text}`}>{value}</p>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          {label}
        </p>
      </div>
    </div>
  );
}
