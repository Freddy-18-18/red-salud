'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  ChevronRight,
  FlaskConical,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import { useLabOrders, type LabOrder, type CreateLabOrder } from './use-lab-orders';
import { LabOrderForm } from './lab-order-form';
import { LabResultsView } from './lab-results-view';

// ============================================================================
// STATUS MAP
// ============================================================================

const STATUS_PIPELINE: Array<{ key: string; label: string }> = [
  { key: 'ordered', label: 'Solicitado' },
  { key: 'collected', label: 'Recolectado' },
  { key: 'processing', label: 'En proceso' },
  { key: 'completed', label: 'Completado' },
];

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ordered: { label: 'Solicitado', variant: 'default' },
  collected: { label: 'Recolectado', variant: 'secondary' },
  processing: { label: 'En proceso', variant: 'secondary' },
  completed: { label: 'Completado', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

const PRIORITY_COLORS: Record<string, string> = {
  routine: 'text-gray-400',
  urgent: 'text-amber-500',
  stat: 'text-red-500',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LabOrdersModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#3B82F6',
}: ModuleComponentProps) {
  // State
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<LabOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const { orders, loading, error, createOrder, refresh } = useLabOrders(
    doctorId,
    {
      patientId,
      status: filterStatus === 'all' ? undefined : filterStatus,
      limit: 50,
    },
  );

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (filterStatus === 'all') return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  // Handlers
  const handleCreate = useCallback(
    async (data: CreateLabOrder) => {
      setIsSubmitting(true);
      const result = await createOrder(data);
      setIsSubmitting(false);
      if (result) {
        setShowForm(false);
      }
    },
    [createOrder],
  );

  // Module actions
  const moduleActions = [
    {
      label: 'Nueva orden',
      onClick: () => setShowForm(true),
      icon: Plus,
    },
  ];

  // If viewing a specific order with results
  if (viewingOrder) {
    return (
      <ModuleWrapper
        moduleKey="lab-orders"
        title="Resultados de Laboratorio"
        icon="FlaskConical"
        themeColor={themeColor}
      >
        <LabResultsView
          order={viewingOrder}
          onBack={() => setViewingOrder(null)}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // If showing form
  if (showForm) {
    return (
      <ModuleWrapper
        moduleKey="lab-orders"
        title="Nueva Orden de Laboratorio"
        icon="FlaskConical"
        themeColor={themeColor}
      >
        <LabOrderForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isSubmitting={isSubmitting}
          specialtySlug={specialtySlug}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  return (
    <ModuleWrapper
      moduleKey="lab-orders"
      title="Laboratorio"
      icon="FlaskConical"
      description="Órdenes y resultados de laboratorio"
      themeColor={themeColor}
      isEmpty={!loading && filteredOrders.length === 0}
      emptyMessage="Sin órdenes de laboratorio"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* ── Status pipeline filter ────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
            filterStatus === 'all'
              ? 'text-white'
              : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
          )}
          style={filterStatus === 'all' ? { backgroundColor: themeColor } : undefined}
        >
          Todos ({orders.length})
        </button>
        {STATUS_PIPELINE.map((step) => {
          const count = orders.filter((o) => o.status === step.key).length;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => setFilterStatus(step.key)}
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full transition-colors whitespace-nowrap',
                filterStatus === step.key
                  ? 'text-white'
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
              )}
              style={
                filterStatus === step.key
                  ? { backgroundColor: themeColor }
                  : undefined
              }
            >
              {step.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Order list ────────────────────────────────────────────── */}
      <div className="space-y-2">
        {filteredOrders.map((order) => {
          const statusCfg = STATUS_BADGE[order.status] ?? STATUS_BADGE.ordered;
          const completedTests = order.tests.filter(
            (t) => t.status !== 'pending',
          ).length;
          const totalTests = order.tests.length;
          const hasAbnormal = order.tests.some(
            (t) => t.status === 'abnormal' || t.status === 'critical',
          );

          return (
            <button
              key={order.id}
              type="button"
              onClick={() => setViewingOrder(order)}
              className="w-full flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors text-left"
            >
              {/* Icon */}
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeColor}10` }}
              >
                <FlaskConical
                  className="h-5 w-5"
                  style={{ color: hasAbnormal ? '#EF4444' : themeColor }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {order.panel_name ?? `Orden #${order.id.slice(0, 8)}`}
                  </p>
                  {hasAbnormal && (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {order.patient_name && (
                    <p className="text-xs text-gray-400 truncate">
                      {order.patient_name}
                    </p>
                  )}
                  <span className="text-xs text-gray-300">
                    {completedTests}/{totalTests} pruebas
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      PRIORITY_COLORS[order.priority] ?? PRIORITY_COLORS.routine,
                    )}
                  >
                    {order.priority === 'stat'
                      ? 'STAT'
                      : order.priority === 'urgent'
                        ? 'Urgente'
                        : ''}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <Badge variant={statusCfg.variant} className="shrink-0 text-xs">
                {statusCfg.label}
              </Badge>

              {/* Date */}
              <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                {new Date(order.created_at).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                })}
              </p>

              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
