import { useMemo } from 'react';

interface IMCResult {
  imc: number | null;
  categoria: string;
}

export function useIMCCalculation(peso: string | number | undefined, altura: string | number | undefined): IMCResult {
  return useMemo(() => {
    if (peso && altura) {
      const pesoNum = parseFloat(String(peso));
      const alturaNum = parseFloat(String(altura)) / 100; // convertir cm a m
      
      if (pesoNum > 0 && alturaNum > 0) {
        const imcCalculado = pesoNum / (alturaNum * alturaNum);
        
        // Categorizar IMC
        let categoria = '';
        if (imcCalculado < 18.5) {
          categoria = 'Bajo peso';
        } else if (imcCalculado < 25) {
          categoria = 'Normal';
        } else if (imcCalculado < 30) {
          categoria = 'Sobrepeso';
        } else {
          categoria = 'Obesidad';
        }
        
        return { imc: imcCalculado, categoria };
      }
    }
    return { imc: null, categoria: '' };
  }, [peso, altura]);
}
