/**
 * @file specialty-kpi-grid.tsx
 * @description Grid de KPIs priorizados para cualquier especialidad.
 *
 * Recibe las definiciones de KPI del SpecialtyConfig y los valores reales
 * del hook de datos. Renderiza cards con formato apropiado (%, $, número, duración).
 */

"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { SpecialtyConfig } from "@/lib/specialties";

// ============================================================================
// TYPES
// ============================================================================

interface SpecialtyKpiGridProps {
  /** KPI keys to display (ordered by priority) */
  kpiKeys: string[];
  /** KPI definitions from SpecialtyConfig */
  kpiDefinitions?: SpecialtyConfig["kpiDefinitions"];
  /** Current KPI values — maps key to numeric value */
  values?: Record<string, number>;
  /** Primary color for accents */
  primaryColor?: string;
  /** Loading state */
  isLoading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatKpiValue(
  value: number | undefined,
  format: "percentage" | "currency" | "number" | "duration"
): string {
  if (value === undefined || value === null) return "—";

  switch (format) {
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "currency":
      return `$${value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "duration":
      if (value >= 60) {
        const hours = Math.floor(value / 60);
        const mins = Math.round(value % 60);
        return `${hours}h ${mins}m`;
      }
      return `${Math.round(value)} min`;
    case "number":
    default:
      return value.toLocaleString("es-VE");
  }
}

function kpiKeyToLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SpecialtyKpiGrid({
  kpiKeys,
  kpiDefinitions,
  values,
  primaryColor,
  isLoading,
}: SpecialtyKpiGridProps) {
  // Take first 6 KPIs max for the grid
  const displayKpis = useMemo(() => {
    return kpiKeys.slice(0, 6).map((key) => {
      const definition = kpiDefinitions?.[key];
      const value = values?.[key];

      return {
        key,
        label: definition?.label ?? kpiKeyToLabel(key),
        format: definition?.format ?? "number",
        direction: definition?.direction ?? "higher_is_better",
        goal: definition?.goal,
        value,
      };
    });
  }, [kpiKeys, kpiDefinitions, values]);

  if (displayKpis.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-3",
        displayKpis.length <= 3 && "grid-cols-1 sm:grid-cols-3",
        displayKpis.length === 4 && "grid-cols-2 lg:grid-cols-4",
        displayKpis.length === 5 && "grid-cols-2 lg:grid-cols-5",
        displayKpis.length >= 6 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
      )}
    >
      {displayKpis.map((kpi) => {
        const formattedValue = formatKpiValue(kpi.value, kpi.format);
        const hasGoal = kpi.goal !== undefined && kpi.value !== undefined;
        const progress = hasGoal
          ? Math.min(100, Math.round((kpi.value! / kpi.goal!) * 100))
          : null;

        // Direction indicator
        let GoalIcon = Minus;
        let goalColor = "text-muted-foreground";
        if (hasGoal && progress !== null) {
          if (progress >= 100) {
            GoalIcon = kpi.direction === "higher_is_better" ? ArrowUp : ArrowDown;
            goalColor = "text-emerald-500";
          } else if (progress >= 75) {
            goalColor = "text-amber-500";
          } else {
            goalColor = "text-destructive";
          }
        }

        return (
          <Card key={kpi.key} className="relative overflow-hidden">
            {/* Accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: primaryColor ?? "hsl(var(--primary))" }}
            />

            <CardContent className="p-4 space-y-1">
              {isLoading ? (
                <>
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-7 w-16 bg-muted rounded animate-pulse mt-2" />
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground truncate">
                    {kpi.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold tabular-nums tracking-tight">
                      {formattedValue}
                    </p>
                    {hasGoal && (
                      <div className={cn("flex items-center gap-0.5 text-xs", goalColor)}>
                        <GoalIcon className="h-3 w-3" />
                        <span>{progress}%</span>
                      </div>
                    )}
                  </div>
                  {hasGoal && (
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, progress ?? 0)}%`,
                          backgroundColor: primaryColor ?? "hsl(var(--primary))",
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
