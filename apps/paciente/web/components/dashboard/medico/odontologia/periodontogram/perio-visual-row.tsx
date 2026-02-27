"use client";

import { useMemo } from "react";
import { PerioToothData, PerioSite, calculateCAL, getDepthSeverity, DEPTH_COLORS } from "@/types/dental";
import { cn } from "@red-salud/core/utils";
import { getToothPath } from "./perio-paths";

interface PerioVisualRowProps {
    toothCodes: number[];
    teeth: Record<number, PerioToothData>;
    isUpper: boolean; // Determines layout order (root up/down)
    isLingual: boolean; // Determines if we are looking from inside
}

export function PerioVisualRow({ toothCodes, teeth, isUpper, isLingual }: PerioVisualRowProps) {
    // Constants for dimensions
    const TOOTH_WIDTH = 48; // px
    const TOOTH_HEIGHT = 100; // px
    const MARGIN_LEVEL = isUpper ? 35 : 65; // Y coordinate where CEJ starts roughly

    // We need to construct the polyline points for the whole arch (or quadrant)
    // But since we render tooth by tooth in the grid, we might render individual SVGs for each tooth
    // and manage the connections. However, a continuous line is better.
    // For the grid layout, we are likely constrained to columns.
    // Let's render individual SVGs but try to make the lines connect visually.

    return (
        <div className="flex bg-white border-y border-gray-200 h-[100px] overflow-hidden">
            {toothCodes.map((code) => {
                const data = teeth[code] || {
                    toothCode: code,
                    measurements: {} as any,
                    mobility: 0,
                    implant: false,
                    missing: false
                };
                const path = getToothPath(code);

                // Define sites order for this tooth
                // Standard view (Vestibular Q1): 18 -> 17 ... 
                // 18 Visual: Left is Distal, Middle is B, Right is Mesial

                // Site Mapping based on Quadrant and View (Vestibular vs Lingual)
                // Q1 (18-11) Vestibular: Distal -> Mesial (Left -> Right on screen)?
                // Wait, standard chart:
                // Q1: 18 (Leftmost) -> 11 (Rightmost of Q1)
                // For 18: Distal is Left, Mesial is Right.

                // Q2 (21-28) Vestibular: 21 (Leftmost) -> 28 (Rightmost)
                // For 21: Mesial is Left, Distal is Right.

                // This is tricky. Let's strictly follow the site order per tooth displayed.
                // We will pass an ordered array of sites to map to [Left, Center, Right] x positions.

                const quadrant = Math.floor(code / 10);
                let leftSite: PerioSite, centerSite: PerioSite, rightSite: PerioSite;

                if (isLingual) {
                    // Palatal/Lingual View
                    // Q1 (18-11): Palatal. 18 is Left. 18 DL is Left? 
                    // Standard chart usually maps sites 1,2,3 corresponding to input columns.
                    if (quadrant === 1) { // 18-11
                        // Visual Left to Right: Distal -> Mesial
                        leftSite = "DL"; centerSite = "L"; rightSite = "ML";
                    } else if (quadrant === 2) { // 21-28
                        // Visual Left to Right: Mesial -> Distal
                        leftSite = "ML"; centerSite = "L"; rightSite = "DL";
                    } else if (quadrant === 3) { // 31-38
                        // Visual Left to Right: Mesial -> Distal
                        leftSite = "ML"; centerSite = "L"; rightSite = "DL";
                    } else { // 48-41
                        // Visual Left to Right: Distal -> Mesial
                        leftSite = "DL"; centerSite = "L"; rightSite = "ML";
                    }
                } else {
                    // Vestibular View
                    if (quadrant === 1) {
                        // 18 (Left) -> 11. 18 Distal is Left.
                        leftSite = "DB"; centerSite = "B"; rightSite = "MB";
                    } else if (quadrant === 2) {
                        // 21 -> 28 (Right). 21 Mesial is Left. 
                        leftSite = "MB"; centerSite = "B"; rightSite = "DB";
                    } else if (quadrant === 3) { // 31 (Left) -> 38
                        leftSite = "MB"; centerSite = "B"; rightSite = "DB";
                    } else { // 48 (Left) -> 41 ?? No, 41 is usually neighbors with 31.
                        // Standard odontogram: 
                        // Q1 (18..11) | Q2 (21..28)
                        // Q4 (48..41) | Q3 (31..38)

                        // WAIT. Standard display:
                        // 18 17 ... 11 | 21 ... 27 28
                        // 48 47 ... 41 | 31 ... 37 38

                        // So:
                        // Q1: 18 is Left. 18 Distal is Left edge.
                        // Q2: 21 is Left. 21 Mesial is Left edge.
                        // Q4: 48 is Left. 48 Distal is Left edge.
                        // Q3: 31 is Left. 31 Mesial is Left edge.

                        // Let's verify Q4 (48...41). 
                        // If displayed 48...41 (Left to Right), then 48 is on Left. 
                        // 48 Distal is Left.

                        leftSite = "DB"; centerSite = "B"; rightSite = "MB";
                    }
                }

                // Get values
                // const mLeft = data.measurements[leftSite];
                // const mCenter = data.measurements[centerSite];
                // const mRight = data.measurements[rightSite];

                // Helper to get Y coordinate for a value (mm)
                // Scale: 3px per mm?
                const SCALE = 2; // px per mm
                const getMBY = (rec: number) => {
                    // Margin: if isUpper, positive recession means UP (away from crown)? 
                    // No, Recession is ALWAYS apical migration.
                    // Upper: Root is UP (top), Crown DOWN. CEJ at ~35.
                    // Recession (+): Margin moves UP (apical). y = 35 - (val * scale)
                    // Hyperplasia (-): Margin moves DOWN (coronal). y = 35 - (-val * scale) = 35 + val*scale

                    // Lower: Root is DOWN (bottom), Crown UP. CEJ at ~65.
                    // Recession (+): Margin moves DOWN (apical). y = 65 + (val * scale)

                    if (isUpper) {
                        return MARGIN_LEVEL - ((rec || 0) * SCALE);
                    } else {
                        return MARGIN_LEVEL + ((rec || 0) * SCALE);
                    }
                };

                const getPDY = (rec: number, depth: number) => {
                    // Probe depth is always measured from Margin, going Apically.
                    // Upper: Margin Y - (depth * scale)
                    // Lower: Margin Y + (depth * scale)
                    const mY = getMBY(rec);
                    if (isUpper) {
                        return mY - ((depth || 0) * SCALE);
                    } else {
                        return mY + ((depth || 0) * SCALE);
                    }
                };

                // Calculate points
                // x positions: 20%, 50%, 80%
                const x1 = TOOTH_WIDTH * 0.2;
                const x2 = TOOTH_WIDTH * 0.5;
                const x3 = TOOTH_WIDTH * 0.8;

                const mLeft = data.measurements[leftSite];
                const mCenter = data.measurements[centerSite];
                const mRight = data.measurements[rightSite];

                const ym1 = getMBY(mLeft?.recession || 0);
                const ym2 = getMBY(mCenter?.recession || 0);
                const ym3 = getMBY(mRight?.recession || 0);

                const yp1 = getPDY(mLeft?.recession || 0, mLeft?.probingDepth || 0);
                const yp2 = getPDY(mCenter?.recession || 0, mCenter?.probingDepth || 0);
                const yp3 = getPDY(mRight?.recession || 0, mRight?.probingDepth || 0);

                // Polygon for Pocket (area between margin and depth)
                const pocketPoints = `
             ${x1},${ym1} ${x2},${ym2} ${x3},${ym3}
             ${x3},${yp3} ${x2},${yp2} ${x1},${yp1}
        `;

                // Line for Margin
                const marginPoints = `${x1},${ym1} ${x2},${ym2} ${x3},${ym3}`;

                return (
                    <div key={code} className="relative border-r border-gray-100 last:border-r-0 flex-shrink-0" style={{ width: TOOTH_WIDTH, height: TOOTH_HEIGHT }}>
                        {/* Tooth SVG */}
                        <svg
                            viewBox="0 0 60 100"
                            className={cn("absolute inset-0 w-full h-full",
                                data.missing && "opacity-20",
                                !isUpper && "transform" // No rotate needed if paths are already correct? 
                                // My paths for Lower crown are drawn at bottom (y=60) and root down (y=90).
                                // But standard view is usually: Upper teeth on top row, roots pointing up. Lower teeth on bottom row, roots pointing down.
                                // Wait, my paths:
                                // Upper: Crown at 35..80. Root 10..40. Wait, paths are weird. Use css helper.
                            )}
                        >
                            {/* Root */}
                            <path d={path.root} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
                            {/* Crown */}
                            <path d={path.crown} fill="white" stroke="#9ca3af" strokeWidth="1" />

                            {/* Implant? */}
                            {data.implant && (
                                <text x="30" y={isUpper ? 20 : 80} textAnchor="middle" fontSize="10" fill="blue" fontWeight="bold">IMP</text>
                            )}

                            {/* Missing? */}
                            {data.missing && (
                                <line x1="10" y1="10" x2="50" y2="90" stroke="red" strokeWidth="2" />
                            )}

                            {/* Pocket Poly (Red/Warning) */}
                            {/* We just draw lines for now, filling might be messy without control points */}
                            <polyline points={pocketPoints} fill="rgba(255,0,0,0.3)" stroke="none" />

                            {/* Margin Line (Blue) */}
                            <polyline points={marginPoints} fill="none" stroke="blue" strokeWidth="2" />

                            {/* Depth Line (Red if > 3 else black?) */}
                            <line x1={x1} y1={ym1} x2={x1} y2={yp1} stroke={getDepthSeverity(mLeft?.probingDepth || 0) === 'healthy' ? 'black' : 'red'} strokeWidth="1" />
                            <line x1={x2} y1={ym2} x2={x2} y2={yp2} stroke={getDepthSeverity(mCenter?.probingDepth || 0) === 'healthy' ? 'black' : 'red'} strokeWidth="1" />
                            <line x1={x3} y1={ym3} x2={x3} y2={yp3} stroke={getDepthSeverity(mRight?.probingDepth || 0) === 'healthy' ? 'black' : 'red'} strokeWidth="1" />

                            {/* Furcation Markers */}
                            {/* Logic to place furcation markers ... skipped for brevity, can add later */}

                        </svg>

                        {/* Mobility Badge */}
                        {data.mobility > 0 && (
                            <div className="absolute top-1 right-1 bg-red-100 text-red-600 text-[8px] px-1 rounded">
                                M{data.mobility}
                            </div>
                        )}

                        {/* Tooth Number */}
                        <div className={cn("absolute left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400", isUpper ? "bottom-1" : "top-1")}>
                            {code}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
