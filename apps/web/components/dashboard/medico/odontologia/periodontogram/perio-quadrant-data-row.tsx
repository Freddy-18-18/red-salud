"use client";

import { PerioSite, PerioToothData, getDepthSeverity, DEPTH_COLORS } from "@/types/dental";
import { cn } from "@red-salud/core/utils";
import { Input } from "@red-salud/ui";

interface PerioQuadrantDataRowProps {
    label: string;
    type: "probingDepth" | "recession" | "cal" | "bleeding" | "suppuration" | "plaque" | "furcation" | "mobility";
    toothCodes: number[];
    teeth: Record<number, PerioToothData>;
    onChange: (code: number, site: PerioSite, value: any) => void;
    isReadOnly?: boolean;
    reverse?: boolean; // If true, renders sites Right->Left (Mesial->Distal for Q1/Q4?)
}

export function PerioQuadrantDataRow({
    label,
    type,
    toothCodes,
    teeth,
    onChange,
    isReadOnly,
    reverse
}: PerioQuadrantDataRowProps) {

    // Is this a tooth-level property or site-level?
    const isToothProperty = type === "mobility";

    return (
        <div className="flex w-full items-stretch h-8 border-b border-gray-100 last:border-b-0 text-[10px]">
            {/* Label */}
            <div className="w-24 flex-shrink-0 bg-gray-50 flex items-center justify-end px-2 font-medium text-gray-600 truncate text-[10px] select-none border-r border-gray-200">
                {label}
            </div>

            {/* Cells */}
            <div className="flex flex-1">
                {toothCodes.map((code) => {
                    // Safety check for undefined data
                    const data = teeth[code] || {
                        toothCode: code,
                        measurements: {} as any,
                        mobility: 0,
                        implant: false,
                        missing: false
                    };

                    // Determine site order.
                    const quadrant = Math.floor(code / 10);
                    let sites: PerioSite[] = [];

                    if ([2, 3].includes(quadrant)) {
                        // Q2, Q3 (Left side of mouth in chart, Right side of patient)
                        // Displayed 21-28. 
                        // 21 Mesial is Left. 21 Distal is Right.
                        // Order: Mesial, Center, Distal.
                        if (label.includes("Vestibular") || label.includes("Bucal") || !label.includes("Palatino")) { // Default/Vestibular
                            sites = ["MB", "B", "DB"];
                        } else { // Lingual
                            sites = ["ML", "L", "DL"];
                        }
                    } else {
                        // Q1, Q4 (Right side of mouth in chart)
                        // Displayed 18-11.
                        // 18 Distal is Left. 18 Mesial is Right.
                        // Order: Distal, Center, Mesial.
                        if (label.includes("Vestibular") || label.includes("Bucal") || !label.includes("Palatino")) {
                            sites = ["DB", "B", "MB"];
                        } else {
                            sites = ["DL", "L", "ML"];
                        }
                    }

                    // If Tooth Property (Mobility), render a single cell spanning 3 sites
                    if (isToothProperty) {
                        return (
                            <div key={code} className="w-[48px] flex-shrink-0 flex items-center justify-center border-r border-gray-100 last:border-r-0 bg-gray-50/20">
                                {/* Mobility Input */}
                                <input
                                    type="text"
                                    className="w-full h-full text-center bg-transparent focus:outline-none p-0 text-[10px]"
                                    value={data.mobility > 0 ? data.mobility : ""}
                                    placeholder="-"
                                    disabled={isReadOnly || data.missing}
                                    onChange={(e) => {
                                        if (isReadOnly) return;
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val) && val >= 0 && val <= 3) {
                                            onChange(code, "B", { mobility: val });
                                        } else if (e.target.value === "") {
                                            onChange(code, "B", { mobility: 0 });
                                        }
                                    }}
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={code} className="w-[48px] flex-shrink-0 flex border-r border-gray-100 last:border-r-0">
                            {/* 3 Cells per tooth */}
                            {sites.map((site) => {
                                const measurement = data.measurements[site] || {};
                                const val = type === "probingDepth" ? measurement.probingDepth :
                                    type === "recession" ? measurement.recession :
                                        type === "furcation" ? measurement.furcation :
                                            null;

                                // Render logic based on type
                                if (type === "bleeding" || type === "suppuration" || type === "plaque") {
                                    const active = !!measurement[type];
                                    const colorClass = type === "bleeding" ? "bg-red-500" : type === "suppuration" ? "bg-yellow-400" : "bg-blue-400";
                                    return (
                                        <div key={site} className="flex-1 flex items-center justify-center border-r border-gray-50 last:border-r-0 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => !isReadOnly && onChange(code, site, { ...measurement, [type]: !active })}
                                        >
                                            <div className={cn("w-2 h-2 rounded-full border border-gray-300 transition-colors", active && colorClass)} />
                                        </div>
                                    );
                                }

                                if (type === "cal") {
                                    // Calculated
                                    const cal = (measurement.probingDepth || 0) + (measurement.recession || 0);
                                    const isHigh = cal >= 5; // Alert logic
                                    return (
                                        <div key={site} className={cn("flex-1 flex items-center justify-center border-r border-gray-50 last:border-r-0 text-[9px]", isHigh && "font-bold text-red-600")}>
                                            {cal > 0 ? cal : "-"}
                                        </div>
                                    );
                                }

                                if (type === "furcation") {
                                    return (
                                        <div key={site} className="flex-1 border-r border-gray-50 last:border-r-0">
                                            <input
                                                type="text"
                                                className="w-full h-full text-center bg-transparent focus:bg-blue-50 focus:outline-none p-0 text-[10px]"
                                                value={val || ""}
                                                onChange={(e) => {
                                                    if (isReadOnly) return;
                                                    const num = parseInt(e.target.value);
                                                    if (!isNaN(num) && num >= 1 && num <= 3) onChange(code, site, { ...measurement, [type]: num });
                                                    else if (e.target.value === "") onChange(code, site, { ...measurement, [type]: undefined });
                                                }}
                                                disabled={isReadOnly || data.missing}
                                            />
                                        </div>
                                    );
                                }

                                // Inputs (Number)
                                return (
                                    <div key={site} className="flex-1 border-r border-gray-50 last:border-r-0">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className={cn(
                                                "w-full h-full text-center bg-transparent focus:bg-blue-50 focus:outline-none p-0 text-[10px]",
                                                type === "probingDepth" && measurement.probingDepth > 3 && "text-red-500 font-bold",
                                                (data.missing || data.implant) && "bg-gray-50/50"
                                            )}
                                            value={val || ""}
                                            onChange={(e) => {
                                                if (isReadOnly) return;
                                                const num = parseInt(e.target.value) || 0;
                                                // Validation?
                                                if (isNaN(num)) return;
                                                if (e.target.value === "") onChange(code, site, { ...measurement, [type]: 0 });
                                                else onChange(code, site, { ...measurement, [type]: num });
                                            }}
                                            disabled={isReadOnly || data.missing}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
