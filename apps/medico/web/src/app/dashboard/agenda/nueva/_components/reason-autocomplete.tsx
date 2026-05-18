'use client';

import { useMemo } from 'react';
import { InlineAutocompleteTextarea } from './inline-autocomplete-textarea';
import { mergeReasonSuggestions } from './reason-catalog';

interface ReasonAutocompleteProps {
  value: string;
  onChange: (next: string) => void;
  /** Motivos frecuentes del doctor (de su historial). Combinados con catálogo. */
  suggestions: string[];
  loading?: boolean;
  id?: string;
  placeholder?: string;
}

/**
 * Textarea con autocompletado INLINE para el motivo de consulta.
 *
 * Combina:
 *   - Motivos frecuentes del doctor (de su historial) — máxima prioridad
 *   - Catálogo predefinido (motivos comunes en medicina general)
 *
 * Mientras el doctor escribe, el resto del motivo más probable se sugiere
 * en gris dentro del mismo textarea. Tab/→ acepta.
 *
 * No hay dropdown ni chips arriba — minimal y directo. Si el doctor quiere
 * algo que no matchea, escribe libremente sin friction.
 */
export function ReasonAutocomplete({
  value,
  onChange,
  suggestions,
  id = 'cita-motivo',
  placeholder = 'Describí brevemente el motivo (opcional). Empezá a escribir para sugerencias.',
}: ReasonAutocompleteProps) {
  const allSuggestions = useMemo(
    () => mergeReasonSuggestions(suggestions),
    [suggestions],
  );

  return (
    <InlineAutocompleteTextarea
      id={id}
      value={value}
      onChange={onChange}
      suggestions={allSuggestions}
      placeholder={placeholder}
      rows={3}
      multiSegment
    />
  );
}
