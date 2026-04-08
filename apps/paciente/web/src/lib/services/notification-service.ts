import { fetchJson, postJson } from "@/lib/utils/fetch";
import { supabase } from "@/lib/supabase/client";

// ─── Notification Types ──────────────────────────────────────────────────────

export type NotificationType =
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_reminder"
  | "lab_results_ready"
  | "prescription_expiring"
  | "message_received"
  | "chronic_alert"
  | "price_alert"
  | "follow_up_due"
  | "rating_requested"
  // Legacy compatibility aliases
  | "appointment"
  | "medication"
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
  read_at?: string | null;
  created_at: string;
}

export interface NotificationPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface NotificationsResponse {
  data: AppNotification[];
  pagination: NotificationPagination;
  unread_count: number;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  categories: Record<string, { email: boolean; push: boolean }>;
}

// ─── Query params ────────────────────────────────────────────────────────────

export interface NotificationParams {
  unread_only?: boolean;
  type?: string;
  page?: number;
  page_size?: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Fetch paginated notifications via BFF.
   */
  async getNotifications(
    params?: NotificationParams,
  ): Promise<NotificationsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.unread_only) searchParams.set("unread_only", "true");
    if (params?.type) searchParams.set("type", params.type);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.page_size) searchParams.set("page_size", String(params.page_size));

    const qs = searchParams.toString();
    const url = `/api/notifications${qs ? `?${qs}` : ""}`;

    // This endpoint returns { data, pagination, unread_count } at the top level,
    // but fetchJson extracts `.data`. We need the full response.
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as Record<string, string>).error ??
          `Request failed (${res.status})`,
      );
    }
    return res.json() as Promise<NotificationsResponse>;
  },

  /**
   * Quick unread count for the notification badge.
   */
  async getUnreadCount(): Promise<number> {
    const res = await this.getNotifications({ page: 1, page_size: 1 });
    return res.unread_count;
  },

  /**
   * Mark specific notifications as read.
   */
  async markAsRead(ids: string[]): Promise<void> {
    await postJson("/api/notifications", { notification_ids: ids });
  },

  /**
   * Mark ALL unread notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    await postJson("/api/notifications", { mark_all: true });
  },

  /**
   * Toggle a single notification read/unread.
   */
  async toggleRead(id: string, isRead: boolean): Promise<AppNotification> {
    return postJson<AppNotification>(
      `/api/notifications/${id}`,
      { is_read: isRead },
      "PATCH",
    );
  },

  /**
   * Dismiss (delete) a notification.
   */
  async dismissNotification(id: string): Promise<void> {
    await fetchJson(`/api/notifications/${id}`, { method: "DELETE" });
  },

  /**
   * Get notification preferences.
   */
  async getPreferences(): Promise<NotificationPreferences> {
    return fetchJson<NotificationPreferences>("/api/notifications/preferences");
  },

  /**
   * Update notification preferences.
   */
  async updatePreferences(
    prefs: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    return postJson<NotificationPreferences>(
      "/api/notifications/preferences",
      prefs,
      "PUT",
    );
  },
};

// ─── Legacy API (backward compat with dashboard layout) ──────────────────────

/**
 * @deprecated Use notificationService.getUnreadCount() instead.
 * Kept for backward compatibility with dashboard layout.tsx polling.
 */
export async function getUnreadCount(
  patientId: string,
): Promise<{ success: boolean; data: number }> {
  try {
    const { count, error } = await supabase
      .from("patient_notifications")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("is_read", false);

    if (error) return { success: true, data: 0 };
    return { success: true, data: count ?? 0 };
  } catch {
    return { success: true, data: 0 };
  }
}

// ─── Realtime subscription ───────────────────────────────────────────────────

export function subscribeToNewNotifications(
  patientId: string,
  callback: (notification: AppNotification) => void,
): () => void {
  const channel = supabase
    .channel(`patient_notifications:${patientId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "patient_notifications",
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        callback(payload.new as AppNotification);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Push subscription ──────────────────────────────────────────────────────

export async function savePushSubscription(
  patientId: string,
  subscription: PushSubscription,
): Promise<{ success: boolean }> {
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
