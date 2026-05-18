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

interface InlineAutocompleteTextareaProps {
  value: string;
  onChange: (next: string) => void;
  /** Sugerencias contra las que se hace prefix matching (case-insensitive). */
  suggestions: ReadonlyArray<string>;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  id?: string;
  /**
   * Si true, el textarea soporta MÚLTIPLES segmentos separados por comas.
   * Autocomplete aplica solo al último segmento. Después de aceptar +
   * escribir ", " el ghost se reactiva con el próximo segmento.
   */
  multiSegment?: boolean;
}

/** Último segmento del value (texto después de la última coma). */
function getLastSegment(value: string): { segment: string; prefix: string } {
  const lastComma = value.lastIndexOf(',');
  if (lastComma === -1) return { segment: value, prefix: '' };
  return {
    segment: value.slice(lastComma + 1).trimStart(),
    prefix: value.slice(0, lastComma + 1),
  };
}

/**
 * Textarea con autocompletado INLINE (ghost text).
 *
 * Modos:
 *   - Default: el value completo es la unidad de match.
 *   - `multiSegment=true`: el value es una lista separada por comas; el
 *     autocomplete solo aplica al último segmento.
 *
 * Tab o → al final → acepta el ghostTail completando el segmento activo.
 */
export const InlineAutocompleteTextarea = forwardRef<
  HTMLTextAreaElement,
  InlineAutocompleteTextareaProps
>(function InlineAutocompleteTextarea(
  {
    value,
    onChange,
    suggestions,
    placeholder,
    disabled = false,
    rows = 3,
    className = '',
    id,
    multiSegment = false,
  },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const activeSegment = useMemo(
    () => (multiSegment ? getLastSegment(value).segment : value),
    [value, multiSegment],
  );

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
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
      }
    },
    [ghostTail, value, acceptSuggestion],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const sharedTypo =
    'block w-full rounded-md border bg-transparent px-3 py-2 text-sm leading-[1.5]';

  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 whitespace-pre-wrap break-words text-foreground/0 ${sharedTypo}`}
        style={{ borderColor: 'transparent' }}
      >
        <span>{value}</span>
        {ghostTail && (
          <span className="text-muted-foreground/50">{ghostTail}</span>
        )}
      </div>

      <textarea
        ref={innerRef}
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        autoComplete="off"
        spellCheck={false}
        className={`relative resize-none border-input text-foreground placeholder:text-muted-foreground/60 outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 ${sharedTypo}`}
      />

      {ghostTail && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-2 rounded border border-border/60 bg-muted/80 px-1 text-[9px] font-medium leading-none text-muted-foreground"
        >
          Tab ↹
        </span>
      )}
    </div>
  );
});
