// =============================================================================
// Dental Types — Shared across all dental/odontology modules
// =============================================================================

// ─── Tooth & Surface ─────────────────────────────────────────────────────────
export type ToothCode = number; // 11-48 (FDI) or 51-85 (primary)
export type SurfaceCode = "M" | "D" | "O" | "B" | "L" | "I"; // Mesial, Distal, Oclusal, Bucal, Lingual, Incisal
export type PerioSite = "MB" | "B" | "DB" | "ML" | "L" | "DL";

export const PERMANENT_TEETH_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
export const PERMANENT_TEETH_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;
export const ALL_PERMANENT_TEETH = [...PERMANENT_TEETH_UPPER, ...PERMANENT_TEETH_LOWER] as const;

export const PERIO_SITES: PerioSite[] = ["MB", "B", "DB", "ML", "L", "DL"];

// ─── Periodontogram ──────────────────────────────────────────────────────────
export interface PerioMeasurement {
    toothCode: ToothCode;
    site: PerioSite;
    probingDepth: number; // mm
    recession: number;    // mm (positive = recession, negative = hyperplasia)
    bleeding: boolean;
    suppuration: boolean;
    plaque: boolean;
    furcation?: 1 | 2 | 3; // Furcation grade for specific sites (usually B/L on molars)
}

export interface PerioToothData {
    toothCode: ToothCode;
    mobility: 0 | 1 | 2 | 3;
    implant: boolean;
    missing: boolean;
    notes?: string;
    measurements: Record<PerioSite, PerioMeasurement>;
    furcation?: 1 | 2 | 3;
}

export interface PerioExam {
    id: string;
    patient_id: string; // Snake case for Supabase
    doctor_id: string;
    exam_date: string;
    teeth: Record<number, PerioToothData>;
    notes: string;
    created_at: string;
    updated_at: string;
}

// Helper functions (logic only, no Supabase)
export function calculateCAL(probing: number, recession: number): number {
    return probing + recession; // Clinical Attachment Loss
}

export function getDepthSeverity(depth: number): "healthy" | "mild" | "moderate" | "severe" {
    if (depth <= 3) return "healthy";
    if (depth <= 5) return "mild";
    if (depth <= 7) return "moderate";
    return "severe";
}
