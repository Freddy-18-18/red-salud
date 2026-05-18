import { Settings } from 'lucide-react';

import { ConfigTabNav, type ConfigTab } from '@/components/configuracion/config-tab-nav';

/**
 * @file configuracion/layout.tsx
 * @description URL-driven tabs layout for the doctor's settings area.
 *
 * Each tab is a real route under `/dashboard/configuracion/*`. The layout
 * renders:
 *   - Page header (title + description)
 *   - Tab nav (sidebar on desktop, scrollable row on mobile)
 *   - Slot for the active tab's page
 *
 * URL-driven tabs give us deep linking, browser back/forward, code splitting
 * per tab, and independent loading/error states. Pattern used by Linear,
 * Stripe, Vercel, GitHub Settings.
 */

const TABS: ConfigTab[] = [
  {
    href: '/dashboard/configuracion/perfil',
    label: 'Perfil',
    description: 'Datos personales y profesionales',
    iconName: 'User',
  },
  {
    href: '/dashboard/configuracion/consultorio',
    label: 'Consultorio',
    description: 'Ubicación, contacto y sedes',
    iconName: 'Building2',
  },
  {
    href: '/dashboard/configuracion/horarios',
    label: 'Horarios',
    description: 'Disponibilidad y duración',
    iconName: 'Clock',
  },
  {
    href: '/dashboard/configuracion/precios',
    label: 'Precios y Seguros',
    description: 'Tarifas y aseguradoras',
    iconName: 'DollarSign',
  },
  {
    href: '/dashboard/configuracion/firma',
    label: 'Firma Digital',
    description: 'Para recetas y documentos',
    iconName: 'FileSignature',
  },
  {
    href: '/dashboard/configuracion/notificaciones',
    label: 'Notificaciones',
    description: 'Email, push, recordatorios',
    iconName: 'Bell',
  },
  {
    href: '/dashboard/configuracion/apariencia',
    label: 'Apariencia',
    description: 'Tema y preferencias visuales',
    iconName: 'Palette',
  },
  {
    href: '/dashboard/configuracion/seguridad',
    label: 'Seguridad',
    description: 'Contraseña y sesiones',
    iconName: 'ShieldAlert',
  },
];

export default function ConfiguracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Section header */}
      <header className="flex items-start gap-3">
        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
          <Settings className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestioná tu perfil, consultorio y preferencias.
          </p>
        </div>
      </header>

      {/* Tabs (sidebar on desktop) + content */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ConfigTabNav tabs={TABS} />
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
