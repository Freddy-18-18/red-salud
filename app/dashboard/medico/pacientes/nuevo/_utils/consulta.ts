export type PacienteParams = {
  cedula: string | null;
  nombre: string | null;
  edad: string | null;
  genero: string | null;
};

export function buildPacienteFromParams(params: URLSearchParams) {
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