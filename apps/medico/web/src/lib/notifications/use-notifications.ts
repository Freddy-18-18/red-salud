'use client';

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

import {
  countUnreadNotifications,
  dismissAllNotifications,
  dismissNotification,
  listActiveNotifications,
  markAllRead,
  markNotificationRead,
} from './service';
import {
  rowToNotification,
  type DoctorNotification,
  type DoctorNotificationRow,
} from './types';

/**
 * @file use-notifications.ts
 * @description Live-updating bell data: list + unread count + actions.
 *
 * Strategy:
 *   1. On mount, look up the doctor id from the active session.
 *   2. Seed state with a single round-trip (`listActiveNotifications` +
 *      `countUnreadNotifications`).
 *   3. Subscribe to `doctor_notifications` realtime so INSERT/UPDATE/DELETE
 *      events keep the list current without polling.
 *
 * Actions (mark read / dismiss) optimistically update local state before
 * the round-trip lands so the UI never lags behind the doctor's clicks.
 */

interface UseNotificationsResult {
  notifications: DoctorNotification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllReadAction: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  dismissAll: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<DoctorNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Initial load + capture the doctor id for realtime filtering.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      if (cancelled) return;
      setDoctorId(user.id);
      try {
        const [list, count] = await Promise.all([
          listActiveNotifications(user.id),
          countUnreadNotifications(user.id),
        ]);
        if (cancelled) return;
        setNotifications(list);
        setUnreadCount(count);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime subscription. Filtered server-side by doctor_id so the
  // doctor only receives their own events. Each event type updates the
  // local mirror in place; we don't re-fetch on every change.
  useEffect(() => {
    if (!doctorId) return;

    const channel = supabase
      .channel(`doctor-notifications-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'doctor_notifications',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          const row = payload.new as DoctorNotificationRow;
          if (row.dismissed_at !== null) return; // Should never happen on insert.
          const fresh = rowToNotification(row);
          setNotifications((prev) => [fresh, ...prev]);
          if (!fresh.isRead) setUnreadCount((c) => c + 1);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'doctor_notifications',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          const row = payload.new as DoctorNotificationRow;
          const updated = rowToNotification(row);
          setNotifications((prev) => {
            // Dismissed rows leave the list entirely.
            if (updated.dismissedAt !== null) {
              return prev.filter((n) => n.id !== updated.id);
            }
            const idx = prev.findIndex((n) => n.id === updated.id);
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = updated;
            return next;
          });
          // Recompute count from scratch — `is_read` may have flipped either
          // direction, dismissed_at may have changed, and counting is
          // O(notifications.length) which is bounded by our limit (30).
          setNotifications((latest) => {
            setUnreadCount(
              latest.filter((n) => !n.isRead && n.dismissedAt === null).length,
            );
            return latest;
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'doctor_notifications',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          const oldRow = payload.old as { id: string } | undefined;
          if (!oldRow?.id) return;
          setNotifications((prev) => prev.filter((n) => n.id !== oldRow.id));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [doctorId]);

  // Optimistic actions — apply locally first, fire the round-trip.
  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      ),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(id);
    } catch {
      // Realtime will reconcile on next fetch; we don't roll back here
      // because the visible result is "row stays read" which is harmless.
    }
  }, []);

  const markAllReadAction = useCallback(async () => {
    if (!doctorId) return;
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })),
    );
    setUnreadCount(0);
    try {
      await markAllRead(doctorId);
    } catch {
      /* see markRead */
    }
  }, [doctorId]);

  const dismiss = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await dismissNotification(id);
    } catch {
      /* realtime reconciliation */
    }
  }, []);

  const dismissAll = useCallback(async () => {
    if (!doctorId) return;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await dismissAllNotifications(doctorId);
    } catch {
      /* realtime reconciliation */
    }
  }, [doctorId]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllReadAction,
    dismiss,
    dismissAll,
  };
}
