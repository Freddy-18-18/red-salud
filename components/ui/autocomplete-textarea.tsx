"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AutocompleteTextareaProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  required?: boolean;
  rows?: number;
  id?: string;
  className?: string;
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
}: AutocompleteTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Obtener el texto actual que se está escribiendo (después de la última coma)
  const getCurrentTerm = () => {
    const cursorPosition = textareaRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastCommaIndex = textBeforeCursor.lastIndexOf(",");
    
    if (lastCommaIndex === -1) {
      return textBeforeCursor.trim();
    }
    
    return textBeforeCursor.substring(lastCommaIndex + 1).trim();
  };

  // Mostrar sugerencias cuando hay texto
  useEffect(() => {
    const currentTerm = getCurrentTerm();
    setShowSuggestions(suggestions.length > 0 && currentTerm.length >= 2);
    setSelectedIndex(0);
  }, [suggestions, value]);

  // Manejar teclas
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      
      case "Tab":
      case "Enter":
        if (showSuggestions && suggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Seleccionar sugerencia
  const selectSuggestion = (suggestion: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastCommaIndex = textBeforeCursor.lastIndexOf(",");
    
    let newValue: string;
    
    if (lastCommaIndex === -1) {
      // No hay comas, reemplazar todo el texto
      newValue = suggestion + textAfterCursor;
    } else {
      // Hay comas, reemplazar solo el término actual
      const beforeLastComma = textBeforeCursor.substring(0, lastCommaIndex + 1);
      newValue = beforeLastComma + " " + suggestion + textAfterCursor;
    }
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Posicionar el cursor después del texto insertado
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = lastCommaIndex === -1 
          ? suggestion.length 
          : lastCommaIndex + 2 + suggestion.length;
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Scroll automático en la lista de sugerencias
  useEffect(() => {
    if (suggestionsRef.current && showSuggestions) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex, showSuggestions]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={cn("resize-none", className)}
        onBlur={() => {
          // Delay para permitir click en sugerencias
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        onFocus={() => {
          if (suggestions.length > 0 && value.length >= 2) {
            setShowSuggestions(true);
          }
        }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-2 text-xs text-gray-500 border-b flex items-center justify-between">
            <span>💡 Usa ↑↓ para navegar, Tab/Enter para seleccionar</span>
            {value.includes(",") && (
              <span className="text-blue-600 font-medium">
                Múltiples motivos
              </span>
            )}
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                "hover:bg-blue-50 focus:bg-blue-50 focus:outline-none",
                index === selectedIndex && "bg-blue-100 text-blue-900 font-medium"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
