'use client';

/**
 * @file roster-filters.tsx
 * @description Filter bar above the patient roster (T-3-08 UI).
 *
 * Layout:
 *  - Left: debounced search input (300ms) that fires `onSearchChange` once
 *    the doctor stops typing. The internal state mirrors the prop so external
 *    resets (`onReset()`) propagate back.
 *  - Right: "Filtros (N)" trigger that opens a Popover with chronic-tag chips,
 *    age range inputs, last-visit window chips, and two "próximamente"
 *    toggles. N counts every non-search active filter so the doctor sees
 *    how many constraints are being applied.
 *  - Below: chip-list of every active filter with a per-chip X to remove it.
 *
 * The `has_followup` and `alerts_only` filters are surfaced disabled with a
 * "Próximamente" badge — the back-end paginator does not yet apply them
 * (Phase 3 batch 2 TODO inside `listPatientsPaginated`). Rendering them
 * disabled (instead of hiding) tells the doctor the affordance is coming.
 */

import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Filter,
  Search,
  Sparkles,
  X as XIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from '@red-salud/design-system';

import { CHRONIC_TAGS } from '@/lib/chronic/canonical-tags';
import type { LastVisitWindow, RosterFilters } from '@red-salud/types';

export interface RosterFiltersProps {
  filters: RosterFilters;
  isDirty: boolean;
  onSearchChange: (s: string) => void;
  onToggleChronicTag: (slug: string) => void;
  onAgeRangeChange: (min: number | null, max: number | null) => void;
  onLastVisitWindowChange: (w: LastVisitWindow | null) => void;
  onToggleHasFollowup: () => void;
  onToggleAlertsOnly: () => void;
  onReset: () => void;
}

const LAST_VISIT_WINDOWS: Array<{ value: LastVisitWindow; label: string }> = [
  { value: 'lt_7d', label: '≤ 7 días' },
  { value: 'lt_30d', label: '≤ 30 días' },
  { value: 'lt_90d', label: '≤ 90 días' },
  { value: 'lt_1y', label: '≤ 1 año' },
  { value: 'gte_1y', label: '> 1 año' },
  { value: 'never', label: 'Nunca' },
];

function labelForWindow(value: LastVisitWindow): string {
  const match = LAST_VISIT_WINDOWS.find((w) => w.value === value);
  return match?.label ?? value;
}

function countActiveNonSearch(filters: RosterFilters): number {
  let n = 0;
  if (filters.chronic_tags.length > 0) n += 1;
  if (filters.age_min != null || filters.age_max != null) n += 1;
  if (filters.last_visit_window != null) n += 1;
  if (filters.has_followup) n += 1;
  if (filters.alerts_only) n += 1;
  return n;
}

export function RosterFiltersBar({
  filters,
  isDirty,
  onSearchChange,
  onToggleChronicTag,
  onAgeRangeChange,
  onLastVisitWindowChange,
  onToggleHasFollowup,
  onToggleAlertsOnly,
  onReset,
}: RosterFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchDraft !== filters.search) {
        onSearchChange(searchDraft);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchDraft, filters.search, onSearchChange]);

  const activeCount = countActiveNonSearch(filters);

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground/70"
          />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="md:w-auto justify-center"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[min(420px,calc(100vw-2rem))] p-0"
          >
            <FiltersPanel
              filters={filters}
              isDirty={isDirty}
              onToggleChronicTag={onToggleChronicTag}
              onAgeRangeChange={onAgeRangeChange}
              onLastVisitWindowChange={onLastVisitWindowChange}
              onToggleHasFollowup={onToggleHasFollowup}
              onToggleAlertsOnly={onToggleAlertsOnly}
              onReset={onReset}
            />
          </PopoverContent>
        </Popover>
      </div>

      {(filters.chronic_tags.length > 0 ||
        filters.age_min != null ||
        filters.age_max != null ||
        filters.last_visit_window != null ||
        filters.has_followup ||
        filters.alerts_only) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.chronic_tags.map((slug) => (
            <ActiveChip
              key={slug}
              label={slug}
              onRemove={() => onToggleChronicTag(slug)}
            />
          ))}

          {(filters.age_min != null || filters.age_max != null) && (
            <ActiveChip
              label={`Edad ${filters.age_min ?? '0'}–${filters.age_max ?? '∞'} años`}
              onRemove={() => onAgeRangeChange(null, null)}
            />
          )}

          {filters.last_visit_window != null && (
            <ActiveChip
              label={`Última visita ${labelForWindow(filters.last_visit_window)}`}
              onRemove={() => onLastVisitWindowChange(null)}
            />
          )}

          {filters.has_followup && (
            <ActiveChip
              label="Con seguimiento pendiente"
              onRemove={onToggleHasFollowup}
            />
          )}

          {filters.alerts_only && (
            <ActiveChip
              label="Solo con alertas"
              onRemove={onToggleAlertsOnly}
            />
          )}

          {isDirty && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5"
            >
              Limpiar todo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

interface ActiveChipProps {
  label: string;
  onRemove: () => void;
}

function ActiveChip({ label, onRemove }: ActiveChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:text-destructive"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------

interface FiltersPanelProps {
  filters: RosterFilters;
  isDirty: boolean;
  onToggleChronicTag: (slug: string) => void;
  onAgeRangeChange: (min: number | null, max: number | null) => void;
  onLastVisitWindowChange: (w: LastVisitWindow | null) => void;
  onToggleHasFollowup: () => void;
  onToggleAlertsOnly: () => void;
  onReset: () => void;
}

function FiltersPanel({
  filters,
  isDirty,
  onToggleChronicTag,
  onAgeRangeChange,
  onLastVisitWindowChange,
  onToggleHasFollowup,
  onToggleAlertsOnly,
  onReset,
}: FiltersPanelProps) {
  return (
    <div className="max-h-[min(70vh,560px)] overflow-y-auto">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
        {isDirty && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <section className="px-4 py-3 space-y-2 border-b border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Condiciones crónicas
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {CHRONIC_TAGS.map((tag) => {
            const isActive = filters.chronic_tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleChronicTag(tag)}
                className={
                  isActive
                    ? 'text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground transition-colors'
                    : 'text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-3 space-y-2 border-b border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Edad (años)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="age-min"
              className="text-[11px] text-muted-foreground"
            >
              Mín
            </label>
            <input
              id="age-min"
              type="number"
              inputMode="numeric"
              min={0}
              max={150}
              placeholder="0"
              value={filters.age_min ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                const next = raw === '' ? null : Number(raw);
                onAgeRangeChange(
                  Number.isFinite(next) ? (next as number) : null,
                  filters.age_max,
                );
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label
              htmlFor="age-max"
              className="text-[11px] text-muted-foreground"
            >
              Máx
            </label>
            <input
              id="age-max"
              type="number"
              inputMode="numeric"
              min={0}
              max={150}
              placeholder="120"
              value={filters.age_max ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                const next = raw === '' ? null : Number(raw);
                onAgeRangeChange(
                  filters.age_min,
                  Number.isFinite(next) ? (next as number) : null,
                );
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-3 space-y-2 border-b border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <CalendarIcon className="inline h-3 w-3 mr-1" />
          Última visita
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {LAST_VISIT_WINDOWS.map((window) => {
            const isActive = filters.last_visit_window === window.value;
            return (
              <button
                key={window.value}
                type="button"
                onClick={() =>
                  onLastVisitWindowChange(isActive ? null : window.value)
                }
                className={
                  isActive
                    ? 'text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground transition-colors'
                    : 'text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                }
              >
                {window.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-3 space-y-3">
        <ToggleRow
          label="Con seguimiento pendiente"
          description="Pacientes con cita futura agendada."
          checked={filters.has_followup}
          onToggle={onToggleHasFollowup}
          comingSoon
        />
        <ToggleRow
          label="Solo con alertas"
          description="Vitales fuera de rango, recetas vencidas o labs anormales."
          checked={filters.alerts_only}
          onToggle={onToggleAlertsOnly}
          comingSoon
        />
      </section>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  comingSoon?: boolean;
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
  comingSoon = false,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {comingSoon && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 gap-0.5"
            >
              <Sparkles className="h-2.5 w-2.5" />
              Próximamente
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
        disabled={comingSoon}
        aria-label={label}
      />
    </div>
  );
}
