export type PacienteParams = {
  id?: string;
  cedula: string;
  nombre_completo: string;
  edad: number | null;
  genero: string;
  fecha_nacimiento?: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
};

export function buildPacienteFromParams(
  params: URLSearchParams,
): PacienteParams {
  const cedula = params.get("cedula") || "";
  const nombre = params.get("nombre") || "";
  const edadStr = params.get("edad");
  const genero = params.get("genero") || "";
  const edad = edadStr && /^\d+$/.test(edadStr) ? parseInt(edadStr, 10) : null;
  return {
    cedula,
    nombre_completo: nombre,
    edad,
    genero,
  };
}
