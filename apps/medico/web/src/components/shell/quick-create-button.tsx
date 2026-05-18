'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@red-salud/design-system';
import {
  CalendarPlus,
  Pill,
  Plus,
  Stethoscope,
  Video,
  type LucideIcon,
} from 'lucide-react';

/**
 * @file quick-create-button.tsx
 * @description "+" button in the header action cluster. Opens a small
 * dropdown with the 4 things a doctor creates many times a day:
 * cita / consulta / receta / telemedicina.
 *
 * Visual + interaction parity with the UserMenu and SedeSwitcher: same
 * border tokens, same hover affordance, same backdrop blur. Keyboard
 * shortcuts shown as hints — the global Cmd+K palette is where these
 * shortcuts are actually bound (Fase 2 will let the doctor reassign).
 */

interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
  shortcut?: string;
  color: string;
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Nueva cita',
    icon: CalendarPlus,
    href: '/dashboard/agenda?action=new',
    shortcut: '⌘ N',
    color: 'text-sky-500',
  },
  {
    label: 'Nueva consulta',
    icon: Stethoscope,
    href: '/dashboard/consulta?action=new',
    shortcut: '⌘ ⇧ N',
    color: 'text-emerald-500',
  },
  {
    label: 'Crear receta',
    icon: Pill,
    href: '/dashboard/recetas?action=new',
    shortcut: '⌘ R',
    color: 'text-violet-500',
  },
  {
    label: 'Iniciar telemedicina',
    icon: Video,
    href: '/dashboard/consulta?mode=telemedicine',
    color: 'text-amber-500',
  },
];

export function QuickCreateButton(): React.ReactElement {
  const router = useRouter();
  // Hydration guard for Radix's auto-generated IDs — same pattern as the
  // other dropdowns in the shell.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Crear nuevo"
        data-testid="quick-create-button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Crear nuevo"
          data-testid="quick-create-button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={[
          'w-64 overflow-hidden rounded-xl p-1.5',
          'border border-border/30 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.55)]',
          'bg-popover/95 backdrop-blur-xl',
        ].join(' ')}
      >
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
          Crear rápido
        </DropdownMenuLabel>
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onSelect={() => router.push(action.href)}
              className="group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground/90 focus:bg-sidebar-accent focus:text-foreground data-[highlighted]:bg-sidebar-accent"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                <Icon className={`h-4 w-4 ${action.color}`} aria-hidden="true" />
              </span>
              <span className="flex-1 truncate">{action.label}</span>
              {action.shortcut && (
                <kbd className="rounded border border-border/70 bg-background px-1.5 py-px font-mono text-[10px] text-foreground/70">
                  {action.shortcut}
                </kbd>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
