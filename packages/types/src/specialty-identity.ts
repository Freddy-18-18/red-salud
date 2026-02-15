/**
 * @file specialty-identity.ts
 * @description Identidad visual y taxonomía para las 132+ especialidades médicas.
 *
 * Define:
 * - Las 26 categorías de especialidades con su metadata visual
 * - La estructura de identidad de cada especialidad (icon, color, gradiente, slug)
 * - El mapeo entre IDs del master-list (`gen-1`, `car-1`) y slugs del sistema
 *
 * @module SpecialtyIdentity
 */

// ============================================================================
// CATEGORÍAS — Las 26 familias de especialidades
// ============================================================================

/**
 * Todas las categorías de la master-list.
 * Cada categoría agrupa especialidades afines y tiene una identidad visual propia.
 */
export type SpecialtyCategoryId =
  | 'general'         // Medicina General y Familiar
  | 'cardiovascular'  // Cardiología y Sistema Cardiovascular
  | 'neurologia'      // Neurología y Sistema Nervioso
  | 'digestivo'       // Sistema Digestivo
  | 'respiratorio'    // Sistema Respiratorio
  | 'renal'           // Sistema Renal y Urológico
  | 'endocrino'       // Endocrinología y Metabolismo
  | 'reumatologia'    // Reumatología y Sistema Musculoesquelético
  | 'hematologia'     // Hematología y Oncología
  | 'infectologia'    // Infectología e Inmunología
  | 'dermatologia'    // Dermatología
  | 'mental'          // Psiquiatría y Salud Mental
  | 'cirugia'         // Cirugía General y Subespecialidades
  | 'traumatologia'   // Traumatología y Ortopedia
  | 'oftalmologia'    // Oftalmología
  | 'orl'             // Otorrinolaringología
  | 'ginecologia'     // Ginecología y Obstetricia
  | 'pediatria'       // Pediatría y Neonatología
  | 'plastica'        // Cirugía Plástica y Reconstructiva
  | 'vascular'        // Cirugía Vascular
  | 'intensiva'       // Medicina Intensiva y Emergencias
  | 'diagnostico'     // Diagnóstico por Imágenes
  | 'anestesia'       // Anestesiología
  | 'patologia'       // Patología y Laboratorio
  | 'rehabilitacion'  // Medicina Física y Rehabilitación
  | 'especializada'   // Genética y Medicina Especializada
  | 'odontologia'     // Odontología y Subespecialidades
  | 'otros';          // Otras Especialidades

// ============================================================================
// METADATOS DE CATEGORÍA — Identidad visual por familia
// ============================================================================

/**
 * Identidad visual de una categoría de especialidades.
 * Controla el look-and-feel del dashboard y la navegación.
 */
export interface SpecialtyCategoryMeta {
  /** ID de la categoría */
  id: SpecialtyCategoryId;
  /** Nombre para mostrar: "Cardiología y Sistema Cardiovascular" */
  label: string;
  /** Descripción breve */
  description: string;
  /** Icono de Lucide */
  icon: string;
  /** Color primario (hex) — usado para badges, accents */
  color: string;
  /** Color de fondo claro (hex) — para cards, highlights */
  bgColor: string;
  /** Gradiente CSS — para headers, hero sections */
  gradient: string;
  /** Orden de display en UIs de selección */
  order: number;
  /** Cantidad de especialidades en esta categoría */
  specialtyCount: number;
  /**
   * Layout de dashboard que usa esta categoría.
   * Las categorías quirúrgicas tienen un layout diferente a las diagnósticas, etc.
   */
  dashboardLayout:
    | 'clinical-standard'     // Consulta → Historia → Receta (mayoría médicas)
    | 'surgical'              // Pre-op → Cirugía → Post-op
    | 'dental'                // Odontograma → Periodoncia → Imágenes
    | 'diagnostic-imaging'    // Estudios → Informes → Comparativa
    | 'emergency-critical'    // Triage → Monitoreo → Protocolos
    | 'mental-health'         // Sesiones → Notas → Seguimiento
    | 'pediatric'             // Crecimiento → Vacunas → Desarrollo
    | 'rehabilitation'        // Evaluación → Plan → Progreso
    | 'laboratory'            // Muestras → Análisis → Resultados
    | 'administrative';       // Gestión, registros, reportes
}

// ============================================================================
// IDENTIDAD DE ESPECIALIDAD — Tarjeta de identidad por especialidad
// ============================================================================

/**
 * Identidad completa de una especialidad individual.
 * Es la "tarjeta de identidad" que conecta todo:
 * - Master-list ID → Sistema de módulos
 * - Visual (color, icon) → Dashboard
 * - Category → Layout engine
 */
export interface SpecialtyIdentity {
  /** ID canónico del sistema: 'cardiology', 'dental-orthodontics', etc. */
  slug: string;

  /** ID del master-list: 'car-1', 'odo-2', etc. */
  masterId: string;

  /** Nombre completo: "Cardiología Intervencionista" */
  name: string;

  /** Nombre corto para tabs/badges: "Cardio. Interv." */
  shortName: string;

  /** Descripción (1-2 oraciones) para tooltips y onboarding */
  description: string;

  /** Categoría a la que pertenece */
  categoryId: SpecialtyCategoryId;

  // === Visual ===
  /** Icono principal de Lucide */
  icon: string;
  /** Color primario (hex) */
  color: string;
  /** Color de fondo claro (hex) */
  bgColor: string;
  /** Gradiente css para headers */
  gradient: string;

  // === Detección ===
  /** Keywords para auto-detección (normalizados, sin acentos) */
  keywords: string[];
  /** Códigos SACS (Venezuela) */
  sacsCodes?: string[];
  /** Códigos SNOMED CT */
  snomedCodes?: string[];

  // === Configuración de dashboard ===
  /** IDs de módulos que se habilitan por defecto para esta especialidad */
  defaultModuleIds: string[];

  /** KPIs priorizados en el dashboard */
  prioritizedKpis: string[];

  /** Tipo de citas por defecto */
  defaultAppointmentTypes: string[];

  /** Duración por defecto de cita (minutos) */
  defaultAppointmentDuration: number;

  /** Si soporta telemedicina */
  supportsTelemedicine: boolean;

  /** Si requiere verificación SACS/licencia para funciones avanzadas */
  requiresVerification: boolean;

  // === Metadata ===
  /** Si es una sub-especialidad (la especialidad padre es otra) */
  isSubSpecialty: boolean;

  /** Slug de la especialidad padre (si es sub-especialidad) */
  parentSlug?: string;

  /** Sub-especialidades que derivan de esta */
  childSlugs?: string[];
}

// ============================================================================
// MAPEO BIDIRECCIONAL
// ============================================================================

/**
 * Mapa completo de mapeo masterId ↔ slug.
 * Usado por el detector para resolver la especialidad del doctor.
 */
export interface SpecialtyIdMapping {
  /** Mapeo masterId → slug: 'car-1' → 'cardiology' */
  masterToSlug: Record<string, string>;
  /** Mapeo slug → masterId: 'cardiology' → 'car-1' */
  slugToMaster: Record<string, string>;
  /** Mapeo nombre → slug (normalizado, sin acentos) */
  nameToSlug: Record<string, string>;
}

// ============================================================================
// RESULTADO DE RESOLUCIÓN DE IDENTIDAD
// ============================================================================

/**
 * Resultado cuando se busca la identidad de un doctor.
 * Usado por el detector al resolver la especialidad desde el perfil.
 */
export interface IdentityResolution {
  /** Si se encontró una identidad exacta */
  resolved: boolean;
  /** La identidad encontrada (si existe) */
  identity: SpecialtyIdentity | null;
  /** La categoría meta (siempre disponible si resolved=true) */
  categoryMeta: SpecialtyCategoryMeta | null;
  /** Confianza de la resolución */
  confidence: 'exact' | 'keyword' | 'fuzzy' | 'fallback';
  /** Keyword que hizo match (si fue detección por keyword) */
  matchedKeyword?: string;
  /** Identidades alternativas que también coinciden */
  alternatives: SpecialtyIdentity[];
}
