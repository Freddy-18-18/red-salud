import { useMemo } from "react";

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
  return useMemo(() => {
    if (!peso || !altura) {
      return { imc: null, imcCategoria: "" };
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura) / 100;

    if (pesoNum > 0 && alturaNum > 0) {
      const imcCalculado = pesoNum / (alturaNum * alturaNum);
      let categoria: ImcCategory = "";

      if (imcCalculado < 18.5) {
        categoria = "Bajo peso";
      } else if (imcCalculado < 25) {
        categoria = "Normal";
      } else if (imcCalculado < 30) {
        categoria = "Sobrepeso";
      } else {
        categoria = "Obesidad";
      }

      return { imc: imcCalculado, imcCategoria: categoria };
    }

    return { imc: null, imcCategoria: "" };
  }, [peso, altura]);
}
