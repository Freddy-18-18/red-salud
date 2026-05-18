'use client';

import Link from 'next/link';
import {
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@red-salud/design-system';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  STATUS_CONFIG,
  STATUS_ORDER,
  TYPE_ORDER,
  TYPE_STYLES,
  emptyFilters,
  filtersActive,
  type AgendaFilters,
  type ViewMode,
} from './agenda-shared';

interface ToolbarProps {
  viewMode: ViewMode;
  viewLabel: string;
  kpis: { total: number; confirmed: number; pending: number; cancelled: number };
  filters: AgendaFilters;
  onFiltersChange: (f: AgendaFilters) => void;
  onNavigate: (dir: 'prev' | 'next') => void;
  onToday: () => void;
  onViewModeChange: (m: ViewMode) => void;
}

export function AgendaToolbar({
  viewMode,
  viewLabel,
  kpis,
  filters,
  onFiltersChange,
  onNavigate,
  onToday,
  onViewModeChange,
}: ToolbarProps) {
  const hasFilters = filtersActive(filters);

  return (
    <div className="flex flex-col gap-2 border-b border-border bg-card/95 px-3 py-2 backdrop-blur sm:px-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate('prev')}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-8 sm:w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('next')}
            aria-label="Siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-8 sm:w-8"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="min-h-9 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3 sm:py-1.5 sm:text-sm"
          >
            Hoy
          </button>
        </div>

        <h2 className="text-sm font-semibold capitalize text-foreground sm:text-base">
          {viewLabel}
        </h2>

        <KpiPills kpis={kpis} />

        <div className="ml-auto flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
          <Link
            href="/dashboard/agenda/nueva"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:py-1.5 sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva cita</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar paciente o motivo..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <FiltersPopover filters={filters} onChange={onFiltersChange} />
        {hasFilters && (
          <button
            type="button"
            onClick={() => onFiltersChange(emptyFilters())}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * View toggle (Día / Semana / Mes).
 *
 * IMPORTANTE — anti-hydration-mismatch:
 * El botón "Semana" se esconde en mobile con CSS (`hidden sm:inline-flex`),
 * NO con un branch condicional de JS basado en `window.innerWidth`. Si lo
 * hiciéramos con JS, el árbol de React cambiaría entre server (3 botones)
 * y cliente mobile (2 botones), corriendo el counter interno de `useId()`
 * de Radix y generando IDs divergentes en el `<FiltersPopover>` que viene
 * después. Hydration mismatch garantizado.
 *
 * Con CSS los 3 botones SIEMPRE están en el DOM, solo cambia visibility →
 * árbol estable, IDs estables, no warnings.
 */
function ViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  const opts: Array<{ key: ViewMode; label: string; mobileHidden?: boolean }> = [
    { key: 'day', label: 'Día' },
    { key: 'week', label: 'Semana', mobileHidden: true },
    { key: 'month', label: 'Mes' },
  ];

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5 ring-1 ring-inset ring-border">
      {opts.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          aria-pressed={viewMode === opt.key}
          className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-2.5 sm:py-1 sm:text-sm ${
            opt.mobileHidden ? 'hidden sm:inline-flex sm:items-center' : ''
          } ${
            viewMode === opt.key
              ? 'bg-card text-foreground shadow-sm ring-1 ring-inset ring-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function KpiPills({
  kpis,
}: {
  kpis: { total: number; confirmed: number; pending: number; cancelled: number };
}) {
  const items = [
    { label: `${kpis.total} total`,            dot: 'bg-muted-foreground' },
    { label: `${kpis.confirmed} confirmada${kpis.confirmed !== 1 ? 's' : ''}`,  dot: 'bg-success' },
    { label: `${kpis.pending} pendiente${kpis.pending !== 1 ? 's' : ''}`,       dot: 'bg-info' },
    { label: `${kpis.cancelled} cancelada${kpis.cancelled !== 1 ? 's' : ''}`,   dot: 'bg-destructive' },
  ];

  return (
    <div className="hidden items-center gap-3 md:flex">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${it.dot}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function FiltersPopover({
  filters,
  onChange,
}: {
  filters: AgendaFilters;
  onChange: (f: AgendaFilters) => void;
}) {
  const activeCount = filters.statuses.size + filters.types.size;

  const toggleStatus = (s: string) => {
    const next = new Set(filters.statuses);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange({ ...filters, statuses: next });
  };

  const toggleType = (t: string) => {
    const next = new Set(filters.types);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    onChange({ ...filters, types: next });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:text-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estado
            </p>
            <div className="space-y-1">
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const checked = filters.statuses.has(s);
                return (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/60"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleStatus(s)}
                    />
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    <span className="text-sm text-foreground">{cfg.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tipo
            </p>
            <div className="space-y-1">
              {TYPE_ORDER.map((t) => {
                const cfg = TYPE_STYLES[t];
                const checked = filters.types.has(t);
                return (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/60"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleType(t)}
                    />
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.bar}`} />
                    <span className="text-sm text-foreground">{cfg.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, statuses: new Set(), types: new Set() })}
              className="w-full rounded-md border border-border bg-background py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
