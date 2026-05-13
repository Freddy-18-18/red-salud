'use client';

import { useMemo, useState } from 'react';
import { TooltipProvider } from '@red-salud/design-system';

import { useSidebarCollapsed } from '../../hooks/use-sidebar-collapsed';

import { DesktopSidebar } from './desktop-sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MobileSidebarSheet } from './mobile-sidebar-sheet';
import { MobileTopBar } from './mobile-top-bar';
import { mergeWithStaticFallback } from './nav-mapper';
import type { DashboardShellProps } from './types';

/**
 * @file dashboard-shell.tsx
 * @description Dashboard shell orchestrator (T-012).
 *
 * Pure composition root for the medico AppShell. Owns two pieces of state:
 *
 *  1. Desktop sidebar collapsed flag — sourced from `useSidebarCollapsed()`,
 *     persisted to `localStorage['medico:sidebar-collapsed']`. Drives the
 *     content wrapper's left padding (`lg:pl-72` ↔ `lg:pl-16`) so the main
 *     column reflows when the rail collapses (FR-1, FR-3).
 *  2. Mobile sheet open flag — local `useState`. `MobileTopBar.onOpenSheet`
 *     opens it; `MobileSidebarSheet.onClose` closes it (FR-5).
 *
 * Composition (top-down):
 *  - `<DesktopSidebar>` — fixed rail, lg+ only.
 *  - Content wrapper (`<div>`):
 *      - `<MobileTopBar>` — sticky top, lg:hidden.
 *      - `<MobileSidebarSheet>` — overlay, lg:hidden.
 *      - `<main>` — page content. Bottom padding clears the bottom nav on
 *        mobile (`pb-[calc(5.25rem+env(safe-area-inset-bottom))]`) and
 *        relaxes back to `lg:pb-8` on desktop.
 *  - `<MobileBottomNav>` — fixed bottom, lg:hidden.
 *
 * The shell does NOT call Supabase. Doctor identity is fetched server-side by
 * `app/dashboard/layout.tsx` and forwarded as props (NFR-5: domain isolation).
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */
export function DashboardShell({
  doctorName,
  email,
  avatarUrl,
  specialtyName,
  children,
  navGroups,
  pinnedModules: _pinnedModules,
  verificationPending = false,
}: DashboardShellProps): React.ReactElement {
  const { collapsed, toggle } = useSidebarCollapsed();
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const resolvedGroups = useMemo(
    () => mergeWithStaticFallback(navGroups),
    [navGroups],
  );

  // Padding swaps with the sidebar width. Animated to match the sidebar's
  // `transition-[width]` so the main column glides instead of jumping.
  const wrapperPaddingClass = collapsed ? 'lg:pl-16' : 'lg:pl-72';

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-muted/40">
        <DesktopSidebar
          doctorName={doctorName}
          email={email}
          avatarUrl={avatarUrl}
          specialtyName={specialtyName}
          collapsed={collapsed}
          onToggleCollapse={toggle}
          groups={resolvedGroups}
        />

        <div
          className={[
            'flex min-w-0 w-full flex-col',
            'transition-[padding] duration-300 ease-in-out',
            wrapperPaddingClass,
          ].join(' ')}
        >
          <MobileTopBar onOpenSheet={() => setSheetOpen(true)} />
          <MobileSidebarSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            doctorName={doctorName}
            email={email}
            avatarUrl={avatarUrl}
            groups={resolvedGroups}
          />

          <main
            className={[
              'min-w-0 flex-1 items-start gap-4 p-4',
              // Reserve room for the fixed bottom nav on mobile, with safe-area
              // inset for notched devices. Desktop drops the bottom buffer.
              'pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-8',
              'sm:px-6 lg:py-8 md:gap-8',
            ].join(' ')}
          >
            {verificationPending && (
              <div
                role="status"
                data-testid="verification-pending-banner"
                className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                Tu verificación SACS está pendiente. Algunos módulos pueden estar limitados hasta completarla.
              </div>
            )}
            {children}
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </TooltipProvider>
  );
}
