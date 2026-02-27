// Constantes para el perfil de usuario

export const ESTADOS_VENEZUELA = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcón",
  "Guárico",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "Vargas",
  "Yaracuy",
  "Zulia",
] as const;

export const TIPOS_SANGRE = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const RELACIONES_EMERGENCIA = [
  { value: "padre", label: "Padre" },
  { value: "madre", label: "Madre" },
  { value: "esposo", label: "Esposo" },
  { value: "esposa", label: "Esposa" },
  { value: "hijo", label: "Hijo/a" },
  { value: "hermano", label: "Hermano/a" },
  { value: "amigo", label: "Amigo/a" },
  { value: "otro", label: "Otro" },
] as const;

export const DOCUMENT_REQUIREMENTS = [
  "Formato: JPG, PNG o PDF",
  "Tamaño máximo: 5 MB por archivo",
  "La imagen debe ser clara y legible",
  "Debe mostrar el documento completo",
  "No se aceptan documentos vencidos",
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
