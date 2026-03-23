// Índice principal de la base de datos de medicamentos
// Exporta todos los medicamentos consolidados

import {
    type MedicationFull,
    CATEGORIAS_MEDICAMENTOS,
    FRECUENCIAS_ESTANDAR,
    VIAS_ADMINISTRACION
} from "./types";

import { ANALGESICOS } from "./analgesicos";
import { ANTIBIOTICOS } from "./antibioticos";
import { ANTIHIPERTENSIVOS } from "./cardiovasculares";
import { GASTROINTESTINALES, ANTIDIABETICOS, HORMONALES } from "./gastrointestinales";
import { RESPIRATORIOS, PSIQUIATRICOS, NEUROLOGICOS } from "./respiratorios";
import { DERMATOLOGICOS, VITAMINAS, OTROS, OFTALMICOS } from "./otros";

// Base de datos consolidada con todos los medicamentos
export const MEDICAMENTOS_DATABASE: MedicationFull[] = [
    ...ANALGESICOS,
    ...ANTIBIOTICOS,
    ...ANTIHIPERTENSIVOS,
    ...GASTROINTESTINALES,
    ...ANTIDIABETICOS,
    ...HORMONALES,
    ...RESPIRATORIOS,
    ...PSIQUIATRICOS,
    ...NEUROLOGICOS,
    ...DERMATOLOGICOS,
    ...VITAMINAS,
    ...OTROS,
    ...OFTALMICOS,
];

// Número total de medicamentos
export const TOTAL_MEDICAMENTOS = MEDICAMENTOS_DATABASE.length;

// Exportar tipos
export type { MedicationFull };

// Exportar constantes
export {
    CATEGORIAS_MEDICAMENTOS,
    FRECUENCIAS_ESTANDAR,
    VIAS_ADMINISTRACION
};

// Exportar categorías individuales para uso específico
export {
    ANALGESICOS,
    ANTIBIOTICOS,
    ANTIHIPERTENSIVOS,
    GASTROINTESTINALES,
    ANTIDIABETICOS,
    HORMONALES,
    RESPIRATORIOS,
    PSIQUIATRICOS,
    NEUROLOGICOS,
    DERMATOLOGICOS,
    VITAMINAS,
    OTROS,
    OFTALMICOS,
};

// Función de búsqueda optimizada con fuzzy matching
export function searchMedications(
    query: string,
    options?: {
        limit?: number;
        categoria?: string;
    }
): MedicationFull[] {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase().trim();
    const limit = options?.limit ?? 20;

    // Filtrar por categoría si se especifica
    let source = MEDICAMENTOS_DATABASE;
    if (options?.categoria) {
        source = source.filter(m => m.categoria === options.categoria);
    }

    // Buscar coincidencias
    const results = source.filter(med => {
        // Buscar en nombre genérico
        if (med.nombre.toLowerCase().includes(lowerQuery)) return true;

        // Buscar en nombres comerciales
        if (med.nombreComercial.some(nc => nc.toLowerCase().includes(lowerQuery))) return true;

        // Buscar en principio activo
        if (med.principioActivo.toLowerCase().includes(lowerQuery)) return true;

        return false;
    });

    // Ordenar por relevancia (coincidencia exacta primero)
    results.sort((a, b) => {
        const aExact = a.nombre.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
        const bExact = b.nombre.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
        return a.nombre.localeCompare(b.nombre);
    });

    return results.slice(0, limit);
}

// Obtener medicamento por ID
export function getMedicationById(id: string): MedicationFull | undefined {
    return MEDICAMENTOS_DATABASE.find(m => m.id === id);
}

// Obtener medicamentos por categoría
export function getMedicationsByCategory(categoria: string): MedicationFull[] {
    return MEDICAMENTOS_DATABASE.filter(m => m.categoria === categoria);
}
