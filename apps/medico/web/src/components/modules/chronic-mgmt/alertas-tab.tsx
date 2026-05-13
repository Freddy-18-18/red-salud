'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@red-salud/core/utils';

import type { AlertResult } from './use-chronic-data';

export interface AlertasTabProps {
  alerts: AlertResult[];
}

const SEVERITY_RANK: Record<AlertResult['severity'], number> = {
  severe: 0,
  moderate: 1,
  mild: 2,
};

const SEVERITY_STYLE: Record<AlertResult['severity'], string> = {
  severe: 'bg-red-50 text-red-700 border-red-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  mild: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const SEVERITY_LABEL: Record<AlertResult['severity'], string> = {
  severe: 'Severa',
  moderate: 'Moderada',
  mild: 'Leve',
};

export function AlertasTab({ alerts }: AlertasTabProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-300 mb-2" />
        <p className="text-sm text-gray-500">Sin alertas activas</p>
        <p className="text-xs text-gray-300 mt-1">
          Todas las mediciones recientes están dentro de rango
        </p>
      </div>
    );
  }

  const sorted = [...alerts].sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );

  return (
    <ul className="space-y-2">
      {sorted.map((a, i) => (
        <li
          key={`${a.metric_type_id}-${a.measured_at}-${i}`}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg border',
            SEVERITY_STYLE[a.severity],
          )}
        >
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{a.metric_type_name}</p>
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {SEVERITY_LABEL[a.severity]}
              </span>
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              Valor: <span className="font-semibold">{a.value}</span> · Objetivo {a.via === 'goal' ? '(meta activa)' : '(rango)'}: {a.effectiveMax}
            </p>
            <p className="text-[10px] mt-1 opacity-70">
              {new Date(a.measured_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
