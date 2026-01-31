"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import { Textarea } from "./textarea";
import { cn } from "./lib/utils";

interface AutocompleteTextareaProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  required?: boolean;
  rows?: number;
  id?: string;
  className?: string;
  containerClassName?: string;
  mode?: "comma" | "line";
}

export function AutocompleteTextarea({
  value,
  onChange,
  suggestions,
  placeholder,
  required,
  rows = 3,
  id,
  className,
  containerClassName,
  mode = "comma",
}: AutocompleteTextareaProps) {
  // Ref para manejar la selección del cursor después de renderizar
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const lastValueRef = useRef(value);

  // Aplicar la selección del cursor después de que React actualice el DOM
  useEffect(() => {
    if (cursorSelectionRef.current && textareaRef.current) {
      textareaRef.current.setSelectionRange(
        cursorSelectionRef.current.start,
        cursorSelectionRef.current.end
      );
      cursorSelectionRef.current = null;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart;

    // Detectar si el usuario está borrando (backspace/delete) o pegando texto largo
    // Solo autocompletamos si está escribiendo caracteres uno a uno al final
    const isAddingText = newValue.length > lastValueRef.current.length;
    const isSingleChar = newValue.length - lastValueRef.current.length === 1;

    // Actualizamos la referencia del último valor
    lastValueRef.current = newValue;

    if (!isAddingText || !isSingleChar) {
      onChange(newValue);
      return;
    }

    // Lógica de autocompletado inline
    // 1. Obtener el término actual (después de la última coma)
    const textBeforeCursor = newValue.substring(0, newCursorPos);
    let currentTermStart = 0;
    let currentTerm = "";
    if (mode === "comma") {
      const lastCommaIndex = textBeforeCursor.lastIndexOf(",");
      currentTermStart = lastCommaIndex + 1;
      currentTerm = textBeforeCursor.substring(currentTermStart);
    } else {
      const lastBreakIndex = Math.max(textBeforeCursor.lastIndexOf("\n"), textBeforeCursor.lastIndexOf("\r"));
      const lineStart = lastBreakIndex + 1;
      const lineText = textBeforeCursor.substring(lineStart);
      const lastSpaceIndex = Math.max(lineText.lastIndexOf(" "), lineText.lastIndexOf("\t"));
      currentTermStart = lineStart + lastSpaceIndex + 1;
      currentTerm = textBeforeCursor.substring(currentTermStart);
    }

    // Solo sugerir si hay al menos 2 caracteres y no empieza con espacio (salvo el espacio post-coma)
    const trimmedTerm = currentTerm.trimStart();
    if (trimmedTerm.length < 2) {
      onChange(newValue);
      return;
    }

    // 2. Buscar coincidencia (case insensitive)
    const match = suggestions.find(s =>
      s.toLowerCase().startsWith(trimmedTerm.toLowerCase())
    );

    if (match) {
      // 3. Construir el nuevo valor con la sugerencia completada
      // Respetar el casing original del usuario para la parte ya escrita, usar el de la sugerencia para el resto
      const completion = match.substring(trimmedTerm.length);

      const textAfterCursor = newValue.substring(newCursorPos);

      // Reconstruir: Todo antes del término + término escrito + completación + resto
      const prefix = newValue.substring(0, currentTermStart + (currentTerm.length - trimmedTerm.length));
      const termWritten = trimmedTerm;

      const suggestionValue = prefix + termWritten + completion + textAfterCursor;

      // 4. Calcular selección: queremos seleccionar SOLO la parte sugerida (completion)
      const selectionStart = newCursorPos;
      const selectionEnd = selectionStart + completion.length;

      // Guardar selección para aplicar en useEffect
      cursorSelectionRef.current = { start: selectionStart, end: selectionEnd };

      onChange(suggestionValue);
    } else {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Permitir navegar o aceptar la selección con teclas comunes
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;

      // Si hay texto seleccionado (nuestra sugerencia inline)
      if (selectionStart !== selectionEnd) {
        if (e.key === "Tab" || e.key === "Enter" || e.key === "ArrowRight") {
          e.preventDefault();
          // Mover cursor al final de la selección (aceptar sugerencia)
          textareaRef.current.setSelectionRange(selectionEnd, selectionEnd);

          // Si fue Tab o Enter, agregar una coma y espacio para el siguiente término
          if (mode === "comma" && (e.key === "Tab" || e.key === "Enter")) {
            const val = textareaRef.current.value;
            const newVal = val.substring(0, selectionEnd) + ", " + val.substring(selectionEnd);
            onChange(newVal);
            // Ajustar cursor después de la coma
            cursorSelectionRef.current = { start: selectionEnd + 2, end: selectionEnd + 2 };
          }
        }
      }
    }
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={cn("resize-none", className)}
      />
    </div>
  );
}
