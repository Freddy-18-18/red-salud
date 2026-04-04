// ============================================
// MODULE REGISTRY — Lazy-loaded module components
// Maps module keys to dynamic imports for code-splitting
// ============================================

import { lazy, type ComponentType } from 'react';

// ============================================================================
// MODULE COMPONENT PROPS
// ============================================================================

/**
 * Props that every module component receives from the renderer.
 */
export interface ModuleComponentProps {
  doctorId: string;
  patientId?: string;
  specialtySlug: string;
  config?: Record<string, unknown>;
  themeColor?: string;
}

// ============================================================================
// REGISTRY
// ============================================================================

/**
 * Registry of lazy-loaded module components.
 * Each key matches a module ID from the catalog (e.g., 'lab-imaging', 'lab-orders').
 *
 * Static imports are required for Turbopack compatibility.
 */
const MODULE_REGISTRY: Record<string, ComponentType<ModuleComponentProps>> = {
  // ── Cross-specialty modules ──────────────────────────────────
  'diagnostic-imaging': lazy(() => import('./diagnostic-imaging/diagnostic-imaging-module')),
  'lab-imaging': lazy(() => import('./diagnostic-imaging/diagnostic-imaging-module')),
  'lab-orders': lazy(() => import('./lab-orders/lab-orders-module')),
  'clinical-templates': lazy(() => import('./clinical-templates/clinical-templates-module')),
  'treatment-plans': lazy(() => import('./treatment-plans/treatment-plans-module')),

  // ── Dental specialty ─────────────────────────────────────────
  'dental-periodontogram': lazy(() => import('./dental/periodontogram-module')),
  'dental-odontogram': lazy(() => import('./dental/odontogram-module')),
  'dental-imaging': lazy(() => import('./diagnostic-imaging/diagnostic-imaging-module')),

  // ── Cardiology specialty ─────────────────────────────────────
  'cardiology-ecg': lazy(() => import('./cardiology/ecg-module')),

  // ── Pediatrics specialty ─────────────────────────────────────
  'pediatrics-growth': lazy(() => import('./pediatrics/growth-curves-module')),
  'pediatrics-growth-curves': lazy(() => import('./pediatrics/growth-curves-module')),
  'pediatrics-vaccination': lazy(() => import('./pediatrics/vaccination-module')),
  'pediatrics-vaccinations': lazy(() => import('./pediatrics/vaccination-module')),

  // ── Dermatology specialty ──────────────────────────────────
  'dermatology-body-map': lazy(() => import('./dermatology/dermatology-module')),

  // ── Psychiatry specialty ───────────────────────────────────
  'psychiatry-scales': lazy(() => import('./psychiatry/psychiatry-module')),

  // ── Gynecology specialty ───────────────────────────────────
  'gynecology-prenatal': lazy(() => import('./gynecology/gynecology-module')),

  // ── Telemedicine ───────────────────────────────────────────
  'telemedicine-video': lazy(() => import('./telemedicine/telemedicine-module')),

  // ── Surgery specialty ────────────────────────────────────────
  'surgical-checklist': lazy(() => import('./surgery/surgery-module')),

  // ── Wound care ───────────────────────────────────────────────
  'wound-care': lazy(() => import('./wound-care/wound-care-module')),

  // ── Rehabilitation specialty ─────────────────────────────────
  'rehabilitation-progress': lazy(() => import('./rehabilitation/rehabilitation-module')),

  // ── Neurology specialty ──────────────────────────────────────
  'neurology-scales': lazy(() => import('./neurology/neurology-module')),

  // ── Allergy specialty ──────────────────────────────────────
  'allergy-testing': lazy(() => import('./allergy/allergy-module')),

  // ── Audiometry specialty ───────────────────────────────────
  'audiometry-test': lazy(() => import('./audiometry/audiometry-module')),

  // ── Spirometry / Pulmonology ───────────────────────────────
  'spirometry-test': lazy(() => import('./spirometry/spirometry-module')),

  // ── Nutrition assessment ───────────────────────────────────
  'nutrition-assessment': lazy(() => import('./nutrition/nutrition-module')),

  // ── Pain assessment ────────────────────────────────────────
  'pain-assessment': lazy(() => import('./pain/pain-module')),

  // ── Oncology staging ───────────────────────────────────────
  'oncology-staging': lazy(() => import('./oncology/oncology-module')),
};

/**
 * Get a module component from the registry by its ID.
 */
export function getModuleComponent(
  moduleId: string,
): ComponentType<ModuleComponentProps> | null {
  return MODULE_REGISTRY[moduleId] ?? null;
}

/**
 * Check if a module is registered.
 */
export function isModuleRegistered(moduleId: string): boolean {
  return moduleId in MODULE_REGISTRY;
}

/**
 * Get all registered module IDs.
 */
export function getRegisteredModuleIds(): string[] {
  return Object.keys(MODULE_REGISTRY);
}

export { MODULE_REGISTRY };
