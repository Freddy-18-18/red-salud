'use client';

import { useEffect, useState } from 'react';
import {
  CommandInput,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@red-salud/design-system';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { useCommandPalette } from './command-palette-context';
import { CommandListContents } from './command-list-contents';
import { useCommandContents } from './use-command-contents';
import type { ShellSedeOption } from '../types';

/**
 * @file command-palette.tsx
 * @description Modal-style Cmd+K palette mounted globally in DashboardShell.
 *
 * This is the surface that opens when:
 *   - The user presses Cmd+K / Ctrl+K (any page)
 *   - The user clicks the header trigger (any page that shows it)
 *
 * The dashboard home (`/dashboard`) also exposes an INLINE hero surface
 * (`<CommandPaletteHero>`) — both share the same business logic via
 * `useCommandContents`, so they stay in lockstep.
 *
 * Visual language matches the user-menu and sede-switcher: soft border,
 * deeper shadow, glassy backdrop, gradient-tinted header.
 */

interface CommandPaletteProps {
  doctorId: string;
  doctorName: string;
  sedes: ShellSedeOption[];
  activeSedeId: string | null;
}

const CONTENT_CLASSES = [
  // Surface tokens shared with UserMenu / SedeSwitcher
  'overflow-hidden rounded-2xl p-0 sm:max-w-xl',
  'border border-border/30 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.6)]',
  'bg-popover/95 backdrop-blur-2xl',
  // Smooth open animation that respects motion preferences
  'data-[state=open]:duration-200 data-[state=closed]:duration-150',
  // Override the cmdk class scoping so we can layer our own padding tokens
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5',
  '[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold',
  '[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]',
  '[&_[cmdk-group-heading]]:text-muted-foreground/80',
  '[&_[cmdk-group]]:px-1.5 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0',
  '[&_[cmdk-input]]:h-14 [&_[cmdk-input]]:text-base',
  '[&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:px-2.5 [&_[cmdk-item]]:py-2',
  '[&_[cmdk-item]]:gap-2.5 [&_[cmdk-item]]:cursor-default',
  '[&_[cmdk-item][data-selected=true]]:bg-sidebar-accent',
  '[&_[cmdk-item][data-selected=true]]:text-foreground',
  '[&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4',
].join(' ');

export function CommandPalette({
  doctorId,
  sedes,
  activeSedeId,
}: CommandPaletteProps): React.ReactElement {
  const { open, setOpen } = useCommandPalette();
  const [query, setQuery] = useState('');

  // Reset the query whenever the palette closes so the next opening starts
  // fresh — without this, a stale "mari" lingers and the doctor sees the old
  // results before the field gets focus again.
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const contents = useCommandContents({
    doctorId,
    activeSedeId,
    sedes,
    query,
    onAfterSelect: () => setOpen(false),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={CONTENT_CLASSES}>
        {/* Accessible label + description for screen readers */}
        <DialogTitle className="sr-only">Buscador de comandos</DialogTitle>
        <DialogDescription className="sr-only">
          Buscá pacientes, citas, recetas, acciones rápidas, sedes o ajustes.
          Usá las flechas para navegar y Enter para seleccionar.
        </DialogDescription>

        <CommandPrimitive
          shouldFilter
          className="flex h-full w-full flex-col overflow-hidden bg-transparent text-popover-foreground"
        >
          {/* Custom input wrapper styled like the rest of the shell. */}
          <div className="relative flex items-center border-b border-border/40 px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Buscar pacientes, citas, acciones..."
              className="border-0 bg-transparent pl-3 placeholder:text-muted-foreground/70 focus:ring-0"
              autoFocus
            />
            <kbd className="ml-2 hidden items-center gap-0.5 rounded border border-border/70 bg-background px-1 py-px font-mono text-[10px] font-medium text-foreground/70 sm:inline-flex">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[60vh] overflow-y-auto px-1 py-2">
            <CommandListContents contents={contents} />
          </CommandList>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
