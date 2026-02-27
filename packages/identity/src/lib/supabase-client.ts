import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
        if (typeof window === "undefined") {
            // Only throw on server-side if variables are missing
            console.warn("Missing Supabase environment variables during server-side client creation");
        }
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createClient();
