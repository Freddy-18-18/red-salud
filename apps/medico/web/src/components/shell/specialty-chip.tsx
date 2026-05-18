'use client';

import { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@red-salud/design-system';
import { Stethoscope, ChevronDown } from 'lucide-react';

/**
 * @file specialty-chip.tsx
 * @description Specialty pill that lives next to the doctor breadcrumb. Shows
 * the primary specialty as a compact chip. When the doctor has additional
 * postgrados, the chip becomes a Popover trigger that lists every credential —
 * primary at the top, then the rest. Single-specialty doctors see a static pill.
 *
 * Not navigable on click — this is an identity affordance, not a filter (yet).
 * If a future spec adds per-specialty filtering of dashboard data, the
 * Popover items become buttons that mutate an `active_specialty` context.
 */

interface SpecialtyChipProps {
  /** Primary specialty display name (e.g. "Medicina General"). */
  primary: string;
  /**
   * Additional postgrados/credentials in raw SACS form. The chip Title-cases
   * them at render time so "INFECTOLOGÍA PEDIÁTRICA" reads as
   * "Infectología Pediátrica" without modifying the source data.
   */
  additional?: string[];
}

const TRIGGER_BASE_CLASSES = [
  'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-75/60 px-2.5 py-0.5 text-xs font-medium text-foreground-light',
  'transition-colors hover:bg-surface-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
].join(' ');

function toTitleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      // Preserve common Spanish connectors lowercase except when they're the first word.
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function SpecialtyChip({
  primary,
  additional,
}: SpecialtyChipProps): React.ReactElement {
  // Hydration guard for Radix Popover auto-generated IDs — same rationale as
  // SedeSwitcher. The chip renders as a non-interactive span on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const extras = (additional ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== primary.toLowerCase())
    .map(toTitleCase);
  const hasExtras = extras.length > 0;

  if (!hasExtras) {
    return (
      <span
        data-testid="specialty-chip"
        data-multiple="false"
        className={TRIGGER_BASE_CLASSES}
      >
        <Stethoscope className="h-3 w-3" aria-hidden="true" />
        <span className="max-w-[12rem] truncate">{primary}</span>
      </span>
    );
  }

  if (!mounted) {
    return (
      <span
        data-testid="specialty-chip"
        data-multiple="true"
        className={TRIGGER_BASE_CLASSES}
      >
        <Stethoscope className="h-3 w-3" aria-hidden="true" />
        <span className="max-w-[12rem] truncate">{primary}</span>
        <span
          className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary"
          aria-label={`Más ${extras.length} especialidad${extras.length === 1 ? '' : 'es'}`}
        >
          +{extras.length}
        </span>
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="specialty-chip"
          data-multiple="true"
          className={TRIGGER_BASE_CLASSES}
        >
          <Stethoscope className="h-3 w-3" aria-hidden="true" />
          <span className="max-w-[12rem] truncate">{primary}</span>
          <span
            className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary"
            aria-label={`Más ${extras.length} especialidad${extras.length === 1 ? '' : 'es'}`}
          >
            +{extras.length}
          </span>
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1">
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-light">
          Tus especialidades
        </div>
        <ul className="flex flex-col">
          <li className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm">
            <Stethoscope
              className="h-3.5 w-3.5 text-primary"
              aria-hidden="true"
            />
            <span className="flex-1 truncate font-medium">{primary}</span>
            <span className="text-[10px] uppercase tracking-wider text-foreground-light">
              Principal
            </span>
          </li>
          {extras.map((label) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
            >
              <Stethoscope
                className="h-3.5 w-3.5 text-foreground-lighter"
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{label}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
