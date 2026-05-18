'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { adminSupabase } from '@/lib/supabase/admin';
import { requireAdmin, requirePermission } from '@/lib/rbac';
import { getAuditContext, withAudit } from '@/lib/audit';

export type AlertRow = {
  id:               number;
  created_at:       string;
  rule_name:        string;
  severity:         'low' | 'medium' | 'high' | 'critical';
  message:          string;
  payload:          Record<string, unknown> | null;
  resolved_at:      string | null;
  resolved_by:      string | null;
  resolution_notes: string | null;
};

export async function listAlerts(opts: { onlyOpen?: boolean; limit?: number } = {}): Promise<AlertRow[]> {
  await requireAdmin();
  const admin = adminSupabase();
  let q = admin
    .from('system_alerts')
    .select('id,created_at,rule_name,severity,message,payload,resolved_at,resolved_by,resolution_notes')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 200);
  if (opts.onlyOpen) q = q.is('resolved_at', null);
  const { data, error } = await q;
  if (error) throw new Error(`listAlerts: ${error.message}`);
  return (data ?? []) as AlertRow[];
}

export async function resolveAlert(id: number, notes: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requirePermission('audit.view');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();

  return await withAudit(
    ctx,
    {
      action:       'alert.resolve',
      resourceType: 'system_alert',
      resourceId:   String(id),
      payload:      { notes_length: notes.length },
    },
    async () => {
      const { error } = await admin
        .from('system_alerts')
        .update({
          resolved_at:      new Date().toISOString(),
          resolved_by:      session.userId,
          resolution_notes: notes || null,
        })
        .eq('id', id)
        .is('resolved_at', null);
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/alerts');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}
