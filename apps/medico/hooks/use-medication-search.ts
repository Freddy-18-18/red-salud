// Hook optimizado para búsqueda de medicamentos con caché y debounce
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
    MedicationFull,
    searchMedications,
    getMedicationById,
    TOTAL_MEDICAMENTOS
} from "@/lib/data/medications";

interface UseMedicationSearchOptions {
    debounceMs?: number;
    maxResults?: number;
    categoria?: string;
}

interface UseMedicationSearchReturn {
    query: string;
    setQuery: (query: string) => void;
    results: MedicationFull[];
    isSearching: boolean;
    selectedMedication: MedicationFull | null;
    selectMedication: (med: MedicationFull | null) => void;
    clearSelection: () => void;
    totalMedications: number;
}

// Cache para búsquedas recientes
const searchCache = new Map<string, MedicationFull[]>();
const MAX_CACHE_SIZE = 100;

export function useMedicationSearch(
    options: UseMedicationSearchOptions = {}
): UseMedicationSearchReturn {
    const { debounceMs = 150, maxResults = 15, categoria } = options;

    const [query, setQueryState] = useState("");
    const [results, setResults] = useState<MedicationFull[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState<MedicationFull | null>(null);

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Función para generar clave de cache
    const getCacheKey = useCallback(
        (q: string) => `${q.toLowerCase().trim()}:${categoria ?? "all"}:${maxResults}`,
        [categoria, maxResults]
    );

    // Función de búsqueda con caché
    const performSearch = useCallback(
        (searchQuery: string) => {
            if (searchQuery.length < 2) {
                setResults([]);
                setIsSearching(false);
                return;
            }

            const cacheKey = getCacheKey(searchQuery);

            // Verificar cache
            if (searchCache.has(cacheKey)) {
                setResults(searchCache.get(cacheKey)!);
                setIsSearching(false);
                return;
            }

            // Realizar búsqueda
            const searchResults = searchMedications(searchQuery, {
                limit: maxResults,
                categoria,
            });

            // Guardar en cache
            if (searchCache.size >= MAX_CACHE_SIZE) {
                // Eliminar la entrada más antigua
                const firstKey = searchCache.keys().next().value;
                if (firstKey) searchCache.delete(firstKey);
            }
            searchCache.set(cacheKey, searchResults);

            setResults(searchResults);
            setIsSearching(false);
        },
        [getCacheKey, maxResults, categoria]
    );

    // Setter con debounce
    const setQuery = useCallback(
        (newQuery: string) => {
            setQueryState(newQuery);

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            if (newQuery.length < 2) {
                setResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);

            debounceTimerRef.current = setTimeout(() => {
                performSearch(newQuery);
            }, debounceMs);
        },
        [debounceMs, performSearch]
    );

    // Cleanup de timeout al desmontar
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Seleccionar medicamento
    const selectMedication = useCallback((med: MedicationFull | null) => {
        setSelectedMedication(med);
        if (med) {
            setQueryState(med.nombre);
            setResults([]);
        }
    }, []);

    // Limpiar selección
    const clearSelection = useCallback(() => {
        setSelectedMedication(null);
        setQueryState("");
        setResults([]);
    }, []);

    return {
        query,
        setQuery,
        results,
        isSearching,
        selectedMedication,
        selectMedication,
        clearSelection,
        totalMedications: TOTAL_MEDICAMENTOS,
    };
}

// Hook para obtener sugerencias de dosis y frecuencia
export function useMedicationDetails(medicationId: string | null) {
    const medication = useMemo(() => {
        if (!medicationId) return null;
        return getMedicationById(medicationId);
    }, [medicationId]);

    return {
        medication,
        dosisComunes: medication?.dosisComunes ?? [],
        frecuenciasComunes: medication?.frecuenciasComunes ?? [],
        presentaciones: medication?.presentaciones ?? [],
        viasAdministracion: medication?.viaAdministracion ?? [],
    };
}
