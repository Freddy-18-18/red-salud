/**
 * @file filters-toolbar.tsx
 * @description Componente de filtros globales para la página de estadísticas.
 * Incluye selector de rango de fechas, filtros de ubicación, tipo de consulta,
 * comparativas y exportación de datos.
 *
 * @module Estadisticas/Filters
 */

"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  File,
  TrendingUp,
} from "lucide-react";
import { Button } from "@red-salud/ui";
import { Card, CardContent } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@red-salud/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@red-salud/ui";
import { Checkbox } from "@red-salud/ui";

// ============================================================================
// TIPOS
// ============================================================================

export interface DateRangePreset {
  label: string;
  value: string;
  getRange: () => { start: Date; end: Date };
}

export interface StatisticsFilters {
  dateRange: { start: Date; end: Date };
  locations: string[];
  consultationTypes: string[];
  statuses: string[];
  compareWithPrevious: boolean;
}

interface FiltersToolbarProps {
  filters: StatisticsFilters;
  onFiltersChange: (filters: StatisticsFilters) => void;
  onRefresh: () => void;
  onExport: (format: "pdf" | "excel" | "csv") => void;
  lastRefresh?: Date;
  isLoading?: boolean;
}

// ============================================================================
// PRESETS DE RANGO DE FECHAS
// ============================================================================

const DATE_PRESETS: DateRangePreset[] = [
  {
    label: "Hoy",
    value: "today",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return { start, end };
    },
  },
  {
    label: "Ayer",
    value: "yesterday",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
      return { start, end };
    },
  },
  {
    label: "Últimos 7 días",
    value: "last7days",
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  {
    label: "Últimos 30 días",
    value: "last30days",
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const start = new Date(end);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
  {
    label: "Este mes",
    value: "thismonth",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { start, end };
    },
  },
  {
    label: "Mes anterior",
    value: "lastmonth",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start, end };
    },
  },
  {
    label: "Este año",
    value: "thisyear",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { start, end };
    },
  },
  {
    label: "Últimos 12 meses",
    value: "last12months",
    getRange: () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const start = new Date(end);
      start.setMonth(start.getMonth() - 12);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    },
  },
];

const CONSULTATION_TYPES = [
  { label: "Presencial", value: "presencial" },
  { label: "Telemedicina", value: "video" },
  { label: "Teléfono", value: "phone" },
];

const STATUS_OPTIONS = [
  { label: "Completada", value: "completed" },
  { label: "Pendiente", value: "pending" },
  { label: "Cancelada", value: "cancelled" },
  { label: "No Show", value: "no-show" },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function FiltersToolbar({
  filters,
  onFiltersChange,
  onRefresh,
  onExport,
  lastRefresh,
  isLoading = false,
}: FiltersToolbarProps) {
  const [activePreset, setActivePreset] = useState<string>("last30days");

  // Determinar el preset activo basado en el rango actual
  const currentPresetLabel = useMemo(() => {
    const preset = DATE_PRESETS.find((p) => p.value === activePreset);
    return preset?.label || "Personalizado";
  }, [activePreset]);

  const handleDatePresetChange = (presetValue: string) => {
    const preset = DATE_PRESETS.find((p) => p.value === presetValue);
    if (preset) {
      setActivePreset(presetValue);
      onFiltersChange({
        ...filters,
        dateRange: preset.getRange(),
      });
    }
  };

  const handleConsultationTypeToggle = (type: string) => {
    const newTypes = filters.consultationTypes.includes(type)
      ? filters.consultationTypes.filter((t) => t !== type)
      : [...filters.consultationTypes, type];

    onFiltersChange({
      ...filters,
      consultationTypes: newTypes,
    });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];

    onFiltersChange({
      ...filters,
      statuses: newStatuses,
    });
  };

  const handleCompareToggle = () => {
    onFiltersChange({
      ...filters,
      compareWithPrevious: !filters.compareWithPrevious,
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Filtros principales */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de rango de fechas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px] justify-start">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{currentPresetLabel}</span>
                  <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Rango de fechas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DATE_PRESETS.map((preset) => (
                  <DropdownMenuItem
                    key={preset.value}
                    onClick={() => handleDatePresetChange(preset.value)}
                    className={activePreset === preset.value ? "bg-accent" : ""}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro de tipos de consulta */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Tipos</span>
                  {filters.consultationTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {filters.consultationTypes.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Tipo de consulta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {CONSULTATION_TYPES.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => handleConsultationTypeToggle(type.value)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={filters.consultationTypes.includes(type.value)}
                    />
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro de estados */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Estados</span>
                  {filters.statuses.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {filters.statuses.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Estado de cita</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => handleStatusToggle(status.value)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={filters.statuses.includes(status.value)}
                    />
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Toggle comparación */}
            <Button
              variant={filters.compareWithPrevious ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={handleCompareToggle}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Comparar</span>
            </Button>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Timestamp de última actualización */}
            {lastRefresh && (
              <div className="hidden md:block text-xs text-muted-foreground mr-2">
                Actualizado: {format(lastRefresh, "HH:mm:ss")}
              </div>
            )}

            {/* Botón de refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              title="Recargar datos"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            {/* Dropdown de exportación */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Exportar datos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExport("pdf")} className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("excel")} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("csv")} className="gap-2">
                  <File className="h-4 w-4" />
                  <span>CSV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Rango de fechas seleccionado */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Desde:</span>
          <span className="font-medium">
            {format(filters.dateRange.start, "dd MMM yyyy", { locale: es })}
          </span>
          <span>hasta:</span>
          <span className="font-medium">
            {format(filters.dateRange.end, "dd MMM yyyy", { locale: es })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DEFAULT FILTERS
// ============================================================================

export function getDefaultFilters(): StatisticsFilters {
  const preset = DATE_PRESETS.find((p) => p.value === "last30days")!;
  return {
    dateRange: preset.getRange(),
    locations: [],
    consultationTypes: [],
    statuses: [],
    compareWithPrevious: false,
  };
}
