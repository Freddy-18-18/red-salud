'use client';

import { useEffect, useState } from 'react';

import { useGreeting } from '@/hooks/use-greeting';

import { AdvisorButton } from './advisor-button';
import { BreadcrumbPicker } from './breadcrumb-picker';
import { CommandPaletteHero } from './command-palette/command-palette-hero';
import { HelpButton } from './help-button';
import { NotificationsBell } from './notifications-bell';
import { QuickCreateButton } from './quick-create-button';
import { SedeSwitcher } from './sede-switcher';
import { SpecialtyChip } from './specialty-chip';
import { UserMenuDropdown } from './user-menu-dropdown';
import type { GlobalHeaderProps } from './types';
// NOTE: AIAssistantButton was removed from the header (Fase A.3). It was a
// placeholder with no real behavior. It will return as a dedicated module
// or contextual sidebar once the assistant is built out.

/**
 * @file global-header.tsx
 * @description Supabase-style global header (Phase 2 + Phase 3 of
 * medico-shell-supabase-style).
 *
 * Mounted ONLY when `NEXT_PUBLIC_FEATURE_NEW_SHELL=true`. Lives at the top of
 * the dashboard content column on `lg+` viewports (mobile keeps the existing
 * `MobileTopBar`). Two clusters:
 *
 *  1. Left — breadcrumb trail: doctor / sede / module, slash separators
 *     between each, opens a Radix Popover when the level has selectable
 *     options (R6 of app-shell-medico).
 *  2. Right — action cluster: Help, Advisor (with attention dot fed by
 *     resolver), AI Assistant placeholder. Search button + UserMenu land in
 *     Phase 4 + already exist in the sidebar footer respectively (R7).
 *
 * Phase 3 wires the sede breadcrumb to the active-sede hook: selecting an
 * option writes the `active_sede_id` cookie and invalidates the
 * `['appointments']` React Query family.
 *
 * The header itself is `h-12 border-b` (Supabase canonical) and lives inside
 * `DashboardShell`'s content wrapper — NOT inside `<DesktopSidebar>`.
 */
export function GlobalHeader({
  doctorId,
  doctorName,
  doctorFirstName,
  specialtyName,
  postgrados,
  email,
  avatarUrl,
  sedeName,
  sedeOptions,
  activeSedeId,
  moduleLabel,
  attention,
}: GlobalHeaderProps & {
  email: string;
  avatarUrl: string | null;
}): React.ReactElement {
  // Time-of-day greeting drives the first breadcrumb level. The hook ticks
  // every minute so a header left open across noon/midnight rolls forward
  // without a refresh. SSR renders the static fallback for the current bucket
  // — hydration is stable because both server and client compute the same
  // bucket from `new Date()`.
  const { greeting } = useGreeting(doctorFirstName);
  // Mount guard: Radix DropdownMenu / Popover auto-generated IDs (via
  // React.useId()) can mismatch between SSR and client hydration when the
  // server bundle has a different ID-counter ordering. Rendering the action
  // cluster only AFTER mount eliminates the hydration warning without changing
  // visible UX (the buttons aren't interactive on the server anyway).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasModule = typeof moduleLabel === 'string' && moduleLabel.length > 0;

  return (
    <header className="sticky top-0 z-40 hidden h-14 shrink-0 items-center border-b border-border bg-background/95 backdrop-blur md:flex">
      <div className="flex h-full flex-1 items-center gap-x-4 px-5">
        {/* Left: breadcrumb trail. min-w-0 + flex-shrink so very long doctor
            names don't push the hero offscreen — the breadcrumb truncates
            instead. */}
        <div className="flex min-w-0 shrink items-center gap-1.5 text-sm">
          <div className="flex items-center gap-2">
            <BreadcrumbPicker level="doctor" label={greeting} emphasis="primary" />
            <SpecialtyChip primary={specialtyName} additional={postgrados} />
          </div>
          <SlashSeparator />
          <SedeSwitcher
            activeSedeName={sedeName ?? 'Sin sede'}
            activeSedeId={activeSedeId ?? null}
            sedes={sedeOptions ?? []}
          />
          {hasModule && (
            <>
              <SlashSeparator />
              <BreadcrumbPicker
                level="module"
                label={moduleLabel as string}
                emphasis="tertiary"
              />
            </>
          )}
        </div>

        {/* Center: command palette hero. flex-1 expands to fill the gap;
            the hero itself is capped at `max-w-md` so it stays a sensible
            width on ultrawide screens. */}
        <div className="flex flex-1 justify-center">
          {mounted && (
            <CommandPaletteHero doctorId={doctorId} sedes={sedeOptions ?? []} />
          )}
        </div>

        {/* Right: action cluster. shrink-0 so it never collapses. */}
        <div className="flex shrink-0 items-center gap-1">
          {mounted ? (
            <>
              <QuickCreateButton />
              <div className="mx-1 h-8 w-px bg-border" aria-hidden="true" />
              <HelpButton />
              <NotificationsBell />
              <AdvisorButton attention={attention} />
              <div className="ml-2 h-8 w-px bg-border" aria-hidden="true" />
              {/* The connection state is now a coloured ring around the
                  avatar — see UserMenuDropdown. The standalone dot was
                  easy to miss next to so many action buttons. */}
              <UserMenuDropdown
                doctorName={doctorName}
                email={email}
                avatarUrl={avatarUrl}
                variant="header"
              />
            </>
          ) : (
            // SSR placeholder — matches the laid-out width of the real
            // action cluster so the layout doesn't reflow when client
            // hydration completes. The visual `<HeaderSkeleton>` is used
            // separately by the shell when the LAYOUT (Supabase) is still
            // loading. This narrower spacer covers the brief gap between
            // SSR HTML and React mount.
            <div
              className="flex items-center gap-1"
              aria-hidden="true"
              data-testid="global-header-action-cluster-placeholder"
            >
              <div className="h-8 w-8 rounded-full bg-primary/30" />
              <div className="mx-1 h-8 w-px bg-border" />
              <div className="h-8 w-8 rounded-full bg-muted/60" />
              <div className="h-8 w-8 rounded-full bg-muted/60" />
              <div className="h-8 w-8 rounded-full bg-muted/60" />
              <div className="ml-2 h-8 w-px bg-border" />
              <div className="h-9 w-9 rounded-full bg-muted ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-background" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Supabase-style forward slash between breadcrumb segments — a thin SVG line
 * angled like a slash. Hidden from assistive tech. Slightly more subtle than
 * the Phase 2 version so the focus stays on the labels themselves.
 */
function SlashSeparator(): React.ReactElement {
  return (
    <span
      data-testid="global-header-slash-separator"
      aria-hidden="true"
      className="px-0.5 text-border-strong/70"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="none"
      >
        <path d="M16 3.549L7.12 20.600" />
      </svg>
    </span>
  );
}
