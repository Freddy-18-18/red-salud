'use client';

import { useMemo } from 'react';
import { CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { SurgicalChecklistRecord } from './use-surgical-checklist';
import { getChecklistById } from './surgical-checklists-data';

// ============================================================================
// TYPES
// ============================================================================

interface SurgicalHistoryProps {
  checklists: SurgicalChecklistRecord[];
  onSelect: (checklist: SurgicalChecklistRecord) => void;
  themeColor?: string;
}

// ============================================================================
// COMPLIANCE STATS
// ============================================================================

function ComplianceStats({
  checklists,
  themeColor,
}: {
  checklists: SurgicalChecklistRecord[];
  themeColor: string;
}) {
  const stats = useMemo(() => {
    const total = checklists.length;
    if (total === 0) return { total: 0, completed: 0, avgPct: 0, rate: 0 };

    const completed = checklists.filter((c) => c.status === 'completed').length;
    const avgPct = Math.round(
      checklists.reduce((sum, c) => sum + c.completion_pct, 0) / total,
    );
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, avgPct, rate };
  }, [checklists]);

  if (stats.total === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
      {[
        { label: 'Total', value: stats.total, icon: Clock },
        { label: 'Completados', value: stats.completed, icon: CheckCircle2 },
        { label: 'Promedio', value: `${stats.avgPct}%`, icon: TrendingUp },
        { label: 'Cumplimiento', value: `${stats.rate}%`, icon: CheckCircle2 },
      ].map((stat) => (
        <div
          key={stat.label}
          className="p-3 rounded-lg text-center"
          style={{ backgroundColor: `${themeColor}08` }}
        >
          <stat.icon
            className="h-4 w-4 mx-auto mb-1"
            style={{ color: themeColor }}
          />
          <p
            className="text-lg font-bold tabular-nums"
            style={{ color: themeColor }}
          >
            {stat.value}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SurgicalHistory({
  checklists,
  onSelect,
  themeColor = '#3B82F6',
}: SurgicalHistoryProps) {
  const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    in_progress: { label: 'En progreso', variant: 'secondary' },
    completed: { label: 'Completado', variant: 'outline' },
    cancelled: { label: 'Cancelado', variant: 'destructive' },
  };

  return (
    <div className="space-y-3">
      <ComplianceStats checklists={checklists} themeColor={themeColor} />

      {checklists.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">
          Sin checklists anteriores
        </p>
      )}

      {checklists.map((checklist) => {
        const statusCfg = STATUS_CONFIG[checklist.status] ?? STATUS_CONFIG.in_progress;
        const definition = getChecklistById(checklist.checklist_type);

        return (
          <button
            key={checklist.id}
            type="button"
            onClick={() => onSelect(checklist)}
            className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            {/* Status icon */}
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              {checklist.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : checklist.status === 'cancelled' ? (
                <XCircle className="h-5 w-5 text-red-400" />
              ) : (
                <Clock className="h-5 w-5" style={{ color: themeColor }} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {definition?.name ?? checklist.checklist_type}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {checklist.patient_name && (
                  <span className="text-xs text-gray-400 truncate">
                    {checklist.patient_name}
                  </span>
                )}
                <span className="text-xs text-gray-300">
                  {checklist.phases.length} fases
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p
                  className="text-sm font-bold tabular-nums"
                  style={{ color: checklist.completion_pct === 100 ? '#22C55E' : themeColor }}
                >
                  {checklist.completion_pct}%
                </p>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${checklist.completion_pct}%`,
                      backgroundColor: checklist.completion_pct === 100 ? '#22C55E' : themeColor,
                    }}
                  />
                </div>
              </div>
              <Badge variant={statusCfg.variant} className="text-xs">
                {statusCfg.label}
              </Badge>
            </div>

            {/* Date */}
            <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
              {new Date(checklist.created_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
              })}
            </p>
          </button>
        );
      })}
    </div>
  );
}
