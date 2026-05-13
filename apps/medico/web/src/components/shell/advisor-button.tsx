'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@red-salud/design-system';
import { Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { DoctorAttention } from '@/lib/capabilities/types';

/**
 * @file advisor-button.tsx
 * @description Round Supabase-style action button surfacing the doctor's
 * active attention alerts (R7 of app-shell-medico).
 *
 * The button itself wears the Supabase action-cluster styling:
 * `rounded-full w-8 h-8 border border-strong hover:border-foreground-lighter`.
 * When either `attention.verificationPending` or `attention.sacsExpired` is
 * true, an absolutely-positioned destructive-colored dot pings the top-right
 * corner — same visual language as the sidebar attention dot (R5).
 *
 * Clicking the trigger opens a DropdownMenu listing the active alerts. The
 * list is "just text items" for Phase 2 — Phase 5 may wire structured
 * actions / acknowledgement.
 */

export interface AdvisorButtonProps {
  /**
   * Resolver-derived attention flags. When undefined, no dot is rendered and
   * the dropdown shows the empty state — safe degradation when the
   * capability engine is OFF.
   */
  attention?: DoctorAttention;
}

interface AdvisorAlert {
  id: string;
  title: string;
  description: string;
  href?: string;
}

function buildAlerts(attention: DoctorAttention | undefined): AdvisorAlert[] {
  if (!attention) return [];
  const alerts: AdvisorAlert[] = [];
  if (attention.verificationPending) {
    alerts.push({
      id: 'verification-pending',
      title: 'Verificación SACS pendiente',
      description:
        'Tu cuenta está en modo manual. Completá la verificación para desbloquear todos los módulos.',
      href: '/dashboard/verificacion',
    });
  }
  if (attention.sacsExpired) {
    alerts.push({
      id: 'sacs-expired',
      title: 'SACS vencido',
      description:
        'Tu verificación SACS expiró. Renová la verificación para mantener el acceso completo.',
      href: '/dashboard/verificacion',
    });
  }
  return alerts;
}

export function AdvisorButton({ attention }: AdvisorButtonProps): React.ReactElement {
  const router = useRouter();
  const alerts = buildAlerts(attention);
  const hasAttention = alerts.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            hasAttention ? `Alertas activas (${alerts.length})` : 'Alertas'
          }
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-strong text-foreground-lighter transition-colors hover:border-foreground-lighter hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          {hasAttention && (
            <span
              data-testid="advisor-button-dot"
              aria-hidden="true"
              className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive"
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Alertas</span>
          {hasAttention && (
            <span className="text-xs font-normal text-foreground-lighter">
              {alerts.length} activa{alerts.length === 1 ? '' : 's'}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {alerts.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-foreground-lighter">
            Sin alertas activas
          </div>
        ) : (
          alerts.map((alert) => (
            <DropdownMenuItem
              key={alert.id}
              onSelect={() => {
                if (alert.href) router.push(alert.href);
              }}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="text-sm font-medium">{alert.title}</span>
              <span className="text-xs text-foreground-lighter">
                {alert.description}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
