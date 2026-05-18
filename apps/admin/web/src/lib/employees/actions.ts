'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { adminSupabase } from '@/lib/supabase/admin';
import { requireAdmin, requirePermission, type AdminRoleType } from '@/lib/rbac';
import { getAuditContext, withAudit } from '@/lib/audit';

export type EmployeeRow = {
  user_id:    string;
  email:      string;
  full_name:  string | null;
  roles:      AdminRoleType[];
  granted_at: string;
  granted_by: string | null;
  notes:      string | null;
};

export async function listEmployees(): Promise<EmployeeRow[]> {
  await requirePermission('employees.view');
  const admin = adminSupabase();

  const { data: roles, error } = await admin
    .from('admin_roles')
    .select('user_id, role_type, granted_at, granted_by, notes')
    .is('revoked_at', null)
    .order('granted_at', { ascending: false });
  if (error) throw new Error(`listEmployees: ${error.message}`);

  if (!roles || roles.length === 0) return [];

  const userIds = Array.from(new Set(roles.map((r) => r.user_id)));
  const { data: users, error: uerr } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds);
  if (uerr) throw new Error(`listEmployees profiles: ${uerr.message}`);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));
  const grouped = new Map<string, EmployeeRow>();

  for (const r of roles) {
    const u = userMap.get(r.user_id);
    if (!u) continue;
    const existing = grouped.get(r.user_id);
    if (existing) {
      existing.roles.push(r.role_type as AdminRoleType);
    } else {
      grouped.set(r.user_id, {
        user_id:    r.user_id,
        email:      u.email,
        full_name:  u.full_name,
        roles:      [r.role_type as AdminRoleType],
        granted_at: r.granted_at,
        granted_by: r.granted_by,
        notes:      r.notes,
      });
    }
  }
  return Array.from(grouped.values());
}

export async function findUserByEmail(email: string): Promise<{ id: string; email: string; full_name: string | null } | null> {
  await requirePermission('employees.manage');
  const admin = adminSupabase();
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(`findUserByEmail: ${error.message}`);
  return data;
}

export async function grantAdminRole(
  userId: string,
  roleType: AdminRoleType,
  notes: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requirePermission('employees.manage');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();

  return await withAudit(
    ctx,
    {
      action:       'employee.grant_role',
      resourceType: 'admin_roles',
      resourceId:   userId,
      payload:      { role_type: roleType, notes_length: notes.length },
    },
    async () => {
      const { error } = await admin.from('admin_roles').upsert({
        user_id:    userId,
        role_type:  roleType,
        granted_by: session.userId,
        granted_at: new Date().toISOString(),
        revoked_at: null,
        notes:      notes || null,
      }, { onConflict: 'user_id,role_type' });
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/employees');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}

export async function revokeAdminRole(
  userId: string,
  roleType: AdminRoleType,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requirePermission('employees.manage');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();

  if (userId === session.userId && roleType === 'super_admin') {
    return { ok: false, error: 'No podés revocarte tu propio super_admin' };
  }

  return await withAudit(
    ctx,
    {
      action:       'employee.revoke_role',
      resourceType: 'admin_roles',
      resourceId:   userId,
      payload:      { role_type: roleType },
    },
    async () => {
      const { error } = await admin
        .from('admin_roles')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('role_type', roleType)
        .is('revoked_at', null);
      if (error) return { ok: false as const, error: error.message };
      revalidatePath('/dashboard/employees');
      return { ok: true as const };
    },
  ).catch((err) => ({ ok: false as const, error: err instanceof Error ? err.message : 'error' }));
}
