// Motivos de consulta más comunes organizados por categoría
export const CONSULTATION_REASONS = [
  // Síntomas Generales
  "Dolor de cabeza",
  "Dolor de cabeza persistente",
  "Migraña",
  "Fiebre",
  "Fiebre alta",
  "Malestar general",
  "Fatiga y cansancio",
  "Pérdida de apetito",
  "Náuseas y vómitos",
  "Mareos",
  "Desmayos",
  
  // Respiratorio
  "Tos",
  "Tos con flema",
  "Tos seca",
  "Dolor de garganta",
  "Congestión nasal",
  "Gripe",
  "Resfriado común",
  "Dificultad para respirar",
  "Asma",
  "Bronquitis",
  "Neumonía",
  "Sinusitis",
  "Alergias respiratorias",
  
  // Gastrointestinal
  "Dolor abdominal",
  "Dolor de estómago",
  "Diarrea",
  "Estreñimiento",
  "Gastritis",
  "Reflujo gastroesofágico",
  "Acidez estomacal",
  "Indigestión",
  "Vómitos",
  "Hemorroides",
  "Colitis",
  
  // Cardiovascular
  "Dolor en el pecho",
  "Palpitaciones",
  "Presión arterial alta",
  "Presión arterial baja",
  "Hipertensión",
  "Arritmia cardíaca",
  
  // Musculoesquelético
  "Dolor de espalda",
  "Dolor lumbar",
  "Dolor de cuello",
  "Dolor de rodilla",
  "Dolor de hombro",
  "Dolor muscular",
  "Dolor articular",
  "Artritis",
  "Esguince",
  "Fractura",
  "Tendinitis",
  "Ciática",
  "Hernia discal",
  
  // Dermatológico
  "Erupción cutánea",
  "Picazón en la piel",
  "Acné",
  "Dermatitis",
  "Psoriasis",
  "Eczema",
  "Hongos en la piel",
  "Verrugas",
  "Quemadura solar",
  "Heridas",
  
  // Neurológico
  "Dolor de cabeza intenso",
  "Migraña crónica",
  "Vértigo",
  "Entumecimiento",
  "Hormigueo en extremidades",
  "Convulsiones",
  "Pérdida de memoria",
  
  // Oftalmológico
  "Dolor de ojos",
  "Visión borrosa",
  "Conjuntivitis",
  "Ojo rojo",
  "Irritación ocular",
  
  // Otorrinolaringológico
  "Dolor de oído",
  "Pérdida de audición",
  "Zumbido en los oídos",
  "Otitis",
  "Sinusitis",
  
  // Urológico
  "Dolor al orinar",
  "Infección urinaria",
  "Cistitis",
  "Cálculos renales",
  "Incontinencia urinaria",
  
  // Ginecológico
  "Dolor menstrual",
  "Irregularidades menstruales",
  "Sangrado vaginal anormal",
  "Infección vaginal",
  "Menopausia",
  
  // Endocrino
  "Diabetes",
  "Control de diabetes",
  "Problemas de tiroides",
  "Hipotiroidismo",
  "Hipertiroidismo",
  
  // Mental/Emocional
  "Ansiedad",
  "Depresión",
  "Estrés",
  "Insomnio",
  "Trastornos del sueño",
  "Ataques de pánico",
  
  // Pediátrico
  "Fiebre en niños",
  "Diarrea en niños",
  "Vómitos en niños",
  "Cólicos del lactante",
  "Vacunación",
  "Control de niño sano",
  
  // Preventivo y Control
  "Chequeo general",
  "Control de rutina",
  "Examen físico anual",
  "Control de presión arterial",
  "Control de colesterol",
  "Control de peso",
  "Certificado médico",
  "Resultados de laboratorio",
  "Renovación de receta",
  "Segunda opinión médica",
  
  // Otros
  "Alergias",
  "Reacción alérgica",
  "Picadura de insecto",
  "Intoxicación alimentaria",
  "Deshidratación",
  "Obesidad",
  "Pérdida de peso",
  "Tabaquismo",
  "Alcoholismo",
];

// Función para buscar motivos que coincidan con el texto
export function searchConsultationReasons(query: string): string[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  
  return CONSULTATION_REASONS
    .filter(reason => reason.toLowerCase().includes(lowerQuery))
    .slice(0, 8); // Limitar a 8 sugerencias
}
