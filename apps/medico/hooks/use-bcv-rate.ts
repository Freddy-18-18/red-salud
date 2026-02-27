import { useQuery } from '@tanstack/react-query';
import { medicoSdk } from '@/lib/sdk';

export function useBCVRate() {
    return useQuery({
        queryKey: ['bcv-rates'],
        queryFn: async () => {
            const rates = await medicoSdk.bcv.getRates();
            return { success: true, rates };
        },
        staleTime: 1000 * 60 * 60 * 4, // 4 hours
        retry: 2
    });
}
