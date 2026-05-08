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
    </div>
  );
}
