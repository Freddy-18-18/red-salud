export interface SpecialtyContent {
  description: string
  whenToVisit: string[]
  benefits: string[]
  facts: string[]
  relatedSlugs: string[]
}

export const SPECIALTY_CONTENT: Record<string, SpecialtyContent> = {
  cardiologia: {
    description:
      'La cardiologia es la rama de la medicina que se encarga del estudio, diagnostico y tratamiento de las enfermedades del corazon y del sistema circulatorio. Los cardiologos son medicos especializados en evaluar la funcion cardiaca, detectar anomalias y prevenir eventos cardiovasculares graves.',
    whenToVisit: [
      'Dolor o presion en el pecho que se irradia al brazo o mandibula',
      'Palpitaciones o latidos irregulares frecuentes',
      'Dificultad para respirar al realizar actividad fisica moderada',
      'Presion arterial elevada de forma constante',
      'Antecedentes familiares de enfermedades cardiacas',
      'Hinchazón en piernas, tobillos o pies sin causa aparente',
    ],
    benefits: [
      'Deteccion temprana de enfermedades cardiovasculares que salva vidas',
      'Control efectivo de la hipertension y el colesterol',
      'Prevencion de infartos y accidentes cerebrovasculares',
      'Mejora de la calidad de vida con planes de tratamiento personalizados',
    ],
    facts: [
      'Las enfermedades cardiovasculares son la primera causa de muerte en el mundo, superando al cancer y las enfermedades respiratorias.',
      'El corazon late aproximadamente 100.000 veces al dia, bombeando cerca de 7.500 litros de sangre.',
      'Caminar 30 minutos diarios puede reducir hasta un 35% el riesgo de enfermedad cardiaca.',
    ],
    relatedSlugs: ['medicina-interna', 'neumologia', 'endocrinologia', 'nefrologia'],
  },

  neurologia: {
    description:
      'La neurologia es la especialidad medica dedicada al estudio y tratamiento de los trastornos del sistema nervioso, incluyendo el cerebro, la medula espinal y los nervios perifericos. Abarca desde dolores de cabeza cronicos hasta enfermedades neurodegenerativas complejas.',
    whenToVisit: [
      'Dolores de cabeza frecuentes o migranas severas',
      'Mareos, vertigo o perdida del equilibrio recurrentes',
      'Hormigueo, entumecimiento o debilidad en extremidades',
      'Problemas de memoria o dificultad para concentrarse',
      'Convulsiones o episodios de perdida de conciencia',
      'Trastornos del sueno como insomnio cronico',
    ],
    benefits: [
      'Diagnostico preciso de condiciones neurologicas complejas',
      'Tratamientos que mejoran significativamente la calidad de vida',
      'Prevencion del deterioro cognitivo y enfermedades neurodegenerativas',
      'Manejo integral de dolor cronico de origen neurologico',
    ],
    facts: [
      'El cerebro humano contiene aproximadamente 86 mil millones de neuronas, cada una conectada con miles de otras.',
      'El cerebro consume el 20% de la energia del cuerpo a pesar de representar solo el 2% del peso corporal.',
      'Los avances en neuroimagen permiten hoy detectar enfermedades neurologicas años antes de que aparezcan sintomas.',
    ],
    relatedSlugs: ['psiquiatria', 'neurocirugia', 'medicina-interna', 'rehabilitacion'],
  },

  dermatologia: {
    description:
      'La dermatologia es la especialidad que se ocupa del diagnostico y tratamiento de enfermedades de la piel, el cabello y las unas. Los dermatologos tratan desde condiciones esteticas hasta enfermedades cronicas como psoriasis, eczema y cancer de piel.',
    whenToVisit: [
      'Lunares que cambian de forma, color o tamano',
      'Acne severo o persistente que no responde a tratamientos caseros',
      'Erupciones cutaneas, enrojecimiento o descamacion cronica',
      'Caida excesiva del cabello o cambios en las uñas',
      'Manchas en la piel nuevas o que crecen rapidamente',
      'Picazon intensa o cronica sin causa aparente',
    ],
    benefits: [
      'Deteccion temprana de cancer de piel con altas tasas de curacion',
      'Tratamientos efectivos para mejorar la salud y apariencia de la piel',
      'Control de enfermedades cronicas como psoriasis y dermatitis',
      'Prevencion del envejecimiento prematuro de la piel',
    ],
    facts: [
      'La piel es el organo mas grande del cuerpo humano, cubriendo aproximadamente 2 metros cuadrados en un adulto.',
      'Cada 28 dias la piel se renueva por completo, reemplazando todas sus celulas superficiales.',
      'El melanoma detectado en estadios tempranos tiene una tasa de supervivencia superior al 99%.',
    ],
    relatedSlugs: ['alergologia', 'cirugia-plastica', 'medicina-interna', 'reumatologia'],
  },

  ginecologia: {
    description:
      'La ginecologia es la especialidad medica enfocada en la salud del sistema reproductor femenino. Abarca desde la atencion preventiva y el control del embarazo hasta el diagnostico y tratamiento de condiciones como endometriosis, miomas y trastornos hormonales.',
    whenToVisit: [
      'Menstruaciones irregulares, muy abundantes o muy dolorosas',
      'Control anual preventivo y citologia (papanicolaou)',
      'Planificacion familiar y asesoria sobre metodos anticonceptivos',
      'Sintomas de menopausia como sofocos o cambios de animo',
      'Dolor pelvico persistente o molestias durante las relaciones',
      'Embarazo o sospecha de embarazo para control prenatal',
    ],
    benefits: [
      'Deteccion precoz de cancer cervicouterino y de mama',
      'Acompanamiento integral durante el embarazo y postparto',
      'Manejo efectivo de trastornos hormonales y menopausia',
      'Prevencion y tratamiento de infecciones del tracto reproductivo',
    ],
    facts: [
      'La citologia cervical ha reducido la mortalidad por cancer cervicouterino en mas del 70% desde su implementacion.',
      'El utero puede expandirse hasta 500 veces su tamaño durante el embarazo.',
      'Las mujeres nacen con todos los ovulos que tendran en su vida: aproximadamente 1 a 2 millones.',
    ],
    relatedSlugs: ['obstetricia', 'endocrinologia', 'urologia', 'oncologia'],
  },

  pediatria: {
    description:
      'La pediatria es la rama de la medicina dedicada al cuidado integral de la salud de bebes, ninos y adolescentes. Los pediatras acompanan el crecimiento y desarrollo desde el nacimiento hasta la adolescencia, atendiendo enfermedades, vacunacion y nutricion infantil.',
    whenToVisit: [
      'Control de nino sano y seguimiento del crecimiento',
      'Fiebre alta, tos persistente o dificultad para respirar',
      'Esquema de vacunacion y refuerzos',
      'Problemas de alimentacion, peso o desarrollo',
      'Erupciones, alergias o infecciones frecuentes',
      'Cambios de comportamiento, problemas de sueno o aprendizaje',
    ],
    benefits: [
      'Seguimiento continuo del crecimiento y desarrollo saludable',
      'Prevencion de enfermedades mediante vacunacion oportuna',
      'Deteccion temprana de trastornos del desarrollo y aprendizaje',
      'Orientacion a padres sobre nutricion, habitos y crianza saludable',
    ],
    facts: [
      'Los ninos menores de 5 anos pueden tener entre 6 y 8 resfriados al ano, lo cual es considerado normal.',
      'El cerebro de un bebe duplica su tamaño durante el primer año de vida.',
      'La vacunacion infantil previene aproximadamente 3 millones de muertes al ano en el mundo.',
    ],
    relatedSlugs: ['neonatologia', 'alergologia', 'neurologia', 'otorrinolaringologia'],
  },

  oftalmologia: {
    description:
      'La oftalmologia es la especialidad encargada del diagnostico y tratamiento de enfermedades de los ojos y la vision. Los oftalmologos manejan desde problemas refractivos comunes como miopia y astigmatismo hasta condiciones graves como glaucoma, cataratas y degeneracion macular.',
    whenToVisit: [
      'Vision borrosa, doble o dificultad para enfocar',
      'Dolor ocular, enrojecimiento o secrecion persistente',
      'Perdida subita de vision o destellos de luz',
      'Revision anual de la vista, especialmente despues de los 40 anos',
      'Sequedad ocular cronica o lagrimeo excesivo',
      'Antecedentes familiares de glaucoma o enfermedades oculares',
    ],
    benefits: [
      'Correccion efectiva de problemas de vision con lentes o cirugia',
      'Deteccion temprana de glaucoma y cataratas antes de que afecten la vision',
      'Prevencion de ceguera con tratamientos oportunos',
      'Evaluacion completa de la salud ocular mas alla de la agudeza visual',
    ],
    facts: [
      'El ojo humano puede distinguir aproximadamente 10 millones de colores diferentes.',
      'El 80% de los problemas de vision son prevenibles o tratables si se detectan a tiempo.',
      'El parpadeo dura entre 100 y 150 milisegundos, y parpadeamos unas 15.000 veces al dia.',
    ],
    relatedSlugs: ['neurologia', 'endocrinologia', 'medicina-interna', 'pediatria'],
  },

  traumatologia: {
    description:
      'La traumatologia y ortopedia es la especialidad dedicada al diagnostico y tratamiento de lesiones y enfermedades del sistema musculoesqueletico: huesos, articulaciones, ligamentos, tendones y musculos. Abarca desde fracturas y esguinces hasta condiciones cronicas como artritis y escoliosis.',
    whenToVisit: [
      'Dolor articular persistente en rodillas, hombros o cadera',
      'Fractura, esguince o lesion deportiva',
      'Dolor de espalda o cuello que limita las actividades diarias',
      'Dificultad para caminar, subir escaleras o moverse',
      'Deformidades oseas o articulares progresivas',
      'Recuperacion post-quirurgica ortopedica',
    ],
    benefits: [
      'Recuperacion funcional completa tras lesiones y fracturas',
      'Alivio del dolor articular cronico con tratamientos modernos',
      'Prevencion de complicaciones por lesiones no tratadas',
      'Mejora de la movilidad y calidad de vida en pacientes con artritis',
    ],
    facts: [
      'El cuerpo humano adulto tiene 206 huesos, pero un recien nacido tiene aproximadamente 270 que se fusionan con el tiempo.',
      'Los huesos son mas fuertes que el concreto en relacion peso-resistencia.',
      'El 50% de los huesos del cuerpo se encuentran en las manos y los pies.',
    ],
    relatedSlugs: ['reumatologia', 'medicina-deportiva', 'rehabilitacion', 'neurocirugia'],
  },

  'medicina-general': {
    description:
      'La medicina general es la puerta de entrada al sistema de salud. Los medicos generales ofrecen atencion integral, diagnosticando y tratando una amplia variedad de enfermedades comunes, realizando chequeos preventivos y coordinando la referencia a especialistas cuando es necesario.',
    whenToVisit: [
      'Chequeo medico anual o control de rutina',
      'Resfriados, gripes, fiebre o malestar general',
      'Dolores de cabeza, estomago o musculares persistentes',
      'Control de enfermedades cronicas como diabetes o hipertension',
      'Necesidad de examenes de laboratorio o referencia a especialistas',
      'Certificados medicos o evaluaciones de salud ocupacional',
    ],
    benefits: [
      'Atencion rapida y accesible para una amplia gama de condiciones',
      'Prevencion de enfermedades mediante chequeos regulares',
      'Coordinacion integral entre diferentes especialidades medicas',
      'Seguimiento continuo de tu salud y condiciones cronicas',
    ],
    facts: [
      'Los chequeos medicos regulares pueden detectar hasta el 90% de las enfermedades en etapas tempranas y tratables.',
      'Un medico general atiende en promedio entre 20 y 30 condiciones diferentes cada dia.',
      'La relacion continua con un medico de cabecera reduce las hospitalizaciones en un 33%.',
    ],
    relatedSlugs: ['medicina-interna', 'pediatria', 'geriatria', 'medicina-familiar'],
  },

  psiquiatria: {
    description:
      'La psiquiatria es la especialidad medica dedicada al diagnostico, prevencion y tratamiento de los trastornos mentales, emocionales y del comportamiento. Los psiquiatras son medicos que pueden prescribir medicamentos y ofrecer terapias integradas para condiciones como depresion, ansiedad y trastorno bipolar.',
    whenToVisit: [
      'Tristeza profunda o perdida de interes que dura mas de dos semanas',
      'Ansiedad intensa que interfiere con la vida diaria o el trabajo',
      'Cambios drasticos de humor, energia o patron de sueno',
      'Pensamientos intrusivos, obsesivos o de autolesion',
      'Problemas de concentracion, memoria o toma de decisiones',
      'Uso problemático de sustancias o adicciones',
    ],
    benefits: [
      'Tratamiento integral que combina medicacion y terapia',
      'Manejo profesional de crisis emocionales y trastornos severos',
      'Mejora significativa en la calidad de vida y relaciones personales',
      'Prevencion de recaidas con seguimiento medico continuo',
    ],
    facts: [
      'Una de cada cuatro personas experimentara algun tipo de trastorno mental a lo largo de su vida.',
      'La depresion es la principal causa de discapacidad en el mundo segun la OMS.',
      'Los tratamientos psiquiatricos modernos tienen tasas de efectividad superiores al 70% para la mayoria de trastornos.',
    ],
    relatedSlugs: ['neurologia', 'psicologia', 'medicina-interna', 'endocrinologia'],
  },

  urologia: {
    description:
      'La urologia es la especialidad que se encarga del diagnostico y tratamiento de enfermedades del sistema urinario en hombres y mujeres, y del sistema reproductor masculino. Los urologos tratan condiciones como calculos renales, infecciones urinarias, problemas de prostata y disfuncion sexual.',
    whenToVisit: [
      'Dolor o ardor al orinar',
      'Sangre en la orina o cambios en su color',
      'Dificultad para orinar o necesidad de orinar con mucha frecuencia',
      'Dolor en la zona lumbar, flancos o region pelvica',
      'Problemas de prostata como dificultad para iniciar la miccion',
      'Disfuncion sexual o problemas de fertilidad masculina',
    ],
    benefits: [
      'Tratamiento efectivo de calculos renales con tecnicas minimamente invasivas',
      'Deteccion temprana de cancer de prostata y vias urinarias',
      'Manejo integral de incontinencia urinaria en ambos sexos',
      'Mejora de la calidad de vida sexual y reproductiva',
    ],
    facts: [
      'Los rinones filtran aproximadamente 180 litros de sangre al dia, produciendo entre 1 y 2 litros de orina.',
      'El cancer de prostata es el cancer mas comun en hombres, pero detectado a tiempo tiene una tasa de supervivencia del 98%.',
      'Los calculos renales han aumentado un 70% en las ultimas tres decadas debido a cambios en la dieta.',
    ],
    relatedSlugs: ['nefrologia', 'ginecologia', 'oncologia', 'medicina-interna'],
  },

  endocrinologia: {
    description:
      'La endocrinologia es la especialidad medica enfocada en el sistema endocrino, que incluye glandulas como la tiroides, las suprarrenales, la hipofisis y el pancreas. Los endocrinologos diagnostican y tratan trastornos hormonales, diabetes, problemas de tiroides y alteraciones del metabolismo.',
    whenToVisit: [
      'Diabetes diagnosticada o glucosa en sangre elevada',
      'Problemas de tiroides: cansancio extremo, cambios de peso o temperatura',
      'Aumento o perdida de peso inexplicable',
      'Irregularidades menstruales de origen hormonal',
      'Osteoporosis o problemas de densidad osea',
      'Exceso de vello corporal, acne hormonal o caida del cabello',
    ],
    benefits: [
      'Control optimo de diabetes y prevencion de complicaciones graves',
      'Regulacion de la funcion tiroidea para mejorar energia y bienestar',
      'Manejo integral de desequilibrios hormonales',
      'Prevencion de osteoporosis y enfermedades metabolicas',
    ],
    facts: [
      'El sistema endocrino produce mas de 50 hormonas diferentes que regulan practicamente todas las funciones del cuerpo.',
      'La diabetes afecta a mas de 460 millones de personas en el mundo y su incidencia se ha duplicado en los ultimos 20 anos.',
      'La tiroides, a pesar de pesar solo 20 gramos, controla el metabolismo de todo el cuerpo.',
    ],
    relatedSlugs: ['medicina-interna', 'ginecologia', 'cardiologia', 'nefrologia'],
  },

  gastroenterologia: {
    description:
      'La gastroenterologia se dedica al estudio y tratamiento de enfermedades del aparato digestivo, desde el esofago hasta el recto, incluyendo higado, pancreas y vesicula biliar. Los gastroenterologos realizan procedimientos diagnosticos como endoscopias y colonoscopias.',
    whenToVisit: [
      'Dolor abdominal recurrente o cronico',
      'Acidez, reflujo o dificultad para tragar',
      'Cambios en los habitos intestinales (diarrea o estrenimiento persistentes)',
      'Sangrado digestivo o heces con sangre',
      'Nauseas, vomitos o perdida de apetito prolongados',
      'Colonoscopia preventiva a partir de los 45 anos',
    ],
    benefits: [
      'Diagnostico temprano de cancer colorrectal mediante colonoscopia',
      'Tratamiento efectivo de reflujo, ulceras y gastritis cronica',
      'Manejo integral de enfermedades hepaticas y biliares',
      'Mejora de la calidad de vida en sindrome de intestino irritable',
    ],
    facts: [
      'El sistema digestivo tiene una superficie equivalente a la de una cancha de tenis si se extiende por completo.',
      'El intestino contiene mas de 100 billones de bacterias que juegan un papel crucial en la salud general.',
      'La colonoscopia de deteccion reduce el riesgo de muerte por cancer colorrectal en un 68%.',
    ],
    relatedSlugs: ['cirugia-general', 'oncologia', 'nutricion', 'medicina-interna'],
  },

  neumologia: {
    description:
      'La neumologia es la especialidad medica centrada en el diagnostico y tratamiento de enfermedades del sistema respiratorio, incluyendo los pulmones, bronquios y la pleura. Los neumologos manejan condiciones como asma, EPOC, neumonia, apnea del sueno y fibrosis pulmonar.',
    whenToVisit: [
      'Tos persistente por mas de tres semanas',
      'Dificultad para respirar o sensacion de falta de aire',
      'Silbidos o pitidos al respirar (sibilancias)',
      'Ronquidos fuertes o somnolencia diurna excesiva',
      'Infecciones respiratorias frecuentes o neumonias a repeticion',
      'Dolor en el pecho al respirar profundamente',
    ],
    benefits: [
      'Control efectivo del asma y prevencion de crisis respiratorias',
      'Diagnostico y tratamiento de apnea del sueno para mejor descanso',
      'Detencion del avance de enfermedades pulmonares cronicas',
      'Evaluacion pulmonar completa con pruebas funcionales especializadas',
    ],
    facts: [
      'Los pulmones procesan aproximadamente 11.000 litros de aire al dia.',
      'Si se extendieran todos los alveolos pulmonares, cubririan un area de 70 metros cuadrados.',
      'El asma afecta a mas de 300 millones de personas en el mundo, pero con tratamiento adecuado se controla en el 95% de los casos.',
    ],
    relatedSlugs: ['alergologia', 'medicina-interna', 'cardiologia', 'otorrinolaringologia'],
  },

  nefrologia: {
    description:
      'La nefrologia es la especialidad dedicada al estudio de los rinones y sus enfermedades. Los nefrologos diagnostican y tratan condiciones como insuficiencia renal, hipertension de origen renal, infecciones renales cronicas y supervisan tratamientos de dialisis y preparacion para trasplante renal.',
    whenToVisit: [
      'Hinchazon en manos, pies o cara de forma inexplicable',
      'Orina espumosa, oscura o con sangre',
      'Presion arterial alta que no responde al tratamiento habitual',
      'Dolor lumbar persistente unilateral',
      'Infecciones urinarias recurrentes',
      'Antecedentes de diabetes o hipertension que afecten la funcion renal',
    ],
    benefits: [
      'Prevencion del deterioro renal cronico con deteccion temprana',
      'Manejo especializado de dialisis y preparacion para trasplante',
      'Control de la hipertension de origen renal',
      'Seguimiento integral de la funcion renal en pacientes diabeticos',
    ],
    facts: [
      'Cada rinon contiene aproximadamente un millon de nefronas, las unidades funcionales de filtracion.',
      'La enfermedad renal cronica afecta al 10% de la poblacion mundial y la mayoria no lo sabe.',
      'Una persona puede vivir con un solo rinon funcional sin mayores problemas de salud.',
    ],
    relatedSlugs: ['urologia', 'medicina-interna', 'cardiologia', 'endocrinologia'],
  },

  reumatologia: {
    description:
      'La reumatologia es la especialidad medica que se ocupa del diagnostico y tratamiento de enfermedades autoinmunes y del aparato locomotor, incluyendo articulaciones, huesos, musculos y tejidos conectivos. Los reumatologos tratan condiciones como artritis reumatoide, lupus, fibromialgia y gota.',
    whenToVisit: [
      'Dolor articular en multiples articulaciones que dura mas de 6 semanas',
      'Rigidez matutina que dura mas de 30 minutos',
      'Hinchazon articular sin lesion previa',
      'Dolor muscular generalizado y fatiga cronica',
      'Sequedad severa en ojos y boca',
      'Erupciones cutaneas junto con dolor articular',
    ],
    benefits: [
      'Diagnostico diferencial preciso entre multiples enfermedades reumaticas',
      'Tratamientos biologicos modernos que frenan el avance de la enfermedad',
      'Prevencion del dano articular irreversible con deteccion temprana',
      'Mejora de la funcionalidad y reduccion del dolor cronico',
    ],
    facts: [
      'Existen mas de 100 tipos diferentes de enfermedades reumaticas.',
      'La artritis reumatoide puede afectar a personas de cualquier edad, incluso ninos.',
      'Los tratamientos biologicos modernos han logrado la remision completa en hasta el 50% de pacientes con artritis reumatoide.',
    ],
    relatedSlugs: ['traumatologia', 'dermatologia', 'medicina-interna', 'nefrologia'],
  },

  otorrinolaringologia: {
    description:
      'La otorrinolaringologia (ORL) es la especialidad medica que trata las enfermedades del oido, la nariz, la garganta y estructuras relacionadas de la cabeza y el cuello. Los otorrinolaringologos manejan desde sinusitis y otitis hasta perdida auditiva, vertigo y tumores de cabeza y cuello.',
    whenToVisit: [
      'Dolor de oido persistente, zumbidos o perdida de audicion',
      'Congestion nasal cronica o sinusitis recurrente',
      'Dolor de garganta que no mejora o dificultad para tragar',
      'Ronquidos severos o episodios de apnea al dormir',
      'Mareos o vertigo recurrente',
      'Sangrado nasal frecuente o cambios en la voz',
    ],
    benefits: [
      'Restauracion de la audicion con tratamientos y dispositivos modernos',
      'Solucion definitiva para problemas respiratorios nasales cronicos',
      'Tratamiento de vertigo que mejora drasticamente la calidad de vida',
      'Diagnostico temprano de tumores de cabeza y cuello',
    ],
    facts: [
      'El oido interno contiene el organo mas pequeno del cuerpo humano: el estribo, que mide apenas 3 milimetros.',
      'El olfato humano puede distinguir mas de 1 billon de olores diferentes.',
      'Las cuerdas vocales vibran entre 100 y 1.000 veces por segundo al hablar.',
    ],
    relatedSlugs: ['alergologia', 'neumologia', 'neurologia', 'pediatria'],
  },
}

/**
 * Returns content for a specialty slug.
 * If the slug is not in the content map, returns generic content.
 */
export function getSpecialtyContent(
  slug: string,
  specialtyName: string,
): SpecialtyContent {
  const content = SPECIALTY_CONTENT[slug]
  if (content) return content

  return {
    description: `${specialtyName} es una especialidad medica dedicada al diagnostico, tratamiento y prevencion de enfermedades en su area de competencia. Los especialistas en ${specialtyName.toLowerCase()} cuentan con formacion avanzada y experiencia clinica para ofrecer la mejor atencion a sus pacientes.`,
    whenToVisit: [
      'Sintomas persistentes que no mejoran con tratamiento general',
      'Referencia de tu medico de cabecera para evaluacion especializada',
      'Control y seguimiento de una condicion ya diagnosticada',
      'Segunda opinion sobre un diagnostico o tratamiento',
      'Evaluacion preventiva si tienes factores de riesgo',
    ],
    benefits: [
      'Atencion especializada con conocimiento profundo del area',
      'Acceso a tecnologia diagnostica y terapeutica avanzada',
      'Tratamientos basados en la evidencia cientifica mas reciente',
      'Seguimiento personalizado de tu condicion de salud',
    ],
    facts: [
      'La especializacion medica permite a los profesionales mantenerse actualizados en los ultimos avances de su area.',
      'La deteccion temprana y la atencion especializada mejoran significativamente los resultados de salud.',
    ],
    relatedSlugs: ['medicina-general', 'medicina-interna'],
  }
}
