/**
 * Notification driver — abstracts where outgoing notifications are persisted.
 *
 * For Fase A we ship a single SupabaseDoctorNotificationDriver that writes to
 * the existing `doctor_notifications` table. The patient app surfaces in-app
 * notifications via Supabase realtime on that table, and the doctor's own
 * client polls/subscribes the same row. Email (Resend/Postmark) lives in a
 * future driver in Fase B; the interface here keeps that swap mechanical.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type NotificationType =
  | 'appointment_created'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'appointment_reminder'
  | 'message_received'
  | 'prescription_issued';

export interface NotifyParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationDriver {
  /** Persists a single notification. Failures are swallowed and logged so the
   * primary action (cancel, book, etc.) never rolls back because of a
   * notification glitch. */
  notify(params: NotifyParams): Promise<void>;
}

/**
 * Writes the notification row to `doctor_notifications`. Use when the
 * recipient is a verified medic — the doctor app reads from this table.
 */
export function createDoctorNotificationDriver(
  supabase: SupabaseClient,
): NotificationDriver {
  return {
    async notify(params: NotifyParams) {
      const { error } = await supabase
        .from('doctor_notifications')
        .insert({
          doctor_id: params.recipientId,
          type: params.type,
          title: params.title,
          message: params.message,
          action_url: params.actionUrl ?? null,
          is_read: false,
        });

      if (error) {
        // Best-effort — log and move on. The caller already committed the
        // primary mutation (e.g., cancel) and we don't want a notification
        // outage to block users.
        console.error('[notifications] doctor_notifications insert failed:', {
          recipient: params.recipientId,
          type: params.type,
          error: error.message,
        });
      }
    },
  };
}
