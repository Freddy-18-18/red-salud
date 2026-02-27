/**
 * @file specialty-widget-grid.tsx
 * @description Grid de widgets dinámico para dashboards de especialidad.
 *
 * Toma las definiciones de widgets del SpecialtyConfig y las
 * renderiza en un grid responsivo. Reutiliza el renderWidget() existente
 * para widgets conocidos y soporta componentes custom vía dynamic import placeholder.
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import type { SpecialtyConfig } from "@/lib/specialties";
import type { WidgetId } from "@red-salud/types";
import { renderWidget } from "../dashboard/widget-renderer";

// ============================================================================
// TYPES
// ============================================================================

type WidgetDefinition = NonNullable<SpecialtyConfig["widgets"]>[number];

interface SpecialtyWidgetGridProps {
  /** Widget definitions from SpecialtyConfig */
  widgets: WidgetDefinition[];
  /** Doctor's user ID for data fetching */
  doctorId?: string;
  /** Whether data is loading */
  isLoading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

const SIZE_CLASSES: Record<WidgetDefinition["size"], string> = {
  small: "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-2 lg:col-span-3",
  full: "col-span-full",
};

/**
 * Checks if a widget key matches a known WidgetId from the existing renderer.
 * Falls back gracefully for unknown keys.
 */
function isKnownWidgetId(key: string): key is WidgetId {
  const knownIds = new Set([
    "stats-overview",
    "today-timeline",
    "week-calendar",
    "quick-actions",
    "notifications",
    "messages",
    "pending-patients",
    "performance-chart",
    "tasks",
    "income",
    "patient-insights",
    "follow-up-reminders",
    "satisfaction-metrics",
    "upcoming-telemedicine",
    "lab-results-pending",
    "patient-birthdays",
    "monthly-goals",
    "revenue-analytics",
    "productivity-score",
  ]);
  return knownIds.has(key);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SpecialtyWidgetGrid({
  widgets,
  doctorId,
  isLoading,
}: SpecialtyWidgetGridProps) {
  // Sort widgets by position: required first, then by row/col
  const sortedWidgets = useMemo(() => {
    return [...widgets].sort((a, b) => {
      // Required widgets come first
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;

      // Then sort by position
      const rowA = a.position?.row ?? 999;
      const rowB = b.position?.row ?? 999;
      if (rowA !== rowB) return rowA - rowB;

      const colA = a.position?.col ?? 999;
      const colB = b.position?.col ?? 999;
      return colA - colB;
    });
  }, [widgets]);

  if (sortedWidgets.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {sortedWidgets.map((widget) => (
        <motion.div
          key={widget.key}
          variants={fadeInUp}
          className={cn(SIZE_CLASSES[widget.size])}
        >
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-24 w-full bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ) : isKnownWidgetId(widget.key) ? (
            renderWidget(widget.key, { doctorId })
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground flex items-center justify-center min-h-[120px]">
                Widget próximamente: {widget.key}
              </CardContent>
            </Card>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
