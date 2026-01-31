import { useState } from "react";

interface AIAnalysis {
  resumen: string;
  recomendaciones: string[];
  alertas: string[];
  diagnosticosSugeridos: string[];
}

interface UseAIAnalysisProps {
  notasMedicas: string;
  paciente: {
    edad: number | null;
    genero: string;
  };
  alergias: string[];
  condicionesCronicas: string[];
  medicamentosActuales: string[];
  diagnosticos: string[];
  setDiagnosticos: (value: string[]) => void;
}

export function useAIAnalysis({
  notasMedicas,
  paciente,
  alergias,
  condicionesCronicas,
  medicamentosActuales,
  diagnosticos,
  setDiagnosticos,
}: UseAIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleAnalyzeWithAI = async () => {
    if (!notasMedicas.trim()) {
      alert("Por favor escribe información médica primero");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/gemini/analyze-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nota: notasMedicas,
          paciente: {
            edad: paciente.edad,
            genero: paciente.genero,
            alergias,
            condicionesCronicas,
            medicamentosActuales,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAiAnalysis(data.data);
        setShowRecommendations(true);
        
        if (data.data.diagnosticosSugeridos && data.data.diagnosticosSugeridos.length > 0) {
          const nuevosDiagnosticos = data.data.diagnosticosSugeridos.filter(
            (d: string) => !diagnosticos.includes(d)
          );
          if (nuevosDiagnosticos.length > 0) {
            setDiagnosticos([...diagnosticos, ...nuevosDiagnosticos]);
          }
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error analyzing note:", error);
      alert(`Error al analizar: ${error instanceof Error ? error.message : "Intenta de nuevo"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    aiAnalysis,
    showRecommendations,
    setShowRecommendations,
    handleAnalyzeWithAI,
  };
}
