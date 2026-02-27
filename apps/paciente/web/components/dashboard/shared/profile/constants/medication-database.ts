// Base de datos de medicamentos comunes con dosis y frecuencias típicas

export interface MedicationTemplate {
  nombre: string;
  dosisComunes: string[];
  frecuenciasComunes: string[];
}

export const MEDICAMENTOS_COMUNES: MedicationTemplate[] = [
  {
    nombre: "Losartán",
    dosisComunes: ["25mg", "50mg", "100mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Metformina",
    dosisComunes: ["500mg", "850mg", "1000mg"],
    frecuenciasComunes: ["Cada 12 horas", "Cada 8 horas"],
  },
  {
    nombre: "Atorvastatina",
    dosisComunes: ["10mg", "20mg", "40mg", "80mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Omeprazol",
    dosisComunes: ["20mg", "40mg"],
    frecuenciasComunes: ["Cada 24 horas", "Cada 12 horas"],
  },
  {
    nombre: "Levotiroxina",
    dosisComunes: ["25mcg", "50mcg", "75mcg", "100mcg", "125mcg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Aspirina",
    dosisComunes: ["100mg", "300mg", "500mg"],
    frecuenciasComunes: ["Cada 24 horas", "Según necesidad"],
  },
  {
    nombre: "Paracetamol",
    dosisComunes: ["500mg", "650mg", "1000mg"],
    frecuenciasComunes: ["Cada 6 horas", "Cada 8 horas", "Según necesidad"],
  },
  {
    nombre: "Ibuprofeno",
    dosisComunes: ["400mg", "600mg", "800mg"],
    frecuenciasComunes: ["Cada 6 horas", "Cada 8 horas", "Según necesidad"],
  },
  {
    nombre: "Enalapril",
    dosisComunes: ["5mg", "10mg", "20mg"],
    frecuenciasComunes: ["Cada 24 horas", "Cada 12 horas"],
  },
  {
    nombre: "Amlodipino",
    dosisComunes: ["5mg", "10mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Glibenclamida",
    dosisComunes: ["5mg"],
    frecuenciasComunes: ["Cada 24 horas", "Cada 12 horas"],
  },
  {
    nombre: "Insulina",
    dosisComunes: ["10 UI", "20 UI", "30 UI", "Variable"],
    frecuenciasComunes: ["Cada 24 horas", "Cada 12 horas", "Cada 8 horas"],
  },
  {
    nombre: "Salbutamol",
    dosisComunes: ["100mcg", "200mcg"],
    frecuenciasComunes: ["Según necesidad", "Cada 4 horas", "Cada 6 horas"],
  },
  {
    nombre: "Clonazepam",
    dosisComunes: ["0.5mg", "1mg", "2mg"],
    frecuenciasComunes: ["Cada 24 horas", "Cada 12 horas"],
  },
  {
    nombre: "Sertralina",
    dosisComunes: ["25mg", "50mg", "100mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Fluoxetina",
    dosisComunes: ["20mg", "40mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Carbamazepina",
    dosisComunes: ["200mg", "400mg"],
    frecuenciasComunes: ["Cada 12 horas", "Cada 8 horas"],
  },
  {
    nombre: "Warfarina",
    dosisComunes: ["2mg", "5mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Prednisona",
    dosisComunes: ["5mg", "10mg", "20mg"],
    frecuenciasComunes: ["Cada 24 horas", "Cada 12 horas"],
  },
  {
    nombre: "Ranitidina",
    dosisComunes: ["150mg", "300mg"],
    frecuenciasComunes: ["Cada 24 horas", "Cada 12 horas"],
  },
  {
    nombre: "Simvastatina",
    dosisComunes: ["10mg", "20mg", "40mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Captopril",
    dosisComunes: ["25mg", "50mg"],
    frecuenciasComunes: ["Cada 8 horas", "Cada 12 horas"],
  },
  {
    nombre: "Furosemida",
    dosisComunes: ["20mg", "40mg"],
    frecuenciasComunes: ["Cada 24 horas", "Cada 12 horas"],
  },
  {
    nombre: "Espironolactona",
    dosisComunes: ["25mg", "50mg", "100mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Digoxina",
    dosisComunes: ["0.25mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Propranolol",
    dosisComunes: ["10mg", "40mg", "80mg"],
    frecuenciasComunes: ["Cada 8 horas", "Cada 12 horas"],
  },
  {
    nombre: "Diclofenaco",
    dosisComunes: ["50mg", "75mg", "100mg"],
    frecuenciasComunes: ["Cada 8 horas", "Cada 12 horas"],
  },
  {
    nombre: "Naproxeno",
    dosisComunes: ["250mg", "500mg"],
    frecuenciasComunes: ["Cada 12 horas", "Según necesidad"],
  },
  {
    nombre: "Amoxicilina",
    dosisComunes: ["500mg", "875mg"],
    frecuenciasComunes: ["Cada 8 horas", "Cada 12 horas"],
  },
  {
    nombre: "Azitromicina",
    dosisComunes: ["500mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Ciprofloxacino",
    dosisComunes: ["500mg", "750mg"],
    frecuenciasComunes: ["Cada 12 horas"],
  },
  {
    nombre: "Alprazolam",
    dosisComunes: ["0.25mg", "0.5mg", "1mg"],
    frecuenciasComunes: ["Cada 8 horas", "Según necesidad"],
  },
  {
    nombre: "Lorazepam",
    dosisComunes: ["1mg", "2mg"],
    frecuenciasComunes: ["Cada 8 horas", "Según necesidad"],
  },
  {
    nombre: "Gabapentina",
    dosisComunes: ["300mg", "600mg"],
    frecuenciasComunes: ["Cada 8 horas"],
  },
  {
    nombre: "Pregabalina",
    dosisComunes: ["75mg", "150mg"],
    frecuenciasComunes: ["Cada 12 horas"],
  },
  {
    nombre: "Tramadol",
    dosisComunes: ["50mg", "100mg"],
    frecuenciasComunes: ["Cada 6 horas", "Cada 8 horas"],
  },
  {
    nombre: "Codeína",
    dosisComunes: ["30mg", "60mg"],
    frecuenciasComunes: ["Cada 4 horas", "Cada 6 horas"],
  },
  {
    nombre: "Morfina",
    dosisComunes: ["10mg", "30mg"],
    frecuenciasComunes: ["Cada 4 horas", "Cada 12 horas"],
  },
  {
    nombre: "Hidroclorotiazida",
    dosisComunes: ["12.5mg", "25mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Bisoprolol",
    dosisComunes: ["2.5mg", "5mg", "10mg"],
    frecuenciasComunes: ["Cada 24 horas"],
  },
  {
    nombre: "Carvedilol",
    dosisComunes: ["6.25mg", "12.5mg", "25mg"],
    frecuenciasComunes: ["Cada 12 horas"],
  },
];

export const FRECUENCIAS_COMUNES = [
  "Cada 4 horas",
  "Cada 6 horas",
  "Cada 8 horas",
  "Cada 12 horas",
  "Cada 24 horas",
  "Según necesidad",
];

// Función para buscar medicamentos
export function buscarMedicamento(query: string): MedicationTemplate[] {
  const lowerQuery = query.toLowerCase();
  return MEDICAMENTOS_COMUNES.filter((med) =>
    med.nombre.toLowerCase().includes(lowerQuery)
  );
}

// Función para obtener dosis comunes de un medicamento
export function obtenerDosisComunes(nombreMedicamento: string): string[] {
  const med = MEDICAMENTOS_COMUNES.find(
    (m) => m.nombre.toLowerCase() === nombreMedicamento.toLowerCase()
  );
  return med?.dosisComunes || [];
}

// Función para obtener frecuencias comunes de un medicamento
export function obtenerFrecuenciasComunes(nombreMedicamento: string): string[] {
  const med = MEDICAMENTOS_COMUNES.find(
    (m) => m.nombre.toLowerCase() === nombreMedicamento.toLowerCase()
  );
  return med?.frecuenciasComunes || FRECUENCIAS_COMUNES;
}
