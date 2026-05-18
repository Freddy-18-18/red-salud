import { createBrowserClient } from '@supabase/ssr';
import { ADMIN_AUTH_COOKIE_NAME } from './cookie-name';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: ADMIN_AUTH_COOKIE_NAME },
    },
  );
}

export const supabase = createClient();
