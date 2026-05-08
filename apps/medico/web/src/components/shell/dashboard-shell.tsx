'use client';

import { useState } from 'react';

import { DesktopSidebar } from '@/components/shell/desktop-sidebar';
import { MobileBottomNav } from '@/components/shell/mobile-bottom-nav';
import { MobileSidebarSheet } from '@/components/shell/mobile-sidebar-sheet';
import { MobileTopBar } from '@/components/shell/mobile-top-bar';
import { useSidebarCollapsed } from '@/hooks/use-sidebar-collapsed';

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
}: DashboardShellProps): React.ReactElement {
  const { collapsed, toggle } = useSidebarCollapsed();
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  // Padding swaps with the sidebar width. Animated to match the sidebar's
  // `transition-[width]` so the main column glides instead of jumping.
  const wrapperPaddingClass = collapsed ? 'lg:pl-16' : 'lg:pl-72';

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-muted/40">
      <DesktopSidebar
        doctorName={doctorName}
        email={email}
        avatarUrl={avatarUrl}
        specialtyName={specialtyName}
        collapsed={collapsed}
        onToggleCollapse={toggle}
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
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
