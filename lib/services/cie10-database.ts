// Base de datos local de CIE-10 (ICD-10) 2025
// Códigos más comunes en práctica médica latinoamericana

export interface CIE10Code {
  code: string;
  description: string;
  category: string;
  chapter: string;
}

export const CIE10_DATABASE: CIE10Code[] = [
  // CAPÍTULO I: Enfermedades infecciosas y parasitarias (A00-B99)
  { code: "A09