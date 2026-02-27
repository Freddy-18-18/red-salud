// Sistema de templates médicos para RED-SALUD

export interface MedicalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'especialidad' | 'emergencia' | 'control' | 'comunidad';
  icon: string;
  color: string;
  content: string;
  author: 'red-salud' | 'community';
  authorName?: string;
  isFavorite?: boolean;
  usageCount?: number;
  tags: string[];
  aiEnabled?: boolean; // Si tiene autocompletado IA habilitado
}

export const OFFICIAL_TEMPLATES: MedicalTemplate[] = [
  {
    id: 'blank',
    name: 'En Blanco',
    description: 'Comenzar desde cero',
    category: 'general',
    icon: 'FileText',
    color: 'gray',
    content: '',
    author: 'red-salud',
    tags: ['básico'],
  },
  {
    id: 'consulta_general',
    name: 'Consulta General',
    description: 'Formato SOAP completo para consulta ambulatoria',
    category: 'general',
    icon: 'Stethoscope',
    color: 'blue',
    author: 'red-salud',
    tags: ['soap', 'ambulatorio', 'general'],
    aiEnabled: true,
    content: `MOTIVO DE CONSULTA:
[Escriba aquí]

HISTORIA DE LA ENFERMEDAD ACTUAL:
[Escriba aquí]

ANTECEDENTES PERSONALES:
[Escriba aquí]

EXAMEN FÍSICO:
- Signos Vitales:
  - PA: [___] mmHg
  - FC: [___] lpm
  - FR: [___] rpm
  - Temp: [___] °C
  - Sat O2: [___] %

IMPRESIÓN DIAGNÓSTICA:
[Escriba aquí]

PLAN DE TRATAMIENTO:
1. [Escriba aquí]
2. [Escriba aquí]
3. [Escriba aquí]

INDICACIONES:
[Escriba aquí]

CONTROL:
[Escriba aquí]`,
  },
  {
    id: 'control',
    name: 'Control',
    description: 'Seguimiento de paciente con enfermedad crónica',
    category: 'control',
    icon: 'Activity',
    color: 'green',
    author: 'red-salud',
    tags: ['control', 'crónico', 'seguimiento'],
    aiEnabled: true,
    content: `MOTIVO DE CONSULTA:
Control de enfermedad crónica

EVOLUCIÓN:
[Escriba aquí]

EXAMEN FÍSICO:
- Signos Vitales:
  - PA: [___] mmHg
  - FC: [___] lpm
  - Peso: [___] kg

LABORATORIOS RECIENTES:
[Escriba aquí]

IMPRESIÓN DIAGNÓSTICA:
[Escriba aquí]

PLAN:
1. Continuar tratamiento actual
2. [Escriba aquí]
3. [Escriba aquí]

PRÓXIMO CONTROL:
[Escriba aquí]`,
  },
  {
    id: 'emergencia',
    name: 'Emergencia',
    description: 'Atención urgente con evaluación rápida',
    category: 'emergencia',
    icon: 'AlertCircle',
    color: 'red',
    author: 'red-salud',
    tags: ['emergencia', 'urgente', 'glasgow'],
    aiEnabled: true,
    content: `MOTIVO DE CONSULTA:
[Escriba aquí]

TIEMPO DE EVOLUCIÓN:
[Escriba aquí]

SÍNTOMAS PRINCIPALES:
[Escriba aquí]

EXAMEN FÍSICO:
- Estado General: [Escriba aquí]
- Signos Vitales:
  - PA: [___] mmHg
  - FC: [___] lpm
  - FR: [___] rpm
  - Temp: [___] °C
  - Sat O2: [___] %
  - Glasgow: [___]/15

IMPRESIÓN DIAGNÓSTICA:
[Escriba aquí]

CONDUCTA:
1. [Escriba aquí]
2. [Escriba aquí]
3. [Escriba aquí]

OBSERVACIONES:
[Escriba aquí]`,
  },
  {
    id: 'pediatria',
    name: 'Pediatría',
    description: 'Consulta pediátrica con desarrollo psicomotor',
    category: 'especialidad',
    icon: 'Baby',
    color: 'purple',
    author: 'red-salud',
    tags: ['pediatría', 'niños', 'desarrollo'],
    aiEnabled: true,
    content: `MOTIVO DE CONSULTA:
[Escriba aquí]

EDAD: [___] años [___] meses

ANTECEDENTES PERINATALES:
[Escriba aquí]

DESARROLLO PSICOMOTOR:
[Escriba aquí]

VACUNACIÓN:
[Escriba aquí]

EXAMEN FÍSICO:
- Peso: [___] kg (P[___])
- Talla: [___] cm (P[___])
- PC: [___] cm (P[___])
- Signos Vitales:
  - FC: [___] lpm
  - FR: [___] rpm
  - Temp: [___] °C

IMPRESIÓN DIAGNÓSTICA:
[Escriba aquí]

PLAN:
1. [Escriba aquí]
2. [Escriba aquí]

INDICACIONES A LOS PADRES:
[Escriba aquí]`,
  },
  {
    id: 'prenatal',
    name: 'Control Prenatal',
    description: 'Seguimiento de embarazo',
    category: 'especialidad',
    icon: 'Heart',
    color: 'pink',
    author: 'red-salud',
    tags: ['prenatal', 'embarazo', 'obstetricia'],
    aiEnabled: true,
    content: `CONTROL PRENATAL

EDAD GESTACIONAL: [___] semanas

ANTECEDENTES OBSTÉTRICOS:
- G: [___] P: [___] A: [___] C: [___]

SÍNTOMAS ACTUALES:
[Escriba aquí]

EXAMEN FÍSICO:
- Peso: [___] kg (Ganancia: [___] kg)
- PA: [___] mmHg
- Altura Uterina: [___] cm
- FCF: [___] lpm
- Presentación: [Escriba aquí]
- Movimientos Fetales: [Escriba aquí]

LABORATORIOS:
[Escriba aquí]

IMPRESIÓN:
[Escriba aquí]

PLAN:
1. [Escriba aquí]
2. [Escriba aquí]

PRÓXIMO CONTROL:
[Escriba aquí]`,
  },
  {
    id: 'postoperatorio',
    name: 'Postoperatorio',
    description: 'Evolución post-cirugía',
    category: 'especialidad',
    icon: 'Scissors',
    color: 'orange',
    author: 'red-salud',
    tags: ['cirugía', 'postoperatorio', 'herida'],
    aiEnabled: true,
    content: `NOTA POSTOPERATORIA

PROCEDIMIENTO REALIZADO:
[Escriba aquí]

FECHA DE CIRUGÍA: [___]

EVOLUCIÓN POSTOPERATORIA:
- Día postoperatorio: [___]
- Estado general: [Escriba aquí]
- Dolor: [___]/10

EXAMEN FÍSICO:
- Signos Vitales:
  - PA: [___] mmHg
  - FC: [___] lpm
  - Temp: [___] °C
- Herida quirúrgica: [Escriba aquí]
- Drenajes: [Escriba aquí]

LABORATORIOS:
[Escriba aquí]

PLAN:
1. [Escriba aquí]
2. [Escriba aquí]

ALTA: [Sí/No]`,
  },
];

// Función para obtener templates favoritos del usuario
export function getFavoriteTemplates(userId: string): string[] {
  if (typeof window === 'undefined') return [];
  const favorites = localStorage.getItem(`favorites_${userId}`);
  return favorites ? JSON.parse(favorites) : [];
}

// Función para marcar/desmarcar favorito
export function toggleFavorite(userId: string, templateId: string): void {
  const favorites = getFavoriteTemplates(userId);
  const index = favorites.indexOf(templateId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(templateId);
  }
  
  localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
}

// Función para obtener templates de la comunidad (simulado - en producción vendría de Supabase)
export function getCommunityTemplates(): MedicalTemplate[] {
  // En producción, esto vendría de Supabase
  return [];
}

// Función para guardar template personalizado
export async function saveCustomTemplate(
  userId: string,
  template: Omit<MedicalTemplate, 'id' | 'author' | 'authorName'>
): Promise<MedicalTemplate> {
  // En producción, guardar en Supabase
  const newTemplate: MedicalTemplate = {
    ...template,
    id: `custom_${Date.now()}`,
    author: 'community',
    authorName: 'Usuario',
  };
  
  return newTemplate;
}
