import { createBrowserClient, createServerClient } from '@supabase/ssr';

import type { AuthConfig } from './types';

export function createBrowserAuthClient(config: AuthConfig) {
  return createBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
}

export function createServerAuthClient(
  config: AuthConfig,
  cookieStore: {
    getAll: () => { name: string; value: string }[];
    setAll: (cookies: { name: string; value: string; options: Record<string, unknown> }[]) => void;
  },
) {
  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: cookieStore,
  });
}
