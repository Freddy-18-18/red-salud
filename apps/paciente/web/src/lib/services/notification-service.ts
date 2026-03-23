import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationType =
  | "medication"
  | "appointment"
  | "lab_result"
  | "message"
  | "reward"
  | "insurance"
  | "emergency"
  | "community"
  | "system";

export interface AppNotification {
  id: string;
  patient_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url?: string;
  action_label?: string;
  action_data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPage {
  notifications: AppNotification[];
  total: number;
  has_more: boolean;
}

// ─── Table detection ─────────────────────────────────────────────────────────
// We use `patient_notifications` if it exists, otherwise fall back to
// `community_notifications`. The service adapts at runtime.

let _resolvedTable: string | null = null;

async function resolveTable(): Promise<string> {
  if (_resolvedTable) return _resolvedTable;

  // Try patient_notifications first
  const { error: pnErr } = await supabase
    .from("patient_notifications")
    .select("id")
    .limit(0);

  if (!pnErr) {
    _resolvedTable = "patient_notifications";
    return _resolvedTable;
  }

  // Fallback
  _resolvedTable = "community_notifications";
  return _resolvedTable;
}

// ─── Read helpers ────────────────────────────────────────────────────────────

export async function getNotifications(
  patientId: string,
  filter?: NotificationType,
  page = 0,
  pageSize = 20,
): Promise<{ success: boolean; data: NotificationPage; error?: unknown }> {
  try {
    const table = await resolveTable();
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(table)
      .select("*", { count: "exact" })
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filter) {
      query = query.eq("type", filter);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const notifications = (data || []) as AppNotification[];
    const total = count ?? 0;

    return {
      success: true,
      data: {
        notifications,
        total,
        has_more: from + notifications.length < total,
      },
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      data: { notifications: [], total: 0, has_more: false },
      error,
    };
  }
}

export async function getUnreadCount(
  patientId: string,
): Promise<{ success: boolean; data: number; error?: unknown }> {
  try {
    const table = await resolveTable();

    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("is_read", false);

    if (error) throw error;

    return { success: true, data: count ?? 0 };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return { success: false, data: 0, error };
  }
}

// ─── Write helpers ───────────────────────────────────────────────────────────

export async function markAsRead(
  notificationId: string,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const table = await resolveTable();

    const { error } = await supabase
      .from(table)
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error };
  }
}

export async function markAllAsRead(
  patientId: string,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const table = await resolveTable();

    const { error } = await supabase
      .from(table)
      .update({ is_read: true })
      .eq("patient_id", patientId)
      .eq("is_read", false);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error };
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const table = await resolveTable();

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error };
  }
}

// ─── Realtime subscription ───────────────────────────────────────────────────

export function subscribeToNewNotifications(
  patientId: string,
  callback: (notification: AppNotification) => void,
): () => void {
  // We cannot await resolveTable() in a sync function, so we subscribe to both
  // possible channels and let the one that doesn't exist silently fail.
  const channels = ["patient_notifications", "community_notifications"].map(
    (table) =>
      supabase
        .channel(`${table}:${patientId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table,
            filter: `patient_id=eq.${patientId}`,
          },
          (payload) => {
            callback(payload.new as AppNotification);
          },
        )
        .subscribe(),
  );

  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}

// ─── Push subscription ───────────────────────────────────────────────────────

export async function savePushSubscription(
  patientId: string,
  subscription: PushSubscription,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const subJson = subscription.toJSON();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: patientId,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return { success: false, error };
  }
}
