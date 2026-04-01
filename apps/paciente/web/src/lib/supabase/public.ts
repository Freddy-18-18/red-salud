// Public Supabase client for anonymous access (no auth, no cookies)
// Used exclusively by public-facing pages that don't require authentication.
// This avoids triggering auth middleware and cookie overhead for public reads.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const publicSupabase = createClient(supabaseUrl, supabaseAnonKey)
