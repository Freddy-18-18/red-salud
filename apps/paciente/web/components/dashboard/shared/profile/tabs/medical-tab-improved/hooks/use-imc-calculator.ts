import { useMemo } from "react";
import type { IMCData } from "../types";

export function useIMCCalculator(peso?: string, altura?: string): IMCData {
  return useMemo(() => {
    if (peso && altura) {
      const pesoNum = parseFloat(peso);
      const alturaNum = parseFloat(altura) / 100;
      
      if (pesoNum > 0 && alturaNum > 0) {
        const imcCalculado = pesoNum / (alturaNum * alturaNum);
        let categoria = "Normal";
        
        if (imcCalculado < 18.5) categoria = "Bajo peso";
        else if (imcCalculado < 25) categoria = "Normal";
        else if (imcCalculado < 30) categoria = "Sobrepeso";
        else categoria = "Obesidad";
        
        return { value: imcCalculado, categoria };
      }
    }
    return { value: null, categoria: "" };
  }, [peso, altura]);
}
