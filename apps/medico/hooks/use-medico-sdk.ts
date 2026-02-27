import { useMemo } from 'react';
import { useSupabaseAuth } from '@red-salud/identity';
import { createMedicoSdk } from '@red-salud/sdk-medico';

export function useMedicoSdk() {
    const { supabase } = useSupabaseAuth();

    const sdk = useMemo(() => {
        if (!supabase) return null;
        return createMedicoSdk({
            supabase,
            // Pass other config if needed from env
            zaiApiKey: process.env.NEXT_PUBLIC_ZAI_API_KEY,
        });
    }, [supabase]);

    if (!sdk) {
        throw new Error('useMedicoSdk must be used within a SupabaseAuthProvider');
    }

    return sdk;
}
