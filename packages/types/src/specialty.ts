import { ModuleGroup } from './module';

/**
 * High-level specialty categories for organization
 */
export type SpecialtyCategory =
    | 'surgical'       // Cirugía general, especialidades quirúrgicas
    | 'medical'        // Medicina interna y sub-especialidades
    | 'dental'         // Odontología y especialidades dentales
    | 'diagnostic'     // Radiología, patología, laboratorio
    | 'pediatric'      // Pediatría y sub-especialidades
    | 'obgyn'          // Ginecología y obstetricia
    | 'psychiatric'    // Psiquiatría y salud mental
    | 'emergency'      // Medicina de emergencias
    | 'critical_care'  // Cuidados intensivos
    | 'primary_care'   // Medicina familiar, general
    | 'allied'         // Profesiones aliadas (enfermería, terapia, etc.)
    | 'other';         // Otras especialidades

/**
 * Specialty module configuration
 * Each specialty has multiple modules organized by groups
 */
export interface SpecialtyModule {
    // Identification
    key: string;                      // Unique key: "dental-periodontogram", "cardio-ecg"
    label: string;                    // Display name: "Periodontograma", "Electrocardiograma"
    icon: string;                     // Lucide icon name: "Gum", "Heart"
    route: string;                    // Route path: "/dashboard/medico/odontologia/periodontograma"
    description?: string;             // Optional description for tooltips/menus

    // Organization
    group: ModuleGroup;               // Which group this belongs to
    order?: number;                   // Display order within group (default: alphabetical)

    // Access control
    requiredPermissions?: string[];   // Required permissions to access
    requiresVerification?: boolean;   // Whether professional verification is required

    // Component
    componentPath?: string;           // Dynamic import path for lazy loading

    // Configuration
    settings?: Record<string, unknown>; // Module-specific configuration
    enabledByDefault?: boolean;       // Whether enabled by default for the specialty

    // KPIs
    kpiKeys?: string[];               // KPIs this module contributes to
}

/**
 * Complete specialty configuration
 * This defines everything about a specialty experience
 */
export interface SpecialtyConfig {
    // ==================== IDENTIFICATION ====================
    id: string;                       // Unique ID: "dental", "cardiology", "orthopedics"
    name: string;                     // Display name: "Odontología", "Cardiología"
    slug: string;                     // URL-friendly: "odontologia", "cardiologia"

    // ==================== DETECTION ====================
    category: SpecialtyCategory;      // High-level category
    keywords: string[];               // Keywords for auto-detection
    sacsCodes?: string[];             // SACS specialty codes for Venezuelan doctors
    snomedCodes?: string[];           // SNOMED CT codes for international use

    // ==================== DASHBOARD ====================
    dashboardVariant: string;         // Variant identifier
    dashboardPath?: string;           // Custom dashboard path (default: /dashboard/medico/{slug})

    // ==================== MODULES ====================
    // Organized by group for better UX
    modules: {
        clinical?: SpecialtyModule[];
        financial?: SpecialtyModule[];
        lab?: SpecialtyModule[];
        technology?: SpecialtyModule[];
        communication?: SpecialtyModule[];
        growth?: SpecialtyModule[];
        administrative?: SpecialtyModule[];
        education?: SpecialtyModule[];
    };

    // ==================== WIDGETS ====================
    widgets?: {
        key: string;
        component: string;              // Component path for dynamic import
        size: 'small' | 'medium' | 'large' | 'full';
        position?: { row: number; col: number };
        required?: boolean;             // If true, always shown
    }[];

    // ==================== KPIs ====================
    prioritizedKpis: string[];        // KPIs to prioritize in dashboard
    kpiDefinitions?: Record<string, {
        label: string;
        format: 'percentage' | 'currency' | 'number' | 'duration';
        goal?: number;
        direction: 'higher_is_better' | 'lower_is_better';
    }>;

    // ==================== SETTINGS ====================
    settings?: {
        appointmentTypes?: string[];
        defaultDuration?: number;       // Default appointment duration in minutes
        allowOverlap?: boolean;
        requiresClinicalTemplates?: boolean;
        clinicalTemplateCategories?: string[];
        usesTreatmentPlans?: boolean;
        requiresInsuranceVerification?: boolean;
        supportsImagingIntegration?: boolean;
        supportsTelemedicine?: boolean;
        customFlags?: Record<string, boolean>;
        defaultView?: string;
        enableChat?: boolean;
        enablePrescriptions?: boolean;
        enableLab?: boolean;
        enableTelemedicine?: boolean;
    };

    // ==================== VISUAL ====================
    theme?: {
        primaryColor?: string;
        accentColor?: string;
        icon?: string;
    };
}

/**
 * Context for determining which specialty config to use
 */
export interface SpecialtyContext {
    specialtySlug?: string | null;
    specialtyName?: string | null;
    subSpecialties?: string[] | null;
    sacsCodigo?: string | null;
    sacsEspecialidad?: string | null;
    forceSpecialtyId?: string;
    forceDashboardVariant?: string;
    userRole?: 'medico' | 'profesional_salud' | 'tecnico_salud';
    verificationLevel?: string;
}

/**
 * Result of specialty detection
 */
export interface SpecialtyDetectionResult {
    detected: boolean;
    specialtyId: string | null;
    confidence: 'certain' | 'likely' | 'possible' | 'none';
    matchedKeyword?: string;
    alternativeIds?: string[];
}

/**
 * Specialty menu group for sidebar navigation
 */
export interface SpecialtyMenuGroup {
    label: string;
    icon?: string;
    items: Array<{
        key: string;
        label: string;
        icon: string;
        route: string;
        badge?: string | number;
        description?: string;
    }>;
    order?: number;
}

export type SpecialtyId = string;
export type ModuleKey = string;
