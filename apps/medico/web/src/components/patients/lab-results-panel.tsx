'use client';

/**
 * @file lab-results-panel.tsx
 * @description Lab orders + results panel for the Labs tab.
 *
 * UX:
 * - Orders are listed newest-first (by `ordered_at`).
 * - Clicking an order expands it inline, fetching `lab_results` on demand.
 * - Each result renders a table of parameter values; abnormal rows get a
 *   `bg-destructive/10` highlight so the doctor can scan quickly.
 *
 * Why fetch results lazily: a single patient can have dozens of orders with
 * tens of values each. Preloading all of them on tab open would hurt the
 * Resumen-to-Labs jump on slow connections — let the doctor choose what to
 * open.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FlaskConical,
} from 'lucide-react';
import { EmptyState, Skeleton } from '@red-salud/design-system';

import { supabase } from '@/lib/supabase/client';
import {
  listLabOrders,
  listLabResultsForOrder,
  type ServiceError,
} from '@/lib/supabase/services/patient-clinical-service';
import type {
  PatientLabOrderRow,
  PatientLabResultRow,
  PatientLabResultValueRow,
} from '@red-salud/types';

interface LabResultsPanelProps {
  patientId: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return '--';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Caracas',
  });
}

function formatDateTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  const day = parsed.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Caracas',
  });
  const time = parsed.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Caracas',
  });
  return `${day} · ${time}`;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pendiente: { label: 'Pendiente', cls: 'bg-info/10 text-info' },
  programada: { label: 'Programada', cls: 'bg-info/10 text-info' },
  en_proceso: { label: 'En proceso', cls: 'bg-warning/10 text-warning' },
  procesando: { label: 'Procesando', cls: 'bg-warning/10 text-warning' },
  listo: { label: 'Listo', cls: 'bg-success/10 text-success' },
  finalizada: { label: 'Finalizada', cls: 'bg-success/10 text-success' },
  cancelada: { label: 'Cancelada', cls: 'bg-destructive/10 text-destructive' },
};

const PRIORITY_LABELS: Record<string, { label: string; cls: string }> = {
  normal: { label: 'Normal', cls: 'bg-muted text-muted-foreground' },
  urgente: { label: 'Urgente', cls: 'bg-warning/10 text-warning' },
  critica: { label: 'Crítica', cls: 'bg-destructive/10 text-destructive' },
};

export function LabResultsPanel({ patientId }: LabResultsPanelProps) {
  const ordersQuery = useQuery({
    queryKey: ['patients', 'lab-orders', patientId],
    queryFn: async () => {
      const result = await listLabOrders(supabase, patientId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(patientId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(orderId: string) {
    setExpanded((prev) => (prev === orderId ? null : orderId));
  }

  if (ordersQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (ordersQuery.isError) {
    const err = ordersQuery.error as unknown as ServiceError | undefined;
    return (
      <InlineError
        message={err?.message ?? 'No pudimos cargar las órdenes de laboratorio.'}
        onRetry={() => void ordersQuery.refetch()}
      />
    );
  }

  const orders = ordersQuery.data ?? [];
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Sin órdenes de laboratorio"
        description="Las órdenes y resultados de laboratorio del paciente van a aparecer acá."
        size="compact"
        className="border-0 bg-transparent"
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          expanded={expanded === order.id}
          onToggle={() => toggle(order.id)}
        />
      ))}
    </div>
  );
}

interface OrderCardProps {
  order: PatientLabOrderRow;
  expanded: boolean;
  onToggle: () => void;
}

function OrderCard({ order, expanded, onToggle }: OrderCardProps) {
  const status = STATUS_LABELS[order.status] ?? {
    label: order.status,
    cls: 'bg-muted text-muted-foreground',
  };
  const priority = PRIORITY_LABELS[order.prioridad] ?? {
    label: order.prioridad,
    cls: 'bg-muted text-muted-foreground',
  };

  return (
    <article className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
          <FlaskConical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-medium text-foreground truncate">
              {order.order_number}
            </p>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.cls}`}
            >
              {status.label}
            </span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priority.cls}`}
            >
              {priority.label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Ordenada el {formatDate(order.ordered_at)}
            {order.estimated_delivery_at && (
              <> · entrega estimada {formatDate(order.estimated_delivery_at)}</>
            )}
          </p>
          {order.presumptive_diagnosis && (
            <p className="text-xs text-muted-foreground mt-1">
              Diagnóstico presuntivo: {order.presumptive_diagnosis}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border/60 p-3 bg-muted/20">
          <OrderResults orderId={order.id} />
        </div>
      )}
    </article>
  );
}

function OrderResults({ orderId }: { orderId: string }) {
  const query = useQuery({
    queryKey: ['patients', 'lab-results', orderId],
    queryFn: async () => {
      const result = await listLabResultsForOrder(supabase, orderId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: Boolean(orderId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  if (query.isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }

  if (query.isError) {
    const err = query.error as unknown as ServiceError | undefined;
    return (
      <InlineError
        message={err?.message ?? 'No pudimos cargar los resultados.'}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const results = query.data ?? [];
  if (results.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Esta orden todavía no tiene resultados cargados.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <ResultBlock key={result.id} result={result} />
      ))}
    </div>
  );
}

function ResultBlock({ result }: { result: PatientLabResultRow }) {
  return (
    <div className="rounded-md border border-border/60 bg-card">
      <header className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <p className="text-xs text-muted-foreground">
          Resultado del {formatDateTime(result.result_at)}
        </p>
        {result.has_abnormal && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
            Valores anormales
          </span>
        )}
      </header>
      {result.general_observations && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/40">
          {result.general_observations}
        </div>
      )}
      {result.values.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-3 py-1.5">Parámetro</th>
                <th className="text-left font-medium px-3 py-1.5">Valor</th>
                <th className="text-left font-medium px-3 py-1.5">Unidad</th>
                <th className="text-left font-medium px-3 py-1.5">
                  Rango referencia
                </th>
              </tr>
            </thead>
            <tbody>
              {result.values.map((value) => (
                <ValueRow key={value.id} value={value} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ValueRow({ value }: { value: PatientLabResultValueRow }) {
  const rowCls = value.es_anormal
    ? 'bg-destructive/10 text-destructive'
    : 'text-foreground';
  return (
    <tr className={`border-t border-border/30 ${rowCls}`}>
      <td className="px-3 py-1.5 font-medium">{value.parametro}</td>
      <td className="px-3 py-1.5 tabular-nums">{value.valor ?? '--'}</td>
      <td className="px-3 py-1.5">{value.unidad ?? '--'}</td>
      <td className="px-3 py-1.5">{value.rango_referencia ?? '--'}</td>
    </tr>
  );
}

function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-destructive">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center text-xs font-medium text-destructive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Reintentá
          </button>
        )}
      </div>
    </div>
  );
}
