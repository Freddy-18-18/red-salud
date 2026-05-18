'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@red-salud/design-system';
import { ChevronsUpDown } from 'lucide-react';

/**
 * @file breadcrumb-picker.tsx
 * @description Generic breadcrumb segment with optional Popover picker.
 *
 * Used 3 times in the GlobalHeader (level=doctor/sede/module). Renders the
 * provided label next to a chevron-up-down icon. When `options` are present
 * the chevron acts as a Radix Popover trigger; otherwise the whole trigger is
 * disabled (graceful Phase 2 degradation — sede table arrives in Phase 3).
 *
 * Individual doctor practice ONLY — no clinic/multi-org concepts.
 */

export interface BreadcrumbPickerOption {
  id: string;
  label: string;
}

export interface BreadcrumbPickerProps {
  /** Discriminator for the level being rendered (used for testing + ARIA). */
  level: 'doctor' | 'sede' | 'module';
  /** Visible label, Spanish (es-VE). */
  label: string;
  /**
   * Available options for the picker. When omitted or empty, the trigger is
   * rendered disabled — the breadcrumb degrades to a plain label.
   */
  options?: BreadcrumbPickerOption[];
  /** Called with the selected option id. */
  onSelect?: (id: string) => void;
  /**
   * Visual weight inside the breadcrumb trail. Controls font weight + color
   * so the eye anchors on the doctor name first, then sede, then module.
   * Defaults to `secondary`.
   */
  emphasis?: 'primary' | 'secondary' | 'tertiary';
}

const EMPHASIS_CLASSES: Record<NonNullable<BreadcrumbPickerProps['emphasis']>, string> = {
  primary: 'font-semibold text-foreground',
  secondary: 'font-medium text-foreground',
  tertiary: 'font-medium text-foreground-light',
};

export function BreadcrumbPicker({
  level,
  label,
  options,
  onSelect,
  emphasis = 'secondary',
}: BreadcrumbPickerProps): React.ReactElement {
  const hasOptions = Array.isArray(options) && options.length > 0;
  const emphasisClass = EMPHASIS_CLASSES[emphasis];

  const trigger = (
    <button
      type="button"
      data-testid={`breadcrumb-picker-${level}`}
      data-level={level}
      data-emphasis={emphasis}
      disabled={!hasOptions}
      className={[
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors',
        emphasisClass,
        'hover:bg-surface-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        'disabled:cursor-default disabled:opacity-100 disabled:hover:bg-transparent',
      ].join(' ')}
    >
      <span className="max-w-[14rem] truncate">{label}</span>
      {hasOptions && (
        <ChevronsUpDown
          className="h-3 w-3 text-foreground-lighter"
          aria-hidden="true"
        />
      )}
    </button>
  );

  if (!hasOptions) {
    return trigger;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <ul role="listbox" className="flex flex-col">
          {options!.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                role="option"
                aria-selected={opt.label === label}
                onClick={() => onSelect?.(opt.id)}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:bg-sidebar-accent"
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
