'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@red-salud/design-system';
import { CircleHelp, FileText, MessageCircleQuestion } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * @file help-button.tsx
 * @description Round Supabase-style help action (R7).
 *
 * Identical wrapper styling to AdvisorButton + AIAssistantButton. Click opens
 * a small DropdownMenu with two entries:
 *   1. Documentación → routes to `/help`
 *   2. Enviar feedback → placeholder toast until Phase 5 wires the form modal
 *
 * No data dependencies — pure presentation + routing.
 */

export function HelpButton(): React.ReactElement {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Ayuda"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-strong text-foreground-lighter transition-colors hover:border-foreground-lighter hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <CircleHelp className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ayuda</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push('/help')}>
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          Documentación
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            // Phase 5 will wire a real feedback form modal — placeholder for now.
            toast.info('Próximamente podrás enviarnos feedback desde acá.');
          }}
        >
          <MessageCircleQuestion className="mr-2 h-4 w-4" aria-hidden="true" />
          Enviar feedback
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
