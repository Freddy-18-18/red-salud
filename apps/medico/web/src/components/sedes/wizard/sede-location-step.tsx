'use client';

import dynamic from 'next/dynamic';
import { Input, Label, Textarea } from '@red-salud/design-system';
import { MapPin, Loader2 } from 'lucide-react';

import type { SedeWizardDraft } from '../sede-wizard-types';

/**
 * @file sede-location-step.tsx
 * @description Step 2 of the sede wizard: address + map pin.
 *
 * The map picker (`MapPicker`) is client-only because Leaflet touches
 * `window` at import time. We pull it through `next/dynamic` with
 * `ssr: false` so the server bundle never tries to render it.
 *
 * Validation rule (enforced by the orchestrator): coordinates are required
 * before the doctor advances past this step. The address text is optional —
 * a doctor can drop a pin on a corner without a precise street number.
 */

const MapPicker = dynamic(
  () => import('../map-picker').then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Cargando el mapa...
      </div>
    ),
  },
);

interface Props {
  draft: SedeWizardDraft;
  onPatch: (patch: Partial<SedeWizardDraft>) => void;
}

export function SedeLocationStep({ draft, onPatch }: Props): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="sede-address" className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-foreground-lighter" aria-hidden="true" />
          Dirección
        </Label>
        <Input
          id="sede-address"
          value={draft.address}
          onChange={(e) => onPatch({ address: e.target.value })}
          placeholder="Av. Andrés Bello, Torre Médica, Piso 4"
          maxLength={250}
        />
        <p className="text-xs text-muted-foreground">
          Aparece en el perfil público y en las indicaciones para los pacientes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="sede-city">Ciudad</Label>
          <Input
            id="sede-city"
            value={draft.city}
            onChange={(e) => onPatch({ city: e.target.value })}
            placeholder="Caracas"
            maxLength={120}
          />
        </div>
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="sede-state">Estado</Label>
          <Input
            id="sede-state"
            value={draft.state}
            onChange={(e) => onPatch({ state: e.target.value })}
            placeholder="Distrito Capital"
            maxLength={120}
          />
        </div>
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="sede-postal">Código postal</Label>
          <Input
            id="sede-postal"
            value={draft.postalCode}
            onChange={(e) => onPatch({ postalCode: e.target.value })}
            placeholder="1060"
            maxLength={20}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-foreground-lighter" aria-hidden="true" />
          Ubicación en el mapa
          <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <MapPicker
          value={draft.coordinates}
          onChange={(value) => {
            onPatch({
              coordinates: { lat: value.lat, lng: value.lng },
              // Promote the search-result address into the form when the doctor
              // picks from the Nominatim suggestions, but never overwrite an
              // existing manual address.
              address:
                draft.address || (value.address ?? draft.address),
            });
          }}
          initialQuery={draft.address}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sede-arrival">Indicaciones de llegada</Label>
        <Textarea
          id="sede-arrival"
          value={draft.arrivalInstructions}
          onChange={(e) => onPatch({ arrivalInstructions: e.target.value })}
          placeholder="Subí por el ascensor B hasta el piso 4. La recepción está a la derecha."
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          Lo que querés que tus pacientes sepan al llegar. Mostrarse en la
          confirmación de cita.
        </p>
      </div>
    </div>
  );
}
