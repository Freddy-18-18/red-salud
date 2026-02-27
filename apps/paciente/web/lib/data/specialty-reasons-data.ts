/**
 * Datos semilla de motivos de consulta por especialidad médica
 * 
 * Este archivo contiene motivos de consulta organizados por especialidad,
 * con prioridades y categorías para el sistema de sugerencias inteligentes.
 */

export interface SpecialtyReason {
    reason: string;
    category: 'común' | 'urgencia' | 'preventivo' | 'seguimiento' | 'diagnóstico';
    priority: number; // 1-100, mayor = más relevante
    tags: string[];
}

export interface SpecialtyReasons {
    [specialty: string]: SpecialtyReason[];
}

/**
 * Motivos de consulta organizados por especialidad médica
 * Cada especialidad tiene ~20-30 motivos ordenados por relevancia
 */
export const SPECIALTY_CONSULTATION_REASONS: SpecialtyReasons = {
    // ========================================================================
    // INFECTOLOGÍA PEDIÁTRICA
    // ========================================================================
    "Infectología Pediátrica": [
        { reason: "Fiebre en niños", category: "común", priority: 100, tags: ["fiebre", "temperatura", "calentura"] },
        { reason: "Fiebre persistente (más de 72 horas)", category: "urgencia", priority: 98, tags: ["fiebre", "prolongada"] },
        { reason: "Infección respiratoria alta", category: "común", priority: 95, tags: ["gripe", "resfriado", "catarro"] },
        { reason: "Bronquiolitis", category: "urgencia", priority: 94, tags: ["bronquios", "sibilancias", "bebé"] },
        { reason: "Gastroenteritis viral", category: "común", priority: 92, tags: ["diarrea", "vómitos", "gastro"] },
        { reason: "Otitis media aguda", category: "común", priority: 90, tags: ["oído", "dolor", "infección"] },
        { reason: "Faringoamigdalitis", category: "común", priority: 88, tags: ["garganta", "amígdalas", "dolor"] },
        { reason: "Infección urinaria en niños", category: "diagnóstico", priority: 87, tags: ["orina", "ardor", "frecuencia"] },
        { reason: "Varicela", category: "diagnóstico", priority: 85, tags: ["ampulas", "erupción", "picazón"] },
        { reason: "Mononucleosis infecciosa", category: "diagnóstico", priority: 84, tags: ["mono", "fatiga", "ganglios"] },
        { reason: "Enfermedad de manos, pies y boca", category: "diagnóstico", priority: 83, tags: ["vesículas", "úlceras", "herpangina"] },
        { reason: "Parasitosis intestinal", category: "común", priority: 82, tags: ["parásitos", "lombrices", "prurito"] },
        { reason: "Dengue (sospecha)", category: "urgencia", priority: 95, tags: ["fiebre", "dolor", "mosquito"] },
        { reason: "COVID-19 pediátrico", category: "diagnóstico", priority: 90, tags: ["covid", "coronavirus", "respiratorio"] },
        { reason: "Neumonía adquirida en comunidad", category: "urgencia", priority: 93, tags: ["pulmón", "tos", "dificultad respiratoria"] },
        { reason: "Escarlatina", category: "diagnóstico", priority: 80, tags: ["erupción", "lengua frambuesa", "streptococo"] },
        { reason: "Conjuntivitis infecciosa", category: "común", priority: 78, tags: ["ojo rojo", "secreción", "lagañas"] },
        { reason: "Laringitis aguda (Croup)", category: "urgencia", priority: 88, tags: ["tos perruna", "estridor", "ronquera"] },
        { reason: "Control post-infección", category: "seguimiento", priority: 75, tags: ["seguimiento", "control", "recuperación"] },
        { reason: "Vacunación", category: "preventivo", priority: 85, tags: ["vacuna", "inmunización", "dosis"] },
        { reason: "Consulta pre-viaje", category: "preventivo", priority: 70, tags: ["viaje", "vacunas", "prevención"] },
        { reason: "Exantema súbito (Roséola)", category: "diagnóstico", priority: 76, tags: ["erupción", "fiebre", "bebé"] },
        { reason: "Impétigo", category: "común", priority: 74, tags: ["piel", "costras", "infección"] },
        { reason: "Celulitis infecciosa", category: "urgencia", priority: 86, tags: ["piel", "hinchazón", "calor"] },
        { reason: "Absceso cutáneo", category: "urgencia", priority: 84, tags: ["pus", "hinchazón", "dolor"] },
    ],

    // ========================================================================
    // PEDIATRÍA GENERAL
    // ========================================================================
    "Pediatría": [
        { reason: "Control de niño sano", category: "preventivo", priority: 100, tags: ["control", "crecimiento", "desarrollo"] },
        { reason: "Evaluación de crecimiento y desarrollo", category: "preventivo", priority: 98, tags: ["peso", "talla", "percentiles"] },
        { reason: "Vacunación", category: "preventivo", priority: 97, tags: ["vacuna", "inmunización", "esquema"] },
        { reason: "Fiebre en niños", category: "común", priority: 95, tags: ["fiebre", "temperatura", "calentura"] },
        { reason: "Tos en niños", category: "común", priority: 92, tags: ["tos", "flema", "resfriado"] },
        { reason: "Diarrea infantil", category: "común", priority: 90, tags: ["diarrea", "evacuaciones", "deshidratación"] },
        { reason: "Vómitos en niños", category: "común", priority: 88, tags: ["vómito", "náuseas", "intolerancia"] },
        { reason: "Cólicos del lactante", category: "común", priority: 86, tags: ["llanto", "gases", "bebé"] },
        { reason: "Dermatitis del pañal", category: "común", priority: 84, tags: ["rozadura", "pañal", "irritación"] },
        { reason: "Reflujo gastroesofágico en bebés", category: "común", priority: 82, tags: ["reflujo", "regurgitación", "lactante"] },
        { reason: "Problemas de alimentación", category: "diagnóstico", priority: 80, tags: ["apetito", "rechazo", "peso"] },
        { reason: "Problemas de sueño en niños", category: "diagnóstico", priority: 78, tags: ["insomnio", "despertar", "pesadillas"] },
        { reason: "Estreñimiento infantil", category: "común", priority: 76, tags: ["estreñimiento", "evacuaciones", "duro"] },
        { reason: "Dolor de barriga en niños", category: "común", priority: 85, tags: ["abdomen", "cólico", "dolor"] },
        { reason: "Resfriado común", category: "común", priority: 90, tags: ["moco", "congestión", "estornudos"] },
        { reason: "Hiperactividad / TDAH", category: "diagnóstico", priority: 70, tags: ["atención", "conducta", "concentración"] },
        { reason: "Problemas de aprendizaje", category: "diagnóstico", priority: 68, tags: ["escuela", "lectura", "matemáticas"] },
        { reason: "Examen físico escolar", category: "preventivo", priority: 75, tags: ["certificado", "escuela", "deportes"] },
        { reason: "Anemia en niños", category: "diagnóstico", priority: 72, tags: ["palidez", "cansancio", "hierro"] },
        { reason: "Alergia alimentaria", category: "diagnóstico", priority: 74, tags: ["alergia", "leche", "huevo"] },
    ],

    // ========================================================================
    // MEDICINA INTERNA
    // ========================================================================
    "Medicina Interna": [
        { reason: "Chequeo general (Check-up)", category: "preventivo", priority: 100, tags: ["revisión", "anual", "exámenes"] },
        { reason: "Control de diabetes", category: "seguimiento", priority: 98, tags: ["glucosa", "azúcar", "insulina"] },
        { reason: "Control de hipertensión", category: "seguimiento", priority: 97, tags: ["presión", "tensión", "antihipertensivo"] },
        { reason: "Fatiga crónica / Cansancio", category: "diagnóstico", priority: 92, tags: ["fatiga", "debilidad", "energía"] },
        { reason: "Dolor de cabeza persistente", category: "diagnóstico", priority: 90, tags: ["cefalea", "migraña", "cabeza"] },
        { reason: "Dolor torácico (no cardíaco)", category: "diagnóstico", priority: 88, tags: ["pecho", "dolor", "malestar"] },
        { reason: "Fiebre de origen desconocido", category: "diagnóstico", priority: 86, tags: ["fiebre", "temperatura", "causa"] },
        { reason: "Pérdida de peso involuntaria", category: "diagnóstico", priority: 85, tags: ["peso", "adelgazamiento", "apetito"] },
        { reason: "Dislipidemia (Colesterol alto)", category: "seguimiento", priority: 84, tags: ["colesterol", "triglicéridos", "grasa"] },
        { reason: "Anemia", category: "diagnóstico", priority: 82, tags: ["anemia", "hierro", "palidez"] },
        { reason: "Infección de vías urinarias", category: "común", priority: 80, tags: ["orina", "ardor", "frecuencia"] },
        { reason: "Síndrome metabólico", category: "diagnóstico", priority: 78, tags: ["obesidad", "glucosa", "presión"] },
        { reason: "Reflujo gastroesofágico", category: "común", priority: 76, tags: ["acidez", "reflujo", "estómago"] },
        { reason: "Hipotiroidismo", category: "seguimiento", priority: 74, tags: ["tiroides", "hormona", "cansancio"] },
        { reason: "Osteoporosis", category: "diagnóstico", priority: 72, tags: ["huesos", "densidad", "calcio"] },
        { reason: "Gota", category: "diagnóstico", priority: 70, tags: ["ácido úrico", "articulación", "dolor"] },
        { reason: "Evaluación preoperatoria", category: "preventivo", priority: 85, tags: ["cirugía", "riesgo", "exámenes"] },
        { reason: "Revisión de exámenes de laboratorio", category: "seguimiento", priority: 80, tags: ["resultados", "laboratorio", "análisis"] },
        { reason: "Segunda opinión médica", category: "diagnóstico", priority: 65, tags: ["opinión", "consulta", "diagnóstico"] },
        { reason: "Renovación de recetas", category: "seguimiento", priority: 75, tags: ["receta", "medicamentos", "renovar"] },
    ],

    // ========================================================================
    // CARDIOLOGÍA
    // ========================================================================
    "Cardiología": [
        { reason: "Dolor torácico (precordial)", category: "urgencia", priority: 100, tags: ["pecho", "angina", "opresión"] },
        { reason: "Palpitaciones cardíacas", category: "diagnóstico", priority: 98, tags: ["palpitaciones", "latidos", "taquicardia"] },
        { reason: "Control de hipertensión arterial", category: "seguimiento", priority: 96, tags: ["presión", "tensión", "HTA"] },
        { reason: "Falta de aire (disnea)", category: "urgencia", priority: 95, tags: ["respirar", "ahogo", "esfuerzo"] },
        { reason: "Electrocardiograma de control", category: "preventivo", priority: 90, tags: ["ECG", "EKG", "corazón"] },
        { reason: "Arritmia cardíaca", category: "diagnóstico", priority: 92, tags: ["arritmia", "irregular", "fibrilación"] },
        { reason: "Insuficiencia cardíaca", category: "seguimiento", priority: 94, tags: ["corazón", "hinchazón", "retención"] },
        { reason: "Síncope (desmayo)", category: "diagnóstico", priority: 88, tags: ["desmayo", "pérdida", "consciencia"] },
        { reason: "Soplo cardíaco", category: "diagnóstico", priority: 85, tags: ["soplo", "válvula", "auscultación"] },
        { reason: "Hinchazón de piernas (edema)", category: "diagnóstico", priority: 82, tags: ["edema", "hinchazón", "piernas"] },
        { reason: "Evaluación de riesgo cardiovascular", category: "preventivo", priority: 86, tags: ["riesgo", "prevención", "factores"] },
        { reason: "Control post-infarto", category: "seguimiento", priority: 93, tags: ["infarto", "seguimiento", "rehabilitación"] },
        { reason: "Control de marcapasos", category: "seguimiento", priority: 88, tags: ["marcapasos", "dispositivo", "control"] },
        { reason: "Ecocardiograma de control", category: "preventivo", priority: 84, tags: ["eco", "ultrasonido", "corazón"] },
        { reason: "Holter de 24 horas", category: "diagnóstico", priority: 80, tags: ["holter", "monitoreo", "arritmia"] },
        { reason: "Prueba de esfuerzo", category: "diagnóstico", priority: 82, tags: ["ergometría", "esfuerzo", "ejercicio"] },
        { reason: "Varices dolorosas", category: "diagnóstico", priority: 70, tags: ["varices", "venas", "piernas"] },
        { reason: "Evaluación pre-cirugía cardíaca", category: "preventivo", priority: 85, tags: ["cirugía", "preoperatorio", "riesgo"] },
        { reason: "Fibrilación auricular", category: "seguimiento", priority: 90, tags: ["FA", "fibrilación", "anticoagulante"] },
        { reason: "Colesterol elevado", category: "seguimiento", priority: 78, tags: ["colesterol", "estatinas", "lípidos"] },
    ],

    // ========================================================================
    // DERMATOLOGÍA
    // ========================================================================
    "Dermatología": [
        { reason: "Acné", category: "común", priority: 100, tags: ["espinillas", "granos", "cara"] },
        { reason: "Manchas en la piel", category: "diagnóstico", priority: 98, tags: ["manchas", "pigmentación", "melasma"] },
        { reason: "Revisión de lunares", category: "preventivo", priority: 96, tags: ["lunares", "nevos", "melanoma"] },
        { reason: "Dermatitis atópica", category: "común", priority: 94, tags: ["eczema", "picazón", "resequedad"] },
        { reason: "Psoriasis", category: "seguimiento", priority: 92, tags: ["placas", "escamas", "codos"] },
        { reason: "Alopecia (caída de cabello)", category: "diagnóstico", priority: 90, tags: ["cabello", "calvicie", "caída"] },
        { reason: "Urticaria (ronchas)", category: "común", priority: 88, tags: ["ronchas", "alergia", "picazón"] },
        { reason: "Hongos en la piel", category: "común", priority: 86, tags: ["micosis", "tiña", "hongos"] },
        { reason: "Hongos en las uñas", category: "común", priority: 84, tags: ["onicomicosis", "uña", "hongos"] },
        { reason: "Verrugas", category: "común", priority: 82, tags: ["verruga", "VPH", "mezquino"] },
        { reason: "Herpes (labial o genital)", category: "diagnóstico", priority: 80, tags: ["herpes", "vesículas", "ampolla"] },
        { reason: "Rosácea", category: "diagnóstico", priority: 78, tags: ["rojez", "cara", "vasos"] },
        { reason: "Vitiligo", category: "diagnóstico", priority: 76, tags: ["despigmentación", "manchas blancas", "melanina"] },
        { reason: "Quemadura solar", category: "urgencia", priority: 74, tags: ["sol", "quemadura", "eritema"] },
        { reason: "Mordedura o picadura de insecto", category: "urgencia", priority: 72, tags: ["picadura", "mordedura", "hinchazón"] },
        { reason: "Celulitis infecciosa", category: "urgencia", priority: 85, tags: ["infección", "piel", "hinchazón"] },
        { reason: "Tratamiento estético (botox, rellenos)", category: "preventivo", priority: 70, tags: ["estética", "botox", "arrugas"] },
        { reason: "Cicatrices (queloides)", category: "diagnóstico", priority: 68, tags: ["cicatriz", "queloide", "tratamiento"] },
        { reason: "Dermatitis seborreica", category: "común", priority: 75, tags: ["caspa", "grasa", "cuero cabelludo"] },
        { reason: "Revisión anual de piel", category: "preventivo", priority: 85, tags: ["screening", "prevención", "cáncer"] },
    ],

    // ========================================================================
    // GINECOLOGÍA
    // ========================================================================
    "Ginecología": [
        { reason: "Control ginecológico anual", category: "preventivo", priority: 100, tags: ["revisión", "anual", "papanicolau"] },
        { reason: "Papanicolau (citología)", category: "preventivo", priority: 98, tags: ["pap", "citología", "cuello uterino"] },
        { reason: "Dolor menstrual intenso", category: "común", priority: 95, tags: ["dismenorrea", "cólicos", "menstruación"] },
        { reason: "Menstruación irregular", category: "diagnóstico", priority: 92, tags: ["irregularidad", "ciclo", "periodo"] },
        { reason: "Flujo vaginal anormal", category: "diagnóstico", priority: 90, tags: ["flujo", "secreción", "infección"] },
        { reason: "Infección vaginal", category: "común", priority: 88, tags: ["candidiasis", "vaginosis", "picazón"] },
        { reason: "Planificación familiar", category: "preventivo", priority: 86, tags: ["anticonceptivos", "DIU", "implante"] },
        { reason: "Control de embarazo", category: "preventivo", priority: 100, tags: ["prenatal", "embarazo", "control"] },
        { reason: "Sospecha de embarazo", category: "diagnóstico", priority: 95, tags: ["embarazo", "atraso", "prueba"] },
        { reason: "Síntomas de menopausia", category: "diagnóstico", priority: 82, tags: ["sofocos", "menopausia", "climaterio"] },
        { reason: "Dolor pélvico", category: "diagnóstico", priority: 85, tags: ["pelvis", "dolor", "ovario"] },
        { reason: "Sangrado intermenstrual", category: "diagnóstico", priority: 84, tags: ["sangrado", "spotting", "irregular"] },
        { reason: "Quiste ovárico", category: "seguimiento", priority: 80, tags: ["quiste", "ovario", "ultrasonido"] },
        { reason: "Endometriosis", category: "seguimiento", priority: 78, tags: ["endometriosis", "dolor", "infertilidad"] },
        { reason: "Infertilidad", category: "diagnóstico", priority: 82, tags: ["fertilidad", "embarazo", "ovulación"] },
        { reason: "Mastitis", category: "urgencia", priority: 88, tags: ["seno", "lactancia", "infección"] },
        { reason: "Bulto en seno", category: "urgencia", priority: 90, tags: ["mama", "nódulo", "bulto"] },
        { reason: "Control post-parto", category: "preventivo", priority: 85, tags: ["posparto", "cuarentena", "recuperación"] },
        { reason: "Síndrome premenstrual", category: "diagnóstico", priority: 75, tags: ["SPM", "humor", "retención"] },
        { reason: "Ecografía ginecológica", category: "diagnóstico", priority: 78, tags: ["eco", "ultrasonido", "útero"] },
    ],

    // ========================================================================
    // TRAUMATOLOGÍA / ORTOPEDIA
    // ========================================================================
    "Traumatología": [
        { reason: "Dolor de espalda (lumbalgia)", category: "común", priority: 100, tags: ["espalda", "lumbar", "ciática"] },
        { reason: "Dolor de rodilla", category: "común", priority: 98, tags: ["rodilla", "menisco", "ligamento"] },
        { reason: "Dolor de hombro", category: "común", priority: 96, tags: ["hombro", "manguito", "rotador"] },
        { reason: "Esguince de tobillo", category: "urgencia", priority: 94, tags: ["tobillo", "torcedura", "ligamento"] },
        { reason: "Fractura (sospecha)", category: "urgencia", priority: 100, tags: ["fractura", "hueso", "caída"] },
        { reason: "Dolor de cuello (cervicalgia)", category: "común", priority: 90, tags: ["cuello", "cervical", "rigidez"] },
        { reason: "Síndrome del túnel carpiano", category: "diagnóstico", priority: 88, tags: ["muñeca", "hormigueo", "mano"] },
        { reason: "Tendinitis", category: "común", priority: 86, tags: ["tendón", "inflamación", "dolor"] },
        { reason: "Artritis / Artrosis", category: "seguimiento", priority: 84, tags: ["articulación", "desgaste", "dolor"] },
        { reason: "Hernia de disco", category: "diagnóstico", priority: 82, tags: ["disco", "columna", "ciática"] },
        { reason: "Lesión deportiva", category: "urgencia", priority: 90, tags: ["deporte", "lesión", "músculo"] },
        { reason: "Fascitis plantar", category: "diagnóstico", priority: 80, tags: ["talón", "planta", "dolor"] },
        { reason: "Control post-cirugía", category: "seguimiento", priority: 85, tags: ["cirugía", "recuperación", "prótesis"] },
        { reason: "Rehabilitación física", category: "seguimiento", priority: 82, tags: ["fisioterapia", "ejercicios", "recuperación"] },
        { reason: "Dolor de cadera", category: "común", priority: 78, tags: ["cadera", "coxalgia", "prótesis"] },
        { reason: "Escoliosis", category: "diagnóstico", priority: 76, tags: ["columna", "curva", "espalda"] },
        { reason: "Epicondilitis (codo de tenista)", category: "diagnóstico", priority: 74, tags: ["codo", "tenista", "dolor"] },
        { reason: "Luxación", category: "urgencia", priority: 92, tags: ["articulación", "desplazamiento", "hombro"] },
        { reason: "Osteoporosis", category: "seguimiento", priority: 75, tags: ["hueso", "densidad", "calcio"] },
        { reason: "Evaluación para prótesis", category: "diagnóstico", priority: 70, tags: ["prótesis", "reemplazo", "articulación"] },
    ],

    // ========================================================================
    // NEUROLOGÍA
    // ========================================================================
    "Neurología": [
        { reason: "Dolor de cabeza crónico (cefalea)", category: "diagnóstico", priority: 100, tags: ["cefalea", "migraña", "cabeza"] },
        { reason: "Migraña con aura", category: "diagnóstico", priority: 98, tags: ["migraña", "aura", "visual"] },
        { reason: "Mareos / Vértigo", category: "diagnóstico", priority: 96, tags: ["vértigo", "mareo", "equilibrio"] },
        { reason: "Hormigueo en extremidades", category: "diagnóstico", priority: 94, tags: ["parestesia", "hormigueo", "adormecimiento"] },
        { reason: "Pérdida de memoria", category: "diagnóstico", priority: 92, tags: ["memoria", "olvidos", "demencia"] },
        { reason: "Temblor en manos", category: "diagnóstico", priority: 90, tags: ["temblor", "parkinson", "manos"] },
        { reason: "Convulsiones / Epilepsia", category: "seguimiento", priority: 95, tags: ["convulsión", "epilepsia", "crisis"] },
        { reason: "Parálisis facial", category: "urgencia", priority: 88, tags: ["cara", "parálisis", "Bell"] },
        { reason: "Trastornos del sueño", category: "diagnóstico", priority: 85, tags: ["insomnio", "sueño", "apnea"] },
        { reason: "Debilidad muscular", category: "diagnóstico", priority: 82, tags: ["debilidad", "fuerza", "músculo"] },
        { reason: "Neuropatía diabética", category: "seguimiento", priority: 80, tags: ["diabetes", "nervio", "pie"] },
        { reason: "Parkinson", category: "seguimiento", priority: 88, tags: ["parkinson", "temblor", "movimiento"] },
        { reason: "Esclerosis múltiple", category: "seguimiento", priority: 86, tags: ["EM", "esclerosis", "neural"] },
        { reason: "Neuralgia del trigémino", category: "diagnóstico", priority: 78, tags: ["dolor facial", "trigémino", "cara"] },
        { reason: "ACV / Derrame cerebral (seguimiento)", category: "seguimiento", priority: 92, tags: ["ACV", "derrame", "rehabilitación"] },
        { reason: "Electroencefalograma (EEG)", category: "diagnóstico", priority: 75, tags: ["EEG", "cerebro", "actividad"] },
        { reason: "Demencia / Alzheimer", category: "seguimiento", priority: 84, tags: ["alzheimer", "demencia", "cognitivo"] },
        { reason: "Túnel carpiano (neurológico)", category: "diagnóstico", priority: 72, tags: ["carpal", "nervio", "mano"] },
        { reason: "Tics nerviosos", category: "diagnóstico", priority: 70, tags: ["tics", "movimiento", "involuntario"] },
        { reason: "Fibromialgia", category: "diagnóstico", priority: 76, tags: ["dolor", "fatiga", "muscular"] },
    ],

    // ========================================================================
    // OFTALMOLOGÍA
    // ========================================================================
    "Oftalmología": [
        { reason: "Examen de la vista", category: "preventivo", priority: 100, tags: ["lentes", "visión", "refracción"] },
        { reason: "Visión borrosa", category: "diagnóstico", priority: 98, tags: ["borroso", "visión", "lentes"] },
        { reason: "Ojo rojo / Conjuntivitis", category: "común", priority: 96, tags: ["conjuntivitis", "rojo", "infección"] },
        { reason: "Ojo seco", category: "común", priority: 94, tags: ["sequedad", "lágrimas", "ardor"] },
        { reason: "Dolor ocular", category: "urgencia", priority: 92, tags: ["dolor", "ojo", "molestia"] },
        { reason: "Moscas volantes / Destellos", category: "urgencia", priority: 90, tags: ["moscas", "flotadores", "destellos"] },
        { reason: "Glaucoma (control)", category: "seguimiento", priority: 88, tags: ["glaucoma", "presión", "nervio"] },
        { reason: "Cataratas", category: "diagnóstico", priority: 86, tags: ["catarata", "opacidad", "lente"] },
        { reason: "Revisión de retina", category: "preventivo", priority: 84, tags: ["retina", "fondo", "diabético"] },
        { reason: "Orzuelo / Chalazión", category: "común", priority: 82, tags: ["orzuelo", "párpado", "bolita"] },
        { reason: "Lagrimeo excesivo", category: "diagnóstico", priority: 80, tags: ["lágrimas", "conducto", "obstrucción"] },
        { reason: "Blefaritis", category: "común", priority: 78, tags: ["párpados", "costras", "irritación"] },
        { reason: "Medida de lentes", category: "preventivo", priority: 85, tags: ["graduación", "lentes", "anteojos"] },
        { reason: "Control post-cirugía LASIK", category: "seguimiento", priority: 82, tags: ["lasik", "láser", "recuperación"] },
        { reason: "Estrabismo", category: "diagnóstico", priority: 76, tags: ["bizco", "alineación", "ojos"] },
        { reason: "Pterigión / Carnosidad", category: "diagnóstico", priority: 74, tags: ["carnosidad", "pterigión", "crece"] },
        { reason: "Retinopatía diabética", category: "seguimiento", priority: 88, tags: ["diabetes", "retina", "fondo"] },
        { reason: "Degeneración macular", category: "seguimiento", priority: 85, tags: ["mácula", "visión central", "edad"] },
        { reason: "Cuerpo extraño en ojo", category: "urgencia", priority: 90, tags: ["basura", "ojo", "molestia"] },
        { reason: "Control de lentes de contacto", category: "preventivo", priority: 72, tags: ["contacto", "lentes", "adaptación"] },
    ],

    // ========================================================================
    // PSIQUIATRÍA / PSICOLOGÍA
    // ========================================================================
    "Psiquiatría": [
        { reason: "Ansiedad generalizada", category: "diagnóstico", priority: 100, tags: ["ansiedad", "nervios", "preocupación"] },
        { reason: "Depresión", category: "diagnóstico", priority: 98, tags: ["depresión", "tristeza", "ánimo"] },
        { reason: "Ataques de pánico", category: "urgencia", priority: 96, tags: ["pánico", "crisis", "ansiedad"] },
        { reason: "Insomnio crónico", category: "diagnóstico", priority: 94, tags: ["insomnio", "dormir", "sueño"] },
        { reason: "Trastorno bipolar (control)", category: "seguimiento", priority: 92, tags: ["bipolar", "humor", "manía"] },
        { reason: "TDAH en adultos", category: "diagnóstico", priority: 88, tags: ["atención", "concentración", "hiperactividad"] },
        { reason: "Estrés laboral / Burnout", category: "diagnóstico", priority: 90, tags: ["estrés", "trabajo", "agotamiento"] },
        { reason: "Duelo patológico", category: "diagnóstico", priority: 85, tags: ["duelo", "pérdida", "muerte"] },
        { reason: "Trastorno obsesivo-compulsivo", category: "diagnóstico", priority: 82, tags: ["TOC", "obsesión", "compulsión"] },
        { reason: "Fobias", category: "diagnóstico", priority: 80, tags: ["fobia", "miedo", "evitación"] },
        { reason: "Trastorno de estrés postraumático", category: "diagnóstico", priority: 86, tags: ["trauma", "TEPT", "flashbacks"] },
        { reason: "Problemas de pareja / familia", category: "común", priority: 78, tags: ["pareja", "conflicto", "comunicación"] },
        { reason: "Adicciones", category: "diagnóstico", priority: 84, tags: ["adicción", "drogas", "alcohol"] },
        { reason: "Trastornos alimentarios", category: "diagnóstico", priority: 82, tags: ["anorexia", "bulimia", "alimentación"] },
        { reason: "Esquizofrenia (control)", category: "seguimiento", priority: 88, tags: ["esquizofrenia", "psicosis", "alucinaciones"] },
        { reason: "Ajuste de medicación", category: "seguimiento", priority: 85, tags: ["medicación", "efectos", "dosis"] },
        { reason: "Terapia psicológica", category: "preventivo", priority: 75, tags: ["terapia", "psicoterapia", "sesión"] },
        { reason: "Crisis emocional", category: "urgencia", priority: 92, tags: ["crisis", "emergencia", "apoyo"] },
        { reason: "Irritabilidad / Cambios de humor", category: "diagnóstico", priority: 76, tags: ["irritable", "humor", "enojo"] },
        { reason: "Autoestima baja", category: "diagnóstico", priority: 72, tags: ["autoestima", "valor", "inseguridad"] },
    ],

    // ========================================================================
    // OTORRINOLARINGOLOGÍA
    // ========================================================================
    "Otorrinolaringología": [
        { reason: "Dolor de garganta persistente", category: "común", priority: 100, tags: ["garganta", "dolor", "amígdalas"] },
        { reason: "Dolor de oído (otalgia)", category: "común", priority: 98, tags: ["oído", "dolor", "infección"] },
        { reason: "Pérdida de audición", category: "diagnóstico", priority: 96, tags: ["sordera", "audición", "hipoacusia"] },
        { reason: "Zumbido en oídos (tinnitus)", category: "diagnóstico", priority: 94, tags: ["zumbido", "tinnitus", "acúfeno"] },
        { reason: "Congestión nasal crónica", category: "común", priority: 92, tags: ["nariz", "congestión", "tapada"] },
        { reason: "Sinusitis", category: "común", priority: 90, tags: ["senos", "sinusitis", "presión"] },
        { reason: "Ronquidos / Apnea del sueño", category: "diagnóstico", priority: 88, tags: ["ronquido", "apnea", "dormir"] },
        { reason: "Vértigo / Mareos", category: "diagnóstico", priority: 86, tags: ["vértigo", "mareo", "equilibrio"] },
        { reason: "Sangrado nasal (epistaxis)", category: "común", priority: 84, tags: ["sangrado", "nariz", "epistaxis"] },
        { reason: "Tapón de cerumen", category: "común", priority: 82, tags: ["cerumen", "cera", "oído"] },
        { reason: "Amigdalitis recurrente", category: "diagnóstico", priority: 80, tags: ["amígdalas", "infección", "operación"] },
        { reason: "Rinitis alérgica", category: "común", priority: 85, tags: ["alergia", "estornudos", "nariz"] },
        { reason: "Desviación de tabique", category: "diagnóstico", priority: 78, tags: ["tabique", "nariz", "desviado"] },
        { reason: "Laringitis / Ronquera", category: "común", priority: 76, tags: ["voz", "ronquera", "laringe"] },
        { reason: "Pólipos nasales", category: "diagnóstico", priority: 74, tags: ["pólipos", "nariz", "obstrucción"] },
        { reason: "Otitis media recurrente", category: "seguimiento", priority: 80, tags: ["otitis", "oído", "niños"] },
        { reason: "Audiometría", category: "preventivo", priority: 75, tags: ["audiometría", "examen", "audición"] },
        { reason: "Faringitis crónica", category: "diagnóstico", priority: 72, tags: ["faringe", "garganta", "irritación"] },
        { reason: "Cuerpo extraño (oído/nariz)", category: "urgencia", priority: 85, tags: ["objeto", "atascado", "extraño"] },
        { reason: "Control post-cirugía", category: "seguimiento", priority: 78, tags: ["cirugía", "recuperación", "control"] },
    ],

    // ========================================================================
    // GASTROENTEROLOGÍA
    // ========================================================================
    "Gastroenterología": [
        { reason: "Dolor abdominal crónico", category: "diagnóstico", priority: 100, tags: ["abdomen", "barriga", "dolor"] },
        { reason: "Reflujo gastroesofágico (ERGE)", category: "común", priority: 98, tags: ["reflujo", "acidez", "quemazón"] },
        { reason: "Gastritis", category: "común", priority: 96, tags: ["estómago", "gastritis", "ardor"] },
        { reason: "Colon irritable", category: "diagnóstico", priority: 94, tags: ["colon", "irritable", "gases"] },
        { reason: "Estreñimiento crónico", category: "común", priority: 92, tags: ["estreñimiento", "evacuación", "duro"] },
        { reason: "Diarrea crónica", category: "diagnóstico", priority: 90, tags: ["diarrea", "evacuaciones", "frecuente"] },
        { reason: "Sangrado rectal", category: "urgencia", priority: 95, tags: ["sangre", "recto", "evacuación"] },
        { reason: "Hemorroides", category: "común", priority: 85, tags: ["hemorroides", "almorranas", "dolor"] },
        { reason: "Hepatitis (control)", category: "seguimiento", priority: 88, tags: ["hígado", "hepatitis", "viral"] },
        { reason: "Hígado graso", category: "diagnóstico", priority: 86, tags: ["hígado", "graso", "esteatosis"] },
        { reason: "Úlcera péptica", category: "diagnóstico", priority: 84, tags: ["úlcera", "estómago", "helicobacter"] },
        { reason: "Endoscopia digestiva", category: "diagnóstico", priority: 82, tags: ["endoscopia", "cámara", "estómago"] },
        { reason: "Colonoscopia", category: "preventivo", priority: 88, tags: ["colonoscopia", "colon", "screening"] },
        { reason: "Cálculos biliares", category: "diagnóstico", priority: 80, tags: ["vesícula", "piedras", "cólico"] },
        { reason: "Pancreatitis (seguimiento)", category: "seguimiento", priority: 85, tags: ["páncreas", "inflamación", "dolor"] },
        { reason: "Enfermedad celíaca", category: "diagnóstico", priority: 78, tags: ["gluten", "celíaco", "intestino"] },
        { reason: "Enfermedad de Crohn", category: "seguimiento", priority: 82, tags: ["crohn", "intestino", "inflamación"] },
        { reason: "Colitis ulcerosa", category: "seguimiento", priority: 80, tags: ["colitis", "ulcera", "sangrado"] },
        { reason: "Náuseas y vómitos recurrentes", category: "diagnóstico", priority: 76, tags: ["náuseas", "vómito", "frecuente"] },
        { reason: "Pérdida de peso inexplicable", category: "diagnóstico", priority: 85, tags: ["peso", "adelgazamiento", "apetito"] },
    ],

    // ========================================================================
    // ENDOCRINOLOGÍA
    // ========================================================================
    "Endocrinología": [
        { reason: "Control de diabetes mellitus", category: "seguimiento", priority: 100, tags: ["diabetes", "glucosa", "insulina"] },
        { reason: "Hipotiroidismo", category: "seguimiento", priority: 98, tags: ["tiroides", "hipotiroidismo", "levotiroxina"] },
        { reason: "Hipertiroidismo", category: "seguimiento", priority: 96, tags: ["tiroides", "hipertiroidismo", "taquicardia"] },
        { reason: "Nódulo tiroideo", category: "diagnóstico", priority: 94, tags: ["nódulo", "tiroides", "bulto"] },
        { reason: "Obesidad / Sobrepeso", category: "diagnóstico", priority: 92, tags: ["obesidad", "peso", "metabolismo"] },
        { reason: "Síndrome metabólico", category: "diagnóstico", priority: 90, tags: ["metabólico", "resistencia", "insulina"] },
        { reason: "Dislipidemia (colesterol/triglicéridos)", category: "seguimiento", priority: 88, tags: ["colesterol", "triglicéridos", "lípidos"] },
        { reason: "Osteoporosis", category: "seguimiento", priority: 86, tags: ["huesos", "densidad", "calcio"] },
        { reason: "Diabetes gestacional", category: "seguimiento", priority: 92, tags: ["embarazo", "diabetes", "glucosa"] },
        { reason: "Síndrome de ovario poliquístico", category: "diagnóstico", priority: 84, tags: ["SOP", "ovario", "hormonal"] },
        { reason: "Menopausia / Terapia hormonal", category: "seguimiento", priority: 82, tags: ["menopausia", "hormonas", "sofocos"] },
        { reason: "Hirsutismo (exceso de vello)", category: "diagnóstico", priority: 78, tags: ["vello", "andrógenos", "hormonal"] },
        { reason: "Hipoglucemia recurrente", category: "diagnóstico", priority: 85, tags: ["bajo", "azúcar", "desmayo"] },
        { reason: "Bocio", category: "diagnóstico", priority: 80, tags: ["bocio", "tiroides", "cuello"] },
        { reason: "Prolactinoma", category: "seguimiento", priority: 76, tags: ["prolactina", "pituitaria", "hormona"] },
        { reason: "Insuficiencia suprarrenal", category: "seguimiento", priority: 82, tags: ["adrenal", "cortisol", "fatiga"] },
        { reason: "Ginecomastia", category: "diagnóstico", priority: 74, tags: ["senos", "hombre", "hormonal"] },
        { reason: "Pubertad precoz/tardía", category: "diagnóstico", priority: 78, tags: ["pubertad", "desarrollo", "hormonal"] },
        { reason: "Infertilidad (hormonal)", category: "diagnóstico", priority: 80, tags: ["fertilidad", "hormonas", "ovulación"] },
        { reason: "Evaluación de crecimiento", category: "diagnóstico", priority: 75, tags: ["crecimiento", "estatura", "hormona"] },
    ],

    // ========================================================================
    // UROLOGÍA
    // ========================================================================
    "Urología": [
        { reason: "Infección urinaria recurrente", category: "diagnóstico", priority: 100, tags: ["orina", "infección", "cistitis"] },
        { reason: "Dolor al orinar (disuria)", category: "común", priority: 98, tags: ["ardor", "orina", "molestia"] },
        { reason: "Sangre en la orina (hematuria)", category: "urgencia", priority: 96, tags: ["sangre", "orina", "rojo"] },
        { reason: "Cálculos renales", category: "diagnóstico", priority: 94, tags: ["piedra", "riñón", "cólico"] },
        { reason: "Problemas de próstata", category: "diagnóstico", priority: 92, tags: ["próstata", "PSA", "agrandamiento"] },
        { reason: "Dificultad para orinar", category: "diagnóstico", priority: 90, tags: ["micción", "chorro", "débil"] },
        { reason: "Incontinencia urinaria", category: "diagnóstico", priority: 88, tags: ["incontinencia", "escape", "control"] },
        { reason: "Disfunción eréctil", category: "diagnóstico", priority: 86, tags: ["erección", "impotencia", "sexual"] },
        { reason: "Eyaculación precoz", category: "diagnóstico", priority: 84, tags: ["eyaculación", "precoz", "sexual"] },
        { reason: "Varicocele", category: "diagnóstico", priority: 82, tags: ["varicocele", "testículo", "venas"] },
        { reason: "Hidrocele", category: "diagnóstico", priority: 80, tags: ["hidrocele", "escroto", "líquido"] },
        { reason: "Dolor testicular", category: "urgencia", priority: 92, tags: ["testículo", "dolor", "hinchazón"] },
        { reason: "Fimosis", category: "diagnóstico", priority: 78, tags: ["prepucio", "fimosis", "circuncisión"] },
        { reason: "Nocturia (orinar de noche)", category: "diagnóstico", priority: 76, tags: ["noche", "orinar", "frecuencia"] },
        { reason: "Control de PSA", category: "preventivo", priority: 85, tags: ["PSA", "próstata", "screening"] },
        { reason: "Vasectomía (consulta)", category: "preventivo", priority: 72, tags: ["vasectomía", "esterilización", "planificación"] },
        { reason: "Infertilidad masculina", category: "diagnóstico", priority: 80, tags: ["fertilidad", "espermograma", "esperma"] },
        { reason: "Prostatitis", category: "común", priority: 84, tags: ["próstata", "inflamación", "dolor"] },
        { reason: "Revisión urológica anual", category: "preventivo", priority: 75, tags: ["control", "anual", "prevención"] },
        { reason: "Cistoscopia", category: "diagnóstico", priority: 78, tags: ["vejiga", "cámara", "examen"] },
    ],

    // ========================================================================
    // NEUMOLOGÍA
    // ========================================================================
    "Neumología": [
        { reason: "Tos crónica", category: "diagnóstico", priority: 100, tags: ["tos", "persistente", "crónica"] },
        { reason: "Dificultad para respirar (disnea)", category: "urgencia", priority: 98, tags: ["respirar", "ahogo", "falta aire"] },
        { reason: "Asma bronquial", category: "seguimiento", priority: 96, tags: ["asma", "bronquios", "inhalador"] },
        { reason: "EPOC (Enfermedad Pulmonar)", category: "seguimiento", priority: 94, tags: ["EPOC", "pulmón", "fumador"] },
        { reason: "Apnea del sueño", category: "diagnóstico", priority: 92, tags: ["apnea", "ronquido", "CPAP"] },
        { reason: "Bronquitis crónica", category: "seguimiento", priority: 90, tags: ["bronquitis", "flema", "tos"] },
        { reason: "Neumonía", category: "urgencia", priority: 95, tags: ["neumonía", "pulmón", "infección"] },
        { reason: "Sibilancias (silbido al respirar)", category: "diagnóstico", priority: 88, tags: ["silbido", "pecho", "respirar"] },
        { reason: "Espirometría / Prueba de función pulmonar", category: "diagnóstico", priority: 85, tags: ["espirometría", "capacidad", "función"] },
        { reason: "Tuberculosis (sospecha/control)", category: "diagnóstico", priority: 92, tags: ["TB", "tuberculosis", "tos"] },
        { reason: "Fibrosis pulmonar", category: "seguimiento", priority: 86, tags: ["fibrosis", "pulmón", "oxígeno"] },
        { reason: "Derrame pleural", category: "diagnóstico", priority: 84, tags: ["pleura", "líquido", "pulmón"] },
        { reason: "Nódulo pulmonar", category: "diagnóstico", priority: 90, tags: ["nódulo", "pulmón", "tomografía"] },
        { reason: "Alergias respiratorias", category: "común", priority: 82, tags: ["alergia", "respiratorio", "rinitis"] },
        { reason: "Hemoptisis (tos con sangre)", category: "urgencia", priority: 94, tags: ["sangre", "tos", "esputo"] },
        { reason: "Control de oxígeno domiciliario", category: "seguimiento", priority: 80, tags: ["oxígeno", "concentrador", "domicilio"] },
        { reason: "Tabaquismo (cesación)", category: "preventivo", priority: 85, tags: ["fumar", "dejar", "tabaco"] },
        { reason: "COVID-19 persistente", category: "seguimiento", priority: 88, tags: ["covid", "secuelas", "persistente"] },
        { reason: "Tos del fumador", category: "diagnóstico", priority: 78, tags: ["tabaco", "tos", "fumador"] },
        { reason: "Broncoespasmo", category: "urgencia", priority: 90, tags: ["broncoespasmo", "ahogo", "nebulización"] },
    ],

    // ========================================================================
    // ODONTOLOGÍA (Bonus)
    // ========================================================================
    "Odontología": [
        { reason: "Limpieza dental (profilaxis)", category: "preventivo", priority: 100, tags: ["limpieza", "sarro", "placa"] },
        { reason: "Dolor de muela", category: "urgencia", priority: 98, tags: ["muela", "dolor", "caries"] },
        { reason: "Caries dental", category: "común", priority: 96, tags: ["caries", "hueco", "empaste"] },
        { reason: "Sangrado de encías", category: "diagnóstico", priority: 94, tags: ["encías", "sangrado", "gingivitis"] },
        { reason: "Sensibilidad dental", category: "común", priority: 92, tags: ["sensibilidad", "frío", "caliente"] },
        { reason: "Blanqueamiento dental", category: "preventivo", priority: 85, tags: ["blanqueamiento", "estética", "manchas"] },
        { reason: "Ortodoncia (brackets)", category: "diagnóstico", priority: 88, tags: ["brackets", "ortodoncia", "alineación"] },
        { reason: "Extracción de muela", category: "común", priority: 90, tags: ["extracción", "muela", "sacar"] },
        { reason: "Muela del juicio", category: "diagnóstico", priority: 86, tags: ["cordal", "juicio", "impactada"] },
        { reason: "Endodoncia (conducto)", category: "diagnóstico", priority: 84, tags: ["endodoncia", "conducto", "nervio"] },
        { reason: "Prótesis dental", category: "diagnóstico", priority: 82, tags: ["prótesis", "puente", "corona"] },
        { reason: "Implante dental", category: "diagnóstico", priority: 80, tags: ["implante", "titanio", "tornillo"] },
        { reason: "Mal aliento (halitosis)", category: "diagnóstico", priority: 78, tags: ["halitosis", "aliento", "olor"] },
        { reason: "Bruxismo (rechinar dientes)", category: "diagnóstico", priority: 76, tags: ["bruxismo", "rechinar", "férula"] },
        { reason: "Aftas / Úlceras bucales", category: "común", priority: 74, tags: ["aftas", "úlcera", "boca"] },
        { reason: "Revisión dental general", category: "preventivo", priority: 90, tags: ["revisión", "control", "chequeo"] },
        { reason: "Diente roto o astillado", category: "urgencia", priority: 88, tags: ["roto", "fractura", "golpe"] },
        { reason: "Ajuste de aparatos", category: "seguimiento", priority: 72, tags: ["ajuste", "brackets", "control"] },
        { reason: "Periodoncia (enfermedad de encías)", category: "diagnóstico", priority: 80, tags: ["periodontitis", "encía", "hueso"] },
        { reason: "Restauración dental", category: "común", priority: 75, tags: ["empaste", "resina", "restauración"] },
    ],
};

/**
 * Lista de todas las especialidades disponibles
 */
export const AVAILABLE_SPECIALTIES = Object.keys(SPECIALTY_CONSULTATION_REASONS);

/**
 * Obtener motivos de consulta para una especialidad
 * @param specialty Nombre de la especialidad
 * @returns Lista de motivos ordenados por prioridad
 */
export function getReasonsBySpecialty(specialty: string): SpecialtyReason[] {
    // Buscar coincidencia exacta o parcial
    const exactMatch = SPECIALTY_CONSULTATION_REASONS[specialty];
    if (exactMatch) return exactMatch;

    // Buscar coincidencia parcial (ej: "Infectología" -> "Infectología Pediátrica")
    const partialMatch = Object.entries(SPECIALTY_CONSULTATION_REASONS).find(
        ([key]) => key.toLowerCase().includes(specialty.toLowerCase()) ||
            specialty.toLowerCase().includes(key.toLowerCase())
    );

    if (partialMatch) return partialMatch[1];

    // Fallback a motivos generales de Medicina Interna
    return SPECIALTY_CONSULTATION_REASONS["Medicina Interna"] || [];
}

/**
 * Buscar motivos en todas las especialidades
 * @param query Texto a buscar
 * @param specialty Especialidad opcional para priorizar
 * @returns Lista de motivos que coinciden
 */
export function searchAllReasons(query: string, specialty?: string): SpecialtyReason[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const results: (SpecialtyReason & { specialtyName: string })[] = [];

    // Primero buscar en la especialidad del médico (si se proporciona)
    if (specialty) {
        const specialtyReasons = getReasonsBySpecialty(specialty);
        specialtyReasons.forEach(reason => {
            if (reason.reason.toLowerCase().includes(normalizedQuery) ||
                reason.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
                results.push({ ...reason, specialtyName: specialty, priority: reason.priority + 10 }); // Boost
            }
        });
    }

    // Luego buscar en todas las demás especialidades
    Object.entries(SPECIALTY_CONSULTATION_REASONS).forEach(([specialtyName, reasons]) => {
        if (specialty && specialtyName.toLowerCase().includes(specialty.toLowerCase())) return; // Ya procesada

        reasons.forEach(reason => {
            if (reason.reason.toLowerCase().includes(normalizedQuery) ||
                reason.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
                // Evitar duplicados
                if (!results.some(r => r.reason === reason.reason)) {
                    results.push({ ...reason, specialtyName });
                }
            }
        });
    });

    // Ordenar por prioridad y limitar resultados
    return results
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 20);
}

/**
 * Obtener los motivos más comunes (top 10 por prioridad global)
 * @param specialty Especialidad opcional para filtrar
 */
export function getTopReasons(specialty?: string, limit = 10): string[] {
    if (specialty) {
        const reasons = getReasonsBySpecialty(specialty);
        return reasons
            .sort((a, b) => b.priority - a.priority)
            .slice(0, limit)
            .map(r => r.reason);
    }

    // Global top reasons
    const allReasons: { reason: string; priority: number }[] = [];
    Object.values(SPECIALTY_CONSULTATION_REASONS).forEach(reasons => {
        reasons.forEach(r => {
            if (!allReasons.some(ar => ar.reason === r.reason)) {
                allReasons.push({ reason: r.reason, priority: r.priority });
            }
        });
    });

    return allReasons
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit)
        .map(r => r.reason);
}
