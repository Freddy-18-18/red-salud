'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  Pill,
  ClipboardList,
  Calendar,
  Users,
  MessageCircle,
  Video,
  BarChart3,
  Activity,
  Monitor,
  Zap,
  Heart,
  Brain,
  Eye,
  Baby,
  Bone,
  Scissors,
  Fingerprint,
  Shield,
  Dumbbell,
  Lock,
} from 'lucide-react';
import { getSpecialtyTheme } from '@/lib/specialty-theme';
import type { SpecialtyOption } from './specialty-selector';

// ============================================================================
// ICON MAP
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  Pill,
  ClipboardList,
  Calendar,
  Users,
  MessageCircle,
  Video,
  BarChart3,
  Activity,
  Monitor,
  Zap,
  Heart,
  Brain,
  Eye,
  Baby,
  Bone,
  Scissors,
  Fingerprint,
  Shield,
  Dumbbell,
};

// ============================================================================
// MODULE DEFINITIONS
// ============================================================================

export interface ModuleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  group: 'core' | 'clinical' | 'financial' | 'lab' | 'technology' | 'communication' | 'growth';
  isCore: boolean; // Core modules are always ON
}

/** Modulos base disponibles para TODAS las especialidades */
const CORE_MODULES: ModuleOption[] = [
  {
    id: 'agenda',
    name: 'Agenda',
    description: 'Gestion de citas y horarios de atencion',
    icon: 'Calendar',
    group: 'core',
    isCore: true,
  },
  {
    id: 'pacientes',
    name: 'Pacientes',
    description: 'Directorio y fichas de pacientes',
    icon: 'Users',
    group: 'core',
    isCore: true,
  },
  {
    id: 'consulta',
    name: 'Consulta',
    description: 'Notas clinicas SOAP y examen fisico',
    icon: 'Stethoscope',
    group: 'core',
    isCore: true,
  },
  {
    id: 'recetas',
    name: 'Recetas',
    description: 'Prescripciones medicas con firma digital',
    icon: 'Pill',
    group: 'core',
    isCore: true,
  },
];

/** Modulos comunes disponibles para muchas especialidades */
const COMMON_MODULES: ModuleOption[] = [
  {
    id: 'historia-clinica',
    name: 'Historia Clinica',
    description: 'Historial medico completo del paciente',
    icon: 'ClipboardList',
    group: 'clinical',
    isCore: false,
  },
  {
    id: 'telemedicina',
    name: 'Telemedicina',
    description: 'Consultas por videollamada',
    icon: 'Video',
    group: 'communication',
    isCore: false,
  },
  {
    id: 'mensajeria',
    name: 'Mensajeria',
    description: 'Comunicacion segura con pacientes',
    icon: 'MessageCircle',
    group: 'communication',
    isCore: false,
  },
  {
    id: 'estadisticas',
    name: 'Estadisticas',
    description: 'Analitica y KPIs de tu practica medica',
    icon: 'BarChart3',
    group: 'growth',
    isCore: false,
  },
];

/**
 * Modulos especificos por slug de especialidad.
 * Los slugs coinciden con la tabla `specialties`.
 */
const SPECIALTY_MODULES: Record<string, ModuleOption[]> = {
  // ── Odontologia ──
  odontologia: [
    { id: 'periodontograma', name: 'Periodontograma', description: 'Evaluacion periodontal completa', icon: 'ClipboardList', group: 'clinical', isCore: false },
    { id: 'dental-imaging', name: 'Imagenes Dentales IA', description: 'Analisis de radiografias con inteligencia artificial', icon: 'Eye', group: 'technology', isCore: false },
    { id: 'planes-tratamiento', name: 'Planes de Tratamiento', description: 'Presupuestos y planes de trabajo dental', icon: 'ClipboardList', group: 'financial', isCore: false },
    { id: 'rcm-dental', name: 'RCM Dental', description: 'Revenue Cycle Management para consultorio dental', icon: 'BarChart3', group: 'financial', isCore: false },
    { id: 'lab-dental', name: 'Laboratorio Dental', description: 'Seguimiento de trabajos de laboratorio', icon: 'Shield', group: 'lab', isCore: false },
    { id: 'modelos-3d', name: 'Modelos 3D', description: 'Visualizacion de modelos dentales tridimensionales', icon: 'Monitor', group: 'technology', isCore: false },
    { id: 'teledentologia', name: 'Teledentologia', description: 'Consultas dentales remotas', icon: 'Video', group: 'communication', isCore: false },
    { id: 'inventario-dental', name: 'Inventario', description: 'Control de materiales e insumos dentales', icon: 'Shield', group: 'lab', isCore: false },
  ],
  'odontologia-general': [
    { id: 'periodontograma', name: 'Periodontograma', description: 'Evaluacion periodontal completa', icon: 'ClipboardList', group: 'clinical', isCore: false },
    { id: 'dental-imaging', name: 'Imagenes Dentales IA', description: 'Analisis de radiografias con inteligencia artificial', icon: 'Eye', group: 'technology', isCore: false },
    { id: 'planes-tratamiento', name: 'Planes de Tratamiento', description: 'Presupuestos y planes de trabajo dental', icon: 'ClipboardList', group: 'financial', isCore: false },
    { id: 'rcm-dental', name: 'RCM Dental', description: 'Revenue Cycle Management para consultorio dental', icon: 'BarChart3', group: 'financial', isCore: false },
    { id: 'lab-dental', name: 'Laboratorio Dental', description: 'Seguimiento de trabajos de laboratorio', icon: 'Shield', group: 'lab', isCore: false },
  ],

  // ── Cardiologia ──
  cardiologia: [
    { id: 'ecg', name: 'Electrocardiograma', description: 'Registro e interpretacion de ECG', icon: 'Activity', group: 'clinical', isCore: false },
    { id: 'ecocardiograma', name: 'Ecocardiograma', description: 'Eco transtoracico y transesofagico', icon: 'Monitor', group: 'clinical', isCore: false },
    { id: 'prueba-esfuerzo', name: 'Prueba de Esfuerzo', description: 'Ergometria y evaluacion funcional', icon: 'Zap', group: 'clinical', isCore: false },
    { id: 'holter', name: 'Holter', description: 'Monitoreo ambulatorio de ritmo cardiaco', icon: 'Activity', group: 'clinical', isCore: false },
    { id: 'mapa', name: 'MAPA', description: 'Monitoreo ambulatorio de presion arterial', icon: 'BarChart3', group: 'clinical', isCore: false },
    { id: 'rehabilitacion-cardiaca', name: 'Rehabilitacion Cardiaca', description: 'Programa de rehabilitacion post-evento', icon: 'Dumbbell', group: 'clinical', isCore: false },
  ],

  // ── Pediatria ──
  pediatria: [
    { id: 'curvas-crecimiento', name: 'Curvas de Crecimiento', description: 'Control de peso, talla y perimetro cefalico', icon: 'BarChart3', group: 'clinical', isCore: false },
    { id: 'vacunacion', name: 'Vacunacion', description: 'Esquema de vacunacion y recordatorios', icon: 'Shield', group: 'clinical', isCore: false },
    { id: 'neurodesarrollo', name: 'Neurodesarrollo', description: 'Evaluacion del desarrollo psicomotor', icon: 'Brain', group: 'clinical', isCore: false },
    { id: 'nutricion-pediatrica', name: 'Nutricion Pediatrica', description: 'Evaluacion nutricional y planes alimenticios', icon: 'Heart', group: 'clinical', isCore: false },
    { id: 'nino-sano', name: 'Control Nino Sano', description: 'Consultas de control segun edad', icon: 'Baby', group: 'clinical', isCore: false },
  ],

  // ── Ginecologia ──
  ginecologia: [
    { id: 'control-prenatal', name: 'Control Prenatal', description: 'Seguimiento del embarazo por trimestres', icon: 'Baby', group: 'clinical', isCore: false },
    { id: 'ecografia-obstetrica', name: 'Ecografia Obstetrica', description: 'Eco obstetrico con mediciones fetales', icon: 'Monitor', group: 'clinical', isCore: false },
    { id: 'colposcopia', name: 'Colposcopia', description: 'Examen colposcopico con registro fotografico', icon: 'Eye', group: 'clinical', isCore: false },
    { id: 'planificacion-familiar', name: 'Planificacion Familiar', description: 'Anticoncepcion y consejeria reproductiva', icon: 'Heart', group: 'clinical', isCore: false },
    { id: 'fertilidad', name: 'Fertilidad', description: 'Estudio y tratamiento de infertilidad', icon: 'Heart', group: 'clinical', isCore: false },
  ],

  // ── Neurologia ──
  neurologia: [
    { id: 'eeg', name: 'Electroencefalograma', description: 'Registro e interpretacion de EEG', icon: 'Brain', group: 'clinical', isCore: false },
    { id: 'emg', name: 'Electromiografia', description: 'Estudio de conduccion nerviosa y EMG', icon: 'Activity', group: 'clinical', isCore: false },
    { id: 'evaluacion-cognitiva', name: 'Evaluacion Cognitiva', description: 'Tests neuropsicologicos y seguimiento', icon: 'Brain', group: 'clinical', isCore: false },
    { id: 'cefaleas', name: 'Diario de Cefaleas', description: 'Registro y seguimiento de migranas y cefaleas', icon: 'Brain', group: 'clinical', isCore: false },
    { id: 'epilepsia', name: 'Control de Epilepsia', description: 'Diario de crisis y ajuste de medicacion', icon: 'Zap', group: 'clinical', isCore: false },
  ],

  // ── Traumatologia ──
  traumatologia: [
    { id: 'fracturas', name: 'Registro de Fracturas', description: 'Documentacion y seguimiento de fracturas', icon: 'Bone', group: 'clinical', isCore: false },
    { id: 'artroscopia', name: 'Artroscopia', description: 'Planificacion y registro de artroscopias', icon: 'Scissors', group: 'clinical', isCore: false },
    { id: 'protesis', name: 'Protesis Articulares', description: 'Seguimiento de protesis de cadera y rodilla', icon: 'Bone', group: 'clinical', isCore: false },
    { id: 'columna', name: 'Patologia de Columna', description: 'Evaluacion y seguimiento de columna vertebral', icon: 'Bone', group: 'clinical', isCore: false },
    { id: 'rehabilitacion', name: 'Rehabilitacion', description: 'Programas de rehabilitacion fisica', icon: 'Dumbbell', group: 'clinical', isCore: false },
  ],

  // ── Oftalmologia ──
  oftalmologia: [
    { id: 'refraccion', name: 'Refraccion', description: 'Evaluacion de agudeza visual y refraccion', icon: 'Eye', group: 'clinical', isCore: false },
    { id: 'fondo-ojo', name: 'Fondo de Ojo', description: 'Examen de retina con registro fotografico', icon: 'Eye', group: 'clinical', isCore: false },
    { id: 'tonometria', name: 'Tonometria', description: 'Medicion de presion intraocular', icon: 'BarChart3', group: 'clinical', isCore: false },
    { id: 'campimetria', name: 'Campimetria', description: 'Campo visual computarizado', icon: 'Eye', group: 'clinical', isCore: false },
    { id: 'cirugia-refractiva', name: 'Cirugia Refractiva', description: 'Planificacion LASIK, PRK y ICL', icon: 'Scissors', group: 'clinical', isCore: false },
  ],

  // ── Dermatologia ──
  dermatologia: [
    { id: 'dermatoscopia', name: 'Dermatoscopia', description: 'Evaluacion de lesiones con dermatoscopio', icon: 'Eye', group: 'clinical', isCore: false },
    { id: 'fototerapia', name: 'Fototerapia', description: 'Sesiones de fototerapia UVB/PUVA', icon: 'Zap', group: 'clinical', isCore: false },
    { id: 'fotografia-clinica', name: 'Fotografia Clinica', description: 'Registro fotografico de lesiones con seguimiento', icon: 'Monitor', group: 'clinical', isCore: false },
    { id: 'estetica', name: 'Procedimientos Esteticos', description: 'Toxina botulinica, rellenos, peeling', icon: 'Fingerprint', group: 'clinical', isCore: false },
  ],

  // ── General (Medicina General) ──
  'medicina-general': [
    { id: 'certificados', name: 'Certificados Medicos', description: 'Generacion de constancias y certificados', icon: 'ClipboardList', group: 'clinical', isCore: false },
    { id: 'referidos', name: 'Referidos', description: 'Sistema de referencia a especialistas', icon: 'Users', group: 'clinical', isCore: false },
    { id: 'control-embarazo', name: 'Control de Embarazo', description: 'Seguimiento basico de embarazo en atencion primaria', icon: 'Baby', group: 'clinical', isCore: false },
    { id: 'cronico', name: 'Paciente Cronico', description: 'Seguimiento de enfermedades cronicas (HTA, DM)', icon: 'Heart', group: 'clinical', isCore: false },
  ],

  // ── Psiquiatria ──
  psiquiatria: [
    { id: 'escalas-psiquiatricas', name: 'Escalas Psiquiatricas', description: 'PHQ-9, GAD-7, HAM-D y otras escalas validadas', icon: 'Brain', group: 'clinical', isCore: false },
    { id: 'plan-terapeutico', name: 'Plan Terapeutico', description: 'Plan de tratamiento farmacologico y terapeutico', icon: 'ClipboardList', group: 'clinical', isCore: false },
    { id: 'seguimiento-farmacos', name: 'Seguimiento Farmacos', description: 'Control de medicacion psicoactiva y efectos secundarios', icon: 'Pill', group: 'clinical', isCore: false },
  ],

  // ── Endocrinologia ──
  endocrinologia: [
    { id: 'control-diabetes', name: 'Control de Diabetes', description: 'HbA1c, glucometrias y ajuste de insulina', icon: 'BarChart3', group: 'clinical', isCore: false },
    { id: 'tiroides', name: 'Patologia Tiroidea', description: 'Seguimiento de TSH, T4L y ecografia tiroidea', icon: 'Activity', group: 'clinical', isCore: false },
    { id: 'obesidad', name: 'Programa de Obesidad', description: 'Evaluacion y seguimiento de tratamiento de obesidad', icon: 'Heart', group: 'clinical', isCore: false },
  ],

  // ── Gastroenterologia ──
  gastroenterologia: [
    { id: 'endoscopia', name: 'Endoscopia', description: 'Registro de endoscopias digestivas', icon: 'Monitor', group: 'clinical', isCore: false },
    { id: 'colonoscopia', name: 'Colonoscopia', description: 'Registro de colonoscopias con hallazgos', icon: 'Monitor', group: 'clinical', isCore: false },
    { id: 'hepatologia', name: 'Hepatologia', description: 'Seguimiento de funcion hepatica y fibrosis', icon: 'BarChart3', group: 'clinical', isCore: false },
  ],

  // ── Neumologia ──
  neumologia: [
    { id: 'espirometria', name: 'Espirometria', description: 'Pruebas de funcion pulmonar', icon: 'Activity', group: 'clinical', isCore: false },
    { id: 'polisomnografia', name: 'Polisomnografia', description: 'Estudio del sueno y CPAP', icon: 'Monitor', group: 'clinical', isCore: false },
    { id: 'asma', name: 'Control de Asma', description: 'Seguimiento de asma con ACT y peak flow', icon: 'BarChart3', group: 'clinical', isCore: false },
  ],

  // ── Urologia ──
  urologia: [
    { id: 'uroflujometria', name: 'Uroflujometria', description: 'Estudio de flujo urinario', icon: 'Activity', group: 'clinical', isCore: false },
    { id: 'prostata', name: 'Control Prostatico', description: 'Seguimiento PSA y evaluacion prostatica', icon: 'BarChart3', group: 'clinical', isCore: false },
    { id: 'litiasis', name: 'Litiasis', description: 'Registro y seguimiento de calculos urinarios', icon: 'Shield', group: 'clinical', isCore: false },
  ],
};

// ============================================================================
// GROUP LABELS
// ============================================================================

const GROUP_LABELS: Record<string, { label: string; description: string }> = {
  core: { label: 'Modulos Esenciales', description: 'Siempre activos - son la base de tu consultorio' },
  clinical: { label: 'Modulos Clinicos', description: 'Herramientas especificas de tu especialidad' },
  financial: { label: 'Gestion Financiera', description: 'Facturacion, presupuestos y seguros' },
  lab: { label: 'Laboratorio', description: 'Seguimiento de examenes y muestras' },
  technology: { label: 'Tecnologia', description: 'Herramientas avanzadas e inteligencia artificial' },
  communication: { label: 'Comunicacion', description: 'Canales de contacto con pacientes' },
  growth: { label: 'Crecimiento', description: 'Analitica y crecimiento de tu practica' },
};

// ============================================================================
// COMPONENT
// ============================================================================

interface ModuleConfiguratorProps {
  specialty: SpecialtyOption | null;
  selectedModules: string[];
  onModulesChange: (moduleIds: string[]) => void;
}

export function ModuleConfigurator({
  specialty,
  selectedModules,
  onModulesChange,
}: ModuleConfiguratorProps) {
  const [initialized, setInitialized] = useState(false);

  // Build available modules list
  const { coreModules, toggleableModules, modulesByGroup } = useMemo(() => {
    const specialtySlug = specialty?.slug ?? specialty?.category ?? '';

    // Get specialty-specific modules
    let extraModules: ModuleOption[] = [];

    // Try exact slug match first, then category
    if (specialtySlug && SPECIALTY_MODULES[specialtySlug]) {
      extraModules = SPECIALTY_MODULES[specialtySlug];
    } else if (specialty?.category && SPECIALTY_MODULES[specialty.category]) {
      extraModules = SPECIALTY_MODULES[specialty.category];
    }

    const coreModules = CORE_MODULES;
    const toggleableModules = [...COMMON_MODULES, ...extraModules];

    // Group toggleable modules
    const modulesByGroup = new Map<string, ModuleOption[]>();
    for (const mod of toggleableModules) {
      const group = mod.group;
      const existing = modulesByGroup.get(group) || [];
      existing.push(mod);
      modulesByGroup.set(group, existing);
    }

    return { coreModules, toggleableModules, modulesByGroup };
  }, [specialty]);

  // Initialize with default selections
  useEffect(() => {
    if (initialized) return;
    if (toggleableModules.length === 0) return;

    // Select common modules + first 3 specialty-specific by default
    const defaultIds = [
      ...CORE_MODULES.map((m) => m.id),
      ...COMMON_MODULES.map((m) => m.id),
      ...toggleableModules
        .filter((m) => !COMMON_MODULES.find((c) => c.id === m.id))
        .slice(0, 3)
        .map((m) => m.id),
    ];

    onModulesChange(defaultIds);
    setInitialized(true);
  }, [toggleableModules, initialized, onModulesChange]);

  const toggleModule = (moduleId: string) => {
    const isSelected = selectedModules.includes(moduleId);
    if (isSelected) {
      onModulesChange(selectedModules.filter((id) => id !== moduleId));
    } else {
      onModulesChange([...selectedModules, moduleId]);
    }
  };

  const theme = getSpecialtyTheme(specialty?.slug);

  if (!specialty) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-sm text-gray-500">
          Selecciona una especialidad primero para ver los modulos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-xl p-4 border"
        style={{
          backgroundColor: theme.bgLight,
          borderColor: theme.primary + '30',
        }}
      >
        <h3
          className="text-lg font-semibold"
          style={{ color: theme.primary }}
        >
          Modulos para {specialty.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Activa los modulos que necesitas. Siempre podras cambiarlos despues desde la configuracion.
        </p>
      </div>

      {/* Core modules (always on) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-gray-400" />
          <h4 className="text-sm font-semibold text-gray-700">
            {GROUP_LABELS.core.label}
          </h4>
          <span className="text-xs text-gray-400">
            {GROUP_LABELS.core.description}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {coreModules.map((mod) => {
            const IconComponent = ICON_MAP[mod.icon] ?? Stethoscope;
            return (
              <div
                key={mod.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-80"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: theme.primary }}
                >
                  <IconComponent className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{mod.name}</p>
                  <p className="text-xs text-gray-400 truncate">{mod.description}</p>
                </div>
                <div className="shrink-0">
                  <div className="w-10 h-5 bg-emerald-400 rounded-full flex items-center justify-end px-0.5">
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggleable module groups */}
      {Array.from(modulesByGroup.entries())
        .sort(([a], [b]) => {
          const order = ['clinical', 'financial', 'lab', 'technology', 'communication', 'growth'];
          return order.indexOf(a) - order.indexOf(b);
        })
        .map(([groupKey, modules]) => {
          const groupInfo = GROUP_LABELS[groupKey] ?? {
            label: groupKey,
            description: '',
          };

          return (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  {groupInfo.label}
                </h4>
                <span className="text-xs text-gray-400">
                  {groupInfo.description}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {modules.map((mod) => {
                  const isSelected = selectedModules.includes(mod.id);
                  const IconComponent = ICON_MAP[mod.icon] ?? Stethoscope;

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border text-left
                        transition-all duration-200
                        ${
                          isSelected
                            ? 'border-blue-200 bg-blue-50/50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div
                        className={`
                          w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                          transition-colors duration-200
                        `}
                        style={{
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.primary + '15',
                          color: isSelected ? 'white' : theme.primary,
                        }}
                      >
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isSelected ? 'text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {mod.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{mod.description}</p>
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`
                            w-10 h-5 rounded-full flex items-center px-0.5
                            transition-all duration-200
                            ${isSelected ? 'bg-emerald-400 justify-end' : 'bg-gray-200 justify-start'}
                          `}
                        >
                          <div className="w-4 h-4 bg-white rounded-full shadow" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{selectedModules.length}</span> modulos activos
          (incluyendo {CORE_MODULES.length} esenciales)
        </p>
        <button
          type="button"
          onClick={() => {
            // Select all
            const allIds = [
              ...CORE_MODULES.map((m) => m.id),
              ...toggleableModules.map((m) => m.id),
            ];
            onModulesChange(allIds);
          }}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Activar todos
        </button>
      </div>
    </div>
  );
}
