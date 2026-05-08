'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BOTTOM_NAV_ITEMS } from './nav-data';
import type { BottomNavItemData } from './types';

/**
 * @file mobile-bottom-nav.tsx
 * @description Mobile fixed bottom navigation (T-011).
 *
 * Renders 5 items in a horizontal row pinned to the bottom of the viewport.
 * Visible only below `lg` (≥1024px). Respects the iOS safe-area inset so it
 * sits above the home indicator on devices with rounded corners.
 *
 * The middle item (`atender`, index 2) is the call-to-action for jumping into
 * an active consultation. It receives a slightly larger icon and primary
 * tinting so it stands out from neighbouring entries.
 *
 * Active-state rule mirrors `<NavLink>`:
 *   - exact match: `pathname === href`
 *   - prefix match: `pathname.startsWith(href + '/')` — except for `/dashboard`
 *     so it never lights up on every subroute.
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  if (href === '/dashboard') return false;
  return pathname.startsWith(`${href}/`);
}

interface BottomNavLinkProps {
  item: BottomNavItemData;
  isCta: boolean;
  active: boolean;
}

function BottomNavLink({ item, isCta, active }: BottomNavLinkProps): React.ReactElement {
  const Icon = item.icon;

  // Base layout: equal-width, vertical icon + label stack.
  const baseClass =
    'group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors';

  // Color states. CTA always tints toward primary; non-CTA flips between
  // muted (idle) and primary (active).
  const colorClass = active || isCta ? 'text-primary' : 'text-muted-foreground hover:text-primary';

  // Icon scale. CTA grows slightly, active items get a subtle bump too.
  const iconClass = isCta
    ? 'h-6 w-6 transition-transform duration-200 group-hover:scale-110'
    : 'h-5 w-5 transition-transform duration-200 group-hover:scale-110';

  return (
    <Link
      href={item.href}
      data-cta={isCta ? 'true' : undefined}
      aria-current={active ? 'page' : undefined}
      className={[baseClass, colorClass].join(' ')}
    >
      {/* Active indicator pill above the icon — only for non-CTA active items. */}
      {active && !isCta && (
        <span
          aria-hidden="true"
          className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary"
        />
      )}
      <Icon className={iconClass} aria-hidden="true" strokeWidth={isCta ? 2.4 : 2} />
      <span className={isCta ? 'text-[11px] font-semibold' : 'text-[11px] font-medium'}>
        {item.label}
      </span>
    </Link>
  );
}

export function MobileBottomNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.12)] lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-2">
        {BOTTOM_NAV_ITEMS.map((item, index) => (
          <BottomNavLink
            key={item.key}
            item={item}
            isCta={index === 2}
            active={isActive(pathname, item.href)}
          />
        ))}
      </div>
    </nav>
  );
}
