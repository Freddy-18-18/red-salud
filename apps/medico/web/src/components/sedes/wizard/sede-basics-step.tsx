'use client';

import {
  Input,
  Label,
  Switch,
  Textarea,
} from '@red-salud/design-system';
import { Building2, Phone, StickyNote } from 'lucide-react';

import type { SedeWizardDraft } from '../sede-wizard-types';

/**
 * @file sede-basics-step.tsx
 * @description Step 1 of the sede wizard: identity + contact.
 *
 * Required: name. Everything else is optional — many doctors don't list a
 * phone separate from their personal number, and a brand-new sede often has
 * no internal notes yet.
 */

interface Props {
  draft: SedeWizardDraft;
  onPatch: (patch: Partial<SedeWizardDraft>) => void;
  /** True when this is the doctor's first sede — primary flag is forced on. */
  isFirstSede: boolean;
}

export function SedeBasicsStep({ draft, onPatch, isFirstSede }: Props): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="sede-name" className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-foreground-lighter" aria-hidden="true" />
          Nombre de la sede
          <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id="sede-name"
          value={draft.name}
          onChange={(e) => onPatch({ name: e.target.value })}
          placeholder="Ej. Consultorio Las Mercedes"
          autoFocus
          maxLength={120}
          required
        />
        <p className="text-xs text-muted-foreground">
          El nombre que verás en el header y que aparece a tus pacientes.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sede-phone" className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-foreground-lighter" aria-hidden="true" />
          Teléfono de contacto
        </Label>
        <Input
          id="sede-phone"
          type="tel"
          value={draft.phone}
          onChange={(e) => onPatch({ phone: e.target.value })}
          placeholder="+58 212-555-1234"
          maxLength={32}
        />
        <p className="text-xs text-muted-foreground">
          Opcional. Si lo dejás vacío, se usa el teléfono de tu perfil.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sede-notes" className="flex items-center gap-1.5">
          <StickyNote className="h-3.5 w-3.5 text-foreground-lighter" aria-hidden="true" />
          Notas internas
        </Label>
        <Textarea
          id="sede-notes"
          value={draft.notes}
          onChange={(e) => onPatch({ notes: e.target.value })}
          placeholder="Recordatorios, indicaciones para tu equipo..."
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          Solo vos las ves — útil para apuntes como “Recibir efectivo solo
          martes y jueves”.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-muted/40 px-4 py-3">
        <div>
          <Label htmlFor="sede-primary" className="text-sm font-medium">
            Marcar como sede principal
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            La sede principal se selecciona por defecto al iniciar sesión.
            {isFirstSede && ' Tu primera sede se marca automáticamente como principal.'}
          </p>
        </div>
        <Switch
          id="sede-primary"
          checked={isFirstSede || draft.isPrimary}
          disabled={isFirstSede}
          onCheckedChange={(checked) => onPatch({ isPrimary: checked })}
        />
      </div>
    </div>
  );
}
