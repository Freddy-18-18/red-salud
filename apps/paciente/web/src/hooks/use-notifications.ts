import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import {
  notificationService,
  subscribeToNewNotifications,
  type AppNotification,
  type NotificationParams,
  type NotificationPreferences,
} from "@/lib/services/notification-service";
import { supabase } from "@/lib/supabase/client";

// ─── Keys ────────────────────────────────────────────────────────────────────

const KEYS = {
  notifications: (params?: NotificationParams) => ["notifications", params] as const,
  unreadCount: ["notifications-unread-count"] as const,
  preferences: ["notification-preferences"] as const,
};

// ─── useNotifications — paginated notification list ──────────────────────────

interface UseNotificationsOptions {
  type?: string;
  unreadOnly?: boolean;
  pageSize?: number;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { type, unreadOnly = false, pageSize = 20, enabled = true } = options;
  const queryClient = useQueryClient();

  const params: NotificationParams = {
    type,
    unread_only: unreadOnly || undefined,
    page_size: pageSize,
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: KEYS.notifications(params),
    queryFn: async ({ pageParam = 1 }) => {
      return notificationService.getNotifications({
        ...params,
        page: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
    refetchInterval: 30_000,
  });

  // Flatten pages into a single notification array
  const notifications: AppNotification[] =
    data?.pages.flatMap((p) => p.data) ?? [];

  const unreadCount = data?.pages[0]?.unread_count ?? 0;
  const total = data?.pages[0]?.pagination.total ?? 0;

  // Realtime subscription — push new notifications to cache
  useEffect(() => {
    let unsub: (() => void) | undefined;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      unsub = subscribeToNewNotifications(user.id, () => {
        // On new notification, just refetch to keep data consistent
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: KEYS.unreadCount });
      });
    });

    return () => unsub?.();
  }, [queryClient]);

  return {
    notifications,
    unreadCount,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    refetch,
  };
}

// ─── useUnreadCount — lightweight badge count ────────────────────────────────

export function useUnreadCount() {
  const { data: count = 0 } = useQuery({
    queryKey: KEYS.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  return count;
}

// ─── useMarkAsRead — mark specific notifications ─────────────────────────────

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => notificationService.markAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: KEYS.unreadCount });
    },
  });
}

// ─── useMarkAllAsRead ────────────────────────────────────────────────────────

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: () => {
      // Optimistic: set unread count to 0
      queryClient.setQueryData(KEYS.unreadCount, 0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: KEYS.unreadCount });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.unreadCount });
    },
  });
}

// ─── useDismissNotification ──────────────────────────────────────────────────

export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.dismissNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: KEYS.unreadCount });
    },
  });
}

// ─── useNotificationPreferences ──────────────────────────────────────────────

export function useNotificationPreferences() {
  return useQuery({
    queryKey: KEYS.preferences,
    queryFn: () => notificationService.getPreferences(),
    staleTime: 60_000,
  });
}

// ─── useUpdatePreferences ────────────────────────────────────────────────────

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      notificationService.updatePreferences(prefs),
    onSuccess: (updatedPrefs) => {
      queryClient.setQueryData(KEYS.preferences, updatedPrefs);
    },
  });
}

// ─── Grouped helpers ─────────────────────────────────────────────────────────

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
