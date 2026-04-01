// ============================================
// SPECIALTIES PUBLIC — Marketing data for showcase
// ============================================

export interface SpecialtyModule {
  name: string;
  description: string;
  iconName: string;
}

export interface SpecialtyKPI {
  name: string;
  description: string;
  target?: string;
}

export interface SpecialtyWorkflow {
  name: string;
  steps: string[];
}

export interface SpecialtyDifferentiator {
  title: string;
  description: string;
  iconName: string;
}

export interface PublicSpecialty {
  name: string;
  slug: string;
  shortDescription: string;
  keyModules: string[];
  keyKPIs: string[];
  accentColor: string;
  iconName: string;
  category: string;
  // Extended data for individual specialty pages
  heroTitle?: string;
  heroSubtitle?: string;
  longDescription?: string;
  modules?: SpecialtyModule[];
  kpis?: SpecialtyKPI[];
  workflows?: SpecialtyWorkflow[];
  differentiators?: SpecialtyDifferentiator[];
}

export interface SpecialtyCategory {
  name: string;
  id: string;
  specialties: PublicSpecialty[];
}

// ============================================================================
// SPECIALTY DATA
// ============================================================================

const clinicasGenerales: PublicSpecialty[] = [
  {
    name: 'Medicina General',
    slug: 'medicina-general',
    shortDescription:
      'Atención integral de primer contacto. Consultas generales, controles periódicos y derivaciones especializadas con flujos optimizados.',
    keyModules: ['Consulta SOAP', 'Recetas Digitales', 'Historia Clínica', 'Telemedicina'],
    keyKPIs: ['Pacientes atendidos/día', 'Tiempo promedio por consulta', 'Satisfacción del paciente'],
    accentColor: 'blue',
    iconName: 'Stethoscope',
    category: 'Clínicas Generales',
    heroTitle: 'La atención primaria que tus pacientes merecen',
    heroSubtitle:
      'Gestioná consultas generales, controles periódicos y derivaciones desde un solo lugar. Flujos optimizados para que dediques más tiempo al paciente y menos al papeleo.',
    longDescription: `Como médico general, sos el primer punto de contacto del sistema de salud. Cada día atendés decenas de pacientes con condiciones diversas — desde un resfriado hasta la detección temprana de una enfermedad crónica. Necesitás herramientas que se adapten a esa variedad sin frenarte.

Red Salud para Medicina General integra consulta SOAP, recetas digitales con firma electrónica, historia clínica unificada y telemedicina en un flujo continuo. Cuando un paciente necesita un especialista, generás la interconsulta en dos clics con toda la información relevante adjunta.

El módulo de screening preventivo te alerta sobre controles pendientes según edad, sexo y factores de riesgo de cada paciente. Ya no dependés de tu memoria para recordar que tu paciente de 50 años necesita su colonoscopía o que la paciente diabética tiene su HbA1c vencida.

La integración directa con laboratorio y farmacia significa que podés ordenar estudios y ver resultados sin salir de la consulta, y tus recetas llegan directamente a la farmacia que elija el paciente.`,
    modules: [
      { name: 'Consulta SOAP', description: 'Notas clínicas estructuradas con campos inteligentes y autocompletado por frecuencia de uso.', iconName: 'ClipboardList' },
      { name: 'Recetas Digitales', description: 'Prescripción con firma electrónica, interacciones medicamentosas y envío directo a farmacia.', iconName: 'Pill' },
      { name: 'Historia Clínica Unificada', description: 'Historial completo del paciente con timeline visual, adjuntos y notas de evolución.', iconName: 'FileText' },
      { name: 'Screening Preventivo', description: 'Alertas automáticas de controles pendientes según edad, sexo y factores de riesgo.', iconName: 'ShieldCheck' },
      { name: 'Interconsultas', description: 'Derivaciones a especialistas con resumen clínico automático y seguimiento del estado.', iconName: 'Share2' },
      { name: 'Telemedicina', description: 'Videoconsultas con compartición de pantalla, recetas y órdenes en tiempo real.', iconName: 'Video' },
      { name: 'Laboratorio Integrado', description: 'Órdenes de laboratorio con resultados directos en la historia clínica del paciente.', iconName: 'FlaskConical' },
      { name: 'Gestión de Crónicos', description: 'Panel de seguimiento para pacientes con enfermedades crónicas y alertas de descompensación.', iconName: 'Activity' },
    ],
    kpis: [
      { name: 'Pacientes atendidos/día', description: 'Volumen diario de consultas completadas', target: '25-35' },
      { name: 'Tiempo promedio por consulta', description: 'Duración media de cada consulta médica', target: '15-20 min' },
      { name: 'Tasa de derivación', description: 'Porcentaje de pacientes derivados a especialistas', target: '<15%' },
      { name: 'Satisfacción del paciente', description: 'Calificación promedio post-consulta', target: '>4.5/5' },
      { name: 'Controles preventivos al día', description: 'Pacientes con screenings actualizados según protocolo', target: '>80%' },
    ],
    workflows: [
      {
        name: 'Consulta general',
        steps: ['Recepción y triage inicial', 'Anamnesis con formulario SOAP', 'Examen físico con plantilla guiada', 'Diagnóstico con sugerencia ICD-11', 'Prescripción y/o orden de laboratorio', 'Indicaciones y próxima cita'],
      },
      {
        name: 'Derivación a especialista',
        steps: ['Identificación de necesidad de interconsulta', 'Selección de especialista y adjuntar resumen', 'Envío con prioridad clínica', 'Seguimiento del estado de la interconsulta'],
      },
      {
        name: 'Control de paciente crónico',
        steps: ['Revisión de alertas y métricas pendientes', 'Evaluación de adherencia al tratamiento', 'Ajuste terapéutico si necesario', 'Actualización del plan de seguimiento'],
      },
    ],
    differentiators: [
      { title: 'Screening inteligente', description: 'Alertas automáticas de controles preventivos pendientes basadas en guías clínicas venezolanas e internacionales.', iconName: 'Bell' },
      { title: 'Derivaciones trazables', description: 'Cada interconsulta que generás se puede seguir hasta la respuesta del especialista, sin perder el hilo.', iconName: 'Share2' },
      { title: 'Receta directa a farmacia', description: 'Tu prescripción llega directamente al módulo de farmacia para que el paciente la retire sin papel.', iconName: 'Pill' },
      { title: 'Dashboard de crónicos', description: 'Panel visual con todos tus pacientes crónicos, sus últimas métricas y alertas de descompensación.', iconName: 'Activity' },
    ],
  },
  {
    name: 'Medicina Interna',
    slug: 'medicina-interna',
    shortDescription:
      'Diagnóstico y tratamiento no quirúrgico de enfermedades complejas en adultos. Integración con laboratorio e imagenología para diagnósticos precisos.',
    keyModules: ['Consulta Especializada', 'Laboratorio Integrado', 'Interconsultas', 'Estadísticas'],
    keyKPIs: ['Diagnósticos acertados', 'Tiempo de diagnóstico', 'Interconsultas gestionadas'],
    accentColor: 'blue',
    iconName: 'Activity',
    category: 'Clínicas Generales',
    heroTitle: 'El internista necesita ver el panorama completo',
    heroSubtitle:
      'Evaluación multisistémica, polifarmacia bajo control y correlación de laboratorio en tiempo real. Porque un internista no trata órganos — trata pacientes.',
    longDescription: `La medicina interna es la especialidad de la complejidad. Tus pacientes tienen múltiples comorbilidades, toman varios medicamentos y necesitan evaluaciones que integren datos de múltiples fuentes. Un sistema genérico te frena; uno diseñado para vos te potencia.

Red Salud para Medicina Interna centraliza toda la información del paciente en un dashboard multisistémico. Laboratorios, imágenes, interconsultas anteriores, medicación activa y alertas de interacciones — todo visible sin salir de la consulta.

El módulo de revisión de polifarmacia analiza automáticamente las interacciones entre todos los medicamentos activos del paciente, incluyendo los prescritos por otros especialistas. Cuando ajustás una dosis o agregás un fármaco, el sistema evalúa la seguridad en tiempo real.

Para hospitalizaciones, el seguimiento intrahospitalario te permite registrar evoluciones diarias, ajustar tratamientos y coordinar con el equipo de enfermería desde cualquier dispositivo.`,
    modules: [
      { name: 'Evaluación Multisistémica', description: 'Examen por sistemas con plantillas especializadas y hallazgos codificados.', iconName: 'ClipboardList' },
      { name: 'Revisión de Polifarmacia', description: 'Análisis automático de interacciones medicamentosas entre todos los fármacos activos.', iconName: 'Pill' },
      { name: 'Laboratorio Correlacionado', description: 'Resultados con tendencias históricas y alertas de valores críticos automáticas.', iconName: 'FlaskConical' },
      { name: 'Seguimiento Hospitalario', description: 'Evoluciones diarias, órdenes médicas y coordinación con enfermería en hospitalización.', iconName: 'Building' },
      { name: 'Interconsultas Integradas', description: 'Gestión de interconsultas enviadas y recibidas con seguimiento de estado.', iconName: 'Share2' },
      { name: 'Riesgo Cardiovascular', description: 'Calculadoras de riesgo Framingham, ASCVD y estratificación del paciente.', iconName: 'Heart' },
    ],
    kpis: [
      { name: 'Precisión diagnóstica', description: 'Correlación entre diagnóstico presuntivo y diagnóstico final', target: '>90%' },
      { name: 'Tiempo al diagnóstico', description: 'Tiempo desde la primera consulta hasta el diagnóstico definitivo', target: '<72h' },
      { name: 'Interconsultas gestionadas', description: 'Interconsultas completadas con respuesta del especialista', target: '>95%' },
      { name: 'Alertas de polifarmacia', description: 'Interacciones medicamentosas detectadas y resueltas' },
      { name: 'Readmisiones a 30 días', description: 'Pacientes que reingresan dentro de los 30 días post-alta', target: '<10%' },
    ],
    workflows: [
      {
        name: 'Evaluación integral del paciente complejo',
        steps: ['Revisión de historia clínica y medicación activa', 'Examen por sistemas con plantilla especializada', 'Correlación con laboratorios e imágenes previas', 'Diagnóstico diferencial con sugerencia ICD-11', 'Plan terapéutico con verificación de interacciones', 'Coordinación de interconsultas necesarias'],
      },
      {
        name: 'Ronda hospitalaria',
        steps: ['Revisión de evolución nocturna', 'Evaluación clínica del paciente', 'Ajuste de indicaciones médicas', 'Registro de evolución diaria', 'Comunicación con equipo de enfermería'],
      },
      {
        name: 'Revisión de polifarmacia',
        steps: ['Listado completo de medicación activa', 'Análisis de interacciones automatizado', 'Evaluación de duplicidades terapéuticas', 'Ajuste y simplificación del esquema', 'Comunicación al paciente y otros tratantes'],
      },
    ],
    differentiators: [
      { title: 'Vista multisistémica', description: 'Dashboard que muestra el estado de cada sistema orgánico del paciente de un vistazo.', iconName: 'LayoutDashboard' },
      { title: 'Detector de interacciones', description: 'Revisión automática de polifarmacia que cruza TODOS los medicamentos activos, incluyendo los de otros especialistas.', iconName: 'ShieldAlert' },
      { title: 'Correlación temporal', description: 'Timeline que correlaciona laboratorios, imágenes, cambios de medicación y eventos clínicos en una vista unificada.', iconName: 'Clock' },
      { title: 'Calculadoras de riesgo', description: 'Framingham, ASCVD, MELD, Wells y más — integradas directamente en la consulta con datos auto-poblados.', iconName: 'Calculator' },
    ],
  },
];

const quirurgicas: PublicSpecialty[] = [
  {
    name: 'Traumatología y Ortopedia',
    slug: 'traumatologia',
    shortDescription:
      'Sistema musculoesquelético completo con herramientas para clasificación de fracturas, planificación quirúrgica y seguimiento de rehabilitación.',
    keyModules: ['Clasificación de Fracturas', 'Planificación Quirúrgica', 'Rehabilitación', 'Imagenología'],
    keyKPIs: ['Cirugías realizadas', 'Tiempo de recuperación', 'Tasa de éxito quirúrgico'],
    accentColor: 'orange',
    iconName: 'Bone',
    category: 'Quirúrgicas',
    heroTitle: 'Del diagnóstico a la rehabilitación, sin perder un paso',
    heroSubtitle:
      'Clasificación de fracturas, planificación quirúrgica con visor de imágenes, protocolos de rehabilitación y seguimiento postoperatorio. Todo el recorrido del paciente traumatológico.',
    longDescription: `En traumatología, cada minuto cuenta desde la evaluación inicial hasta la planificación quirúrgica. Necesitás herramientas que te permitan clasificar, planificar y operar con toda la información a mano — no buscándola en carpetas o sistemas desconectados.

Red Salud para Traumatología integra un visor de imágenes DICOM directo en la consulta, clasificación estandarizada de fracturas (AO/OTA, Garden, Neer, etc.), y plantillas quirúrgicas pre-cargadas con los abordajes más comunes.

El módulo de rehabilitación te permite diseñar protocolos personalizados con ejercicios, metas funcionales y escalas de dolor. El paciente recibe su plan en la app y vos podés monitorear su progreso entre consultas.

Para el seguimiento postoperatorio, el sistema genera alertas automáticas de control radiográfico, retiro de material y evaluación funcional según el tipo de procedimiento realizado.`,
    modules: [
      { name: 'Clasificación de Fracturas', description: 'Clasificación AO/OTA, Garden, Neer y más con selector visual interactivo.', iconName: 'Bone' },
      { name: 'Visor de Imágenes', description: 'Visualización de radiografías y tomografías DICOM con herramientas de medición.', iconName: 'Scan' },
      { name: 'Planificación Quirúrgica', description: 'Plantillas quirúrgicas con abordaje, material y estimación de tiempo.', iconName: 'Scissors' },
      { name: 'Protocolos de Rehabilitación', description: 'Planes de rehabilitación personalizados con ejercicios y metas funcionales.', iconName: 'Dumbbell' },
      { name: 'Seguimiento Postoperatorio', description: 'Alertas automáticas de controles, retiro de material y evaluación funcional.', iconName: 'Calendar' },
      { name: 'Escalas Funcionales', description: 'DASH, WOMAC, Harris Hip Score y más — aplicables directamente en consulta.', iconName: 'ClipboardCheck' },
    ],
    kpis: [
      { name: 'Cirugías realizadas/mes', description: 'Volumen quirúrgico mensual por tipo de procedimiento', target: 'Variable' },
      { name: 'Tiempo promedio de recuperación', description: 'Días desde cirugía hasta alta funcional', target: 'Según procedimiento' },
      { name: 'Tasa de éxito quirúrgico', description: 'Cirugías sin complicaciones mayores', target: '>95%' },
      { name: 'Adherencia a rehabilitación', description: 'Pacientes que completan el protocolo de rehabilitación', target: '>75%' },
      { name: 'Complicaciones postoperatorias', description: 'Tasa de infecciones, dehiscencias o re-intervenciones', target: '<5%' },
    ],
    workflows: [
      {
        name: 'Evaluación traumatológica inicial',
        steps: ['Anamnesis del mecanismo de lesión', 'Examen físico musculoesquelético', 'Solicitud y revisión de imágenes', 'Clasificación estandarizada de la lesión', 'Decisión terapéutica: conservador vs. quirúrgico'],
      },
      {
        name: 'Planificación quirúrgica',
        steps: ['Revisión de imágenes con herramientas de medición', 'Selección de abordaje quirúrgico', 'Definición de material de osteosíntesis', 'Consentimiento informado digital', 'Programación en quirófano'],
      },
      {
        name: 'Seguimiento postoperatorio',
        steps: ['Control de herida y radiografía de control', 'Inicio de protocolo de rehabilitación', 'Evaluación funcional con escalas estandarizadas', 'Control radiográfico de consolidación', 'Alta y plan de seguimiento a largo plazo'],
      },
    ],
    differentiators: [
      { title: 'Clasificaciones integradas', description: 'AO/OTA, Garden, Neer, Weber y más — seleccionás visualmente y queda codificado en la historia.', iconName: 'Layers' },
      { title: 'Visor DICOM nativo', description: 'Revisá radiografías y tomografías directamente en la consulta sin necesidad de PACS externo.', iconName: 'Scan' },
      { title: 'Rehabilitación trazable', description: 'El paciente recibe su plan de ejercicios en la app y vos monitoreás su progreso en tiempo real.', iconName: 'TrendingUp' },
      { title: 'Alertas postoperatorias', description: 'El sistema sabe qué cirugía hiciste y te recuerda cuándo tocar control, cuándo retirar material.', iconName: 'Bell' },
    ],
  },
];

const cardiovasculares: PublicSpecialty[] = [
  {
    name: 'Cardiología',
    slug: 'cardiologia',
    shortDescription:
      'Módulos especializados para ECG, ecocardiograma, monitoreo de eventos cardíacos y alertas críticas. Seguimiento integral del paciente cardiovascular.',
    keyModules: ['Visor de ECG', 'Alertas Críticas', 'Imagenología Cardíaca', 'Laboratorio Cardiovascular'],
    keyKPIs: ['ECGs realizados', 'Eventos cardíacos detectados', 'Pacientes en seguimiento'],
    accentColor: 'red',
    iconName: 'Heart',
    category: 'Cardiovasculares',
    heroTitle: 'Cada latido cuenta — tu consultorio cardiológico digital',
    heroSubtitle:
      'Visor de ECG integrado, cola de estudios pendientes, alertas críticas en tiempo real y estratificación de riesgo cardiovascular. Porque en cardiología, la velocidad salva vidas.',
    longDescription: `En cardiología, la diferencia entre un buen resultado y una emergencia puede ser cuestión de minutos. Tu sistema de gestión no puede ser el cuello de botella. Necesitás que la información llegue rápido, se interprete correctamente y dispare las alertas adecuadas.

Red Salud para Cardiología incluye un visor de ECG integrado con medición automática de intervalos, una cola de estudios pendientes (ECG, eco, Holter, prueba de esfuerzo) y un panel de alertas críticas que te notifica en tiempo real cuando un paciente presenta valores fuera de rango.

El módulo de ecocardiograma te permite registrar hallazgos estructurados con mediciones estandarizadas (FEVI, diámetros cavitarios, gradientes valvulares) y generar informes con un clic. Las pruebas de esfuerzo se documentan con protocolo Bruce o Naughton integrado.

La estratificación de riesgo cardiovascular se calcula automáticamente usando Framingham, ASCVD y SCORE, poblándose con datos que ya están en la historia clínica del paciente.`,
    modules: [
      { name: 'Visor de ECG', description: 'Visualización de trazados electrocardiográficos con medición de intervalos y ejes.', iconName: 'Activity' },
      { name: 'Ecocardiograma', description: 'Registro estructurado de mediciones ecocardiográficas con generación de informes.', iconName: 'Monitor' },
      { name: 'Prueba de Esfuerzo', description: 'Documentación con protocolo Bruce/Naughton, monitoreo de etapas y resultado.', iconName: 'Zap' },
      { name: 'Holter', description: 'Gestión de colocación, retiro e interpretación de monitoreo Holter 24h.', iconName: 'Watch' },
      { name: 'Alertas Críticas', description: 'Panel en tiempo real con alertas de valores críticos y pacientes de alto riesgo.', iconName: 'AlertTriangle' },
      { name: 'Estratificación de Riesgo', description: 'Framingham, ASCVD, SCORE calculados automáticamente con datos del paciente.', iconName: 'Shield' },
      { name: 'Telecardiología', description: 'Consultas remotas con compartición de trazados y estudios en tiempo real.', iconName: 'Video' },
    ],
    kpis: [
      { name: 'Pacientes atendidos/día', description: 'Volumen diario de consultas y procedimientos cardiológicos' },
      { name: 'Tiempo de respuesta ECG', description: 'Tiempo desde la toma del ECG hasta la interpretación', target: '<30 min' },
      { name: 'Utilización de ecocardiograma', description: 'Porcentaje de slots de eco utilizados vs. disponibles', target: '>85%' },
      { name: 'Eventos cardíacos detectados', description: 'Arritmias, isquemias y otros eventos identificados precozmente' },
      { name: 'Satisfacción del paciente', description: 'Calificación post-consulta del paciente cardiológico', target: '>4.5/5' },
      { name: 'Conversión de remisiones', description: 'Remisiones recibidas que se convierten en pacientes activos', target: '>70%' },
    ],
    workflows: [
      {
        name: 'Consulta cardiológica de primera vez',
        steps: ['Anamnesis cardiovascular estructurada', 'Examen físico cardiovascular', 'ECG en consultorio con interpretación', 'Solicitud de estudios complementarios', 'Estratificación de riesgo cardiovascular', 'Plan terapéutico y seguimiento'],
      },
      {
        name: 'Cola de ECG',
        steps: ['ECG tomado por enfermería/técnico', 'Aparece en cola de pendientes del cardiólogo', 'Interpretación con herramientas de medición', 'Informe generado y firmado digitalmente', 'Resultado disponible en historia del paciente'],
      },
      {
        name: 'Seguimiento del paciente cardiovascular',
        steps: ['Revisión de alertas y valores fuera de rango', 'Control de adherencia al tratamiento', 'Actualización de riesgo cardiovascular', 'Ajuste terapéutico si necesario', 'Programación de próximo control'],
      },
    ],
    differentiators: [
      { title: 'ECG integrado', description: 'Visor de trazados con medición de intervalos, ejes y comparación con registros previos del mismo paciente.', iconName: 'Activity' },
      { title: 'Alertas en tiempo real', description: 'Cuando un paciente tiene un valor crítico de troponina o un Holter con arritmia, lo sabés inmediatamente.', iconName: 'AlertTriangle' },
      { title: 'Riesgo auto-calculado', description: 'Framingham, ASCVD y SCORE se calculan solos con los datos que ya tiene la historia clínica.', iconName: 'Calculator' },
      { title: 'Cola de procedimientos', description: 'ECG, eco, Holter y prueba de esfuerzo — cada estudio tiene su cola y su flujo específico.', iconName: 'ListOrdered' },
    ],
  },
];

const neurologicas: PublicSpecialty[] = [
  {
    name: 'Neurología',
    slug: 'neurologia',
    shortDescription:
      'Herramientas para estudios neurofisiológicos, escalas neurológicas estandarizadas y seguimiento de patologías crónicas del sistema nervioso.',
    keyModules: ['Estudios Neurofisiológicos', 'Escalas Neurológicas', 'Imagenología', 'Telemedicina'],
    keyKPIs: ['Estudios realizados', 'Interconsultas', 'Pacientes en seguimiento'],
    accentColor: 'purple',
    iconName: 'Brain',
    category: 'Neurológicas',
    heroTitle: 'El cerebro es complejo — tu herramienta no debería serlo',
    heroSubtitle:
      'Diarios de crisis epilépticas, escalas cognitivas estandarizadas, seguimiento de titulación farmacológica y correlación de EEG. Neurología con la profundidad que necesitás.',
    longDescription: `La neurología requiere un nivel de detalle que los sistemas genéricos simplemente no ofrecen. Desde el diario de crisis epilépticas hasta las escalas cognitivas, cada dato tiene un significado clínico que no se puede capturar en un campo de texto libre.

Red Salud para Neurología incluye diarios de crisis estructurados donde el paciente puede registrar eventos desde su celular, escalas neurológicas estandarizadas (NIHSS, mRS, MMSE, MoCA, EDSS) aplicables directamente en consulta, y un módulo de titulación farmacológica que rastrea cada ajuste de dosis con sus efectos.

El registro de EEG te permite documentar hallazgos con terminología estandarizada ILAE y correlacionarlos con el diario de crisis del paciente. Para neuroimágenes, el visor integrado te permite revisar RMN y TAC sin salir de la consulta.

El seguimiento de patologías crónicas como epilepsia, Parkinson, esclerosis múltiple y cefaleas cuenta con formularios específicos que capturan exactamente la información relevante para cada condición.`,
    modules: [
      { name: 'Diario de Crisis', description: 'Registro estructurado de eventos epilépticos con tipo, duración, triggers y recuperación.', iconName: 'BookOpen' },
      { name: 'Escalas Neurológicas', description: 'NIHSS, mRS, MMSE, MoCA, EDSS y más — aplicables directamente en consulta.', iconName: 'ClipboardCheck' },
      { name: 'Titulación Farmacológica', description: 'Seguimiento de ajustes de dosis con línea temporal de efectos y niveles séricos.', iconName: 'Pill' },
      { name: 'Registro de EEG', description: 'Documentación con terminología ILAE y correlación con eventos clínicos.', iconName: 'Activity' },
      { name: 'Neuroimágenes', description: 'Visor integrado de RMN y TAC con herramientas de marcación y comparación.', iconName: 'Scan' },
      { name: 'Evaluación Cognitiva', description: 'Baterías neuropsicológicas digitalizadas con puntuación automática.', iconName: 'Brain' },
      { name: 'Teleneurología', description: 'Consultas remotas con evaluación neurológica guiada y compartición de estudios.', iconName: 'Video' },
    ],
    kpis: [
      { name: 'Frecuencia de crisis/mes', description: 'Promedio de eventos epilépticos por paciente por mes' },
      { name: 'Pacientes libres de crisis', description: 'Porcentaje de epilépticos sin crisis en los últimos 12 meses', target: '>60%' },
      { name: 'Estudios neurofisiológicos', description: 'EEGs realizados e interpretados por período' },
      { name: 'Adherencia farmacológica', description: 'Pacientes con niveles séricos en rango terapéutico', target: '>80%' },
      { name: 'Tiempo a diagnóstico', description: 'Tiempo desde primera consulta hasta diagnóstico definitivo' },
    ],
    workflows: [
      {
        name: 'Evaluación neurológica inicial',
        steps: ['Anamnesis neurológica dirigida', 'Examen neurológico con escala estandarizada', 'Solicitud de estudios (EEG, RMN, laboratorio)', 'Diagnóstico presuntivo con codificación ICD-11', 'Inicio de tratamiento con plan de titulación'],
      },
      {
        name: 'Seguimiento de epilepsia',
        steps: ['Revisión del diario de crisis del paciente', 'Evaluación de efectos adversos de medicación', 'Revisión de niveles séricos si aplica', 'Ajuste de medicación con registro de titulación', 'Programación de EEG de control si necesario'],
      },
      {
        name: 'Evaluación cognitiva',
        steps: ['Aplicación de MMSE o MoCA en consultorio', 'Registro de puntuación y comparación con previas', 'Solicitud de estudios complementarios', 'Diagnóstico diferencial de deterioro cognitivo', 'Plan de manejo y seguimiento'],
      },
    ],
    differentiators: [
      { title: 'Diario del paciente', description: 'Tu paciente epiléptico registra sus crisis desde el celular y vos lo ves en tiempo real antes de la consulta.', iconName: 'BookOpen' },
      { title: 'Escalas digitalizadas', description: 'NIHSS, MMSE, MoCA, EDSS — se aplican en consulta, se puntúan automáticamente y se comparan con registros previos.', iconName: 'ClipboardCheck' },
      { title: 'Titulación visual', description: 'Línea temporal que muestra cada ajuste de dosis junto con la respuesta clínica y los efectos adversos.', iconName: 'TrendingUp' },
      { title: 'Correlación EEG-crisis', description: 'Los hallazgos del EEG se correlacionan automáticamente con los eventos del diario de crisis del paciente.', iconName: 'Link' },
    ],
  },
];

const pediatricas: PublicSpecialty[] = [
  {
    name: 'Pediatría',
    slug: 'pediatria',
    shortDescription:
      'Curvas de crecimiento integradas, esquema de vacunación venezolano, hitos del desarrollo y alertas por edad. Diseñado para el cuidado infantil integral.',
    keyModules: ['Curvas de Crecimiento', 'Vacunación', 'Hitos del Desarrollo', 'Control de Niño Sano'],
    keyKPIs: ['Controles de niño sano', 'Vacunaciones completadas', 'Alertas de crecimiento'],
    accentColor: 'sky',
    iconName: 'Baby',
    category: 'Pediátricas',
    heroTitle: 'Cuidar niños requiere un sistema que piense como pediatra',
    heroSubtitle:
      'Curvas OMS integradas, esquema de vacunación venezolano, hitos del desarrollo por edad y vitales adaptados. Porque un niño no es un adulto pequeño.',
    longDescription: `En pediatría, todo cambia según la edad. Los signos vitales normales de un recién nacido son una emergencia en un escolar. Las dosis de medicamentos se calculan por kilo. Los controles preventivos tienen su propio calendario. Un sistema genérico no entiende esto — Red Salud sí.

Las curvas de crecimiento OMS/CDC se grafican automáticamente con cada medición que registrás. El sistema calcula percentiles, detecta cruces de percentiles y genera alertas cuando un niño se desvía de su canal de crecimiento. No necesitás buscar tablas ni calcular a mano.

El esquema de vacunación venezolano viene pre-cargado y se actualiza según las guías nacionales. El sistema te muestra qué vacunas faltan, cuáles están pendientes y cuáles toca en la próxima visita. Los padres reciben recordatorios automáticos.

Los hitos del desarrollo se evalúan con formularios específicos por grupo etario. El sistema te alerta si un niño no ha alcanzado un hito esperado para su edad, permitiendo la detección temprana de trastornos del neurodesarrollo.`,
    modules: [
      { name: 'Curvas de Crecimiento', description: 'Gráficas OMS/CDC con cálculo automático de percentiles y alertas de cruces.', iconName: 'TrendingUp' },
      { name: 'Vacunación', description: 'Esquema venezolano pre-cargado con alertas de dosis pendientes y recordatorios a padres.', iconName: 'Syringe' },
      { name: 'Hitos del Desarrollo', description: 'Evaluación por grupo etario de hitos motores, cognitivos y sociales.', iconName: 'Baby' },
      { name: 'Control de Niño Sano', description: 'Plantillas específicas por edad con todos los ítems del control pediátrico.', iconName: 'ClipboardCheck' },
      { name: 'Dosificación Pediátrica', description: 'Cálculo automático de dosis por peso con ajuste por edad y presentación.', iconName: 'Pill' },
      { name: 'Vitales por Edad', description: 'Rangos normales de signos vitales adaptados automáticamente a la edad del paciente.', iconName: 'Heart' },
      { name: 'Neurodesarrollo', description: 'Screening de trastornos del neurodesarrollo con escalas validadas por edad.', iconName: 'Brain' },
      { name: 'Portal de Padres', description: 'Los padres acceden a curvas de crecimiento, vacunas y próximas citas desde su app.', iconName: 'Users' },
    ],
    kpis: [
      { name: 'Controles de niño sano', description: 'Porcentaje de pacientes con controles al día según su edad', target: '>85%' },
      { name: 'Cobertura de vacunación', description: 'Pacientes con esquema de vacunación completo para su edad', target: '>95%' },
      { name: 'Alertas de crecimiento', description: 'Niños con cruces de percentil o desviación del canal de crecimiento' },
      { name: 'Seguimiento de percentiles', description: 'Pacientes con mediciones de crecimiento actualizadas', target: '>90%' },
      { name: 'Satisfacción de padres', description: 'Calificación de los padres sobre la atención recibida', target: '>4.5/5' },
      { name: 'Tasa de recall', description: 'Pacientes que vuelven a su próximo control programado', target: '>70%' },
    ],
    workflows: [
      {
        name: 'Control de niño sano',
        steps: ['Medición de peso, talla, perímetro cefálico', 'Graficación automática en curvas de crecimiento', 'Evaluación de hitos del desarrollo por edad', 'Revisión del esquema de vacunación', 'Examen físico con plantilla por edad', 'Indicaciones anticipatorias a los padres', 'Programación del próximo control'],
      },
      {
        name: 'Consulta por enfermedad aguda',
        steps: ['Triage con vitales ajustados por edad', 'Anamnesis dirigida al motivo de consulta', 'Examen físico pediátrico', 'Diagnóstico con codificación ICD-11', 'Prescripción con dosis calculada por peso', 'Signos de alarma para los padres'],
      },
      {
        name: 'Seguimiento de vacunación',
        steps: ['Revisión del esquema actualizado del paciente', 'Identificación de dosis pendientes', 'Aplicación y registro de vacunas', 'Actualización del carnet digital', 'Recordatorio automático de próxima dosis'],
      },
    ],
    differentiators: [
      { title: 'Curvas automáticas', description: 'Cada medición se grafica instantáneamente en las curvas OMS/CDC con percentiles y alertas de cruce.', iconName: 'TrendingUp' },
      { title: 'Vacunación venezolana', description: 'Esquema oficial pre-cargado y actualizado. El sistema sabe qué toca hoy y qué falta.', iconName: 'Syringe' },
      { title: 'Dosis por peso', description: 'Calculadora de dosificación pediátrica integrada en la receta. Nunca más calcular a mano.', iconName: 'Calculator' },
      { title: 'Detección temprana', description: 'Alertas automáticas cuando un niño no alcanza los hitos esperados para su edad o se desvía de su canal de crecimiento.', iconName: 'Bell' },
    ],
  },
];

const ginecologicas: PublicSpecialty[] = [
  {
    name: 'Ginecología y Obstetricia',
    slug: 'ginecologia',
    shortDescription:
      'Control prenatal completo, seguimiento obstétrico, citologías y planificación familiar. Herramientas específicas para salud reproductiva femenina.',
    keyModules: ['Control Prenatal', 'Ecografía Obstétrica', 'Citología', 'Planificación Familiar'],
    keyKPIs: ['Controles prenatales', 'Partos atendidos', 'Citologías realizadas'],
    accentColor: 'pink',
    iconName: 'HeartPulse',
    category: 'Ginecológicas',
    heroTitle: 'Acompañá cada etapa de la salud femenina',
    heroSubtitle:
      'Control prenatal estructurado, calendario obstétrico automático, registro de citologías y planificación familiar integral. Desde la pubertad hasta la menopausia.',
    longDescription: `La ginecología y obstetricia abarcan la salud de la mujer en todas sus etapas. Desde el primer control prenatal hasta el seguimiento de la menopausia, cada consulta tiene sus propios requerimientos. Red Salud entiende esa complejidad.

El módulo de control prenatal genera automáticamente el calendario obstétrico a partir de la fecha de última regla o la ecografía del primer trimestre. Cada consulta tiene su plantilla específica según la edad gestacional, con los estudios y laboratorios que corresponden a esa semana.

El registro de ecografías obstétricas incluye mediciones biométricas fetales con cálculo de percentiles, evaluación de líquido amniótico, ubicación placentaria y marcadores de cromosomopatías. Los informes se generan con formato estandarizado.

Para ginecología, el seguimiento de citologías con clasificación Bethesda, el registro de colposcopías con mapeo lesional y la gestión de planificación familiar con todos los métodos disponibles te permiten manejar la salud reproductiva de tus pacientes de forma integral.`,
    modules: [
      { name: 'Control Prenatal', description: 'Calendario obstétrico automático con plantillas por edad gestacional y alertas.', iconName: 'Calendar' },
      { name: 'Ecografía Obstétrica', description: 'Biometría fetal con percentiles, líquido amniótico, placenta y marcadores.', iconName: 'Monitor' },
      { name: 'Citología y Colposcopía', description: 'Registro Bethesda, mapeo lesional colposcópico y seguimiento de biopsias.', iconName: 'Microscope' },
      { name: 'Planificación Familiar', description: 'Gestión de métodos anticonceptivos con alertas de renovación y controles.', iconName: 'Heart' },
      { name: 'Partograma Digital', description: 'Seguimiento del trabajo de parto con curvas de dilatación y alertas.', iconName: 'Activity' },
      { name: 'Menopausia y Climaterio', description: 'Evaluación de síntomas, densitometría ósea y terapia hormonal.', iconName: 'Thermometer' },
    ],
    kpis: [
      { name: 'Controles prenatales', description: 'Pacientes embarazadas con controles al día según edad gestacional', target: '>90%' },
      { name: 'Partos atendidos/mes', description: 'Volumen de partos (vaginales y cesáreas) por mes' },
      { name: 'Citologías realizadas', description: 'Citologías cervicales procesadas y con resultado' },
      { name: 'Tasa de cesárea', description: 'Porcentaje de cesáreas sobre total de partos', target: '<25%' },
      { name: 'Cobertura anticonceptiva', description: 'Pacientes con método anticonceptivo activo y controlado', target: '>85%' },
    ],
    workflows: [
      {
        name: 'Control prenatal',
        steps: ['Cálculo de edad gestacional (FUR o eco)', 'Evaluación clínica según semana gestacional', 'Solicitud de laboratorios del trimestre', 'Ecografía con biometría y percentiles', 'Registro de hallazgos y plan de seguimiento', 'Programación de próximo control'],
      },
      {
        name: 'Citología cervical',
        steps: ['Toma de muestra con registro digital', 'Envío a laboratorio de citopatología', 'Recepción y registro del resultado Bethesda', 'Colposcopía si resultado anormal', 'Seguimiento según protocolo de hallazgos'],
      },
      {
        name: 'Planificación familiar',
        steps: ['Evaluación de criterios de elegibilidad', 'Consejería de métodos disponibles', 'Prescripción o colocación del método elegido', 'Programación de controles de seguimiento', 'Alertas de renovación o cambio de método'],
      },
    ],
    differentiators: [
      { title: 'Calendario obstétrico', description: 'Se genera automáticamente desde la FUR o eco del primer trimestre. Cada semana sabe qué estudios corresponden.', iconName: 'Calendar' },
      { title: 'Biometría con percentiles', description: 'Las mediciones fetales se grafican en curvas de crecimiento fetal con percentiles y alertas de RCIU.', iconName: 'TrendingUp' },
      { title: 'Seguimiento Bethesda', description: 'Desde la citología hasta la colposcopía y la biopsia — todo el recorrido trazado y con alertas de seguimiento.', iconName: 'Microscope' },
      { title: 'Partograma inteligente', description: 'Curvas de dilatación en tiempo real con alertas de desviación según la OMS.', iconName: 'Activity' },
    ],
  },
];

const oftalmologicas: PublicSpecialty[] = [
  {
    name: 'Oftalmología',
    slug: 'oftalmologia',
    shortDescription:
      'Examen oftalmológico digital con campos visuales, fondo de ojo, tonometría y prescripción óptica integrada. Imagenología ocular especializada.',
    keyModules: ['Examen Visual', 'Campo Visual', 'Fondo de Ojo', 'Prescripción Óptica'],
    keyKPIs: ['Exámenes realizados', 'Cirugías oculares', 'Detección de glaucoma'],
    accentColor: 'cyan',
    iconName: 'Eye',
    category: 'Oftalmológicas',
    heroTitle: 'La visión de tus pacientes, con la precisión que merecen',
    heroSubtitle:
      'Registro de agudeza visual evolutiva, tonometría seriada, campos visuales, fundoscopía y prescripción óptica integrada. Oftalmología digital completa.',
    longDescription: `La oftalmología depende de datos precisos y su evolución en el tiempo. La agudeza visual de hoy solo tiene sentido si podés compararla con la de hace 6 meses. La presión intraocular cobra relevancia cuando ves la tendencia de los últimos 2 años. Red Salud captura esa dimensión temporal.

El registro de agudeza visual incluye visión lejana, cercana, con y sin corrección, y estenopeico — todo con trending automático. La tonometría se registra con hora de medición (crucial para el diagnóstico de glaucoma) y se grafica como serie temporal.

El módulo de fondo de ojo te permite documentar hallazgos con esquema gráfico interactivo, mientras que los campos visuales se importan o registran manualmente con mapeo de defectos. Para cirugías, las plantillas quirúrgicas para catarata, pterigión y procedimientos refractivos están pre-cargadas.

La prescripción óptica genera la fórmula en formato estandarizado que el paciente puede llevar a cualquier óptica, con historial de cambios de graduación visible en un clic.`,
    modules: [
      { name: 'Agudeza Visual', description: 'Registro de AV lejana, cercana, con/sin corrección y estenopeico con tendencia.', iconName: 'Eye' },
      { name: 'Tonometría', description: 'Presión intraocular seriada con gráfica temporal y alertas de hipertensión.', iconName: 'Gauge' },
      { name: 'Fondo de Ojo', description: 'Documentación de hallazgos con esquema gráfico interactivo y fotografías.', iconName: 'Circle' },
      { name: 'Campo Visual', description: 'Importación de perimetrías con mapeo de defectos y análisis de progresión.', iconName: 'Grid3x3' },
      { name: 'Prescripción Óptica', description: 'Fórmula óptica estandarizada con historial de cambios de graduación.', iconName: 'FileText' },
      { name: 'Planificación Quirúrgica', description: 'Plantillas para catarata, pterigión, procedimientos refractivos y más.', iconName: 'Scissors' },
    ],
    kpis: [
      { name: 'Exámenes realizados/día', description: 'Volumen diario de consultas oftalmológicas completas' },
      { name: 'Cirugías oculares/mes', description: 'Procedimientos quirúrgicos realizados por mes' },
      { name: 'Detección de glaucoma', description: 'Nuevos casos de glaucoma detectados por screening' },
      { name: 'Progresión de campo visual', description: 'Pacientes glaucomatosos con progresión detectada' },
      { name: 'Satisfacción post-quirúrgica', description: 'Resultado visual alcanzado vs. esperado', target: '>90%' },
    ],
    workflows: [
      {
        name: 'Examen oftalmológico completo',
        steps: ['Agudeza visual (lejana, cercana, con/sin corrección)', 'Refracción y prescripción óptica', 'Biomicroscopía (lámpara de hendidura)', 'Tonometría', 'Fondo de ojo con dilatación', 'Impresión diagnóstica y plan'],
      },
      {
        name: 'Seguimiento de glaucoma',
        steps: ['Control de presión intraocular', 'Campo visual periódico con análisis de progresión', 'OCT de nervio óptico', 'Evaluación de adherencia al tratamiento', 'Ajuste terapéutico si progresión'],
      },
      {
        name: 'Cirugía de catarata',
        steps: ['Biometría y cálculo de lente intraocular', 'Consentimiento informado digital', 'Registro operatorio con plantilla', 'Control postoperatorio día 1, semana 1, mes 1', 'Evaluación de resultado visual final'],
      },
    ],
    differentiators: [
      { title: 'Trending visual', description: 'Cada medición de AV y PIO se grafica automáticamente mostrando la evolución en el tiempo.', iconName: 'TrendingUp' },
      { title: 'Tonometría temporal', description: 'La PIO se registra con hora de medición — fundamental para el diagnóstico correcto de glaucoma.', iconName: 'Clock' },
      { title: 'Progresión de campo visual', description: 'Análisis automatizado que compara campos visuales sucesivos y detecta progresión glaucomatosa.', iconName: 'Grid3x3' },
      { title: 'Prescripción digital', description: 'La fórmula óptica se genera en formato estandarizado con historial completo de cambios de graduación.', iconName: 'FileText' },
    ],
  },
];

const dermatologicas: PublicSpecialty[] = [
  {
    name: 'Dermatología',
    slug: 'dermatologia',
    shortDescription:
      'Dermatoscopía digital, atlas de lesiones, seguimiento fotográfico evolutivo y biopsias. Teledermatología para consultas remotas.',
    keyModules: ['Dermatoscopía Digital', 'Atlas de Lesiones', 'Seguimiento Fotográfico', 'Telemedicina'],
    keyKPIs: ['Dermatoscopías', 'Biopsias realizadas', 'Lesiones en seguimiento'],
    accentColor: 'pink',
    iconName: 'Fingerprint',
    category: 'Dermatológicas',
    heroTitle: 'Cada lesión cuenta una historia — documentala como se debe',
    heroSubtitle:
      'Mapeo corporal de lesiones, seguimiento fotográfico evolutivo, dermatoscopía digital y trazabilidad de biopsias. Dermatología visual e integral.',
    longDescription: `La dermatología es inherentemente visual. Una lesión que parece benigna hoy puede cambiar en 3 meses. Un registro fotográfico estructurado con comparación lado a lado no es un lujo — es una necesidad clínica. Red Salud lo entiende.

El mapeo corporal te permite marcar lesiones en un modelo anatómico y asociar cada marcador con fotografías clínicas y dermatoscópicas. Cuando el paciente vuelve, podés comparar la lesión actual con su estado anterior con un deslizador visual.

El módulo de biopsias registra el sitio exacto de la toma, la correlación clínico-patológica y el seguimiento del resultado. Cuando llega el informe de patología, se asocia automáticamente a la lesión y al mapa corporal del paciente.

La teledermatología permite que pacientes en zonas remotas envíen fotos de lesiones para evaluación asincrónica. Vos revisás las imágenes cuando tenés tiempo, emitís un dictamen y el paciente recibe la respuesta — todo trazado y documentado.`,
    modules: [
      { name: 'Mapa Corporal', description: 'Marcación de lesiones en modelo anatómico con geolocalización precisa.', iconName: 'User' },
      { name: 'Seguimiento Fotográfico', description: 'Fotos clínicas y dermatoscópicas con comparación lado a lado evolutiva.', iconName: 'Camera' },
      { name: 'Dermatoscopía Digital', description: 'Registro de patrones dermatoscópicos con atlas de referencia integrado.', iconName: 'Search' },
      { name: 'Biopsias', description: 'Registro de sitio, correlación clínico-patológica y seguimiento de resultado.', iconName: 'Scissors' },
      { name: 'Fototerapia', description: 'Protocolo de sesiones UV con dosis acumulada y control de efectos.', iconName: 'Sun' },
      { name: 'Teledermatología', description: 'Evaluación asincrónica de lesiones con fotos del paciente y dictamen remoto.', iconName: 'Video' },
    ],
    kpis: [
      { name: 'Dermatoscopías realizadas', description: 'Evaluaciones dermatoscópicas documentadas por período' },
      { name: 'Biopsias realizadas', description: 'Biopsias cutáneas con resultado histopatológico' },
      { name: 'Lesiones en seguimiento', description: 'Lesiones activas con plan de monitoreo fotográfico' },
      { name: 'Correlación clínico-patológica', description: 'Concordancia entre impresión clínica y resultado de biopsia', target: '>85%' },
      { name: 'Consultas de teledermatología', description: 'Evaluaciones remotas completadas por período' },
    ],
    workflows: [
      {
        name: 'Evaluación de lesión cutánea',
        steps: ['Localización en mapa corporal', 'Fotografía clínica estandarizada', 'Dermatoscopía con documentación de patrones', 'Impresión diagnóstica y plan', 'Biopsia si indicada con registro de sitio', 'Programación de seguimiento fotográfico'],
      },
      {
        name: 'Seguimiento evolutivo',
        steps: ['Nueva fotografía en mismas condiciones', 'Comparación lado a lado con imagen previa', 'Evaluación dermatoscópica comparativa', 'Decisión: continuar vigilancia, biopsia o tratamiento', 'Actualización del mapa corporal'],
      },
      {
        name: 'Teledermatología',
        steps: ['Paciente envía fotos desde la app', 'Evaluación asincrónica por el dermatólogo', 'Dictamen con clasificación de urgencia', 'Indicaciones o citación presencial si necesario', 'Registro en historia clínica del paciente'],
      },
    ],
    differentiators: [
      { title: 'Mapa corporal interactivo', description: 'Cada lesión tiene su ubicación exacta en el modelo anatómico, con historial fotográfico completo.', iconName: 'MapPin' },
      { title: 'Comparación evolutiva', description: 'Deslizador visual que compara la misma lesión en diferentes momentos del tiempo lado a lado.', iconName: 'SplitSquareVertical' },
      { title: 'Trazabilidad de biopsia', description: 'Desde la marca en el mapa corporal hasta el resultado de patología — todo conectado y trazable.', iconName: 'Link' },
      { title: 'Teledermatología asincrónica', description: 'El paciente envía fotos cuando puede, vos evaluás cuando podés. Sin horarios fijos ni videollamada.', iconName: 'Clock' },
    ],
  },
];

const psiquiatricas: PublicSpecialty[] = [
  {
    name: 'Psiquiatría',
    slug: 'psiquiatria',
    shortDescription:
      'Escalas psicométricas estandarizadas, seguimiento farmacológico especializado, notas de sesión estructuradas y telemedicina para salud mental.',
    keyModules: ['Escalas Psicométricas', 'Seguimiento Farmacológico', 'Notas de Sesión', 'Telemedicina'],
    keyKPIs: ['Sesiones realizadas', 'Adherencia al tratamiento', 'Evolución clínica'],
    accentColor: 'violet',
    iconName: 'Brain',
    category: 'Salud Mental',
    heroTitle: 'Salud mental con herramientas que entienden el proceso',
    heroSubtitle:
      'PHQ-9, GAD-7, escalas de manía y más — aplicables en consulta con trending. Notas de sesión seguras, seguimiento farmacológico y telepsiquiatría. El proceso terapéutico, documentado.',
    longDescription: `La psiquiatría tiene necesidades únicas que ningún sistema genérico contempla. Las notas de sesión requieren un nivel de confidencialidad diferente. Las escalas psicométricas necesitan aplicarse repetidamente para medir evolución. La farmacoterapia psiquiátrica tiene tiempos de ajuste que se miden en semanas, no en días.

Red Salud para Psiquiatría incluye escalas estandarizadas digitalizadas (PHQ-9, GAD-7, YMRS, PANSS, HAM-D, BAI y más) que se aplican directamente en consulta y se grafican automáticamente mostrando la evolución del paciente a lo largo del tratamiento.

Las notas de sesión están protegidas con un nivel adicional de confidencialidad. No aparecen en resúmenes clínicos compartidos con otros especialistas a menos que lo autorices explícitamente. Esto protege la relación terapéutica y la privacidad del paciente.

El seguimiento farmacológico rastrea cada medicamento psiquiátrico con su dosis, fecha de inicio, ajustes y efectos adversos. Cuando titulás un antidepresivo o un estabilizador del ánimo, podés ver exactamente cuándo hiciste cada cambio y cómo respondió el paciente.`,
    modules: [
      { name: 'Escalas Psicométricas', description: 'PHQ-9, GAD-7, YMRS, PANSS, HAM-D y más con puntuación automática y trending.', iconName: 'ClipboardCheck' },
      { name: 'Notas de Sesión', description: 'Notas estructuradas con confidencialidad adicional y plantillas por tipo de sesión.', iconName: 'FileText' },
      { name: 'Seguimiento Farmacológico', description: 'Timeline de medicación psiquiátrica con dosis, ajustes y efectos adversos.', iconName: 'Pill' },
      { name: 'Progreso Terapéutico', description: 'Gráficas de evolución clínica con escalas y notas cualitativas integradas.', iconName: 'TrendingUp' },
      { name: 'Plan de Seguridad', description: 'Evaluación de riesgo suicida y plan de seguridad estructurado del paciente.', iconName: 'Shield' },
      { name: 'Telepsiquiatría', description: 'Videoconsultas con aplicación de escalas compartidas en tiempo real.', iconName: 'Video' },
    ],
    kpis: [
      { name: 'Sesiones realizadas/semana', description: 'Volumen semanal de consultas psiquiátricas' },
      { name: 'Adherencia al tratamiento', description: 'Pacientes que mantienen su régimen farmacológico sin abandono', target: '>75%' },
      { name: 'Mejoría clínica (PHQ-9)', description: 'Pacientes depresivos con reducción significativa del puntaje', target: '>50%' },
      { name: 'Mejoría clínica (GAD-7)', description: 'Pacientes ansiosos con reducción significativa del puntaje', target: '>50%' },
      { name: 'Planes de seguridad activos', description: 'Pacientes de alto riesgo con plan de seguridad vigente', target: '100%' },
    ],
    workflows: [
      {
        name: 'Evaluación psiquiátrica inicial',
        steps: ['Anamnesis psiquiátrica completa', 'Aplicación de escalas basales (PHQ-9, GAD-7, etc.)', 'Evaluación de riesgo suicida', 'Diagnóstico multiaxial con ICD-11', 'Plan terapéutico: farmacológico + psicoterapéutico', 'Plan de seguridad si necesario'],
      },
      {
        name: 'Seguimiento farmacológico',
        steps: ['Revisión de adherencia y efectos adversos', 'Aplicación de escalas de evolución', 'Evaluación de respuesta al tratamiento', 'Ajuste de dosis con registro en timeline', 'Programación de próximo control'],
      },
      {
        name: 'Sesión de seguimiento',
        steps: ['Revisión de notas de sesión anterior', 'Evaluación del estado actual', 'Trabajo terapéutico según modelo', 'Nota de sesión con observaciones clave', 'Actualización del plan de tratamiento'],
      },
    ],
    differentiators: [
      { title: 'Escalas con trending', description: 'PHQ-9, GAD-7 y más se grafican a lo largo del tiempo mostrando si el paciente mejora, se estanca o empeora.', iconName: 'TrendingUp' },
      { title: 'Confidencialidad reforzada', description: 'Las notas de sesión tienen un nivel extra de protección y no se comparten automáticamente con otros especialistas.', iconName: 'Lock' },
      { title: 'Timeline farmacológico', description: 'Cada ajuste de dosis queda registrado con la respuesta clínica y los efectos adversos en una línea temporal visual.', iconName: 'Clock' },
      { title: 'Plan de seguridad digital', description: 'Evaluación de riesgo suicida estructurada con plan de seguridad accesible tanto para vos como para el paciente.', iconName: 'Shield' },
    ],
  },
];

const urologicas: PublicSpecialty[] = [
  {
    name: 'Urología',
    slug: 'urologia',
    shortDescription:
      'Estudios urodinámicos, imagenología urológica, seguimiento de PSA y procedimientos ambulatorios. Todo el flujo del paciente urológico.',
    keyModules: ['Estudios Urodinámicos', 'Imagenología', 'Seguimiento PSA', 'Procedimientos'],
    keyKPIs: ['Procedimientos urológicos', 'Cistoscopías', 'Pacientes en seguimiento'],
    accentColor: 'sky',
    iconName: 'Droplet',
    category: 'Urológicas',
    heroTitle: 'Urología integral — del PSA al quirófano',
    heroSubtitle:
      'Seguimiento de PSA con tendencia, uroflujometría digital, planificación quirúrgica y seguimiento de litiasis. El paciente urológico completo en una sola plataforma.',
    longDescription: `La urología combina consulta ambulatoria, procedimientos diagnósticos y cirugía. Desde el seguimiento de PSA en el screening de próstata hasta la planificación de una nefrolitotomía percutánea, necesitás un sistema que maneje toda esa variedad sin fricción.

Red Salud para Urología incluye seguimiento de PSA con tendencia temporal y velocidad de PSA calculada automáticamente, uroflujometría con generación de curvas, IPSS digital aplicable en consulta, y plantillas para estudios urodinámicos completos.

Para litiasis, el módulo de seguimiento de cálculos registra ubicación, tamaño, composición y tratamientos previos. Cuando un paciente vuelve, ves inmediatamente el historial completo de su enfermedad litiásica.

La planificación quirúrgica cuenta con plantillas específicas para cirugías urológicas comunes: prostatectomía, nefrectomía, litotripsia, circuncisión, y más. Cada plantilla incluye consentimiento informado digital, check-list preoperatorio y protocolo quirúrgico.`,
    modules: [
      { name: 'Seguimiento de PSA', description: 'Gráfica temporal de PSA con velocidad, densidad y alertas de screening.', iconName: 'TrendingUp' },
      { name: 'Uroflujometría', description: 'Registro de flujo urinario con generación de curvas y cálculo de residuo.', iconName: 'Activity' },
      { name: 'IPSS Digital', description: 'Cuestionario de síntomas prostáticos aplicable en consulta con trending.', iconName: 'ClipboardCheck' },
      { name: 'Seguimiento de Litiasis', description: 'Registro de cálculos con ubicación, tamaño, composición y tratamientos.', iconName: 'Diamond' },
      { name: 'Estudios Urodinámicos', description: 'Documentación completa de cistometría, presión-flujo y electromiografía.', iconName: 'FileText' },
      { name: 'Planificación Quirúrgica', description: 'Plantillas para cirugías urológicas con consentimiento y protocolo.', iconName: 'Scissors' },
      { name: 'Cistoscopía', description: 'Registro de hallazgos cistoscópicos con fotos y esquema vesical.', iconName: 'Eye' },
    ],
    kpis: [
      { name: 'Procedimientos/mes', description: 'Volumen mensual de procedimientos urológicos ambulatorios y quirúrgicos' },
      { name: 'Cistoscopías realizadas', description: 'Cistoscopías diagnósticas y de seguimiento por período' },
      { name: 'PSA en seguimiento', description: 'Pacientes con PSA elevado en seguimiento activo' },
      { name: 'Cirugías urológicas', description: 'Procedimientos quirúrgicos realizados por mes' },
      { name: 'Tasa de complicaciones', description: 'Complicaciones postoperatorias en procedimientos urológicos', target: '<5%' },
    ],
    workflows: [
      {
        name: 'Screening prostático',
        steps: ['Registro de PSA con fecha y laboratorio', 'Cálculo automático de velocidad y densidad', 'Tacto rectal con documentación', 'Decisión: vigilancia, repetir PSA o biopsia', 'Programación de seguimiento según protocolo'],
      },
      {
        name: 'Evaluación de litiasis',
        steps: ['Anamnesis de cólico renal', 'Solicitud de imagen (UroTAC)', 'Registro de cálculos: ubicación, tamaño, composición', 'Decisión terapéutica: expectante, LEOCH o cirugía', 'Seguimiento con imagen de control'],
      },
      {
        name: 'Cistoscopía diagnóstica',
        steps: ['Indicación y consentimiento informado', 'Realización con registro de hallazgos', 'Documentación fotográfica', 'Biopsias si necesario', 'Informe y plan de seguimiento'],
      },
    ],
    differentiators: [
      { title: 'PSA inteligente', description: 'No solo el valor actual: velocidad de PSA, densidad y tendencia temporal para una mejor toma de decisiones.', iconName: 'TrendingUp' },
      { title: 'Curva de uroflujometría', description: 'Uroflujometría digital con generación automática de curva y parámetros calculados.', iconName: 'Activity' },
      { title: 'Mapa de litiasis', description: 'Registro completo de cada cálculo con ubicación en el tracto urinario, historial y tratamientos.', iconName: 'MapPin' },
      { title: 'IPSS trending', description: 'El cuestionario de síntomas prostáticos se aplica digitalmente y se compara entre visitas para evaluar respuesta.', iconName: 'ClipboardCheck' },
    ],
  },
];

const odontologicas: PublicSpecialty[] = [
  {
    name: 'Odontología',
    slug: 'odontologia-general',
    shortDescription:
      'Odontograma interactivo, periodontograma digital, planificación de tratamientos dentales y radiología oral. La consulta odontológica completa.',
    keyModules: ['Odontograma', 'Periodontograma', 'Radiología Oral', 'Plan de Tratamiento'],
    keyKPIs: ['Tratamientos completados', 'Procedimientos por tipo', 'Pacientes activos'],
    accentColor: 'teal',
    iconName: 'SmilePlus',
    category: 'Odontológicas',
    heroTitle: 'Tu consultorio odontológico, reimaginado',
    heroSubtitle:
      'Odontograma interactivo, periodontograma digital, morning huddle inteligente y planificación de tratamientos con presupuestos. Odontología digital que entiende tu día a día.',
    longDescription: `La odontología tiene flujos de trabajo completamente diferentes a cualquier otra especialidad médica. El odontograma, el periodontograma, los planes de tratamiento por cuadrantes, la codificación de procedimientos dentales — nada de esto existe en un sistema médico genérico. En Red Salud, es el corazón de tu experiencia.

El odontograma interactivo te permite registrar hallazgos diente por diente con un clic: caries, restauraciones, ausencias, prótesis, endodoncias. El periodontograma digital registra profundidades de sondaje, nivel de inserción clínica, sangrado y recesión con gráficas comparativas entre visitas.

El morning huddle inteligente te muestra tu día antes de que empiece: qué pacientes vienen, qué procedimientos están programados, qué presupuestos están pendientes de aceptación y qué materiales necesitás. Es como tener un asistente que prepara tu agenda cada mañana.

Los presupuestos dentales se generan directamente desde el plan de tratamiento con precios actualizados. El paciente puede aceptar parcial o totalmente y el sistema agenda los procedimientos automáticamente según la secuencia clínica recomendada.`,
    modules: [
      { name: 'Odontograma', description: 'Registro interactivo diente por diente de hallazgos, restauraciones y estado periodontal.', iconName: 'SmilePlus' },
      { name: 'Periodontograma', description: 'Sondaje periodontal digital con gráficas comparativas entre visitas.', iconName: 'Activity' },
      { name: 'Morning Huddle', description: 'Resumen matutino con agenda, procedimientos, presupuestos y materiales del día.', iconName: 'Coffee' },
      { name: 'Plan de Tratamiento', description: 'Planificación secuenciada por cuadrante con presupuesto integrado y aceptación parcial.', iconName: 'FileText' },
      { name: 'Imágenes IA Dental', description: 'Análisis de radiografías dentales con asistencia de inteligencia artificial.', iconName: 'Scan' },
      { name: 'RCM Dental', description: 'Revenue Cycle Management: presupuestos, pagos, seguros y cobranza dental.', iconName: 'DollarSign' },
      { name: 'Teledentología', description: 'Seguimiento remoto de tratamientos y triaje de urgencias dentales.', iconName: 'Video' },
      { name: 'Practice Growth', description: 'Métricas de crecimiento de la práctica: nuevos pacientes, aceptación, producción.', iconName: 'TrendingUp' },
    ],
    kpis: [
      { name: 'Tasa de aceptación de tratamientos', description: 'Presupuestos aceptados sobre presupuestos presentados', target: '>60%' },
      { name: 'Tasa de inasistencia', description: 'Pacientes que no se presentan a su cita programada', target: '<10%' },
      { name: 'Producción diaria', description: 'Valor de procedimientos realizados por día de trabajo' },
      { name: 'Nuevos pacientes/mes', description: 'Pacientes de primera vez que ingresan a la práctica' },
      { name: 'Recall recovery rate', description: 'Pacientes que vuelven cuando se les contacta para control', target: '>70%' },
      { name: 'Aceptación de seguros', description: 'Reclamaciones aceptadas en primer envío', target: '>90%' },
    ],
    workflows: [
      {
        name: 'Consulta odontológica',
        steps: ['Anamnesis y motivo de consulta', 'Examen intraoral con odontograma', 'Sondaje periodontal si indicado', 'Radiografías con análisis', 'Diagnóstico y plan de tratamiento', 'Presupuesto con explicación al paciente', 'Agendamiento de procedimientos'],
      },
      {
        name: 'Morning huddle',
        steps: ['Revisión de agenda del día al llegar', 'Verificación de presupuestos pendientes', 'Preparación de materiales por procedimiento', 'Identificación de oportunidades de tratamiento', 'Revisión de recalls del día'],
      },
      {
        name: 'Tratamiento periodontal',
        steps: ['Periodontograma inicial completo', 'Diagnóstico de severidad y extensión', 'Plan de tratamiento periodontal', 'Procedimiento: raspaje, alisado, cirugía', 'Re-evaluación a 4-6 semanas', 'Periodontograma comparativo de evolución'],
      },
    ],
    differentiators: [
      { title: 'Odontograma interactivo', description: 'Registro visual diente por diente con un clic. Hallazgos, restauraciones, ausencias — todo codificado y trazable.', iconName: 'SmilePlus' },
      { title: 'Morning huddle inteligente', description: 'Cada mañana, tu día preparado: pacientes, procedimientos, presupuestos pendientes y materiales necesarios.', iconName: 'Coffee' },
      { title: 'Presupuestos automáticos', description: 'Desde el plan de tratamiento al presupuesto con un clic. El paciente acepta parcial o totalmente.', iconName: 'FileText' },
      { title: 'Periodontograma comparativo', description: 'Sondaje digital con gráficas que comparan el estado periodontal entre visitas para medir evolución.', iconName: 'Activity' },
    ],
  },
];

// ============================================================================
// CATEGORIES & EXPORTS
// ============================================================================

export const specialtyCategories: SpecialtyCategory[] = [
  { name: 'Clínicas Generales', id: 'generales', specialties: clinicasGenerales },
  { name: 'Cardiovasculares', id: 'cardiovasculares', specialties: cardiovasculares },
  { name: 'Neurológicas', id: 'neurologicas', specialties: neurologicas },
  { name: 'Quirúrgicas', id: 'quirurgicas', specialties: quirurgicas },
  { name: 'Pediátricas', id: 'pediatricas', specialties: pediatricas },
  { name: 'Ginecológicas', id: 'ginecologicas', specialties: ginecologicas },
  { name: 'Oftalmológicas', id: 'oftalmologicas', specialties: oftalmologicas },
  { name: 'Dermatológicas', id: 'dermatologicas', specialties: dermatologicas },
  { name: 'Salud Mental', id: 'mental', specialties: psiquiatricas },
  { name: 'Urológicas', id: 'urologicas', specialties: urologicas },
  { name: 'Odontológicas', id: 'odontologicas', specialties: odontologicas },
];

export const allShowcaseSpecialties: PublicSpecialty[] = specialtyCategories.flatMap(
  (cat) => cat.specialties
);

/**
 * Find a specialty by slug for the individual specialty page.
 */
export function getSpecialtyBySlug(slug: string): PublicSpecialty | undefined {
  return allShowcaseSpecialties.find((s) => s.slug === slug);
}

/**
 * Get all specialty slugs for static params generation.
 */
export function getAllSpecialtySlugs(): string[] {
  return allShowcaseSpecialties.map((s) => s.slug);
}
