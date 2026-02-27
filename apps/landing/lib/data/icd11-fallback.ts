// Base de datos local de diagnósticos ICD-11 comunes como fallback
// Útil cuando la API de la OMS no está disponible o no está configurada

export interface ICD11Diagnosis {
  code: string;
  title: string;
  chapter: string;
  keywords: string[];
}

export const ICD11_FALLBACK_DATA: ICD11Diagnosis[] = [
  // RESPIRATORIO
  { code: "CA40", title: "Asma", chapter: "Respiratorio", keywords: ["asma", "broncoespasmo", "sibilancias"] },
  { code: "CA40.0", title: "Asma predominantemente alérgica", chapter: "Respiratorio", keywords: ["asma", "alérgica", "atópica"] },
  { code: "CA40.1", title: "Asma no alérgica", chapter: "Respiratorio", keywords: ["asma", "intrínseca"] },
  { code: "CA42", title: "Neumonía bacteriana", chapter: "Respiratorio", keywords: ["neumonía", "pulmonía", "infección pulmonar"] },
  { code: "CA08", title: "Gripe", chapter: "Respiratorio", keywords: ["gripe", "influenza", "flu"] },
  { code: "RA01", title: "COVID-19", chapter: "Infecciosas", keywords: ["covid", "coronavirus", "sars-cov-2"] },
  { code: "CA25", title: "Bronquitis aguda", chapter: "Respiratorio", keywords: ["bronquitis", "tos", "infección bronquial"] },
  { code: "CA26", title: "Bronquitis crónica", chapter: "Respiratorio", keywords: ["bronquitis", "crónica", "epoc"] },
  { code: "CA22", title: "Faringitis aguda", chapter: "Respiratorio", keywords: ["faringitis", "dolor garganta", "amigdalitis"] },
  { code: "CA23", title: "Laringitis aguda", chapter: "Respiratorio", keywords: ["laringitis", "ronquera", "afonía"] },
  
  // CARDIOVASCULAR
  { code: "BA00", title: "Hipertensión esencial", chapter: "Cardiovascular", keywords: ["hipertensión", "presión alta", "hta"] },
  { code: "BA01", title: "Hipertensión secundaria", chapter: "Cardiovascular", keywords: ["hipertensión", "secundaria"] },
  { code: "BC71", title: "Arritmia cardíaca", chapter: "Cardiovascular", keywords: ["arritmia", "palpitaciones", "taquicardia"] },
  { code: "BD10", title: "Insuficiencia cardíaca", chapter: "Cardiovascular", keywords: ["insuficiencia", "cardíaca", "falla cardíaca"] },
  { code: "BA40", title: "Angina de pecho", chapter: "Cardiovascular", keywords: ["angina", "dolor torácico", "isquemia"] },
  { code: "BA41", title: "Infarto agudo de miocardio", chapter: "Cardiovascular", keywords: ["infarto", "iam", "ataque cardíaco"] },
  { code: "BB90", title: "Hipotensión", chapter: "Cardiovascular", keywords: ["hipotensión", "presión baja"] },
  
  // DIGESTIVO
  { code: "DA42", title: "Gastritis aguda", chapter: "Digestivo", keywords: ["gastritis", "dolor estómago", "acidez"] },
  { code: "DA43", title: "Gastritis crónica", chapter: "Digestivo", keywords: ["gastritis", "crónica"] },
  { code: "DA22", title: "Enfermedad por reflujo gastroesofágico", chapter: "Digestivo", keywords: ["reflujo", "erge", "acidez"] },
  { code: "DD70", title: "Colitis", chapter: "Digestivo", keywords: ["colitis", "inflamación colon"] },
  { code: "DD71", title: "Síndrome de intestino irritable", chapter: "Digestivo", keywords: ["colon irritable", "sii", "intestino irritable"] },
  { code: "DD10", title: "Diarrea aguda", chapter: "Digestivo", keywords: ["diarrea", "gastroenteritis"] },
  { code: "DD11", title: "Diarrea crónica", chapter: "Digestivo", keywords: ["diarrea", "crónica"] },
  { code: "DD12", title: "Estreñimiento", chapter: "Digestivo", keywords: ["estreñimiento", "constipación"] },
  { code: "DA90", title: "Dispepsia", chapter: "Digestivo", keywords: ["dispepsia", "indigestión", "mala digestión"] },
  
  // ENDOCRINO Y METABÓLICO
  { code: "5A11", title: "Diabetes mellitus tipo 2", chapter: "Endocrino", keywords: ["diabetes", "tipo 2", "dm2"] },
  { code: "5A10", title: "Diabetes mellitus tipo 1", chapter: "Endocrino", keywords: ["diabetes", "tipo 1", "dm1"] },
  { code: "5A14", title: "Diabetes gestacional", chapter: "Endocrino", keywords: ["diabetes", "gestacional", "embarazo"] },
  { code: "5A00", title: "Hipotiroidismo", chapter: "Endocrino", keywords: ["hipotiroidismo", "tiroides baja"] },
  { code: "5A01", title: "Hipertiroidismo", chapter: "Endocrino", keywords: ["hipertiroidismo", "tiroides alta"] },
  { code: "5B81", title: "Obesidad", chapter: "Endocrino", keywords: ["obesidad", "sobrepeso"] },
  { code: "5C90", title: "Dislipidemia", chapter: "Endocrino", keywords: ["dislipidemia", "colesterol", "triglicéridos"] },
  
  // NEUROLÓGICO
  { code: "8A80", title: "Migraña", chapter: "Neurológico", keywords: ["migraña", "jaqueca"] },
  { code: "8A81", title: "Cefalea tensional", chapter: "Neurológico", keywords: ["cefalea", "dolor cabeza", "tensional"] },
  { code: "8A82", title: "Cefalea en racimos", chapter: "Neurológico", keywords: ["cefalea", "racimos", "cluster"] },
  { code: "8A60", title: "Epilepsia", chapter: "Neurológico", keywords: ["epilepsia", "convulsiones"] },
  { code: "AB31", title: "Vértigo", chapter: "Neurológico", keywords: ["vértigo", "mareo", "vahído"] },
  { code: "8A40", title: "Enfermedad de Parkinson", chapter: "Neurológico", keywords: ["parkinson", "temblor"] },
  { code: "8A20", title: "Enfermedad de Alzheimer", chapter: "Neurológico", keywords: ["alzheimer", "demencia"] },
  
  // MUSCULOESQUELÉTICO
  { code: "FA20", title: "Artritis reumatoide", chapter: "Musculoesquelético", keywords: ["artritis", "reumatoide", "ar"] },
  { code: "FA00", title: "Osteoartritis", chapter: "Musculoesquelético", keywords: ["osteoartritis", "artrosis"] },
  { code: "FB50", title: "Lumbalgia", chapter: "Musculoesquelético", keywords: ["lumbalgia", "dolor lumbar", "lumbago"] },
  { code: "FB51", title: "Cervicalgia", chapter: "Musculoesquelético", keywords: ["cervicalgia", "dolor cervical", "cuello"] },
  { code: "FB84", title: "Osteoporosis", chapter: "Musculoesquelético", keywords: ["osteoporosis", "huesos débiles"] },
  { code: "FB55", title: "Hernia discal", chapter: "Musculoesquelético", keywords: ["hernia", "disco", "discal"] },
  
  // DERMATOLÓGICO
  { code: "EA80", title: "Dermatitis atópica", chapter: "Dermatológico", keywords: ["dermatitis", "atópica", "eczema"] },
  { code: "EA81", title: "Dermatitis de contacto", chapter: "Dermatológico", keywords: ["dermatitis", "contacto", "alergia"] },
  { code: "EA90", title: "Psoriasis", chapter: "Dermatológico", keywords: ["psoriasis", "placas"] },
  { code: "EA85", title: "Urticaria", chapter: "Dermatológico", keywords: ["urticaria", "ronchas", "alergia"] },
  { code: "1F20", title: "Acné", chapter: "Dermatológico", keywords: ["acné", "espinillas", "granos"] },
  
  // INFECCIONES
  { code: "1C62", title: "Infección de vías urinarias", chapter: "Infecciosas", keywords: ["infección", "urinaria", "itu", "cistitis"] },
  { code: "1F00", title: "Candidiasis", chapter: "Infecciosas", keywords: ["candidiasis", "hongos", "cándida"] },
  { code: "1C1Z", title: "Tuberculosis", chapter: "Infecciosas", keywords: ["tuberculosis", "tbc"] },
  { code: "1C30", title: "Hepatitis viral", chapter: "Infecciosas", keywords: ["hepatitis", "hígado"] },
  
  // OFTALMOLÓGICO
  { code: "9D90", title: "Conjuntivitis", chapter: "Oftalmológico", keywords: ["conjuntivitis", "ojo rojo"] },
  { code: "9B60", title: "Glaucoma", chapter: "Oftalmológico", keywords: ["glaucoma", "presión ocular"] },
  { code: "9B10", title: "Catarata", chapter: "Oftalmológico", keywords: ["catarata", "opacidad"] },
  
  // OTORRINOLARINGOLÓGICO
  { code: "AA00", title: "Otitis media", chapter: "ORL", keywords: ["otitis", "oído", "infección oído"] },
  { code: "AA02", title: "Otitis externa", chapter: "ORL", keywords: ["otitis", "externa", "oído nadador"] },
  { code: "AB32", title: "Vértigo posicional", chapter: "ORL", keywords: ["vértigo", "posicional", "bppv"] },
  { code: "CA20", title: "Sinusitis", chapter: "ORL", keywords: ["sinusitis", "senos paranasales"] },
  
  // PSIQUIÁTRICO
  { code: "6A70", title: "Trastorno de ansiedad generalizada", chapter: "Psiquiátrico", keywords: ["ansiedad", "tag", "nervios"] },
  { code: "6A71", title: "Trastorno de pánico", chapter: "Psiquiátrico", keywords: ["pánico", "crisis", "ataque"] },
  { code: "6A60", title: "Trastorno depresivo", chapter: "Psiquiátrico", keywords: ["depresión", "tristeza", "ánimo bajo"] },
  { code: "6A40", title: "Trastorno bipolar", chapter: "Psiquiátrico", keywords: ["bipolar", "manía"] },
  { code: "6C51", title: "Insomnio", chapter: "Psiquiátrico", keywords: ["insomnio", "no dormir", "sueño"] },
  
  // GINECOLÓGICO
  { code: "GA34", title: "Síndrome premenstrual", chapter: "Ginecológico", keywords: ["premenstrual", "spm", "menstruación"] },
  { code: "GA02", title: "Dismenorrea", chapter: "Ginecológico", keywords: ["dismenorrea", "dolor menstrual", "cólicos"] },
  { code: "GA20", title: "Amenorrea", chapter: "Ginecológico", keywords: ["amenorrea", "falta menstruación"] },
  { code: "GA10", title: "Síndrome de ovario poliquístico", chapter: "Ginecológico", keywords: ["ovario", "poliquístico", "sop"] },
  
  // UROLÓGICO
  { code: "GB04", title: "Hiperplasia prostática benigna", chapter: "Urológico", keywords: ["próstata", "hiperplasia", "hpb"] },
  { code: "GC08", title: "Disfunción eréctil", chapter: "Urológico", keywords: ["disfunción", "eréctil", "impotencia"] },
  { code: "GC40", title: "Incontinencia urinaria", chapter: "Urológico", keywords: ["incontinencia", "orina", "pérdida"] },
  
  // PEDIÁTRICO
  { code: "KA62", title: "Varicela", chapter: "Pediátrico", keywords: ["varicela", "chickenpox"] },
  { code: "KA60", title: "Sarampión", chapter: "Pediátrico", keywords: ["sarampión", "measles"] },
  { code: "KA61", title: "Rubéola", chapter: "Pediátrico", keywords: ["rubéola", "rubeola"] },
  { code: "KA63", title: "Parotiditis", chapter: "Pediátrico", keywords: ["parotiditis", "paperas", "mumps"] },
];

/**
 * Busca diagnósticos en la base de datos local
 */
export function searchLocalICD11(query: string): ICD11Diagnosis[] {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return ICD11_FALLBACK_DATA
    .filter(diagnosis => {
      // Buscar en código
      if (diagnosis.code.toLowerCase().includes(searchTerm)) return true;
      
      // Buscar en título
      if (diagnosis.title.toLowerCase().includes(searchTerm)) return true;
      
      // Buscar en keywords
      return diagnosis.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm) || 
        searchTerm.includes(keyword.toLowerCase())
      );
    })
    .slice(0, 15);
}

/**
 * Obtiene diagnósticos por categoría
 */
export function getDiagnosesByCategory(category: string): ICD11Diagnosis[] {
  return ICD11_FALLBACK_DATA.filter(d => d.chapter === category);
}

/**
 * Obtiene todas las categorías disponibles
 */
export function getCategories(): string[] {
  return Array.from(new Set(ICD11_FALLBACK_DATA.map(d => d.chapter)));
}
