import { useState, useEffect } from "react";
import type { IMCData } from "../types";

export function useIMCCalculator(peso?: string, altura?: string): IMCData {
  const [imc, setImc] = useState<number | null>(null);
  const [imcCategoria, setImcCategoria] = useState<string>("");

  useEffect(() => {
    if (peso && altura) {
      const pesoNum = parseFloat(peso);
      const alturaNum = parseFloat(altura) / 100;
      
      if (pesoNum > 0 && alturaNum > 0) {
        const imcCalculado = pesoNum / (alturaNum * alturaNum);
        setImc(imcCalculado);
        
        if (imcCalculado < 18.5) setImcCategoria("Bajo peso");
        else if (imcCalculado < 25) setImcCategoria("Normal");
        else if (imcCalculado < 30) setImcCategoria("Sobrepeso");
        else setImcCategoria("Obesidad");
      }
    } else {
      setImc(null);
      setImcCategoria("");
    }
  }, [peso, altura]);

  return { value: imc, categoria: imcCategoria };
}
