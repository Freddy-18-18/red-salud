'use client';

import { useState, type FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@red-salud/design-system';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { CustomCommand, PaletteConfig } from '@/lib/palette/types';

/**
 * @file custom-commands-section.tsx
 * @description Doctor-defined "commands" that just open an external URL.
 *
 * Useful for Venezuelan workflows: SACS oficial, vademecum, su Gmail,
 * Google Drive con templates, etc. Each one becomes a Cmd+K row labelled
 * with the doctor's chosen name and an external-link icon.
 *
 * Phase 2 — no schema changes; persists into `config.customCommands[]`.
 * Phase 3 could let the doctor assign a hotkey here too.
 */

interface Props {
  config: PaletteConfig;
  onChange: (next: PaletteConfig) => Promise<void>;
  saving: boolean;
}

const ID_PREFIX = 'custom-';
const MAX_COMMANDS = 12;

function generateCustomId(): string {
  return `${ID_PREFIX}${Math.random().toString(36).slice(2, 10)}`;
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function CustomCommandsSection({
  config,
  onChange,
  saving,
}: Props): React.ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const customs = config.customCommands;
  const reachedLimit = customs.length >= MAX_COMMANDS;

  function openCreate() {
    setDraftLabel('');
    setDraftUrl('');
    setDraftId(null);
    setDialogOpen(true);
  }

  function openEdit(cmd: CustomCommand) {
    setDraftLabel(cmd.label);
    setDraftUrl(cmd.url);
    setDraftId(cmd.id);
    setDialogOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const label = draftLabel.trim();
    const url = draftUrl.trim();
    if (!label) {
      toast.error('Ponele un nombre al comando');
      return;
    }
    if (!isValidUrl(url)) {
      toast.error('La URL debe empezar con http:// o https://');
      return;
    }
    setSubmitting(true);
    try {
      const isEditing = draftId !== null;
      const next: CustomCommand = {
        id: draftId ?? generateCustomId(),
        label,
        url,
      };
      const updatedList = isEditing
        ? customs.map((c) => (c.id === draftId ? next : c))
        : [...customs, next];
      await onChange({ ...config, customCommands: updatedList });
      toast.success(isEditing ? 'Comando actualizado' : 'Comando creado');
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCommand(id: string) {
    try {
      await onChange({
        ...config,
        customCommands: customs.filter((c) => c.id !== id),
      });
      toast.success('Comando eliminado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  return (
    <section className="rounded-xl border border-border bg-background p-5">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Comandos personalizados</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Atajos a URLs externas que usás seguido — SACS oficial, vademecum,
            Drive con plantillas, etc.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openCreate}
          disabled={saving || reachedLimit}
          title={reachedLimit ? `Máximo ${MAX_COMMANDS} comandos` : undefined}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Nuevo
        </Button>
      </header>

      {customs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          Aún no creaste ningún comando personalizado.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-lg border border-border">
          {customs.map((cmd) => (
            <li
              key={cmd.id}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/30"
            >
              <ExternalLink
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{cmd.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {cmd.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(cmd)}
                disabled={saving}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => void removeCommand(cmd.id)}
                disabled={saving}
                aria-label={`Eliminar ${cmd.label}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {draftId ? 'Editar comando personalizado' : 'Nuevo comando personalizado'}
            </DialogTitle>
            <DialogDescription>
              Va a aparecer en el buscador con su nombre + ícono de enlace externo.
              Se abre en una pestaña nueva al ejecutarlo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-label">Nombre</Label>
              <Input
                id="custom-label"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="Ej. SACS Verificación"
                autoFocus
                maxLength={80}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-url">URL</Label>
              <Input
                id="custom-url"
                type="url"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                placeholder="https://sacs.gob.ve"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Sólo URLs públicas que empiecen con http:// o https://.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : draftId ? 'Guardar cambios' : 'Crear comando'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
