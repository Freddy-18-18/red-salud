"use client";

import { Sparkles, Loader2 } from "lucide-react";

interface AutocompleteSuggestionsProps {
  suggestions: string[];
  selectedIndex: number;
  isLoading: boolean;
  onSelect: (suggestion: string) => void;
  position: { top: number; left: number };
}

export function AutocompleteSuggestions({
  suggestions,
  selectedIndex,
  isLoading,
  onSelect,
  position,
}: AutocompleteSuggestionsProps) {
  if (!isLoading && suggestions.length === 0) return null;

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded shadow-lg overflow-hidden z-20"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '350px',
        maxWidth: '500px',
      }}
    >
      {isLoading ? (
        <div className="px-3 py-4 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          <span>Generando sugerencias con IA...</span>
        </div>
      ) : (
        <>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => onSelect(suggestion)}
              className={`px-3 py-2 text-sm font-mono cursor-pointer flex items-center gap-2 ${
                index === selectedIndex
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Sparkles className={`h-3 w-3 flex-shrink-0 ${
                index === selectedIndex ? 'text-white' : 'text-blue-600'
              }`} />
              <span className="flex-1">{suggestion}</span>
              {index === selectedIndex && (
                <kbd className="px-1.5 py-0.5 bg-white/20 border border-white/30 rounded text-xs">Tab</kbd>
              )}
            </div>
          ))}
          <div className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border-t flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">↑↓</kbd>
            <span>navegar</span>
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Tab</kbd>
            <span>aplicar</span>
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Esc</kbd>
            <span>cerrar</span>
          </div>
        </>
      )}
    </div>
  );
}
