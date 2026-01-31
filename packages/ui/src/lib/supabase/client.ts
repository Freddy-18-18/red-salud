
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure client-side only access or proper env handling
if ((!supabaseUrl || !supabaseAnonKey) && typeof window !== "undefined") {
    // console.warn("Missing Supabase environment variables in UI package");
}

export const supabase = createBrowserClient(supabaseUrl || "", supabaseAnonKey || "");
