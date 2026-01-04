// Base de datos local de CIE-10 (ICD-10) 2025
// Códigos más comunes en práctica médica latinoamericana

export interface CIE10Code {
  code: string;
  description: string;
  category: string;
  chapter: string;
}

// Nota: Este dataset es un subconjunto mínimo y válido para evitar errores de parseo.
// TODO: Completar con los códigos necesarios o mover la fuente a una base externa.
export const CIE10_DATABASE: CIE10Code[] = [
  // CAPÍTULO I: Enfermedades infecciosas y parasitarias (A00-B99)
  {
    code: "A09",
    description: "Diarrea y gastroenteritis de presunto origen infeccioso",
    category: "Infecciosas",
    chapter: "I",
  },
  {
    code: "A41.9",
    description: "Sepsis, no especificada",
    category: "Infecciosas",
    chapter: "I",
  },

  // CAPÍTULO X: Enfermedades del sistema respiratorio (J00-J99)
  {
    code: "J06.9",
    description: "Infección aguda de las vías respiratorias superiores, no especificada",
    category: "Respiratorio",
    chapter: "X",
  },
  {
    code: "J18.9",
    description: "Neumonía, organismo no especificado",
    category: "Respiratorio",
    chapter: "X",
  },

  // CAPÍTULO IX: Enfermedades del aparato circulatorio (I00-I99)
  {
    code: "I10",
    description: "Hipertensión esencial (primaria)",
    category: "Circulatorio",
    chapter: "IX",
  },
  {
    code: "I21.9",
    description: "Infarto agudo de miocardio, no especificado",
    category: "Circulatorio",
    chapter: "IX",
  },

  // CAPÍTULO IV: Enfermedades endocrinas, nutricionales y metabólicas (E00-E90)
  {
    code: "E11.9",
    description: "Diabetes mellitus tipo 2 sin complicaciones",
    category: "Endocrino",
    chapter: "IV",
  },
  {
    code: "E66.9",
    description: "Obesidad, no especificada",
    category: "Endocrino",
    chapter: "IV",
  },
];

export function findCIE10ByCode(code: string): CIE10Code | undefined {
  return CIE10_DATABASE.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

export function searchCIE10ByText(query: string, limit = 20): CIE10Code[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results = CIE10_DATABASE.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
  );
  return results.slice(0, limit);
}