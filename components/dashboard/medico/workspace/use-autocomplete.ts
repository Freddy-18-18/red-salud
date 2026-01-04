import { useState, useEffect, useRef } from "react";

interface UseAutocompleteProps {
  notasMedicas: string;
  paciente: {
    edad: number | null;
    genero: string;
  };
}

export function useAutocomplete({ notasMedicas, paciente }: UseAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isLoadingAISuggestions, setIsLoadingAISuggestions] = useState(false);
  const notasTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const medicalPhrases = [
    "MOTIVO DE CONSULTA:",
    "HISTORIA DE LA ENFERMEDAD ACTUAL:",
    "ANTECEDENTES PERSONALES:",
    "ANTECEDENTES FAMILIARES:",
    "EXAMEN FÍSICO:",
    "SIGNOS VITALES:",
    "IMPRESIÓN DIAGNÓSTICA:",
    "PLAN DE TRATAMIENTO:",
    "INDICACIONES:",
    "RECOMENDACIONES:",
    "CONTROL:",
    "EVOLUCIÓN:",
    "LABORATORIOS:",
    "IMÁGENES:",
    "Estado General:",
    "Cabeza y Cuello:",
    "Tórax:",
    "Abdomen:",
    "Extremidades:",
    "Neurológico:",
    "Piel y Faneras:",
    "PA: [___] mmHg",
    "FC: [___] lpm",
    "FR: [___] rpm",
    "Temp: [___] °C",
    "Sat O2: [___] %",
    "Peso: [___] kg",
    "Talla: [___] cm",
    "IMC: [___]",
    "Paciente refiere",
    "Paciente niega",
    "Al examen físico se evidencia",
    "Se indica",
    "Se prescribe",
    "Control en",
    "Signos de alarma:",
    "Dieta:",
    "Reposo:",
    "consciente",
    "orientado",
    "hidratado",
    "afebril",
    "normotenso",
    "taquicárdico",
    "bradicárdico",
    "eupneico",
    "taquipneico",
  ];

  const loadAISuggestions = async (currentLine: string, context: string) => {
    setIsLoadingAISuggestions(true);
    try {
      const response = await fetch("/api/gemini/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          currentLine,
          paciente: {
            edad: paciente.edad,
            genero: paciente.genero,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.data.suggestions.length > 0) {
        setSuggestions(data.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error loading AI suggestions:", error);
    } finally {
      setIsLoadingAISuggestions(false);
    }
  };

  useEffect(() => {
    const cursorPosition = notasTextareaRef.current?.selectionStart || 0;
    const textBeforeCursor = notasMedicas.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1] || '';
    
    const words = currentLine.split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    if (lastWord.length > 1) {
      const filtered = medicalPhrases.filter((p) =>
        p.toLowerCase().startsWith(lastWord.toLowerCase()) && 
        p.toLowerCase() !== lastWord.toLowerCase()
      );
      
      if (filtered.length > 0) {
        setSuggestions(filtered.slice(0, 8));
        setShowSuggestions(true);
      } else if (currentLine.length > 10 && !isLoadingAISuggestions) {
        loadAISuggestions(currentLine, lines.slice(-5).join('\n'));
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [notasMedicas]);

  const handleApplySuggestion = (suggestion: string, setNotasMedicas: (value: string) => void) => {
    const cursorPosition = notasTextareaRef.current?.selectionStart || notasMedicas.length;
    const textBefore = notasMedicas.substring(0, cursorPosition);
    const textAfter = notasMedicas.substring(cursorPosition);
    
    const lines = textBefore.split('\n');
    const currentLine = lines[lines.length - 1] || '';
    const words = currentLine.split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    const lineWithoutLastWord = currentLine.substring(0, currentLine.length - lastWord.length);
    lines[lines.length - 1] = lineWithoutLastWord + suggestion;
    
    const newText = lines.join('\n') + textAfter;
    setNotasMedicas(newText);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(0);
    
    setTimeout(() => {
      const newPosition = lines.join('\n').length;
      notasTextareaRef.current?.focus();
      notasTextareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, setNotasMedicas: (value: string) => void) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleApplySuggestion(suggestions[selectedSuggestionIndex], setNotasMedicas);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(0);
      }
    }
  };

  return {
    suggestions,
    showSuggestions,
    selectedSuggestionIndex,
    isLoadingAISuggestions,
    notasTextareaRef,
    handleApplySuggestion,
    handleKeyDown,
  };
}
