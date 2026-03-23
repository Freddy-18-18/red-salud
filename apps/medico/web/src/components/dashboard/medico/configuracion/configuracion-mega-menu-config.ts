// TODO: Implement configuration mega menu items
// This is a stub to allow the app to compile.

export interface MegaMenuItem {
  id: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface MegaMenuSection {
  title: string;
  items: MegaMenuItem[];
}

export const CONFIGURACION_MEGA_MENU: MegaMenuSection[] = [
  {
    title: 'Configuracion',
    items: [
      { id: 'perfil', label: 'Perfil Profesional', icon: 'User' },
      { id: 'consultorio', label: 'Consultorio', icon: 'Building' },
      { id: 'recetas', label: 'Recetas', icon: 'FileText' },
      { id: 'firma', label: 'Firma Digital', icon: 'Pen' },
      { id: 'notificaciones', label: 'Notificaciones', icon: 'Bell' },
    ],
  },
];
