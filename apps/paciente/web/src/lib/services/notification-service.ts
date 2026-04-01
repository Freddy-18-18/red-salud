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
// `community_notifications`. If neither exists, return null and all
// queries return empty defaults silently.

let _resolvedTable: string | null = null;
let _tableChecked = false;

async function resolveTable(): Promise<string | null> {
  if (_tableChecked) return _resolvedTable;

  try {
    // Try patient_notifications first
    const { error: pnErr } = await supabase
      .from("patient_notifications")
      .select("id")
      .limit(0);

    if (!pnErr) {
      _resolvedTable = "patient_notifications";
      _tableChecked = true;
      return _resolvedTable;
    }

    // Try community_notifications fallback
    const { error: cnErr } = await supabase
      .from("community_notifications")
      .select("id")
      .limit(0);

    if (!cnErr) {
      _resolvedTable = "community_notifications";
      _tableChecked = true;
      return _resolvedTable;
    }
  } catch {
    // Neither table exists
  }

  _tableChecked = true;
  _resolvedTable = null;
  return null;
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
    if (!table) {
      return { success: true, data: { notifications: [], total: 0, has_more: false } };
    }

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
  } catch {
    return {
      success: true,
      data: { notifications: [], total: 0, has_more: false },
    };
  }
}

export async function getUnreadCount(
  patientId: string,
): Promise<{ success: boolean; data: number; error?: unknown }> {
  try {
    const table = await resolveTable();
    if (!table) return { success: true, data: 0 };

    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("is_read", false);

    if (error) throw error;

    return { success: true, data: count ?? 0 };
  } catch {
    return { success: true, data: 0 };
  }
}

// ─── Write helpers ───────────────────────────────────────────────────────────

export async function markAsRead(
  notificationId: string,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const table = await resolveTable();
    if (!table) return { success: true };

    const { error } = await supabase
      .from(table)
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;

    return { success: true };
  } catch {
    return { success: true };
  }
}

export async function markAllAsRead(
  patientId: string,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const table = await resolveTable();
    if (!table) return { success: true };

    const { error } = await supabase
      .from(table)
      .update({ is_read: true })
      .eq("patient_id", patientId)
      .eq("is_read", false);

    if (error) throw error;

    return { success: true };
  } catch {
    return { success: true };
  }
}

export async function deleteNotification(
  notificationId: string,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const table = await resolveTable();
    if (!table) return { success: true };

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", notificationId);

    if (error) throw error;

    return { success: true };
  } catch {
    return { success: true };
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
  } catch {
    return { success: true };
  }
}
