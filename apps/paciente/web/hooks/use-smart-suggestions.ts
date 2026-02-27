/**
 * Hook: useSmartSuggestions
 * 
 * Hook personalizado para obtener sugerencias inteligentes de motivos de consulta.
 * Combina datos del servidor con búsqueda local para una experiencia fluida.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { debounce } from 'lodash';
import {
    searchAllReasons,
    getTopReasons
} from '@/lib/data/specialty-reasons-data';
import { searchConsultationReasons } from '@/lib/data/consultation-reasons';

export interface SuggestionItem {
    reason: string;
    source: 'frequent' | 'specialty' | 'general' | 'local';
    priority: number;
    useCount?: number;
    category?: string;
}

export interface UseSmartSuggestionsOptions {
    /** Texto de búsqueda */
    query: string;
    /** Especialidad del médico */
    specialty?: string;
    /** Tiempo de debounce en ms (default: 300) */
    debounceMs?: number;
    /** Límite de resultados (default: 20) */
    limit?: number;
    /** Si se debe usar la API o solo local (default: true) */
    useApi?: boolean;
}

export interface UseSmartSuggestionsResult {
    /** Todas las sugerencias combinadas y ordenadas */
    suggestions: SuggestionItem[];
    /** Sugerencias agrupadas por fuente */
    grouped: {
        frequent: SuggestionItem[];
        specialty: SuggestionItem[];
        general: SuggestionItem[];
    };
    /** Si está cargando datos de la API */
    isLoading: boolean;
    /** Error si existe */
    error: string | null;
    /** Especialidad detectada del médico */
    detectedSpecialty: string;
    /** Función para registrar el uso de un motivo */
    trackUsage: (reason: string) => Promise<void>;
    /** Función para refrescar sugerencias */
    refresh: () => void;
}

/**
 * Busca sugerencias localmente (sin API)
 */
function getLocalSuggestions(
    query: string,
    specialty: string,
    limit: number
): SuggestionItem[] {
    if (!query || query.length < 2) {
        // Devolver top de la especialidad
        return getTopReasons(specialty, limit).map((reason, i) => ({
            reason,
            source: 'specialty' as const,
            priority: 80 - i,
        }));
    }

    // Buscar en datos de especialidad
    const specialtyResults = searchAllReasons(query, specialty);

    // Buscar en catálogo general como fallback
    const generalResults = searchConsultationReasons(query);

    // Combinar y deduplicar
    const seen = new Set<string>();
    const combined: SuggestionItem[] = [];

    // Primero los de especialidad
    specialtyResults.forEach(r => {
        if (!seen.has(r.reason.toLowerCase())) {
            seen.add(r.reason.toLowerCase());
            combined.push({
                reason: r.reason,
                source: 'specialty',
                priority: r.priority,
                category: r.category,
            });
        }
    });

    // Luego los generales
    generalResults.forEach((reason, i) => {
        if (!seen.has(reason.toLowerCase())) {
            seen.add(reason.toLowerCase());
            combined.push({
                reason,
                source: 'general',
                priority: 50 - i,
            });
        }
    });

    return combined
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);
}

export function useSmartSuggestions(
    options: UseSmartSuggestionsOptions
): UseSmartSuggestionsResult {
    const {
        query,
        specialty = 'Medicina Interna',
        debounceMs = 300,
        limit = 20,
        useApi = true,
    } = options;

    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [grouped, setGrouped] = useState({
        frequent: [] as SuggestionItem[],
        specialty: [] as SuggestionItem[],
        general: [] as SuggestionItem[],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detectedSpecialty, setDetectedSpecialty] = useState(specialty);

    const abortControllerRef = useRef<AbortController | null>(null);

    // Función para fetch de la API
    const fetchFromApi = useCallback(async (searchQuery: string) => {
        // Cancelar request anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            params.set('limit', limit.toString());

            const response = await fetch(
                `/api/suggestions/consultation-reasons?${params}`,
                { signal: abortControllerRef.current.signal }
            );

            if (!response.ok) {
                throw new Error('Error fetching suggestions');
            }

            const data = await response.json();

            // Actualizar especialidad detectada
            if (data.specialty) {
                setDetectedSpecialty(data.specialty);
            }

            // Actualizar sugerencias agrupadas
            if (data.frequent || data.specialty || data.general) {
                setGrouped({
                    frequent: data.frequent || [],
                    specialty: data.specialty || [],
                    general: data.general || [],
                });
                setSuggestions(data.all || [
                    ...(data.frequent || []),
                    ...(data.specialty || []),
                    ...(data.general || []),
                ]);
            } else if (data.suggestions) {
                // Formato alternativo (initial suggestions)
                setSuggestions(data.suggestions);
                setGrouped({
                    frequent: data.suggestions.filter((s: SuggestionItem) => s.source === 'frequent'),
                    specialty: data.suggestions.filter((s: SuggestionItem) => s.source === 'specialty'),
                    general: data.suggestions.filter((s: SuggestionItem) => s.source === 'general'),
                });
            }

        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Request cancelado, ignorar
                return;
            }
            console.error('Error fetching suggestions:', err);
            setError('Error al obtener sugerencias');

            // Fallback a búsqueda local
            const localResults = getLocalSuggestions(searchQuery, specialty, limit);
            setSuggestions(localResults);
            setGrouped({
                frequent: [],
                specialty: localResults.filter(s => s.source === 'specialty'),
                general: localResults.filter(s => s.source === 'general'),
            });
        } finally {
            setIsLoading(false);
        }
    }, [limit, specialty]);

    // Debounced fetch
    const debouncedFetch = useMemo(
        () => debounce(fetchFromApi, debounceMs),
        [fetchFromApi, debounceMs]
    );

    // Efecto para buscar cuando cambia el query
    useEffect(() => {
        if (useApi) {
            debouncedFetch(query);
        } else {
            // Solo búsqueda local
            const localResults = getLocalSuggestions(query, specialty, limit);
            setSuggestions(localResults);
            setGrouped({
                frequent: [],
                specialty: localResults.filter(s => s.source === 'specialty'),
                general: localResults.filter(s => s.source === 'general'),
            });
        }

        return () => {
            debouncedFetch.cancel();
        };
    }, [query, useApi, debouncedFetch, specialty, limit]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Función para registrar uso
    const trackUsage = useCallback(async (reason: string) => {
        try {
            await fetch('/api/suggestions/consultation-reasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
        } catch (err) {
            console.warn('Error tracking reason usage:', err);
        }
    }, []);

    // Función para refrescar
    const refresh = useCallback(() => {
        fetchFromApi(query);
    }, [fetchFromApi, query]);

    return {
        suggestions,
        grouped,
        isLoading,
        error,
        detectedSpecialty,
        trackUsage,
        refresh,
    };
}

export default useSmartSuggestions;
