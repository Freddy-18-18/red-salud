import 'server-only';
import { headers } from 'next/headers';
import { adminSupabase } from '@/lib/supabase/admin';
import type { AdminSession } from '@/lib/rbac';

export type AuditStatus = 'success' | 'denied' | 'error';

export type AuditEntry = {
  action: string;                 // e.g. 'user.view', 'flag.toggle'
  resourceType?: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
  status?: AuditStatus;
  errorMessage?: string;
};

export type AuditContext = {
  actor: AdminSession | null;
  requestId: string;
  ip: string | null;
  userAgent: string | null;
};

export async function getAuditContext(actor: AdminSession | null): Promise<AuditContext> {
  const h = await headers();
  return {
    actor,
    requestId: h.get('x-request-id') ?? crypto.randomUUID(),
    ip:        h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
    userAgent: h.get('user-agent'),
  };
}

export async function writeAudit(ctx: AuditContext, entry: AuditEntry): Promise<void> {
  const admin = adminSupabase();
  const { error } = await admin.from('admin_audit_log').insert({
    actor_user_id: ctx.actor?.userId ?? null,
    actor_email:   ctx.actor?.email ?? null,
    actor_role:    ctx.actor?.roles[0] ?? null,
    action:        entry.action,
    resource_type: entry.resourceType ?? null,
    resource_id:   entry.resourceId ?? null,
    payload:       entry.payload ?? null,
    ip_address:    ctx.ip,
    user_agent:    ctx.userAgent,
    request_id:    ctx.requestId,
    status:        entry.status ?? 'success',
    error_message: entry.errorMessage ?? null,
  });
  if (error) {
    // Audit failure must never silently swallow — surface to server logs.
    console.error('[admin-audit] failed to write audit entry', { error, entry });
  }
}

/**
 * Wrap an admin operation so the result is automatically audited.
 *
 * Use this for ANY action that touches data through the admin client.
 * On exception, it records status='error' with the message and re-throws.
 */
export async function withAudit<T>(
  ctx: AuditContext,
  entry: AuditEntry,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    const result = await fn();
    await writeAudit(ctx, { ...entry, status: entry.status ?? 'success' });
    return result;
  } catch (err) {
    await writeAudit(ctx, {
      ...entry,
      status: 'error',
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
