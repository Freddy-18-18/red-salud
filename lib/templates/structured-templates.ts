// Templates estructurados para el editor estructurado

export interface StructuredTemplateField {
  id: string;
  label: string;
  type: 'textarea' | 'input' | 'vitals' | 'medications';
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export interface StructuredTemplate {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'especialidad' | 'emergencia' | 'control';
  icon: string;
  color: string;
  fields: StructuredTemplateField[];
  author: 'red-salud' | 'community';
  tags: string[];
}

export const STRUCTURED_TEMPLATES: StructuredTemplate[] = [
  {
    id: 'consulta_general_estructurado',
    name: 'Consulta General Completa',
    description: 'Formato SOAP completo con todos los campos',
    category: 'general',
    icon: 'Stethoscope',
    color: 'blue',
    author: 'red-salud',
    tags: ['soap', 'completo', 'general'],
    fields: [
      {
        id: 'motivoConsulta',
        label: 'MOTIVO DE CONSULTA',
        type: 'textarea',
        placeholder: 'Describa el motivo principal de la consulta...',
        required: true,
        rows: 2,
      },
      {
        id: 'historiaEnfermedad',
        label: 'HISTORIA DE LA ENFERMEDAD ACTUAL',
        type: 'textarea',
        placeholder: 'Describa la evolución de los síntomas, tiempo de evolución, características...',
        required: true,
        rows: 4,
      },
      {
        id: 'antecedentesPersonales',
        label: 'ANTECEDENTES PERSONALES',
        type: 'textarea',
        placeholder: 'Enfermedades previas, cirugías, hospitalizaciones...',
        required: false,
        rows: 3,
      },
      {
        id: 'antecedentesFamiliares',
        label: 'ANTECEDENTES FAMILIARES',
        type: 'textarea',
        placeholder: 'Enfermedades hereditarias, familiares con condiciones relevantes...',
        required: false,
        rows: 2,
      },
      {
        id: 'habitosPsicobiologicos',
        label: 'HÁBITOS PSICOBIOLÓGICOS',
        type: 'textarea',
        placeholder: 'Tabaquismo, alcohol, drogas, ejercicio, dieta...',
        required: false,
        rows: 2,
      },
      {
        id: 'revisionSistemas',
        label: 'REVISIÓN POR SISTEMAS',
        type: 'textarea',
        placeholder: 'Cardiovascular, respiratorio, digestivo, genitourinario, neurológico...',
        required: false,
        rows: 3,
      },
      {
        id: 'vitals',
        label: 'SIGNOS VITALES',
        type: 'vitals',
        required: true,
      },
      {
        id: 'examenFisico',
        label: 'EXAMEN FÍSICO GENERAL',
        type: 'textarea',
        placeholder: 'Estado general, constitución, hidratación, coloración...',
        required: false,
        rows: 2,
      },
      {
        id: 'examenSegmentario',
        label: 'EXAMEN FÍSICO SEGMENTARIO',
        type: 'textarea',
        placeholder: 'Cabeza y cuello, tórax, abdomen, extremidades, neurológico...',
        required: false,
        rows: 4,
      },
      {
        id: 'impresionDiagnostica',
        label: 'IMPRESIÓN DIAGNÓSTICA',
        type: 'textarea',
        placeholder: 'Diagnóstico o impresión clínica...',
        required: true,
        rows: 2,
      },
      {
        id: 'medications',
        label: 'PLAN DE TRATAMIENTO - MEDICAMENTOS',
        type: 'medications',
        required: false,
      },
      {
        id: 'planTratamiento',
        label: 'PLAN DE TRATAMIENTO - OTRAS MEDIDAS',
        type: 'textarea',
        placeholder: '1. Exámenes complementarios\n2. Medidas no farmacológicas\n3. Interconsultas',
        required: false,
        rows: 4,
      },
      {
        id: 'indicaciones',
        label: 'INDICACIONES AL PACIENTE',
        type: 'textarea',
        placeholder: 'Instrucciones claras para el paciente...',
        required: false,
        rows: 3,
      },
      {
        id: 'signosAlarma',
        label: 'SIGNOS DE ALARMA',
        type: 'textarea',
        placeholder: 'Síntomas por los cuales debe acudir a emergencia...',
        required: false,
        rows: 2,
      },
      {
        id: 'control',
        label: 'CONTROL',
        type: 'input',
        placeholder: 'Ej: Control en 7 días, Control en 1 mes',
        required: false,
      },
    ],
  },
  {
    id: 'control_estructurado',
    name: 'Control de Enfermedad Crónica',
    description: 'Seguimiento de paciente con enfermedad crónica',
    category: 'control',
    icon: 'Activity',
    color: 'green',
    author: 'red-salud',
    tags: ['control', 'crónico', 'seguimiento'],
    fields: [
      {
        id: 'motivoConsulta',
        label: 'MOTIVO DE CONSULTA',
        type: 'input',
        placeholder: 'Control de enfermedad crónica',
        required: true,
      },
      {
        id: 'evolucion',
        label: 'EVOLUCIÓN DESDE ÚLTIMA CONSULTA',
        type: 'textarea',
        placeholder: 'Cómo ha estado el paciente, adherencia al tratamiento, síntomas...',
        required: true,
        rows: 3,
      },
      {
        id: 'vitals',
        label: 'SIGNOS VITALES',
        type: 'vitals',
        required: true,
      },
      {
        id: 'laboratorios',
        label: 'LABORATORIOS RECIENTES',
        type: 'textarea',
        placeholder: 'Resultados de exámenes de laboratorio...',
        required: false,
        rows: 3,
      },
      {
        id: 'impresionDiagnostica',
        label: 'IMPRESIÓN DIAGNÓSTICA',
        type: 'textarea',
        placeholder: 'Estado actual de la enfermedad...',
        required: true,
        rows: 2,
      },
      {
        id: 'medications',
        label: 'AJUSTE DE MEDICAMENTOS',
        type: 'medications',
        required: false,
      },
      {
        id: 'planTratamiento',
        label: 'PLAN',
        type: 'textarea',
        placeholder: '1. Continuar tratamiento actual\n2. Ajustes necesarios\n3. Nuevas indicaciones',
        required: false,
        rows: 3,
      },
      {
        id: 'control',
        label: 'PRÓXIMO CONTROL',
        type: 'input',
        placeholder: 'Ej: Control en 3 meses',
        required: true,
      },
    ],
  },
  {
    id: 'emergencia_estructurado',
    name: 'Atención de Emergencia',
    description: 'Evaluación rápida para atención urgente',
    category: 'emergencia',
    icon: 'AlertCircle',
    color: 'red',
    author: 'red-salud',
    tags: ['emergencia', 'urgente', 'glasgow'],
    fields: [
      {
        id: 'motivoConsulta',
        label: 'MOTIVO DE CONSULTA',
        type: 'textarea',
        placeholder: 'Motivo de la emergencia...',
        required: true,
        rows: 2,
      },
      {
        id: 'tiempoEvolucion',
        label: 'TIEMPO DE EVOLUCIÓN',
        type: 'input',
        placeholder: 'Ej: 2 horas, 1 día',
        required: true,
      },
      {
        id: 'sintomasPrincipales',
        label: 'SÍNTOMAS PRINCIPALES',
        type: 'textarea',
        placeholder: 'Descripción detallada de los síntomas...',
        required: true,
        rows: 3,
      },
      {
        id: 'vitals',
        label: 'SIGNOS VITALES',
        type: 'vitals',
        required: true,
      },
      {
        id: 'glasgow',
        label: 'ESCALA DE GLASGOW',
        type: 'input',
        placeholder: 'Ej: 15/15',
        required: false,
      },
      {
        id: 'examenFisico',
        label: 'EXAMEN FÍSICO',
        type: 'textarea',
        placeholder: 'Estado general y hallazgos relevantes...',
        required: true,
        rows: 3,
      },
      {
        id: 'impresionDiagnostica',
        label: 'IMPRESIÓN DIAGNÓSTICA',
        type: 'textarea',
        placeholder: 'Diagnóstico de emergencia...',
        required: true,
        rows: 2,
      },
      {
        id: 'medications',
        label: 'TRATAMIENTO INMEDIATO',
        type: 'medications',
        required: false,
      },
      {
        id: 'conducta',
        label: 'CONDUCTA',
        type: 'textarea',
        placeholder: '1. Medidas inmediatas\n2. Exámenes urgentes\n3. Disposición (alta, observación, hospitalización)',
        required: true,
        rows: 4,
      },
    ],
  },
  {
    id: 'pediatria_estructurado',
    name: 'Consulta Pediátrica',
    description: 'Evaluación pediátrica con desarrollo psicomotor',
    category: 'especialidad',
    icon: 'Baby',
    color: 'purple',
    author: 'red-salud',
    tags: ['pediatría', 'niños', 'desarrollo'],
    fields: [
      {
        id: 'motivoConsulta',
        label: 'MOTIVO DE CONSULTA',
        type: 'textarea',
        placeholder: 'Motivo de la consulta pediátrica...',
        required: true,
        rows: 2,
      },
      {
        id: 'edad',
        label: 'EDAD',
        type: 'input',
        placeholder: 'Ej: 2 años 6 meses',
        required: true,
      },
      {
        id: 'antecedentesPrenatales',
        label: 'ANTECEDENTES PRENATALES Y PERINATALES',
        type: 'textarea',
        placeholder: 'Embarazo, parto, peso al nacer, complicaciones...',
        required: false,
        rows: 2,
      },
      {
        id: 'desarrolloPsicomotor',
        label: 'DESARROLLO PSICOMOTOR',
        type: 'textarea',
        placeholder: 'Hitos del desarrollo alcanzados...',
        required: false,
        rows: 2,
      },
      {
        id: 'vacunacion',
        label: 'VACUNACIÓN',
        type: 'textarea',
        placeholder: 'Estado de vacunación según esquema...',
        required: false,
        rows: 2,
      },
      {
        id: 'alimentacion',
        label: 'ALIMENTACIÓN',
        type: 'textarea',
        placeholder: 'Tipo de alimentación, lactancia, ablactación...',
        required: false,
        rows: 2,
      },
      {
        id: 'vitals',
        label: 'SIGNOS VITALES Y ANTROPOMETRÍA',
        type: 'vitals',
        required: true,
      },
      {
        id: 'examenFisico',
        label: 'EXAMEN FÍSICO',
        type: 'textarea',
        placeholder: 'Examen físico pediátrico completo...',
        required: true,
        rows: 3,
      },
      {
        id: 'impresionDiagnostica',
        label: 'IMPRESIÓN DIAGNÓSTICA',
        type: 'textarea',
        placeholder: 'Diagnóstico pediátrico...',
        required: true,
        rows: 2,
      },
      {
        id: 'medications',
        label: 'TRATAMIENTO',
        type: 'medications',
        required: false,
      },
      {
        id: 'indicacionesPadres',
        label: 'INDICACIONES A LOS PADRES',
        type: 'textarea',
        placeholder: 'Instrucciones claras para los padres o cuidadores...',
        required: false,
        rows: 3,
      },
      {
        id: 'control',
        label: 'CONTROL',
        type: 'input',
        placeholder: 'Ej: Control en 1 semana',
        required: false,
      },
    ],
  },
];

// Templates simples para nota libre
export const FREE_TEXT_TEMPLATES = [
  {
    id: 'blank',
    name: 'En Blanco',
    description: 'Comenzar desde cero',
    content: '',
  },
  {
    id: 'soap_simple',
    name: 'SOAP Simple',
    description: 'Formato SOAP básico',
    content: `SUBJETIVO:
[Escriba aquí]

OBJETIVO:
[Escriba aquí]

ANÁLISIS:
[Escriba aquí]

PLAN:
[Escriba aquí]`,
  },
  {
    id: 'nota_evolucion',
    name: 'Nota de Evolución',
    description: 'Nota de seguimiento hospitalario',
    content: `EVOLUCIÓN:
[Escriba aquí]

EXAMEN FÍSICO:
[Escriba aquí]

PLAN:
[Escriba aquí]`,
  },
];
