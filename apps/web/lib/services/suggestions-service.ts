/**
 * Servicio de Sugerencias Inteligentes de Motivos de Consulta
 * 
 * Este servicio combina 3 fuentes de datos:
 * 1. Motivos frecuentemente usados por el médico
 * 2. Motivos específicos de la especialidad del médico
 * 3. Búsqueda en el catálogo general
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CONSULTATION_REASONS } from '@/lib/data/consultation-reasons';
import {
    getReasonsBySpecialty,
    searchAllReasons,
    getTopReasons,
    SpecialtyReason
} from '@/lib/data/specialty-reasons-data';

export interface SuggestionResult {
    reason: string;
    source: 'frequent' | 'specialty' | 'general' | 'semantic';
    priority: number;
    useCount?: number;
    category?: string;
}

export interface SmartSuggestionsParams {
    doctorId: string;
    specialty: string;
    query: string;
    limit?: number;
}

export interface SmartSuggestionsResponse {
    frequent: SuggestionResult[];
    specialty: SuggestionResult[];
    general: SuggestionResult[];
    all: SuggestionResult[];
}

// Type for doctor reason usage record
interface DoctorReasonUsage {
    id: string;
    reason: string;
    use_count: number;
    last_used_at: string;
    doctor_id: string;
}

/**
 * Normaliza texto para búsqueda (quita acentos, minúsculas)
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * Obtiene los motivos más usados por el médico
 */
export async function getFrequentReasons(
    supabase: SupabaseClient,
    doctorId: string,
    query?: string,
    limit = 5
): Promise<SuggestionResult[]> {
    try {
        let queryBuilder = supabase
            .from('doctor_reason_usage')
            .select('reason, use_count, last_used_at')
            .eq('doctor_id', doctorId)
            .order('use_count', { ascending: false })
            .order('last_used_at', { ascending: false })
            .limit(limit);

        if (query && query.length >= 2) {
            queryBuilder = queryBuilder.ilike('reason', `%${query}%`);
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error fetching frequent reasons:', error);
            return [];
        }

        return ((data || []) as DoctorReasonUsage[]).map(item => ({
            reason: item.reason,
            source: 'frequent' as const,
            priority: 90 + Math.min(item.use_count, 10), // Max 100
            useCount: item.use_count,
        }));
    } catch (err) {
        console.error('Error in getFrequentReasons:', err);
        return [];
    }
}

/**
 * Obtiene motivos específicos de la especialidad del médico
 */
export function getSpecialtyReasons(
    specialty: string,
    query?: string,
    limit = 15
): SuggestionResult[] {
    let reasons: SpecialtyReason[];

    if (query && query.length >= 2) {
        // Buscar con el query
        reasons = searchAllReasons(query, specialty).slice(0, limit);
    } else {
        // Obtener los más relevantes de la especialidad
        reasons = getReasonsBySpecialty(specialty).slice(0, limit);
    }

    return reasons.map(r => ({
        reason: r.reason,
        source: 'specialty' as const,
        priority: r.priority,
        category: r.category,
    }));
}

/**
 * Busca en el catálogo general de motivos
 */
export function searchGeneralReasons(
    query: string,
    excludeReasons: string[] = [],
    limit = 10
): SuggestionResult[] {
    if (!query || query.length < 2) return [];

    const normalizedQuery = normalizeText(query);

    // Use imported catalog general existing

    const results = CONSULTATION_REASONS
        .filter((reason: string) => {
            const normalizedReason = normalizeText(reason);
            return normalizedReason.includes(normalizedQuery) &&
                !excludeReasons.includes(reason);
        })
        .sort((a: string, b: string) => {
            const normA = normalizeText(a);
            const normB = normalizeText(b);

            // Priorizar los que empiezan con el query
            const aStarts = normA.startsWith(normalizedQuery);
            const bStarts = normB.startsWith(normalizedQuery);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            // Menor longitud primero
            return a.length - b.length;
        })
        .slice(0, limit);

    return results.map((reason: string, index: number) => ({
        reason,
        source: 'general' as const,
        priority: 50 - index, // Decreasing priority
    }));
}

/**
 * Obtiene sugerencias inteligentes combinando todas las fuentes
 */
export async function getSmartSuggestions(
    supabase: SupabaseClient,
    params: SmartSuggestionsParams
): Promise<SmartSuggestionsResponse> {
    const { doctorId, specialty, query, limit = 20 } = params;

    // 1. Obtener motivos frecuentes del médico
    const frequent = await getFrequentReasons(supabase, doctorId, query, 5);

    // 2. Obtener motivos de la especialidad
    const specialtyReasons = getSpecialtyReasons(specialty, query, 15);

    // Filtrar duplicados de specialty que ya están en frequent
    const frequentReasonNames = new Set(frequent.map(f => f.reason.toLowerCase()));
    const filteredSpecialty = specialtyReasons.filter(
        s => !frequentReasonNames.has(s.reason.toLowerCase())
    );

    // 3. Obtener motivos generales (si no hay suficientes resultados)
    const allFoundReasons = [...frequent, ...filteredSpecialty].map(r => r.reason);
    const general = query && query.length >= 2
        ? searchGeneralReasons(query, allFoundReasons, 10)
        : [];

    // Filtrar duplicados de general
    const existingReasonNames = new Set([
        ...frequent.map(f => f.reason.toLowerCase()),
        ...filteredSpecialty.map(s => s.reason.toLowerCase()),
    ]);
    const filteredGeneral = general.filter(
        g => !existingReasonNames.has(g.reason.toLowerCase())
    );

    // Combinar y ordenar todos los resultados
    const all = [...frequent, ...filteredSpecialty, ...filteredGeneral]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);

    return {
        frequent,
        specialty: filteredSpecialty,
        general: filteredGeneral,
        all,
    };
}

/**
 * Registra el uso de un motivo de consulta
 */
export async function trackReasonUsage(
    supabase: SupabaseClient,
    doctorId: string,
    reason: string
): Promise<void> {
    try {
        // Usar upsert para incrementar el contador
        const { error } = await supabase.rpc('increment_reason_usage', {
            p_doctor_id: doctorId,
            p_reason: reason,
        });

        if (error) {
            // Si la función no existe, usar upsert manual
            console.warn('RPC not available, using manual upsert:', error);

            // Check if exists
            const { data: existing } = await supabase
                .from('doctor_reason_usage')
                .select('id, use_count')
                .eq('doctor_id', doctorId)
                .eq('reason', reason)
                .single();

            const existingRecord = existing as DoctorReasonUsage | null;

            if (existingRecord) {
                await supabase
                    .from('doctor_reason_usage')
                    .update({
                        use_count: existingRecord.use_count + 1,
                        last_used_at: new Date().toISOString(),
                    })
                    .eq('id', existingRecord.id);
            } else {
                await supabase
                    .from('doctor_reason_usage')
                    .insert({
                        doctor_id: doctorId,
                        reason,
                        use_count: 1,
                        last_used_at: new Date().toISOString(),
                    });
            }
        }
    } catch (err) {
        console.error('Error tracking reason usage:', err);
    }
}

/**
 * Obtiene las sugerencias iniciales (sin query)
 * Útil para mostrar las "Frecuentes" cuando el campo está vacío
 */
export async function getInitialSuggestions(
    supabase: SupabaseClient,
    doctorId: string,
    specialty: string,
    limit = 8
): Promise<SuggestionResult[]> {
    // Obtener frecuentes del médico
    const frequent = await getFrequentReasons(supabase, doctorId, undefined, 4);

    // Obtener top de la especialidad
    const topSpecialty = getTopReasons(specialty, 4)
        .filter(r => !frequent.some(f => f.reason.toLowerCase() === r.toLowerCase()))
        .map((reason, i) => ({
            reason,
            source: 'specialty' as const,
            priority: 80 - i,
        }));

    return [...frequent, ...topSpecialty].slice(0, limit);
}
