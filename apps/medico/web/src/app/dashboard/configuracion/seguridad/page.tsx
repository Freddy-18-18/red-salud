'use client';

import { ShieldAlert, KeyRound, Smartphone, Globe } from 'lucide-react';
import { ConfigSection } from '@/components/configuracion/config-section';

/**
 * /dashboard/configuracion/seguridad — stub.
 *
 * Roadmap items previewed disabled. Real implementations come in dedicated
 * sessions:
 *   - Change password: Supabase Auth `updateUser({ password })`
 *   - Active sessions: list `auth.refresh_tokens`, allow revoke per session
 *   - 2FA: Supabase Auth MFA (TOTP)
 */
const ITEMS = [
  {
    icon: KeyRound,
    label: 'Cambiar contraseña',
    description: 'Actualizá tu clave de acceso a la cuenta.',
  },
  {
    icon: Smartphone,
    label: 'Autenticación de dos factores (2FA)',
    description: 'Sumá una capa de seguridad con app autenticadora.',
  },
  {
    icon: Globe,
    label: 'Sesiones activas',
    description: 'Mirá dónde está abierta tu cuenta y cerrá sesiones remotas.',
  },
];

export default function SeguridadPage() {
  return (
    <ConfigSection
      icon={ShieldAlert}
      title="Seguridad"
      description="Protegé tu cuenta y los datos clínicos de tus pacientes."
    >
      <ul className="space-y-3">
        {ITEMS.map((it) => (
          <li
            key={it.label}
            className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
              <it.icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{it.label}</p>
              <p className="text-xs text-muted-foreground">{it.description}</p>
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
