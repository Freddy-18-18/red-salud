"use client";

/**
 * @file useImpactData.ts
 * @description Hook personalizado para obtener datos de impacto y cobertura
 */

import { useEffect, useState } from "react";
import { CoverageData, StatItem } from "./impact-section.types";
import { getBaseStats } from "./impact-section.data";

interface UseImpactDataReturn {
    /** Datos de cobertura geográfica */
    coverage: CoverageData | null;
    /** Indica si los datos están cargando */
    loading: boolean;
    /** Array de estadísticas ya formateadas */
    stats: StatItem[];
}

/**
 * Hook para obtener y formatear los datos de la sección de impacto
 * 
 * @returns {UseImpactDataReturn} Datos de cobertura, estado de carga y estadísticas formateadas
 * 
 * @example
 * const { coverage, loading, stats } = useImpactData();
 */
export function useImpactData(): UseImpactDataReturn {
    const [coverage, setCoverage] = useState<CoverageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function loadCoverage() {
            try {
                const res = await fetch("/api/public/geographic-coverage", {
                    cache: "no-store",
                });
                if (res.ok) {
                    const json = await res.json();
                    if (mounted && json.success) {
                        setCoverage(json.data);
                    }
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadCoverage();
        return () => {
            mounted = false;
        };
    }, []);

    // Construir estadísticas con datos dinámicos
    const baseStats = getBaseStats();
    const stats: StatItem[] = [
        {
            ...baseStats[0],
            value: "8",
            description: "en un ecosistema unificado",
        },
        {
            ...baseStats[1],
            value: loading
                ? "..."
                : coverage?.estadosConCobertura
                    ? `${coverage.estadosConCobertura}/${coverage.totalEstados}`
                    : "0/24",
            description: loading
                ? "calculando..."
                : coverage
                    ? `${coverage.porcentajePenetracion}% en Venezuela`
                    : "en Venezuela",
        },
        {
            ...baseStats[2],
            value: "24/7",
            description: "para atención continua",
        },
        {
            ...baseStats[3],
            value: "100%",
            description: "profesionales certificados",
        },
    ];

    return { coverage, loading, stats };
}
