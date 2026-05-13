'use client';

import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

/**
 * @file ai-assistant-button.tsx
 * @description Placeholder Supabase-style AI assistant trigger (Phase 2).
 *
 * Design Decision 6 explicitly defers the full chat dock. The Gemini service
 * (`lib/services/gemini-service.ts`) is still a stub returning `[]`. This
 * button keeps the slot discoverable on the GlobalHeader so the action
 * cluster reads correctly; clicking it pops an informational toast pointing
 * at the future ICD-11 suggestion experience.
 *
 * Visual styling matches HelpButton / AdvisorButton — round, 32px, with the
 * Supabase-style sparkles glyph (rhombus-y feel).
 */
export function AIAssistantButton(): React.ReactElement {
  return (
    <button
      type="button"
      aria-label="Asistente IA"
      onClick={() => {
        toast.info(
          'Asistente IA próximamente — sugerencias ICD-11 con Gemini.',
        );
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-strong text-foreground-lighter transition-colors hover:border-foreground-lighter hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
