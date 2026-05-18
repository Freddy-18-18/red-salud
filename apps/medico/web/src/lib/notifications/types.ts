/**
 * @file lib/notifications/types.ts
 * @description Shape of the bell notifications stored in
 * `public.doctor_notifications`.
 *
 * Schema note: the table predated this module with `message` and `action_url`
 * column names; we re-alias them to `body` / `link` at the boundary so the
 * UI reads idiomatic property names. Code that talks to Supabase MUST use
 * the actual column names; everything downstream uses the TS types.
 */

export type DoctorNotificationType =
  | 'appointment_created'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'message_received'
  | 'lab_result_arrived'
  | 'prescription_requested'
  | 'follow_up_due'
  | 'system';

export interface DoctorNotification {
  id: string;
  doctorId: string;
  type: DoctorNotificationType;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

/** Raw column shape coming back from Supabase. Used by the service mapper. */
export interface DoctorNotificationRow {
  id: string;
  doctor_id: string;
  type: DoctorNotificationType;
  title: string;
  message: string | null;
  action_url: string | null;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}

export function rowToNotification(row: DoctorNotificationRow): DoctorNotification {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    type: row.type,
    title: row.title,
    body: row.message,
    link: row.action_url,
    metadata: row.metadata ?? {},
    isRead: row.is_read,
    readAt: row.read_at,
    dismissedAt: row.dismissed_at,
    createdAt: row.created_at,
  };
}

/**
 * Human-readable defaults per type — used when a notification arrives
 * without a custom title (rare but possible from automated producers).
 */
export const NOTIFICATION_TYPE_LABELS: Record<DoctorNotificationType, string> = {
  appointment_created: 'Nueva cita reservada',
  appointment_cancelled: 'Cita cancelada',
  appointment_reminder: 'Recordatorio de cita',
  message_received: 'Mensaje recibido',
  lab_result_arrived: 'Resultado de laboratorio',
  prescription_requested: 'Solicitud de receta',
  follow_up_due: 'Seguimiento pendiente',
  system: 'Notificación del sistema',
};
