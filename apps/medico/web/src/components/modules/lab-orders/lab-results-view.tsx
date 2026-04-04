'use client';

import {
  ArrowUp,
  ArrowDown,
  Minus,
  Printer,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { Button, Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { LabOrder, LabTest, TestResultStatus } from './use-lab-orders';

// ============================================================================
// TYPES
// ============================================================================

interface LabResultsViewProps {
  order: LabOrder;
  onBack: () => void;
  themeColor?: string;
}

// ============================================================================
// STATUS MAP
// ============================================================================

const TEST_STATUS_CONFIG: Record<TestResultStatus, { label: string; color: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', color: 'text-gray-400', badgeVariant: 'secondary' },
  normal: { label: 'Normal', color: 'text-emerald-600', badgeVariant: 'outline' },
  abnormal: { label: 'Anormal', color: 'text-amber-600', badgeVariant: 'secondary' },
  critical: { label: 'Crítico', color: 'text-red-600', badgeVariant: 'destructive' },
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  ordered: 'Solicitado',
  collected: 'Recolectado',
  processing: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  routine: { label: 'Rutina', color: 'bg-gray-100 text-gray-600' },
  urgent: { label: 'Urgente', color: 'bg-amber-100 text-amber-700' },
  stat: { label: 'STAT', color: 'bg-red-100 text-red-700' },
};

// ============================================================================
// RESULT INDICATOR
// ============================================================================

function ResultIndicator({ test }: { test: LabTest }) {
  if (!test.result || test.status === 'pending') {
    return <span className="text-sm text-gray-400">Pendiente</span>;
  }

  const numResult = parseFloat(test.result);
  const hasRange = test.reference_min != null && test.reference_max != null;
  const isLow = hasRange && !isNaN(numResult) && numResult < test.reference_min!;
  const isHigh = hasRange && !isNaN(numResult) && numResult > test.reference_max!;

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'text-sm font-medium',
          test.status === 'critical'
            ? 'text-red-600 font-bold'
            : test.status === 'abnormal'
              ? 'text-amber-600 font-semibold'
              : 'text-gray-900',
        )}
      >
        {test.result}
        {test.unit && (
          <span className="text-xs text-gray-400 ml-1">{test.unit}</span>
        )}
      </span>
      {isLow && <ArrowDown className="h-3.5 w-3.5 text-blue-500" />}
      {isHigh && <ArrowUp className="h-3.5 w-3.5 text-red-500" />}
      {hasRange && !isLow && !isHigh && !isNaN(numResult) && (
        <Minus className="h-3.5 w-3.5 text-emerald-500" />
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LabResultsView({
  order,
  onBack,
  themeColor = '#3B82F6',
}: LabResultsViewProps) {
  const priorityCfg = PRIORITY_CONFIG[order.priority] ?? PRIORITY_CONFIG.routine;
  const completedTests = order.tests.filter((t) => t.status !== 'pending').length;
  const totalTests = order.tests.length;
  const hasAbnormal = order.tests.some((t) => t.status === 'abnormal' || t.status === 'critical');

  return (
    <div className="space-y-4">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-base font-semibold text-gray-700">
              {order.panel_name ?? 'Orden de Laboratorio'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  priorityCfg.color,
                )}
              >
                {priorityCfg.label}
              </span>
              <span className="text-xs text-gray-400">
                {completedTests}/{totalTests} completados
              </span>
              {hasAbnormal && (
                <Badge variant="destructive" className="text-[10px]">
                  Valores anormales
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* ── Clinical info ────────────────────────────────────────── */}
      {(order.clinical_indication || order.special_instructions) && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {order.clinical_indication && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Indicación clínica
              </p>
              <p className="text-sm text-gray-700 mt-0.5">
                {order.clinical_indication}
              </p>
            </div>
          )}
          {order.special_instructions && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Instrucciones especiales
              </p>
              <p className="text-sm text-gray-700 mt-0.5">
                {order.special_instructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Results table ────────────────────────────────────────── */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Prueba
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Resultado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">
                Rango de referencia
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {order.tests.map((test) => {
              const statusCfg = TEST_STATUS_CONFIG[test.status] ?? TEST_STATUS_CONFIG.pending;
              const isAbnormal = test.status === 'abnormal' || test.status === 'critical';

              return (
                <tr
                  key={test.id}
                  className={cn(
                    'border-b border-gray-50 last:border-0',
                    isAbnormal && 'bg-red-50/50',
                  )}
                >
                  <td className="px-4 py-3">
                    <p className={cn(
                      'font-medium',
                      isAbnormal ? 'text-red-700' : 'text-gray-700',
                    )}>
                      {test.test_name}
                    </p>
                    {test.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">{test.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ResultIndicator test={test} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {test.reference_range ? (
                      <span className="text-xs text-gray-400">{test.reference_range}</span>
                    ) : test.reference_min != null && test.reference_max != null ? (
                      <span className="text-xs text-gray-400">
                        {test.reference_min} - {test.reference_max}
                        {test.unit && ` ${test.unit}`}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusCfg.badgeVariant} className="text-xs">
                      {statusCfg.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Metadata ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
        <span>
          Creado: {new Date(order.created_at).toLocaleDateString('es-VE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </span>
        {order.patient_name && <span>Paciente: {order.patient_name}</span>}
      </div>
    </div>
  );
}
