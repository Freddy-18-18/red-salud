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
    '130+ especialidades',
    'Verificación SACS',
    'Gratis para comenzar',
  ],
} as const;

export const statsContent = [
  {
    value: '130+',
    label: 'Especialidades Soportadas',
    description: 'Desde medicina general hasta subespecialidades quirúrgicas',
  },
  {
    value: '8',
    label: 'Módulos Principales',
    description: 'Agenda, consultas, recetas, historia clínica, IA, calendario, estadísticas y SACS',
  },
  {
    value: '24/7',
    label: 'Disponibilidad',
    description: 'Tu consultorio digital siempre disponible, desde cualquier dispositivo',
  },
  {
    value: '100%',
    label: 'Adaptable a tu Especialidad',
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
    'Digitalizá tu consultorio y ofrecé una experiencia médica moderna a tus pacientes.',
  ctaText: 'Crear Mi Cuenta Gratis',
  smallText: 'Sin tarjeta de crédito · Configuración en 5 minutos',
} as const;
