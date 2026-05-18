'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@red-salud/design-system';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  Check,
  Settings2,
} from 'lucide-react';

import type { SidebarMode } from '../../hooks/use-sidebar-mode';

interface ModeOption {
  value: SidebarMode;
  icon: typeof PanelLeftClose;
  label: string;
  description: string;
}

const OPTIONS: ReadonlyArray<ModeOption> = [
  {
    value: 'hover',
    icon: PanelRightClose,
    label: 'Expandir al pasar el mouse',
    description: 'Por defecto angosto. Se expande sobre el contenido al pasar el cursor.',
  },
  {
    value: 'collapsed',
    icon: PanelLeftClose,
    label: 'Colapsado siempre',
    description: 'Rail angosto fijo. Solo iconos.',
  },
  {
    value: 'expanded',
    icon: PanelLeftOpen,
    label: 'Expandido siempre',
    description: 'Panel ancho fijo. Iconos + texto.',
  },
];

interface SidebarModeSwitcherProps {
  /** Whether the parent sidebar is currently showing labels (expanded). */
  expanded: boolean;
  /** Current selected mode. */
  mode: SidebarMode;
  /** Callback to change mode. */
  onChange: (next: SidebarMode) => void;
}

/**
 * Compact mode-switcher rendered at the foot of the desktop sidebar.
 *
 *  - When `expanded`: shows a labeled row with the current mode's icon + name,
 *    chevron-style. Click opens a popover with the three options.
 *  - When collapsed (icon rail): shows only the gear icon. Hover tooltip
 *    surfaces the current mode. Click opens the same popover.
 *
 * Visually quiet: lives in the sidebar footer so it never competes with primary
 * nav. Tooltips on each option explain the behavior — important because the
 * difference between "collapsed" and "hover" isn't obvious from the icon alone.
 */
export function SidebarModeSwitcher({
  expanded,
  mode,
  onChange,
}: SidebarModeSwitcherProps): React.ReactElement {
  const current = OPTIONS.find((o) => o.value === mode) ?? OPTIONS[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        {expanded ? (
          <button
            type="button"
            aria-label="Configurar la barra lateral"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Settings2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-medium text-foreground">
                Barra lateral
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {current.label}
              </span>
            </span>
          </button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Barra lateral: ${current.label}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{current.label}</TooltipContent>
          </Tooltip>
        )}
      </PopoverTrigger>

      <PopoverContent side="top" align="start" className="w-72 p-2">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Barra lateral
          </p>
        </div>
        <ul className="space-y-0.5">
          {OPTIONS.map((opt) => {
            const isActive = opt.value === mode;
            const Icon = opt.icon;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => onChange(opt.value)}
                  aria-pressed={isActive}
                  className={[
                    'w-full flex items-start gap-3 rounded-md px-2.5 py-2 text-left',
                    'transition-colors motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive ? 'bg-primary/10' : 'hover:bg-muted',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-0.5 flex h-7 w-7 items-center justify-center rounded-md shrink-0',
                      isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={[
                        'text-sm font-medium',
                        isActive ? 'text-primary' : 'text-foreground',
                      ].join(' ')}
                    >
                      {opt.label}
                    </span>
                    <span className="text-xs text-muted-foreground leading-snug">
                      {opt.description}
                    </span>
                  </span>
                  {isActive && (
                    <Check className="mt-1 h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
