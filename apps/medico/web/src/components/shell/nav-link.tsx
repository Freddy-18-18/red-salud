'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@red-salud/design-system';

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
 *
 * ## medico-shell-supabase-style (Phase 1)
 * - R2: When collapsed, the icon is wrapped in a Radix `Tooltip` so the label
 *   remains discoverable on hover/focus. When expanded, no tooltip mounts.
 * - R5: When `attention === true`, an aria-hidden destructive-colored dot is
 *   rendered at the top-right corner, driven by the capability resolver.
 *
 * A `<TooltipProvider>` must be mounted upstream (typically in `dashboard-shell.tsx`)
 * for the tooltip rendering to function.
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
  /** Navigation data (label, href, icon, optional badge, optional attention). */
  item: NavLinkData;
  /** When true, hides the label and badge — icon only with Radix tooltip. */
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

  const linkBody = (
    <Link
      href={item.href}
      onClick={onClick}
      className={className}
      // Keep the native `title` only in expanded mode (tooltip handles
      // collapsed accessibility). Avoids a duplicate Radix-tooltip + browser-
      // tooltip popping at the same time when collapsed.
      title={collapsed ? undefined : item.label}
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
      {item.attention && (
        <span
          data-testid="nav-link-attention-dot"
          aria-hidden="true"
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive"
        />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkBody}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkBody;
}
