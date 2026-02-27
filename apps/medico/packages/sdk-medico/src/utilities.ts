import type { SupabaseClient } from "@supabase/supabase-js";

export function createUtilitiesSdk(supabase: SupabaseClient) {
    return {
        /**
         * Fetch current BCV exchange rates (USD -> VED)
         */
        async getBcvRates() {
            try {
                // Fetch from Edge Function or external API
                const { data, error } = await supabase.functions.invoke('get-bcv-rates');
                if (error) throw error;
                return data;
            } catch (error) {
                console.warn('Error fetching BCV rates from Edge Function, using fallback:', error);
                // Fallback hardcoded or from a secondary source if needed
                return {
                    rate: 36.5, // Dummy fallback
                    lastUpdate: new Date().toISOString()
                };
            }
        },

        /**
         * Generic activity logger
         */
        async logActivity(userId: string, type: string, description: string) {
            return supabase.from('user_activity_log').insert({
                user_id: userId,
                activity_type: type,
                description,
                status: 'success'
            }).maybeSingle();
        }
    };
}
