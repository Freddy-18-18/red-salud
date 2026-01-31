import { useState, useEffect } from "react";

interface UseAutocompleteProps {
  notasMedicas: string;
}

export function useAutocomplete({ notasMedicas }: UseAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

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

  useEffect(() => {
    const lines = notasMedicas.split('\n');
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
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, [notasMedicas]);

  return {
    suggestions,
  };
}
