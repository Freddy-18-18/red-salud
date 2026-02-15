// ============================================
// SPECIALTY EXPERIENCE SYSTEM - Core Types
// Scalable architecture for 132+ medical specialties
// ============================================

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
 * Module groups for organizing specialty features
 */
export type ModuleGroup =
  | 'clinical'       // Gestión clínica, consultas, historias
  | 'financial'      // Presupuestos, seguros, facturación, RCM
  | 'lab'            // Laboratorio, estudios diagnósticos
  | 'technology'     // Imágenes, IA, modelos 3D, telemedicina
  | 'communication'  // Mensajería, videollamadas, seguimiento
  | 'growth'         // Marketing, análisis, crecimiento
  | 'administrative' // Gestión administrativa, inventarios
  | 'education';     // Educación, capacitación, investigación

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
  // Dashboard widgets for this specialty
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
  // Specialty-specific settings
  settings?: {
    // Appointment settings
    appointmentTypes?: string[];
    defaultDuration?: number;       // Default appointment duration in minutes
    allowOverlap?: boolean;

    // Clinical settings
    requiresClinicalTemplates?: boolean;
    clinicalTemplateCategories?: string[];

    // Financial settings
    usesTreatmentPlans?: boolean;
    requiresInsuranceVerification?: boolean;

    // Technology settings
    supportsImagingIntegration?: boolean;
    supportsTelemedicine?: boolean;

    // Custom flags
    customFlags?: Record<string, boolean>;
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
  // Direct slug resolution (highest priority after forceSpecialtyId)
  specialtySlug?: string | null;

  // From user profile
  specialtyName?: string | null;
  subSpecialties?: string[] | null;
  sacsCodigo?: string | null;
  sacsEspecialidad?: string | null;

  // For development/testing
  forceSpecialtyId?: string;
  forceDashboardVariant?: string;

  // Additional context
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

// ============================================
// PREDEFINED SPECIALTY IDs
// ============================================

/**
 * Specialty ID type.
 *
 * Uses string for flexibility — the 132 valid slugs are defined in
 * ALL_SPECIALTY_IDENTITIES (identity/specialty-identities.ts).
 *
 * Legacy English IDs ('dental', 'cardiology', 'pediatrics') are mapped
 * to their Spanish slug equivalents via LEGACY_ID_MAP.
 */
export type SpecialtyId = string;

/**
 * Maps legacy English IDs to canonical Spanish slugs.
 * Used by the registry and detector for backwards compatibility.
 */
export const LEGACY_ID_MAP: Record<string, string> = {
  // Old English IDs → new Spanish slugs
  'dental': 'odontologia-general',
  'dental-orthodontics': 'ortodoncia',
  'dental-oral-surgery': 'cirugia-oral',
  'dental-periodontics': 'periodoncia',
  'dental-pediatric': 'odontopediatria',
  'dental-endodontics': 'endodoncia',
  'dental-prosthodontics': 'protesis-dental',
  'dental-pathology': 'patologia-oral',
  'dental-radiology': 'radiologia-oral',
  'dental-implantology': 'implantologia',
  'cardiology': 'cardiologia',
  'dermatology': 'dermatologia',
  'endocrinology': 'endocrinologia',
  'gastroenterology': 'gastroenterologia',
  'hematology': 'hematologia',
  'infectious-disease': 'infectologia',
  'nephrology': 'nefrologia',
  'neurology': 'neurologia',
  'oncology': 'oncologia',
  'pulmonology': 'neumologia',
  'rheumatology': 'reumatologia',
  'general-surgery': 'cirugia-general',
  'cardiac-surgery': 'cirugia-cardiovascular',
  'neurosurgery': 'neurocirugia',
  'orthopedics': 'traumatologia',
  'plastic-surgery': 'cirugia-plastica',
  'vascular-surgery': 'cirugia-vascular',
  'pediatric-surgery': 'cirugia-pediatrica',
  'family-medicine': 'medicina-familiar',
  'internal-medicine': 'medicina-interna',
  'pediatrics': 'pediatria',
  'obstetrics-gynecology': 'ginecologia',
  'psychiatry': 'psiquiatria',
  'radiology': 'radiologia',
  'pathology': 'patologia',
  'anesthesiology': 'anestesiologia',
  'emergency-medicine': 'emergencia',
  'critical-care': 'medicina-critica',
  'physical-therapy': 'fisioterapia',
  'occupational-therapy': 'terapia-ocupacional',
  'nutrition': 'nutriologia',
  'psychology': 'psicologia',
  'default': 'medicina-general',
};

// ============================================
// HELPER TYPES
// ============================================

/**
 * Dynamic import result for specialty components
 */
export type SpecialtyComponent<T = unknown> = React.ComponentType<T>;

/**
 * Map of specialty configs
 */
export type SpecialtyRegistry = Map<SpecialtyId, SpecialtyConfig>;

/**
 * Module key type (all possible module keys across all specialties)
 */
export type ModuleKey = string;
