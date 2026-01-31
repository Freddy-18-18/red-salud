"use client";

import { AutocompleteTextarea } from "@red-salud/ui";

interface FreeNotesEditorProps {
  notasMedicas: string;
  setNotasMedicas: (value: string) => void;
  autocomplete: {
    suggestions: string[];
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
        <AutocompleteTextarea
          value={notasMedicas}
          onChange={setNotasMedicas}
          suggestions={autocomplete.suggestions}
          placeholder="Escribe aquí la nota médica...&#10;&#10;Usa Tab para autocompletar&#10;&#10;Comienza escribiendo: MOTIVO, HISTORIA, EXAMEN..."
          mode="line"
          containerClassName="absolute inset-0"
          className="h-full w-full px-6 py-6 border-0 shadow-none bg-transparent font-sans text-base leading-relaxed focus-visible:ring-0 focus-visible:border-0"
        />
      </div>

      <div className="flex-shrink-0 px-6 py-2 bg-gray-50 border-t flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {notasMedicas.length} caracteres • {notasMedicas.split('\n').length} líneas
        </p>
        <span className="text-xs text-gray-500">Tab para autocompletar</span>
      </div>
    </div>
  );
}
