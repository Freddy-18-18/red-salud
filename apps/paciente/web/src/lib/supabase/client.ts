import { createBrowserClient } from '@supabase/ssr';
import { PACIENTE_AUTH_COOKIE_NAME } from './cookie-name';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: PACIENTE_AUTH_COOKIE_NAME },
    },
  );
}

// Singleton instance used throughout the patient app
export const supabase = createClient();
