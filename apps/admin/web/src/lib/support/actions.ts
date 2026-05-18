'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { adminSupabase } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/rbac';
import { getAuditContext, withAudit } from '@/lib/audit';

export type TicketRow = {
  id:           string;
  name:         string;
  email:        string;
  phone:        string | null;
  company:      string | null;
  subject:      string;
  message:      string;
  description:  string | null;
  category:     string | null;
  ticket_type:  string | null;
  priority:     string | null;
  status:       string | null;
  metadata:     Record<string, unknown> | null;
  created_at:   string | null;
  created_by:   string | null;
  assigned_to:  string | null;
};

export const TICKET_STATUSES = ['NUEVO', 'EN_PROGRESO', 'ESPERANDO_USUARIO', 'RESUELTO', 'CERRADO'] as const;
export const TICKET_PRIORITIES = ['baja', 'media', 'alta', 'urgente'] as const;

export async function listTickets(filters: { status?: string; priority?: string; q?: string } = {}): Promise<TicketRow[]> {
  await requireAdmin();
  const admin = adminSupabase();
  let q = admin
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (filters.status)   q = q.eq('status', filters.status);
  if (filters.priority) q = q.eq('priority', filters.priority);
  if (filters.q) {
    const escaped = filters.q.trim().replace(/[%_,]/g, (m) => `\\${m}`);
    q = q.or(`subject.ilike.%${escaped}%,email.ilike.%${escaped}%,name.ilike.%${escaped}%`);
  }
  const { data, error } = await q;
  if (error) throw new Error(`listTickets: ${error.message}`);
  return (data ?? []) as TicketRow[];
}

export async function updateTicketStatus(id: string, status: string) {
  const session = await requireAdmin();
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();
  return await withAudit(
    ctx,
    { action: 'support.update_status', resourceType: 'support_ticket', resourceId: id, payload: { status } },
    async () => {
      const { error } = await admin.from('support_tickets').update({ status }).eq('id', id);
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/support');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}

export async function assignTicket(id: string, assigneeId: string | null) {
  const session = await requireAdmin();
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();
  return await withAudit(
    ctx,
    { action: 'support.assign', resourceType: 'support_ticket', resourceId: id, payload: { assignee: assigneeId } },
    async () => {
      const { error } = await admin.from('support_tickets').update({ assigned_to: assigneeId }).eq('id', id);
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/support');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}

export async function assignToMe(id: string) {
  const session = await requireAdmin();
  return assignTicket(id, session.userId);
}
