/**
 * @file specialties-content.data.ts
 * @description Contenido informativo verificado para cada especialidad médica.
 * Las fuentes incluyen organizaciones médicas reconocidas como Mayo Clinic, NIH,
 * AAP, Fundación Española del Corazón, entre otras instituciones de salud.
 *
 * @references
 * - Cardiología: Fundación Española del Corazón, NIH/NHLBI, Mayo Clinic
 * - Neurología: Academia Mexicana de Neurología, Centro Médico ABC
 * - Dermatología: AAD, Fundación Piel Sana
 * - Pediatría: AAP (HealthyChildren.org), UNICEF
 * - Ginecología: Planned Parenthood, Quirónsalud
 * - Oftalmología: AAO (American Academy of Ophthalmology)
 * - Traumatología: NIH/NIAMS
 * - Medicina General: OMS, SEMFYC
 */

export interface SpecialtyContent {
    /** Título de la especialidad */
    title: string;
    /** Descripción general de la especialidad */
    description: string;
    /** Explicación detallada de qué es la especialidad */
    whatIsIt: string;
    /** Lista de síntomas o situaciones para acudir al especialista */
    whenToGo: string[];
    /** Razones por las que esta especialidad es importante */
    whyItMatters: string[];
    /** Cómo prepararse para la consulta */
    preparation?: string[];
    /** Tratamientos comunes que ofrece la especialidad */
    treatments?: string[];
    /** Preguntas frecuentes con respuestas */
    faqs?: { q: string; a: string }[];
    /** Slugs de especialidades relacionadas */
    relatedSpecialties?: string[];
}

/**
 * Contenido verificado por especialidad médica.
 * Las claves son slugs normalizados (sin tildes, en minúsculas).
 */
export const SPECIALTY_CONTENT: Record<string, SpecialtyContent> = {
    // ============================================
    // CARDIOLOGÍA
    // Fuentes: Fundación Española del Corazón, NIH/NHLBI, Mayo Clinic
    // ============================================
    cardiologia: {
        title: "Cardiología",
        description:
            "El corazón es el motor de tu vida. La cardiología es la especialidad médica dedicada al estudio, prevención, diagnóstico y tratamiento de las enfermedades del corazón y del sistema circulatorio.",
        whatIsIt:
            "Es la rama de la medicina que se ocupa de las afecciones del corazón y los vasos sanguíneos. Los cardiólogos no solo tratan enfermedades, sino que también trabajan en la prevención de factores de riesgo como la hipertensión, el colesterol alto y la diabetes. La cardiología abarca desde el diagnóstico con electrocardiogramas y ecocardiografías, hasta tratamientos con medicamentos y procedimientos intervencionistas.",
        whenToGo: [
            "Dolor o presión en el pecho, especialmente si irradia al brazo, cuello o mandíbula",
            "Falta de aire o dificultad para respirar al hacer esfuerzo físico",
            "Palpitaciones, sensación de corazón acelerado o latidos irregulares",
            "Mareos frecuentes, desmayos o pérdida de conciencia",
            "Hinchazón en piernas, tobillos o pies (edema)",
            "Fatiga extrema al realizar actividades que antes no causaban cansancio",
            "Antecedentes familiares de enfermedades cardíacas",
            "Hipertensión arterial, diabetes o colesterol alto",
        ],
        whyItMatters: [
            "Las enfermedades cardiovasculares son la principal causa de muerte en el mundo",
            "Un diagnóstico temprano puede prevenir infartos y daños cardíacos irreversibles",
            "El control adecuado de la presión arterial mejora significativamente la calidad de vida",
            "La prevención reduce hasta un 80% el riesgo de eventos cardiovasculares",
            "Recibes orientación personalizada sobre dieta, ejercicio y hábitos saludables",
        ],
        preparation: [
            "Lleva una lista de todos los medicamentos que tomas actualmente",
            "Anota tus síntomas, cuándo comenzaron y qué los desencadena",
            "Trae resultados de exámenes previos si los tienes",
            "No fumes ni tomes café al menos 2 horas antes del electrocardiograma",
            "Viste ropa cómoda y fácil de quitar para el examen físico",
        ],
        treatments: [
            "Electrocardiograma (ECG) y monitoreo Holter",
            "Ecocardiografía y pruebas de esfuerzo",
            "Medicamentos antihipertensivos, anticoagulantes y estatinas",
            "Angioplastia coronaria con colocación de stents",
            "Cirugía de bypass coronario",
            "Implante de marcapasos o desfibriladores",
            "Ablación por catéter para arritmias",
        ],
        faqs: [
            {
                q: "¿A partir de qué edad debo hacerme un chequeo cardíaco?",
                a: "Se recomienda un primer chequeo cardiovascular a los 20 años y evaluaciones regulares a partir de los 40, o antes si tienes factores de riesgo como hipertensión, diabetes, obesidad o antecedentes familiares.",
            },
            {
                q: "¿El dolor en el pecho siempre indica un problema cardíaco?",
                a: "No siempre. El dolor de pecho puede tener múltiples causas (musculares, digestivas, ansiedad). Sin embargo, si es intenso, opresivo, irradia a otros lugares o se acompaña de sudoración, debes buscar atención médica inmediata.",
            },
            {
                q: "¿Puedo hacer ejercicio si tengo una condición cardíaca?",
                a: "En la mayoría de los casos sí, pero bajo supervisión médica. El cardiólogo te indicará qué tipo de ejercicio es seguro y a qué intensidad puedes realizarlo según tu condición.",
            },
        ],
        relatedSpecialties: [
            "cirugia-cardiovascular",
            "medicina-interna",
            "endocrinologia",
        ],
    },

    // ============================================
    // NEUROLOGÍA
    // Fuentes: Academia Mexicana de Neurología, Centro Médico ABC, NIH/NINDS
    // ============================================
    // NEUMOLOGÍA
    // ============================================
    neumologia: {
        title: "Neumología",
        description: "Respirar es vivir. La neumología se dedica al estudio, diagnóstico y tratamiento de las enfermedades de los pulmones, las vías respiratorias y los músculos respiratorios.",
        whatIsIt: "La neumología es la especialidad médica encargada del sistema respiratorio. Los neumólogos tratan condiciones que van desde el asma y la EPOC hasta infecciones complejas como la neumonía y enfermedades intersticiales. Utilizan pruebas de función pulmonar y broncoscopias para evaluar la salud de tus pulmones.",
        whenToGo: [
            "Tos crónica o persistente por más de 3 semanas",
            "Falta de aire (disnea) al caminar o hacer esfuerzos",
            "Silbidos o ruidos en el pecho al respirar",
            "Dolor torácico al respirar profundo",
            "Expectoración con sangre",
            "Ronquidos fuertes y pausas respiratorias al dormir (apnea)",
            "Antecedentes de tabaquismo",
            "Alergias respiratorias severas",
        ],
        whyItMatters: [
            "La detección temprana de cáncer de pulmón mejora drásticamente el pronóstico",
            "El manejo adecuado del asma permite llevar una vida normal y activa",
            "Tratar la apnea del sueño reduce el riesgo de infartos y accidentes cerebrovasculares",
            "Dejar de fumar con ayuda médica es más efectivo que hacerlo solo",
            "Previene el daño pulmonar irreversible en enfermedades crónicas",
        ],
        preparation: [
            "Trae radiografías o tomografías de tórax previas",
            "No uses inhaladores 4-6 horas antes si te van a hacer espirometría (consulta antes)",
            "Anota tus síntomas y qué los desencadena (frío, ejercicio, polvo)",
            "Lista todos los medicamentos que tomas",
            "Si fumas, sé honesto sobre la cantidad para un mejor diagnóstico",
        ],
        treatments: [
            "Espirometría y pruebas de función pulmonar",
            "Broncoscopia diagnóstica y terapéutica",
            "Terapia con inhaladores y nebulizaciones",
            "Rehabilitación pulmonar",
            "Tratamiento para dejar de fumar",
            "Ventilación mecánica no invasiva (CPAP/BIPAP)",
            "Toracocentesis (drenaje de líquido pleural)",
        ],
        faqs: [
            {
                q: "¿El asma se cura?",
                a: "El asma es una enfermedad crónica que no tiene cura definitiva, pero es totalmente controlable. Con el tratamiento adecuado, la mayoría de las personas llevan una vida sin síntomas ni limitaciones.",
            },
            {
                q: "¿Cuándo debo preocuparme por un ronquido?",
                a: "Si el ronquido es muy fuerte, se interrumpe por pausas de silencio (apneas) y te levantas cansado o tienes sueño durante el día, podrías tener Apnea Obstructiva del Sueño, que requiere tratamiento.",
            },
            {
                q: "¿Es reversible el daño por fumar?",
                a: "Algunos daños son irreversibles, pero dejar de fumar detiene la progresión de la enfermedad y mejora significativamente la función pulmonar y la calidad de vida en cuestión de semanas.",
            },
        ],
        relatedSpecialties: ["alergologia", "medicina-interna", "cardiologia"],
    },

    // ============================================
    // NEFROLOGÍA
    // ============================================
    nefrologia: {
        title: "Nefrología",
        description: "Cuidando el filtro de tu cuerpo. Especialidad dedicada a la salud de los riñones y al tratamiento de enfermedades que afectan su función de limpieza y equilibrio.",
        whatIsIt: "La nefrología se enfoca en la fisiología y enfermedades de los riñones. Los nefrólogos tratan la insuficiencia renal, hipertensión arterial de causa renal, cálculos renales recurrentes y desequilibrios electrolíticos. También supervisan tratamientos de diálisis y trasplante renal.",
        whenToGo: [
            "Hipertensión arterial difícil de controlar",
            "Orina con espuma o sangre",
            "Hinchazón en pies, tobillos o cara (retención de líquidos)",
            "Cambios en la frecuencia o cantidad de orina",
            "Dolor lumbar constante sin causa muscular",
            "Antecedentes familiares de enfermedad renal",
            "Diabetes de larga evolución",
            "Cálculos renales recurrentes",
        ],
        whyItMatters: [
            "La enfermedad renal crónica es silenciosa en sus etapas iniciales",
            "El control de la presión arterial protege los riñones y el corazón",
            "Detectar proteínas en la orina a tiempo puede frenar el daño renal",
            "El manejo adecuado evita o retrasa la necesidad de diálisis",
            "Equilibra los minerales y electrolitos vitales para el cuerpo",
        ],
        preparation: [
            "Realiza los análisis de sangre y orina 24h solicitados",
            "Lleva un registro de tu presión arterial de la última semana",
            "Anota la cantidad de líquido que bebes al día",
            "Trae todos tus medicamentos, algunos pueden afectar los riñones",
            "Evita comidas muy saladas el día anterior a la consulta",
        ],
        treatments: [
            "Control de presión arterial y nefroprotección",
            "Manejo de la enfermedad renal crónica",
            "Hemodiálisis y diálisis peritoneal",
            "Biopsia renal",
            "Tratamiento de anemia renal y alteraciones óseas",
            "Seguimiento de trasplante renal",
            "Manejo de litiasis (cálculos) renal y alteraciones metabólicas",
        ],
        faqs: [
            {
                q: "¿Beber mucha agua previene todas las enfermedades renales?",
                a: "Mantenerse hidratado es bueno, especialmente para prevenir cálculos, pero no previene enfermedades causadas por diabetes o hipertensión. El exceso de agua tampoco es bueno en etapas avanzadas de falla renal.",
            },
            {
                q: "¿La insuficiencia renal siempre requiere diálisis?",
                a: "No. Si se detecta en etapas tempranas (1-3), se puede manejar con dieta y medicamentos para retrasar o evitar la progresión a etapas que requieran diálisis.",
            },
            {
                q: "¿Los cálculos renales son hereditarios?",
                a: "Existe una predisposición genética, pero la dieta y la hidratación juegan un papel fundamental. Si tienes familiares con cálculos, un estudio metabólico puede ayudar a prevenirlos.",
            },
        ],
        relatedSpecialties: ["urologia", "medicina-interna", "endocrinologia"],
    },

    // ============================================
    // OTORRINOLARINGOLOGÍA
    // ============================================
    otorrinolaringologia: {
        title: "Otorrinolaringología",
        description: "Salud de oídos, nariz y garganta. Especialistas en mejorar tu audición, respiración, voz y equilibrio para una mejor calidad de vida.",
        whatIsIt: "El otorrinolaringólogo diagnostica y trata enfermedades del oído, nariz, garganta, y estructuras relacionadas de la cabeza y cuello. Desde pérdidas auditivas y sinusitis crónica hasta trastornos de la voz y cirugía estética facial, esta especialidad abarca funciones vitales para la comunicación y los sentidos.",
        whenToGo: [
            "Pérdida de audición o zumbidos en los oídos",
            "Dolor de oído o supuración",
            "Congestión nasal crónica o sinusitis recurrente",
            "Ronquidos y dificultad para respirar por la nariz",
            "Dolor de garganta crónico o cambios en la voz (ronquera)",
            "Vértigo o mareos relacionados con el equilibrio",
            "Sangrados nasales frecuentes",
            "Bultos en el cuello",
        ],
        whyItMatters: [
            "La audición es fundamental para la comunicación y el desarrollo en niños",
            "Respirar bien mejora el sueño y el rendimiento físico",
            "El vértigo puede ser incapacitante y requiere diagnóstico preciso",
            "La detección temprana de cáncer de laringe salva la voz y la vida",
            "Tratar las amígdalas infectadas previene complicaciones cardíacas y renales",
        ],
        treatments: [
            "Audiometrías y estudios de audición",
            "Cirugía de amígdalas y adenoides",
            "Septoplastia (tabique nasal) y rinoplastia funcional",
            "Cirugía endoscópica de senos paranasales",
            "Tratamiento del vértigo y trastornos del equilibrio",
            "Microcirugía de laringe y cuerdas vocales",
            "Adaptación de audífonos e implantes cocleares",
        ],
        relatedSpecialties: ["pediatria", "neumologia", "neurologia"],
    },

    // ============================================
    // UROLOGÍA
    // ============================================
    urologia: {
        title: "Urología",
        description: "Salud del sistema urinario y reproductor masculino. Atención integral para riñones, vejiga y próstata, con tratamientos médicos y quirúrgicos de vanguardia.",
        whatIsIt: "La urología trata las enfermedades del sistema urinario en hombres y mujeres (riñones, uréteres, vejiga, uretra) y del sistema reproductor masculino (próstata, testículos, pene). Los urólogos manejan desde infecciones urinarias y cálculos hasta cáncer urológico y problemas de fertilidad masculina.",
        whenToGo: [
            "Dificultad o dolor al orinar",
            "Sangre en la orina",
            "Dolor en la zona lumbar baja o ingle",
            "Incontinencia urinaria o escape de orina",
            "Problemas de erección o eyaculación",
            "Chequeo de próstata (hombres mayores de 45-50 años)",
            "Bultos o dolor en los testículos",
            "Infecciones urinarias recurrentes",
        ],
        whyItMatters: [
            "El cáncer de próstata es curable si se detecta a tiempo",
            "La incontinencia urinaria tiene tratamiento y mejora la calidad de vida",
            "Los cálculos renales pueden dañar el riñón si no se tratan",
            "La salud sexual masculina es un indicador de salud cardiovascular",
            "Las infecciones urinarias mal curadas pueden afectar los riñones",
        ],
        treatments: [
            "Cistoscopia y estudios urodinámicos",
            "Cirugía láser para próstata (RTU/Enucleación)",
            "Litotricia para cálculos renales",
            "Vasectomía y reversión",
            "Tratamiento de disfunción eréctil",
            "Cirugía laparoscópica y robótica urológica",
            "Tratamiento de incontinencia urinaria",
        ],
        relatedSpecialties: ["nefrologia", "ginecologia", "oncologia-medica"],
    },

    // ============================================
    // ONCOLOGÍA MÉDICA
    // ============================================
    "oncologia-medica": {
        title: "Oncología Médica",
        description: "Acompañamiento y ciencia contra el cáncer. Especialistas dedicados al tratamiento sistémico del cáncer y al cuidado integral del paciente oncológico.",
        whatIsIt: "La oncología médica se especializa en el tratamiento del cáncer mediante quimioterapia, terapia hormonal, terapia biológica e inmunoterapia. El oncólogo médico coordina la estrategia terapéutica global, trabajando en equipo con cirujanos y radioterapeutas para ofrecer el mejor plan de tratamiento personalizado.",
        whenToGo: [
            "Diagnóstico confirmado o sospecha de cáncer",
            "Bultos o masas nuevas en el cuerpo",
            "Pérdida de peso inexplicable y fatiga severa",
            "Seguimiento después de un tratamiento de cáncer",
            "Historia familiar fuerte de cáncer (consejo genético)",
            "Segunda opinión sobre tratamientos oncológicos",
        ],
        whyItMatters: [
            "Los tratamientos modernos son cada vez más efectivos y menos tóxicos",
            "El enfoque multidisciplinario aumenta las tasas de curación",
            "El soporte integral mejora la calidad de vida durante el tratamiento",
            "La inmunoterapia ha revolucionado el pronóstico de muchos tumores",
            "El seguimiento a largo plazo previene y detecta recaídas",
        ],
        treatments: [
            "Quimioterapia sistémica",
            "Inmunoterapia y terapias dirigidas",
            "Hormonoterapia",
            "Manejo del dolor y cuidados paliativos",
            "Consejo genético oncológico",
            "Coordinación de ensayos clínicos",
            "Soporte nutricional y psicológico",
        ],
        relatedSpecialties: ["cirugia-oncologica", "hematologia", "radioterapia"],
    },

    // ============================================
    // CIRUGÍA GENERAL
    // ============================================
    "cirugia-general": {
        title: "Cirugía General",
        description: "Soluciones quirúrgicas integrales. Expertos en intervenciones del aparato digestivo, sistema endocrino y pared abdominal, utilizando técnicas tradicionales y mínimamente invasivas.",
        whatIsIt: "A pesar de su nombre, la cirugía general es una especialidad altamente compleja que se enfoca en el tratamiento quirúrgico de enfermedades del abdomen, sistema digestivo, glándulas endocrinas y mama. Son expertos en manejo de heridas, urgencias quirúrgicas y cirugía laparoscópica avanzada.",
        whenToGo: [
            "Dolor abdominal agudo (apendicitis, vesícula)",
            "Hernias en la pared abdominal o ingle",
            "Enfermedades de la vesícula biliar",
            "Problemas de tiroides que requieren cirugía",
            "Masas o bultos en tejidos blandos",
            "Traumatismos o heridas graves",
            "Reflujo gastroesofágico severo",
        ],
        whyItMatters: [
            "La cirugía laparoscópica reduce el dolor y tiempo de recuperación",
            "Tratar una hernia a tiempo evita complicaciones como la estrangulación",
            "La resolución rápida de cuadros agudos (apendicitis) salva vidas",
            "El manejo experto de la pared abdominal previene recidivas",
            "Son fundamentales en la atención de trauma y emergencias",
        ],
        treatments: [
            "Colecistectomía laparoscópica (vesícula)",
            "Reparación de hernias (inguinal, umbilical, hiatal)",
            "Apendicectomía",
            "Cirugía de tiroides y paratiroides",
            "Cirugía de colon y recto",
            "Manejo de pie diabético y heridas complejas",
            "Cirugía de tejidos blandos (lipomas, quistes)",
        ],
        relatedSpecialties: ["gastroenterologia", "medicina-interna", "emergenciologia"],
    },

    // ============================================
    // ODONTOLOGÍA
    // ============================================
    odontologia: {
        title: "Odontología",
        description: "Salud oral y sonrisas brillantes. Cuidado integral de tus dientes, encías y boca para una salud general óptima y una estética impecable.",
        whatIsIt: "La odontología se encarga de la prevención, diagnóstico y tratamiento de enfermedades de la cavidad oral. No solo trata caries y encías, sino que también restaura la función masticatoria y mejora la estética dental, lo cual tiene un impacto directo en la autoestima y la salud general del paciente.",
        whenToGo: [
            "Dolor de muelas o sensibilidad dental",
            "Sangrado de encías al cepillarse",
            "Mal aliento persistente",
            "Pérdida o fractura de dientes",
            "Dientes torcidos o problemas de mordida",
            "Manchas en los dientes",
            "Chequeo y limpieza semestral preventivo",
            "Dolor en la mandíbula o al masticar",
        ],
        whyItMatters: [
            "La salud bucal está conectada con la salud cardiovascular y diabetes",
            "Prevenir es mucho más económico y menos doloroso que curar",
            "Una sonrisa sana mejora la confianza y relaciones sociales",
            "Detectar cáncer oral en etapas tempranas es vital",
            "Masticar bien es el primer paso para una buena digestión",
        ],
        treatments: [
            "Limpieza dental y profilaxis",
            "Restauraciones (empastes) estéticas",
            "Endodoncia (tratamiento de conducto)",
            "Ortodoncia (brackets y alineadores)",
            "Implantes dentales y prótesis",
            "Blanqueamiento dental",
            "Cirugía de cordales (muelas del juicio)",
        ],
        relatedSpecialties: ["cirugia-maxilofacial", "ortodoncia", "pediatria"],
    },

    // ============================================
    // CIRUGÍA PLÁSTICA
    // ============================================
    "cirugia-plastica-y-reconstructiva": {
        title: "Cirugía Plástica y Reconstructiva",
        description: "Reconstruyendo formas, restaurando confianza. Especialidad dedicada a la corrección y restauración de la forma y función corporal, tanto estética como reparadora.",
        whatIsIt: "La cirugía plástica abarca dos grandes áreas: la reconstructiva, que busca restaurar funciones y apariencia tras accidentes, quemaduras o defectos congénitos; y la estética, enfocada en mejorar la armonía facial y corporal. Los cirujanos plásticos combinan arte y ciencia para mejorar la calidad de vida de los pacientes.",
        whenToGo: [
            "Deseo de mejorar la apariencia facial o corporal",
            "Secuelas de quemaduras o accidentes",
            "Reconstrucción mamaria post-cáncer",
            "Cicatrices inestéticas o queloides",
            "Malformaciones congénitas (labio leporino, orejas)",
            "Exceso de piel tras pérdida masiva de peso",
            "Tumores de piel en zonas visibles",
        ],
        whyItMatters: [
            "La cirugía reconstructiva devuelve la funcionalidad a manos o extremidades",
            "Mejora significativamente la autoestima y salud mental",
            "Corrige defectos que pueden causar problemas funcionales (respiración, visión)",
            "La reconstrucción mamaria es parte vital del tratamiento del cáncer de mama",
            "Trata quemaduras graves para salvar la vida y función",
        ],
        treatments: [
            "Mamoplastia (aumento, reducción, reconstrucción)",
            "Rinoplastia estética y funcional",
            "Abdominoplastia y lipoescultura",
            "Blefaroplastia (párpados) y lifting facial",
            "Injertos de piel y tratamiento de quemaduras",
            "Microcirugía reconstructiva",
            "Procedimientos no invasivos (botox, rellenos)",
        ],
        relatedSpecialties: ["dermatologia", "cirugia-general", "mastologia"],
    },

    // ============================================
    // INFECTOLOGÍA
    // ============================================
    infectologia: {
        title: "Infectología",
        description: "Expertos en la lucha contra microbios. Diagnóstico y tratamiento de enfermedades causadas por bacterias, virus, hongos y parásitos.",
        whatIsIt: "La infectología es la subespecialidad de medicina interna dedicada al estudio de las enfermedades infecciosas. Los infectólogos tratan infecciones complejas, resistentes a antibióticos, tropicales, y en pacientes con defensas bajas (VIH, trasplantes). También son expertos en prevención a través de vacunas y control de antibióticos.",
        whenToGo: [
            "Fiebre prolongada sin causa aparente",
            "Infecciones que no mejoran con antibióticos comunes",
            "Diagnóstico y tratamiento de VIH/SIDA e ITS",
            "Infecciones tropicales (Dengue, Malaria, Zika)",
            "Viajes a zonas exóticas (medicina del viajero)",
            "Infecciones recurrentes o defensas bajas",
            "Heridas infectadas graves o pie diabético complicado",
        ],
        whyItMatters: [
            "El uso correcto de antibióticos combate la resistencia bacteriana mundial",
            "Manejar el VIH como enfermedad crónica permite una vida plena",
            "Previenen brotes y epidemias mediante vacunación y control",
            "Salvan vidas en infecciones graves como sepsis o meningitis",
            "Son clave para pacientes trasplantados o con cáncer",
        ],
        treatments: [
            "Tratamiento antibiótico de alta complejidad",
            "Terapia antirretroviral para VIH",
            "Manejo de tuberculosis y hongos sistémicos",
            "Vacunación especializada (viajeros, adultos)",
            "Tratamiento de infecciones osteoarticulares",
            "Profilaxis post-exposición (VIH, rabia)",
            "Control de infecciones hospitalarias",
        ],
        relatedSpecialties: ["medicina-interna", "pediatria", "microbiologia"],
    },

    // ============================================
    // HEMATOLOGÍA
    // ============================================
    hematologia: {
        title: "Hematología",
        description: "La ciencia de la sangre. Diagnóstico y tratamiento de enfermedades de la sangre, médula ósea, ganglios linfáticos y coagulación.",
        whatIsIt: "La hematología estudia la sangre y los órganos que la producen. Los hematólogos tratan anemias, trastornos de coagulación (hemofilia, trombosis) y cánceres de la sangre como leucemias, linfomas y mielomas. Son los encargados de realizar trasplantes de médula ósea.",
        whenToGo: [
            "Anemia que no mejora o sin causa clara",
            "Moretones fáciles o sangrados nasales frecuentes",
            "Ganglios inflamados que no duelen y persisten",
            "Fatiga extrema, palidez o dificultad para respirar",
            "Trombosis venosa o embolias recurrentes",
            "Alteraciones en los glóbulos blancos o plaquetas",
            "Diagnóstico de leucemia o linfoma",
        ],
        whyItMatters: [
            "Diagnosticar leucemias a tiempo es crítico para la supervivencia",
            "El manejo de la coagulación previene trombosis e infartos",
            "Tratar la anemia mejora la energía y función cognitiva",
            "El trasplante de médula es la cura para muchas enfermedades graves",
            "Controlar la hemofilia permite llevar una vida activa",
        ],
        treatments: [
            "Quimioterapia e inmunoterapia hematológica",
            "Trasplante de médula ósea (progenitores hematopoyéticos)",
            "Transfusiones de sangre y plaquetas",
            "Anticoagulación y manejo de trombosis",
            "Tratamiento de anemias (hierro, vitaminas, EPO)",
            "Aspirado y biopsia de médula ósea",
            "Sangrías terapéuticas",
        ],
        relatedSpecialties: ["oncologia-medica", "medicina-interna", "laboratorio"],
    },
    // ============================================
    // REUMATOLOGÍA
    // ============================================
    reumatologia: {
        title: "Reumatología",
        description: "Movimiento sin dolor ni limitación. Diagnóstico y tratamiento de enfermedades que afectan articulaciones, músculos, huesos y enfermedades autoinmunes sistémicas.",
        whatIsIt: "La reumatología se ocupa de los trastornos médicos del aparato locomotor y del tejido conectivo. Abarca desde la artrosis (desgaste) hasta enfermedades inflamatorias autoinmunes complejas como la artritis reumatoide y el lupus. Los reumatólogos buscan controlar la inflamación, aliviar el dolor y preservar la función física.",
        whenToGo: [
            "Dolor e inflamación en articulaciones sin causa traumática",
            "Rigidez matutina en las articulaciones que dura más de 30 minutos",
            "Dolor de espalda crónico, especialmente en reposo",
            "Fiebre, cansancio y pérdida de peso inexplicables",
            "Hinchazón en dedos de manos o pies",
            "Sequedad persistente en ojos y boca (Síndrome de Sjögren)",
            "Diagnóstico de Lupus o Artritis",
        ],
        whyItMatters: [
            "El tratamiento temprano previene deformidades articulares irreversibles",
            "Controlar la inflamación reduce el riesgo cardiovascular asociado",
            "Mejora significativamente la calidad de vida en enfermedades crónicas",
            "Previene la discapacidad y mantiene la independencia",
            "El manejo autoinmune protege otros órganos vitales como riñones y pulmones",
        ],
        treatments: [
            "Medicamentos antirreumáticos (FAMEs)",
            "Terapias biológicas avanzadas",
            "Infiltraciones articulares",
            "Manejo del dolor crónico",
            "Detección y tratamiento de osteoporosis",
            "Ecografía musculoesquelética diagnóstica",
        ],
        faqs: [
            {
                q: "¿El reuma es una enfermedad de ancianos?",
                a: "No. 'Reuma' es un término general. Existen más de 200 enfermedades reumáticas y muchas afectan a jóvenes e incluso niños (Artritis Idiopática Juvenil).",
            },
            {
                q: "¿La artritis tiene cura?",
                a: "La mayoría de los tipos de artritis son crónicos, pero con los tratamientos actuales se puede lograr la remisión completa de los síntomas y llevar una vida normal.",
            },
        ],
        relatedSpecialties: ["traumatologia-y-ortopedia", "medicina-fisica-y-rehabilitacion", "inmunologia"],
    },

    // ============================================
    // ALERGOLOGÍA
    // ============================================
    alergologia: {
        title: "Alergología",
        description: "Vivir libre de reacciones. Especialistas en el diagnóstico y tratamiento de alergias y trastornos del sistema inmunológico.",
        whatIsIt: "La alergología estudia las reacciones exageradas del sistema inmune ante sustancias que normalmente son inofensivas (alérgenos). Los alergólogos identifican los detonantes y diseñan tratamientos para asma, rinitis, alergias alimentarias, a medicamentos y picaduras de insectos, mejorando la tolerancia y calidad de vida.",
        whenToGo: [
            "Estornudos frecuentes, congestión y picor nasal (rinitis)",
            "Asma o dificultad para respirar recurrente",
            "Erupciones en la piel, urticaria o eczema",
            "Reacciones adversas a alimentos o medicamentos",
            "Hinchazón de labios, ojos o cara (angioedema)",
            "Reacciones graves a picaduras de insectos",
            "Anafilaxia previa (reacción alérgica severa)",
        ],
        whyItMatters: [
            "Identificar el alérgeno exacto permite evitar reacciones peligrosas",
            "La inmunoterapia (vacunas de alergia) puede curar o reducir significativamente la alergia",
            "El control del asma alérgica previene crisis graves",
            "Mejora el rendimiento escolar y laboral al reducir síntomas molestos",
            "Salva vidas al prevenir choques anafilácticos",
        ],
        treatments: [
            "Pruebas cutáneas (Prick test)",
            "Inmunoterapia (vacunas para la alergia)",
            "Pruebas de provocación controlada (alimentos/medicamentos)",
            "Espirometría y pruebas de función pulmonar",
            "Desensibilización a medicamentos",
            "Tratamiento de dermatitis atópica",
        ],
        relatedSpecialties: ["neumologia", "dermatologia", "pediatria"],
    },

    // ============================================
    // GERIATRÍA
    // ============================================
    geriatria: {
        title: "Geriatría",
        description: "Salud y calidad de vida en la edad de oro. Atención integral especializada para las necesidades del adulto mayor.",
        whatIsIt: "La geriatría se dedica al cuidado del adulto mayor (generalmente mayores de 65 años). A diferencia de otras especialidades, el geriatra evalúa al paciente de forma global: física, mental, funcional y social. Se enfoca en mantener la autonomía, prevenir la discapacidad y manejar múltiples enfermedades simultáneas (polimedicación).",
        whenToGo: [
            "Personas mayores de 65 años con múltiples enfermedades",
            "Pérdida de memoria o cambios cognitivos",
            "Caídas frecuentes o problemas de equilibrio",
            "Pérdida de peso involuntaria o fragilidad",
            "Dificultad para realizar actividades diarias",
            "Problemas con múltiples medicamentos (polifarmacia)",
            "Cambios de comportamiento o depresión en el adulto mayor",
        ],
        whyItMatters: [
            "Preserva la independencia y funcionalidad por más tiempo",
            "Evita la medicación innecesaria o interacciones peligrosas",
            "Mejora la calidad de vida y el bienestar emocional",
            "Brinda apoyo y orientación a las familias y cuidadores",
            "Previene hospitalizaciones y complicaciones geriátricas",
        ],
        treatments: [
            "Valoración Geriátrica Integral (VGI)",
            "Manejo de demencias y Alzheimer",
            "Prevención y tratamiento de caídas y osteoporosis",
            "Control de enfermedades crónicas múltiples",
            "Cuidados paliativos y manejo del dolor",
            "Nutrición en el adulto mayor",
        ],
        relatedSpecialties: ["medicina-interna", "neurologia", "psiquiatria"],
    },

    // ============================================
    // MEDICINA INTERNA
    // ============================================
    "medicina-interna": {
        title: "Medicina Interna",
        description: "El detective médico para adultos. Visión global y experta para el diagnóstico de enfermedades complejas y el manejo integral del adulto.",
        whatIsIt: "El internista es el especialista de adultos 'de cabecera' para casos complejos. Se encarga de pacientes con múltiples enfermedades, diagnósticos difíciles o condiciones que afectan varios órganos a la vez. Coordina la atención médica y tiene una visión holística del paciente, evitando la fragmentación del cuidado.",
        whenToGo: [
            "Síntomas complejos o diagnósticos no claros",
            "Múltiples enfermedades crónicas (diabetes + hipertensión + colesterol)",
            "Fatiga crónica, pérdida de peso o fiebre de origen desconocido",
            "Chequeo médico integral anual para adultos",
            "Preoperatorios y valoración de riesgo cardiovascular",
            "Enfermedades infecciosas o autoinmunes multisistémicas",
        ],
        whyItMatters: [
            "Integra tratamientos para evitar interacciones entre medicamentos",
            "Resuelve diagnósticos difíciles que otros no han podido identificar",
            "Ofrece un enfoque preventivo integral para el adulto",
            "Coordina a los subespecialistas para un tratamiento coherente",
            "Es fundamental en la atención hospitalaria de pacientes agudos",
        ],
        treatments: [
            "Diagnóstico de enfermedades complejas",
            "Control de enfermedades crónicas no transmisibles",
            "Manejo de pacientes hospitalizados",
            "Valoración preoperatoria",
            "Prevención cardiovascular primaria y secundaria",
            "Atención de urgencias médicas no quirúrgicas",
        ],
        relatedSpecialties: ["cardiologia", "gastroenterologia", "neumologia"],
    },

    // ============================================
    // MEDICINA FÍSICA Y REHABILITACIÓN
    // ============================================
    "medicina-fisica-y-rehabilitacion": {
        title: "Medicina Física y Rehabilitación",
        description: "Restaurando la función y el movimiento. Especialistas en recuperar la capacidad física perdida por enfermedades o lesiones.",
        whatIsIt: "También conocida como fisiatría, esta especialidad se enfoca en restaurar las capacidades funcionales y mejorar la calidad de vida de personas con discapacidades físicas o cognitivas. El fisiatra lidera el equipo de rehabilitación (fisioterapeutas, terapeutas ocupacionales) diseñando planes personalizados de recuperación.",
        whenToGo: [
            "Recuperación post-ACV (derrame cerebral)",
            "Lesiones de médula espinal o daño cerebral",
            "Dolor de espalda o cuello crónico",
            "Amputaciones y uso de prótesis",
            "Parálisis facial o debilidad muscular",
            "Secuelas de fracturas o cirugías ortopédicas",
            "Discapacidad infantil (parálisis cerebral)",
        ],
        whyItMatters: [
            "Maximiza la independencia en las actividades diarias",
            "Reduce el dolor crónico sin cirugía",
            "Permite la reintegración laboral y social tras una lesión",
            "Previene complicaciones de la inmovilidad",
            "Optimiza el uso de dispositivos de ayuda (sillas, prótesis)",
        ],
        treatments: [
            "Planes de fisioterapia y ejercicio terapéutico",
            "Electroterapia y ultrasonido",
            "Infiltraciones para dolor muscular y articular",
            "Manejo de espasticidad (toxina botulínica)",
            "Prescripción de órtesis y prótesis",
            "Rehabilitación cardiopulmonar",
        ],
        relatedSpecialties: ["traumatologia-y-ortopedia", "neurologia", "reumatologia"],
    },

    // ============================================
    // NUTRIOLOGÍA
    // ============================================
    nutriologia: {
        title: "Nutriología",
        description: "Tu salud empieza en tu plato. Ciencia médica aplicada a la alimentación para prevenir, tratar y controlar enfermedades.",
        whatIsIt: "La nutriología clínica va más allá de 'hacer dieta'. Es la especialidad médica que estudia la relación entre la alimentación y la salud. Los nutriólogos tratan la obesidad, desnutrición, diabetes y dislipidemias, y diseñan planes de alimentación clínica para pacientes con enfermedades renales, oncológicas o digestivas.",
        whenToGo: [
            "Obesidad o sobrepeso que afecta la salud",
            "Diabetes tipo 1 o 2 (manejo nutricional)",
            "Colesterol o triglicéridos altos",
            "Trastornos de la conducta alimentaria (apoyo médico)",
            "Alergias o intolerancias alimentarias",
            "Nutrición en embarazo y lactancia",
            "Nutrición deportiva especializada",
            "Enfermedad celíaca o intestinal",
        ],
        whyItMatters: [
            "La nutrición adecuada es el pilar del tratamiento en diabetes e hipertensión",
            "Previene enfermedades cardiovasculares y metabólicas",
            "Mejora la respuesta al tratamiento oncológico",
            "Asegura el crecimiento óptimo en niños y adolescentes",
            "Combate la epidemia global de obesidad de manera científica",
        ],
        treatments: [
            "Evaluación del estado nutricional (antropometría)",
            "Planes de alimentación personalizados (dietoterapia)",
            "Manejo médico de la obesidad",
            "Nutrición enteral y parenteral clínica",
            "Suplementación guiada",
            "Educación nutricional y cambio de hábitos",
        ],
        relatedSpecialties: ["endocrinologia", "gastroenterologia", "medicina-del-deporte"],
    },

    // ============================================
    // NEUROCIRUGÍA
    // ============================================
    neurocirugia: {
        title: "Neurocirugía",
        description: "Cirugía de alta precisión para el sistema nervioso. Intervenciones complejas en cerebro, médula espinal y columna vertebral.",
        whatIsIt: "La neurocirugía es la especialidad quirúrgica que trata enfermedades del sistema nervioso central y periférico. Los neurocirujanos operan tumores cerebrales, aneurismas, hernias discales, traumatismos craneales y malformaciones, utilizando tecnología avanzada como microscopios y neuronavegadores.",
        whenToGo: [
            "Hernias discales que requieren cirugía",
            "Tumores cerebrales o espinales",
            "Traumatismos craneoencefálicos graves",
            "Aneurismas o malformaciones vasculares cerebrales",
            "Hidrocefalia",
            "Dolor de espalda severo con compromiso nervioso",
            "Epilepsia resistente a medicamentos (cirugía de epilepsia)",
        ],
        whyItMatters: [
            "Salva vidas en emergencias como hematomas cerebrales",
            "Permite extirpar tumores preservando funciones vitales",
            "Alivia el dolor incapacitante de la columna vertebral",
            "Corrige malformaciones congénitas graves",
            "Previene daños neurológicos irreversibles por compresión",
        ],
        treatments: [
            "Cirugía de tumores cerebrales (craneotomía)",
            "Microcirugía de hernia discal y columna",
            "Clipaje de aneurismas cerebrales",
            "Colocación de válvulas para hidrocefalia",
            "Cirugía funcional para Parkinson y epilepsia",
            "Tratamiento quirúrgico del dolor",
            "Radiocirugía estereotáctica",
        ],
        relatedSpecialties: ["neurologia", "traumatologia-y-ortopedia", "oncologia-medica"],
    },

    // ============================================
    // CIRUGÍA CARDIOVASCULAR
    // ============================================
    "cirugia-cardiovascular": {
        title: "Cirugía Cardiovascular",
        description: "Corazones en manos expertas. Cirugía de alta complejidad para reparar el corazón y los grandes vasos sanguíneos.",
        whatIsIt: "El cirujano cardiovascular realiza intervenciones quirúrgicas en el corazón y los vasos sanguíneos grandes. Realizan cirugías de bypass coronario, reemplazo de válvulas cardíacas, corrección de defectos congénitos del corazón y trasplantes cardíacos. Trabajan estrechamente con cardiólogos.",
        whenToGo: [
            "Enfermedad arterial coronaria severa (requiere bypass)",
            "Enfermedades de las válvulas cardíacas (estenosis/insuficiencia)",
            "Aneurismas de aorta torácica",
            "Defectos cardíacos congénitos",
            "Insuficiencia cardíaca terminal (trasplante/asistencia)",
            "Tumores cardíacos",
        ],
        whyItMatters: [
            "Restablece el flujo sanguíneo al corazón evitando infartos",
            "Repara válvulas permitiendo una función cardíaca normal",
            "Corrige defectos de nacimiento salvando vidas de niños",
            "Previene la ruptura fatal de aneurismas aórticos",
            "Ofrece una segunda oportunidad de vida mediante trasplantes",
        ],
        treatments: [
            "Bypass coronario (revascularización miocárdica)",
            "Reemplazo y reparación valvular",
            "Cirugía de aorta y grandes vasos",
            "Corrección de cardiopatías congénitas",
            "Trasplante cardíaco",
            "Implante de dispositivos de asistencia ventricular",
        ],
        relatedSpecialties: ["cardiologia", "anestesiologia", "medicina-intensiva"],
    },

    // ============================================
    // MEDICINA INTENSIVA
    // ============================================
    "medicina-intensiva": {
        title: "Medicina Intensiva",
        description: "Cuidados críticos para la vida. Especialidad dedicada al soporte vital y tratamiento de pacientes en estado de gravedad extrema.",
        whatIsIt: "Los intensivistas son expertos en el manejo de pacientes en estado crítico que requieren soporte vital avanzado. Trabajan en las Unidades de Cuidados Intensivos (UCI), monitoreando y tratando fallas orgánicas severas (pulmón, corazón, riñón) causadas por infecciones graves, traumas o cirugías complejas.",
        whenToGo: [
            "Generalmente no es una consulta externa, se ingresa por emergencia o tras cirugía compleja",
            "Falla respiratoria grave (necesidad de respirador)",
            "Shock (presión arterial peligrosamente baja)",
            "Sepsis severa (infección generalizada)",
            "Coma o estado de conciencia alterado grave",
            "Postoperatorio de cirugías de alto riesgo",
        ],
        whyItMatters: [
            "Brinda soporte vital cuando los órganos fallan",
            "El monitoreo continuo detecta complicaciones al instante",
            "Salva vidas en situaciones de riesgo inminente de muerte",
            "Coordina el cuidado complejo de múltiples especialistas",
            "Maneja el dolor y la sedación en pacientes graves",
        ],
        treatments: [
            "Ventilación mecánica (respirador artificial)",
            "Soporte hemodinámico con inotrópicos",
            "Diálisis continua en agudos",
            "Monitoreo invasivo avanzado",
            "Reanimación cardiopulmonar avanzada",
            "Nutrición artificial en paciente crítico",
        ],
        faqs: [
            {
                q: "¿Qué es una UCI?",
                a: "La Unidad de Cuidados Intensivos es un área hospitalaria equipada con tecnología avanzada y personal especializado 24/7 para atender a pacientes cuya vida corre peligro.",
            },
        ],
        relatedSpecialties: ["medicina-de-emergencias", "anestesiologia", "cirugia-general"],
    },

    // ============================================
    // ANESTESIOLOGÍA
    // ============================================
    anestesiologia: {
        title: "Anestesiología",
        description: "Seguridad y confort en tu cirugía. Expertos en el manejo del dolor, la sedación y el cuidado vital durante procedimientos quirúrgicos.",
        whatIsIt: "El anestesiólogo es el 'ángel de la guarda' en el quirófano. No solo duerme al paciente; su función principal es monitorear y mantener las funciones vitales (respiración, corazón, presión) durante la cirugía. También son especialistas en el manejo del dolor agudo y crónico fuera del quirófano.",
        whenToGo: [
            "Evaluación preanestésica antes de cualquier cirugía",
            "Manejo del dolor crónico en Clínicas del Dolor",
            "Analgesia para el parto (epidural)",
            "Sedación para procedimientos (endoscopias, resonancias)",
            "Interconsultas por dolor difícil de controlar",
        ],
        whyItMatters: [
            "Hace posible la cirugía moderna sin dolor ni recuerdos traumáticos",
            "Garantiza la seguridad y estabilidad del paciente mientras es operado",
            "Evalúa riesgos antes de la cirugía para prevenirlos",
            "Alivia el sufrimiento en dolores crónicos o parto",
            "Es experto en reanimación y manejo de vía aérea difícil",
        ],
        treatments: [
            "Anestesia general, regional (epidural/raquídea) y local",
            "Sedación consciente",
            "Bloqueos nerviosos para dolor",
            "Monitoreo intraoperatorio avanzado",
            "Analgesia postoperatoria",
            "Manejo de dolor oncológico y crónico",
        ],
        relatedSpecialties: ["medicina-del-dolor", "cirugia-general", "medicina-intensiva"],
    },
    // ============================================
    // CIRUGÍA PEDIÁTRICA
    // ============================================
    "cirugia-pediatrica": {
        title: "Cirugía Pediátrica",
        description: "Pequeños pacientes, grandes cuidados. Cirugía especializada para corregir defectos congénitos y enfermedades quirúrgicas en niños, desde recién nacidos hasta adolescentes.",
        whatIsIt: "El cirujano pediatra está entrenado para operar cuerpos en crecimiento. No es solo un cirujano de adultos que opera niños; conoce la fisiología única de los infantes y cómo una cirugía afecta su desarrollo futuro. Tratan desde hernias inguinales y fimosis hasta malformaciones complejas del recién nacido.",
        whenToGo: [
            "Hernias umbilicales o inguinales en niños",
            "Criptorquidea (testículo no descendido)",
            "Apendicitis en niños",
            "Malformaciones congénitas detectadas al nacer",
            "Fimosis o problemas urinarios quirúrgicos",
            "Tumores o masas en niños",
            "Cirugía mínimamente invasiva pediátrica",
        ],
        whyItMatters: [
            "Las técnicas quirúrgicas pediátricas son delicadas y precisas",
            "Corrige defectos que podrían afectar toda la vida del niño",
            "Utiliza abordajes mínimamente invasivos para menos dolor y cicatrices",
            "Maneja el estrés preoperatorio del niño y su familia",
            "Asegura un seguimiento del crecimiento post-quirúrgico",
        ],
        treatments: [
            "Hernioplastia y orquidopexia",
            "Circuncisión médica",
            "Apendicectomía laparoscópica",
            "Corrección de atresias y malformaciones digestivas",
            "Cirugía neonatal de alta complejidad",
            "Manejo de trauma pediátrico",
        ],
        relatedSpecialties: ["pediatria", "neonatologia", "anestesiologia"],
    },

    // ============================================
    // NEONATOLOGÍA
    // ============================================
    neonatologia: {
        title: "Neonatología",
        description: "El comienzo de la vida. Cuidado intensivo y especializado para los recién nacidos, especialmente los prematuros o con condiciones delicadas.",
        whatIsIt: "La neonatología es la rama de la pediatría dedicada a los primeros 28 días de vida, aunque el seguimiento de prematuros se extiende por años. Los neonatólogos son los 'intensivistas de los bebés', cuidando a prematuros extremos, bebés con infecciones graves, problemas respiratorios o defectos de nacimiento en la Unidad de Cuidados Intensivos Neonatales (UCIN).",
        whenToGo: [
            "Control del recién nacido sano",
            "Partos prematuros o de alto riesgo",
            "Bebés con bajo peso al nacer",
            "Dificultad respiratoria al nacer",
            "Ictericia severa (color amarillo)",
            "Infecciones en el recién nacido (sepsis)",
            "Seguimiento del desarrollo del prematuro",
        ],
        whyItMatters: [
            "Aumenta drásticamente la supervivencia de bebés prematuros",
            "Previene secuelas neurológicas y sensoriales (ceguera, sordera)",
            "Apoya la lactancia materna en situaciones difíciles",
            "Detecta tempranamente problemas metabólicos o congénitos",
            "Acompaña a la familia en el difícil proceso de la UCIN",
        ],
        treatments: [
            "Cuidados intensivos neonatales (UCIN)",
            "Soporte respiratorio (CPAP, ventilación)",
            "Fototerapia para ictericia",
            "Nutrición de prematuros extremos",
            "Tamizaje neonatal (prueba del talón)",
            "Ecografía cerebral transfontanelar",
        ],
        relatedSpecialties: ["pediatria", "ginecologia", "cirugia-pediatrica"],
    },

    // ============================================
    // MASTOLOGÍA
    // ============================================
    mastologia: {
        title: "Mastología",
        description: "Salud mamaria integral. Especialidad dedicada a la prevención, diagnóstico y tratamiento de las enfermedades de las mamas, benignas y malignas.",
        whatIsIt: "También conocida como senología, es la especialidad que se ocupa de las mamas. El mastólogo (que puede ser ginecólogo o cirujano oncólogo) es el experto en cáncer de mama, pero también trata dolor mamario, quistes, secreciones y mastitis. Su rol principal es la detección temprana y tratamiento del cáncer de mama.",
        whenToGo: [
            "Bultos o nódulos palpables en el seno o axila",
            "Cambios en la piel de la mama o pezón",
            "Secreción por el pezón (sangre o líquido)",
            "Dolor mamario persistente",
            "Chequeo anual a partir de los 40 años (o antes con antecedentes)",
            "Seguimiento de hallazgos en mamografía (BI-RADS 3, 4, 5)",
            "Antecedentes familiares fuertes de cáncer de mama",
        ],
        whyItMatters: [
            "El cáncer de mama es curable en alto porcentaje si se detecta a tiempo",
            "Ofrece opciones de cirugía conservadora que preservan el seno",
            "Realiza biopsias precisas para diagnósticos certeros",
            "Coordina el tratamiento oncológico integral",
            "Brinda asesoría genética en casos hereditarios",
        ],
        treatments: [
            "Examen clínico mamario",
            "Biopsias de mama (trucut, arpón, vacío)",
            "Cirugía conservadora de mama (lumpectomía)",
            "Mastectomía y ganglio centinela",
            "Drenaje de abscesos y mastitis",
            "Manejo de dolor mamario cíclico",
        ],
        relatedSpecialties: ["ginecologia", "oncologia-medica", "cirugia-plastica-y-reconstructiva"],
    },

    // ============================================
    // COLOPROCTOLOGÍA
    // ============================================
    coloproctologia: {
        title: "Coloproctología",
        description: "Salud intestinal baja. Diagnóstico y tratamiento médico-quirúrgico de enfermedades del colon, recto y ano.",
        whatIsIt: "El coloproctólogo es el cirujano especialista en el último tramo del tubo digestivo. Trata condiciones muy frecuentes y a veces incómodas como hemorroides, fisuras y fístulas, pero también patologías graves como el cáncer colorrectal, diverticulitis y enfermedades inflamatorias del intestino.",
        whenToGo: [
            "Sangrado rectal o en las heces",
            "Dolor anal o bultos en la zona",
            "Hemorroides inflamadas o dolorosas",
            "Estreñimiento crónico severo o incontinencia",
            "Fístulas o abscesos anales",
            "Antecedentes o sospecha de cáncer de colon",
            "Diverticulitis recurrentes",
        ],
        whyItMatters: [
            "El cáncer de recto y colon es prevenible y curable",
            "Ofrece soluciones definitivas para el dolor de hemorroides y fisuras",
            "Maneja la incontinencia fecal mejorando la calidad de vida social",
            "Realiza cirugías que preservan los esfínteres",
            "Trata complicaciones graves de la diverticulitis",
        ],
        treatments: [
            "Cirugía de hemorroides (convencional y láser)",
            "Tratamiento de fisuras y fístulas anales",
            "Cirugía de cáncer de colon y recto (laparoscópica)",
            "Colonoscopia terapéutica",
            "Manejo de prolapso rectal",
            "Cirugía de divertículos",
        ],
        relatedSpecialties: ["gastroenterologia", "cirugia-general", "oncologia-medica"],
    },

    // ============================================
    // CIRUGÍA VASCULAR Y ENDOVASCULAR
    // ============================================
    "cirugia-vascular-y-endovascular": {
        title: "Cirugía Vascular y Endovascular",
        description: "Circulación sana. Tratamiento de enfermedades de las arterias, venas y sistema linfático para prevenir infartos, trombosis y amputaciones.",
        whatIsIt: "El cirujano vascular cuida 'las tuberías' del cuerpo (excepto las del corazón y cerebro). Trata las varices (venas), la falta de circulación en las piernas (arterias) y los aneurismas. Utiliza técnicas abiertas tradicionales y modernas técnicas endovasculares (cateterismo) mínimamente invasivas.",
        whenToGo: [
            "Varices dolorosas o antiestéticas en las piernas",
            "Dolor en las piernas al caminar (claudicación)",
            "Hinchazón crónica de piernas o brazos",
            "Úlceras en las piernas que no curan",
            "Pie diabético con mala circulación",
            "Aneurismas de aorta abdominal (detección/tratamiento)",
            "Trombosis venosa profunda",
        ],
        whyItMatters: [
            "Previene la amputación en pacientes diabéticos y fumadores",
            "Evita la ruptura mortal de aneurismas de aorta",
            "Trata las varices para evitar trombosis y úlceras",
            "Destapa arterias carótidas para prevenir derrames cerebrales",
            "Mejora la calidad de vida al aliviar el dolor de piernas",
        ],
        treatments: [
            "Cirugía de varices (láser, radiofrecuencia, escleroterapia)",
            "Bypass arterial en piernas",
            "Angioplastia y stent en arterias periféricas",
            "Reparación endovascular de aneurismas (EVAR)",
            "Cirugía de carótidas",
            "Accesos vasculares para diálisis",
        ],
        relatedSpecialties: ["cardiologia", "radiologia-e-imagenes", "dermatologia"],
    },

    // ============================================
    // MEDICINA DE EMERGENCIAS
    // ============================================
    "medicina-de-emergencias": {
        title: "Medicina de Emergencias",
        description: "Respuesta rápida que salva vidas. Especialistas en la atención inicial, diagnóstico y estabilización de cualquier urgencia médica o traumática.",
        whatIsIt: "El emergenciólogo es el especialista de la 'hora dorada'. Está entrenado para tomar decisiones rápidas en situaciones de vida o muerte, atendiendo infartos, accidentes, intoxicaciones y crisis agudas de cualquier tipo. Su objetivo es estabilizar al paciente y definir el mejor curso de acción inmediato.",
        whenToGo: [
            "Dolor de pecho súbito o dificultad para respirar",
            "Accidentes de tránsito o caídas graves",
            "Pérdida de conciencia o convulsiones",
            "Sangrados abundantes que no paran",
            "Dolor abdominal agudo e intenso",
            "Síntomas de ACV (boca torcida, dificultad para hablar)",
            "Fiebre muy alta o intoxicaciones",
        ],
        whyItMatters: [
            "La atención en los primeros minutos define el pronóstico vital",
            "Identifica rápidamente cuadros graves vs. leves",
            "Maneja el dolor agudo de forma efectiva",
            "Coordina el sistema de respuesta hospitalaria",
            "Es la red de seguridad del sistema de salud",
        ],
        treatments: [
            "Reanimación cardiopulmonar avanzada (ACLS/ATLS)",
            "Manejo de vía aérea difícil",
            "Sutura de heridas y manejo de trauma",
            "Tratamiento de infartos y arritmias agudas",
            "Estabilización de fracturas",
            "Lavado gástrico y manejo de intoxicaciones",
        ],
        relatedSpecialties: ["medicina-intensiva", "traumatologia-y-ortopedia", "cardiologia"],
    },

    // ============================================
    // INMUNOLOGÍA
    // ============================================
    inmunologia: {
        title: "Inmunología",
        description: "Defensas bajo control. Estudio y tratamiento de enfermedades del sistema inmunitario, desde deficiencias hasta autoinmunidad.",
        whatIsIt: "La inmunología clínica se ocupa de los fallos en el sistema de defensa del cuerpo. Esto incluye las inmunodeficiencias (cuando faltan defensas y hay infecciones recurrentes) y las enfermedades autoinmunes (cuando el cuerpo se ataca a sí mismo). A menudo trabaja junto a reumatólogos y alergólogos.",
        whenToGo: [
            "Infecciones muy frecuentes, graves o inusuales",
            "Niños que no crecen bien debido a infecciones",
            "Sospecha de inmunodeficiencias primarias",
            "Enfermedades autoinmunes complejas",
            "Fiebre periódica sin causa infecciosa",
            "Evaluación post-trasplante",
        ],
        whyItMatters: [
            "Diagnostica defectos genéticos en las defensas que requieren tratamiento específico",
            "Permite el uso preciso de terapias biológicas modernas",
            "Previene daño orgánico en enfermedades autoinflamatorias",
            "Mejora la sobrevida en pacientes inmunosuprimidos",
        ],
        treatments: [
            "Reemplazo de inmunoglobulinas (IVIG)",
            "Uso de inmunomoduladores y biológicos",
            "Profilaxis antibiótica en inmunodeficientes",
            "Trasplante de células madre (en casos severos)",
            "Estudios genéticos inmunológicos",
        ],
        relatedSpecialties: ["alergologia", "hematologia", "reumatologia"],
    },

    // ============================================
    // GENÉTICA MÉDICA
    // ============================================
    "genetica-medica": {
        title: "Genética Médica",
        description: "El código de tu salud. Diagnóstico, asesoramiento y manejo de enfermedades hereditarias y condiciones genéticas.",
        whatIsIt: "El genetista médico estudia las enfermedades causadas por alteraciones en el ADN. Su rol es fundamental para diagnosticar síndromes raros, ofrecer consejo genético a familias con enfermedades hereditarias (como cáncer familiar) y guiar la medicina personalizada basada en el perfil genético.",
        whenToGo: [
            "Antecedentes familiares de enfermedades genéticas o cáncer",
            "Embarazo a edad avanzada o riesgo fetal",
            "Niños con retraso en el desarrollo o discapacidades intelectuales",
            "Malformaciones congénitas múltiples",
            "Infertilidad o abortos recurrentes",
            "Sospecha de enfermedades raras",
        ],
        whyItMatters: [
            "Permite tomar decisiones informadas sobre reproducción",
            "Identifica el riesgo de cáncer hereditario para prevenirlo a tiempo",
            "Pone nombre a enfermedades raras, acabando con la 'odisea diagnóstica'",
            "Guía tratamientos personalizados según el ADN",
            "Ofrece pronóstico y guía a las familias afectadas",
        ],
        treatments: [
            "Asesoramiento genético pre-concepcional y prenatal",
            "Estudios de cariotipo y exoma completo",
            "Paneles de cáncer hereditario",
            "Diagnóstico de enfermedades raras",
            "Medicina de precisión y farmacogenética",
        ],
        relatedSpecialties: ["pediatria", "ginecologia", "oncologia-medica"],
    },

    // ============================================
    // RADIOLOGÍA E IMÁGENES
    // ============================================
    "radiologia-e-imagenes": {
        title: "Radiología e Imágenes",
        description: "Ver para curar. Diagnóstico preciso mediante tecnologías de imagen avanzadas y procedimientos mínimamente invasivos guiados por imagen.",
        whatIsIt: "El radiólogo es el médico experto en interpretar imágenes médicas. No solo 'toma la foto', sino que diagnostica enfermedades a través de rayos X, tomografías (TC), resonancias (RM) y ultrasonido. Además, la radiología intervencionista permite tratar enfermedades navegando por dentro del cuerpo guiado por estas imágenes.",
        whenToGo: [
            "Generalmente por derivación de otro médico para estudios",
            "Chequeos preventivos (mamografía, ecografía)",
            "Diagnóstico de tumores, fracturas, infecciones",
            "Biopsias de órganos internos guiadas por imagen",
            "Tratamiento de miomas, aneurismas o tumores (intervencionismo)",
        ],
        whyItMatters: [
            "Es los 'ojos' de la medicina moderna: fundamental para casi todo diagnóstico",
            "Detecta cánceres en etapas milimétricas",
            "Permite cirugías y biopsias sin grandes incisiones (intervencionismo)",
            "Evalúa la respuesta a tratamientos (como quimioterapia)",
            "Guía con precisión procedimientos delicados",
        ],
        treatments: [
            "Interpretación de Rayos X, TC, RMN, PET-scan",
            "Ecografía Doppler y 3D/4D",
            "Biopsias percutáneas guiadas",
            "Embolización de tumores y sangrados",
            "Drenaje de abscesos",
            "Ablación por radiofrecuencia de tumores",
        ],
        relatedSpecialties: ["cirugia-vascular-y-endovascular", "oncologia-medica", "neurologia"],
    },

    // ============================================
    // MEDICINA DEL DOLOR
    // ============================================
    "medicina-del-dolor": {
        title: "Medicina del Dolor",
        description: "Alivio y calidad de vida. Enfoque multidisciplinario para el tratamiento del dolor crónico y complejo que no responde a terapias convencionales.",
        whatIsIt: "También llamada algología, es la especialidad dedicada a diagnosticar y tratar el dolor como una enfermedad en sí misma. Especialistas (generalmente anestesiólogos) utilizan fármacos avanzados, bloqueos nerviosos, y dispositivos implantables para aliviar a pacientes con dolor por cáncer, columna, fibromialgia o neuropatías.",
        whenToGo: [
            "Dolor crónico que dura más de 3-6 meses",
            "Dolor oncológico (por cáncer)",
            "Dolor de espalda post-cirugía que no mejora",
            "Neuralgias severas (como la del trigémino)",
            "Fibromialgia o dolor generalizado",
            "Cuando los analgésicos comunes no funcionan",
        ],
        whyItMatters: [
            "El dolor crónico destruye la calidad de vida, el sueño y el ánimo; tratarlo restaura a la persona",
            "Reduce el uso abusivo de analgésicos y opioides",
            "Permite a los pacientes con cáncer vivir con dignidad",
            "Evita cirugías innecesarias mediante técnicas mínimamente invasivas",
            "Ofrece esperanza cuando 'ya no hay nada que hacer'",
        ],
        treatments: [
            "Bloqueos nerviosos diagnósticos y terapéuticos",
            "Radiofrecuencia de nervios y facetas",
            "Neuroestimuladores medulares",
            "Bombas de infusión de analgésicos",
            "Manejo farmacológico avanzado",
            "Terapia física y psicológica del dolor",
        ],
        relatedSpecialties: ["anestesiologia", "traumatologia-y-ortopedia", "medicina-fisica-y-rehabilitacion"],
    },
    // ============================================
    // NEUROLOGÍA
    // ============================================
    neurologia: {
        title: "Neurología",
        description: "El control maestro de tu cuerpo. Diagnóstico y tratamiento de enfermedades del cerebro, médula espinal, nervios y músculos.",
        whatIsIt: "El neurólogo es el especialista en el sistema nervioso. Trata desde dolores de cabeza crónicos hasta enfermedades degenerativas como Alzheimer y Parkinson. No realiza cirugías (eso es neurocirugía), pero diagnostica y maneja condiciones complejas que afectan el pensamiento, movimiento y sensibilidad.",
        whenToGo: [
            "Dolores de cabeza intensos o migrañas frecuentes",
            "Pérdida de memoria o confusión",
            "Temblores involuntarios o debilidad muscular",
            "Mareos, vértigo o problemas de equilibrio",
            "Convulsiones o episodios de epilepsia",
            "Entumecimiento u hormigueo en extremidades",
            "Problemas de sueño (insomnio, apnea)",
        ],
        whyItMatters: [
            "Un diagnóstico temprano en Alzheimer o Parkinson mejora la calidad de vida",
            "Controla la epilepsia permitiendo una vida normal y segura",
            "Previene secuelas graves tras un accidente cerebrovascular (ACV)",
            "Alivia el dolor neuropático crónico",
            "Maneja la migraña evitando el abuso de analgésicos",
        ],
        treatments: [
            "Tratamiento de migrañas y cefaleas",
            "Manejo de epilepsia y convulsiones",
            "Tratamiento de Parkinson y temblores",
            "Manejo de Esclerosis Múltiple",
            "Evaluación de demencias y Alzheimer",
            "Estudios de conducción nerviosa (electromiografía)",
        ],
        relatedSpecialties: ["neurocirugia", "psiquiatria", "geriatria"],
    },

    // ============================================
    // GASTROENTEROLOGÍA
    // ============================================
    gastroenterologia: {
        title: "Gastroenterología",
        description: "Salud digestiva integral. Prevención, diagnóstico y tratamiento de enfermedades del esófago, estómago, hígado y colon.",
        whatIsIt: "El gastroenterólogo cuida todo el sistema digestivo. Es experto en tratar gastritis, reflujo, colitis y enfermedades del hígado. Además, realiza procedimientos endoscópicos fundamentales para prevenir el cáncer de colon y estómago.",
        whenToGo: [
            "Ardor o acidez estomacal frecuente (reflujo)",
            "Dolor abdominal persistente o hinchazón",
            "Estreñimiento crónico o diarrea",
            "Sangre en las heces",
            "Dificultad para tragar alimentos",
            "Pérdida de peso inexplicable",
            "Chequeo preventivo de colon (mayores de 45 años)",
        ],
        whyItMatters: [
            "La colonoscopia previene el cáncer de colon al extirpar pólipos",
            "Trata la bacteria Helicobacter pylori para evitar úlceras y cáncer",
            "Maneja enfermedades crónicas como Crohn o Colitis Ulcerosa",
            "Detecta a tiempo enfermedades del hígado graso o cirrosis",
            "Mejora la calidad de vida eliminando el dolor digestivo",
        ],
        treatments: [
            "Endoscopia digestiva alta (gastroscopia)",
            "Colonoscopia preventiva y terapéutica",
            "Tratamiento de Helicobacter pylori",
            "Manejo de hígado graso y hepatitis",
            "Tratamiento de Síndrome de Intestino Irritable",
            "Extracción de pólipos",
        ],
        relatedSpecialties: ["cirugia-general", "coloproctologia", "nutriologia"],
    },

    // ============================================
    // ENDOCRINOLOGÍA
    // ============================================
    endocrinologia: {
        title: "Endocrinología",
        description: "El equilibrio hormonal. Especialistas en glándulas y hormonas que regulan el metabolismo, crecimiento y reproducción.",
        whatIsIt: "El endocrinólogo trata los desequilibrios hormonales. Es el médico principal para la diabetes, problemas de tiroides, osteoporosis y trastornos del crecimiento. Su objetivo es restablecer el balance químico del cuerpo.",
        whenToGo: [
            "Diagnóstico o control de Diabetes",
            "Aumento o pérdida de peso inexplicable",
            "Cansancio extremo o caída de cabello (tiroides)",
            "Alteraciones menstruales o exceso de vello",
            "Problemas de crecimiento en niños",
            "Osteoporosis o fracturas frecuentes",
            "Infertilidad de causa hormonal",
        ],
        whyItMatters: [
            "El buen control de la diabetes previene ceguera y amputaciones",
            "Regula el metabolismo para un peso saludable",
            "Trata el hipotiroidismo devolviendo la energía al paciente",
            "Asegura el crecimiento y desarrollo sexual normal en niños",
            "Previene fracturas óseas en la menopausia",
        ],
        treatments: [
            "Control de Diabetes Tipo 1 y 2",
            "Tratamiento de hipo/hipertiroidismo",
            "Manejo de obesidad metabólica",
            "Tratamiento de Síndrome de Ovario Poliquístico",
            "Terapia de reemplazo hormonal",
            "Tratamiento de talla baja",
        ],
        relatedSpecialties: ["nutriologia", "medicina-interna", "ginecologia"],
    },

    // ============================================
    // DERMATOLOGÍA
    // ============================================
    dermatologia: {
        title: "Dermatología",
        description: "Salud y cuidado de tu piel. Expertos en el diagnóstico y tratamiento de enfermedades de piel, pelo y uñas.",
        whatIsIt: "El dermatólogo es el médico de la piel. Trata desde el acné y manchas hasta el cáncer de piel. También se ocupa de la estética médica, pero con una base científica sólida para garantizar la salud cutánea.",
        whenToGo: [
            "Acné severo o persistente",
            "Manchas nuevas o cambios en lunares (ABCDE)",
            "Caída excesiva del cabello (alopecia)",
            "Erupciones, picazón o alergias en piel",
            "Uñas frágiles o con hongos",
            "Rejuvenecimiento y estética facial",
            "Psoriasis o vitiligo",
        ],
        whyItMatters: [
            "Detecta el cáncer de piel (melanoma) a tiempo para curarlo",
            "Trata el acné evitando cicatrices permanentes en el rostro",
            "Controla enfermedades crónicas que afectan la autoestima",
            "Ofrece tratamientos estéticos seguros y efectivos",
            "Diagnostica enfermedades internas que se manifiestan en la piel",
        ],
        treatments: [
            "Control de acné y rosácea",
            "Revisión de lunares y dermatoscopia",
            "Cirugía de piel y biopsias",
            "Tratamiento de caída de cabello",
            "Láser y procedimientos estéticos",
            "Crioterapia para verrugas",
        ],
        relatedSpecialties: ["cirugia-plastica-y-reconstructiva", "alergologia", "pediatria"],
    },

    // ============================================
    // PSIQUIATRÍA
    // ============================================
    psiquiatria: {
        title: "Psiquiatría",
        description: "Salud mental y emocional. Diagnóstico y tratamiento médico de trastornos mentales para recuperar el bienestar psicológico.",
        whatIsIt: "El psiquiatra es un médico especializado en salud mental. A diferencia del psicólogo, puede recetar medicamentos y tratar desequilibrios químicos del cerebro. Maneja condiciones como depresión severa, ansiedad, bipolaridad y esquizofrenia, combinando fármacos y psicoterapia.",
        whenToGo: [
            "Tristeza profunda o desesperanza persistente",
            "Ansiedad incontrolable o ataques de pánico",
            "Cambios drásticos de humor o energía",
            "Pensamientos obsesivos o alucinaciones",
            "Problemas graves de sueño o alimentación",
            "Adicciones a sustancias",
            "Ideas de hacerse daño",
        ],
        whyItMatters: [
            "La salud mental es tan importante como la física",
            "Trata la depresión previniendo consecuencias fatales",
            "Permite a las personas retomar su vida laboral y familiar",
            "Maneja crisis emocionales agudas",
            "Reduce el estigma de las enfermedades mentales mediante la ciencia",
        ],
        treatments: [
            "Psicofarmacología (medicamentos)",
            "Psicoterapia de apoyo",
            "Manejo de ansiedad y depresión",
            "Tratamiento de adicciones",
            "Atención de crisis y urgencias psiquiátricas",
            "Terapia de pareja o familiar",
        ],
        relatedSpecialties: ["psicologia-clinica", "neurologia", "medicina-interna"],
    },

    // ============================================
    // OFTALMOLOGÍA
    // ============================================
    oftalmologia: {
        title: "Oftalmología",
        description: "Visión clara y ojos sanos. Cuidado médico y quirúrgico integral de la visión y el sistema ocular.",
        whatIsIt: "El oftalmólogo es el cirujano de los ojos. Trata enfermedades como cataratas, glaucoma y problemas de retina. También corrige problemas de visión como miopía y astigmatismo mediante lentes o cirugía láser.",
        whenToGo: [
            "Visión borrosa o disminución de agudeza visual",
            "Dolor ocular o enrojecimiento persistente",
            "Ver 'moscas volando' o destellos de luz",
            "Diabetes (para revisar fondo de ojo)",
            "Antecedentes de glaucoma en la familia",
            "Chequeo escolar en niños",
            "Deseo de dejar de usar lentes (cirugía)",
        ],
        whyItMatters: [
            "Previene la ceguera por glaucoma o diabetes",
            "Restaura la visión perdida por cataratas mediante cirugía rápida",
            "Corrige defectos visuales mejorando el rendimiento diario",
            "Detecta tumores oculares a tiempo",
            "Cuida el sentido más valorado: la vista",
        ],
        treatments: [
            "Cirugía de cataratas con lente intraocular",
            "Cirugía láser refractiva (LASIK)",
            "Tratamiento de glaucoma",
            "Inyecciones intraoculares para retina",
            "Corrección de estrabismo",
            "Trasplante de córnea",
        ],
        relatedSpecialties: ["neurologia", "pediatria", "medicina-interna"],
    },

    // ============================================
    // GINECOLOGÍA
    // ============================================
    ginecologia: {
        title: "Ginecología",
        description: "Salud integral de la mujer. Cuidado preventivo y tratamiento de enfermedades del sistema reproductivo femenino en todas las etapas.",
        whatIsIt: "El ginecólogo acompaña a la mujer desde la adolescencia hasta la postmenopausia. Se enfoca en la salud reproductiva, prevención de cáncer (papanicolau), anticoncepción y tratamiento de infecciones o problemas hormonales.",
        whenToGo: [
            "Chequeo anual preventivo (Papanicolau)",
            "Irregularidades o dolor menstrual",
            "Inicio de vida sexual y anticoncepción",
            "Flujo anormal o infecciones vaginales",
            "Síntomas de menopausia",
            "Dolor pélvico",
            "Dificultad para embarazarse",
        ],
        whyItMatters: [
            "Previene y detecta tempranamente el cáncer de cuello uterino y mama",
            "Permite una planificación familiar segura y efectiva",
            "Trata condiciones dolorosas como endometriosis",
            "Mejora la calidad de vida durante la menopausia",
            "Detecta enfermedades de transmisión sexual a tiempo",
        ],
        treatments: [
            "Papanicolau y Colposcopia",
            "Métodos anticonceptivos (DIU, Implante, Pastillas)",
            "Cirugía ginecológica laparoscópica",
            "Tratamiento de miomas y quistes",
            "Manejo de menopausia y climaterio",
            "Cirugía de piso pélvico",
        ],
        relatedSpecialties: ["obstetricia", "mastologia", "endocrinologia"],
    },

    // ============================================
    // OBSTETRICIA
    // ============================================
    obstetricia: {
        title: "Obstetricia",
        description: "El milagro de la vida. Cuidado médico especializado durante el embarazo, parto y puerperio para madre y bebé.",
        whatIsIt: "El obstetra cuida a la mujer y al feto durante el embarazo. Su misión es detectar riesgos como preeclampsia o diabetes gestacional y asegurar que el bebé nazca sano, ya sea por parto natural o cesárea.",
        whenToGo: [
            "Sospecha o confirmación de embarazo",
            "Control prenatal mensual",
            "Embarazo de alto riesgo",
            "Dolor abdominal o sangrado en el embarazo",
            "Planificación del parto",
            "Consulta pre-concepcional (antes de embarazarse)",
        ],
        whyItMatters: [
            "Garantiza la salud de dos vidas simultáneamente",
            "Previene complicaciones graves como parto prematuro o eclampsia",
            "Detecta malformaciones fetales mediante ecografía especializada",
            "Prepara a la madre física y emocionalmente para el parto",
            "Reduce la mortalidad materna e infantil",
        ],
        treatments: [
            "Control prenatal integral",
            "Ecografía obstétrica y Doppler fetal",
            "Atención de parto natural y humanizado",
            "Cesárea segmentaria",
            "Cerclaje cervical (para evitar parto prematuro)",
            "Monitoreo fetal electrónico",
        ],
        relatedSpecialties: ["ginecologia", "neonatologia", "genetica-medica"],
    },

    // ============================================
    // PEDIATRÍA
    // ============================================
    pediatria: {
        title: "Pediatría",
        description: "Creciendo sanos y fuertes. Atención médica integral para bebés, niños y adolescentes, vigilando su desarrollo y salud.",
        whatIsIt: "El pediatra no es solo el médico de los niños enfermos; es el guardián de su crecimiento y desarrollo sano. Realiza controles de 'niño sano', aplica vacunas y guía a los padres en nutrición y crianza, además de tratar enfermedades comunes de la infancia.",
        whenToGo: [
            "Control de niño sano (mensual el primer año)",
            "Vacunación según esquema",
            "Fiebre, tos, diarrea o vómitos",
            "Problemas de crecimiento o peso",
            "Dudas sobre alimentación o sueño",
            "Problemas escolares o de conducta",
            "Cualquier enfermedad en menores de 18 años",
        ],
        whyItMatters: [
            "Asegura que el niño alcance su máximo potencial de desarrollo",
            "Previene enfermedades graves mediante vacunas",
            "Detecta tempranamente problemas de visión, audición o aprendizaje",
            "Educa a la familia en hábitos saludables de por vida",
            "Trata infecciones y problemas comunes de forma segura para niños",
        ],
        treatments: [
            "Control de crecimiento y desarrollo",
            "Vacunación infantil",
            "Manejo de infecciones respiratorias y digestivas",
            "Evaluación nutricional pediátrica",
            "Atención del recién nacido",
            "Tamizajes preventivos",
        ],
        relatedSpecialties: ["neonatologia", "cirugia-pediatrica", "alergologia"],
    },

    // ============================================
    // TRAUMATOLOGÍA Y ORTOPEDIA
    // ============================================
    "traumatologia-y-ortopedia": {
        title: "Traumatología y Ortopedia",
        description: "Huesos fuertes, vida activa. Tratamiento médico y quirúrgico de lesiones y enfermedades del sistema musculoesquelético.",
        whatIsIt: "El traumatólogo repara huesos rotos, articulaciones desgastadas y lesiones deportivas. Trata fracturas, esguinces, artrosis y problemas de columna. Utiliza desde yesos y férulas hasta prótesis de cadera y rodilla de alta tecnología.",
        whenToGo: [
            "Fracturas, golpes fuertes o esguinces",
            "Dolor de rodilla, cadera o hombro persistente",
            "Lesiones deportivas (ligamentos, meniscos)",
            "Dolor de espalda o hernia discal",
            "Deformidades en pies (juanetes) o columna",
            "Artrosis y desgaste articular",
            "Túnel carpiano o dolor de manos",
        ],
        whyItMatters: [
            "Restaura la movilidad permitiendo volver a caminar o hacer deporte",
            "Elimina el dolor crónico articular mediante reemplazos articulares",
            "Corrige fracturas para evitar deformidades futuras",
            "Trata lesiones deportivas permitiendo el retorno a la actividad",
            "Mejora la calidad de vida en adultos mayores con artrosis",
        ],
        treatments: [
            "Cirugía de prótesis de cadera y rodilla",
            "Artroscopia (cirugía mínimamente invasiva articular)",
            "Reducción y fijación de fracturas",
            "Cirugía de ligamentos cruzados y meniscos",
            "Infiltraciones articulares",
            "Corrección de juanetes y deformidades",
        ],
        relatedSpecialties: ["medicina-fisica-y-rehabilitacion", "reumatologia", "medicina-del-deporte"],
    },
    // ============================================
    // CARDIOLOGÍA PEDIÁTRICA
    // ============================================
    "cardiologia-pediatrica": {
        title: "Cardiología Pediátrica",
        description: "Corazones pequeños, cuidados inmensos. Diagnóstico y tratamiento de enfermedades del corazón en bebés, niños y adolescentes.",
        whatIsIt: "El cardiólogo pediatra es el experto en el corazón de los niños, desde antes de nacer (fetal) hasta la edad adulta joven. Trata malformaciones congénitas (defectos de nacimiento) y problemas adquiridos como soplos, arritmias o hipertensión en niños.",
        whenToGo: [
            "Detección de un soplo cardíaco",
            "Color morado en labios o uñas (cianosis)",
            "Cansancio excesivo al comer (bebés) o hacer deporte",
            "Desmayos o dolor de pecho en niños",
            "Antecedentes familiares de muerte súbita",
            "Hipertensión arterial en niños",
        ],
        whyItMatters: [
            "Diagnostica defectos congénitos que requieren cirugía salvadora",
            "Diferencia soplos inocentes de enfermedades reales",
            "Previene la muerte súbita en jóvenes deportistas",
            "Monitorea secuelas de enfermedades como Kawasaki",
        ],
        treatments: [
            "Ecocardiograma fetal y pediátrico",
            "Electrocardiograma infantil",
            "Holter de ritmo",
            "Cateterismo diagnóstico",
            "Prueba de esfuerzo en niños",
        ],
        relatedSpecialties: ["pediatria", "cardiologia", "cirugia-cardiovascular"],
    },

    // ============================================
    // NEUROLOGÍA PEDIÁTRICA
    // ============================================
    "neurologia-pediatrica": {
        title: "Neurología Pediátrica",
        description: "Protegiendo el desarrollo cerebral. Atención especializada para enfermedades del sistema nervioso en niños en crecimiento.",
        whatIsIt: "El neuropediatra vigila la maduración del sistema nervioso. Trata epilepsias infantiles, retrasos en el desarrollo, parálisis cerebral, autismo y dolores de cabeza en niños. Su enfoque es permitir que el niño alcance su máximo potencial neurológico.",
        whenToGo: [
            "Convulsiones o crisis febriles",
            "Retraso en comenzar a caminar o hablar",
            "Dolores de cabeza frecuentes en niños",
            "Hiperactividad o problemas de atención severos",
            "Movimientos anormales o tics",
            "Debilidad muscular",
        ],
        whyItMatters: [
            "El diagnóstico temprano en autismo o retraso mejora el pronóstico radicalmente",
            "Controla la epilepsia para evitar daño cognitivo",
            "Diagnostica enfermedades raras metabólicas o genéticas",
            "Ayuda al niño con dificultades escolares a adaptarse",
        ],
        treatments: [
            "Electroencefalograma (EEG)",
            "Evaluación del neurodesarrollo",
            "Tratamiento de epilepsia infantil",
            "Manejo de migraña pediátrica",
            "Tratamiento de TDAH",
        ],
        relatedSpecialties: ["pediatria", "neurologia", "psicologia-clinica"],
    },

    // ============================================
    // GASTROENTEROLOGÍA PEDIÁTRICA
    // ============================================
    "gastroenterologia-pediatrica": {
        title: "Gastroenterología Pediátrica",
        description: "Barriguitas sanas. Diagnóstico y tratamiento de problemas digestivos, hepáticos y nutricionales en la infancia.",
        whatIsIt: "El gastroenterólogo pediatra trata problemas comunes como el reflujo y el cólico, pero también enfermedades complejas como alergias alimentarias severas, enfermedad celíaca y hepatitis en niños. Asegura que los problemas digestivos no afecten el crecimiento.",
        whenToGo: [
            "Diarrea crónica o estreñimiento severo",
            "Vómitos recurrentes o reflujo que no mejora",
            "Dolor abdominal crónico",
            "Sangrado digestivo en niños",
            "Fallo de medro (no gana peso)",
            "Piel amarilla (ictericia)",
        ],
        whyItMatters: [
            "Distinguir alergias alimentarias reales evita dietas innecesarias",
            "Trata el estreñimiento antes de que se vuelva un problema psicológico",
            "Maneja la enfermedad inflamatoria intestinal para asegurar el crecimiento",
            "Extrae objetos tragados accidentalmente sin cirugía",
        ],
        treatments: [
            "Endoscopia pediátrica",
            "Test de aliento para intolerancias",
            "Manejo de alergia a proteína de leche de vaca",
            "Tratamiento de reflujo gastroesofágico",
            "Nutrición en enfermedades digestivas",
        ],
        relatedSpecialties: ["pediatria", "gastroenterologia", "nutriologia"],
    },

    // ============================================
    // NEUMOLOGÍA PEDIÁTRICA
    // ============================================
    "neumologia-pediatrica": {
        title: "Neumología Pediátrica",
        description: "Respirando libremente desde pequeños. Cuidado experto para asma, alergias y enfermedades respiratorias en niños.",
        whatIsIt: "El neumólogo pediatra es especialista en pulmones en desarrollo. Trata el asma (la enfermedad crónica más común en niños), bronquitis recurrentes, fibrosis quística y problemas respiratorios del sueño como la apnea.",
        whenToGo: [
            "Tos crónica o recurrente",
            "Sibilancias (silbidos) en el pecho",
            "Neumonías frecuentes",
            "Ronquidos fuertes o pausas respiratorias al dormir",
            "Bebés prematuros con displasia broncopulmonar",
            "Falta de aire al hacer ejercicio",
        ],
        whyItMatters: [
            "El asma mal controlada es causa principal de ausentismo escolar",
            "Previene daño pulmonar permanente en enfermedades crónicas",
            "Mejora la calidad de sueño y rendimiento escolar",
            "Maneja secuelas respiratorias de prematuridad",
        ],
        treatments: [
            "Espirometría infantil",
            "Pruebas de alergia respiratoria",
            "Fibrobroncoscopia pediátrica",
            "Manejo de inhaladores y nebulizaciones",
            "Tratamiento de fibrosis quística",
        ],
        relatedSpecialties: ["pediatria", "neumologia", "alergologia"],
    },

    // ============================================
    // NEFROLOGÍA PEDIÁTRICA
    // ============================================
    "nefrologia-pediatrica": {
        title: "Nefrología Pediátrica",
        description: "Cuidando los riñones de los niños. Diagnóstico y tratamiento de infecciones urinarias, hipertensión y enfermedades renales infantiles.",
        whatIsIt: "El nefrólogo pediatra se especializa en el riñón y vías urinarias de los niños. Trata desde infecciones urinarias recurrentes y enuresis (mojar la cama) hasta insuficiencia renal y diálisis en niños.",
        whenToGo: [
            "Infecciones urinarias frecuentes",
            "Sangre o proteínas en la orina",
            "Hipertensión arterial en niños",
            "Hinchazón de cara o cuerpo (edema)",
            "Mojar la cama después de los 5-6 años",
            "Síndrome nefrótico o nefrítico",
        ],
        whyItMatters: [
            "Previene el daño renal permanente por infecciones recurrentes",
            "Controla la presión alta protegiendo corazón y cerebro",
            "Maneja el fallo renal permitiendo que el niño siga creciendo",
            "Trata cálculos renales en la infancia",
        ],
        treatments: [
            "Manejo de infecciones urinarias complejas",
            "Biopsia renal percutánea",
            "Diálisis pediátrica",
            "Tratamiento de vejiga neurogénica",
            "Control de hipertensión infantil",
        ],
        relatedSpecialties: ["pediatria", "urologia", "nefrologia"],
    },

    // ============================================
    // ENDOCRINOLOGÍA PEDIÁTRICA
    // ============================================
    "endocrinologia-pediatrica": {
        title: "Endocrinología Pediátrica",
        description: "Hormonas y crecimiento bajo control. Especialistas en problemas de crecimiento, pubertad y diabetes infantil.",
        whatIsIt: "El endocrinólogo pediatra vigila las hormonas que controlan el crecimiento y desarrollo sexual. Trata la baja estatura, pubertad precoz o tardía, obesidad infantil y diabetes tipo 1.",
        whenToGo: [
            "Niño es mucho más bajo que sus compañeros",
            "Signos de pubertad muy temprana (antes de 8-9 años) o tardía",
            "Diabetes en niños (sed excesiva, orina mucho)",
            "Obesidad severa",
            "Problemas de tiroides (bocio)",
            "Genitales ambiguos o alteraciones del desarrollo sexual",
        ],
        whyItMatters: [
            "Tratar la falta de hormona de crecimiento a tiempo permite alcanzar estatura normal",
            "Frena la pubertad precoz para evitar problemas psicosociales y de estatura",
            "Enseña a vivir con diabetes tipo 1 de forma saludable",
            "Previene complicaciones metabólicas de la obesidad infantil",
        ],
        treatments: [
            "Tratamiento con Hormona de Crecimiento",
            "Bloqueo puberal para pubertad precoz",
            "Manejo de bomba de insulina y diabetes",
            "Tratamiento de hipotiroidismo congénito",
            "Evaluación de edad ósea",
        ],
        relatedSpecialties: ["pediatria", "endocrinologia", "genetica-medica"],
    },

    // ============================================
    // INFECTOLOGÍA PEDIÁTRICA
    // ============================================
    "infectologia-pediatrica": {
        title: "Infectología Pediátrica",
        description: "Expertos en infecciones infantiles. Diagnóstico y tratamiento de enfermedades infecciosas complejas, recurrentes o graves en niños.",
        whatIsIt: "El infectólogo pediatra es el detective de las infecciones. Cuando un niño tiene fiebre sin causa, infecciones que no curan con antibióticos comunes, o enfermedades tropicales/raras, este especialista es quien lo resuelve. También maneja VIH infantil y tuberculosis.",
        whenToGo: [
            "Fiebre prolongada de origen desconocido",
            "Infecciones que repiten mucho o muy graves",
            "Sospecha de enfermedades tropicales (Dengue, Zika)",
            "VIH o tuberculosis en niños",
            "Infecciones óseas o articulares",
            "Asesoría en vacunas especiales o de viaje",
        ],
        whyItMatters: [
            "Evita el uso innecesario y dañino de antibióticos",
            "Diagnostica infecciones graves a tiempo para evitar secuelas",
            "Protege a niños con defensas bajas (cáncer, trasplantes)",
            "Maneja brotes epidémicos en escuelas o guarderías",
        ],
        treatments: [
            "Manejo antibiótico avanzado",
            "Tratamiento de infecciones congénitas (TORCH)",
            "Manejo de VIH pediátrico",
            "Tratamiento de osteomielitis",
            "Asesoramiento en vacunación",
        ],
        relatedSpecialties: ["pediatria", "infectologia", "inmunologia"],
    },

    // ============================================
    // DERMATOLOGÍA PEDIÁTRICA
    // ============================================
    "dermatologia-pediatrica": {
        title: "Dermatología Pediátrica",
        description: "Piel infantil sana. Cuidado especializado para enfermedades de la piel, uñas y pelo en bebés y niños.",
        whatIsIt: "Los niños tienen enfermedades de piel únicas (como dermatitis atópica severa, hemangiomas o 'manchas de nacimiento') que requieren un manejo diferente al del adulto. El dermatólogo pediatra conoce la delicadeza de la piel infantil y sus tratamientos seguros.",
        whenToGo: [
            "Eczema o dermatitis atópica difícil de controlar",
            "Hemangiomas (manchas rojas que crecen)",
            "Lunares congénitos grandes o que cambian",
            "Infecciones de piel recurrentes",
            "Vitiligo o psoriasis en niños",
            "Acné infantil o neonatal",
        ],
        whyItMatters: [
            "Trata los hemangiomas a tiempo para evitar deformidades",
            "Alivia la picazón de la dermatitis mejorando el sueño del niño y familia",
            "Vigila lunares para prevenir cáncer futuro",
            "Ofrece tratamientos que no duelen ni asustan al niño",
        ],
        treatments: [
            "Tratamiento de dermatitis atópica avanzada",
            "Manejo de hemangiomas (betabloqueantes)",
            "Crioterapia suave para verrugas",
            "Dermatoscopia de lunares",
            "Cirugía dermatológica infantil",
        ],
        relatedSpecialties: ["pediatria", "dermatologia", "alergologia"],
    },

    // ============================================
    // OFTALMOLOGÍA PEDIÁTRICA
    // ============================================
    "oftalmologia-pediatrica": {
        title: "Oftalmología Pediátrica",
        description: "Visiones de futuro. Especialistas en el desarrollo visual y enfermedades oculares en niños, incluyendo estrabismo.",
        whatIsIt: "El oftalmólogo pediatra se especializa en ojos que aún están aprendiendo a ver. Trata el estrabismo (ojos bizcos), la ambliopía ('ojo vago'), cataratas congénitas y necesidad de lentes en niños que a veces no saben decir que ven mal.",
        whenToGo: [
            "Desviación de los ojos (estrabismo)",
            "Se acerca mucho a la TV o entrecierra ojos",
            "Reflejo blanco en la pupila (urgencia)",
            "Lagrimeo constante en bebés",
            "Bebés prematuros (retinopatía)",
            "Chequeo visual preescolar obligatorio",
        ],
        whyItMatters: [
            "Corrige el 'ojo vago' antes de los 7 años para evitar ceguera permanente de ese ojo",
            "Detecta retinoblastoma (tumor ocular) salvando la vida",
            "Alinea los ojos mejorando la visión 3D y la estética",
            "Permite que el niño vea el pizarrón y aprenda bien",
        ],
        treatments: [
            "Cirugía de estrabismo",
            "Tratamiento con parches para ambliopía",
            "Prescripción de lentes infantiles",
            "Sondeo de vía lagrimal",
            "Cirugía de catarata congénita",
        ],
        relatedSpecialties: ["pediatria", "oftalmologia", "neurologia"],
    },

    // ============================================
    // ORTOPEDIA PEDIÁTRICA
    // ============================================
    "ortopedia-pediatrica": {
        title: "Ortopedia Pediátrica",
        description: "Pasos firmes hacia el crecimiento. Corrección de deformidades y tratamiento de problemas óseos en niños.",
        whatIsIt: "El ortopedista infantil trata deformidades de columna (escoliosis), caderas (displasia) y pies (pie equinovaro o plano). A diferencia del adulto, usa el potencial de crecimiento del niño para corregir problemas mediante aparatos o cirugías.",
        whenToGo: [
            "Cojera o dolor al caminar",
            "Deformidades en pies (pie zambo, plano doloroso)",
            "Curvatura en la espalda (escoliosis)",
            "Displasia de cadera (bebé)",
            "Piernas arqueadas o en 'X' excesivas",
            "Fracturas en niños (afectan cartílago de crecimiento)",
        ],
        whyItMatters: [
            "Corrige la displasia de cadera evitando prótesis tempranas de adulto",
            "Trata la escoliosis evitando problemas pulmonares graves",
            "Endereza los pies permitiendo caminar y correr normal",
            "Maneja fracturas para que el hueso no deje de crecer",
        ],
        treatments: [
            "Corrección de pie equinovaro (Método Ponseti)",
            "Arnés de Pavlik para displasia de cadera",
            "Cirugía de escoliosis",
            "Manejo de fracturas infantiles",
            "Alargamientos óseos",
        ],
        relatedSpecialties: ["pediatria", "traumatologia-y-ortopedia", "medicina-fisica-y-rehabilitacion"],
    },
    // ============================================
    // CIRUGÍA TORÁCICA
    // ============================================
    "cirugia-toracica": {
        title: "Cirugía Torácica",
        description: "Expertos en la caja torácica. Tratamiento quirúrgico de enfermedades de los pulmones, pleura y mediastino.",
        whatIsIt: "El cirujano torácico opera todo lo que está dentro del pecho (excepto el corazón, que es cirugía cardiovascular). Esto incluye cáncer de pulmón, infecciones pleurales severas (empiema), sudoración excesiva de manos y deformidades del tórax.",
        whenToGo: [
            "Diagnóstico de cáncer de pulmón",
            "Sudoración excesiva en manos y axilas (Hiperhidrosis)",
            "Líquido o aire en el pulmón (derrame pleural)",
            "Biopsias pulmonares",
            "Nódulos en el pulmón",
            "Deformidades del pecho (pectus excavatum)",
        ],
        whyItMatters: [
            "El tratamiento quirúrgico del cáncer de pulmón en etapas tempranas es curativo",
            "Resuelve la hiperhidrosis devolviendo la confianza social al paciente",
            "Trata infecciones pulmonares graves salvando el pulmón",
            "Corrige deformidades torácicas que afectan corazón o pulmones",
        ],
        treatments: [
            "Lobectomía pulmonar por videotoracoscopia (VATS)",
            "Simpatectomía para hiperhidrosis",
            "Biopsia pulmonar y pleural",
            "Corrección de Pectus Excavatum/Carinatum",
            "Decorticación pleural",
        ],
        relatedSpecialties: ["neumologia", "oncologia-medica", "cirugia-cardiovascular"],
    },

    // ============================================
    // CIRUGÍA BARIÁTRICA
    // ============================================
    "cirugia-bariatrica": {
        title: "Cirugía Bariátrica",
        description: "Transformando vidas. Tratamiento quirúrgico de la obesidad severa y enfermedades metabólicas relacionadas.",
        whatIsIt: "El cirujano bariátrico es experto en técnicas para la pérdida masiva de peso en pacientes con obesidad mórbida. No es una cirugía estética, sino metabólica: busca curar o mejorar la diabetes, hipertensión y apnea del sueño asociadas al exceso de peso.",
        whenToGo: [
            "Obesidad severa (IMC > 35-40)",
            "Diabetes tipo 2 difícil de controlar con medicamentos",
            "Imposibilidad de bajar de peso con dietas y ejercicio",
            "Complicaciones de obesidad (hígado graso, dolor articular)",
            "Apnea del sueño severa por obesidad",
        ],
        whyItMatters: [
            "Logra una pérdida de peso sostenida imposible de alcanzar solo con dieta",
            "Puede revertir la diabetes tipo 2 y la hipertensión",
            "Aumenta la esperanza de vida en pacientes con obesidad mórbida",
            "Mejora radicalmente la movilidad y calidad de vida",
        ],
        treatments: [
            "Manga gástrica laparoscópica",
            "Bypass gástrico en Y de Roux",
            "Cirugía de revisión (para reganancia de peso)",
            "Balón gástrico (no quirúrgico)",
            "Seguimiento nutricional post-quirúrgico",
        ],
        relatedSpecialties: ["nutriologia", "endocrinologia", "psicologia-clinica"],
    },

    // ============================================
    // CIRUGÍA ONCOLÓGICA
    // ============================================
    "cirugia-oncologica": {
        title: "Cirugía Oncológica",
        description: "Manos que curan el cáncer. Especialistas en la extirpación quirúrgica de tumores sólidos complejos.",
        whatIsIt: "El cirujano oncólogo posee entrenamiento avanzado para operar cánceres difíciles. Su objetivo no es solo quitar el tumor, sino hacerlo con márgenes limpios y extirpando ganglios necesarios para asegurar la curación y evitar recurrencias.",
        whenToGo: [
            "Diagnóstico de cáncer de estómago, páncreas o hígado",
            "Melanoma y cáncer de piel avanzado",
            "Sarcomas (tumores de tejidos blandos)",
            "Cáncer de mama complejo",
            "Tumores abdominales grandes",
            "Cáncer de tiroides avanzado",
        ],
        whyItMatters: [
            "La cirugía sigue siendo la principal oportunidad de cura para muchos tumores sólidos",
            "Realiza cirugías complejas (como Whipple) que requieren alta especialización",
            "Trabaja en equipo con oncólogos médicos para el mejor resultado",
            "Preserva la función de órganos mientras elimina el cáncer",
        ],
        treatments: [
            "Cirugía de cáncer gástrico y esofágico",
            "Cirugía hepato-bilio-pancreática (Whipple)",
            "Mastectomía y cirugía conservadora de mama",
            "Disección de ganglios linfáticos",
            "Cirugía de sarcomas y tumores retroperitoneales",
        ],
        relatedSpecialties: ["oncologia-medica", "radioterapia", "gastroenterologia"],
    },

    // ============================================
    // CIRUGÍA DE COLUMNA
    // ============================================
    "cirugia-de-columna": {
        title: "Cirugía de Columna",
        description: "Estabilidad y movimiento. Especialistas en reparar la columna vertebral, médula y nervios afectados.",
        whatIsIt: "Puede ser un neurocirujano o un traumatólogo con subespecialidad en columna. Trata hernias discales, fracturas vertebrales, escoliosis severa y estenosis (estrechamiento) del canal que comprime los nervios y causa dolor o debilidad.",
        whenToGo: [
            "Hernia discal que no mejora con terapia",
            "Ciática severa o pérdida de fuerza en piernas",
            "Fracturas de vértebras por accidentes u osteoporosis",
            "Escoliosis progresiva",
            "Dolor de cuello o espalda incapacitante",
            "Tumores en la columna",
        ],
        whyItMatters: [
            "Evita la parálisis permanente en lesiones graves",
            "Alivia el dolor crónico que impide caminar o dormir",
            "Corrige deformidades que afectan la postura y pulmones",
            "Estabiliza la columna tras traumatismos",
        ],
        treatments: [
            "Discectomía (extracción de hernia discal)",
            "Fusión vertebral (artrodesis)",
            "Cirugía de escoliosis",
            "Vertebroplastia para fracturas por osteoporosis",
            "Laminectomía descompresiva",
        ],
        relatedSpecialties: ["traumatologia-y-ortopedia", "neurocirugia", "medicina-del-dolor"],
    },

    // ============================================
    // MEDICINA DEL DEPORTE
    // ============================================
    "medicina-del-deporte": {
        title: "Medicina del Deporte",
        description: "Rendimiento y recuperación. Atención integral para atletas y personas activas, previniendo y tratando lesiones.",
        whatIsIt: "El médico deportólogo no solo atiende a atletas de élite, sino a cualquier persona que quiera hacer ejercicio de forma segura. Trata lesiones por sobreuso, prescribe ejercicio como medicina para enfermedades crónicas y optimiza el rendimiento físico.",
        whenToGo: [
            "Lesiones musculares o articulares por deporte",
            "Evaluación antes de iniciar un deporte (apto físico)",
            "Fatiga o bajo rendimiento inexplicable",
            "Rehabilitación tras lesión deportiva",
            "Asesoría en suplementación deportiva",
            "Conmoción cerebral deportiva",
        ],
        whyItMatters: [
            "Previene la muerte súbita en deportistas",
            "Acelera la recuperación para volver al juego rápido y seguro",
            "Evita que lesiones agudas se vuelvan crónicas",
            "Optimiza el entrenamiento para evitar el sobreentrenamiento",
        ],
        treatments: [
            "Evaluación pre-participativa cardiovascular",
            "Tratamiento de tendinitis y desgarros",
            "Infiltraciones guiadas por ecografía",
            "Prescripción de ejercicio terapéutico",
            "Pruebas de consumo de oxígeno (VO2 max)",
        ],
        relatedSpecialties: ["traumatologia-y-ortopedia", "medicina-fisica-y-rehabilitacion", "nutriologia"],
    },

    // ============================================
    // MEDICINA REPRODUCTIVA
    // ============================================
    "medicina-reproductiva": {
        title: "Medicina Reproductiva",
        description: "Creando familias. Especialistas en fertilidad asistida y preservación de la capacidad reproductiva.",
        whatIsIt: "Es una subespecialidad de ginecología enfocada en ayudar a parejas con dificultades para concebir. Utiliza tecnologías avanzadas como la Fecundación In Vitro (FIV) y estudia causas hormonales, genéticas o anatómicas de la infertilidad.",
        whenToGo: [
            "Pareja que no logra embarazo tras 1 año intentando",
            "Mujeres mayores de 35 años que desean embarazo",
            "Pérdidas de embarazo recurrentes",
            "Hombres con alteraciones en espermograma",
            "Deseo de congelar óvulos (preservación de fertilidad)",
            "Enfermedades genéticas familiares (para diagnóstico preimplantacional)",
        ],
        whyItMatters: [
            "Hace realidad el sueño de ser padres en casos complejos",
            "Permite a pacientes con cáncer preservar su fertilidad antes de quimio",
            "Evita la transmisión de enfermedades genéticas graves al bebé",
            "Ofrece opciones a mujeres que deciden posponer la maternidad",
        ],
        treatments: [
            "Fecundación In Vitro (FIV)",
            "Inseminación artificial",
            "Congelación de óvulos y embriones",
            "Diagnóstico Genético Preimplantacional (PGT)",
            "Cirugía reproductiva (histeroscopia)",
        ],
        relatedSpecialties: ["ginecologia", "urologia", "genetica-medica"],
    },

    // ============================================
    // PSICOLOGÍA CLÍNICA
    // ============================================
    "psicologia-clinica": {
        title: "Psicología Clínica",
        description: "Bienestar emocional y crecimiento. Evaluación y psicoterapia para problemas emocionales, conductuales y relacionales.",
        whatIsIt: "El psicólogo clínico ayuda a entender y manejar emociones, pensamientos y comportamientos. A diferencia del psiquiatra, no receta fármacos, sino que usa la psicoterapia (como la cognitivo-conductual) para dar herramientas al paciente frente a la ansiedad, depresión o conflictos de vida.",
        whenToGo: [
            "Sensación de vacío, tristeza o ansiedad constante",
            "Dificultades en relaciones de pareja o familia",
            "Problemas para manejar el estrés o la ira",
            "Duelo por pérdida de un ser querido",
            "Baja autoestima o inseguridad",
            "Traumas del pasado que siguen afectando",
        ],
        whyItMatters: [
            "Proporciona herramientas para enfrentar crisis vitales",
            "Mejora las relaciones interpersonales",
            "Ayuda a modificar patrones de conducta dañinos",
            "Es fundamental en el tratamiento integral de enfermedades crónicas",
        ],
        treatments: [
            "Psicoterapia individual (Cognitivo-Conductual, Sistémica, etc.)",
            "Terapia de pareja y familiar",
            "Manejo del duelo y crisis",
            "Técnicas de relajación y manejo del estrés",
            "Evaluación psicológica y psicométrica",
        ],
        relatedSpecialties: ["psiquiatria", "neurologia", "medicina-del-dolor"],
    },

    // ============================================
    // PSIQUIATRÍA INFANTIL Y DEL ADOLESCENTE
    // ============================================
    "psiquiatria-infantil-y-del-adolescente": {
        title: "Psiquiatría Infantil y del Adolescente",
        description: "Mentes jóvenes sanas. Diagnóstico y tratamiento de trastornos mentales y emocionales en niños y adolescentes.",
        whatIsIt: "Es la psiquiatría dedicada a las etapas del desarrollo. Trata problemas complejos como autismo severo, TDAH, depresión adolescente, trastornos alimentarios (anorexia/bulimia) y psicosis en jóvenes. Trabaja muy de cerca con familias y escuelas.",
        whenToGo: [
            "Cambios bruscos de comportamiento en niños o adolescentes",
            "Trastornos de la conducta alimentaria (dejar de comer, vómitos)",
            "Ideas de suicidio o autolesiones (cortes)",
            "Aislamiento social extremo o fobia escolar",
            "Agresividad incontrolable",
            "Consumo de drogas en adolescentes",
        ],
        whyItMatters: [
            "Intervenir temprano en psicosis o anorexia salva vidas",
            "Previene el fracaso escolar por TDAH o depresión no tratada",
            "Ayuda a familias a manejar conductas difíciles",
            "Reduce el riesgo de suicidio adolescente",
        ],
        treatments: [
            "Tratamiento farmacológico en niños y adolescentes",
            "Intervención en crisis suicida",
            "Manejo de trastornos alimentarios",
            "Tratamiento de TDAH y problemas de conducta",
            "Terapia familiar sistémica",
        ],
        relatedSpecialties: ["pediatria", "psicologia-clinica", "neurologia-pediatrica"],
    },

    // ============================================
    // RETINA Y VÍTREO
    // ============================================
    "retina-y-vitreo": {
        title: "Retina y Vítreo",
        description: "Expertos en el fondo del ojo. Tratamiento de alta complejidad para desprendimiento de retina y retinopatía diabética.",
        whatIsIt: "El retinólogo es un oftalmólogo subespecializado en la parte posterior del ojo. Trata las enfermedades más graves de la visión, como el desprendimiento de retina, daños por diabetes y degeneración macular asociada a la edad.",
        whenToGo: [
            "Ver una 'cortina negra' o sombra fija en la visión",
            "Aparición súbita de muchas luces o manchas",
            "Pérdida de visión central (no ver caras ni letras)",
            "Diabetes de larga evolución (para tratamiento láser)",
            "Traumatismos oculares graves",
        ],
        whyItMatters: [
            "La cirugía de retina a tiempo es la única forma de evitar ceguera en desprendimientos",
            "Frena la pérdida de visión en diabéticos",
            "Permite recuperar visión en casos complejos",
            "Trata la degeneración macular en adultos mayores",
        ],
        treatments: [
            "Cirugía de Vitrectomía",
            "Fotocoagulación con láser para diabetes",
            "Inyecciones intravítreas para degeneración macular",
            "Reparación de desprendimiento de retina",
            "Tratamiento de agujero macular",
        ],
        relatedSpecialties: ["oftalmologia", "endocrinologia", "medicina-interna"],
    },

    // ============================================
    // GLAUCOMA
    // ============================================
    "glaucoma": {
        title: "Glaucoma",
        description: "El ladrón silencioso de la vista. Especialistas en controlar la presión ocular para prevenir la ceguera irreversible.",
        whatIsIt: "El especialista en glaucoma se dedica a frenar esta enfermedad que daña el nervio óptico por presión alta. Como el glaucoma no duele ni avisa hasta que es tarde, este experto es vital para monitorear y salvar la visión restante mediante gotas, láser o microcirugía.",
        whenToGo: [
            "Antecedentes familiares de glaucoma",
            "Presión intraocular alta detectada en chequeo",
            "Usuario crónico de gotas con corticoides",
            "Pérdida de visión periférica ('ver por un tubo')",
            "Dolor ocular intenso con visión borrosa (glaucoma agudo)",
        ],
        whyItMatters: [
            "El glaucoma es la principal causa de ceguera irreversible, pero es prevenible",
            "Ajusta el tratamiento para preservar la visión de por vida",
            "Realiza cirugías mínimamente invasivas para dejar las gotas",
            "Personaliza el tratamiento según el daño del nervio óptico",
        ],
        treatments: [
            "Iridotomía y Trabeculoplastia Láser",
            "Cirugía filtrante de glaucoma (Trabeculectomía)",
            "Válvulas de drenaje para glaucoma",
            "MIGS (Cirugía de Glaucoma Mínimamente Invasiva)",
            "Tratamiento médico personalizado",
        ],
        relatedSpecialties: ["oftalmologia", "geriatria", "medicina-interna"],
    },
    // ============================================
    // MEDICINA GENERAL
    // ============================================
    "medicina-general": {
        title: "Medicina General",
        description: "Tu primer contacto con la salud. Atención integral, prevención y diagnóstico inicial para toda la familia.",
        whatIsIt: "El médico general es la puerta de entrada al sistema de salud. Diagnostica y trata enfermedades comunes, maneja chequeos preventivos, emite certificados médicos y refiere al especialista adecuado cuando es necesario. Tiene una visión global del paciente.",
        whenToGo: [
            "Chequeo médico anual y certificados de salud",
            "Gripe, dolor de garganta, tos o fiebre",
            "Dolores musculares o articulares leves",
            "Malestar estomacal o diarrea simple",
            "Control inicial de presión arterial",
            "Pequeñas heridas o curaciones",
        ],
        whyItMatters: [
            "Resuelve el 80% de los problemas de salud sin necesidad de especialistas",
            "Conoce tu historial médico completo y te guía en el sistema",
            "Es clave para la prevención y detección temprana de enfermedades",
            "Ofrece atención accesible y cercana",
        ],
        treatments: [
            "Consulta médica general",
            "Emisión de certificados médicos y de conducir",
            "Curación de heridas menores y retiro de puntos",
            "Control de niño sano (básico)",
            "Prescripción de medicamentos básicos",
        ],
        relatedSpecialties: ["medicina-familiar", "medicina-interna", "pediatria"],
    },

    // ============================================
    // MEDICINA FAMILIAR
    // ============================================
    "medicina-familiar": {
        title: "Medicina Familiar",
        description: "El médico de cabecera moderno. Cuidado continuo e integral para todos los miembros de la familia, en todas las edades.",
        whatIsIt: "El médico de familia es un especialista en personas, no solo en enfermedades. Atiende desde bebés hasta abuelos, con un enfoque preventivo y biopsicosocial. Entiende cómo la salud de un miembro afecta a toda la familia.",
        whenToGo: [
            "Enfermedades comunes en niños y adultos",
            "Manejo de enfermedades crónicas (diabetes, hipertensión) estables",
            "Problemas de salud mental leves (ansiedad, insomnio)",
            "Consejería familiar y estilos de vida",
            "Atención preventiva y vacunas para toda la edad",
        ],
        whyItMatters: [
            "Ofrece continuidad: te conoce desde niño hasta adulto",
            "Evita la fragmentación del cuidado al ver al paciente como un todo",
            "Reduce visitas innecesarias a urgencias",
            "Fortalece la salud preventiva en el núcleo familiar",
        ],
        treatments: [
            "Control de enfermedades crónicas",
            "Atención de urgencias menores",
            "Consejería en planificación familiar",
            "Visitas domiciliarias (según disponibilidad)",
            "Educación para la salud",
        ],
        relatedSpecialties: ["medicina-general", "geriatria", "pediatria"],
    },

    // ============================================
    // CARDIOLOGÍA INTERVENCIONISTA
    // ============================================
    "cardiologia-intervencionista": {
        title: "Cardiología Intervencionista",
        description: "Reparando el corazón sin abrir el pecho. Tratamiento de infartos y arterias bloqueadas mediante cateterismo.",
        whatIsIt: "Es una subespecialidad de cardiología que utiliza catéteres (tubos finos) introducidos por la muñeca o la ingle para llegar al corazón. Su función principal es 'destapar' arterias coronarias en infartos o colocar válvulas sin cirugía abierta.",
        whenToGo: [
            "Diagnóstico de infarto agudo (código infarto)",
            "Dolor de pecho (angina) que no cede",
            "Estudio de arterias coronarias (cateterismo)",
            "Necesidad de cambio de válvula aórtica (TAVI) sin cirugía",
            "Defectos cardíacos congénitos en adultos",
        ],
        whyItMatters: [
            "Salva la vida en el infarto agudo al abrir la arteria rápidamente",
            "Evita la cirugía de corazón abierto en muchos casos",
            "Recuperación mucho más rápida que la cirugía convencional",
            "Mejora la calidad de vida en angina de pecho",
        ],
        treatments: [
            "Angioplastia con colocación de Stent",
            "Cateterismo cardíaco diagnóstico",
            "Implante de Válvula Aórtica (TAVI)",
            "Cierre de defectos cardíacos (CIA, Foramen Oval)",
            "Valvuloplastia con balón",
        ],
        relatedSpecialties: ["cardiologia", "cirugia-cardiovascular", "hemodinamia"],
    },

    // ============================================
    // ELECTROFISIOLOGÍA CARDÍACA
    // ============================================
    "electrofisiologia-cardiaca": {
        title: "Electrofisiología Cardíaca",
        description: "Expertos en el ritmo del corazón. Diagnóstico y cura de arritmias, taquicardias y problemas eléctricos cardíacos.",
        whatIsIt: "El 'electricista' del corazón. Diagnostica por qué el corazón va muy rápido o muy lento y lo soluciona. Realiza estudios para mapear la electricidad cardíaca y procedimientos para quemar (ablar) los circuitos que causan arritmias.",
        whenToGo: [
            "Palpitaciones rápidas o irregulares",
            "Desmayos (síncope) de causa cardíaca",
            "Diagnóstico de fibrilación auricular",
            "Antecedentes de muerte súbita familiar",
            "Necesidad de marcapasos o desfibrilador",
        ],
        whyItMatters: [
            "Cura definitivamente muchas taquicardias, dejando los medicamentos",
            "Previene la muerte súbita con dispositivos implantables",
            "Reduce el riesgo de embolia por fibrilación auricular",
            "Mejora la capacidad de ejercicio en pacientes con arritmias",
        ],
        treatments: [
            "Estudio electrofisiológico",
            "Ablación de arritmias con radiofrecuencia",
            "Implante de Marcapasos",
            "Implante de Desfibrilador Automático (DAI)",
            "Terapia de Resincronización Cardíaca",
        ],
        relatedSpecialties: ["cardiologia", "cardiologia-intervencionista", "hemodinamia"],
    },

    // ============================================
    // HEMODINAMIA
    // ============================================
    "hemodinamia": {
        title: "Hemodinamia",
        description: "Flujo sanguíneo bajo control. Diagnóstico y tratamiento de enfermedades vasculares mediante catéteres.",
        whatIsIt: "Muy relacionado con cardiología intervencionista, pero enfocado en la dinámica de la sangre. Evalúa presiones dentro del corazón y pulmones, y trata obstrucciones no solo en corazón, sino en arterias de piernas, riñones o carótidas.",
        whenToGo: [
            "Enfermedad arterial periférica (dolor de piernas al caminar)",
            "Hipertensión pulmonar",
            "Estenosis de arterias renales",
            "Aneurismas aórticos (tratamiento endovascular)",
            "Evaluación pre-trasplante cardíaco",
        ],
        whyItMatters: [
            "Evita amputaciones al restaurar el flujo en piernas (pie diabético)",
            "Trata aneurismas peligrosos sin grandes incisiones",
            "Diagnostica con precisión fallos cardíacos complejos",
            "Recupera la función renal en estenosis arteriales",
        ],
        treatments: [
            "Angioplastia de miembros inferiores",
            "Colocación de Stent carotídeo",
            "Tratamiento endovascular de aneurisma (EVAR)",
            "Cateterismo derecho (medición de presiones)",
            "Embolización de arterias",
        ],
        relatedSpecialties: ["cardiologia-intervencionista", "cirugia-vascular-y-endovascular", "radiologia-e-imagenes"],
    },

    // ============================================
    // NEUROFISIOLOGÍA CLÍNICA
    // ============================================
    "neurofisiologia-clinica": {
        title: "Neurofisiología Clínica",
        description: "Midiendo la función nerviosa. Pruebas diagnósticas avanzadas para el sistema nervioso central y periférico.",
        whatIsIt: "Es la especialidad que 'mide' cómo funcionan los nervios y el cerebro. Realiza estudios para ver si hay daño en nervios (como en túnel carpiano), epilepsia, o problemas de sueño. Es fundamental para el diagnóstico preciso en neurología.",
        whenToGo: [
            "Sospecha de epilepsia",
            "Hormigueo o pérdida de fuerza en manos/pies",
            "Trastornos del sueño (apnea, narcolepsia)",
            "Monitorización durante cirugías cerebrales",
            "Problemas de visión o audición de origen nervioso",
        ],
        whyItMatters: [
            "Confirma si el dolor es por daño nervioso real",
            "Clasifica el tipo de epilepsia para elegir el mejor fármaco",
            "Vigila que no se dañen nervios durante cirugías de columna",
            "Diagnostica muerte cerebral en terapia intensiva",
        ],
        treatments: [
            "Electroencefalograma (EEG)",
            "Electromiografía y Velocidad de Conducción",
            "Potenciales Evocados (Visuales, Auditivos)",
            "Polisomnografía (Estudio del sueño)",
            "Monitorización Intraoperatoria",
        ],
        relatedSpecialties: ["neurologia", "neurocirugia", "medicina-del-sueño"],
    },

    // ============================================
    // NEUROPSICOLOGÍA
    // ============================================
    "neuropsicologia": {
        title: "Neuropsicología",
        description: "Cerebro y conducta. Evaluación y rehabilitación de funciones cognitivas como memoria, atención y lenguaje.",
        whatIsIt: "El puente entre neurología y psicología. Evalúa cómo un daño cerebral (por golpe, ACV o demencia) afecta la forma de pensar, recordar y actuar. Diseña planes para rehabilitar esas funciones perdidas.",
        whenToGo: [
            "Quejas de memoria o 'lagunas' mentales",
            "Dificultad para concentrarse o planificar tareas (TDAH)",
            "Cambios de personalidad tras un golpe en la cabeza",
            "Evaluación de Alzheimer o demencias",
            "Secuelas cognitivas post-COVID o post-ACV",
        ],
        whyItMatters: [
            "Diferencia el envejecimiento normal del Alzheimer temprano",
            "Ayuda a recuperar independencia tras un daño cerebral",
            "Adapta el entorno escolar o laboral a las capacidades del paciente",
            "Apoya a la familia a entender los cambios del paciente",
        ],
        treatments: [
            "Evaluación Neuropsicológica completa",
            "Rehabilitación cognitiva (memoria, atención)",
            "Estimulación cognitiva para demencias",
            "Entrenamiento en funciones ejecutivas",
            "Psicoeducación a cuidadores",
        ],
        relatedSpecialties: ["neurologia", "psicologia-clinica", "geriatria"],
    },

    // ============================================
    // HEPATOLOGÍA
    // ============================================
    "hepatologia": {
        title: "Hepatología",
        description: "Expertos en el hígado. Prevención y tratamiento de hepatitis, hígado graso, cirrosis y trasplante hepático.",
        whatIsIt: "Subespecialidad de gastroenterología dedicada exclusivamente al hígado, vesícula y vías biliares. Trata desde el hígado graso (muy común) hasta hepatitis virales complejas y cáncer de hígado.",
        whenToGo: [
            "Diagnóstico de Hígado Graso",
            "Hepatitis B o C crónica",
            "Cirrosis hepática o fallo hepático",
            "Color amarillo en piel u ojos (Ictericia)",
            "Alteraciones en pruebas de función hepática",
            "Evaluación para trasplante de hígado",
        ],
        whyItMatters: [
            "Cura la Hepatitis C previniendo cirrosis y cáncer",
            "Maneja el hígado graso para evitar diabetes y daño cardíaco",
            "Controla la cirrosis permitiendo una vida funcional",
            "Detecta tumores hepáticos en etapas curables",
        ],
        treatments: [
            "Tratamiento antiviral para Hepatitis B y C",
            "Biopsia hepática y Elastografía (Fibroscan)",
            "Manejo de complicaciones de cirrosis",
            "Tratamiento de cáncer de hígado",
            "Protocolo de trasplante hepático",
        ],
        relatedSpecialties: ["gastroenterologia", "infectologia", "transplante-de-organos"],
    },

    // ============================================
    // ENDOSCOPIA DIGESTIVA
    // ============================================
    "endoscopia-digestiva": {
        title: "Endoscopia Digestiva",
        description: "Diagnóstico visual directo. Procedimientos avanzados para ver y tratar el interior del tubo digestivo sin cirugía.",
        whatIsIt: "Aunque la realizan gastroenterólogos, es una superespecialidad técnica. No solo mira (diagnóstica), sino que opera por dentro (terapéutica): quita pólipos, frena sangrados, pone prótesis en esófago o saca piedras de la vía biliar.",
        whenToGo: [
            "Necesidad de Gastroscopia o Colonoscopia",
            "Sangrado digestivo (vómito o heces con sangre)",
            "Extracción de cuerpos extraños tragados",
            "Cálculos en la vía biliar (CPRE)",
            "Dificultad para tragar (dilataciones)",
        ],
        whyItMatters: [
            "Es la herramienta #1 para prevenir cáncer de colon",
            "Detiene hemorragias digestivas salvando vidas en urgencias",
            "Evita cirugías abiertas para quitar piedras o pólipos",
            "Permite alimentar a pacientes que no pueden tragar (PEG)",
        ],
        treatments: [
            "Panendoscopia oral y Colonoscopia",
            "CPRE (para vías biliares)",
            "Ligadura de várices esofágicas",
            "Gastrostomía endoscópica (PEG)",
            "Resección de pólipos grandes",
        ],
        relatedSpecialties: ["gastroenterologia", "cirugia-general", "coloproctologia"],
    },

    // ============================================
    // MEDICINA DEL SUEÑO
    // ============================================
    "medicina-del-sueño": {
        title: "Medicina del Sueño",
        description: "Dormir bien para vivir mejor. Diagnóstico y tratamiento de ronquidos, apnea, insomnio y trastornos del dormir.",
        whatIsIt: "Especialidad multidisciplinaria (neumólogos, neurólogos, otorrinos). Se enfoca en que el sueño sea reparador. Trata la apnea del sueño (dejar de respirar al dormir), narcolepsia, piernas inquietas e insomnio crónico.",
        whenToGo: [
            "Ronquido fuerte y pausas respiratorias (apnea)",
            "Somnolencia excesiva durante el día",
            "Dificultad crónica para conciliar el sueño",
            "Movimientos o conductas extrañas al dormir",
            "Sensación de sueño no reparador",
        ],
        whyItMatters: [
            "La apnea del sueño causa hipertensión, infartos y accidentes de tráfico",
            "Dormir bien es esencial para la memoria y el sistema inmune",
            "Mejora el rendimiento laboral y escolar",
            "Reduce el riesgo cardiovascular significativo",
        ],
        treatments: [
            "Polisomnografía (Estudio del sueño)",
            "Titulación de CPAP (máquina para apnea)",
            "Terapia cognitivo-conductual para insomnio",
            "Dispositivos de avance mandibular",
            "Higiene del sueño",
        ],
        relatedSpecialties: ["neumologia", "neurologia", "otorrinolaringologia"],
    },

    // ============================================
    // UROLOGÍA PEDIÁTRICA
    // ============================================
    "urologia-pediatrica": {
        title: "Urología Pediátrica",
        description: "Salud genital y urinaria infantil. Corrección de malformaciones y problemas urológicos en niños y niñas.",
        whatIsIt: "El urólogo de niños opera y trata defectos de nacimiento en riñones, vejiga y genitales. Maneja fimosis (circuncisión), testículos no descendidos, hipospadias y reflujo de orina que daña los riñones.",
        whenToGo: [
            "Testículos no descendidos (Criptorquidea)",
            "Fimosis o infecciones de prepucio",
            "Hipospadias (orificio urinario mal ubicado)",
            "Infecciones urinarias febriles en bebés",
            "Hernias inguinales o hidrocele",
            "Enuresis (mojar la cama) resistente",
        ],
        whyItMatters: [
            "Corrige malformaciones preservando la fertilidad futura",
            "Evita daño renal permanente por reflujo urinario",
            "Resuelve problemas estéticos y funcionales genitales",
            "Elimina el dolor y riesgo de infecciones recurrentes",
        ],
        treatments: [
            "Circuncisión médica",
            "Orquidopexia (bajar testículo)",
            "Corrección de Hipospadias",
            "Cirugía de reflujo vesicoureteral",
            "Pieloplastia laparoscópica",
        ],
        relatedSpecialties: ["pediatria", "nefrologia-pediatrica", "cirugia-pediatrica"],
    },

    // ============================================
    // ANDROLOGÍA
    // ============================================
    "andrologia": {
        title: "Andrología",
        description: "Salud sexual y reproductiva masculina. Expertos en fertilidad, disfunción eréctil y salud genital del hombre.",
        whatIsIt: "Es la contraparte masculina de la ginecología, subespecialidad de urología. Trata específicamente problemas de erección, eyaculación, infertilidad masculina, deficiencia de testosterona y curvaturas del pene.",
        whenToGo: [
            "Disfunción eréctil",
            "Infertilidad masculina o deseo de vasectomía",
            "Enfermedad de Peyronie (curvatura del pene)",
            "Bajo deseo sexual o fatiga (andropausia)",
            "Eyaculación precoz",
            "Dolor testicular crónico",
        ],
        whyItMatters: [
            "Recupera la vida sexual y la confianza del paciente",
            "Permite la paternidad en casos de infertilidad severa",
            "Detecta problemas cardiovasculares a través de la disfunción eréctil",
            "Mejora la calidad de vida en la andropausia",
        ],
        treatments: [
            "Tratamiento de disfunción eréctil (farmacológico y prótesis)",
            "Vasectomía y reversión de vasectomía",
            "Microcirugía de varicocele",
            "Terapia de reemplazo de testosterona",
            "Recuperación de espermatozoides",
        ],
        relatedSpecialties: ["urologia", "medicina-reproductiva", "endocrinologia"],
    },

    // ============================================
    // DIABETOLOGÍA
    // ============================================
    "diabetologia": {
        title: "Diabetología",
        description: "Expertos en diabetes. Manejo integral especializado para prevenir complicaciones y controlar el azúcar.",
        whatIsIt: "Aunque los endocrinólogos tratan diabetes, el diabetólogo se dedica 100% a ella. Es experto en lo último en tecnología (bombas de insulina, sensores), manejo de diabetes tipo 1 y 2, y educación para que el paciente sea experto en su propia enfermedad.",
        whenToGo: [
            "Diagnóstico reciente de diabetes",
            "Diabetes descontrolada (HbA1c alta)",
            "Diabetes en el embarazo (gestacional)",
            "Uso de bomba de insulina o monitoreo continuo",
            "Prevención de complicaciones (pie, ojos, riñón)",
        ],
        whyItMatters: [
            "Un control estricto evita ceguera, diálisis y amputaciones",
            "Maneja el embarazo diabético asegurando un bebé sano",
            "Personaliza la dieta y ejercicio según el paciente",
            "Educa para evitar hipoglucemias peligrosas",
        ],
        treatments: [
            "Ajuste intensivo de insulina",
            "Colocación y manejo de bombas de insulina",
            "Educación en conteo de carbohidratos",
            "Monitoreo Continuo de Glucosa",
            "Manejo de pie diabético (preventivo)",
        ],
        relatedSpecialties: ["endocrinologia", "nutriologia", "oftalmologia"],
    },

    // ============================================
    // REUMATOLOGÍA PEDIÁTRICA
    // ============================================
    "reumatologia-pediatrica": {
        title: "Reumatología Pediátrica",
        description: "Inflamación en niños. Diagnóstico de artritis juvenil, lupus y enfermedades autoinmunes en la infancia.",
        whatIsIt: "Los niños también sufren de 'reuma'. Esta especialidad trata enfermedades donde el sistema inmune ataca las articulaciones u órganos del niño. Maneja Artritis Idiopática Juvenil, Kawasaki, Lupus y dolores de crecimiento.",
        whenToGo: [
            "Dolor e inflamación articular en niños",
            "Cojera matutina o rigidez",
            "Fiebres periódicas sin causa infecciosa",
            "Debilidad muscular progresiva",
            "Manchas en piel tipo vasculitis",
        ],
        whyItMatters: [
            "Evita deformidades articulares permanentes en niños",
            "Controla el dolor permitiendo que el niño juegue y vaya a la escuela",
            "Trata enfermedades graves como Kawasaki protegiendo el corazón",
            "Maneja inmunosupresores de forma segura para el crecimiento",
        ],
        treatments: [
            "Manejo de artritis idiopática juvenil",
            "Tratamiento de Lupus y Dermatomiositis infantil",
            "Infiltraciones articulares pediátricas",
            "Manejo de uveítis (con oftalmólogo)",
            "Terapias biológicas avanzadas",
        ],
        relatedSpecialties: ["pediatria", "reumatologia", "oftalmologia-pediatrica"],
    },

    // ============================================
    // ONCOLOGÍA RADIOTERÁPICA
    // ============================================
    "oncologia-radioterapica": {
        title: "Oncología Radioterápica",
        description: "Curando con radiación de precisión. Tratamiento del cáncer mediante tecnología avanzada de radioterapia.",
        whatIsIt: "El oncólogo radioterápico usa radiación de alta energía para matar células cancerosas. No es el radiólogo que toma fotos. Este médico diseña tratamientos milimétricos para destruir tumores protegiendo los órganos sanos, usando aceleradores lineales modernos.",
        whenToGo: [
            "Tratamiento de cáncer de próstata, mama, pulmón, cerebro, etc.",
            "Alivio de dolor por metástasis óseas (paliativo)",
            "Radiocirugía cerebral (sin bisturí)",
            "Complemento tras cirugía de cáncer",
            "Urgencias oncológicas (compresión medular)",
        ],
        whyItMatters: [
            "Cura muchos cánceres sin necesidad de cirugía radical",
            "Conserva órganos (ej. laringe, ano) evitando su extirpación",
            "Alivia el dolor oncológico efectivamente",
            "Controla tumores cerebrales inoperables",
        ],
        treatments: [
            "Radioterapia de Intensidad Modulada (IMRT)",
            "Radiocirugía (Gamma Knife / Cyberknife)",
            "Braquiterapia (radiación interna)",
            "Radioterapia guiada por imagen (IGRT)",
            "Radioterapia paliativa",
        ],
        relatedSpecialties: ["oncologia-medica", "cirugia-oncologica", "medicina-nuclear"],
    },
    // ============================================
    // HEMATO-ONCOLOGÍA PEDIÁTRICA
    // ============================================
    "hemato-oncologia-pediatrica": {
        title: "Hemato-Oncología Pediátrica",
        description: "Esperanza y cura para los niños. Tratamiento especializado de cáncer y enfermedades de la sangre en la infancia.",
        whatIsIt: "Es la especialidad que lucha contra el cáncer infantil (leucemias, tumores) y enfermedades de la sangre (anemias, hemofilia) en niños. Combina la ciencia médica más avanzada con una sensibilidad única para tratar al niño y apoyar a su familia.",
        whenToGo: [
            "Palidez extrema, moretones fáciles o sangrados",
            "Fiebre persistente sin causa aparente",
            "Bultos en cuello, axilas o abdomen (ganglios)",
            "Dolor de huesos o articulaciones en niños",
            "Pérdida de peso o falta de apetito marcada",
            "Diagnóstico de Leucemia o Linfoma",
        ],
        whyItMatters: [
            "El cáncer infantil es altamente curable con tratamiento oportuno",
            "Maneja el dolor y el soporte emocional del niño",
            "Trata problemas de coagulación previniendo hemorragias graves",
            "Realiza trasplantes de médula ósea que salvan vidas",
        ],
        treatments: [
            "Quimioterapia pediátrica adaptada",
            "Aspirado de médula ósea",
            "Manejo de Leucemia Linfoblástica Aguda",
            "Tratamiento de Hemofilia y Anemias",
            "Trasplante de células madre (médula ósea)",
        ],
        relatedSpecialties: ["pediatria", "oncologia-radioterapica", "cirugia-pediatrica"],
    },

    // ============================================
    // ALERGOLOGÍA E INMUNOLOGÍA PEDIÁTRICA
    // ============================================
    "alergologia-e-inmunologia-pediatrica": {
        title: "Alergología e Inmunología Pediátrica",
        description: "Defensas fuertes y equilibradas. Diagnóstico de alergias y problemas del sistema inmune en niños.",
        whatIsIt: "Trata a niños que se enferman demasiado (inmunodeficiencias) o cuyo sistema inmune reacciona exageradamente (alergias graves, asma). Es clave para mejorar la calidad de vida en niños alérgicos a alimentos o con dermatitis severa.",
        whenToGo: [
            "Infecciones respiratorias o de oído muy frecuentes",
            "Asma difícil de controlar",
            "Alergias alimentarias (leche, huevo, maní)",
            "Dermatitis atópica severa (eccema)",
            "Reacciones graves a picaduras o medicamentos",
        ],
        whyItMatters: [
            "Previene crisis de asma que requieren hospitalización",
            "Identifica alergias alimentarias evitando anafilaxia",
            "Mejora el sueño y rendimiento escolar en niños alérgicos",
            "Detecta fallos en defensas (inmunodeficiencias) tempranamente",
        ],
        treatments: [
            "Pruebas de alergia en piel (Prick Test)",
            "Inmunoterapia (vacunas para alergia)",
            "Pruebas de función pulmonar (espirometría)",
            "Reto de alimentos supervisado",
            "Manejo de anafilaxia",
        ],
        relatedSpecialties: ["pediatria", "neumologia-pediatrica", "dermatologia-pediatrica"],
    },

    // ============================================
    // DERMATO-ONCOLOGÍA
    // ============================================
    "dermato-oncologia": {
        title: "Dermato-oncología",
        description: "Cáncer de piel bajo el microscopio. Detección temprana y cirugía especializada de tumores cutáneos.",
        whatIsIt: "El experto en cáncer de piel. Se especializa en diferenciar un lunar bueno de un melanoma peligroso. Realiza cirugías precisas (como Mohs) para quitar el cáncer sin dejar grandes cicatrices en zonas visibles como la cara.",
        whenToGo: [
            "Lunares que cambian de forma, color o tamaño (Regla ABCDE)",
            "Heridas en la piel que no cicatrizan",
            "Manchas nuevas oscuras o rojas que crecen",
            "Diagnóstico de Melanoma o Carcinoma",
            "Antecedentes personales de cáncer de piel",
        ],
        whyItMatters: [
            "El melanoma detectado a tiempo es 100% curable",
            "Realiza Cirugía de Mohs para máxima preservación de piel sana",
            "Evita deformidades en cara por cirugías oncológicas",
            "Educa sobre protección solar efectiva",
        ],
        treatments: [
            "Dermatoscopia digital (mapeo de lunares)",
            "Biopsia de piel",
            "Cirugía micrográfica de Mohs",
            "Escisión amplia de melanoma",
            "Electrodesa y curetaje",
        ],
        relatedSpecialties: ["dermatologia", "oncologia-medica", "cirugia-plastica"],
    },

    // ============================================
    // DERMATOPATOLOGÍA
    // ============================================
    "dermatopatologia": {
        title: "Dermatopatología",
        description: "El diagnóstico definitivo de la piel. Análisis microscópico experto de enfermedades cutáneas complejas.",
        whatIsIt: "Es el patólogo de la piel. Cuando el dermatólogo hace una biopsia, el dermatopatólogo la analiza. Es crucial para diagnosticar enfermedades raras, diferenciar tipos de cáncer o confirmar enfermedades autoinmunes de la piel.",
        whenToGo: [
            "Generalmente es interconsulta: tu dermatólogo envía la muestra",
            "Segunda opinión en biopsias de piel dudosas",
            "Diagnóstico de enfermedades ampollares (pénfigo)",
            "Confirmación de linfomas cutáneos",
        ],
        whyItMatters: [
            "Da el nombre y apellido exacto de la enfermedad de piel",
            "Diferencia entre inflamación benigna y cáncer",
            "Guía el tratamiento correcto (ej. en psoriasis vs. eccema)",
            "Evita tratamientos innecesarios por diagnósticos erróneos",
        ],
        treatments: [
            "Estudio histopatológico de piel",
            "Inmunofluorescencia directa",
            "Tinciones especiales para hongos o bacterias",
            "Consultoría diagnóstica",
        ],
        relatedSpecialties: ["dermatologia", "patologia", "oncologia-medica"],
    },

    // ============================================
    // SEXOLOGÍA CLÍNICA
    // ============================================
    "sexologia-clinica": {
        title: "Sexología Clínica",
        description: "Salud sexual plena. Abordaje médico y psicológico de las dificultades en la vida sexual.",
        whatIsIt: "Médicos o psicólogos especializados en sexualidad humana. Tratan problemas como falta de deseo, dolor al tener relaciones, vaginismo o dificultades orgásmicas, siempre desde un enfoque científico, respetuoso y confidencial.",
        whenToGo: [
            "Falta de deseo sexual (libido baja)",
            "Dolor durante las relaciones sexuales (dispareunia)",
            "Vaginismo (imposibilidad de penetración)",
            "Dificultad para alcanzar el orgasmo",
            "Problemas de pareja relacionados con la sexualidad",
        ],
        whyItMatters: [
            "Mejora la intimidad y la relación de pareja",
            "Resuelve problemas físicos que impiden el disfrute",
            "Elimina mitos y tabúes que generan ansiedad",
            "Trata secuelas sexuales de otras enfermedades",
        ],
        treatments: [
            "Terapia sexual (individual o de pareja)",
            "Educación sexual clínica",
            "Tratamiento de vaginismo y dispareunia",
            "Manejo de trastornos del deseo",
        ],
        relatedSpecialties: ["psicologia-clinica", "ginecologia", "andrologia"],
    },

    // ============================================
    // ADICCIONES Y TOXICOMANÍAS
    // ============================================
    "adicciones-y-toxicomanias": {
        title: "Adicciones y Toxicomanías",
        description: "Recuperando la libertad. Tratamiento médico-psiquiátrico para superar dependencias a sustancias o conductas.",
        whatIsIt: "Especialidad dedicada a tratar la enfermedad de la adicción. No es vicio, es una alteración cerebral. Tratan alcoholismo, tabaquismo, drogas ilegales y adicciones comportamentales (juego, tecnología), manejando la desintoxicación y prevención de recaídas.",
        whenToGo: [
            "Consumo de alcohol o drogas que afecta la vida diaria",
            "Incapacidad para dejar de consumir a pesar de querer hacerlo",
            "Síndrome de abstinencia (temblores, ansiedad al no consumir)",
            "Ludopatía (adicción al juego)",
            "Familiares buscando orientación para ayudar a un adicto",
        ],
        whyItMatters: [
            "Salva vidas al prevenir sobredosis y daños orgánicos",
            "Recupera la funcionalidad laboral y familiar del paciente",
            "Maneja la abstinencia de forma segura y médica",
            "Trata la depresión o ansiedad que suele acompañar la adicción",
        ],
        treatments: [
            "Desintoxicación médica supervisada",
            "Terapia de prevención de recaídas",
            "Psicoterapia individual y grupal",
            "Medicamentos anti-craving (para reducir deseo)",
            "Intervención familiar",
        ],
        relatedSpecialties: ["psiquiatria", "psicologia-clinica", "medicina-interna"],
    },

    // ============================================
    // CIRUGÍA LAPAROSCÓPICA
    // ============================================
    "cirugia-laparoscopica": {
        title: "Cirugía Laparoscópica",
        description: "Cirugía de mínima invasión. Operaciones complejas a través de pequeñas incisiones para una recuperación rápida.",
        whatIsIt: "Es la técnica estándar moderna para muchas cirugías. En lugar de abrir el abdomen, el cirujano usa una cámara y pinzas finas a través de huequitos de 1 cm. Menos dolor, menos cicatriz y alta hospitalaria más rápida.",
        whenToGo: [
            "Cálculos en la vesícula (Colecistectomía)",
            "Apendicitis aguda",
            "Hernias inguinales o abdominales",
            "Reflujo gastroesofágico (Hernia hiatal)",
            "Cirugía de colon o bazo",
        ],
        whyItMatters: [
            "Recuperación en días en lugar de semanas",
            "Menor riesgo de infecciones de herida",
            "Mucho menos dolor postoperatorio",
            "Mejor resultado estético (cicatrices mínimas)",
        ],
        treatments: [
            "Colecistectomía laparoscópica (vesícula)",
            "Apendicectomía laparoscópica",
            "Plastia de hernias inguinales (TEP/TAPP)",
            "Funduplicatura para reflujo",
            "Cirugía de colon mínimamente invasiva",
        ],
        relatedSpecialties: ["cirugia-general", "gastroenterologia", "cirugia-bariatrica"],
    },

    // ============================================
    // ARTROSCOPIA
    // ============================================
    "artroscopia": {
        title: "Artroscopia",
        description: "Mirando dentro de la articulación. Reparación de meniscos y ligamentos por orificios mínimos.",
        whatIsIt: "Es la 'laparoscopia' de las articulaciones. El traumatólogo introduce una cámara en la rodilla, hombro o cadera para reparar lesiones deportivas (meniscos rotos, ligamento cruzado) sin abrir la articulación completamente.",
        whenToGo: [
            "Rotura de menisco o ligamento cruzado (rodilla)",
            "Lesión del manguito rotador (hombro)",
            "Dolor articular crónico o bloqueo articular",
            "Inestabilidad de hombro (se sale el hueso)",
            "Desgaste de cartílago inicial",
        ],
        whyItMatters: [
            "Permite a los deportistas volver a jugar",
            "Mínima agresión a los tejidos sanos",
            "Rehabilitación mucho más acelerada",
            "Diagnóstico preciso al ver la lesión directamente",
        ],
        treatments: [
            "Meniscectomía o sutura meniscal",
            "Reconstrucción de Ligamento Cruzado Anterior (LCA)",
            "Reparación de manguito rotador",
            "Limpieza articular (debridamiento)",
            "Estabilización de hombro (Bankart)",
        ],
        relatedSpecialties: ["traumatologia-y-ortopedia", "medicina-del-deporte", "cirugia-de-mano"],
    },

    // ============================================
    // CIRUGÍA DE MANO
    // ============================================
    "cirugia-de-mano": {
        title: "Cirugía de Mano",
        description: "Precisión milimétrica. Tratamiento de lesiones en manos, muñecas y nervios periféricos.",
        whatIsIt: "Especialidad que combina traumatología y cirugía plástica/microcirugía. Trata desde fracturas de dedos hasta reimplantes de miembros, síndrome de túnel carpiano y tendinitis. La mano es una obra de ingeniería compleja que requiere expertos.",
        whenToGo: [
            "Síndrome del Túnel Carpiano (adormecimiento)",
            "Dedo en gatillo (trabado)",
            "Fracturas de muñeca o dedos",
            "Cortes en tendones o nervios de la mano",
            "Quistes sinoviales en muñeca",
        ],
        whyItMatters: [
            "Restaura la función esencial de la mano para trabajar y vivir",
            "Microcirugía para reparar nervios y vasos diminutos",
            "Trata el dolor crónico de muñeca",
            "Corrige deformidades por artritis o accidentes",
        ],
        treatments: [
            "Liberación de Túnel Carpiano",
            "Cirugía de dedo en gatillo",
            "Reparación de tendones flexores/extensores",
            "Osteosíntesis de fracturas de mano",
            "Microcirugía de nervios",
        ],
        relatedSpecialties: ["traumatologia-y-ortopedia", "cirugia-plastica", "rehabilitacion"],
    },

    // ============================================
    // CIRUGÍA REFRACTIVA
    // ============================================
    "cirugia-refractiva": {
        title: "Cirugía Refractiva",
        description: "Adiós a los lentes. Corrección láser de miopía, astigmatismo e hipermetropía.",
        whatIsIt: "Subespecialidad oftalmológica dedicada a mejorar el enfoque del ojo. Usando láser (LASIK/PRK) o lentes intraoculares, corrigen defectos visuales para que el paciente pueda ver bien sin depender de gafas o lentes de contacto.",
        whenToGo: [
            "Deseo de dejar de usar lentes (gafas)",
            "Miopía, Hipermetropía o Astigmatismo estables",
            "Presbicia (vista cansada) en mayores de 40",
            "Intolerancia a lentes de contacto",
            "Cataratas (lentes premium)",
        ],
        whyItMatters: [
            "Mejora radicalmente la calidad de vida y comodidad",
            "Elimina el gasto y molestia de lentes de por vida",
            "Corrige visiones muy altas difícilmente corregibles con gafas",
            "Procedimientos rápidos y seguros con láser",
        ],
        treatments: [
            "LASIK y Femto-LASIK",
            "PRK (queratectomía fotorrefractiva)",
            "Implante de Lente Intraocular Fáquica (ICL)",
            "Cirugía de cristalino transparente (Presbicia)",
            "Crosslinking (para queratocono)",
        ],
        relatedSpecialties: ["oftalmologia", "optometria", "cornea"],
    },

    // ============================================
    // OPTOMETRÍA
    // ============================================
    "optometria": {
        title: "Optometría",
        description: "Salud visual primaria. Graduación de lentes, lentes de contacto y terapia visual.",
        whatIsIt: "El optómetra es el especialista en la función visual. No opera, pero calcula la graduación exacta de tus lentes, adapta lentes de contacto especiales y realiza terapia visual para ojos vagos o problemas de enfoque. Trabaja de la mano con el oftalmólogo.",
        whenToGo: [
            "Visión borrosa de lejos o cerca",
            "Necesidad de cambiar la fórmula de los lentes",
            "Adaptación de lentes de contacto",
            "Dolor de cabeza al leer o usar computadora",
            "Ojo vago (ambliopía) en niños",
        ],
        whyItMatters: [
            "Detecta problemas de vista tempranos en niños (clave para aprendizaje)",
            "Adapta lentes de contacto para queratocono",
            "Mejora el rendimiento visual con terapia",
            "Es el primer filtro para detectar enfermedades oculares",
        ],
        treatments: [
            "Examen de refracción (medida de vista)",
            "Adaptación de lentes de contacto (blandos/rígidos)",
            "Terapia visual y ortóptica",
            "Adaptación de ayudas para baja visión",
            "Tonometría (presión ocular básica)",
        ],
        relatedSpecialties: ["oftalmologia", "oftalmologia-pediatrica", "cirugia-refractiva"],
    },

    // ============================================
    // AUDIOLOGÍA
    // ============================================
    "audiologia": {
        title: "Audiología",
        description: "El sentido del oído. Diagnóstico de sordera, problemas de equilibrio y adaptación de audífonos.",
        whatIsIt: "Especialidad enfocada en la audición y el equilibrio. Realiza audiometrías para medir cuánto escuchas y diagnostica por qué hay sordera o vértigo. También adapta prótesis auditivas (audífonos) e implantes cocleares.",
        whenToGo: [
            "Pérdida de audición (hipoacusia) en cualquier edad",
            "Zumbidos en los oídos (tinnitus)",
            "Vértigo o mareos constantes",
            "Niños que no desarrollan lenguaje (tamizaje)",
            "Necesidad de audífonos",
        ],
        whyItMatters: [
            "La audición es vital para la comunicación y desarrollo del lenguaje",
            "Detecta sordera en recién nacidos (tamizaje neonatal)",
            "Mejora el aislamiento social en adultos mayores sordos",
            "Diagnostica vértigos incapacitantes",
        ],
        treatments: [
            "Audiometría tonal y verbal",
            "Impedanciometría",
            "Emisiones Otoacústicas (Screening)",
            "Rehabilitación vestibular (para vértigo)",
            "Calibración y adaptación de audífonos",
        ],
        relatedSpecialties: ["otorrinolaringologia", "foniatria", "neurologia"],
    },

    // ============================================
    // FONIATRÍA
    // ============================================
    "foniatria": {
        title: "Foniatría",
        description: "Médicos de la comunicación. Trastornos de la voz, el habla, el lenguaje y la deglución.",
        whatIsIt: "Es la especialidad médica dedicada a la comunicación humana. Diagnostica por qué un niño no habla, por qué un cantante está ronco (disfonía) o por qué un abuelo se atraganta al comer (disfagia). Coordina la rehabilitación logopédica.",
        whenToGo: [
            "Ronquera crónica o pérdida de voz",
            "Retraso en el habla o lenguaje en niños",
            "Tartamudez",
            "Dificultad para tragar (disfagia)",
            "Problemas de articulación al hablar",
        ],
        whyItMatters: [
            "Diagnostica lesiones en cuerdas vocales (pólipos, nódulos)",
            "Asegura una alimentación segura en pacientes con disfagia",
            "Clave en el desarrollo infantil del lenguaje",
            "Rehabilita la voz profesional (cantantes, docentes)",
        ],
        treatments: [
            "Videoestroboscopia laríngea (ver cuerdas vocales)",
            "Evaluación de la deglución (Videoendoscopia)",
            "Terapia de voz",
            "Rehabilitación del lenguaje",
            "Manejo de disfemia (tartamudez)",
        ],
        relatedSpecialties: ["otorrinolaringologia", "audiologia", "rehabilitacion"],
    },

    // ============================================
    // LOGOFONOAUDIOLOGÍA
    // ============================================
    "logofonoaudiologia": {
        title: "Logofonoaudiología",
        description: "Terapia del lenguaje. Rehabilitación práctica de problemas de habla, voz y audición.",
        whatIsIt: "Profesionales de la salud que ejecutan la terapia para recuperar el habla o la voz. Trabajan enseñando a pronunciar (r-r), a usar la voz sin dañarla, o a entender el lenguaje tras un ACV (afasia).",
        whenToGo: [
            "Niños que no pronuncian bien ciertas letras",
            "Adultos que perdieron el habla tras un derrame",
            "Rehabilitación después de implante coclear",
            "Terapia miofuncional (tragar/respirar mal)",
            "Disfonía por mal uso de la voz",
        ],
        whyItMatters: [
            "Hace posible la comunicación efectiva en el día a día",
            "Corrige malos hábitos al tragar que deforman los dientes",
            "Enseña a escuchar de nuevo a los implantados cocleares",
            "Devuelve la capacidad de hablar a pacientes con daño cerebral",
        ],
        treatments: [
            "Terapia de lenguaje infantil",
            "Rehabilitación de afasias",
            "Terapia miofuncional orofacial",
            "Entrenamiento auditivo",
            "Terapia de voz vocal",
        ],
        relatedSpecialties: ["foniatria", "pediatria", "neurologia"],
    },

    // ============================================
    // CIRUGÍA DE CABEZA Y CUELLO
    // ============================================
    "cirugia-de-cabeza-y-cuello": {
        title: "Cirugía de Cabeza y Cuello",
        description: "Expertos en la anatomía compleja del cuello y cara. Tratamiento de tumores, tiroides y glándulas salivales.",
        whatIsIt: "Subespecialidad quirúrgica (de Otorrino o Cirugía General) enfocada en tumores y enfermedades quirúrgicas de la cara y el cuello. Son los expertos operando cáncer de lengua, garganta, laringe y cirugía compleja de tiroides.",
        whenToGo: [
            "Bultos o masas en el cuello",
            "Nódulos en tiroides sospechosos",
            "Cáncer de boca, lengua o garganta",
            "Tumores de glándulas salivales (parótida)",
            "Quistes congénitos del cuello",
        ],
        whyItMatters: [
            "Extirpa el cáncer preservando funciones vitales (hablar, tragar)",
            "Maneja la vía aérea difícil",
            "Realiza vaciamientos ganglionares precisos",
            "Trata tumores de base de cráneo complejos",
        ],
        treatments: [
            "Tiroidectomía total o parcial",
            "Parotidectomía",
            "Laringectomía (parcial o total)",
            "Resección de tumores de cavidad oral",
            "Vaciamiento ganglionar cervical",
        ],
        relatedSpecialties: ["otorrinolaringologia", "oncologia-radioterapica", "endocrinologia"],
    },

    // ============================================
    // GINECOLOGÍA ONCOLÓGICA
    // ============================================
    "ginecologia-oncologica": {
        title: "Ginecología Oncológica",
        description: "Lucha contra el cáncer femenino. Prevención y cirugía experta de cáncer de ovario, útero y mama.",
        whatIsIt: "El gineco-oncólogo es el cirujano experto en cánceres del sistema reproductivo femenino. No solo opera, sino que decide el manejo integral (quimio, radioterapia) para cáncer de ovario, endometrio, cérvix y vulva, con un enfoque en la supervivencia y calidad de vida.",
        whenToGo: [
            "Diagnóstico o sospecha de cáncer ginecológico",
            "Papanicolaou alterado (displasia severa)",
            "Masas o quistes ováricos complejos",
            "Sangrado postmenopáusico",
            "Antecedentes familiares de cáncer hereditario (BRCA)",
        ],
        whyItMatters: [
            "La cirugía especializada aumenta mucho la supervivencia en cáncer de ovario",
            "Maneja tratamientos conservadores para preservar fertilidad si es posible",
            "Previene tumores con cirugías profilácticas en pacientes de alto riesgo",
            "Ofrece un seguimiento experto a largo plazo",
        ],
        treatments: [
            "Histerectomía radical",
            "Cirugía de cáncer de ovario (citorreducción)",
            "Conización cervical",
            "Linfadenectomía pélvica/aórtica",
            "Cirugía profiláctica de ovario/trompas",
        ],
        relatedSpecialties: ["ginecologia", "oncologia-medica", "oncologia-radioterapica"],
    },

    // ============================================
    // MEDICINA MATERNO-FETAL
    // ============================================
    "medicina-materno-fetal": {
        title: "Medicina Materno-Fetal",
        description: "Embarazos de alto riesgo. Cuidados expertos para la madre y el bebé en gestaciones complicadas.",
        whatIsIt: "También llamados perinatólogos. Son ginecólogos subespecializados en 'el paciente no nacido' y madres con enfermedades graves. Atienden preeclampsia, diabetes gestacional, embarazos de gemelos y diagnostican malformaciones fetales.",
        whenToGo: [
            "Embarazo de alto riesgo (edad materna avanzada, enfermedades previas)",
            "Embarazo gemelar o múltiple",
            "Antecedente de partos prematuros o pérdidas gestacionales",
            "Diagnóstico de malformación fetal",
            "Diabetes o hipertensión en el embarazo",
        ],
        whyItMatters: [
            "Realiza ecografías genéticas avanzadas (Morfológico)",
            "Reduce el riesgo de parto prematuro",
            "Maneja cirugías fetales dentro del útero en casos selectos",
            "Decide el momento óptimo y seguro para el nacimiento",
        ],
        treatments: [
            "Ecografía Genética y Morfológica",
            "Amniocentesis y biopsia corial",
            "Cerclaje cervical",
            "Control de preeclampsia severa",
            "Monitoreo fetal avanzado (Doppler)",
        ],
        relatedSpecialties: ["ginecologia", "obstetricia", "neonatologia"],
    },

    // ============================================
    // CUIDADOS INTENSIVOS PEDIÁTRICOS
    // ============================================
    "cuidados-intensivos-pediatricos": {
        title: "Cuidados Intensivos Pediátricos",
        description: "Vigilancia extrema para los más pequeños. Medicina crítica para niños gravemente enfermos.",
        whatIsIt: "Es la terapia intensiva (UCI) para niños. Los intensivistas pediatras manejan soporte vital avanzado, respiradores y monitoreo continuo en niños con infecciones graves (sepsis), traumas severos, o post-operados de cirugías complejas.",
        whenToGo: [
            "Generalmente ingreso directo desde urgencias o quirófano",
            "Neumococo o meningitis grave",
            "Accidentes graves (traumatismo craneal)",
            "Recuperación de cirugía cardíaca o trasplante",
            "Estado epiléptico convulsivo",
        ],
        whyItMatters: [
            "Mantiene las funciones vitales mientras el cuerpo sana",
            "Maneja ventilación mecánica delicada en pulmones infantiles",
            "Evita daño cerebral por falta de oxígeno",
            "Coordina el cuidado de múltiples especialistas en casos críticos",
        ],
        treatments: [
            "Ventilación mecánica invasiva y no invasiva",
            "Manejo de shock y sepsis",
            "Cateterismo venoso central y arterial",
            "Diálisis peritoneal aguda",
            "Reanimación cardiopulmonar avanzada",
        ],
        relatedSpecialties: ["pediatria", "medicina-de-emergencias", "anestesiologia"],
    },

    // ============================================
    // MEDICINA DEL ADOLESCENTE
    // ============================================
    "medicina-del-adolescente": {
        title: "Medicina del Adolescente",
        description: "Especialistas en la transición. Salud física y emocional para jóvenes de 10 a 19 años.",
        whatIsIt: "El pediatra experto en 'teens', o hebiatra. Entiende que el adolescente no es un niño grande ni un adulto chiquito. Maneja cambios hormonales, problemas de crecimiento, acné, trastornos alimentarios, salud sexual y problemas emocionales.",
        whenToGo: [
            "Chequeo anual del adolescente",
            "Retraso o aceleración de la pubertad",
            "Acné severo o problemas menstruales",
            "Trastornos de alimentación (anorexia, bulimia)",
            "Dudas sobre sexualidad y anticoncepción",
        ],
        whyItMatters: [
            "Crea un espacio de confianza confidencial sin los padres (si es necesario)",
            "Detecta depresión y riesgos de conducta a tiempo",
            "Maneja la transición a la medicina de adultos",
            "Orienta sobre hábitos saludables de por vida",
        ],
        treatments: [
            "Evaluación del crecimiento y desarrollo puberal",
            "Consejería en salud reproductiva",
            "Manejo de trastornos de conducta alimentaria (equipo)",
            "Tratamiento de ETS",
            "Vacunación del adolescente (VPH, Meningococo)",
        ],
        relatedSpecialties: ["pediatria", "ginecologia", "psicologia-clinica"],
    },

    // ============================================
    // CIRUGÍA ESTÉTICA
    // ============================================
    "cirugia-estetica": {
        title: "Cirugía Estética",
        description: "Armonía y belleza. Procedimientos quirúrgicos para mejorar la apariencia y confianza.",
        whatIsIt: "La rama de la cirugía plástica enfocada en mejorar la estética, no por enfermedad, sino por deseo personal de armonía corporal. Incluye lipoescultura, aumento de mamas, rinoplastia y rejuvenecimiento facial.",
        whenToGo: [
            "Deseo de mejorar el contorno corporal (Lipoescultura, Abdominoplastia)",
            "Aumento, reducción o levantamiento de mamas",
            "Rinoplastia estética",
            "Rejuvenecimiento facial (Lifting, Párpados)",
            "Corrección de orejas prominentes (Otoplastia)",
        ],
        whyItMatters: [
            "Mejora la autoestima y seguridad personal",
            "Corrige cambios post-embarazo o post-pérdida de peso (Mommy Makeover)",
            "Rejuvenece la apariencia facial de forma natural",
            "Debe ser realizada por cirujanos plásticos certificados para seguridad",
        ],
        treatments: [
            "Mamoplastia de aumento/reducción",
            "Liposucción y Lipoescultura HD",
            "Abdominoplastia (Tummy Tuck)",
            "Rinoplastia",
            "Blefaroplastia (cirugía de párpados)",
        ],
        relatedSpecialties: ["cirugia-plastica-y-reconstructiva", "dermatologia", "cirugia-bariatrica"],
    },

    // ============================================
    // QUEMADOS
    // ============================================
    "quemados": {
        title: "Quemados",
        description: "Cuidados críticos de la piel. Tratamiento especializado de quemaduras graves y sus secuelas.",
        whatIsIt: "Unidad ultra-especializada de cirugía plástica e intensiva. Salva la vida de pacientes con grandes quemaduras, maneja el dolor extremo, previene infecciones mortales y reconstruye la piel dañada para recuperar la función y estética.",
        whenToGo: [
            "Quemaduras de segundo y tercer grado extensas",
            "Quemaduras eléctricas o químicas",
            "Quemaduras en cara, manos o genitales",
            "Secuelas de quemaduras (cicatrices retráctiles)",
            "Síndrome de Stevens-Johnson (reacción grave en piel)",
        ],
        whyItMatters: [
            "Requiere manejo en Unidad de Quemados para sobrevivir",
            "Evita cicatrices que impidan mover articulaciones",
            "Realiza injertos de piel tempranos para cerrar heridas",
            "Rehabilitación física y psicológica desde el día 1",
        ],
        treatments: [
            "Limpiezas quirúrgicas y desbridamiento",
            "Injertos de piel y sustitutos dérmicos",
            "Manejo de líquidos y shock en quemados",
            "Zetaplastias para liberar cicatrices",
            "Prendas de presoterapia",
        ],
        relatedSpecialties: ["cirugia-plastica-y-reconstructiva", "medicina-intensiva", "rehabilitacion"],
    },

    // ============================================
    // ANGIOLOGÍA
    // ============================================
    "angiologia": {
        title: "Angiología",
        description: "Salud de tus vasos sanguíneos. Diagnóstico y tratamiento médico de enfermedades circulatorias.",
        whatIsIt: "Es la 'medicina interna' de los vasos sanguíneos. Se enfoca en el diagnóstico no quirúrgico y prevención de enfermedades de venas (várices, trombosis) y arterias (mala circulación, pie diabético), promoviendo la salud vascular.",
        whenToGo: [
            "Piernas hinchadas, pesadas o cansadas",
            "Arañitas vasculares o várices visibles",
            "Prevención de trombosis en viajes o embarazo",
            "Cambios de color en pies o piernas",
            "Úlceras varicosas pequeñas",
        ],
        whyItMatters: [
            "Previene la aparición de úlceras crónicas en piernas",
            "Detecta riesgo de embolia pulmonar por trombosis",
            "Mejora la estética y confort de las piernas",
            "Controla factores de riesgo cardiovascular",
        ],
        treatments: [
            "Escleroterapia (inyecciones para arañitas)",
            "Eco Doppler venoso y arterial",
            "Manejo de medias de compresión",
            "Tratamiento médico de trombosis venosa",
            "Curas de úlceras vasculares",
        ],
        relatedSpecialties: ["cirugia-vascular-y-endovascular", "cardiologia", "dermatologia"],
    },

    // ============================================
    // FLEBOLOGÍA
    // ============================================
    "flebologia": {
        title: "Flebología",
        description: "Especialistas en venas. Tratamiento experto de várices, insuficiencia venosa y estética de piernas.",
        whatIsIt: "Subespecialidad dedicada exclusivamente a las venas. Trata desde las arañitas estéticas hasta las grandes várices que causan úlceras. Usa láser, espuma y técnicas modernas para eliminar venas enfermas sin cirugía agresiva.",
        whenToGo: [
            "Várices abultadas o dolorosas",
            "Manchas ocres (marrones) en tobillos",
            "Picazón intensa en piernas (eccema varicoso)",
            "Úlcera venosa abierta",
            "Deseo estético de eliminar venitas",
        ],
        whyItMatters: [
            "Elimina el dolor y pesadez de piernas",
            "Las várices no tratadas pueden sangrar o trombosarse",
            "Cierra úlceras que llevan años abiertas",
            "Procedimientos ambulatorios de rápida recuperación",
        ],
        treatments: [
            "Ablación láser endovenosa de safena",
            "Escleroterapia con espuma (Foam)",
            "Microflebectomía (extracción de venitas)",
            "Láser transdérmico estético",
            "Manejo avanzado de úlceras",
        ],
        relatedSpecialties: ["cirugia-vascular-y-endovascular", "angiologia", "medicina-estetica"],
    },

    // ============================================
    // MEDICINA PALIATIVA
    // ============================================
    "medicina-paliativa": {
        title: "Medicina Paliativa",
        description: "Calidad de vida y alivio. Cuidado compasivo para pacientes con enfermedades avanzadas y sus familias.",
        whatIsIt: "No se trata de 'cuando ya no hay nada que hacer', sino de 'hay mucho por hacer para estar bien'. Controla el dolor y síntomas molestos en cáncer, insuficiencia cardíaca o renal avanzada, enfocándose en el confort y dignidad.",
        whenToGo: [
            "Diagnóstico de enfermedad terminal o avanzada",
            "Dolor oncológico difícil de controlar",
            "Falta de aire o náuseas persistentes por enfermedad grave",
            "Soporte emocional y toma de decisiones al final de la vida",
            "Atención domiciliaria para pacientes postrados",
        ],
        whyItMatters: [
            "Elimina el dolor innecesario",
            "Permite al paciente vivir sus últimos días con dignidad y en familia",
            "Apoya a los cuidadores para evitar el agotamiento (burnout)",
            "Evita encarnizamiento terapéutico (tratamientos inútiles que hacen sufrir)",
        ],
        treatments: [
            "Manejo avanzado del dolor (morfina y derivados)",
            "Control de síntomas (náuseas, disnea, delirio)",
            "Sedación paliativa si es necesaria",
            "Apoyo espiritual y psicológico",
            "Planificación anticipada de cuidados",
        ],
        relatedSpecialties: ["oncologia-medica", "medicina-interna", "medicina-del-dolor"],
    },

    // ============================================
    // MEDICINA NUCLEAR
    // ============================================
    "medicina-nuclear": {
        title: "Medicina Nuclear",
        description: "Diagnóstico molecular. Uso de radioisótopos para ver cómo funcionan los órganos por dentro.",
        whatIsIt: "A diferencia de una radiografía (que ve huesos), la medicina nuclear ve 'funciones'. Inyecta trazadores seguros que se iluminan en zonas de alta actividad (como cáncer o infección) o muestran si el corazón recibe sangre o si el riñón filtra.",
        whenToGo: [
            "Gammagrafía ósea (ver metástasis o fracturas)",
            "PET-CT para estadiaje de cáncer",
            "Perfusión miocárdica (ver si hay infarto)",
            "Gammagrafía tiroidea",
            "Tratamiento con Iodo radioactivo (Tiroides)",
        ],
        whyItMatters: [
            "Detecta cáncer antes que aparezca en una tomografía normal",
            "Evalúa la función renal con precisión exacta",
            "Trata el cáncer de tiroides y el hipertiroidismo sin cirugía",
            "Diagnostica embolia pulmonar",
        ],
        treatments: [
            "PET-CT (Tomografía por Emisión de Positrones)",
            "Gammagrafía ósea, renal y pulmonar",
            "SPECT cardíaco",
            "Terapia con Iodo-131 (Hipertiroidismo/Cáncer)",
            "Ganglio centinela (para cirugía de mama/melanoma)",
        ],
        relatedSpecialties: ["radiologia-e-imagenes", "oncologia-medica", "endocrinologia"],
    },

    // ============================================
    // INTERVENCIONISMO VASCULAR
    // ============================================
    "intervencionismo-vascular": {
        title: "Intervencionismo Vascular",
        description: "Radiología que cura. Tratamientos mínimamente invasivos guiados por imágenes de alta tecnología.",
        whatIsIt: "Son los 'cirujanos de la imagen'. Navegan con guías diminutas por dentro de las arterias para tapar sangrados, destruir tumores hepáticos, poner filtros en venas o tratar miomas uterinos, todo por un pinchazo en la piel.",
        whenToGo: [
            "Embolización de miomas uterinos (sin quitar útero)",
            "Tratamiento de tumores hepáticos (Quimioembolización)",
            "Filtro de Vena Cava (prevención de embolia)",
            "Drenaje de abscesos profundos",
            "Biopsias de órganos difíciles",
        ],
        whyItMatters: [
            "Cura tumores sin cirugía abierta",
            "Detiene hemorragias internas graves rápidamente",
            "Permite conservar el útero en casos de miomatosis",
            "Alternativa para pacientes que no resisten una cirugía mayor",
        ],
        treatments: [
            "Embolización arterial (tumores, sangrados)",
            "Quimioembolización hepática (TACE)",
            "Colocación de catéteres permanentes (Port-a-Cath)",
            "Trombectomía mecánica (sacar coágulos)",
            "Angioplastia periférica",
        ],
        relatedSpecialties: ["radiologia-e-imagenes", "cirugia-vascular-y-endovascular", "oncologia-medica"],
    },

    // ============================================
    // ECOGRAFÍA
    // ============================================
    "ecografia": {
        title: "Ecografía",
        description: "Ultrasonido diagnóstico. Imágenes en tiempo real sin radiación para ver órganos y bebés.",
        whatIsIt: "El estetoscopio del siglo XXI. Usa ondas de sonido para ver hígado, riñones, útero, corazón y fetos. Es inocuo (no radiación), rápido y permite guiar biopsias o ver el flujo de sangre (Doppler).",
        whenToGo: [
            "Control del embarazo",
            "Dolor abdominal (vesícula, apéndice)",
            "Revisión de mamas, tiroides o testículos",
            "Doppler venoso (várices o trombosis)",
            "Ecografía muscular o articular",
        ],
        whyItMatters: [
            "Totalmente seguro para embarazadas y niños",
            "Diagnóstico inmediato de apendicitis o piedras vesiculares",
            "Guía agujas para tomar muestras sin dañar órganos",
            "Evalúa el flujo sanguíneo con Doppler",
        ],
        treatments: [
            "Ecografía abdominal y pélvica",
            "Ecografía Obstétrica (4D/5D)",
            "Eco Doppler color",
            "Ecografía de partes blandas (muscular, tiroides)",
            "Biopsias guiadas por eco",
        ],
        relatedSpecialties: ["radiologia-e-imagenes", "ginecologia", "medicina-interna"],
    },

    // ============================================
    // ANESTESIA PEDIÁTRICA
    // ============================================
    "anestesia-pediatrica": {
        title: "Anestesia Pediátrica",
        description: "Sueños seguros para niños. Anestesia especializada y manejo del dolor en bebés e infantes.",
        whatIsIt: "Los niños no son adultos pequeños, y su respuesta a la anestesia es diferente. Este especialista asegura que la cirugía sea segura, sin dolor y con el menor trauma psicológico posible para el niño y sus padres.",
        whenToGo: [
            "Cirugías en recién nacidos o prematuros",
            "Procedimientos dolorosos o largos en niños (ej. resonancias)",
            "Cirugía ambulatoria pediátrica",
            "Niños con síndromes genéticos que requieren operación",
        ],
        whyItMatters: [
            "Evita traumas psicológicos con sedación pre-quirúrgica",
            "Calcula dosis milimétricas para seguridad cardiovascular",
            "Maneja la vía aérea difícil infantil",
            "Controla el dolor postoperatorio para una recuperación tranquila",
        ],
        treatments: [
            "Inducción anestésica inhalatoria (mascarilla con sabor)",
            "Anestesia general y regional pediátrica",
            "Sedación para procedimientos (MRI, CT)",
            "Manejo del dolor agudo postoperatorio",
            "Acceso vascular difícil guiado por eco",
        ],
        relatedSpecialties: ["anestesiologia", "cirugia-pediatrica", "pediatria"],
    },

    // ============================================
    // ANESTESIA CARDIOVASCULAR
    // ============================================
    "anestesia-cardiovascular": {
        title: "Anestesia Cardiovascular",
        description: "Protegiendo el corazón dormido. Anestesia de alta complejidad para cirugías de corazón abierto.",
        whatIsIt: "Es el piloto del avión durante una cirugía de corazón. Mantiene al paciente vivo, maneja la bomba de circulación extracorpórea (corazón-pulmón artificial) y realiza ecocardiografía transesofágica para guiar al cirujano en tiempo real.",
        whenToGo: [
            "Cirugía de Bypass Coronario",
            "Cambio de válvulas cardíacas",
            "Cirugía de Aorta",
            "Trasplante cardíaco",
            "Procedimientos híbridos complejos",
        ],
        whyItMatters: [
            "Monitoriza cada latido durante operaciones críticas",
            "Evalúa el éxito de la reparación valvular antes de cerrar el pecho",
            "Maneja fármacos potentes para sostener la presión arterial",
            "Protege el cerebro y riñones durante la circulación extracorpórea",
        ],
        treatments: [
            "Ecocardiografía Transesofágica Intraoperatoria",
            "Manejo de Circulación Extracorpórea",
            "Monitorización hemodinámica invasiva",
            "Anestesia para cirugía cardíaca mínimamente invasiva",
            "Recuperación post-anestésica inmediata (UCI)",
        ],
        relatedSpecialties: ["anestesiologia", "cirugia-cardiovascular", "cardiologia"],
    },

    // ============================================
    // PATOLOGÍA
    // ============================================
    "patologia": {
        title: "Patología",
        description: "El diagnóstico definitivo. Análisis de tejidos y células para guiar tratamientos médicos.",
        whatIsIt: "Es la 'base de la medicina'. El patólogo analiza biopsias, órganos y muestras bajo el microscopio para decir 'esto es cáncer' o 'esto es benigno'. Su diagnóstico es la ley que dicta qué tratamiento (cirugía, quimio) recibirá el paciente.",
        whenToGo: [
            "Generalmente es interconsulta: tu médico envía la muestra",
            "Solicitud de biopsia tras una cirugía",
            "Revisión de laminillas (segunda opinión diagnóstica)",
            "Estudio de Papanicolaou o citología",
        ],
        whyItMatters: [
            "Sin diagnóstico patológico no hay tratamiento oncológico seguro",
            "Determina la agresividad de un tumor (grado)",
            "Confirma si una cirugía eliminó todo el cáncer (bordes)",
            "Diagnostica enfermedades raras o autoinmunes en tejidos",
        ],
        treatments: [
            "Biopsia quirúrgica e incisional",
            "Biopsia por congelación (diagnóstico durante la cirugía)",
            "Estudios inmunohistoquímicos (marcadores tumorales)",
            "Autopsias clínicas",
            "Citología de líquidos corporales",
        ],
        relatedSpecialties: ["oncologia-medica", "cirugia-general", "medicina-interna"],
    },

    // ============================================
    // PATOLOGÍA CLÍNICA
    // ============================================
    "patologia-clinica": {
        title: "Patología Clínica",
        description: "Laboratorio médico experto. Análisis de sangre y fluidos para descubrir enfermedades ocultas.",
        whatIsIt: "Es la especialidad médica que dirige el laboratorio clínico. Valida que tus exámenes de sangre sean confiables, interpreta resultados complejos y asesora a otros médicos sobre qué pruebas pedir para llegar a un diagnóstico difícil.",
        whenToGo: [
            "Interpretación de exámenes de laboratorio confusos",
            "Investigación de anemias raras o coagulopatías",
            "Control de calidad en bancos de sangre",
            "Diagnóstico molecular de infecciones",
        ],
        whyItMatters: [
            "Asegura que un resultado de laboratorio sea real y no un error",
            "Detecta enfermedades en etapas tempranas mediante screening",
            "Gestiona las transfusiones de sangre seguras",
            "Interpreta perfiles hormonales complejos",
        ],
        treatments: [
            "Análisis clínicos (Hematología, Bioquímica)",
            "Microbiología (Cultivos)",
            "Pruebas de coagulación avanzadas",
            "Medicina Transfusional",
            "Diagnóstico molecular (PCR)",
        ],
        relatedSpecialties: ["hematologia", "infectologia", "medicina-interna"],
    },

    // ============================================
    // CITOPATOLOGÍA
    // ============================================
    "citopatologia": {
        title: "Citopatología",
        description: "Diagnóstico celular preciso. Detección de cáncer en muestras mínimas como el Papanicolaou.",
        whatIsIt: "Subespecialidad de la patología que diagnostica enfermedades mirando células sueltas (no tejidos). Es famosa por el Papanicolaou (cáncer de cérvix) y las punciones con aguja fina de tiroides o ganglios.",
        whenToGo: [
            "Resultado anormal de Papanicolaou",
            "Punción de nódulo tiroideo (BAAF)",
            "Análisis de líquido pleural o ascítico",
            "Cepillado bronquial (pulmón)",
        ],
        whyItMatters: [
            "Método rápido y poco invasivo para diagnosticar cáncer",
            "Piedra angular en la prevención del cáncer de cuello uterino",
            "Evita cirugías innecesarias en nódulos tiroideos benignos",
            "Permite diagnósticos rápidos in-situ",
        ],
        treatments: [
            "Lectura de Papanicolaou (Cervical)",
            "Aspiración con Aguja Fina (BAAF)",
            "Citología de orina (Cáncer de vejiga)",
            "Citología de LCR (Líquido cefalorraquídeo)",
        ],
        relatedSpecialties: ["ginecologia", "endocrinologia", "neumologia"],
    },

    // ============================================
    // FISIOTERAPIA
    // ============================================
    "fisioterapia": {
        title: "Fisioterapia",
        description: "Movimiento es vida. Rehabilitación física para recuperar la fuerza y movilidad perdida.",
        whatIsIt: "Profesionales de la salud expertos en biomecánica. Usan ejercicio, calor, frío, electricidad y masajes para tratar lesiones musculares, recuperar pacientes después de cirugías o ayudar a caminar a quienes han sufrido un ACV.",
        whenToGo: [
            "Dolor de espalda, cuello o rodillas",
            "Recuperación después de una fractura o cirugía",
            "Lesiones deportivas (esguinces, desgarros)",
            "Parálisis facial o secuelas de ACV",
            "Problemas de postura",
        ],
        whyItMatters: [
            "Evita que una lesión aguda se vuelva dolor crónico",
            "Devuelve la independencia al paciente",
            "Prepara el cuerpo para volver al deporte",
            "Manejo conservador que evita muchas cirugías",
        ],
        treatments: [
            "Terapia manual y masoterapia",
            "Ejercicios terapéuticos y estiramientos",
            "Electroterapia (TENS) y Ultrasonido",
            "Fisioterapia respiratoria",
            "Hidroterapia",
        ],
        relatedSpecialties: ["traumatologia-y-ortopedia", "medicina-fisica-y-rehabilitacion", "medicina-del-deporte"],
    },

    // ============================================
    // TERAPIA OCUPACIONAL
    // ============================================
    "terapia-ocupacional": {
        title: "Terapia Ocupacional",
        description: "Independencia diaria. Ayuda para realizar las actividades cotidianas con autonomía.",
        whatIsIt: "Se enfoca en la 'ocupación' del ser humano: vivir. Ayuda a personas con discapacidad a aprender a vestirse, comer, escribir o trabajar de nuevo. Adaptan el entorno y entrenan habilidades motoras finas.",
        whenToGo: [
            "Dificultad para usar las manos (artritis, secuelas)",
            "Niños con problemas de desarrollo o autismo",
            "Adultos mayores que pierden autonomía",
            "Adaptación del hogar para discapacitados",
            "Rehabilitación de mano post-cirugía",
        ],
        whyItMatters: [
            "Hace posible que un paciente viva solo de nuevo",
            "Mejora la calidad de vida en enfermedades degenerativas",
            "Integra a niños con discapacidad en la escuela",
            "Rehabilita la función fina de la mano (escribir, abotonar)",
        ],
        treatments: [
            "Entrenamiento en Actividades de Vida Diaria (AVD)",
            "Estimulación cognitiva y sensorial",
            "Confección de férulas para mano",
            "Adaptación del puesto de trabajo",
            "Terapia de integración sensorial",
        ],
        relatedSpecialties: ["medicina-fisica-y-rehabilitacion", "neurologia", "pediatria"],
    },

    // ============================================
    // QUIROPRÁCTICA
    // ============================================
    "quiropractica": {
        title: "Quiropráctica",
        description: "Salud de la columna. Ajustes manuales para aliviar el dolor y mejorar la función nerviosa.",
        whatIsIt: "Profesión sanitaria enfocada en la columna vertebral y el sistema nervioso. Mediante ajustes manuales precisos, corrigen desviaciones vertebrales para aliviar el dolor de espalda, cuello y mejorar la movilidad sin uso de fármacos.",
        whenToGo: [
            "Dolor lumbar o cervical crónico",
            "Ciática (dolor que baja por la pierna)",
            "Dolores de cabeza tensionales o migrañas",
            "Rigidez muscular y articular",
            "Malas posturas o escoliosis leve",
        ],
        whyItMatters: [
            "Alternativa no farmacológica para el manejo del dolor",
            "Mejora la movilidad de la columna y la postura",
            "Reduce el consumo de analgésicos",
            "Complementa el tratamiento ortopédico y fisioterapéutico",
        ],
        treatments: [
            "Ajustes quiroprácticos (manipulación espinal)",
            "Terapia de tejidos blandos",
            "Ejercicios de corrección postural",
            "Descompresión espinal mecánica",
            "Educación ergonómica",
        ],
        relatedSpecialties: ["traumatologia-y-ortopedia", "fisioterapia", "medicina-del-deporte"],
    },

    // ============================================
    // FARMACOLOGÍA CLÍNICA
    // ============================================
    "farmacologia-clinica": {
        title: "Farmacología Clínica",
        description: "Expertos en medicamentos. Optimización de tratamientos y estudio de efectos de fármacos.",
        whatIsIt: "Médicos expertos en cómo actúan las medicinas. Asesoran sobre qué dosis dar, mezclas peligrosas de pastillas, o por qué un tratamiento no funciona. Clave en pacientes que toman muchos medicamentos (polimedicados).",
        whenToGo: [
            "Pacientes que toman múltiples medicamentos (revisión)",
            "Reacciones adversas a medicamentos sospechosas",
            "Ajuste de dosis en insuficiencia renal o hepática",
            "Consultas sobre interacciones farmacológicas",
        ],
        whyItMatters: [
            "Evita intoxicaciones o efectos secundarios graves",
            "Optimiza el tratamiento para que sea efectivo",
            "Reduce el gasto innecesario en medicamentos redundantes",
            "Personaliza la terapia según la genética del paciente",
        ],
        treatments: [
            "Conciliación de medicación",
            "Monitoreo terapéutico de fármacos (niveles en sangre)",
            "Consultoría farmacogenética",
            "Manejo de toxicidad por fármacos",
        ],
        relatedSpecialties: ["medicina-interna", "geriatria", "toxicologia"],
    },

    // ============================================
    // TOXICOLOGÍA
    // ============================================
    "toxicologia": {
        title: "Toxicología",
        description: "Antidotos y venenos. Manejo de intoxicaciones agudas, picaduras y exposiciones químicas.",
        whatIsIt: "La especialidad de las emergencias químicas. Trata desde sobredosis de drogas y picaduras de escorpión hasta intoxicaciones por plomo o pesticidas laborales. Saben cuál es el antídoto exacto para salvar la vida.",
        whenToGo: [
            "Intoxicación por medicamentos o drogas",
            "Picaduras de animales venenosos (serpientes, arañas)",
            "Exposición a gases tóxicos o químicos industriales",
            "Ingesta de productos de limpieza en niños",
        ],
        whyItMatters: [
            "El tiempo es vida: aplican antídotos específicos rápidamente",
            "Maneja los efectos de drogas de abuso",
            "Trata secuelas a largo plazo de metales pesados",
            "Asesora a industrias sobre seguridad química",
        ],
        treatments: [
            "Administración de antídotos y sueros antiofídicos",
            "Descontaminación digestiva y dérmica",
            "Hemodiálisis para eliminar tóxicos",
            "Quelación de metales pesados",
        ],
        relatedSpecialties: ["medicina-de-emergencias", "medicina-del-trabajo", "medicina-interna"],
    },

    // ============================================
    // MEDICINA DEL TRABAJO
    // ============================================
    "medicina-del-trabajo": {
        title: "Medicina del Trabajo",
        description: "Salud en el empleo. Prevención de riesgos laborales y cuidado de la salud del trabajador.",
        whatIsIt: "Velan porque el trabajo no enferme a la gente. Realizan exámenes ocupacionales, determinan si alguien está apto para un puesto peligroso y tratan enfermedades causadas por el trabajo (como sordera por ruido o dolor de espalda por carga).",
        whenToGo: [
            "Exámenes pre-ocupacionales o de retiro",
            "Accidentes laborales",
            "Evaluación de enfermedades profesionales",
            "Evaluación de ergonomía en el puesto de trabajo",
            "Incapacidad laboral",
        ],
        whyItMatters: [
            "Previene accidentes y enfermedades crónicas laborales",
            "Adapta el trabajo a la salud de la persona",
            "Gestiona el retorno al trabajo tras una baja médica",
            "Cumplimiento legal de seguridad y salud",
        ],
        treatments: [
            "Evaluación de aptitud laboral",
            "Vigilancia de la salud (audiometrías, espirometrías laborales)",
            "Investigación de enfermedades profesionales",
            "Vacunación laboral",
            "Ergonomía",
        ],
        relatedSpecialties: ["medicina-legal-y-forense", "traumatologia-y-ortopedia", "neumologia"],
    },

    // ============================================
    // MEDICINA LEGAL Y FORENSE
    // ============================================
    "medicina-legal-y-forense": {
        title: "Medicina Legal y Forense",
        description: "Ciencia y justicia. Peritaje médico para resolver cuestiones legales y criminales.",
        whatIsIt: "El puente entre la medicina y la ley. Determinan causas de muerte, evalúan lesiones tras agresiones o accidentes de tráfico, y valoran discapacidades o mala praxis para jueces y tribunales.",
        whenToGo: [
            "Evaluación de lesiones por agresiones o accidentes",
            "Determinación de incapacidad o discapacidad legal",
            "Casos de violencia de género o abuso",
            "Búsqueda de segunda opinión pericial",
            "Mala praxis médica",
        ],
        whyItMatters: [
            "Aporta la prueba científica para hacer justicia",
            "Documenta lesiones para indemnizaciones de seguros",
            "Protege a víctimas de violencia documentando el daño",
            "Esclarece causas de muerte complejas",
        ],
        treatments: [
            "Peritaje médico-legal (informes)",
            "Valoración del daño corporal",
            "Autopsia médico-legal",
            "Evaluación de capacidad mental (testamentos, tutelas)",
            "Toxicología forense",
        ],
        relatedSpecialties: ["patologia", "psiquiatria", "traumatologia-y-ortopedia"],
    },

    // ============================================
    // MEDICINA PREVENTIVA Y SALUD PÚBLICA
    // ============================================
    "medicina-preventiva-y-salud-publica": {
        title: "Medicina Preventiva y Salud Pública",
        description: "Salud para todos. Estrategias para prevenir enfermedades en comunidades enteras.",
        whatIsIt: "Los estrategas de la salud. No tratan a un solo paciente, sino a poblaciones. Diseñan campañas de vacunación, controlan epidemias, gestionan hospitales y promueven hábitos saludables para evitar que la gente enferme.",
        whenToGo: [
            "Vacunación del viajero",
            "Consultoría en epidemiología",
            "Gestión sanitaria y calidad asistencial",
            "Programas de dejar de fumar o prevención de obesidad",
        ],
        whyItMatters: [
            "La prevención es más efectiva y barata que la cura",
            "Controla brotes de enfermedades infecciosas",
            "Mejora la calidad de atención en los hospitales",
            "Diseña políticas de salud que salvan miles de vidas",
        ],
        treatments: [
            "Planificación de calendarios vacunales",
            "Vigilancia epidemiológica",
            "Educación y promoción de la salud",
            "Gestión de riesgos sanitarios",
            "Medicina del viajero",
        ],
        relatedSpecialties: ["infectologia", "medicina-familiar", "medicina-del-trabajo"],
    },

    // ============================================
    // MEDICINA HIPERBÁRICA
    // ============================================
    "medicina-hiperbarica": {
        title: "Medicina Hiperbárica",
        description: "Oxígeno que cura. Tratamiento en cámaras presurizadas para heridas difíciles e infecciones.",
        whatIsIt: "Usa cámaras especiales donde el paciente respira oxígeno puro a alta presión. Esto satura la sangre de oxígeno, ayudando a cerrar heridas de pie diabético, curar infecciones de huesos y tratar la enfermedad por descompresión (busos).",
        whenToGo: [
            "Pie diabético con heridas que no cicatrizan",
            "Infecciones de huesos crónicas (osteomielitis)",
            "Lesiones por radioterapia (radionecrosis)",
            "Intoxicación por monóxido de carbono",
            "Enfermedad por descompresión (buceo)",
        ],
        whyItMatters: [
            "Evita amputaciones en pacientes diabéticos",
            "Acelera la cicatrización de injertos de piel",
            "Salva vidas en intoxicaciones por humo/gas",
            "Trata infecciones donde los antibióticos no llegan bien",
        ],
        treatments: [
            "Cámara Hiperbárica Multiplace/Monoplace",
            "Oxigenoterapia Hiperbárica (OHB)",
            "Manejo de heridas complejas en cámara",
        ],
        relatedSpecialties: ["cirugia-vascular-y-endovascular", "infectologia", "traumatologia-y-ortopedia"],
    },

    // ============================================
    // TRANSPLANTE DE ÓRGANOS
    // ============================================
    "transplante-de-organos": {
        title: "Transplante de Órganos",
        description: "El regalo de la vida. Cirugía de alta complejidad para reemplazar órganos vitales que fallan.",
        whatIsIt: "Es la cima de la cirugía compleja. Cuando un órgano (riñón, hígado, corazón) ya no funciona y no hay cura, se reemplaza por uno sano de un donante. Requiere un equipo enorme de cirujanos, inmunólogos y psicólogos para asegurar que el cuerpo acepte el nuevo órgano.",
        whenToGo: [
            "Insuficiencia renal crónica terminal (lista de esfera)",
            "Cirrosis hepática descompensada",
            "Insuficiencia cardíaca avanzada",
            "Evaluación de donante vivo (ej. riñón de familiar)",
            "Seguimiento post-trasplante",
        ],
        whyItMatters: [
            "Es la única cura para fallas terminales de órganos",
            "Devuelve una calidad de vida casi normal a pacientes muy graves",
            "El trasplante renal libera al paciente de la diálisis",
            "Requiere medicación de por vida (inmunosupresión) muy delicada",
        ],
        treatments: [
            "Trasplante Renal (vivo o cadavérico)",
            "Trasplante Hepático",
            "Trasplante de Córnea",
            "Trasplante de Médula Ósea (Hematología)",
            "Manejo de inmunosupresores",
        ],
        relatedSpecialties: ["cirugia-general", "nefrologia", "hepatologia"],
    },

    // ============================================
    // ORTODONCIA
    // ============================================
    "ortodoncia": {
        title: "Ortodoncia",
        description: "Sonrisas alineadas. Corrección de la posición de los dientes y la mordida.",
        whatIsIt: "La especialidad de los 'brackets'. No solo es estética; endereza dientes chuecos y corrige mordidas que desgastan la dentadura o duelen. Usa aparatos fijos o alineadores invisibles para mover los dientes a su lugar ideal.",
        whenToGo: [
            "Dientes apiñados o chuecos",
            "Mordida abierta (no cierran los dientes adelante)",
            "Mandíbula muy salida o muy atrás",
            "Espacios entre dientes",
            "Dolor en la articulación de la mandíbula por mala mordida",
        ],
        whyItMatters: [
            "Mejora la estética de la sonrisa y la confianza",
            "Facilita la higiene (dientes rectos se limpian mejor)",
            "Evita desgastes anormales y fracturas dentales",
            "Mejora la masticación y digestión",
        ],
        treatments: [
            "Brackets metálicos y estéticos (zafiro)",
            "Ortodoncia invisible (alineadores transparentes)",
            "Ortopedia maxilar (en niños en crecimiento)",
            "Retenedores post-tratamiento",
        ],
        relatedSpecialties: ["odontologia", "cirugia-oral-y-maxilofacial", "odontopediatria"],
    },

    // ============================================
    // ENDODONCIA
    // ============================================
    "endodoncia": {
        title: "Endodoncia",
        description: "Salvando el diente. Tratamiento de conducto para infecciones profundas y dolor dental.",
        whatIsIt: "Especialistas en el nervio del diente. Cuando una caries llega profundo y duele mucho, o sale un flemón, el endodoncista limpia el interior de la raíz para eliminar la infección y salvar la pieza dental en lugar de sacarla.",
        whenToGo: [
            "Dolor de muelas intenso y pulsátil",
            "Sensibilidad extrema al frío o calor que dura mucho",
            "Hinchazón en la encía (flemón/absceso)",
            "Diente oscuro por golpe antiguo",
            "Caries muy profunda",
        ],
        whyItMatters: [
            "Evita la extracción del diente natural",
            "Elimina el dolor agudo inmediatamente",
            "Mantiene el hueso y la función masticatoria",
            "Prepara el diente para una corona definitiva",
        ],
        treatments: [
            "Tratamiento de conducto (Endodoncia)",
            "Retratamiento de conductos (re-endodoncia)",
            "Cirugía apical (apicectomía)",
            "Manejo de trauma dental",
            "Blanqueamiento interno (dientes oscuros)",
        ],
        relatedSpecialties: ["odontologia", "prostodoncia", "cirugia-oral-y-maxilofacial"],
    },

    // ============================================
    // PERIODONCIA
    // ============================================
    "periodoncia": {
        title: "Periodoncia",
        description: "Encías sanas, dientes firmes. Tratamiento de la gingivitis y la piorrea.",
        whatIsIt: "El cimiento de la boca. Trata las encías y el hueso que sujeta los dientes. Combate el sangrado de encías, el mal aliento y la movilidad dental. También coloca implantes dentales.",
        whenToGo: [
            "Sangrado de encías al cepillarse",
            "Dientes que se mueven o se sienten flojos",
            "Mal aliento persistente (halitosis)",
            "Encías retraídas (dientes largos)",
            "Pérdida de hueso dental",
        ],
        whyItMatters: [
            "Detiene la pérdida de dientes por enfermedad periodontal",
            "Mejora la salud general (relación con diabetes y corazón)",
            "Elimina la infección crónica de la boca",
            "Mejora la estética de la encía (sonrisa gingival)",
        ],
        treatments: [
            "Limpieza profunda y raspado radicular",
            "Cirugía de encías (Colgajos)",
            "Injertos de encía (para retracciones)",
            "Colocación de implantes dentales",
            "Alargamiento de corona",
        ],
        relatedSpecialties: ["odontologia", "implantologia-dental", "prostodoncia"],
    },

    // ============================================
    // IMPLANTOLOGÍA DENTAL
    // ============================================
    "implantologia-dental": {
        title: "Implantología Dental",
        description: "Dientes nuevos fijos. Recuperación de piezas dentales perdidas con tornillos de titanio.",
        whatIsIt: "Es la solución más moderna para reponer dientes perdidos. Colocan 'raíces' artificiales de titanio en el hueso sobre las cuales se montan coronas o prótesis completas. Se sienten y funcionan como dientes propios.",
        whenToGo: [
            "Pérdida de uno o más dientes",
            "Prótesis removibles que se mueven o lastiman",
            "Deseo de dientes fijos",
            "Falta de hueso para prótesis convencionales",
        ],
        whyItMatters: [
            "Recupera la capacidad de masticar con fuerza",
            "Evita que se desgaste el hueso mandibular",
            "No hay que limar dientes vecinos (como en puentes)",
            "Mejora radicalmente la estética facial",
        ],
        treatments: [
            "Colocación de implantes dentales",
            "Elevación de seno maxilar (Sinus Lift)",
            "Injertos óseos (regeneración de hueso)",
            "Prótesis híbridas (All-on-4)",
            "Carga inmediata (dientes en un día)",
        ],
        relatedSpecialties: ["periodoncia", "prostodoncia", "cirugia-oral-y-maxilofacial"],
    },

    // ============================================
    // CIRUGÍA ORAL Y MAXILOFACIAL
    // ============================================
    "cirugia-oral-y-maxilofacial": {
        title: "Cirugía Oral y Maxilofacial",
        description: "Cirugía mayor de la cara y boca. Extracción de muelas del juicio y corrección de mandíbula.",
        whatIsIt: "Especialidad médico-odontológica. Operan desde muelas del juicio complicadas hasta fracturas de cara, tumores de mandíbula o correcciones ortognáticas (mover la mandíbula de lugar).",
        whenToGo: [
            "Extracción de muelas del juicio (cordales) impactadas",
            "Dolor o chasquidos en la mandíbula (ATM)",
            "Quistes o tumores en los maxilares",
            "Fracturas faciales por accidentes",
            "Necesidad de cirugía ortognática (cara asimétrica)",
        ],
        whyItMatters: [
            "Resuelve infecciones dentales graves que van al cuello",
            "Corrige deformidades faciales mejorando función y estética",
            "Reconstruye la cara tras traumatismos",
            "Coloca implantes complejos (cigomáticos)",
        ],
        treatments: [
            "Exodoncia de terceros molares (cordales)",
            "Cirugía ortognática (corrección ósea facial)",
            "Biopsia de tumores orales",
            "Artrocentesis de ATM",
            "Frenilectomía (frenillos)",
        ],
        relatedSpecialties: ["ortodoncia", "odontologia", "cirugia-plastica"],
    },

    // ============================================
    // ODONTOPEDIATRÍA
    // ============================================
    "odontopediatria": {
        title: "Odontopediatría",
        description: "Dentista de niños. Cuidado dental especializado desde el primer diente hasta la adolescencia.",
        whatIsIt: "Saben manejar el miedo dental de los niños. Cuidan los dientes de leche (que son vitales para guiar a los definitivos) y tratan caries infantiles con técnicas rápidas y amigables. Previenen el miedo al dentista.",
        whenToGo: [
            "Primera visita al salir el primer diente (o 1 año)",
            "Caries en dientes de leche",
            "Traumatismos dentales (caídas, golpes)",
            "Aplicación de flúor y sellantes preventivos",
            "Malos hábitos (chuparse el dedo)",
        ],
        whyItMatters: [
            "Un diente de leche sano guía a un diente definitivo sano",
            "Evita dolor e infecciones en niños pequeños",
            "Crea hábitos de higiene positivos de por vida",
            "Detecta problemas de mordida temprano",
        ],
        treatments: [
            "Restauraciones (tapaduras) en dientes temporales",
            "Pulpotomía (tratamiento de nervio infantil)",
            "Coronas metálicas o estéticas para niños",
            "Mantenedores de espacio (si se pierde un diente antes)",
            "Sedación con óxido nitroso (gas de la risa)",
        ],
        relatedSpecialties: ["pediatria", "ortodoncia", "ortopedia-dentomaxilofacial"],
    },

    // ============================================
    // ORTOPEDIA DENTOMAXILOFACIAL
    // ============================================
    "ortopedia-dentomaxilofacial": {
        title: "Ortopedia Dentomaxilofacial",
        description: "Guiando el crecimiento. Corrección de los huesos de la cara en niños en desarrollo.",
        whatIsIt: "A diferencia de la ortodoncia (que mueve dientes), la ortopedia mueve huesos. Se usa en niños que están creciendo para ensanchar paladares estrechos o avanzar mandíbulas pequeñas, aprovechando el crecimiento natural.",
        whenToGo: [
            "Paladar estrecho u ojival",
            "Mordida cruzada en niños",
            "Mandíbula muy pequeña (perfil de pájaro)",
            "Prognatismo (mandíbula salida) incipiente",
            "Niños respiradores bucales",
        ],
        whyItMatters: [
            "Corrige problemas esqueléticos que de adulto solo se operan",
            "Mejora la respiración nasal al ensanchar el paladar",
            "Crea espacio para que salgan todos los dientes",
            "Armoniza el perfil facial del niño",
        ],
        treatments: [
            "Disyuntor de paladar (aparatología expansora)",
            "Máscara facial (para traccionar maxilar)",
            "Aparatos funcionales de avance mandibular",
            "Pistas planas",
        ],
        relatedSpecialties: ["odontopediatria", "ortodoncia", "foniatria"],
    },

    // ============================================
    // PROSTODONCIA
    // ============================================
    "prostodoncia": {
        title: "Prostodoncia",
        description: "Rehabilitación oral completa. Estética dental y reemplazo funcional de dientes perdidos.",
        whatIsIt: "El arquitecto de la sonrisa. Diseña y ejecuta rehabilitaciones complejas, carillas estéticas, coronas y puentes. Coordina con el periodoncista y el cirujano para restaurar bocas completas devolviendo función y belleza.",
        whenToGo: [
            "Dientes muy destruidos o desgastados (bruxismo)",
            "Necesidad de diseño de sonrisa (carillas)",
            "Prótesis totales o parciales",
            "Rehabilitación sobre implantes complicada",
            "Problemas de oclusión (mordida)",
        ],
        whyItMatters: [
            "Devuelve la estética natural de la sonrisa",
            "Restaura la dimensión vertical de la cara (evita cara de viejo)",
            "Soluciona problemas de masticación complejos",
            "Materiales de alta tecnología (Cerámica, Zirconio)",
        ],
        treatments: [
            "Coronas y puentes de Zirconio/Porcelana",
            "Carillas dentales (Veneers)",
            "Prótesis sobre implantes",
            "Rehabilitación oral completa",
            "Placas de bruxismo",
        ],
        relatedSpecialties: ["odontologia", "implantologia-dental", "periodoncia"],
    },

    // ============================================
    // PODOLOGÍA
    // ============================================
    "podologia": {
        title: "Podología",
        description: "Salud de tus pies. Cuidado especializado para pies sanos y sin dolor.",
        whatIsIt: "Especialistas en el cuidado del pie. Tratan desde uñas encarnadas y hongos hasta alteraciones de la pisada. Clave en diabéticos y deportistas para prevenir lesiones y mantener la movilidad.",
        whenToGo: [
            "Uñas encarnadas (onicocriptosis)",
            "Hongos en uñas o pie de atleta",
            "Callosidades dolorosas o verrugas plantares",
            "Dolor en talón o planta del pie",
            "Pie diabético (prevención)",
        ],
        whyItMatters: [
            "Previene úlceras y amputaciones en diabéticos",
            "Soluciona dolores al caminar que afectan la columna",
            "Realiza cirugías menores de uña sin dolor",
            "Confecciona plantillas personalizadas",
        ],
        treatments: [
            "Quiropodia (limpieza y corte profesional)",
            "Cirugía de uña encarnada (matricectomía)",
            "Tratamiento láser para hongos",
            "Estudio de la pisada y plantillas",
            "Curación de pie diabético",
        ],
        relatedSpecialties: ["dermatologia", "medicina-del-deporte", "traumatologia-y-ortopedia"],
    },

    // ============================================
    // PSICOPEDAGOGÍA
    // ============================================
    "psicopedagogia": {
        title: "Psicopedagogía",
        description: "Expertos en aprendizaje. Apoyo para superar dificultades escolares y cognitivas.",
        whatIsIt: "Profesionales que unen psicología y educación. Ayudan a niños (y adultos) que les cuesta aprender, concentrarse o organizarse. Diagnostican TDAH, dislexia y dan herramientas para estudiar mejor.",
        whenToGo: [
            "Bajo rendimiento escolar inexplicable",
            "Dificultad para leer, escribir o calcular (Dislexia, Discalculia)",
            "Problemas de atención o concentración",
            "Falta de técnicas de estudio",
            "Orientación vocacional",
        ],
        whyItMatters: [
            "Evita la frustración y el fracaso escolar",
            "Mejora la autoestima del niño",
            "Adapta la enseñanza a la forma de aprender de cada uno",
            "Orienta a padres y colegios sobre adaptaciones necesarias",
        ],
        treatments: [
            "Evaluación psicopedagógica completa",
            "Reeducación de lectoescritura",
            "Entrenamiento en funciones ejecutivas (organización)",
            "Terapia de aprendizaje",
            "Asesoramiento escolar",
        ],
        relatedSpecialties: ["psicologia-clinica", "neurologia-pediatrica", "pediatria"],
    },

    // ============================================
    // ESTIMULACIÓN TEMPRANA
    // ============================================
    "estimulacion-temprana": {
        title: "Estimulación Temprana",
        description: "Impulso al desarrollo. Ejercicios y juegos para potenciar las capacidades del bebé.",
        whatIsIt: "Intervención dirigida a bebés (0-6 años) con riesgo de retraso o sanos. Aprovecha la plasticidad cerebral infantil mediante juegos y ejercicios para maximizar su desarrollo motor, cognitivo y social.",
        whenToGo: [
            "Prematuros o bebés de bajo peso",
            "Retraso en hitos (no se sienta, no camina, no habla)",
            "Síndrome de Down u otras condiciones genéticas",
            "Deseo de potenciar el desarrollo en bebés sanos",
        ],
        whyItMatters: [
            "Detecta problemas de neurodesarrollo muy temprano",
            "Maximiza el potencial cerebral del niño",
            "Apoya a los padres con pautas de crianza y juego",
            "Mejora el pronóstico en niños con discapacidad",
        ],
        treatments: [
            "Sesiones de estimulación motora y cognitiva",
            "Masaje infantil",
            "Integración sensorial",
            "Terapia de neurodesarrollo (Bobath, Vojta)",
            "Asesoría a padres",
        ],
        relatedSpecialties: ["pediatria", "neurologia-pediatrica", "fisioterapia"],
    },

    // ============================================
    // ACUPUNTURA
    // ============================================
    "acupuntura": {
        title: "Acupuntura",
        description: "Medicina milenaria. Agujas finas para aliviar dolor, estrés y restaurar el equilibrio.",
        whatIsIt: "Técnica de la Medicina Tradicional China aceptada por la OMS. Consiste en insertar agujas muy finas en puntos específicos del cuerpo para liberar analgésicos naturales y regular funciones corporales.",
        whenToGo: [
            "Dolor crónico (espalda, fibromialgia, artritis)",
            "Migrañas y cefaleas",
            "Ansiedad, insomnio y estrés",
            "Náuseas por quimioterapia",
            "Problemas de fertilidad (coadyuvante)",
        ],
        whyItMatters: [
            "Alivio del dolor sin efectos secundarios químicos",
            "Complemento seguro para tratamientos médicos convencionales",
            "Mejora la calidad de vida en enfermedades crónicas",
            "Reduce el estrés y mejora el sueño",
        ],
        treatments: [
            "Acupuntura corporal",
            "Auriculoterapia (puntos en la oreja)",
            "Electroacupuntura",
            "Moxibustión (calor en puntos)",
            "Ventosas (Cupping)",
        ],
        relatedSpecialties: ["medicina-del-dolor", "fisioterapia", "medicina-integrativa"],
    },

    // ============================================
    // HOMEOPATÍA
    // ============================================
    "homeopatia": {
        title: "Homeopatía",
        description: "Medicina integrativa. Tratamientos naturales enfocados en la persona completa.",
        whatIsIt: "Sistema médico que busca estimular la capacidad curativa natural del cuerpo. Usa sustancias altamente diluidas para tratar al paciente de forma holística, considerando síntomas físicos, emocionales y mentales.",
        whenToGo: [
            "Alergias crónicas y problemas respiratorios recurrentes",
            "Problemas de piel (dermatitis, verrugas)",
            "Ansiedad, trastornos del sueño o estrés",
            "Trastornos digestivos funcionales (colon irritable)",
            "Pacientes que buscan alternativas más naturales",
        ],
        whyItMatters: [
            "Enfoque en la prevención y el terreno del paciente",
            "Tratamientos con mínimos efectos secundarios",
            "Considera la parte emocional como clave de la enfermedad",
            "Opción para pacientes sensibles a fármacos convencionales",
        ],
        treatments: [
            "Consulta médica homeopática integral",
            "Prescripción de medicamentos homeopáticos",
            "Biopuntura",
            "Medicina biorreguladora",
        ],
        relatedSpecialties: ["medicina-general", "medicina-integrativa", "pediatria"],
    },
};

/**

     * Obtiene el contenido de una especialidad por su slug normalizado.
     *
     * @param slug - Slug de la especialidad (sin tildes, en minúsculas, con guiones)
     * @returns El contenido de la especialidad o null si no existe
     *
     * @example
     * const content = getSpecialtyContent('cardiologia');
     * // { title: 'Cardiología', description: '...', ... }
     */
export function getSpecialtyContent(slug: string): SpecialtyContent | null {
    return SPECIALTY_CONTENT[slug] || null;
}

/**
 * Obtiene todas las especialidades que tienen contenido educativo disponible.
 *
 * @returns Array de slugs de especialidades con contenido
 */
export function getAvailableSpecialtySlugs(): string[] {
    return Object.keys(SPECIALTY_CONTENT);
}
