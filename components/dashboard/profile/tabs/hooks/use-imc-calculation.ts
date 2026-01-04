import { useState, useEffect } from "react";

type ImcCategory = "Bajo peso" | "Normal" | "Sobrepeso" | "Obesidad" | "";

interface UseImcCalculationResult {
  imc: number | null;
  imcCategoria: ImcCategory;
}

/**
 * Hook para calcular el IMC basado en peso y altura
 * Peso en kg, altura en cm
 */
export function useImcCalculation(
  peso: string | undefined,
  altura: string | undefined
): UseImcCalculationResult {
  const [imc, setImc] = useState<number | null>(null);
  const [imcCategoria, setImcCategoria] = useState<ImcCategory>("");

  useEffect(() => {
    if (!peso || !altura) {
      setImc(null);
      setImcCategoria("");
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura) / 100;

    if (pesoNum > 0 && alturaNum > 0) {
      const imcCalculado = pesoNum / (alturaNum * alturaNum);
      setImc(imcCalculado);

      if (imcCalculado < 18.5) {
        setImcCategoria("Bajo peso");
      } else if (imcCalculado < 25) {
        setImcCategoria("Normal");
      } else if (imcCalculado < 30) {
        setImcCategoria("Sobrepeso");
      } else {
        setImcCategoria("Obesidad");
      }
    }
  }, [peso, altura]);

  return { imc, imcCategoria };
}
