import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * Singleton browser client for service layer compatibility.
 * Services imported from the monolith use `import { supabase } from '@/lib/supabase/client'`.
 */
export const supabase = createClient();
