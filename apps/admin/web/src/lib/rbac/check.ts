import 'server-only';
import { adminSupabase } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { type AdminRoleType, type Permission, ROLE_PERMISSIONS } from './types';

export type AdminSession = {
  userId: string;
  email: string;
  roles: AdminRoleType[];
  permissions: Set<Permission>;
};

/**
 * Resolve the current admin session from cookies.
 *
 * Returns `null` when:
 *   - there is no Supabase session, OR
 *   - the user has no active row in admin_roles
 *
 * NEVER trust the client to tell us "I am admin" — this always re-checks the DB.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = adminSupabase();
  const { data: rows, error } = await admin
    .from('admin_roles')
    .select('role_type')
    .eq('user_id', user.id)
    .is('revoked_at', null);

  if (error || !rows || rows.length === 0) return null;

  const roles = rows.map((r) => r.role_type as AdminRoleType);
  const permissions = new Set<Permission>();
  for (const role of roles) {
    for (const perm of ROLE_PERMISSIONS[role]) {
      permissions.add(perm);
    }
  }

  return {
    userId: user.id,
    email: user.email ?? '',
    roles,
    permissions,
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new AdminAccessError('No admin session');
  }
  return session;
}

export async function requirePermission(permission: Permission): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!session.permissions.has(permission)) {
    throw new AdminAccessError(`Missing permission: ${permission}`);
  }
  return session;
}

export class AdminAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminAccessError';
  }
}
