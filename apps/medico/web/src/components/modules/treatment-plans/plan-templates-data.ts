// ============================================================================
// TREATMENT PLAN TEMPLATES PER SPECIALTY
// Pre-built templates that doctors can use as starting points for treatment plans.
// ============================================================================

export interface PlanTemplatePhase {
  title: string;
  items: string[];
}

export interface PlanTemplate {
  name: string;
  description?: string;
  phases: PlanTemplatePhase[];
}

export const TREATMENT_PLAN_TEMPLATES: Record<string, PlanTemplate[]> = {
  // ── Odontologia ────────────────────────────────────────────────────────
  odontologia: [
    {
      name: 'Rehabilitacion Oral Completa',
      description: 'Plan integral para pacientes con compromiso dental multiple',
      phases: [
        {
          title: 'Fase Higienica',
          items: [
            'Profilaxis dental',
            'Raspado y alisado radicular',
            'Instruccion de higiene oral',
            'Aplicacion de fluor',
          ],
        },
        {
          title: 'Fase Correctiva',
          items: [
            'Operatoria dental (resinas/amalgamas)',
            'Endodoncias necesarias',
            'Extracciones indicadas',
            'Cirugias periodontales',
          ],
        },
        {
          title: 'Fase Rehabilitadora',
          items: [
            'Protesis fija (coronas/puentes)',
            'Protesis removible',
            'Implantes dentales',
            'Ajuste oclusal',
          ],
        },
        {
          title: 'Fase de Mantenimiento',
          items: [
            'Control cada 3 meses',
            'Profilaxis semestral',
            'Radiografias de control anual',
          ],
        },
      ],
    },
    {
      name: 'Tratamiento de Periodoncia',
      description: 'Manejo de enfermedad periodontal de leve a severa',
      phases: [
        {
          title: 'Fase I - Terapia Basica',
          items: [
            'Tartrectomia supragingival',
            'Raspado y alisado radicular por cuadrante',
            'Instruccion de tecnica de cepillado',
            'Uso de clorhexidina 0.12%',
          ],
        },
        {
          title: 'Fase II - Reevaluacion',
          items: [
            'Sondaje periodontal de control',
            'Radiografias periapicales',
            'Evaluacion de respuesta al tratamiento',
          ],
        },
        {
          title: 'Fase III - Correctiva',
          items: [
            'Cirugias periodontales (colgajos)',
            'Regeneracion osea guiada',
            'Injertos de tejido blando',
          ],
        },
        {
          title: 'Fase IV - Mantenimiento',
          items: [
            'Profilaxis cada 3-4 meses',
            'Sondaje periodontal semestral',
            'Refuerzo de higiene oral',
          ],
        },
      ],
    },
    {
      name: 'Plan de Ortodoncia',
      description: 'Correccion de maloclusion con aparatologia fija o removible',
      phases: [
        {
          title: 'Fase Diagnostica',
          items: [
            'Modelos de estudio',
            'Radiografia panoramica y cefalometrica',
            'Analisis cefalometrico',
            'Fotografias intra y extraorales',
          ],
        },
        {
          title: 'Fase de Alineacion',
          items: [
            'Colocacion de brackets/alineadores',
            'Arcos iniciales de alineacion',
            'Controles mensuales de activacion',
          ],
        },
        {
          title: 'Fase de Correccion',
          items: [
            'Cierre de espacios',
            'Correccion de relacion molar',
            'Elasticos intermaxilares',
            'Arcos de trabajo rectangular',
          ],
        },
        {
          title: 'Fase de Retencion',
          items: [
            'Retiro de aparatologia',
            'Retenedores fijos linguales',
            'Retenedores removibles',
            'Controles trimestrales por 2 anos',
          ],
        },
      ],
    },
  ],

  // ── Traumatologia ──────────────────────────────────────────────────────
  traumatologia: [
    {
      name: 'Rehabilitacion Post-Quirurgica de Rodilla',
      description: 'Protocolo post-cirugia de LCA o menisco',
      phases: [
        {
          title: 'Fase I - Proteccion (0-2 semanas)',
          items: [
            'Inmovilizacion con ferula',
            'Crioterapia 3-4 veces/dia',
            'Ejercicios isometricos de cuadriceps',
            'Elevacion del miembro',
            'Analgesicos y antiinflamatorios',
          ],
        },
        {
          title: 'Fase II - Movilidad (2-6 semanas)',
          items: [
            'Inicio de arco de movimiento pasivo',
            'Carga parcial progresiva con muletas',
            'Fortalecimiento isometrico',
            'Fisioterapia 3 veces/semana',
          ],
        },
        {
          title: 'Fase III - Fortalecimiento (6-12 semanas)',
          items: [
            'Carga total sin muletas',
            'Ejercicios en cadena cinetica cerrada',
            'Bicicleta estacionaria',
            'Propiocepcion en superficie estable',
          ],
        },
        {
          title: 'Fase IV - Retorno funcional (3-6 meses)',
          items: [
            'Trote progresivo',
            'Ejercicios pliometricos',
            'Entrenamiento deportivo especifico',
            'Evaluacion isocinEtica de alta',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Fractura',
      description: 'Protocolo estandar para fracturas de miembros',
      phases: [
        {
          title: 'Fase Aguda',
          items: [
            'Reduccion cerrada/abierta segun tipo',
            'Inmovilizacion (yeso/feruLA/ORIF)',
            'Control radiologico post-reduccion',
            'Manejo del dolor',
            'Profilaxis tromboembolica si corresponde',
          ],
        },
        {
          title: 'Fase de Consolidacion',
          items: [
            'Control radiologico cada 2-4 semanas',
            'Ejercicios de articulaciones libres',
            'Estimulacion muscular isometrica',
            'Evaluacion de callo oseo',
          ],
        },
        {
          title: 'Fase de Rehabilitacion',
          items: [
            'Retiro de inmovilizacion',
            'Fisioterapia de movilidad articular',
            'Fortalecimiento muscular progresivo',
            'Reintegracion a actividades',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Lumbalgia Cronica',
      description: 'Tratamiento conservador de dolor lumbar persistente',
      phases: [
        {
          title: 'Fase Aguda (1-2 semanas)',
          items: [
            'Reposo relativo',
            'AINES y relajantes musculares',
            'Crioterapia/termoterapia',
            'Educacion postural',
          ],
        },
        {
          title: 'Fase Subaguda (2-6 semanas)',
          items: [
            'Fisioterapia (TENS, ultrasonido)',
            'Ejercicios de Williams/McKenzie',
            'Estiramiento de cadena posterior',
            'Fortalecimiento de core',
          ],
        },
        {
          title: 'Fase de Mantenimiento',
          items: [
            'Programa de ejercicio en casa',
            'Ergonomia laboral',
            'Control trimestral',
            'Reevaluacion si recurrencia',
          ],
        },
      ],
    },
  ],

  // ── Cardiologia ────────────────────────────────────────────────────────
  cardiologia: [
    {
      name: 'Rehabilitacion Cardiaca',
      description: 'Post-evento coronario agudo o cirugia cardiaca',
      phases: [
        {
          title: 'Fase I - Hospitalaria',
          items: [
            'Movilizacion precoz en cama',
            'Deambulacion asistida',
            'Educacion al paciente y familia',
            'Evaluacion de riesgo cardiovascular',
          ],
        },
        {
          title: 'Fase II - Ambulatoria supervisada (4-12 semanas)',
          items: [
            'Ejercicio aerobico supervisado con telemetria',
            'Fortalecimiento muscular progresivo',
            'Educacion sobre factores de riesgo',
            'Soporte psicologico',
            'Ajuste farmacologico',
          ],
        },
        {
          title: 'Fase III - Mantenimiento',
          items: [
            'Programa de ejercicio independiente',
            'Control de factores de riesgo',
            'Dieta cardiosaludable',
            'Control cardiologico trimestral',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Insuficiencia Cardiaca',
      description: 'Plan a largo plazo para IC cronica sistolica',
      phases: [
        {
          title: 'Fase de Optimizacion Farmacologica',
          items: [
            'Titulacion de IECA/ARA II o ARNI',
            'Betabloqueante (carvedilol/bisoprolol/metoprolol)',
            'Antagonista de aldosterona',
            'Diureticos segun congestion',
            'Inhibidor de SGLT2',
          ],
        },
        {
          title: 'Fase de Educacion y Autocuidado',
          items: [
            'Restriccion hidrica (1.5-2L/dia)',
            'Dieta hiposodica',
            'Control de peso diario',
            'Reconocimiento de signos de alarma',
            'Vacunacion (influenza y neumococo)',
          ],
        },
        {
          title: 'Fase de Seguimiento',
          items: [
            'Ecocardiograma de control cada 6-12 meses',
            'BNP/NT-proBNP seriados',
            'Funcion renal y electrolitos mensuales',
            'Evaluacion para dispositivos (DAI/TRC) si aplica',
          ],
        },
      ],
    },
    {
      name: 'Prevencion Cardiovascular Primaria',
      description: 'Para pacientes con factores de riesgo sin evento previo',
      phases: [
        {
          title: 'Evaluacion Inicial',
          items: [
            'Calculo de riesgo cardiovascular (Framingham/ASCVD)',
            'Perfil lipidico completo',
            'Hemoglobina glicosilada',
            'ECG de reposo',
            'Indice tobillo-brazo si > 50 anos',
          ],
        },
        {
          title: 'Modificacion de Estilo de Vida',
          items: [
            'Plan de actividad fisica (150 min/semana)',
            'Dieta mediterranea o DASH',
            'Cesacion tabaquica',
            'Control de peso (meta IMC < 25)',
            'Manejo del estres',
          ],
        },
        {
          title: 'Control Farmacologico y Seguimiento',
          items: [
            'Estatinas segun riesgo',
            'Antihipertensivos si PA > 140/90',
            'Antidiabeticos si aplica',
            'Control semestral de perfil metabolico',
          ],
        },
      ],
    },
  ],

  // ── Oncologia ──────────────────────────────────────────────────────────
  oncologia: [
    {
      name: 'Plan Neoadyuvante + Cirugia',
      description: 'Quimioterapia preoperatoria seguida de cirugia oncologica',
      phases: [
        {
          title: 'Evaluacion Pre-tratamiento',
          items: [
            'Estadificacion completa (TAC, RMN, PET segun caso)',
            'Biopsia con inmunohistoquimica',
            'Estudios moleculares/genomicos',
            'Evaluacion cardiologica pre-QT',
            'Preservacion de fertilidad si aplica',
          ],
        },
        {
          title: 'Quimioterapia Neoadyuvante',
          items: [
            'Ciclos de QT segun protocolo',
            'Hemograma pre-ciclo',
            'Evaluacion de respuesta por imagenes (cada 2-3 ciclos)',
            'Manejo de efectos adversos',
          ],
        },
        {
          title: 'Fase Quirurgica',
          items: [
            'Cirugia oncologica definitiva',
            'Evaluacion de margenes quirurgicos',
            'Estudio patologico de pieza operatoria',
            'Manejo post-operatorio',
          ],
        },
        {
          title: 'Seguimiento Oncologico',
          items: [
            'Control clinico cada 3 meses primer ano',
            'Marcadores tumorales seriados',
            'Imagenes de control segun protocolo',
            'Tamizaje de segundas neoplasias',
          ],
        },
      ],
    },
    {
      name: 'Quimioterapia + Radioterapia',
      description: 'Tratamiento combinado concomitante o secuencial',
      phases: [
        {
          title: 'Planificacion',
          items: [
            'Simulacion de radioterapia (TAC/RMN de planificacion)',
            'Definicion de volumenes de tratamiento',
            'Esquema de QT concomitante',
            'Consentimiento informado',
          ],
        },
        {
          title: 'Tratamiento Activo',
          items: [
            'Sesiones de radioterapia (diarias, 5-7 semanas)',
            'QT concomitante semanal o cada 3 semanas',
            'Control hematologico semanal',
            'Manejo de toxicidad (mucositis, dermatitis, etc)',
          ],
        },
        {
          title: 'Recuperacion y Seguimiento',
          items: [
            'Evaluacion de respuesta 6-8 semanas post-RT',
            'Rehabilitacion nutricional',
            'Soporte psicologico',
            'Controles trimestrales con imagenes',
          ],
        },
      ],
    },
    {
      name: 'Cuidados Paliativos',
      description: 'Manejo integral del paciente con enfermedad avanzada',
      phases: [
        {
          title: 'Evaluacion Integral',
          items: [
            'Escala de funcionalidad (ECOG/Karnofsky)',
            'Evaluacion del dolor (escala EVA)',
            'Evaluacion nutricional',
            'Evaluacion psicosocial y espiritual',
          ],
        },
        {
          title: 'Control de Sintomas',
          items: [
            'Escalera analgesica de la OMS',
            'Manejo de nauseas/emesis',
            'Control de disnea',
            'Manejo de ansiedad/depresion',
            'Cuidado de heridas si aplica',
          ],
        },
        {
          title: 'Soporte Continuo',
          items: [
            'Reuniones familiares periodicas',
            'Directivas anticipadas',
            'Coordinacion con equipo multidisciplinario',
            'Atencion domiciliaria si corresponde',
          ],
        },
      ],
    },
  ],

  // ── Pediatria ──────────────────────────────────────────────────────────
  pediatria: [
    {
      name: 'Seguimiento del Nino Sano',
      description: 'Control de crecimiento y desarrollo por edades',
      phases: [
        {
          title: 'Recien Nacido - 6 meses',
          items: [
            'Control neonatal a las 48-72h del alta',
            'Consultas mensuales de peso/talla/PC',
            'Vacunacion segun esquema (BCG, Hepatitis B, Pentavalente)',
            'Tamizaje neonatal (hipotiroidismo, PKU)',
            'Evaluacion de lactancia materna',
          ],
        },
        {
          title: '6 meses - 2 anos',
          items: [
            'Controles bimestrales/trimestrales',
            'Inicio de alimentacion complementaria',
            'Evaluacion del desarrollo psicomotor',
            'Vacunacion (triple viral, varicela, hepatitis A)',
            'Suplementacion con hierro y vitamina D',
          ],
        },
        {
          title: '2 - 6 anos (Preescolar)',
          items: [
            'Control semestral',
            'Evaluacion de lenguaje y socializacion',
            'Tamizaje visual y auditivo',
            'Vacunacion de refuerzo',
            'Orientacion sobre habitos alimentarios',
          ],
        },
        {
          title: '6 - 12 anos (Escolar)',
          items: [
            'Control anual',
            'Evaluacion de rendimiento escolar',
            'Tamizaje de escoliosis',
            'Evaluacion nutricional (IMC percentil)',
            'Anticipacion de pubertad',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Asma Pediatrica',
      description: 'Tratamiento escalonado del asma en ninos',
      phases: [
        {
          title: 'Diagnostico y Clasificacion',
          items: [
            'Espirometria (> 6 anos) o respuesta a broncodilatador',
            'Clasificacion de severidad (intermitente/persistente)',
            'Identificacion de desencadenantes',
            'Plan de accion escrito para el paciente/familia',
          ],
        },
        {
          title: 'Tratamiento de Mantenimiento',
          items: [
            'Corticoide inhalado (beclometasona/fluticasona)',
            'LABA si persistente moderada-severa',
            'Tecnica inhalatoria con aerocamara',
            'Control ambiental de alergenos',
          ],
        },
        {
          title: 'Seguimiento y Ajuste',
          items: [
            'Control mensual hasta estabilizar',
            'Evaluacion de control con ACT/C-ACT',
            'Espirometria cada 6-12 meses',
            'Reduccion escalonada si buen control por 3 meses',
            'Vacunacion antigripal anual',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Desnutricion Infantil',
      description: 'Recuperacion nutricional en ninos con deficit ponderal',
      phases: [
        {
          title: 'Evaluacion Inicial',
          items: [
            'Antropometria completa (peso, talla, PC, CB)',
            'Clasificacion (Gomez/Waterlow)',
            'Laboratorios (hemograma, albumina, hierro, zinc)',
            'Evaluacion de parasitosis',
            'Evaluacion sociofamiliar',
          ],
        },
        {
          title: 'Recuperacion Nutricional',
          items: [
            'Plan alimentario hipercalorico',
            'Suplementacion con micronutrientes',
            'Tratamiento antiparasitario',
            'Control semanal de peso',
            'Educacion nutricional a la familia',
          ],
        },
        {
          title: 'Seguimiento a Largo Plazo',
          items: [
            'Controles quincenales hasta meta de peso',
            'Luego mensuales por 6 meses',
            'Evaluacion del desarrollo psicomotor',
            'Apoyo social si necesario',
          ],
        },
      ],
    },
  ],

  // ── Dermatologia ───────────────────────────────────────────────────────
  dermatologia: [
    {
      name: 'Tratamiento de Acne Moderado-Severo',
      description: 'Protocolo escalonado para acne inflamatorio',
      phases: [
        {
          title: 'Fase I - Topico (4-6 semanas)',
          items: [
            'Peroxido de benzoilo 5% (noche)',
            'Retinoide topico (adapaleno/tretinoina)',
            'Antibiotico topico si componente inflamatorio',
            'Limpieza facial con gel no comedogenico',
            'Fotoproteccion SPF 50+',
          ],
        },
        {
          title: 'Fase II - Sistemico (si no responde)',
          items: [
            'Antibiotico oral (doxiciclina/minociclina) por 3 meses',
            'Antiandrogenos en mujeres si corresponde',
            'Evaluacion para isotretinoina si severo/refractario',
            'Laboratorios pre-isotretinoina (hepatico, lipidos, beta-HCG)',
          ],
        },
        {
          title: 'Fase III - Mantenimiento',
          items: [
            'Retinoide topico a largo plazo',
            'Rutina de cuidado facial',
            'Tratamiento de cicatrices (peelings, laser)',
            'Control trimestral',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Psoriasis',
      description: 'Tratamiento secuencial para psoriasis en placas',
      phases: [
        {
          title: 'Psoriasis Leve (< 10% SC)',
          items: [
            'Corticoide topico de potencia media-alta',
            'Analogo de vitamina D (calcipotriol)',
            'Emolientes diarios',
            'Fototerapia UVB de banda estrecha si disponible',
          ],
        },
        {
          title: 'Psoriasis Moderada-Severa',
          items: [
            'Metotrexato oral semanal',
            'Acido folico suplementario',
            'Monitoreo hepatico y hematologico mensual',
            'Evaluar biologicos si refractario (anti-TNF, anti-IL17, anti-IL23)',
          ],
        },
        {
          title: 'Seguimiento',
          items: [
            'PASI/BSA cada 3 meses',
            'Tamizaje de artritis psoriasica',
            'Tamizaje cardiovascular y metabolico',
            'Soporte psicologico',
          ],
        },
      ],
    },
    {
      name: 'Protocolo de Cirugia Dermatologica',
      description: 'Manejo pre y post-operatorio de lesiones cutaneas',
      phases: [
        {
          title: 'Pre-operatorio',
          items: [
            'Biopsia confirmatoria',
            'Mapeo de la lesion',
            'Suspension de anticoagulantes si aplica',
            'Consentimiento informado',
            'Fotografias pre-operatorias',
          ],
        },
        {
          title: 'Procedimiento',
          items: [
            'Exeresis con margenes adecuados',
            'Estudio histopatologico de la pieza',
            'Cierre primario o colgajo/injerto',
            'Curacion y vendaje',
          ],
        },
        {
          title: 'Post-operatorio',
          items: [
            'Cuidado de herida (curaciones cada 48h)',
            'Retiro de puntos (7-14 dias segun zona)',
            'Evaluacion de resultado histopatologico',
            'Fotoproteccion de la cicatriz por 6 meses',
            'Control de cicatrizacion mensual',
          ],
        },
      ],
    },
  ],

  // ── Ginecologia ────────────────────────────────────────────────────────
  ginecologia: [
    {
      name: 'Control Prenatal',
      description: 'Seguimiento del embarazo de bajo riesgo',
      phases: [
        {
          title: 'Primer Trimestre (hasta 14 semanas)',
          items: [
            'Historia clinica completa',
            'Laboratorios: hemograma, glicemia, VDRL, HIV, hepatitis B, urocultivo',
            'Grupo y Rh, Coombs indirecto',
            'Eco transvaginal (confirmacion de EG y vitalidad)',
            'Suplementacion: acido folico 400-800 mcg/dia',
          ],
        },
        {
          title: 'Segundo Trimestre (14-28 semanas)',
          items: [
            'Eco morfologico (18-22 semanas)',
            'PTOG 75g (24-28 semanas)',
            'Hemograma de control',
            'Suplementacion con hierro',
            'Vacuna dTpa (despues de semana 20)',
          ],
        },
        {
          title: 'Tercer Trimestre (28-40 semanas)',
          items: [
            'Control quincenal hasta semana 36, luego semanal',
            'Eco de crecimiento fetal',
            'Monitoreo fetal a partir de semana 36',
            'Estreptococo grupo B (35-37 semanas)',
            'Plan de parto',
          ],
        },
        {
          title: 'Puerperio',
          items: [
            'Control a las 48h post-parto',
            'Control a las 6 semanas (revision completa)',
            'Orientacion sobre lactancia materna',
            'Anticoncepcion post-parto',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Endometriosis',
      description: 'Tratamiento multidisciplinario de endometriosis',
      phases: [
        {
          title: 'Diagnostico',
          items: [
            'Evaluacion clinica y escala de dolor',
            'Eco transvaginal con preparacion intestinal',
            'RMN pelvica si endometriosis profunda',
            'CA-125 (orientativo)',
          ],
        },
        {
          title: 'Tratamiento Medico',
          items: [
            'Anticonceptivos orales continuos',
            'Dienogest 2mg/dia',
            'AINES para manejo del dolor',
            'Evaluacion de fertilidad si deseo gestacional',
          ],
        },
        {
          title: 'Seguimiento',
          items: [
            'Control clinico trimestral',
            'Eco de control semestral',
            'Evaluar cirugia si refractario o endometrioma > 4cm',
            'Soporte psicologico',
          ],
        },
      ],
    },
    {
      name: 'Tamizaje Ginecologico Anual',
      description: 'Evaluacion preventiva integral de la mujer',
      phases: [
        {
          title: 'Evaluacion',
          items: [
            'Citologia cervical (Papanicolaou)',
            'Test de VPH (> 30 anos)',
            'Examen mamario clinico',
            'Mamografia (> 40 anos o segun riesgo)',
            'Eco transvaginal',
          ],
        },
        {
          title: 'Indicaciones',
          items: [
            'Autoexamen mamario mensual',
            'Anticoncepcion segun necesidad',
            'Suplementacion si deficiencias',
            'Densitometria osea si > 50 anos o factores de riesgo',
          ],
        },
      ],
    },
  ],

  // ── Neurologia ─────────────────────────────────────────────────────────
  neurologia: [
    {
      name: 'Manejo de Epilepsia',
      description: 'Tratamiento y seguimiento del paciente epileptico',
      phases: [
        {
          title: 'Diagnostico y Clasificacion',
          items: [
            'EEG estandar y/o video-EEG',
            'RMN cerebral con protocolo de epilepsia',
            'Clasificacion del tipo de crisis (ILAE)',
            'Identificacion de factores precipitantes',
          ],
        },
        {
          title: 'Inicio de Tratamiento',
          items: [
            'Monoterapia con FAE de primera linea',
            'Titulacion gradual hasta dosis efectiva',
            'Laboratorios basales (hepatico, hematologico)',
            'Educacion al paciente sobre adherencia y triggers',
          ],
        },
        {
          title: 'Seguimiento',
          items: [
            'Control mensual hasta estabilizar',
            'Luego trimestral/semestral',
            'Niveles sericos de FAE si corresponde',
            'EEG de control anual',
            'Evaluacion neuropsicologica si deterioro cognitivo',
            'Considerar retiro de FAE tras 2 anos libre de crisis',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Cefalea Cronica',
      description: 'Plan para migrana cronica o cefalea tensional recurrente',
      phases: [
        {
          title: 'Evaluacion',
          items: [
            'Diario de cefalea (frecuencia, intensidad, triggers)',
            'Neuroimagen si banderas rojas',
            'Descartar cefalea por abuso de analgesicos',
            'Evaluacion psicologica (ansiedad/depresion)',
          ],
        },
        {
          title: 'Tratamiento Preventivo',
          items: [
            'Profilaxis farmacologica (topiramato/valproato/amitriptilina)',
            'Anti-CGRP (erenumab/galcanezumab) si refractario',
            'Higiene del sueno',
            'Manejo del estres',
            'Actividad fisica regular',
          ],
        },
        {
          title: 'Seguimiento',
          items: [
            'Control mensual los primeros 3 meses',
            'Evaluacion de respuesta (reduccion > 50% de dias con cefalea)',
            'Ajuste terapeutico segun respuesta',
            'Control trimestral una vez estable',
          ],
        },
      ],
    },
    {
      name: 'Evaluacion Neurocognitiva',
      description: 'Protocolo de estudio de deterioro cognitivo',
      phases: [
        {
          title: 'Tamizaje Inicial',
          items: [
            'Mini Mental State Examination (MMSE)',
            'Test de reloj',
            'MoCA (Montreal Cognitive Assessment)',
            'Evaluacion funcional (Barthel/Lawton)',
          ],
        },
        {
          title: 'Estudios Complementarios',
          items: [
            'RMN cerebral con volumetria hipocampal',
            'Laboratorios (TSH, vitamina B12, acido folico, VDRL)',
            'Evaluacion neuropsicologica formal',
            'PET cerebral si disponible',
          ],
        },
        {
          title: 'Plan Terapeutico y Seguimiento',
          items: [
            'Inhibidor de colinesterasa si Alzheimer',
            'Estimulacion cognitiva',
            'Actividad fisica',
            'Soporte al cuidador',
            'Control semestral con tests cognitivos',
          ],
        },
      ],
    },
  ],

  // ── Oftalmologia ───────────────────────────────────────────────────────
  oftalmologia: [
    {
      name: 'Manejo de Glaucoma',
      description: 'Tratamiento escalonado del glaucoma primario de angulo abierto',
      phases: [
        {
          title: 'Diagnostico',
          items: [
            'Tonometria (PIO basal)',
            'Campimetria computarizada',
            'OCT de nervio optico y capa de fibras',
            'Paquimetria corneal',
            'Gonioscopia',
          ],
        },
        {
          title: 'Tratamiento Inicial',
          items: [
            'Analogo de prostaglandina topico (latanoprost/travoprost)',
            'Evaluacion de PIO a las 4-6 semanas',
            'Agregar betabloqueante topico si PIO no controlada',
            'Considerar laser (SLT) como alternativa',
          ],
        },
        {
          title: 'Seguimiento',
          items: [
            'Control de PIO cada 3-4 meses',
            'Campo visual cada 6-12 meses',
            'OCT anual',
            'Evaluacion para cirugia si progresion a pesar de tratamiento maximo',
          ],
        },
      ],
    },
    {
      name: 'Plan Pre y Post-Cirugia de Catarata',
      description: 'Facoemulsificacion con implante de LIO',
      phases: [
        {
          title: 'Pre-operatorio',
          items: [
            'Biometria ocular (IOL Master)',
            'Topografia corneal',
            'Contaje endotelial',
            'Seleccion de LIO',
            'Evaluacion preoperatoria general',
          ],
        },
        {
          title: 'Post-operatorio Inmediato (1 semana)',
          items: [
            'Antibiotico + corticoide topico',
            'Control a las 24h (PIO, herida)',
            'Proteccion ocular nocturna',
            'Evitar esfuerzos fisicos',
          ],
        },
        {
          title: 'Seguimiento',
          items: [
            'Control a la semana, mes y 3 meses',
            'Refraccion final al mes',
            'Capsulotomia YAG si opacificacion capsular posterior',
            'Alta definitiva a los 3 meses',
          ],
        },
      ],
    },
    {
      name: 'Manejo de Retinopatia Diabetica',
      description: 'Tamizaje y tratamiento segun estadio',
      phases: [
        {
          title: 'Tamizaje y Clasificacion',
          items: [
            'Fondo de ojo con dilatacion',
            'OCT macular',
            'Angiografia fluorescenica si edema macular',
            'Clasificacion (NPDR leve/moderado/severo, PDR)',
          ],
        },
        {
          title: 'Tratamiento',
          items: [
            'Optimizacion de control glicemico (HbA1c < 7%)',
            'Anti-VEGF intravitREO si edema macular',
            'Fotocoagulacion panretinal si PDR',
            'Vitrectomia si hemorragia vitrea persistente',
          ],
        },
        {
          title: 'Seguimiento',
          items: [
            'Control segun severidad (3-12 meses)',
            'OCT de control en cada visita',
            'Coordinacion con endocrinologia',
            'Tamizaje de nefropatia concurrente',
          ],
        },
      ],
    },
  ],
};

/**
 * Returns treatment plan templates for the given specialty slug.
 * Matches by inclusion (e.g., "odontologia-general" matches "odontologia").
 */
export function getTemplatesForSpecialty(specialtySlug: string): PlanTemplate[] {
  // Direct match
  if (TREATMENT_PLAN_TEMPLATES[specialtySlug]) {
    return TREATMENT_PLAN_TEMPLATES[specialtySlug];
  }

  // Partial match (e.g., "odontologia-estetica" → "odontologia")
  for (const [key, templates] of Object.entries(TREATMENT_PLAN_TEMPLATES)) {
    if (specialtySlug.includes(key) || key.includes(specialtySlug)) {
      return templates;
    }
  }

  return [];
}

/**
 * Returns all available specialty keys that have templates.
 */
export function getSpecialtiesWithTemplates(): string[] {
  return Object.keys(TREATMENT_PLAN_TEMPLATES);
}
