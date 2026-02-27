import { createMedicoSdk } from "@red-salud/sdk-medico";
import { supabase } from "@/lib/supabase/client";

/**
 * Singleton instance of the Medico SDK for the application.
 * Centralizing this ensures consistent configuration (API keys, etc.)
 */
export const medicoSdk = createMedicoSdk({
    supabase,
    environment: 'standalone',
    zaiApiKey: process.env.NEXT_PUBLIC_ZAI_API_KEY || process.env.ZAI_API_KEY,
});

export default medicoSdk;
