'use client';

import {
  CheckCircle2,
  Clock,
  Circle,
  XCircle,
} from 'lucide-react';
import { Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { TreatmentPlan, TreatmentPlanItem } from './use-treatment-plans';

// ============================================================================
// TYPES
// ============================================================================

interface TreatmentPlanTimelineProps {
  plan: TreatmentPlan;
  themeColor?: string;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const ITEM_STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Circle, color: 'text-gray-300', label: 'Pendiente' },
  scheduled: { icon: Clock, color: 'text-blue-500', label: 'Programado' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Completado' },
  cancelled: { icon: XCircle, color: 'text-red-400', label: 'Cancelado' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function TreatmentPlanTimeline({
  plan,
  themeColor = '#3B82F6',
}: TreatmentPlanTimelineProps) {
  // Group items by phase
  const phases = new Map<number, TreatmentPlanItem[]>();
  for (const item of plan.items) {
    const phase = item.phase ?? 1;
    if (!phases.has(phase)) {
      phases.set(phase, []);
    }
    phases.get(phase)!.push(item);
  }

  const sortedPhases = Array.from(phases.entries()).sort(
    ([a], [b]) => a - b,
  );

  // Calculate cost by phase
  function phaseCost(items: TreatmentPlanItem[]): number {
    return items.reduce((sum, item) => sum + (item.estimated_cost ?? 0), 0);
  }

  function phaseProgress(items: TreatmentPlanItem[]): number {
    if (items.length === 0) return 0;
    const completed = items.filter((i) => i.status === 'completed').length;
    return Math.round((completed / items.length) * 100);
  }

  return (
    <div className="space-y-6">
      {/* ── Plan summary ──────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        {plan.estimated_cost != null && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Costo estimado
            </p>
            <p className="text-base font-bold text-gray-900">
              {new Intl.NumberFormat('es-VE', {
                style: 'currency',
                currency: 'USD',
              }).format(plan.estimated_cost)}
            </p>
          </div>
        )}
        {plan.actual_cost != null && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Costo real
            </p>
            <p className="text-base font-bold text-gray-900">
              {new Intl.NumberFormat('es-VE', {
                style: 'currency',
                currency: 'USD',
              }).format(plan.actual_cost)}
            </p>
          </div>
        )}
        {plan.insurance_coverage != null && plan.insurance_coverage > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Cobertura seguro
            </p>
            <p className="text-base font-bold text-emerald-600">
              {new Intl.NumberFormat('es-VE', {
                style: 'currency',
                currency: 'USD',
              }).format(plan.insurance_coverage)}
            </p>
          </div>
        )}
      </div>

      {/* ── Phase timeline ────────────────────────────────────────── */}
      {sortedPhases.map(([phaseNum, phaseItems], phaseIdx) => {
        const progress = phaseProgress(phaseItems);
        const cost = phaseCost(phaseItems);
        const isLast = phaseIdx === sortedPhases.length - 1;

        return (
          <div key={phaseNum} className="relative">
            {/* Phase connector line */}
            {!isLast && (
              <div
                className="absolute left-4 top-10 bottom-0 w-0.5"
                style={{ backgroundColor: `${themeColor}20` }}
              />
            )}

            {/* Phase header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: themeColor }}
              >
                {phaseNum}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Fase {phaseNum}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {phaseItems.length} procedimiento{phaseItems.length !== 1 ? 's' : ''}
                  </span>
                  {cost > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      ${cost.toFixed(2)}
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: themeColor,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{progress}%</span>
                </div>
              </div>
            </div>

            {/* Phase items */}
            <div className="ml-11 space-y-2">
              {phaseItems.map((item) => {
                const statusCfg = ITEM_STATUS_CONFIG[item.status] ?? ITEM_STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                      item.status === 'completed'
                        ? 'border-gray-100 bg-gray-50/50'
                        : 'border-gray-100 bg-white',
                    )}
                  >
                    <StatusIcon
                      className={cn('h-5 w-5 mt-0.5 shrink-0', statusCfg.color)}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          item.status === 'completed'
                            ? 'text-gray-400 line-through'
                            : item.status === 'cancelled'
                              ? 'text-gray-400 line-through'
                              : 'text-gray-700',
                        )}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        {item.estimated_cost != null && item.estimated_cost > 0 && (
                          <span className="text-xs text-gray-500">
                            ${item.estimated_cost.toFixed(2)}
                          </span>
                        )}
                        {item.duration_days != null && item.duration_days > 0 && (
                          <span className="text-xs text-gray-400">
                            {item.duration_days} día{item.duration_days !== 1 ? 's' : ''}
                          </span>
                        )}
                        {item.tooth_numbers && (
                          <span className="text-xs text-gray-400">
                            Dientes: {item.tooth_numbers}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant={
                        item.status === 'completed'
                          ? 'outline'
                          : item.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className="text-[10px] shrink-0"
                    >
                      {statusCfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
