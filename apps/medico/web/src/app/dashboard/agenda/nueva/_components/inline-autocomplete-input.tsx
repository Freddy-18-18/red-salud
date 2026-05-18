'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';

interface InlineAutocompleteInputProps {
  value: string;
  onChange: (next: string) => void;
  /** Sugerencias contra las que se hace prefix matching (case-insensitive). */
  suggestions: ReadonlyArray<string>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Si true, acepta sugerencia con `Enter` además de `Tab`/`→`. */
  acceptOnEnter?: boolean;
  /** ID del input para labels. */
  id?: string;
  /**
   * Si true, el input soporta MÚLTIPLES segmentos separados por comas.
   * El autocomplete se aplica solo al último segmento (después de la
   * última coma). Al aceptar, el cursor queda al final, listo para
   * escribir ", " + próximo segmento. Útil para listas de tags inline.
   */
  multiSegment?: boolean;
}

/**
 * Devuelve el último segmento del value (texto después de la última coma).
 * Si no hay coma, el segmento es todo el value. Trim del whitespace inicial.
 */
function getLastSegment(value: string): { segment: string; prefix: string } {
  const lastComma = value.lastIndexOf(',');
  if (lastComma === -1) return { segment: value, prefix: '' };
  return {
    segment: value.slice(lastComma + 1).trimStart(),
    prefix: value.slice(0, lastComma + 1),
  };
}

/**
 * Input text con autocompletado INLINE (ghost text).
 *
 * Modos:
 *   - Default (`multiSegment=false`): el value completo es la unidad de match.
 *   - `multiSegment=true`: trata el value como lista separada por comas; el
 *     autocomplete aplica solo al último segmento (después de la última `,`).
 *
 * Aceptar (Tab o → al final): completa el segmento activo con la sugerencia.
 */
export const InlineAutocompleteInput = forwardRef<
  HTMLInputElement,
  InlineAutocompleteInputProps
>(function InlineAutocompleteInput(
  {
    value,
    onChange,
    suggestions,
    placeholder,
    disabled = false,
    className = '',
    acceptOnEnter = false,
    id,
    multiSegment = false,
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  /** Segmento activo donde se busca el match. */
  const activeSegment = useMemo(
    () => (multiSegment ? getLastSegment(value).segment : value),
    [value, multiSegment],
  );

  /** Tail de la sugerencia (lo que sigue al segmento activo). */
  const ghostTail = useMemo(() => {
    if (!activeSegment) return '';
    const lower = activeSegment.toLowerCase();
    const match = suggestions.find(
      (s) => s.toLowerCase().startsWith(lower) && s.toLowerCase() !== lower,
    );
    if (!match) return '';
    return match.slice(activeSegment.length);
  }, [activeSegment, suggestions]);

  const acceptSuggestion = useCallback(() => {
    if (!ghostTail) return;
    let next: string;
    if (multiSegment) {
      const { prefix } = getLastSegment(value);
      // Si el prefix ya tiene espacio después de la coma, no agregar otro
      const sep = prefix.length > 0 && !prefix.endsWith(' ') ? ' ' : '';
      next = prefix + sep + activeSegment + ghostTail;
    } else {
      next = value + ghostTail;
    }
    onChange(next);
    requestAnimationFrame(() => {
      const el = innerRef.current;
      if (el) el.setSelectionRange(next.length, next.length);
    });
  }, [ghostTail, value, activeSegment, multiSegment, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!ghostTail) return;

      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        acceptSuggestion();
        return;
      }

      if (e.key === 'ArrowRight') {
        const el = e.currentTarget;
        if (el.selectionStart === value.length && el.selectionEnd === value.length) {
          e.preventDefault();
          acceptSuggestion();
        }
        return;
      }

      if (acceptOnEnter && e.key === 'Enter') {
        e.preventDefault();
        acceptSuggestion();
      }
    },
    [ghostTail, value, acceptSuggestion, acceptOnEnter],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  // Mismas clases de tipografía/padding/borde en input y ghost layer.
  const sharedTypoClass =
    'h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-xs leading-[1.5] dark:bg-input/30';

  return (
    <div className={`relative ${className}`}>
      {/* Ghost layer: value completo invisible + ghostTail en gris.
          Esto mantiene el alignment correcto sin importar dónde está
          el segmento activo dentro del value. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 whitespace-pre overflow-hidden text-foreground/0 ${sharedTypoClass}`}
        style={{ borderColor: 'transparent', background: 'transparent' }}
      >
        <span>{value}</span>
        {ghostTail && (
          <span className="text-muted-foreground/50">{ghostTail}</span>
        )}
      </div>

      <input
        ref={innerRef}
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        className={`relative bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${sharedTypoClass}`}
      />

      {ghostTail && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border/60 bg-muted/60 px-1 text-[9px] font-medium leading-none text-muted-foreground"
        >
          Tab ↹
        </span>
      )}
    </div>
  );
});
