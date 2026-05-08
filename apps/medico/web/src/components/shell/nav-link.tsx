'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { NavLinkData } from './types';

/**
 * @file nav-link.tsx
 * @description Reusable navigation link with active-route awareness (T-004).
 *
 * Renders a single sidebar entry. Computes its own active state from
 * `usePathname()` so callers don't need to pass it in. Active rule:
 * - exact match: `pathname === href`
 * - prefix match: `pathname.startsWith(href + '/')` — but ONLY for non-`/dashboard`
 *   items (otherwise `/dashboard` would light up on every dashboard subroute).
 *
 * Used by both the desktop sidebar (`<NavGroup>`) and the mobile sheet.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

/**
 * Decides whether the link should render as the active page.
 * Pulled out as a pure function for clarity and testability.
 */
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  // The dashboard root is special: never light it up on subroutes, otherwise
  // it would always be active.
  if (href === '/dashboard') return false;
  return pathname.startsWith(`${href}/`);
}

export interface NavLinkProps {
  /** Navigation data (label, href, icon, optional badge). */
  item: NavLinkData;
  /** When true, hides the label and badge — icon only with title tooltip. */
  collapsed?: boolean;
  /** Optional click handler (used by mobile sheet to close after navigation). */
  onClick?: () => void;
}

export function NavLink({ item, collapsed = false, onClick }: NavLinkProps): React.ReactElement {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  // Tailwind class composition. Kept inline (no `cn()` utility) so the
  // component has zero internal deps beyond its data contract.
  const baseClass =
    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group';
  const stateClass = active
    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary';
  const collapsedClass = collapsed ? 'justify-center' : '';

  const className = [baseClass, stateClass, collapsedClass].filter(Boolean).join(' ');

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={className}
      // Tooltip is only useful when label is hidden (collapsed mode). Always
      // attached when collapsed so keyboard focus shows native tooltip too.
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      />
      {!collapsed && (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-800 ml-auto">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
