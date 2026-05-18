'use client';

/**
 * @file roster-kpi-strip.tsx
 * @description Six-tile KPI strip rendered above the roster (T-3-09 UI).
 *
 * Sourced from `useRosterKPIs({ doctorId })`. Each tile renders an icon, a
 * label, and the numeric count. Warning/destructive badges surface counts
 * that demand attention (`followups_overdue`, `expired_rx_count`,
 * `abnormal_labs_pending`) so the doctor catches them at a glance without
 * scanning the roster body.
 *
 * Loading: six `Skeleton` blocks sized to match the tiles to prevent layout
 * shift. Error: a single inline notice (no destructive surface) — KPIs are
 * informational so we degrade gracefully instead of breaking the page.
 */

import {
  Activity,
  Clock,
  FlaskConical,
  Pill,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Skeleton } from '@red-salud/design-system';

import { useRosterKPIs } from '@/hooks/use-roster-kpis';
import type { RosterKPIs } from '@red-salud/types';

export interface RosterKpiStripProps {
  doctorId: string | null;
}

interface KpiTileConfig {
  label: string;
  icon: LucideIcon;
  value: number;
  /** Badge variant when value > 0; null hides the badge. */
  attentionTone?: 'warning' | 'destructive' | null;
}

function buildTiles(kpis: RosterKPIs): KpiTileConfig[] {
  return [
    {
      label: 'Pacientes activos',
      icon: Users,
      value: kpis.total_active,
      attentionTone: null,
    },
    {
      label: 'Nuevos este mes',
      icon: UserPlus,
      value: kpis.new_this_month,
      attentionTone: null,
    },
    {
      label: 'Crónicos',
      icon: Activity,
      value: kpis.chronic_count,
      attentionTone: null,
    },
    {
      label: 'Seguimientos vencidos',
      icon: Clock,
      value: kpis.followups_overdue,
      attentionTone: 'warning',
    },
    {
      label: 'Recetas vencidas',
      icon: Pill,
      value: kpis.expired_rx_count,
      attentionTone: 'destructive',
    },
    {
      label: 'Labs anormales pendientes',
      icon: FlaskConical,
      value: kpis.abnormal_labs_pending,
      attentionTone: 'warning',
    },
  ];
}

export function RosterKpiStrip({ doctorId }: RosterKpiStripProps) {
  const { kpis, isLoading, error } = useRosterKPIs({ doctorId });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        No pudimos cargar los indicadores. Reintentá refrescando la página.
      </div>
    );
  }

  const tiles = buildTiles(kpis);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((tile) => (
        <KpiTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

type KpiTileProps = KpiTileConfig;

function KpiTile({ label, icon: Icon, value, attentionTone }: KpiTileProps) {
  const showBadge = attentionTone != null && value > 0;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="rounded-md bg-muted p-1.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        {showBadge && (
          <Badge
            variant={attentionTone === 'destructive' ? 'destructive' : 'secondary'}
            className="text-[10px] py-0 px-1.5"
          >
            Atención
          </Badge>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3 flex flex-col gap-1.5">
      <Skeleton className="h-7 w-7 rounded-md" />
      <Skeleton className="h-6 w-12" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
