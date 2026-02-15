"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    PerioToothData,
    PerioExam,
    PerioSite,
    calculateCAL,
    getDepthSeverity,
    PerioMeasurement
} from "@/types/dental";
import { cn } from "@red-salud/core/utils";
import { PeriodontogramGrid } from "./periodontogram-grid";
import {
    AlertTriangle,
    Save,
    RotateCcw,
    Printer,
    Info
} from "lucide-react";
import { Button } from "@red-salud/ui";

interface PeriodontogramProps {
    examData?: PerioExam;
    teeth?: Record<number, PerioToothData>; // Controlled state
    onDataChange?: (teeth: Record<number, PerioToothData>) => void;
    readOnly?: boolean;
    className?: string;
    comparisonData?: PerioExam;
}

export function PeriodontogramProfessional({
    examData,
    teeth: controlledTeeth,
    onDataChange,
    readOnly = false,
    className,
    comparisonData,
}: PeriodontogramProps) {
    // Internal state if uncontrolled
    const [internalTeeth, setInternalTeeth] = useState<Record<number, PerioToothData>>({});

    // Use controlled state if provided, otherwise internal
    const teeth = controlledTeeth || internalTeeth;

    // Initialize teeth if empty
    useEffect(() => {
        if (!controlledTeeth && Object.keys(internalTeeth).length === 0) {
            const initialTeeth: Record<number, PerioToothData> = {};
            // Initialize basic data for all permanent teeth
            const allTeeth = [
                18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
                48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
            ];
            allTeeth.forEach(code => {
                initialTeeth[code] = {
                    toothCode: code,
                    mobility: 0,
                    implant: false,
                    missing: false,
                    measurements: {
                        MB: { toothCode: code, site: "MB", probingDepth: 0, recession: 0, bleeding: false, suppuration: false, plaque: false },
                        B: { toothCode: code, site: "B", probingDepth: 0, recession: 0, bleeding: false, suppuration: false, plaque: false },
                        DB: { toothCode: code, site: "DB", probingDepth: 0, recession: 0, bleeding: false, suppuration: false, plaque: false },
                        ML: { toothCode: code, site: "ML", probingDepth: 0, recession: 0, bleeding: false, suppuration: false, plaque: false },
                        L: { toothCode: code, site: "L", probingDepth: 0, recession: 0, bleeding: false, suppuration: false, plaque: false },
                        DL: { toothCode: code, site: "DL", probingDepth: 0, recession: 0, bleeding: false, suppuration: false, plaque: false },
                    }
                };
            });
            setInternalTeeth(initialTeeth);
            // If onDataChange is provided but controlledTeeth is not? 
            // Usually controlled pattern requires both or neither.
            if (onDataChange) onDataChange(initialTeeth);
        }
    }, [controlledTeeth, internalTeeth, onDataChange]);

    // Handle updates
    // Helper to update a specific measurement or tooth property
    const handleUpdate = (code: number, site: PerioSite, newValue: any) => {
        if (readOnly) return;

        const currentTooth = teeth[code];
        if (!currentTooth) return;

        // Check if we are updating a tooth property (mobility, implant, missing)
        // In PerioQuadrantDataRow, we passed "B" as site for mobility updates but payload was { mobility: val }
        // We need to merge this correctly.

        // Safety: check if newValue has mobility or implant keys
        const isToothProp = "mobility" in newValue || "implant" in newValue || "missing" in newValue;

        const newToothData = { ...currentTooth };

        if (isToothProp) {
            // Update root properties
            Object.assign(newToothData, newValue);
        } else {
            // Update measurement
            newToothData.measurements = {
                ...newToothData.measurements,
                [site]: { ...(newToothData.measurements[site] || {}), ...newValue }
            };
        }

        const newTeeth = { ...teeth, [code]: newToothData };

        if (controlledTeeth && onDataChange) {
            onDataChange(newTeeth);
        } else {
            setInternalTeeth(newTeeth);
            if (onDataChange) onDataChange(newTeeth);
        }
    };

    // Stats calculation
    const stats = calculateStats(teeth);

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Summary Stats Header used in previous version - keep it for value */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Sangrado (BOP)</span>
                    <span className={cn("text-2xl font-bold", stats.bopPercentage > 20 ? "text-red-600" : "text-gray-900")}>
                        {stats.bopPercentage}%
                    </span>
                    <span className="text-xs text-gray-400">{stats.bopSites} sitios</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Placa</span>
                    <span className={cn("text-2xl font-bold", stats.plaquePercentage > 20 ? "text-yellow-600" : "text-gray-900")}>
                        {stats.plaquePercentage}%
                    </span>
                    <span className="text-xs text-gray-400">{stats.plaqueSites} sitios</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Prof. {">"} 3mm</span>
                    <span className={cn("text-2xl font-bold", stats.deepPockets > 0 ? "text-orange-600" : "text-gray-900")}>
                        {stats.deepPockets}
                    </span>
                    <span className="text-xs text-gray-400">sitios</span>
                </div>
                {/* Add Furcation/Mobility counts? */}
            </div>

            {/* New Grid Layout */}
            <PeriodontogramGrid teeth={teeth} onChange={handleUpdate} isReadOnly={readOnly} />

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span> Sangrado
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-400"></span> Placa
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span> Supuración
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 border border-black"></span> Margen Gingival
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-black/10"></span> Bolsa Periodontal
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-red-500 font-bold">4+</span> Bolsa Profunda
                </div>
            </div>
        </div>
    );
}

// Helpers
function calculateStats(teeth: Record<number, PerioToothData>) {
    let totalSites = 0;
    let bopSites = 0;
    let plaqueSites = 0;
    let deepPockets = 0;

    Object.values(teeth).forEach(tooth => {
        if (tooth.missing) return;
        Object.values(tooth.measurements).forEach(m => {
            totalSites++;
            if (m.bleeding) bopSites++;
            if (m.plaque) plaqueSites++;
            if (m.probingDepth > 3) deepPockets++;
        });
    });

    const bopPercentage = totalSites > 0 ? Math.round((bopSites / totalSites) * 100) : 0;
    const plaquePercentage = totalSites > 0 ? Math.round((plaqueSites / totalSites) * 100) : 0;

    return { bopPercentage, bopSites, plaquePercentage, plaqueSites, deepPockets };
}
