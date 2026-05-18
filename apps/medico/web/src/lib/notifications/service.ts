'use client';

import { supabase } from '@/lib/supabase/client';

import {
  rowToNotification,
  type DoctorNotification,
  type DoctorNotificationRow,
} from './types';

/**
 * @file lib/notifications/service.ts
 * @description Read + mark-as-read + dismiss operations for the bell.
 *
 * All writes use the column names that exist in the legacy table
 * (`is_read`, `read_at`, `dismissed_at`); the TS layer aliases them to
 * `isRead`, `readAt`, `dismissedAt` on the way out.
 *
 * RLS pins ownership, so the doctor_id filter is technically redundant —
 * we keep it anyway because (a) it lets PostgREST use the partial index,
 * (b) it makes the intent explicit at the call site.
 */

const TABLE = 'doctor_notifications';
const COLUMNS =
  'id,doctor_id,type,title,message,action_url,metadata,is_read,read_at,dismissed_at,created_at';

export async function listActiveNotifications(
  doctorId: string,
  limit = 30,
): Promise<DoctorNotification[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('doctor_id', doctorId)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // Table missing or transient failure — surface an empty list so the
    // bell still renders a "no tenés notificaciones" empty state.
    return [];
  }
  return (data as DoctorNotificationRow[]).map(rowToNotification);
}

export async function countUnreadNotifications(doctorId: string): Promise<number> {
  const { count, error } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .eq('is_read', false)
    .is('dismissed_at', null);
  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllRead(doctorId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('doctor_id', doctorId)
    .eq('is_read', false);
  if (error) throw error;
}

export async function dismissNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function dismissAllNotifications(doctorId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ dismissed_at: new Date().toISOString() })
    .eq('doctor_id', doctorId)
    .is('dismissed_at', null);
  if (error) throw error;
}
