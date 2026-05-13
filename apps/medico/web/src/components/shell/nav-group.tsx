'use client';

import { NavLink } from './nav-link';
import type { NavGroupData } from './types';

/**
 * @file nav-group.tsx
 * @description Sidebar nav-group wrapper (T-005).
 *
 * Renders a group heading + a list of `<NavLink>` children. The heading hides
 * automatically in collapsed mode (icon-only rail), keeping items reachable
 * but visually decluttering the rail.
 *
 * Used by both the desktop sidebar and the mobile sheet — they share the same
 * `NAV_GROUPS` data and group component.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 *
 * ## medico-shell-supabase-style (Phase 1, R4)
 * Each group emits a 1px decorative divider after its content. Stacked groups
 * therefore separate visually without needing manual spacing tweaks at the
 * parent. The divider has `role="separator"` so assistive tech treats it as a
 * structural break, not as content.
 */

export interface NavGroupProps {
  /** Group definition (label + items). */
  group: NavGroupData;
  /** When true, hides the heading and renders items in icon-only mode. */
  collapsed?: boolean;
  /**
   * Optional click handler propagated to every child `<NavLink>` (typically
   * used by the mobile sheet to close itself when a link is followed).
   */
  onItemClick?: () => void;
}

export function NavGroup({ group, collapsed = false, onItemClick }: NavGroupProps): React.ReactElement {
  return (
    <div>
      {!collapsed && (
        <p className="px-3 mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {group.label}
        </p>
      )}
      <nav className="flex flex-col gap-0.5" aria-label={group.label}>
        {group.items.map((item) => (
          <NavLink key={item.key} item={item} collapsed={collapsed} onClick={onItemClick} />
        ))}
      </nav>
      {/*
        R4 divider — purely decorative, sits inside the group container so the
        parent sidebar doesn't need to know about inter-group spacing rules.
      */}
      <div
        role="separator"
        aria-orientation="horizontal"
        className="mt-3 mx-auto h-px w-[calc(100%-1rem)] bg-border-muted"
      />
    </div>
  );
}
