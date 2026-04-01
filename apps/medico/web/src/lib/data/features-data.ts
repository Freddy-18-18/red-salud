// ============================================
// FEATURES DATA — 8 core features for landing & features page
// ============================================

export interface FeatureHighlight {
  iconName: string;
  title: string;
  description: string;
}

export interface SpecialtyExample {
  specialty: string;
  description: string;
}

export interface Feature {
  iconName: string;
  title: string;
  description: string;
}

export interface FeatureDetailed extends Feature {
  slug: string;
  tagline: string;
  longDescription: string;
  highlights: FeatureHighlight[];
  specialtyExamples: SpecialtyExample[];
  accentColor: string;
}

export const features: Feature[] = [
  {
    iconName: 'CalendarClock',
    title: 'Agenda Inteligente',
    description:
      'Gestión de citas con bloques de tiempo configurables por tipo de consulta. Sincronización con Google Calendar y notificaciones automáticas a pacientes.',
  },
  {
    iconName: 'Stethoscope',
    title: 'Consulta Digital',
    description:
      'Notas clínicas con formato SOAP adaptado a tu especialidad. Examen físico estructurado, diagnósticos ICD-11 y planes de tratamiento integrados.',
  },
  {
    iconName: 'Pill',
    title: 'Recetas Electrónicas',
    description:
      'Prescripciones con firma digital, plantillas por especialidad y verificación de interacciones medicamentosas. Imprimí o compartí digitalmente.',
  },
  {
    iconName: 'ClipboardList',
    title: 'Historia Clínica',
    description:
      'Expediente médico digital completo con timeline cronológico, documentos adjuntos, y acceso seguro desde cualquier dispositivo.',
  },
  {
    iconName: 'BrainCircuit',
    title: 'IA Diagnóstica',
    description:
      'Sugerencias inteligentes de códigos ICD-11 potenciadas por Gemini AI. Asistencia en diagnóstico diferencial basada en síntomas y signos clínicos.',
  },
  {
    iconName: 'Calendar',
    title: 'Integración Google Calendar',
    description:
      'Sincronización bidireccional con Google Calendar. Tus citas médicas y agenda personal en un solo lugar, siempre actualizadas.',
  },
  {
    iconName: 'BarChart3',
    title: 'Estadísticas por Especialidad',
    description:
      'KPIs y métricas específicas para tu área. Desde ECGs realizados en cardiología hasta espirometrías en neumología — datos que importan.',
  },
  {
    iconName: 'ShieldCheck',
    title: 'Verificación SACS',
    description:
      'Validación automática contra el Sistema Autónomo de Certificación Sanitaria de Venezuela. Tu registro profesional, siempre verificado.',
  },
];

// ============================================
// DETAILED FEATURES — Full content for /funcionalidades page
// ============================================

export const featuresDetailed: FeatureDetailed[] = [
  {
    slug: 'agenda',
    iconName: 'CalendarClock',
    title: 'Agenda Inteligente',
    tagline: 'Tu tiempo vale. Tu agenda lo sabe.',
    description:
      'Gestión de citas con bloques de tiempo configurables por tipo de consulta. Sincronización con Google Calendar y notificaciones automáticas a pacientes.',
    longDescription:
      'Olvidate de las agendas en papel y las llamadas perdidas. La Agenda Inteligente te da control total sobre tu disponibilidad, adaptándose a los ritmos reales de tu consulta. Configurá bloques de tiempo diferentes para primera consulta, control, urgencia o procedimiento — cada uno con su duración y precio. El sistema gestiona automáticamente los recordatorios a pacientes por WhatsApp o correo, reduciendo las inasistencias hasta en un 40%. Si manejás varios consultorios, la agenda se sincroniza en tiempo real entre todas tus ubicaciones, evitando solapamientos y mostrándole al paciente solo los horarios realmente disponibles. Además, la lista de espera inteligente llena automáticamente los huecos cuando un paciente cancela, maximizando tu productividad sin esfuerzo extra.',
    accentColor: 'teal',
    highlights: [
      {
        iconName: 'Clock',
        title: 'Bloques configurables',
        description:
          'Definí la duración y tipo de cada slot: primera vez, control, urgencia o procedimiento. Cada uno con su propio tiempo y tarifa.',
      },
      {
        iconName: 'Bell',
        title: 'Recordatorios automáticos',
        description:
          'Notificaciones por WhatsApp, correo y push a pacientes 24h y 1h antes. Reducí inasistencias sin levantar el teléfono.',
      },
      {
        iconName: 'MapPin',
        title: 'Multi-consultorio',
        description:
          'Manejá varias ubicaciones con agendas independientes. El paciente ve tu disponibilidad real por sede.',
      },
      {
        iconName: 'Users',
        title: 'Lista de espera',
        description:
          'Cuando un paciente cancela, el sistema ofrece el slot automáticamente al próximo en la lista. Cero huecos.',
      },
      {
        iconName: 'Repeat',
        title: 'Citas recurrentes',
        description:
          'Programá controles periódicos con un clic: semanal, quincenal, mensual. El paciente recibe la serie completa.',
      },
      {
        iconName: 'Lock',
        title: 'Bloqueo de horarios',
        description:
          'Marcá vacaciones, congresos o días personales. La agenda se ajusta sin afectar citas existentes.',
      },
    ],
    specialtyExamples: [
      {
        specialty: 'Odontología',
        description:
          'Bloques de 30min para limpiezas, 90min para endodoncias y 120min para cirugía oral — cada procedimiento con su tiempo exacto.',
      },
      {
        specialty: 'Psiquiatría',
        description:
          'Primera consulta de 60min, seguimiento de 30min. Citas recurrentes semanales o quincenales configuradas automáticamente.',
      },
      {
        specialty: 'Pediatría',
        description:
          'Slots de control de niño sano con esquema de vacunación integrado. Recordatorio automático del próximo control.',
      },
    ],
  },
  {
    slug: 'consulta',
    iconName: 'Stethoscope',
    title: 'Consulta Digital',
    tagline: 'Todo el flujo clínico en una sola pantalla.',
    description:
      'Notas clínicas con formato SOAP adaptado a tu especialidad. Examen físico estructurado, diagnósticos ICD-11 y planes de tratamiento integrados.',
    longDescription:
      'La consulta digital replantea cómo documentás tu práctica. En lugar de formularios genéricos, tenés un flujo SOAP que se adapta a tu especialidad: si sos cardiólogo, el examen físico incluye auscultación cardíaca y valoración de edema; si sos dermatólogo, campos para localización, morfología y distribución de lesiones. Todo en una interfaz limpia que no interrumpe tu conversación con el paciente. Los diagnósticos se codifican con ICD-11 con sugerencias inteligentes, las órdenes de laboratorio e imagenología se generan desde la misma pantalla, y la receta se vincula directamente al diagnóstico. Al cerrar la consulta, el resumen se genera automáticamente y queda disponible para el paciente en su portal.',
    accentColor: 'cyan',
    highlights: [
      {
        iconName: 'FileText',
        title: 'Notas SOAP adaptativas',
        description:
          'Cada especialidad tiene sus propios campos en el examen físico. Nada de formularios genéricos — solo lo que necesitás.',
      },
      {
        iconName: 'Search',
        title: 'Diagnóstico ICD-11',
        description:
          'Buscá y codificá diagnósticos con el estándar internacional más actual. Sugerencias inteligentes basadas en lo que escribís.',
      },
      {
        iconName: 'TestTube',
        title: 'Órdenes integradas',
        description:
          'Laboratorio, imagenología, interconsultas — todo desde la misma pantalla, vinculado al diagnóstico actual.',
      },
      {
        iconName: 'Heart',
        title: 'Signos vitales',
        description:
          'Registro de tensión arterial, frecuencia cardíaca, temperatura, saturación y más. Histórico visual con tendencias.',
      },
      {
        iconName: 'ListChecks',
        title: 'Plan de tratamiento',
        description:
          'Indicaciones, reposo, recomendaciones y seguimiento — todo documentado y compartible con el paciente.',
      },
      {
        iconName: 'Send',
        title: 'Resumen automático',
        description:
          'Al cerrar la consulta se genera un resumen legible para el paciente, disponible en su app.',
      },
    ],
    specialtyExamples: [
      {
        specialty: 'Cardiología',
        description:
          'Examen físico con auscultación por focos, valoración de pulsos periféricos, edema, ingurgitación yugular y clasificación NYHA.',
      },
      {
        specialty: 'Dermatología',
        description:
          'Registro de lesiones con localización corporal, morfología, color, distribución y evolución fotográfica.',
      },
      {
        specialty: 'Traumatología',
        description:
          'Examen por segmento corporal con rangos de movilidad, pruebas especiales y clasificación de fracturas.',
      },
    ],
  },
  {
    slug: 'recetas',
    iconName: 'Pill',
    title: 'Recetas Electrónicas',
    tagline: 'Prescribí con seguridad, firmá con confianza.',
    description:
      'Prescripciones con firma digital, plantillas por especialidad y verificación de interacciones medicamentosas. Imprimí o compartí digitalmente.',
    longDescription:
      'Las recetas electrónicas eliminan los errores de legibilidad y le dan trazabilidad completa a cada prescripción. Escribí el nombre del medicamento y el sistema completa automáticamente la presentación, concentración y vía de administración desde el vademécum venezolano actualizado. Antes de firmar, el motor de interacciones verifica que no haya contraindicaciones con los medicamentos actuales del paciente ni con sus alergias registradas. Tu firma digital queda vinculada al documento, cumpliendo con la normativa legal. Podés crear plantillas para las combinaciones que usás frecuentemente — un clic y la receta está lista. El paciente recibe la receta en PDF en su celular, puede presentarla en cualquier farmacia, y vos tenés el registro completo en su historia.',
    accentColor: 'violet',
    highlights: [
      {
        iconName: 'BookOpen',
        title: 'Vademécum integrado',
        description:
          'Autocompletado con el catálogo venezolano de medicamentos. Presentación, concentración y vía — todo correcto.',
      },
      {
        iconName: 'AlertTriangle',
        title: 'Verificación de interacciones',
        description:
          'Alerta automática si hay interacciones medicamentosas, contraindicaciones o alergias conocidas del paciente.',
      },
      {
        iconName: 'PenTool',
        title: 'Firma digital',
        description:
          'Tu firma electrónica vinculada a tu número SACS. Validez legal y trazabilidad completa.',
      },
      {
        iconName: 'Copy',
        title: 'Plantillas reutilizables',
        description:
          'Guardá las combinaciones que más prescribís. Un clic para generar la receta completa.',
      },
      {
        iconName: 'FileDown',
        title: 'Exportación PDF',
        description:
          'PDF con tu membrete, logo, firma y código QR de verificación. Imprimí o enviá directamente al paciente.',
      },
      {
        iconName: 'Shield',
        title: 'Trazabilidad completa',
        description:
          'Cada receta queda vinculada al paciente, la consulta y el diagnóstico. Historial completo de prescripciones.',
      },
    ],
    specialtyExamples: [
      {
        specialty: 'Medicina Interna',
        description:
          'Plantillas para manejo de hipertensión, diabetes tipo 2 y dislipidemia con ajuste de dosis por función renal.',
      },
      {
        specialty: 'Oftalmología',
        description:
          'Recetas con esquema de gotas por ojo (OD/OI/AO), frecuencia y duración. Plantillas post-quirúrgicas.',
      },
      {
        specialty: 'Pediatría',
        description:
          'Dosificación automática por peso del paciente. Alerta de medicamentos contraindicados por edad.',
      },
    ],
  },
  {
    slug: 'historia',
    iconName: 'ClipboardList',
    title: 'Historia Clínica',
    tagline: 'Cada dato del paciente, siempre accesible.',
    description:
      'Expediente médico digital completo con timeline cronológico, documentos adjuntos, y acceso seguro desde cualquier dispositivo.',
    longDescription:
      'La historia clínica digital es el corazón de Red Salud. Cada consulta, cada resultado de laboratorio, cada imagen diagnóstica, cada receta — todo queda registrado en un timeline cronológico que te da la película completa del paciente en segundos. Ya no necesitás pedir archivos, buscar carpetas o depender de lo que el paciente recuerda. Los documentos se adjuntan directamente (fotos, PDFs, resultados escaneados) y quedan organizados por categoría. Las alergias y antecedentes familiares están siempre visibles como banderas en la ficha, y la historia se puede compartir de forma segura con otro profesional para una interconsulta, con el consentimiento del paciente.',
    accentColor: 'blue',
    highlights: [
      {
        iconName: 'Clock',
        title: 'Timeline cronológico',
        description:
          'Toda la historia del paciente en orden temporal: consultas, labs, imágenes, recetas. Filtrá por tipo o fecha.',
      },
      {
        iconName: 'Paperclip',
        title: 'Documentos adjuntos',
        description:
          'Subí fotos, PDFs, resultados escaneados. Se categorizan automáticamente y quedan vinculados a la consulta.',
      },
      {
        iconName: 'AlertCircle',
        title: 'Alergias y alertas',
        description:
          'Alergias, condiciones crónicas y medicamentos actuales siempre visibles como banderas de seguridad.',
      },
      {
        iconName: 'GitBranch',
        title: 'Antecedentes familiares',
        description:
          'Árbol de antecedentes heredofamiliares con condiciones relevantes por línea materna y paterna.',
      },
      {
        iconName: 'Share2',
        title: 'Compartir seguro',
        description:
          'Compartí la historia con otro profesional para interconsulta. El paciente autoriza, vos controlás qué se comparte.',
      },
      {
        iconName: 'Smartphone',
        title: 'Acceso desde cualquier lugar',
        description:
          'Consultá la historia desde tu computadora, tablet o celular. Datos cifrados en tránsito y en reposo.',
      },
    ],
    specialtyExamples: [
      {
        specialty: 'Ginecología',
        description:
          'Historial obstétrico completo con gestas, partos, cesáreas, abortos. Control prenatal con curvas de crecimiento fetal.',
      },
      {
        specialty: 'Endocrinología',
        description:
          'Seguimiento longitudinal de HbA1c, perfil tiroideo, curvas de crecimiento. Gráficas de tendencia integradas.',
      },
      {
        specialty: 'Neurología',
        description:
          'Registro de examen neurológico detallado, escala de Glasgow, Mini-Mental y seguimiento de crisis epilépticas.',
      },
    ],
  },
  {
    slug: 'ia',
    iconName: 'BrainCircuit',
    title: 'IA Diagnóstica',
    tagline: 'Inteligencia artificial que acompaña, no reemplaza.',
    description:
      'Sugerencias inteligentes de códigos ICD-11 potenciadas por Gemini AI. Asistencia en diagnóstico diferencial basada en síntomas y signos clínicos.',
    longDescription:
      'La IA Diagnóstica es tu co-piloto clínico. Mientras documentás la consulta, el sistema analiza los síntomas, signos y hallazgos que vas registrando y sugiere en tiempo real los códigos ICD-11 más probables, ordenados por relevancia. No es un diagnóstico automático — es una herramienta que amplifica tu criterio clínico. Si tenés dudas sobre un diagnóstico diferencial, podés consultar al asistente con el cuadro clínico y obtener una lista priorizada de posibilidades con la evidencia que las sustenta. La IA también detecta patrones en tu base de pacientes: si varios pacientes presentan síntomas similares en la misma semana, te alerta de una posible tendencia epidemiológica. Todo esto potenciado por Gemini, el modelo más avanzado de Google, entrenado con literatura médica actualizada.',
    accentColor: 'purple',
    highlights: [
      {
        iconName: 'Zap',
        title: 'Sugerencias en tiempo real',
        description:
          'Mientras escribís, la IA sugiere códigos ICD-11 basados en los síntomas y signos que vas documentando.',
      },
      {
        iconName: 'GitCompare',
        title: 'Diagnóstico diferencial',
        description:
          'Consultá un cuadro clínico y obtené una lista priorizada de diagnósticos posibles con evidencia de respaldo.',
      },
      {
        iconName: 'TrendingUp',
        title: 'Alertas epidemiológicas',
        description:
          'Detección de patrones en tu base de pacientes. Si algo inusual emerge, te enterás primero.',
      },
      {
        iconName: 'BookOpen',
        title: 'Referencias actualizadas',
        description:
          'Cada sugerencia incluye referencias a guías clínicas y literatura médica para que verifiques por tu cuenta.',
      },
      {
        iconName: 'ShieldCheck',
        title: 'Privacidad ante todo',
        description:
          'Los datos clínicos se procesan de forma anónima. Ninguna información identificable sale de tu consultorio.',
      },
      {
        iconName: 'UserCheck',
        title: 'Vos decidís siempre',
        description:
          'La IA sugiere, vos confirmás. Cada diagnóstico lleva tu firma y tu criterio clínico, no el de un algoritmo.',
      },
    ],
    specialtyExamples: [
      {
        specialty: 'Medicina General',
        description:
          'Diagnóstico diferencial amplio para presentaciones comunes. Sugerencias de cuándo referir al especialista.',
      },
      {
        specialty: 'Reumatología',
        description:
          'Asistencia con criterios clasificatorios (ACR/EULAR) para artritis reumatoide, lupus y vasculitis.',
      },
      {
        specialty: 'Infectología',
        description:
          'Sugerencias de antibiograma empírico según foco infeccioso, resistencia local y guías nacionales.',
      },
    ],
  },
  {
    slug: 'google-calendar',
    iconName: 'Calendar',
    title: 'Google Calendar',
    tagline: 'Tu agenda médica y personal, siempre sincronizadas.',
    description:
      'Sincronización bidireccional con Google Calendar. Tus citas médicas y agenda personal en un solo lugar, siempre actualizadas.',
    longDescription:
      'La integración con Google Calendar elimina la doble agenda. Conectá tu cuenta de Google y cada cita que agendés en Red Salud aparece automáticamente en tu calendario personal — con el nombre del paciente, tipo de consulta y ubicación. En la otra dirección, cuando bloqueás tiempo en Google Calendar (un congreso, una reunión o tiempo personal), Red Salud lo detecta y desactiva esos horarios para que ningún paciente pueda agendar en ese momento. Si un paciente cancela o reprograma, el cambio se refleja instantáneamente en ambos calendarios. Cero conflictos, cero trabajo manual. Tu secretaria también puede gestionar la agenda desde Google Calendar si lo preferís, con los permisos que vos definas.',
    accentColor: 'orange',
    highlights: [
      {
        iconName: 'RefreshCw',
        title: 'Sincronización bidireccional',
        description:
          'Lo que pasa en Red Salud aparece en Google y viceversa. Cambios en tiempo real, sin delays.',
      },
      {
        iconName: 'Ban',
        title: 'Bloqueo automático',
        description:
          'Eventos personales en Google Calendar bloquean automáticamente esos horarios en tu agenda médica.',
      },
      {
        iconName: 'Smartphone',
        title: 'Notificaciones nativas',
        description:
          'Aprovechá las notificaciones de Google Calendar en tu celular. Sin instalar nada extra.',
      },
      {
        iconName: 'Users',
        title: 'Acceso para secretaria',
        description:
          'Tu secretaria puede ver y gestionar la agenda desde Google Calendar con permisos controlados.',
      },
      {
        iconName: 'Palette',
        title: 'Colores por tipo de cita',
        description:
          'Primera consulta, control, urgencia — cada tipo se muestra con un color diferente en Google Calendar.',
      },
      {
        iconName: 'Globe',
        title: 'Multi-zona horaria',
        description:
          'Si atendés pacientes internacionales por telemedicina, la hora se ajusta a la zona del paciente.',
      },
    ],
    specialtyExamples: [
      {
        specialty: 'Cirugía',
        description:
          'Bloques quirúrgicos de varias horas sincronizados con el quirófano. Pre y post operatorio como eventos separados.',
      },
      {
        specialty: 'Psicología',
        description:
          'Sesiones semanales recurrentes visibles en Google Calendar. Recordatorio discreto sin datos del paciente.',
      },
      {
        specialty: 'Medicina del Trabajo',
        description:
          'Agendá exámenes preempleo y periódicos por empresa. Bloques especiales para evaluaciones grupales.',
      },
    ],
  },
  {
    slug: 'estadisticas',
    iconName: 'BarChart3',
    title: 'Estadísticas por Especialidad',
    tagline: 'Datos que te dicen cómo va tu práctica de verdad.',
    description:
      'KPIs y métricas específicas para tu área. Desde ECGs realizados en cardiología hasta espirometrías en neumología — datos que importan.',
    longDescription:
      'Las estadísticas genéricas no sirven. Un cardiólogo necesita saber cuántos ECGs realizó este mes; un dermatólogo, cuántas biopsias envió. Red Salud genera dashboards con los KPIs que realmente importan para tu especialidad, actualizados en tiempo real. Más allá de las métricas clínicas, tenés visibilidad completa de tu productividad: pacientes atendidos vs agendados, inasistencias, tiempo promedio por consulta y distribución de diagnósticos. El módulo financiero te muestra ingresos por tipo de consulta, comparación mensual y proyección. Todo con gráficas claras que podés exportar para tu contador o para presentaciones en junta médica. Sin Excel, sin fórmulas — los datos se generan solos a partir de tu trabajo diario.',
    accentColor: 'sky',
    highlights: [
      {
        iconName: 'Activity',
        title: 'KPIs por especialidad',
        description:
          'Métricas clínicas específicas para tu área: procedimientos, diagnósticos frecuentes, tasas de seguimiento.',
      },
      {
        iconName: 'TrendingUp',
        title: 'Tendencias de pacientes',
        description:
          'Distribución por edad, sexo, motivo de consulta. Detectá cambios en tu perfil de pacientes.',
      },
      {
        iconName: 'DollarSign',
        title: 'Módulo financiero',
        description:
          'Ingresos por tipo de consulta, comparación mes a mes, proyección trimestral. Tu contador te lo va a agradecer.',
      },
      {
        iconName: 'Clock',
        title: 'Productividad',
        description:
          'Pacientes atendidos, inasistencias, tiempo promedio por consulta. Optimizá tu agenda con datos reales.',
      },
      {
        iconName: 'FileDown',
        title: 'Exportación de reportes',
        description:
          'Descargá reportes en PDF o CSV para tu contador, la clínica o presentaciones profesionales.',
      },
      {
        iconName: 'Target',
        title: 'Metas configurables',
        description:
          'Definí metas mensuales de pacientes, ingresos o procedimientos y seguí tu progreso en tiempo real.',
      },
    ],
    specialtyExamples: [
      {
        specialty: 'Cardiología',
        description:
          'ECGs realizados, ecocardiogramas solicitados, distribución de diagnósticos (HTA, ICC, arritmias) y tasa de referencia a hemodinamia.',
      },
      {
        specialty: 'Neumología',
        description:
          'Espirometrías realizadas, exacerbaciones de EPOC, pacientes en oxigenoterapia domiciliaria y adherencia al tratamiento.',
      },
      {
        specialty: 'Gastroenterología',
        description:
          'Endoscopías y colonoscopías realizadas, hallazgos por tipo, tasa de detección de pólipos y seguimiento de biopsias.',
      },
    ],
  },
  {
    slug: 'sacs',
    iconName: 'ShieldCheck',
    title: 'Verificación SACS',
    tagline: 'Tu credencial profesional, verificada y visible.',
    description:
      'Validación automática contra el Sistema Autónomo de Certificación Sanitaria de Venezuela. Tu registro profesional, siempre verificado.',
    longDescription:
      'En un ecosistema de salud digital, la confianza es fundamental. La verificación SACS conecta directamente con el registro del Sistema Autónomo de Certificación Sanitaria de Venezuela para validar tu matrícula profesional, especialidad y habilitación vigente. Una vez verificado, tu perfil muestra un badge que los pacientes reconocen como garantía de legitimidad. El proceso es automático: ingresás tu número de registro, el sistema consulta la base del SACS y en minutos tenés tu verificación activa. Si tu registro se renueva, Red Salud te notifica antes del vencimiento para que mantengas tu estatus. Para las clínicas y centros de salud, la verificación SACS de sus médicos es un diferenciador de calidad que genera confianza en los pacientes.',
    accentColor: 'emerald',
    highlights: [
      {
        iconName: 'CheckCircle',
        title: 'Validación automática',
        description:
          'Ingresá tu número SACS y el sistema verifica tu matrícula, especialidad y habilitación en minutos.',
      },
      {
        iconName: 'BadgeCheck',
        title: 'Badge de confianza',
        description:
          'Tu perfil muestra un badge verificado que los pacientes reconocen como garantía profesional.',
      },
      {
        iconName: 'RefreshCw',
        title: 'Renovación proactiva',
        description:
          'Te notificamos antes del vencimiento de tu registro para que nunca pierdas tu estatus verificado.',
      },
      {
        iconName: 'Building2',
        title: 'Verificación institucional',
        description:
          'Las clínicas pueden verificar a todos sus médicos desde un panel centralizado. Cumplimiento normativo simple.',
      },
      {
        iconName: 'QrCode',
        title: 'Código QR verificable',
        description:
          'Generá un QR que cualquiera puede escanear para confirmar tu registro profesional en tiempo real.',
      },
      {
        iconName: 'Lock',
        title: 'Datos protegidos',
        description:
          'Solo se muestra la información pública de tu registro. Tus datos personales permanecen privados.',
      },
    ],
    specialtyExamples: [
      {
        specialty: 'Cualquier especialidad',
        description:
          'Verificación de título médico base y de cada especialidad registrada ante el SACS. Múltiples especialidades soportadas.',
      },
      {
        specialty: 'Cirugía Plástica',
        description:
          'Verificación crítica en un área con alto intrusismo. El badge SACS diferencia al especialista certificado.',
      },
      {
        specialty: 'Medicina Estética',
        description:
          'Validación de que el profesional tiene la formación requerida para realizar procedimientos estéticos.',
      },
    ],
  },
];

// ============================================
// COMPARISON TABLE — Red Salud vs alternatives
// ============================================

export interface ComparisonRow {
  feature: string;
  redSalud: boolean;
  excel: boolean;
  papel: boolean;
}

export const comparisonData: ComparisonRow[] = [
  { feature: 'Agenda con recordatorios automáticos', redSalud: true, excel: false, papel: false },
  { feature: 'Consultas con formato SOAP por especialidad', redSalud: true, excel: false, papel: false },
  { feature: 'Recetas con firma digital y verificación', redSalud: true, excel: false, papel: false },
  { feature: 'Historia clínica con timeline cronológico', redSalud: true, excel: false, papel: false },
  { feature: 'Asistencia de IA para diagnóstico', redSalud: true, excel: false, papel: false },
  { feature: 'Sincronización con Google Calendar', redSalud: true, excel: false, papel: false },
  { feature: 'Estadísticas y KPIs automáticos', redSalud: true, excel: true, papel: false },
  { feature: 'Verificación profesional SACS', redSalud: true, excel: false, papel: false },
  { feature: 'Acceso desde cualquier dispositivo', redSalud: true, excel: true, papel: false },
  { feature: 'Respaldo automático en la nube', redSalud: true, excel: false, papel: false },
  { feature: 'Cumplimiento de normativa sanitaria', redSalud: true, excel: false, papel: false },
  { feature: 'Cero configuración técnica', redSalud: true, excel: false, papel: true },
];
