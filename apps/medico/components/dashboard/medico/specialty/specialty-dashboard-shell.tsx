/**
 * @file specialty-dashboard-shell.tsx
 * @description Shell genérico que renderiza cualquier especialidad médica.
 *
 * Recibe un SpecialtyConfig y genera automáticamente:
 * - Header con nombre, icono y badge de especialidad
 * - Grid de KPIs priorizados
 * - Módulos organizados por grupo
 * - Widgets dinámicos
 *
 * Funciona para las 132 especialidades sin necesidad de código custom.
 * Las especialidades con overrides (dental, cardio, pediatría) pueden
 * opcionalmente inyectar paneles custom vía children/slots.
 */

"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import type { SpecialtyConfig, SpecialtyModule, ModuleGroup } from "@/lib/specialties";
import { DynamicIcon } from "@red-salud/design-system";
import { SpecialtyKpiGrid } from "./specialty-kpi-grid";
import { SpecialtyModuleCard } from "./specialty-module-card";

// ============================================================================
// TYPES
// ============================================================================

export interface SpecialtyDashboardShellProps {
  /** The specialty configuration to render */
  config: SpecialtyConfig;
  /** Doctor's user ID for data fetching */
  doctorId?: string;
  /** Sub-specialties for badge display */
  subSpecialties?: string[];
  /** Optional custom hero/top section */
  heroSlot?: React.ReactNode;
  /** Optional custom panels/widgets to inject */
  children?: React.ReactNode;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Last refresh timestamp */
  refreshedAt?: Date | null;
  /** Called when user clicks refresh */
  onRefresh?: () => void;
  /** KPI values from data hook — maps kpi key to numeric value */
  kpiValues?: Record<string, number>;
}

// ============================================================================
// GROUP METADATA
// ============================================================================

const GROUP_META: Record<ModuleGroup, { label: string; icon: string; order: number; description: string }> = {
  clinical: { label: "Clínica", icon: "Stethoscope", order: 1, description: "Gestión clínica y consultas" },
  financial: { label: "Finanzas", icon: "DollarSign", order: 2, description: "Facturación, seguros, presupuestos" },
  lab: { label: "Laboratorio", icon: "FlaskConical", order: 3, description: "Estudios y resultados de laboratorio" },
  laboratory: { label: "Laboratorio", icon: "FlaskConical", order: 3, description: "Estudios y resultados de laboratorio" },
  technology: { label: "Tecnología", icon: "Sparkles", order: 4, description: "Imágenes, IA, telemedicina" },
  communication: { label: "Comunicación", icon: "MessageCircle", order: 5, description: "Mensajería y seguimiento" },
  growth: { label: "Crecimiento", icon: "TrendingUp", order: 6, description: "Analytics y estadísticas" },
  administrative: { label: "Administración", icon: "Settings", order: 7, description: "Gestión administrativa" },
  education: { label: "Educación", icon: "BookOpen", order: 8, description: "Capacitación e investigación" },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SpecialtyDashboardShell({
  config,
  doctorId,
  subSpecialties,
  heroSlot,
  children,
  isLoading = false,
  error,
  refreshedAt,
  onRefresh,
  kpiValues,
}: SpecialtyDashboardShellProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // ==================== DERIVED DATA ====================

  const refreshedLabel = useMemo(() => {
    if (!refreshedAt) return "sin sincronizar";
    return refreshedAt.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [refreshedAt]);

  // Organize modules by group, sorted
  const sortedGroups = useMemo(() => {
    const groups: Array<{
      key: ModuleGroup;
      meta: (typeof GROUP_META)[ModuleGroup];
      modules: SpecialtyModule[];
    }> = [];

    const moduleMap = config.modules;
    for (const [groupKey, modules] of Object.entries(moduleMap)) {
      if (!modules || modules.length === 0) continue;
      const meta = GROUP_META[groupKey as ModuleGroup];
      if (!meta) continue;

      groups.push({
        key: groupKey as ModuleGroup,
        meta,
        modules: [...modules]
          .filter((m) => m.enabledByDefault !== false)
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
      });
    }

    return groups.sort((a, b) => a.meta.order - b.meta.order);
  }, [config.modules]);

  // Toggle group collapse
  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* ==================== HEADER ==================== */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {config.theme?.icon && (
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl"
                    style={{ backgroundColor: `${config.theme.primaryColor}20` }}
                  >
                    <DynamicIcon
                      name={config.theme.icon}
                      className="h-5 w-5"
                      style={{ color: config.theme.primaryColor }}
                    />
                  </div>
                )}
                <h1 className="text-3xl font-bold tracking-tight">{config.name}</h1>
                {subSpecialties?.map((sub) => (
                  <Badge key={sub} variant="outline">
                    {sub}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                Dashboard de {config.name.toLowerCase()} — {sortedGroups.reduce((sum, g) => sum + g.modules.length, 0)} módulos activos
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <Clock3 className="h-3.5 w-3.5" />
              Actualizado: {refreshedLabel}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="gap-1.5 ml-1"
                >
                  <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                  Refrescar
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ==================== ERROR ==================== */}
        {error && (
          <motion.div variants={fadeInUp}>
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="p-4 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ==================== HERO SLOT ==================== */}
        {heroSlot && <motion.div variants={fadeInUp}>{heroSlot}</motion.div>}

        {/* ==================== KPI GRID ==================== */}
        {config.prioritizedKpis.length > 0 && (
          <motion.div variants={fadeInUp}>
            <SpecialtyKpiGrid
              kpiKeys={config.prioritizedKpis}
              kpiDefinitions={config.kpiDefinitions}
              values={kpiValues}
              primaryColor={config.theme?.primaryColor}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* ==================== MODULE GROUPS ==================== */}
        {sortedGroups.map((group) => {
          const isCollapsed = collapsedGroups.has(group.key);

          return (
            <motion.div key={group.key} variants={fadeInUp}>
              <div className="space-y-3">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="flex items-center gap-2 w-full text-left group"
                >
                  <DynamicIcon
                    name={group.meta.icon}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <h2 className="text-lg font-semibold">{group.meta.label}</h2>
                  <span className="text-xs text-muted-foreground">
                    ({group.modules.length})
                  </span>
                  <div className="flex-1" />
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </button>

                {/* Module cards */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.modules.map((module) => (
                      <SpecialtyModuleCard
                        key={module.key}
                        module={module}
                        primaryColor={config.theme?.primaryColor}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* ==================== CUSTOM CHILDREN ==================== */}
        {children && <motion.div variants={fadeInUp}>{children}</motion.div>}
      </motion.div>
    </div>
  );
}
