'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TooltipProvider } from '@red-salud/design-system';

import { useSidebarMode } from '../../hooks/use-sidebar-mode';

import { CommandPalette } from './command-palette/command-palette';
import { CommandPaletteProvider } from './command-palette/command-palette-context';
import { GlobalHotkeysBinder } from './command-palette/global-hotkeys-binder';
import { OfflineBanner } from './offline-banner';
import { DesktopSidebar } from './desktop-sidebar';
import { GlobalHeader } from './global-header';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MobileSidebarSheet } from './mobile-sidebar-sheet';
import { MobileTopBar } from './mobile-top-bar';
import { mergeWithStaticFallback } from './nav-mapper';
import { resolveModuleLabel } from './resolve-module-label';
import type { DashboardShellProps } from './types';

/**
 * @file dashboard-shell.tsx
 * @description Dashboard shell orchestrator — Supabase-style layout.
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ GlobalHeader (full-width, sticky top, h-14)                │  ← spans 100%
 *   ├────────┬───────────────────────────────────────────────────┤
 *   │        │                                                   │
 *   │  Side  │  Main content                                     │
 *   │  bar   │  (padded left for the rail width)                 │
 *   │        │                                                   │
 *   └────────┴───────────────────────────────────────────────────┘
 *
 * The desktop sidebar starts BELOW the header (`top-14`) so the header reads
 * as the primary navigation surface and the sidebar is contextual. Matches
 * Supabase's dashboard chrome.
 *
 * Two pieces of state:
 *
 *  1. **Sidebar mode** (`useSidebarMode`) — three-way enum persisted to
 *     localStorage. Drives whether the desktop sidebar is a narrow icon rail,
 *     a wide panel, or a narrow rail that floats-expand on hover.
 *
 *  2. **Mobile sheet open flag** — opens via hamburger, closes via overlay
 *     tap or close button.
 */
export function DashboardShell({
  doctorId,
  doctorName,
  doctorFirstName,
  email,
  avatarUrl,
  specialtyName,
  postgrados,
  children,
  navGroups,
  pinnedModules: _pinnedModules,
  verificationPending = false,
  sedeName,
  sedeOptions,
  activeSedeId,
  moduleLabel,
  attention,
}: DashboardShellProps): React.ReactElement {
  const {
    mode,
    setMode,
    isExpanded,
    isHoverExpanded,
    onMouseEnter,
    onMouseLeave,
  } = useSidebarMode();

  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const resolvedGroups = useMemo(
    () => mergeWithStaticFallback(navGroups),
    [navGroups],
  );

  // Client-side pathname is the reliable source for the module breadcrumb.
  // The server layout's `next-url` header isn't always populated during
  // client navigation, which previously hid behind a static "Inicio"
  // fallback. The server prop is now a hydration hint only.
  const pathname = usePathname();
  const liveModuleLabel = resolveModuleLabel(pathname) ?? moduleLabel;

  // Main content padding only accounts for the RAIL width — the hover-expanded
  // panel floats over the content rather than pushing it.
  //   mode='expanded' → padding = w-64 (sidebar always wide)
  //   else            → padding = w-14 (icon rail only)
  const wrapperPaddingClass = mode === 'expanded' ? 'lg:pl-64' : 'lg:pl-14';

  return (
    <CommandPaletteProvider>
    <TooltipProvider delayDuration={250}>
      <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-muted/30">
        {/* Full-width global header — sits ABOVE everything (sidebar starts
            below it). Sticky so it stays visible on scroll. */}
        <GlobalHeader
          doctorId={doctorId}
          doctorName={doctorName}
          doctorFirstName={doctorFirstName}
          specialtyName={specialtyName}
          postgrados={postgrados}
          email={email}
          avatarUrl={avatarUrl}
          sedeName={sedeName}
          sedeOptions={sedeOptions}
          activeSedeId={activeSedeId}
          moduleLabel={liveModuleLabel}
          attention={attention}
        />

        <MobileTopBar onOpenSheet={() => setSheetOpen(true)} />
        <MobileSidebarSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          doctorName={doctorName}
          email={email}
          avatarUrl={avatarUrl}
          groups={resolvedGroups}
        />

        {/* Offline / sync banner — sticks below the header. Silent when
            online and queue is empty; amber when offline; emerald with a
            spinner while a flush is running. */}
        <OfflineBanner />

        {/* Desktop sidebar — starts BELOW the header. */}
        <DesktopSidebar
          specialtyName={specialtyName}
          mode={mode}
          onChangeMode={setMode}
          isExpanded={isExpanded}
          isHoverExpanded={isHoverExpanded}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          groups={resolvedGroups}
        />

        {/* Content column — padded for the desktop sidebar rail. */}
        <div
          className={[
            'flex min-w-0 w-full flex-1 flex-col',
            'transition-[padding-left] duration-200 ease-out motion-reduce:transition-none',
            wrapperPaddingClass,
          ].join(' ')}
        >
          <main
            className={[
              'min-w-0 flex-1 items-start gap-4 p-4',
              'pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-8',
              'sm:px-6 lg:py-6 md:gap-8',
            ].join(' ')}
          >
            {verificationPending && (
              <div
                role="status"
                data-testid="verification-pending-banner"
                className="mb-4 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning"
              >
                Tu verificación SACS está pendiente. Algunos módulos pueden estar
                limitados hasta completarla.
              </div>
            )}
            {children}
          </main>
        </div>

        <MobileBottomNav />
      </div>
      {/* Cmd+K palette — mounted once at the shell level so every page can open
          it via the keyboard shortcut OR via the header trigger button. */}
      <CommandPalette
        doctorId={doctorId}
        doctorName={doctorName}
        sedes={sedeOptions ?? []}
        activeSedeId={activeSedeId ?? null}
      />
      {/* Global hotkey listener that fires custom shortcuts from the doctor's
          palette preferences (configured at /dashboard/configuracion/atajos). */}
      <GlobalHotkeysBinder />
    </TooltipProvider>
    </CommandPaletteProvider>
  );
}
