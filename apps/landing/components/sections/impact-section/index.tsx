/**
 * @file index.tsx
 * @description Exportaciones del módulo de la sección de impacto.
 * Timeline Interactivo con scroll reveal cinematográfico.
 */

// Componente principal de la sección de impacto
export { ImpactSectionTimeline as ImpactSection } from "./ImpactSection";

// Re-exportación del hook de datos
export { useImpactData } from "./useImpactData";

// Re-exportación de tipos
export type { CoverageData, StatItem, ImpactSectionProps } from "./impact-section.types";
