/**
 * @file specialty/index.ts
 * @description Barrel exports para los componentes UI de especialidad.
 *
 * Exporta el shell genérico y todos los sub-componentes que lo integran.
 */

export { SpecialtyDashboardShell } from "./specialty-dashboard-shell";
export type { SpecialtyDashboardShellProps } from "./specialty-dashboard-shell";

export { SpecialtyKpiGrid } from "./specialty-kpi-grid";
export { SpecialtyModuleCard } from "./specialty-module-card";
export { SpecialtyWidgetGrid } from "./specialty-widget-grid";
export { LucideIconRenderer } from "./lucide-icon-renderer";
/** @deprecated Use DynamicIcon from @red-salud/design-system instead */
export { DynamicIcon } from "@red-salud/design-system";
