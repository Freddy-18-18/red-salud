// Templates estructurados para el editor estructurado

export interface StructuredTemplateField {
  id: string;
  label: string;
  type: 'textarea' | 'input' | 'vitals' | 'medications' | 'select' | 'checkbox' | 'radio' | 'header' | 'info' | 'date' | 'number';
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: string[]; // Para select, radio, checkbox
  defaultValue?: string;
  width?: 'full' | 'half' | 'third';      // Control de layout
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  helpText?: string; // Tooltip o texto de ayuda
}

export interface StructuredTemplate {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'especialidad' | 'emergencia' | 'control' | 'quirurgico' | 'ginecologia' | 'pediatria' | 'psiquiatria' | 'dermatologia' | 'oftalmologia' | 'otorrino' | 'traumatologia' | 'cardiologia' | 'neurologia' | 'custom';
  icon: string;
  color: string;
  fields: StructuredTemplateField[];
  author: 'red-salud' | 'community' | 'custom';
  tags: string[];
  specialty?: string;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
}

// Los templates ahora están en extended-templates.ts
// Este archivo mantiene solo las interfaces y tipos
export const STRUCTURED_TEMPLATES: StructuredTemplate[] = [];

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
