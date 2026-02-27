"use client";

import { PerioToothData, PerioSite } from "@/types/dental";
import { PerioQuadrantTable } from "./perio-quadrant-table";

interface PeriodontogramGridProps {
    teeth: Record<number, PerioToothData>;
    onChange: (code: number, site: PerioSite, value: any) => void;
    isReadOnly?: boolean;
}

export function PeriodontogramGrid({ teeth, onChange, isReadOnly }: PeriodontogramGridProps) {
    return (
        <div className="flex flex-col gap-8 w-full overflow-x-auto p-4">

            {/* Upper Arch: Q1 and Q2 side by side */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <PerioQuadrantTable quadrant={1} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                <PerioQuadrantTable quadrant={2} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
            </div>

            {/* Lower Arch: Q4 and Q3 side by side */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <PerioQuadrantTable quadrant={4} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
                <PerioQuadrantTable quadrant={3} teeth={teeth} onChange={onChange} isReadOnly={isReadOnly} />
            </div>

        </div>
    );
}
