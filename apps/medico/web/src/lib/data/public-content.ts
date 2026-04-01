// ============================================
// PUBLIC CONTENT — Marketing copy for landing page
// ============================================

export const heroContent = {
  headline: 'Tu Práctica Médica. Reimaginada.',
  subtitle:
    'La primera plataforma clínica que se adapta a tu especialidad. Agenda, consultas, recetas, historia clínica e inteligencia artificial — todo en un solo lugar, diseñado para cómo vos trabajás.',
  ctaPrimary: 'Comenzar Gratis',
  ctaSecondary: 'Explorar Funcionalidades',
  trustIndicators: [
    '132+ especialidades',
    'Verificación SACS',
    'Gratis para comenzar',
  ],
} as const;

export const statsContent = [
  {
    value: '132+',
    label: 'Especialidades Médicas',
    description: 'Desde medicina general hasta subespecialidades quirúrgicas',
  },
  {
    value: '50+',
    label: 'Módulos Clínicos',
    description: 'Consultas, recetas, imagenología, laboratorio y más',
  },
  {
    value: '24/7',
    label: 'Disponibilidad',
    description: 'Tu consultorio digital siempre disponible, desde cualquier dispositivo',
  },
  {
    value: '100%',
    label: 'Personalizable',
    description: 'Cada módulo se adapta a los flujos de tu especialidad',
  },
] as const;

export const howItWorksContent = {
  heading: 'Comenzá en minutos',
  subtitle:
    'Tres pasos para transformar tu práctica médica. Sin configuraciones complicadas, sin curva de aprendizaje.',
  steps: [
    {
      number: 1,
      title: 'Registrá tu perfil',
      description:
        'Creá tu cuenta profesional y verificá tu registro en el SACS. Tu identidad médica, protegida y verificada.',
      iconName: 'UserPlus' as const,
    },
    {
      number: 2,
      title: 'Configurá tu especialidad',
      description:
        'Seleccioná tu especialidad y el sistema activa automáticamente los módulos, formularios y KPIs relevantes para vos.',
      iconName: 'Settings' as const,
    },
    {
      number: 3,
      title: 'Transformá tu práctica',
      description:
        'Agenda inteligente, consultas digitales, recetas electrónicas y estadísticas — todo integrado y listo para usar.',
      iconName: 'Rocket' as const,
    },
  ],
} as const;

export const ctaContent = {
  headline: 'Llevá tu consultorio al siguiente nivel',
  subtitle:
    'Unite a la comunidad de médicos que ya están transformando la atención médica en Venezuela.',
  ctaText: 'Crear Mi Cuenta Gratis',
  smallText: 'Sin tarjeta de crédito · Configuración en 5 minutos',
} as const;
