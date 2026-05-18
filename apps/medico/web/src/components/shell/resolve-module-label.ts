import { lookupModule } from '@/lib/capabilities/module-catalog';

/**
 * @file resolve-module-label.ts
 * @description Resolve a pathname to the GlobalHeader's third breadcrumb label.
 *
 * Returns `undefined` for the dashboard root (`/dashboard` or empty) so the
 * breadcrumb collapses to `doctor / sede` instead of showing a redundant
 * "Inicio" crumb. Pure function — safe to call from client and server.
 */

const PATHNAME_MODULE_LABELS: Record<string, string> = {
  agenda: 'Agenda',
  pacientes: 'Pacientes',
  consulta: 'Consulta',
  recetas: 'Recetas',
  mensajes: 'Mensajes',
  estadisticas: 'Estadísticas',
  verificacion: 'Verificación',
  configuracion: 'Configuración',
  sedes: 'Sedes',
};

export function resolveModuleLabel(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  const stripped = pathname.replace(/^\/dashboard\/?/, '').replace(/\/$/, '');
  if (!stripped) return undefined;
  const [first, second] = stripped.split('/');
  if (first === 'modulos' && second) {
    return lookupModule(second).label;
  }
  return PATHNAME_MODULE_LABELS[first] ?? 'Configuración';
}
