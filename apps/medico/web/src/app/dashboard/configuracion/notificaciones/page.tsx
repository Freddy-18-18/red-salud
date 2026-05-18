'use client';

import { Bell, Mail, Smartphone, Calendar } from 'lucide-react';
import { ConfigSection } from '@/components/configuracion/config-section';

/**
 * /dashboard/configuracion/notificaciones — preview / stub.
 *
 * Real backend (notification_preferences table + delivery channels) ships
 * later. For now we render the planned toggles disabled so the user sees
 * the roadmap.
 */
const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    description: 'Resumen diario, citas próximas, mensajes nuevos.',
  },
  {
    icon: Smartphone,
    label: 'Push (móvil)',
    description: 'Notificaciones en tu teléfono cuando estás fuera del consultorio.',
  },
  {
    icon: Calendar,
    label: 'Recordatorios de cita',
    description: 'Alertas 30 minutos antes de cada cita programada.',
  },
];

export default function NotificacionesPage() {
  return (
    <ConfigSection
      icon={Bell}
      title="Notificaciones"
      description="Elegí cómo querés enterarte de lo que pasa con tus pacientes."
    >
      <ul className="space-y-3">
        {CHANNELS.map((c) => (
          <li
            key={c.label}
            className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
              <c.icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.description}</p>
            </div>
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Próximamente
            </span>
          </li>
        ))}
      </ul>
    </ConfigSection>
  );
}
