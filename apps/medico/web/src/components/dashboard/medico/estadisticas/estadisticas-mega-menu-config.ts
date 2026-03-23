// TODO: Implement statistics mega menu items
// This is a stub to allow the app to compile.

import type { MegaMenuSection } from '../configuracion/configuracion-mega-menu-config';

export const ESTADISTICAS_MEGA_MENU: MegaMenuSection[] = [
  {
    title: 'Estadisticas',
    items: [
      { id: 'resumen', label: 'Resumen General', icon: 'BarChart' },
      { id: 'pacientes', label: 'Pacientes', icon: 'Users' },
      { id: 'citas', label: 'Citas', icon: 'Calendar' },
      { id: 'ingresos', label: 'Ingresos', icon: 'DollarSign' },
    ],
  },
];
