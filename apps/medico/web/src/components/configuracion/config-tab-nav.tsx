'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  User,
  Building2,
  Clock,
  DollarSign,
  FileSignature,
  Bell,
  Palette,
  ShieldAlert,
  Settings,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon registry. The Server Component layout passes `iconName: string`
 * (not the function itself) because functions cannot cross the
 * Server → Client component boundary in React Server Components.
 */
const ICONS: Record<string, LucideIcon> = {
  User,
  Building2,
  Clock,
  DollarSign,
  FileSignature,
  Bell,
  Palette,
  ShieldAlert,
  Settings,
};

export interface ConfigTab {
  href: string;
  label: string;
  description: string;
  iconName: string;
}

interface ConfigTabNavProps {
  tabs: ConfigTab[];
}

function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Settings;
}

/**
 * URL-driven tab nav for /dashboard/configuracion/*.
 *
 * Desktop: stacked vertical list with description + chevron (Linear/Stripe
 * pattern). Mobile (< lg): scrollable horizontal row with icons + labels.
 *
 * Active state is computed from `usePathname()` so navigation reflects the
 * URL, not local state.
 */
export function ConfigTabNav({ tabs }: ConfigTabNavProps): React.ReactElement {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav
        aria-label="Secciones de configuración"
        className="hidden lg:block rounded-xl border border-border bg-card p-2"
      >
        <ul className="space-y-0.5">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            const Icon = getIcon(tab.iconName);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'group flex items-center gap-3 rounded-lg px-2.5 py-2',
                    'transition-colors motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-md shrink-0',
                      active
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground group-hover:text-foreground',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={[
                        'text-sm font-medium truncate',
                        active ? 'text-foreground' : '',
                      ].join(' ')}
                    >
                      {tab.label}
                    </span>
                    <span className="text-xs text-muted-foreground truncate leading-tight">
                      {tab.description}
                    </span>
                  </span>
                  {active && (
                    <ChevronRight
                      className="h-4 w-4 text-primary shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: horizontal scroll */}
      <nav
        aria-label="Secciones de configuración"
        className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide"
      >
        <ul className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            const Icon = getIcon(tab.iconName);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium',
                    'border whitespace-nowrap transition-colors motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-border-strong',
                  ].join(' ')}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
