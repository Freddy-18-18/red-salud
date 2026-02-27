/**
 * @file Data layer barrel exports for the specialty system.
 *
 * Contains the KPI resolver service that maps abstract KPI keys
 * to concrete Supabase queries against materialized views.
 */

export { resolveKpis, type KpiResolutionResult } from "./specialty-kpi-resolver";
