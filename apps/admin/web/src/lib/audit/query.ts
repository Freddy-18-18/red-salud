'use server';

import 'server-only';
import { adminSupabase } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/rbac';

export type AuditLogRow = {
  id:            number;
  occurred_at:   string;
  actor_email:   string | null;
  actor_role:    string | null;
  action:        string;
  resource_type: string | null;
  resource_id:   string | null;
  status:        string;
  error_message: string | null;
  ip_address:    string | null;
  payload:       Record<string, unknown> | null;
};

export type AuditQuery = {
  action?:      string;
  actorEmail?:  string;
  status?:      'success' | 'denied' | 'error';
  resourceId?:  string;
  limit?:       number;
  offset?:      number;
};

export async function listAuditLog(q: AuditQuery = {}): Promise<{ rows: AuditLogRow[]; total: number }> {
  await requirePermission('audit.view');
  const admin = adminSupabase();

  const limit  = Math.min(q.limit ?? 100, 500);
  const offset = q.offset ?? 0;

  let query = admin
    .from('admin_audit_log')
    .select(
      'id,occurred_at,actor_email,actor_role,action,resource_type,resource_id,status,error_message,ip_address,payload',
      { count: 'exact' },
    )
    .order('occurred_at', { ascending: false });

  if (q.action)     query = query.ilike('action', `%${q.action}%`);
  if (q.actorEmail) query = query.ilike('actor_email', `%${q.actorEmail}%`);
  if (q.status)     query = query.eq('status', q.status);
  if (q.resourceId) query = query.eq('resource_id', q.resourceId);

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(`listAuditLog: ${error.message}`);

  return {
    rows:  (data ?? []) as AuditLogRow[],
    total: count ?? 0,
  };
}
