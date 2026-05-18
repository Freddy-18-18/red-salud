'use client';

import { useMemo } from 'react';
import { Label } from '@red-salud/design-system';
import { InlineAutocompleteInput } from './inline-autocomplete-input';
import { mergePreparationSuggestions } from './preparation-catalog';

interface PreparationChipsProps {
  /** String separado por comas. Ej: "Ayuno 8h, Estudios previos, Carnet del seguro". */
  value: string;
  onChange: (next: string) => void;
  /**
   * Preparaciones frecuentes del doctor (de su historial via hook
   * `useFrequentPreparations`). Se combinan internamente con el catálogo
   * predefinido (~800 items) para que el autocomplete funcione desde el
   * día 1 aunque el doctor no tenga historial.
   *
   * Frecuentes del doctor van PRIMERO (mayor relevancia) que el catálogo.
   */
  suggestions?: ReadonlyArray<string>;
}

/**
 * Input multi-segmento para preparaciones / qué traer.
 *
 * El doctor escribe libre. Al tipear, el autocompletado inline sugiere
 * preparaciones del historial (Tab acepta). Después de una coma, el ghost
 * text se reactiva para sugerir la próxima preparación.
 *
 * Ejemplo de input típico:
 *   "Ayuno 12h, Estudios previos, Carnet del seguro"
 *
 * Al guardar la cita, el padre parsea este string en text[] para la BD.
 */
export function PreparationChips({
  value,
  onChange,
  suggestions = [],
}: PreparationChipsProps) {
  // Merge: frecuentes del doctor (prioridad) + catálogo predefinido (~800).
  // Esto garantiza que el autocomplete funcione desde el día 1.
  const allSuggestions = useMemo(
    () => mergePreparationSuggestions(suggestions),
    [suggestions],
  );

  // Cuenta visual de items separados por coma (ignora vacíos)
  const count = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Preparación / qué traer (opcional)</Label>
        {count > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {count} item{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <InlineAutocompleteInput
        value={value}
        onChange={onChange}
        suggestions={allSuggestions}
        placeholder="Ej: Ayuno 12h, Estudios previos…  (separar con comas)"
        multiSegment
        className="w-full"
      />
    </div>
  );
}
