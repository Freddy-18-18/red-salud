import 'server-only';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Bypasses RLS.
 *
 * NEVER import this from a Client Component or expose its return value to the browser.
 * The `server-only` import above guarantees a build error if you try.
 *
 * Every read/write through this client MUST be wrapped via lib/audit/withAudit so the
 * action lands in admin_audit_log. If you need raw access for a one-shot script, use
 * lib/audit/withAudit with a synthetic actor — never bypass auditing in product code.
 */
export function adminSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'adminSupabase: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
    );
  }

  cached = createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Admin-Panel': 'red-salud-admin',
      },
    },
  });

  return cached;
}
