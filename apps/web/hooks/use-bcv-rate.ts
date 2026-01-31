import { useQuery } from '@tanstack/react-query';

export interface ExchangeRate {
    rate: number;
    currency: string;
    date: string;
}

interface BCVResponse {
    success: boolean;
    rates: ExchangeRate[];
}

export function useBCVRate() {
    return useQuery<BCVResponse>({
        queryKey: ['bcv-rates'],
        queryFn: async () => {
            const res = await fetch('/api/external/bcv-rate');
            if (!res.ok) throw new Error('Failed to fetch rates');
            return res.json();
        },
        staleTime: 1000 * 60 * 60 * 4, // 4 hours
        retry: 2
    });
}
