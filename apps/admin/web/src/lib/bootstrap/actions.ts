'use server';

import 'server-only';
import { adminSupabase } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getAuditContext, writeAudit } from '@/lib/audit';

/**
 * One-time bootstrap action: grants super_admin to the currently logged-in user
 * IF AND ONLY IF:
 *   1. admin_roles is empty (no super_admin yet)
 *   2. user's email is included in ADMIN_BOOTSTRAP_EMAILS
 *
 * Once admin_roles has at least one row, this action permanently denies new bootstraps.
 * Removing the email from ADMIN_BOOTSTRAP_EMAILS after first run is good hygiene.
 */
export async function bootstrapFirstSuperAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No estás logueado' };

  const allowList = (process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!user.email || !allowList.includes(user.email.toLowerCase())) {
    return { ok: false, error: 'Tu email no está en la lista de bootstrap' };
  }

  const admin = adminSupabase();

  const { count, error: countError } = await admin
    .from('admin_roles')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    return { ok: false, error: `Error consultando admin_roles: ${countError.message}` };
  }

  if ((count ?? 0) > 0) {
    return { ok: false, error: 'El bootstrap ya fue ejecutado. Pedile a un super admin que te otorgue acceso.' };
  }

  const { error: insertError } = await admin
    .from('admin_roles')
    .insert({
      user_id:    user.id,
      role_type:  'super_admin',
      granted_by: user.id,
      notes:      'Bootstrap — primer super admin del sistema',
    });

  if (insertError) {
    return { ok: false, error: `Error insertando admin_roles: ${insertError.message}` };
  }

  const ctx = await getAuditContext({
    userId:      user.id,
    email:       user.email,
    roles:       ['super_admin'],
    permissions: new Set(),
  });
  await writeAudit(ctx, {
    action:        'admin.bootstrap',
    resourceType:  'admin_roles',
    resourceId:    user.id,
    payload:       { granted_role: 'super_admin' },
  });

  return { ok: true, userId: user.id };
}

export async function isBootstrapAvailable(): Promise<boolean> {
  const admin = adminSupabase();
  const { count } = await admin
    .from('admin_roles')
    .select('id', { count: 'exact', head: true });
  return (count ?? 0) === 0;
}
