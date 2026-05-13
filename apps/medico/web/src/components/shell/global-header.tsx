'use client';

import { AdvisorButton } from './advisor-button';
import { AIAssistantButton } from './ai-assistant-button';
import { BreadcrumbPicker } from './breadcrumb-picker';
import { HelpButton } from './help-button';
import type { GlobalHeaderProps } from './types';

/**
 * @file global-header.tsx
 * @description Supabase-style global header (Phase 2 of medico-shell-supabase-style).
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
 * The header itself is `h-12 border-b` (Supabase canonical) and lives inside
 * `DashboardShell`'s content wrapper — NOT inside `<DesktopSidebar>`.
 */
export function GlobalHeader({
  doctorName,
  sedeName,
  moduleLabel,
  attention,
}: GlobalHeaderProps): React.ReactElement {
  return (
    <header className="hidden h-12 shrink-0 items-center border-b bg-background md:flex">
      <div className="flex h-full flex-1 items-center justify-between gap-x-8 overflow-x-auto pl-4 pr-3">
        <div className="flex items-center gap-2 text-sm">
          <BreadcrumbPicker level="doctor" label={doctorName} />
          <SlashSeparator />
          <BreadcrumbPicker level="sede" label={sedeName ?? 'Sin sede'} />
          <SlashSeparator />
          <BreadcrumbPicker level="module" label={moduleLabel} />
        </div>

        <div className="flex items-center gap-2">
          <HelpButton />
          <AdvisorButton attention={attention} />
          <AIAssistantButton />
        </div>
      </div>
    </header>
  );
}

/**
 * Supabase-style forward slash between breadcrumb segments — a thin SVG line
 * angled like a slash. Hidden from assistive tech.
 */
function SlashSeparator(): React.ReactElement {
  return (
    <span
      data-testid="global-header-slash-separator"
      aria-hidden="true"
      className="px-1 text-border-strong"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      >
        <path d="M16 3.549L7.12 20.600" />
      </svg>
    </span>
  );
}
