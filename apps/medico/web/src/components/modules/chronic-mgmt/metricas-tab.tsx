'use client';

import { Activity } from 'lucide-react';

import type {
  HealthMetricRow,
  MetricTypeRow,
} from './use-chronic-data';

export interface MetricasTabProps {
  metrics: HealthMetricRow[];
  metricTypes: MetricTypeRow[];
}

export function MetricasTab({ metrics, metricTypes }: MetricasTabProps) {
  if (metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Activity className="h-10 w-10 text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">Sin mediciones registradas</p>
        <p className="text-xs text-gray-300 mt-1">
          Las mediciones se cargan desde la consulta o el seguimiento del paciente
        </p>
      </div>
    );
  }

  const typeById = new Map(metricTypes.map((t) => [t.id, t]));

  const sorted = [...metrics].sort(
    (a, b) =>
      new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime(),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-3 text-gray-400 font-medium">Fecha</th>
            <th className="text-left py-2 pr-3 text-gray-400 font-medium">Métrica</th>
            <th className="text-right py-2 pr-3 text-gray-400 font-medium">Valor</th>
            <th className="text-left py-2 pr-3 text-gray-400 font-medium">Rango</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => {
            const type = typeById.get(m.metric_type_id);
            return (
              <tr key={m.id} className="border-b border-gray-50">
                <td className="py-2 pr-3 text-gray-500">
                  {new Date(m.measured_at).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-2 pr-3 text-gray-700">{type?.name ?? m.metric_type_id}</td>
                <td className="py-2 pr-3 text-right font-semibold text-gray-800">
                  {m.valor}
                  {type && <span className="text-gray-400 font-normal ml-1">{type.unidad_medida}</span>}
                </td>
                <td className="py-2 pr-3 text-gray-400">
                  {type
                    ? `${type.rango_minimo}–${type.rango_maximo} ${type.unidad_medida}`
                    : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
