'use client';

import { Menu, Search, Stethoscope } from 'lucide-react';

import { useCommandPalette } from './command-palette/command-palette-context';
import { ConnectionIndicator } from './connection-indicator';
import { NotificationsBell } from './notifications-bell';

/**
 * @file mobile-top-bar.tsx
 * @description Mobile sticky top bar.
 *
 * Visible only below `lg` (≥1024px). Carries the doctor's essentials in a
 * compact strip:
 *   - Hamburger → opens the nav Sheet
 *   - Brand mark + "Red Salud" wordmark
 *   - (right) Search trigger → opens the Cmd+K modal palette
 *   - (right) NotificationsBell with badge
 *   - (right) Connection indicator (online/offline dot)
 *
 * The desktop `GlobalHeader` is `hidden md:flex` so it doesn't render at
 * this breakpoint. Mobile users get the equivalent affordances here.
 *
 * Quick-create lives in the mobile bottom nav as the centered "+" CTA so
 * it stays thumb-friendly. The user menu is reachable from the nav Sheet.
 */

export interface MobileTopBarProps {
  /** Fired when the user taps the hamburger; the parent opens the Sheet. */
  onOpenSheet: () => void;
}

export function MobileTopBar({ onOpenSheet }: MobileTopBarProps): React.ReactElement {
  const { setOpen } = useCommandPalette();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <button
        type="button"
        onClick={onOpenSheet}
        aria-label="Abrir menú"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="text-base font-bold text-primary">Red Salud</span>
      </div>

      <div className="flex-1" />

      {/* Right-aligned actions: search trigger + bell + connection.
          Each is a compact icon-only button to stay thumb-friendly. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
      <NotificationsBell />
      <ConnectionIndicator />
    </header>
  );
}
