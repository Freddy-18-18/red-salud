'use client';

import { useEffect, useRef, useState } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { CommandList } from '@red-salud/design-system';
import { Search, X } from 'lucide-react';

import { useActiveSede } from '@/hooks/use-active-sede';

import { useCommandPalette } from './command-palette-context';
import { CommandListContents } from './command-list-contents';
import { useCommandContents } from './use-command-contents';
import type { ShellSedeOption } from '../types';

/**
 * @file command-palette-hero.tsx
 * @description Inline command palette designed to live INSIDE the global
 * header — the search surface follows the Linear / GitHub pattern: a compact
 * pill in the chrome that floats a results dropdown below when focused.
 *
 * The container has a fixed height (so the header doesn't reflow when the
 * palette expands). The results panel is `position: absolute` so it overlays
 * page content with a slide-down animation, then disappears on blur/Escape.
 *
 * Shares its commands + dynamic search with the modal palette via
 * `useCommandContents` — the two surfaces stay in lockstep because they read
 * from the same hook, render the same `<CommandListContents>`, and use the
 * same select handlers.
 */

interface CommandPaletteHeroProps {
  doctorId: string;
  sedes: ShellSedeOption[];
}

const INPUT_BASE_CLASSES = [
  // Pill input shell — compact enough to live inside h-14 header chrome.
  'relative flex h-9 w-full items-center gap-2.5 rounded-full px-3.5',
  'border border-border/40 bg-muted/40',
  'transition-[border-color,background-color,box-shadow] duration-150 motion-reduce:transition-none',
  'hover:border-border hover:bg-muted/60',
].join(' ');

const INPUT_FOCUSED_CLASSES = [
  'border-primary/40 bg-popover/95',
  'shadow-[0_0_0_4px_rgba(59,130,246,0.08)]',
].join(' ');

const PANEL_CLASSES = [
  // Floating dropdown panel below the input. Absolutely positioned so the
  // header doesn't grow; z-50 to clear sticky content.
  'absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50',
  'overflow-hidden rounded-2xl',
  'border border-border/30',
  'bg-popover/95 backdrop-blur-2xl',
  'shadow-[0_24px_80px_-20px_rgba(0,0,0,0.55)]',
  // Slide-down + fade. Uses Tailwind data-state values via group below.
  'origin-top transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none',
].join(' ');

const COMMAND_THEME_CLASSES = [
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5',
  '[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold',
  '[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]',
  '[&_[cmdk-group-heading]]:text-muted-foreground/80',
  '[&_[cmdk-group]]:px-1.5 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0',
  '[&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:px-2.5 [&_[cmdk-item]]:py-2',
  '[&_[cmdk-item]]:gap-2.5 [&_[cmdk-item]]:cursor-default',
  '[&_[cmdk-item][data-selected=true]]:bg-sidebar-accent',
  '[&_[cmdk-item][data-selected=true]]:text-foreground',
  '[&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4',
].join(' ');

export function CommandPaletteHero({
  doctorId,
  sedes,
}: CommandPaletteHeroProps): React.ReactElement {
  const { activeSedeId } = useActiveSede();
  const { triggerVisible, triggerHydrated } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Collapse when the user clicks outside the hero. `mousedown` ensures we
  // close BEFORE the click resolves on whatever else they tapped, so any
  // button/link still receives its click intact.
  useEffect(() => {
    if (!expanded) return;
    function onDown(event: MouseEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setExpanded(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [expanded]);

  // Escape collapses + clears + blurs.
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setExpanded(false);
      setQuery('');
      inputRef.current?.blur();
    }
  }

  const contents = useCommandContents({
    doctorId,
    activeSedeId: activeSedeId ?? null,
    sedes,
    query,
    onAfterSelect: () => {
      setExpanded(false);
      setQuery('');
    },
  });

  // Honour the doctor's preference to hide the visible header search. The
  // global Cmd+K shortcut still opens the modal via the provider listener.
  if (!triggerHydrated || !triggerVisible) return null;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      data-expanded={expanded}
      className="relative w-full max-w-md"
    >
      <CommandPrimitive
        shouldFilter
        className={`flex w-full flex-col bg-transparent text-popover-foreground ${COMMAND_THEME_CLASSES}`}
      >
        {/* Pill input — single-line, header-height friendly. */}
        <div className={`${INPUT_BASE_CLASSES} ${expanded ? INPUT_FOCUSED_CLASSES : ''}`}>
          <Search
            className={`h-4 w-4 shrink-0 transition-colors ${
              expanded ? 'text-primary' : 'text-muted-foreground'
            }`}
            aria-hidden="true"
          />
          <CommandPrimitive.Input
            ref={inputRef}
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              if (value.length > 0 && !expanded) setExpanded(true);
            }}
            onFocus={() => setExpanded(true)}
            placeholder="Buscar pacientes, citas, acciones..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />
          {expanded ? (
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setQuery('');
                inputRef.current?.blur();
              }}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              aria-label="Cerrar buscador"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="hidden items-center gap-0.5 rounded border border-border/70 bg-background px-1 py-px font-mono text-[10px] font-medium text-foreground/70 sm:inline-flex">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          )}
        </div>

        {/* Floating results panel — absolute so the header chrome doesn't
            shift when the doctor focuses the input. */}
        {expanded && (
          <div
            className={`${PANEL_CLASSES} animate-in fade-in-0 slide-in-from-top-1`}
            role="dialog"
            aria-label="Resultados de búsqueda"
          >
            <CommandList className="max-h-[60vh] overflow-y-auto px-1 py-2">
              <CommandListContents contents={contents} />
            </CommandList>
          </div>
        )}
      </CommandPrimitive>
    </div>
  );
}
