'use client';

import { Menu, Stethoscope } from 'lucide-react';

/**
 * @file mobile-top-bar.tsx
 * @description Mobile sticky top bar (T-009).
 *
 * Visible only below `lg` (≥1024px). Contains the hamburger button that opens
 * the mobile nav `Sheet`, plus the brand mark + "Red Salud" wordmark. Uses
 * `backdrop-blur` so content scrolling underneath stays legible.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

export interface MobileTopBarProps {
  /** Fired when the user taps the hamburger; the parent opens the Sheet. */
  onOpenSheet: () => void;
}

export function MobileTopBar({ onOpenSheet }: MobileTopBarProps): React.ReactElement {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
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

      {/* Spacer reserved for future right-aligned actions (notifications, quick search). */}
      <div className="flex-1" />
    </header>
  );
}
