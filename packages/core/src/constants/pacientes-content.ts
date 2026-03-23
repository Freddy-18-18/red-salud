// Contenido de respaldo en caso de que la base de datos falle o esté vacía
// Esto asegura que la página nunca se rompa ni muestre "Lorem Ipsum"

export const FALLBACK_CONTENT = {
  stats: {
    patients: 0, // Default to 0 so we show "Próximamente" instead of fake numbers
    doctors: 0,
    lastUpdated: new Date().toISOString()
  },
  testimonials: [
    {
      id: 'fallback-1',
      name: 'María González',
      role: 'Paciente Verificada',
      content: 'Increíble poder tener a mi médico en el bolsillo. La videoconsulta fue muy fluida y me enviaron la receta al instante.',
      rating: 5,
      image_url: null
    },
    {
      id: 'fallback-2',
      name: 'Carlos Rodríguez',
      role: 'Usuario Recurrente',
      content: 'La facilidad para agendar citas es lo mejor. Ya no pierdo tiempo en salas de espera interminables.',
      rating: 5,
      image_url: null
    },
    {
      id: 'fallback-3',
      name: 'Ana Martínez',
      role: 'Paciente',
      content: 'Me encanta que todo mi historial médico esté organizado. Cuando cambié de ciudad, mi nuevo doctor pudo ver todo sin problemas.',
      rating: 5,
      image_url: null
    }
  ],
  features: [
    {
      title: "Expediente Médico Universal",
      description: "Olvídate de cargar carpetas con exámenes. Tu historial médico viaja contigo, accesible de forma segura desde cualquier dispositivo cuando lo necesites.",
      benefits: ["Historial centralizado", "Acceso 24/7", "Seguridad garantizada"]
    },
    {
      title: "Comunicación Directa",
      description: "Resuelve dudas rápidas mediante nuestro chat seguro post-consulta. Mantén una línea de comunicación abierta con tu especialista.",
      benefits: ["Chat privado", "Consultas rápidas", "Seguimiento efectivo"]
    },
    {
      title: "Privacidad Garantizada",
      description: "Cumplimos con estándares internacionales de protección de datos. Tu información de salud es confidencial y solo tú decides quién puede verla.",
      benefits: ["Encriptación total", "Control de acceso", "Confidencialidad médica"]
    }
  ],
  benefits: [
    { 
      title: "Atención 24/7", 
      description: "Acceso a servicios médicos y programación de citas en cualquier momento, día o noche.", 
      icon: "Clock",
      color: "bg-blue-500"
    },
    { 
      title: "Médicos Verificados", 
      description: "Cada especialista en nuestra plataforma pasa por un riguroso proceso de validación.", 
      icon: "UserCheck",
      color: "bg-teal-500"
    },
    { 
      title: "Historial Digital", 
      description: "Tus recetas, diagnósticos y estudios centralizados en un solo lugar seguro.", 
      icon: "FileText",
      color: "bg-indigo-500"
    },
    { 
      title: "100% Seguro", 
      description: "Tus datos están encriptados y protegidos bajo los más altos estándares de privacidad.", 
      icon: "ShieldCheck",
      color: "bg-purple-500"
    },
    { 
      title: "Sin Costo para Ti", 
      description: "Nuestra plataforma es completamente gratuita para pacientes. Solo te preocupas por tu salud.", 
      icon: "HeartHandshake",
      color: "bg-pink-500"
    },
    { 
      title: "Fácil de Usar", 
      description: "Interfaz intuitiva diseñada para que cualquier persona pueda agendar en segundos.", 
      icon: "Smartphone",
      color: "bg-orange-500"
    }
  ],
  process: [
    { 
      title: "Crea tu Cuenta", 
      description: "Regístrate gratis en menos de 2 minutos. Solo necesitas tu correo electrónico.", 
      step: 1, 
      icon: "UserPlus" 
    },
    { 
      title: "Encuentra tu Especialista", 
      description: "Busca por especialidad, ubicación o nombre. Filtra por disponibilidad inmediata.", 
      step: 2, 
      icon: "Search" 
    },
    { 
      title: "Agenda tu Cita", 
      description: "Elige el horario que mejor se adapte a ti. Recibirás recordatorios automáticos.", 
      step: 3, 
      icon: "CalendarCheck" 
    },
    { 
      title: "Consulta", 
      description: "Conéctate a tu videoconsulta o asiste al consultorio. Todo queda registrado en tu historial.", 
      step: 4, 
      icon: "Video" 
    }
  ]
};
