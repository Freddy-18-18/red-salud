'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { adminSupabase } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/rbac';
import { getAuditContext, withAudit } from '@/lib/audit';

export type FlagRow = {
  id:               string;
  key:              string;
  description:      string | null;
  enabled:          boolean;
  rollout_percent:  number;
  target_apps:      string[];
  target_roles:     string[];
  created_at:       string;
  updated_at:       string;
  created_by:       string | null;
  updated_by:       string | null;
};

export async function listFlags(): Promise<FlagRow[]> {
  await requirePermission('feature_flags.view');
  const admin = adminSupabase();
  const { data, error } = await admin
    .from('feature_flags')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(`listFlags: ${error.message}`);
  return (data ?? []) as FlagRow[];
}

export type FlagInput = {
  key:              string;
  description:      string;
  enabled:          boolean;
  rollout_percent:  number;
  target_apps:      string[];
  target_roles:     string[];
};

export async function createFlag(input: FlagInput) {
  const session = await requirePermission('feature_flags.toggle');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();
  return await withAudit(
    ctx,
    { action: 'flag.create', resourceType: 'feature_flag', resourceId: input.key, payload: { ...input, description: undefined } },
    async () => {
      const { error } = await admin.from('feature_flags').insert({
        ...input,
        description: input.description || null,
        created_by: session.userId,
        updated_by: session.userId,
      });
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/feature-flags');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}

export async function toggleFlag(id: string, enabled: boolean) {
  const session = await requirePermission('feature_flags.toggle');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();
  return await withAudit(
    ctx,
    { action: 'flag.toggle', resourceType: 'feature_flag', resourceId: id, payload: { enabled } },
    async () => {
      const { error } = await admin
        .from('feature_flags')
        .update({ enabled, updated_by: session.userId, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/feature-flags');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}

export async function updateFlagRollout(id: string, rollout_percent: number) {
  const session = await requirePermission('feature_flags.toggle');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();
  return await withAudit(
    ctx,
    { action: 'flag.rollout', resourceType: 'feature_flag', resourceId: id, payload: { rollout_percent } },
    async () => {
      const { error } = await admin
        .from('feature_flags')
        .update({ rollout_percent, updated_by: session.userId, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/feature-flags');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}
