"use client";

import { PerioToothData, PerioSite } from "@/types/dental";
import { PerioQuadrantDataRow } from "./perio-quadrant-data-row";
import { PerioVisualRow } from "./perio-visual-row";

interface PerioQuadrantTableProps {
    quadrant: number;
    teeth: Record<number, PerioToothData>;
    onChange: (code: number, site: PerioSite, value: any) => void;
    isReadOnly?: boolean;
}

export function PerioQuadrantTable({ quadrant, teeth, onChange, isReadOnly }: PerioQuadrantTableProps) {
    // Define tooth codes for this quadrant
    // Q1: 18-11
    // Q2: 21-28
    // Q3: 31-38
    // Q4: 48-41

    const getCodes = (q: number) => {
        if (q === 1) return [18, 17, 16, 15, 14, 13, 12, 11];
        if (q === 2) return [21, 22, 23, 24, 25, 26, 27, 28];
        if (q === 3) return [31, 32, 33, 34, 35, 36, 37, 38]; // Wait, Q3 is usually display below Q2?
        // Standard Layout:
        // Q1  Q2
        // Q4  Q3  <-- Correct?
        // 18-11 | 21-28
        // 48-41 | 31-38
        // SEPA usually aligns 11 over 41 and 21 over 31.

        if (q === 4) return [48, 47, 46, 45, 44, 43, 42, 41];
        return [];
    };

    const codes = getCodes(quadrant);
    const isUpper = quadrant === 1 || quadrant === 2;

    // SEPA Order depends on Arch
    // Upper: 
    //   Vestibular Data
    //   Vestibular Visual
    //   Palatal Visual
    //   Palatal Data

    // Lower:
    //   Lingual Data
    //   Lingual Visual
    //   Vestibular Visual
    //   Vestibular Data

    const isVestibularFirst = isUpper;

    return (
        <div className="flex flex-col border border-gray-300 bg-white shadow-sm">
            {/* Header */}
            <div className="bg-gray-100 text-center font-bold text-sm py-1 border-b border-gray-200">
                Cuadrante {quadrant}
            </div>

            {/* Upper Arch Layout (Sandwich Top-Down: Vestibular -> Visual -> Palatal) */}
            {isUpper && (
                <>
                    <PerioQuadrantDataRow label="Implante/Mov" type="furcation" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Placa" type="plaque" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Sangrado" type="bleeding" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="MG (Recesión)" type="recession" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Prof. Sondaje" type="probingDepth" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="NIC (CAL)" type="cal" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />

                    {/* Visuals */}
                    <PerioVisualRow toothCodes={codes} teeth={teeth} isUpper={true} isLingual={false} />
                    <PerioVisualRow toothCodes={codes} teeth={teeth} isUpper={true} isLingual={true} />

                    {/* Palatal Data - Inverted order? Usually Palatal rows are mirrored? 
                    Actually, for Q1, Palatal Data is below.
                    Labels usually: PS, MG, Bleeding, etc.
                */}
                    <PerioQuadrantDataRow label="Prof. Sondaje" type="probingDepth" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="MG (Recesión)" type="recession" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Sangrado" type="bleeding" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Placa" type="plaque" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                </>
            )}

            {/* Lower Arch Layout (Sandwich Top-Down: Lingual -> Visual -> Vestibular) */}
            {!isUpper && (
                <>
                    {/* Lingual Data */}
                    <PerioQuadrantDataRow label="Placa" type="plaque" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Sangrado" type="bleeding" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="MG (Recesión)" type="recession" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Prof. Sondaje" type="probingDepth" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />

                    {/* Visuals */}
                    <PerioVisualRow toothCodes={codes} teeth={teeth} isUpper={false} isLingual={true} />
                    <PerioVisualRow toothCodes={codes} teeth={teeth} isUpper={false} isLingual={false} />

                    {/* Vestibular Data */}
                    <PerioQuadrantDataRow label="NIC (CAL)" type="cal" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Prof. Sondaje" type="probingDepth" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="MG (Recesión)" type="recession" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Sangrado" type="bleeding" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Placa" type="plaque" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                    <PerioQuadrantDataRow label="Implante/Mov" type="furcation" toothCodes={codes} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                </>
            )}
        </div>
    );
}
