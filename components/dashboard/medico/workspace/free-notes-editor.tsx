"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { AutocompleteSuggestions } from "./autocomplete-suggestions";

interface FreeNotesEditorProps {
  notasMedicas: string;
  setNotasMedicas: (value: string) => void;
  autocomplete: {
    suggestions: string[];
    showSuggestions: boolean;
    selectedSuggestionIndex: number;
    isLoadingAISuggestions: boolean;
    notasTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
    handleApplySuggestion: (suggestion: string, setNotasMedicas: (value: string) => void) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, setNotasMedicas: (value: string) => void) => void;
  };
}

export function FreeNotesEditor({
  notasMedicas,
  setNotasMedicas,
  autocomplete,
}: FreeNotesEditorProps) {
  return (
    <div className="flex-1 flex flex-col border-r relative">
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={autocomplete.notasTextareaRef}
          value={notasMedicas}
          onChange={(e) => setNotasMedicas(e.target.value)}
          onKeyDown={(e) => autocomplete.handleKeyDown(e, setNotasMedicas)}
          placeholder="Escribe aquí la nota médica...&#10;&#10;Usa Tab o Enter para autocompletar&#10;&#10;Comienza escribiendo: MOTIVO, HISTORIA, EXAMEN..."
          className="absolute inset-0 w-full h-full px-6 border-0 font-mono text-sm resize-none focus:outline-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #e5e7eb 23px, #e5e7eb 24px)',
            backgroundPosition: '0 11px',
            lineHeight: '24px',
            paddingTop: '11px',
            paddingBottom: '11px',
          }}
        />

        {(autocomplete.showSuggestions || autocomplete.isLoadingAISuggestions) && (
          <AutocompleteSuggestions
            suggestions={autocomplete.suggestions}
            selectedIndex={autocomplete.selectedSuggestionIndex}
            isLoading={autocomplete.isLoadingAISuggestions}
            onSelect={(suggestion) => autocomplete.handleApplySuggestion(suggestion, setNotasMedicas)}
            position={{
              top: Math.min((notasMedicas.split('\n').length) * 24 + 11, 500),
              left: 24,
            }}
          />
        )}
      </div>

      <div className="flex-shrink-0 px-6 py-2 bg-gray-50 border-t flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {notasMedicas.length} caracteres • {notasMedicas.split('\n').length} líneas
        </p>
        <div className="flex items-center gap-2">
          {autocomplete.isLoadingAISuggestions && (
            <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              IA activa
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Autocompletado IA
          </Badge>
        </div>
      </div>
    </div>
  );
}
