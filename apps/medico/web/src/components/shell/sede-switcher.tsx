'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@red-salud/design-system';
import {
  Building2,
  Check,
  ChevronsUpDown,
  Settings,
  Star,
} from 'lucide-react';

import { useActiveSede } from '@/hooks/use-active-sede';

import type { ShellSedeOption } from './types';

/**
 * @file sede-switcher.tsx
 * @description Breadcrumb-level switcher for the active sede. Shares the
 * visual language of `<UserMenuDropdown>` — soft border, deeper shadow,
 * gradient-tinted identity header, and `data-[highlighted]` row colouring.
 *
 * Scope: the switcher is a SWITCHER, not a manager — it only lets the doctor
 * change which sede is active. Creation, editing, deletion, schedules, and
 * geo data all live in the dedicated `/dashboard/sedes` page (a guided
 * multi-step flow with a map and opening hours). The dropdown ends with a
 * single "Gestionar sedes" link that takes the doctor there.
 *
 * Switching writes the `active_sede_id` cookie via `useActiveSede` and
 * triggers `router.refresh()` so the server layout re-hydrates the header.
 */

const TRIGGER_CLASSES = [
  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-foreground transition-colors',
  'hover:bg-surface-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
  'disabled:cursor-default disabled:opacity-100 disabled:hover:bg-transparent',
].join(' ');

const CONTENT_CLASSES = [
  // Same surface language as <UserMenuDropdown>: soft border, deep shadow,
  // glassy popover with a backdrop blur. No padding so each internal section
  // controls its own breathing room.
  'w-[19.5rem] overflow-hidden rounded-xl p-0',
  'border border-border/30 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.55)]',
  'bg-popover/95 backdrop-blur-xl',
  'data-[state=open]:duration-150',
].join(' ');

interface SedeSwitcherProps {
  /** Active sede label rendered in the breadcrumb. Falls back to "Sin sede". */
  activeSedeName: string;
  /** Active sede id used to mark the selected row in the dropdown. */
  activeSedeId?: string | null;
  /** All available sedes for this doctor. Empty array → only the manage link. */
  sedes: ShellSedeOption[];
}

export function SedeSwitcher({
  activeSedeName,
  activeSedeId,
  sedes,
}: SedeSwitcherProps): React.ReactElement {
  const { setSede } = useActiveSede();
  const [popoverOpen, setPopoverOpen] = useState(false);
  // Hydration guard for Radix's auto-generated IDs (useId). Without this,
  // PopoverTrigger renders SSR-side with a different `aria-controls` than the
  // client, which triggers a hydration warning. Rendering a plain label on the
  // first pass and the interactive Popover after mount keeps SSR markup stable
  // — visual UX is identical because the breadcrumb isn't interactive pre-hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasSedes = sedes.length > 0;
  const activeSede = sedes.find((s) => s.id === activeSedeId);

  if (!mounted) {
    return (
      <span
        data-testid="sede-switcher-trigger"
        data-level="sede"
        className={TRIGGER_CLASSES}
      >
        <span className="max-w-[14rem] truncate">{activeSedeName}</span>
        <ChevronsUpDown
          className="h-3 w-3 text-foreground-lighter"
          aria-hidden="true"
        />
      </span>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="sede-switcher-trigger"
          data-level="sede"
          className={TRIGGER_CLASSES}
        >
          <span className="max-w-[14rem] truncate">{activeSedeName}</span>
          <ChevronsUpDown
            className="h-3 w-3 text-foreground-lighter"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={10}
        className={CONTENT_CLASSES}
      >
        {/* ─── Active sede identity header ──────────────────────────── */}
        <div className="relative px-4 pb-3 pt-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/[0.06] to-transparent"
          />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                Sede activa
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-tight text-foreground truncate">
                {activeSedeName}
              </p>
            </div>
            {activeSede?.isPrimary && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-medium text-amber-500"
                aria-label="Sede principal"
              >
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                Principal
              </span>
            )}
          </div>
        </div>

        <SoftSeparator />

        {/* ─── Sede list ───────────────────────────────────────────── */}
        {hasSedes ? (
          <div className="px-3 pb-2 pt-2.5">
            <p
              className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80"
              aria-hidden="true"
            >
              Cambiar de sede
            </p>
            <ul role="listbox" aria-label="Sedes" className="-mx-1 flex flex-col">
              {sedes.map((sede) => {
                const isActive = sede.id === activeSedeId;
                return (
                  <li key={sede.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      data-testid={`sede-switcher-option-${sede.id}`}
                      data-active={isActive}
                      onClick={() => {
                        if (!isActive) {
                          setSede(sede.id);
                        }
                        setPopoverOpen(false);
                      }}
                      className={[
                        'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm',
                        'transition-colors',
                        'focus-visible:bg-sidebar-accent focus-visible:outline-none',
                        'hover:bg-sidebar-accent',
                        isActive ? 'bg-sidebar-accent/60 text-foreground' : 'text-foreground/90',
                      ].join(' ')}
                    >
                      <span className="flex h-4 w-4 items-center justify-center">
                        {isActive ? (
                          <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        ) : (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-border transition-colors group-hover:bg-foreground/40"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className={[
                        'flex-1 truncate',
                        isActive ? 'font-medium' : '',
                      ].join(' ')}>
                        {sede.label}
                      </span>
                      {sede.isPrimary && (
                        <Star
                          className="h-3 w-3 fill-amber-400 text-amber-500"
                          aria-label="Sede principal"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Aún no tenés sedes registradas. Configurá la primera para activar
            la agenda y las consultas.
          </div>
        )}

        <SoftSeparator />

        {/* ─── Manage link ─────────────────────────────────────────── */}
        <div className="p-1">
          <Link
            href="/dashboard/sedes"
            data-testid="sede-switcher-manage"
            onClick={() => setPopoverOpen(false)}
            className={[
              'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium',
              'text-foreground/90 transition-colors',
              'hover:bg-sidebar-accent hover:text-foreground',
              'focus-visible:bg-sidebar-accent focus-visible:outline-none',
            ].join(' ')}
          >
            <Settings
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
            <span className="flex-1 truncate">
              {hasSedes ? 'Gestionar sedes' : 'Configurar mi primera sede'}
            </span>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Soft 1px divider matching the user-menu dropdown — keeps the popover
 * reading as a single composed surface instead of a stack of bordered cards.
 */
function SoftSeparator() {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className="mx-2 h-px bg-border/50"
    />
  );
}
