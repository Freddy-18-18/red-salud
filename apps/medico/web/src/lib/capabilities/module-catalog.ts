/**
 * @file module-catalog.ts
 * @description Static metadata catalog mapping `module_key` → label / icon / route.
 *
 * `capability_modules` table stores only the matrix (source → module_key). The
 * presentation metadata lives here so the resolver can build navGroups without
 * touching another DB table.
 *
 * Keys here MUST match `capability_modules.module_key` AND (for registered
 * modules) `apps/medico/web/src/components/modules/module-registry.ts`.
 *
 * When a key is in `capability_modules` but NOT in this catalog, the resolver
 * SHOULD fall back to a generic label/icon — see fallback in resolver.ts.
 */

export interface ModuleMetadata {
  label: string;
  icon: string;
  route: string;
}

export const MODULE_CATALOG: Record<string, ModuleMetadata> = {
  // ── Always-on (every verified doctor) ──────────────────────────────
  'inicio':          { label: 'Inicio',         icon: 'Home',          route: '/dashboard' },
  'agenda':          { label: 'Agenda',         icon: 'Calendar',      route: '/dashboard/agenda' },
  'pacientes':       { label: 'Pacientes',      icon: 'Users',         route: '/dashboard/pacientes' },
  'consulta-soap':   { label: 'Consulta',       icon: 'Stethoscope',   route: '/dashboard/consulta' },
  'recetas':         { label: 'Recetas',        icon: 'Pill',          route: '/dashboard/recetas' },
  'mensajes':        { label: 'Mensajes',       icon: 'MessageSquare', route: '/dashboard/mensajes' },
  'estadisticas':    { label: 'Estadísticas',   icon: 'BarChart3',     route: '/dashboard/estadisticas' },
  'verificacion':    { label: 'Verificación',   icon: 'ShieldCheck',   route: '/dashboard/verificacion' },
  'configuracion':   { label: 'Configuración',  icon: 'Settings',      route: '/dashboard/configuracion' },

  // ── Specialty / postgrado modules (route to /dashboard/modulos/[key]) ────
  'chronic-mgmt':            { label: 'Gestión de Crónicos',     icon: 'Activity',       route: '/dashboard/modulos/chronic-mgmt' },
  'preventive-screening':    { label: 'Tamizaje Preventivo',     icon: 'ShieldCheck',    route: '/dashboard/modulos/preventive-screening' },
  'vaccinations':            { label: 'Vacunación',              icon: 'Syringe',        route: '/dashboard/modulos/vaccinations' },
  'referrals':               { label: 'Derivaciones',            icon: 'Share2',         route: '/dashboard/modulos/referrals' },
  'family-history':          { label: 'Historia Familiar',       icon: 'Users',          route: '/dashboard/modulos/family-history' },
  'lab-orders':              { label: 'Órdenes de Laboratorio',  icon: 'FlaskConical',   route: '/dashboard/modulos/lab-orders' },
  'diagnostic-imaging':      { label: 'Imagenología',            icon: 'Scan',           route: '/dashboard/modulos/diagnostic-imaging' },
  'clinical-templates':      { label: 'Plantillas Clínicas',     icon: 'FileText',       route: '/dashboard/modulos/clinical-templates' },
  'clinical-calculators':    { label: 'Calculadoras Clínicas',   icon: 'Calculator',     route: '/dashboard/modulos/clinical-calculators' },
  'treatment-plans':         { label: 'Planes de Tratamiento',   icon: 'ClipboardList',  route: '/dashboard/modulos/treatment-plans' },
  'cardiology-ecg':          { label: 'Electrocardiograma',      icon: 'HeartPulse',     route: '/dashboard/modulos/cardiology-ecg' },
  'pediatrics-growth':       { label: 'Curvas de Crecimiento',   icon: 'TrendingUp',     route: '/dashboard/modulos/pediatrics-growth' },
  'pediatrics-vaccination':  { label: 'Vacunación Pediátrica',   icon: 'Syringe',        route: '/dashboard/modulos/pediatrics-vaccination' },
  'neurology-scales':        { label: 'Escalas Neurológicas',    icon: 'Brain',          route: '/dashboard/modulos/neurology-scales' },
  'dermatology-body-map':    { label: 'Mapa Dermatológico',      icon: 'Fingerprint',    route: '/dashboard/modulos/dermatology-body-map' },
  'psychiatry-scales':       { label: 'Escalas Psiquiátricas',   icon: 'BrainCircuit',   route: '/dashboard/modulos/psychiatry-scales' },
};

/**
 * Resolve module metadata with a generic fallback when the key isn't catalogued.
 */
export function lookupModule(module_key: string): ModuleMetadata {
  return (
    MODULE_CATALOG[module_key] ?? {
      label: module_key,
      icon: 'Puzzle',
      route: `/dashboard/modulos/${module_key}`,
    }
  );
}
