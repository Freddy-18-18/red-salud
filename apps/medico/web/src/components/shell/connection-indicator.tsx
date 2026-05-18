'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@red-salud/design-system';

import { useConnectionStatus } from '@/hooks/use-connection-status';

/**
 * @file connection-indicator.tsx
 * @description Small status dot rendered next to the avatar that shows
 * whether the app is talking to Supabase. Tooltip gives the human-readable
 * label. The hook drives state — this component is pure presentation.
 *
 *   ● online       → emerald (everything's fine)
 *   ● reconnecting → amber (browser online, ping failing)
 *   ● offline      → destructive (no network at all)
 */

const STATUS_CONFIG = {
  online: {
    label: 'Conectado',
    description: 'Tus datos se sincronizan en tiempo real.',
    color: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    pulse: false,
  },
  reconnecting: {
    label: 'Reconectando',
    description: 'Hay problemas para llegar al servidor. Reintentando…',
    color: 'bg-amber-500',
    ring: 'ring-amber-500/30',
    pulse: true,
  },
  offline: {
    label: 'Sin conexión',
    description: 'Tu equipo está sin internet. Los cambios se guardarán al reconectar.',
    color: 'bg-destructive',
    ring: 'ring-destructive/30',
    pulse: true,
  },
} as const;

export function ConnectionIndicator(): React.ReactElement {
  const status = useConnectionStatus();
  const cfg = STATUS_CONFIG[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="status"
          aria-label={cfg.label}
          data-testid="connection-indicator"
          data-status={status}
          className="relative inline-flex h-3 w-3 items-center justify-center"
        >
          <span
            className={[
              'h-2 w-2 rounded-full ring-4',
              cfg.color,
              cfg.ring,
              cfg.pulse ? 'animate-pulse motion-reduce:animate-none' : '',
            ].join(' ')}
            aria-hidden="true"
          />
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[14rem]">
        <p className="text-xs font-medium">{cfg.label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {cfg.description}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
