'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@red-salud/design-system';
import { AlertCircle, Keyboard, Trash2 } from 'lucide-react';

import {
  findShortcutConflict,
  shortcutFromEvent,
  shortcutGlyphs,
} from '@/lib/palette/hotkeys';

/**
 * @file capture-shortcut-dialog.tsx
 * @description Modal that captures a keyboard combination for one command.
 *
 * Behaviour:
 *   - On open, listens for global keydown until the doctor presses a valid
 *     combination (modifier + key).
 *   - Shows live preview of the combination they're about to bind.
 *   - Warns when the combination conflicts with another command's binding.
 *   - "Guardar" persists; "Quitar atajo" clears the custom binding so the
 *     default takes over.
 */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Command being edited. Used to skip self-conflicts and label the dialog. */
  commandId: string;
  commandLabel: string;
  /** Default shortcut shown as fallback when the doctor clears the custom one. */
  defaultShortcut: string | null;
  /** Current custom binding (may be null = use default). */
  currentShortcut: string | null;
  /** Map of `commandId → shortcut` for conflict detection. */
  allBindings: Record<string, string>;
  /** Receives the new shortcut (or null to clear). Caller persists. */
  onSave: (next: string | null) => void | Promise<void>;
}

export function CaptureShortcutDialog({
  open,
  onOpenChange,
  commandId,
  commandLabel,
  defaultShortcut,
  currentShortcut,
  allBindings,
  onSave,
}: Props): React.ReactElement {
  const [captured, setCaptured] = useState<string | null>(currentShortcut);
  const [conflict, setConflict] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset on open so the doctor never sees stale state from a previous session.
  useEffect(() => {
    if (open) {
      setCaptured(currentShortcut);
      setConflict(null);
      setSaving(false);
    }
  }, [open, currentShortcut]);

  // Capture loop — only active while the modal is open.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      // Don't intercept the close-modal Escape — Radix handles it.
      if (event.key === 'Escape') return;
      const parsed = shortcutFromEvent(event);
      if (!parsed) return;
      event.preventDefault();
      event.stopPropagation();
      setCaptured(parsed);
      const conflictId = findShortcutConflict(parsed, allBindings, commandId);
      setConflict(conflictId);
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, allBindings, commandId]);

  async function handleSave() {
    setSaving(true);
    try {
      // Saving the same value as before is a no-op for the doctor; for the
      // backend it's still a write but cheap. We don't short-circuit so the
      // updated_at refresh still tracks intent.
      await onSave(captured);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      await onSave(null);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar atajo</DialogTitle>
          <DialogDescription>
            Presioná la combinación de teclas que querés asignar a
            <span className="font-medium text-foreground"> {commandLabel}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 py-8">
            <Keyboard
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            {captured ? (
              <div className="flex items-center gap-1.5">
                {shortcutGlyphs(captured).map((token, idx) => (
                  <kbd
                    key={`${token}-${idx}`}
                    className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border border-border bg-background px-2 font-mono text-sm font-semibold text-foreground shadow-sm"
                  >
                    {token}
                  </kbd>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Esperando combinación…
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Necesita al menos un modificador (⌘ / ⌃ / ⌥ / ⇧) + una tecla.
            </p>
          </div>

          {conflict && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              <AlertCircle
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>
                Esta combinación ya está en uso por otro comando. Si guardás,
                el otro comando se queda sin atajo asignado.
              </span>
            </div>
          )}

          {defaultShortcut && captured !== defaultShortcut && (
            <p className="text-[11px] text-muted-foreground">
              Atajo predeterminado:
              <span className="ml-1 inline-flex items-center gap-1">
                {shortcutGlyphs(defaultShortcut).map((g, i) => (
                  <kbd
                    key={`${g}-${i}`}
                    className="rounded border border-border bg-muted px-1 font-mono text-[10px]"
                  >
                    {g}
                  </kbd>
                ))}
              </span>
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {currentShortcut && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleClear()}
              disabled={saving}
              className="mr-auto"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Quitar atajo
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !captured}
          >
            {saving ? 'Guardando...' : 'Guardar atajo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
