'use server';

import 'server-only';
import { adminSupabase } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/rbac';
import { getAuditContext, withAudit } from '@/lib/audit';

export type UserSearchResult = {
  id:           string;
  email:        string;
  full_name:    string | null;
  phone:        string | null;
  national_id:  string | null;
  role:         string;
  created_at:   string | null;
  avatar_url:   string | null;
  sacs_verified: boolean | null;
  national_id_verified: boolean | null;
  deleted_at:   string | null;
};

const MAX_RESULTS = 50;

/**
 * Cross-domain unified user search.
 * Matches against email, full_name (and first/last/middle), phone, national_id.
 * If the query parses as a UUID, also tries an exact id match.
 */
export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const session = await requirePermission('users.search');
  const ctx = await getAuditContext(session);

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const admin = adminSupabase();
  const escaped = trimmed.replace(/[%_,]/g, (m) => `\\${m}`);
  const like = `%${escaped}%`;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

  const orFilters = [
    `email.ilike.${like}`,
    `full_name.ilike.${like}`,
    `first_name.ilike.${like}`,
    `last_name.ilike.${like}`,
    `phone.ilike.${like}`,
    `national_id.ilike.${like}`,
    `rif.ilike.${like}`,
  ];
  if (isUuid) orFilters.push(`id.eq.${trimmed}`);

  return await withAudit(
    ctx,
    {
      action:       'users.search',
      payload:      { query: trimmed, isUuid },
    },
    async () => {
      const { data, error } = await admin
        .from('profiles')
        .select(
          'id,email,full_name,phone,national_id,role,created_at,avatar_url,sacs_verified,national_id_verified,deleted_at',
        )
        .or(orFilters.join(','))
        .order('created_at', { ascending: false })
        .limit(MAX_RESULTS);

      if (error) throw new Error(`searchUsers: ${error.message}`);
      return (data ?? []) as UserSearchResult[];
    },
  );
}
