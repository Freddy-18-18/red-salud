// Servicio de integración con ICD-10/CIE-10
// Sistema de clasificación internacional de enfermedades

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

// Base de datos expandida de códigos ICD-10 más comunes
// Organizada por categorías para facilitar búsqueda
const ICD10_DATABASE: ICD10Code[] = [
  // ========== INFECCIOSAS ==========
  { code: "A09", description: "Diarrea y gastroenteritis de presunto origen infeccioso", category: "Infecciosas" },
  { code: "A08.4", description: "Infección intestinal viral no especificada", category: "Infecciosas" },
  { code: "B34.9", description: "Infección viral no especificada", category: "Infecciosas" },
  
  // ========== RESPIRATORIAS ==========
  { code: "J00", description: "Rinofaringitis aguda (resfriado común)", category: "Respiratorias" },
  { code: "J01.9", description: "Sinusitis aguda no especificada", category: "Respiratorias" },
  { code: "J02.9", description: "Faringitis aguda no especificada", category: "Respiratorias" },
  { code: "J03.9", description: "Amigdalitis aguda no especificada", category: "Respiratorias" },
  { code: "J06.9", description: "Infección aguda de vías respiratorias superiores", category: "Respiratorias" },
  { code: "J18.9", description: "Neumonía no especificada", category: "Respiratorias" },
  { code: "J20.9", description: "Bronquitis aguda no especificada", category: "Respiratorias" },
  { code: "J40", description: "Bronquitis no especificada como aguda o crónica", category: "Respiratorias" },
  { code: "J44.0", description: "EPOC con infección respiratoria aguda", category: "Respiratorias" },
  { code: "J44.9", description: "EPOC no especificada", category: "Respiratorias" },
  { code: "J45", description: "Asma", category: "Respiratorias" },
  { code: "J45.9", description: "Asma no especificada", category: "Respiratorias" },
  
  // ========== CARDIOVASCULARES ==========
  { code: "I10", description: "Hipertensión esencial (primaria)", category: "Cardiovasculares" },
  { code: "I11.9", description: "Enfermedad cardíaca hipertensiva sin insuficiencia cardíaca", category: "Cardiovasculares" },
  { code: "I20.9", description: "Angina de pecho no especificada", category: "Cardiovasculares" },
  { code: "I25.10", description: "Enfermedad aterosclerótica del corazón", category: "Cardiovasculares" },
  { code: "I48.91", description: "Fibrilación auricular no especificada", category: "Cardiovasculares" },
  { code: "I50.9", description: "Insuficiencia cardíaca no especificada", category: "Cardiovasculares" },
  
  // ========== ENDOCRINAS Y METABÓLICAS ==========
  { code: "E10.9", description: "Diabetes mellitus tipo 1 sin complicaciones", category: "Endocrinas" },
  { code: "E11", description: "Diabetes mellitus tipo 2", category: "Endocrinas" },
  { code: "E11.9", description: "Diabetes mellitus tipo 2 sin complicaciones", category: "Endocrinas" },
  { code: "E11.65", description: "Diabetes tipo 2 con hiperglucemia", category: "Endocrinas" },
  { code: "E03.9", description: "Hipotiroidismo no especificado", category: "Endocrinas" },
  { code: "E05.90", description: "Tirotoxicosis no especificada", category: "Endocrinas" },
  { code: "E66.9", description: "Obesidad no especificada", category: "Endocrinas" },
  { code: "E78.0", description: "Hipercolesterolemia pura", category: "Endocrinas" },
  { code: "E78.5", description: "Hiperlipidemia no especificada", category: "Endocrinas" },
  
  // ========== DIGESTIVAS ==========
  { code: "K21.9", description: "Enfermedad por reflujo gastroesofágico sin esofagitis", category: "Digestivas" },
  { code: "K29.0", description: "Gastritis hemorrágica aguda", category: "Digestivas" },
  { code: "K29.7", description: "Gastritis no especificada", category: "Digestivas" },
  { code: "K30", description: "Dispepsia funcional", category: "Digestivas" },
  { code: "K58.9", description: "Síndrome de intestino irritable sin diarrea", category: "Digestivas" },
  { code: "K59.0", description: "Estreñimiento", category: "Digestivas" },
  { code: "K80.20", description: "Cálculo de vesícula biliar sin colecistitis", category: "Digestivas" },
  
  // ========== MUSCULOESQUELÉTICAS ==========
  { code: "M10.9", description: "Gota no especificada", category: "Musculoesqueléticas" },
  { code: "M15.9", description: "Poliartrosis no especificada", category: "Musculoesqueléticas" },
  { code: "M19.90", description: "Artrosis no especificada", category: "Musculoesqueléticas" },
  { code: "M25.5", description: "Dolor articular", category: "Musculoesqueléticas" },
  { code: "M54.2", description: "Cervicalgia", category: "Musculoesqueléticas" },
  { code: "M54.5", description: "Dolor lumbar bajo", category: "Musculoesqueléticas" },
  { code: "M79.1", description: "Mialgia", category: "Musculoesqueléticas" },
  { code: "M79.3", description: "Paniculitis no especificada", category: "Musculoesqueléticas" },
  
  // ========== DERMATOLÓGICAS ==========
  { code: "L20.9", description: "Dermatitis atópica no especificada", category: "Dermatológicas" },
  { code: "L30.9", description: "Dermatitis no especificada", category: "Dermatológicas" },
  { code: "L50.9", description: "Urticaria no especificada", category: "Dermatológicas" },
  { code: "L70.0", description: "Acné vulgar", category: "Dermatológicas" },
  
  // ========== NEUROLÓGICAS ==========
  { code: "G40.909", description: "Epilepsia no especificada", category: "Neurológicas" },
  { code: "G43.9", description: "Migraña no especificada", category: "Neurológicas" },
  { code: "G44.1", description: "Cefalea vascular no clasificada", category: "Neurológicas" },
  { code: "G47.00", description: "Insomnio no especificado", category: "Neurológicas" },
  
  // ========== PSIQUIÁTRICAS ==========
  { code: "F32.9", description: "Episodio depresivo no especificado", category: "Psiquiátricas" },
  { code: "F41.1", description: "Trastorno de ansiedad generalizada", category: "Psiquiátricas" },
  { code: "F41.9", description: "Trastorno de ansiedad no especificado", category: "Psiquiátricas" },
  
  // ========== GENITOURINARIAS ==========
  { code: "N30.00", description: "Cistitis aguda sin hematuria", category: "Genitourinarias" },
  { code: "N39.0", description: "Infección de vías urinarias sitio no especificado", category: "Genitourinarias" },
  { code: "N40.0", description: "Hiperplasia prostática benigna sin obstrucción", category: "Genitourinarias" },
  
  // ========== SÍNTOMAS Y SIGNOS ==========
  { code: "R05", description: "Tos", category: "Síntomas" },
  { code: "R06.0", description: "Disnea", category: "Síntomas" },
  { code: "R06.02", description: "Dificultad respiratoria", category: "Síntomas" },
  { code: "R07.9", description: "Dolor de pecho no especificado", category: "Síntomas" },
  { code: "R10.0", description: "Abdomen agudo", category: "Síntomas" },
  { code: "R10.4", description: "Otros dolores abdominales y los no especificados", category: "Síntomas" },
  { code: "R11.0", description: "Náusea", category: "Síntomas" },
  { code: "R11.2", description: "Náusea con vómito", category: "Síntomas" },
  { code: "R50.9", description: "Fiebre no especificada", category: "Síntomas" },
  { code: "R51", description: "Cefalea", category: "Síntomas" },
  { code: "R53.83", description: "Fatiga", category: "Síntomas" },
  { code: "R63.4", description: "Pérdida anormal de peso", category: "Síntomas" },
  
  // ========== TRAUMATISMOS ==========
  { code: "S06.0X0A", description: "Conmoción cerebral sin pérdida de conocimiento", category: "Traumatismos" },
  { code: "S93.40", description: "Esguince de tobillo no especificado", category: "Traumatismos" },
];

export async function searchICD10(query: string): Promise<ICD10Code[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase();
  
  // Buscar en código o descripción
  const results = ICD10_DATABASE.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
  );

  return results.slice(0, 10); // Limitar a 10 resultados
}

export async function translateToICD10(text: string): Promise<ICD10Code[]> {
  // Aquí se integraría con una IA (OpenAI, Claude, etc.) para traducir texto libre a códigos ICD-10
  // Por ahora, hacemos una búsqueda simple por palabras clave
  
  const keywords = text.toLowerCase().split(/\s+/);
  const matches = new Set<ICD10Code>();

  keywords.forEach((keyword) => {
    ICD10_DATABASE.forEach((item) => {
      if (item.description.toLowerCase().includes(keyword)) {
        matches.add(item);
      }
    });
  });

  return Array.from(matches).slice(0, 5);
}

// Función para integrar con OpenAI (ejemplo)
export async function translateToICD10WithAI(text: string): Promise<ICD10Code[]> {
  // Esta función se conectaría con OpenAI API
  // Ejemplo de prompt:
  /*
  const prompt = `
    Eres un asistente médico experto en clasificación ICD-10/CIE-10.
    Traduce el siguiente texto médico a códigos ICD-10 apropiados:
    
    "${text}"
    
    Responde en formato JSON con un array de objetos que contengan:
    - code: código ICD-10
    - description: descripción en español
    - confidence: nivel de confianza (0-1)
  `;
  */
  
  // Por ahora retornamos la búsqueda simple
  return translateToICD10(text);
}

export function getCategoriesWithCounts(): { category: string; count: number }[] {
  const categories = new Map<string, number>();
  
  ICD10_DATABASE.forEach((item) => {
    const count = categories.get(item.category) || 0;
    categories.set(item.category, count + 1);
  });

  return Array.from(categories.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
