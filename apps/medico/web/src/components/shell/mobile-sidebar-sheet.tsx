'use client';

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@red-salud/design-system';
import { Stethoscope } from 'lucide-react';

import { NAV_GROUPS } from './nav-data';
import { NavGroup } from './nav-group';
import { UserMenuDropdown } from './user-menu-dropdown';

/**
 * @file mobile-sidebar-sheet.tsx
 * @description Mobile slide-in nav sheet (T-010).
 *
 * Wraps `<Sheet>` from `@red-salud/design-system`. The parent owns `open`
 * state; we forward closes through `onClose` so the parent can also reset it
 * when needed. Each `<NavLink>` inside receives `onClick={onClose}`, so
 * tapping a destination automatically dismisses the sheet — matching the
 * native iOS / Android pattern.
 *
 * Mirrors the desktop sidebar's content (header brand, NAV_GROUPS, user menu)
 * but always expanded — no collapse semantics on mobile.
 *
 * Accessibility:
 * - `<SheetTitle>` is required by Radix Dialog; we provide a visible title.
 * - `<SheetDescription>` provides the announced summary for screen readers.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

export interface MobileSidebarSheetProps {
  /** Sheet visibility (controlled by parent). */
  open: boolean;
  /** Called when the user dismisses the sheet (overlay click, Esc, link tap). */
  onClose: () => void;
  /** Forwarded to the user menu in the footer. */
  doctorName: string;
  /** Forwarded to the user menu in the footer. */
  email: string;
  /** Forwarded to the user menu in the footer. */
  avatarUrl: string | null;
}

export function MobileSidebarSheet({
  open,
  onClose,
  doctorName,
  email,
  avatarUrl,
}: MobileSidebarSheetProps): React.ReactElement {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        // Radix calls `onOpenChange(false)` on Esc / overlay click. Forward
        // it as a close — we never tell it to open from inside.
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="left"
        className="flex w-72 flex-col gap-0 p-0 sm:max-w-xs"
      >
        {/* Header: brand. SheetTitle is rendered visibly so it doubles as the rail title. */}
        <div className="flex h-16 shrink-0 items-center gap-2 border-b bg-gradient-to-r from-primary/5 to-transparent px-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col">
            <SheetTitle className="truncate text-sm font-bold leading-tight text-primary">
              Red Salud
            </SheetTitle>
            <SheetDescription className="truncate text-[11px] font-medium text-muted-foreground">
              Consultorio Médico
            </SheetDescription>
          </div>
        </div>

        {/* Body: scrollable nav groups + footer */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
            {NAV_GROUPS.map((group) => (
              <NavGroup
                key={group.key}
                group={group}
                collapsed={false}
                onItemClick={onClose}
              />
            ))}
          </div>

          <div className="border-t bg-muted/20 p-3">
            <UserMenuDropdown
              doctorName={doctorName}
              email={email}
              avatarUrl={avatarUrl}
              collapsed={false}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
