// Servicio de validación de cédula con API real de cedula.com.ve

export interface CedulaData {
  nombre: string;
  apellido: string;
  nombre_completo: string;
  cedula: string;
  nacionalidad: string;
}

export interface CedulaValidationResult {
  found: boolean;
  nombre_completo?: string;
}

// Validar cédula con API real de cedula.com.ve
export async function validateCedulaWithCNE(cedula: string): Promise<CedulaValidationResult> {
  if (!cedula || cedula.length < 6) {
    return { found: false };
  }

  try {
    // Consultar API real
    const response = await fetch(`/api/cne/validate?cedula=${cedula}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data: CedulaData = await response.json();
      if (data && data.nombre_completo) {
        return {
          found: true,
          nombre_completo: data.nombre_completo,
        };
      }
    }

    // 404 es normal (cédula no encontrada)
    if (response.status === 404) {
      return { found: false };
    }

    // Otros errores
    return { found: false };
  } catch (error) {
    // Error de red - permitir ingreso manual
    return { found: false };
  }
}

// Validar formato de cédula venezolana
export function isValidVenezuelanCedula(cedula: string): boolean {
  const cleaned = cedula.replace(/[\s-]/g, "");
  if (!/^\d{6,8}$/.test(cleaned)) {
    return false;
  }
  return true;
}

// Calcular edad desde fecha de nacimiento (super rápido)
export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
