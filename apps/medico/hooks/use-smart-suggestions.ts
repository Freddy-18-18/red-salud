import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { medicoSdk } from '@/lib/sdk';
import type { SuggestionItem } from '@red-salud/sdk-medico';

export type { SuggestionItem };

export interface UseSmartSuggestionsOptions {
    /** Texto de búsqueda */
    query: string;
    /** Especialidad del médico */
    specialty?: string;
    /** Tiempo de debounce en ms (default: 300) */
    debounceMs?: number;
    /** Límite de resultados (default: 20) */
    limit?: number;
}

export interface UseSmartSuggestionsResult {
    suggestions: SuggestionItem[];
    isLoading: boolean;
    error: string | null;
    trackUsage: (reason: string) => Promise<void>;
    refresh: () => void;
}

export function useSmartSuggestions(
    options: UseSmartSuggestionsOptions
): UseSmartSuggestionsResult {
    const {
        query,
        specialty = 'Medicina Interna',
        debounceMs = 300,
        limit = 20,
    } = options;

    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async (searchQuery: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const results = await medicoSdk.ai.suggestions.getConsultationReasons(
                searchQuery,
                specialty,
                limit
            );

            setSuggestions(results);
        } catch (err) {
            console.error('Error fetching suggestions from SDK:', err);
            setError('Error al obtener sugerencias');
        } finally {
            setIsLoading(false);
        }
    }, [specialty, limit]);

    const debouncedFetch = useMemo(
        () => debounce(fetchSuggestions, debounceMs),
        [fetchSuggestions, debounceMs]
    );

    useEffect(() => {
        debouncedFetch(query);
        return () => debouncedFetch.cancel();
    }, [query, debouncedFetch]);

    const trackUsage = useCallback(async (reason: string) => {
        try {
            await medicoSdk.ai.suggestions.trackUsage(reason);
        } catch (err) {
            console.warn('Error tracking reason usage:', err);
        }
    }, []);

    const refresh = useCallback(() => {
        fetchSuggestions(query);
    }, [fetchSuggestions, query]);

    return {
        suggestions,
        isLoading,
        error,
        trackUsage,
        refresh,
    };
}

export default useSmartSuggestions;
