// ============================================
// TESTIMONIALS DATA — Doctor testimonials
// ============================================

export interface Testimonial {
  doctorName: string;
  specialty: string;
  city: string;
  clinic: string;
  quote: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  {
    doctorName: 'Dra. María Elena Rodríguez',
    specialty: 'Cardiología',
    city: 'Caracas',
    clinic: 'Centro Médico de Caracas',
    quote:
      'El visor de ECG integrado y las alertas críticas cambiaron completamente mi flujo de trabajo. Antes perdía tiempo entre sistemas, ahora todo está en un solo lugar. Mis pacientes notan la diferencia.',
    initials: 'MR',
  },
  {
    doctorName: 'Dr. Carlos Andrés Méndez',
    specialty: 'Pediatría',
    city: 'Maracaibo',
    clinic: 'Clínica Infantil del Zulia',
    quote:
      'Las curvas de crecimiento integradas y el esquema de vacunación venezolano me ahorran horas cada semana. Los padres reciben alertas automáticas y el seguimiento es impecable.',
    initials: 'CM',
  },
  {
    doctorName: 'Dra. Valentina Gutiérrez',
    specialty: 'Odontología',
    city: 'Valencia',
    clinic: 'Consultorio Dental Carabobo',
    quote:
      'El odontograma interactivo y el periodontograma digital son exactamente lo que necesitaba. Pasé de llevar fichas en papel a tener todo digitalizado en una semana. Increíble.',
    initials: 'VG',
  },
  {
    doctorName: 'Dr. José Miguel Hernández',
    specialty: 'Medicina Interna',
    city: 'Barquisimeto',
    clinic: 'Hospital Central de Barquisimeto',
    quote:
      'La IA diagnóstica con códigos ICD-11 me sugiere diagnósticos diferenciales que a veces no considero inicialmente. Es como tener un colega consultante siempre disponible.',
    initials: 'JH',
  },
  {
    doctorName: 'Dra. Ana Lucía Paredes',
    specialty: 'Ginecología y Obstetricia',
    city: 'Mérida',
    clinic: 'Centro de Salud Los Andes',
    quote:
      'El módulo de control prenatal es extraordinario. Llevo el seguimiento de cada embarazo con gráficos, alertas y todo el historial accesible desde el teléfono. Mis pacientes se sienten más acompañadas.',
    initials: 'AP',
  },
];
