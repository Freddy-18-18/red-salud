import { useMemo } from "react";

const MEDICAL_PHRASES = [
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

interface UseAutocompleteProps {
  notasMedicas: string;
}

export function useAutocomplete({ notasMedicas }: UseAutocompleteProps) {
  const suggestions = useMemo(() => {
    const lines = notasMedicas.split('\n');
    const currentLine = lines[lines.length - 1] || '';
    
    const words = currentLine.split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    if (lastWord.length > 1) {
      const filtered = MEDICAL_PHRASES.filter((p) =>
        p.toLowerCase().startsWith(lastWord.toLowerCase()) && 
        p.toLowerCase() !== lastWord.toLowerCase()
      );
      
      return filtered.length > 0 ? filtered.slice(0, 8) : [];
    }
    return [];
  }, [notasMedicas]);

  return {
    suggestions,
  };
}
