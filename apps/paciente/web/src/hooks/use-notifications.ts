import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

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

export function useNotifications({
  patientId,
  autoFetch = true,
}: UseNotificationsOptions) {
  const queryClient = useQueryClient();

  // ── Local state ─────────────────────────────────────────────────────────
  const [accumulated, setAccumulated] = useState<AppNotification[]>([]);
  const pageRef = useRef(0);
  const isLoadMoreRef = useRef(false);
  const [filter, setFilter] = useState<NotificationType | undefined>(undefined);
  const [unreadOnly, setUnreadOnly] = useState(false);

  // ── Queries ─────────────────────────────────────────────────────────────

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["notifications", patientId, filter],
    queryFn: async () => {
      const result = await getNotifications(patientId!, filter, 0);
      if (!result.success)
        throw new Error("Error cargando notificaciones");
      return result.data;
    },
    enabled: autoFetch && !!patientId,
    refetchInterval: 30000,
  });

  // Sync query data → accumulated list
  /* eslint-disable react-hooks/set-state-in-effect -- merging query results into accumulated list */
  useEffect(() => {
    if (isLoadMoreRef.current) {
      isLoadMoreRef.current = false;
      return;
    }
    if (!queryData) return;
    setAccumulated((prev) => {
      // Initial load or after reset: replace
      if (prev.length === 0) return queryData.notifications;
      // Refetch / auto-refresh: dedup and merge
      const existingIds = new Set(prev.map((n) => n.id));
      const newItems = queryData.notifications.filter(
        (n) => !existingIds.has(n.id)
      );
      return newItems.length > 0 ? [...prev, ...newItems] : prev;
    });
  }, [queryData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications-unread", patientId],
    queryFn: async () => {
      const result = await getUnreadCount(patientId!);
      if (!result.success) throw new Error("Error");
      return result.data;
    },
    enabled: !!patientId,
    refetchInterval: 30000,
  });

  const unreadCount = unreadCountData ?? 0;
  const total = queryData?.total ?? 0;
  const hasMore = queryData?.has_more ?? false;

  // ── Filtered view ───────────────────────────────────────────────────────

  const filteredNotifications = useMemo(() => {
    if (!unreadOnly) return accumulated;
    return accumulated.filter((n) => !n.is_read);
  }, [accumulated, unreadOnly]);

  // ── Mutations ───────────────────────────────────────────────────────────

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onMutate: (notificationId) => {
      setAccumulated((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      queryClient.setQueryData<number>(
        ["notifications-unread", patientId],
        (c) => Math.max(0, (c ?? 1) - 1)
      );
    },
    onError: (_err, notificationId) => {
      setAccumulated((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: false } : n
        )
      );
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread", patientId],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsRead(patientId!),
    onMutate: () => {
      setAccumulated((prev) => prev.map((n) => ({ ...n, is_read: true })));
      queryClient.setQueryData(["notifications-unread", patientId], 0);
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", patientId, filter],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread", patientId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onMutate: (notificationId) => {
      setAccumulated((prev) => prev.filter((n) => n.id !== notificationId));
    },
    onError: (_err, _notificationId) => {
      // Re-fetch to restore deleted notification
      queryClient.invalidateQueries({
        queryKey: ["notifications", patientId, filter],
      });
    },
  });

  // ── Actions ─────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(
    async (_reset = true) => {
      if (!patientId) return;
      setAccumulated([]);
      pageRef.current = 0;
      await queryClient.refetchQueries({
        queryKey: ["notifications", patientId, filter],
      });
    },
    [patientId, filter, queryClient]
  );

  const loadMore = useCallback(async () => {
    if (!patientId) return;
    const nextPage = pageRef.current + 1;
    isLoadMoreRef.current = true;
    const result = await getNotifications(patientId, filter, nextPage);
    if (result.success) {
      setAccumulated((prev) => [...prev, ...result.data.notifications]);
      pageRef.current = nextPage;
    }
  }, [patientId, filter]);

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = useCallback(() => {
    if (!patientId) return;
    markAllAsReadMutation.mutate();
  }, [patientId, markAllAsReadMutation]);

  const handleDelete = useCallback(
    (notificationId: string) => {
      deleteMutation.mutate(notificationId);
    },
    [deleteMutation]
  );

  const changeFilter = useCallback((f: NotificationType | undefined) => {
    setFilter(f);
    setAccumulated([]);
    pageRef.current = 0;
  }, []);

  const toggleUnreadOnly = useCallback((value: boolean) => {
    setUnreadOnly(value);
  }, []);

  // ── Realtime subscription ───────────────────────────────────────────────

  useEffect(() => {
    if (!patientId) return;

    const unsub = subscribeToNewNotifications(patientId, (newNotif) => {
      setAccumulated((prev) => [newNotif, ...prev]);
      if (!newNotif.is_read) {
        queryClient.setQueryData<number>(
          ["notifications-unread", patientId],
          (c) => (c ?? 0) + 1
        );
      }
    });

    return unsub;
  }, [patientId, queryClient]);

  return {
    notifications: filteredNotifications,
    allNotifications: accumulated,
    unreadCount,
    total,
    hasMore,
    loading: isLoading,
    filter,
    unreadOnly,

    fetchNotifications,
    refreshUnreadCount: () =>
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread", patientId],
      }),
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    loadMore,
    changeFilter,
    toggleUnreadOnly,
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
