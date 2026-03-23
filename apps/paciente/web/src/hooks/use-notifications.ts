import { useState, useEffect, useCallback, useRef } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNewNotifications,
  type AppNotification,
  type NotificationType,
} from "@/lib/services/notification-service";

interface UseNotificationsOptions {
  patientId: string | undefined;
  /** Auto-fetch on mount. Defaults to true. */
  autoFetch?: boolean;
}

export function useNotifications({ patientId, autoFetch = true }: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<NotificationType | undefined>(undefined);
  const pageRef = useRef(0);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(
    async (reset = true) => {
      if (!patientId) return;

      setLoading(true);
      const page = reset ? 0 : pageRef.current + 1;

      const result = await getNotifications(patientId, filter, page);

      if (result.success) {
        if (reset) {
          setNotifications(result.data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...result.data.notifications]);
        }
        setTotal(result.data.total);
        setHasMore(result.data.has_more);
        pageRef.current = page;
      }

      setLoading(false);
    },
    [patientId, filter],
  );

  const refreshUnreadCount = useCallback(async () => {
    if (!patientId) return;
    const result = await getUnreadCount(patientId);
    if (result.success) setUnreadCount(result.data);
  }, [patientId]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      const result = await markAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    },
    [],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (!patientId) return;
    const result = await markAllAsRead(patientId);
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }, [patientId]);

  const handleDelete = useCallback(async (notificationId: string) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setTotal((t) => t - 1);
    }
  }, []);

  const loadMore = useCallback(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  const changeFilter = useCallback((f: NotificationType | undefined) => {
    setFilter(f);
    pageRef.current = 0;
  }, []);

  // ── Effects ──────────────────────────────────────────────────────────────

  // Fetch when filter or patientId changes
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications(true);
      refreshUnreadCount();
    }
  }, [autoFetch, fetchNotifications, refreshUnreadCount]);

  // Realtime subscription
  useEffect(() => {
    if (!patientId) return;

    const unsub = subscribeToNewNotifications(patientId, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setTotal((t) => t + 1);
      if (!newNotif.is_read) {
        setUnreadCount((c) => c + 1);
      }
    });

    return unsub;
  }, [patientId]);

  return {
    notifications,
    unreadCount,
    total,
    hasMore,
    loading,
    filter,

    fetchNotifications,
    refreshUnreadCount,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    loadMore,
    changeFilter,
  };
}

// ── Grouped helpers ────────────────────────────────────────────────────────

export function groupNotificationsByDate(notifications: AppNotification[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { label: string; items: AppNotification[] }[] = [
    { label: "Hoy", items: [] },
    { label: "Esta semana", items: [] },
    { label: "Mas antiguas", items: [] },
  ];

  for (const n of notifications) {
    const date = new Date(n.created_at);
    if (date >= today) {
      groups[0].items.push(n);
    } else if (date >= weekAgo) {
      groups[1].items.push(n);
    } else {
      groups[2].items.push(n);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}
