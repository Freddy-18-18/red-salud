'use client';

import { useState } from 'react';
import { Pause, Play, CheckCircle2, Plus, Target } from 'lucide-react';
import { Button, Input } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';

import type {
  CreateGoalInput,
  HealthGoalRow,
  MetricTypeRow,
} from './use-chronic-data';

export interface MetasTabProps {
  patientId: string;
  goals: HealthGoalRow[];
  metricTypes: MetricTypeRow[];
  onCreateGoal: (input: CreateGoalInput) => Promise<void>;
  onUpdateStatus: (id: string, status: HealthGoalRow['status']) => Promise<void>;
}

const STATUS_LABEL: Record<HealthGoalRow['status'], string> = {
  pending: 'Pendiente',
  active: 'Activa',
  completed: 'Completada',
  paused: 'En pausa',
};

const STATUS_COLOR: Record<HealthGoalRow['status'], string> = {
  pending: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
};

export function MetasTab({
  patientId,
  goals,
  metricTypes,
  onCreateGoal,
  onUpdateStatus,
}: MetasTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [metricTypeId, setMetricTypeId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [valorObjetivo, setValorObjetivo] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricTypeId || !titulo || !valorObjetivo) return;
    setSubmitting(true);
    try {
      await onCreateGoal({
        patient_id: patientId,
        metric_type_id: metricTypeId,
        titulo,
        valor_objetivo: parseFloat(valorObjetivo),
        target_date: targetDate || null,
      });
      setShowForm(false);
      setMetricTypeId('');
      setTitulo('');
      setValorObjetivo('');
      setTargetDate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Metas ({goals.length})
        </p>
        {!showForm && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nueva meta
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
        >
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Métrica
            </label>
            <select
              value={metricTypeId}
              onChange={(e) => setMetricTypeId(e.target.value)}
              required
              className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm"
            >
              <option value="">Seleccionar métrica…</option>
              {metricTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.unidad_medida})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Título
              </label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: TAS bajo control"
                required
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Valor objetivo
              </label>
              <Input
                type="number"
                step="0.01"
                value={valorObjetivo}
                onChange={(e) => setValorObjetivo(e.target.value)}
                placeholder="130"
                required
                className="h-9"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Fecha objetivo (opcional)
            </label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar meta'}
            </Button>
          </div>
        </form>
      )}

      {goals.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-10 w-10 text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Sin metas registradas</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {goals.map((g) => {
            const type = metricTypes.find((t) => t.id === g.metric_type_id);
            return (
              <li
                key={g.id}
                className="flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-200"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {g.titulo}
                  </p>
                  <p className="text-xs text-gray-500">
                    Objetivo: <span className="font-semibold">{g.valor_objetivo}</span>
                    {type && ` ${type.unidad_medida}`} {type && `· ${type.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded',
                      STATUS_COLOR[g.status],
                    )}
                  >
                    {STATUS_LABEL[g.status]}
                  </span>
                  {g.status === 'active' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(g.id, 'paused')}
                        className="text-gray-400 hover:text-amber-600"
                        title="Pausar"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(g.id, 'completed')}
                        className="text-gray-400 hover:text-blue-600"
                        title="Marcar completada"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {g.status === 'paused' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(g.id, 'active')}
                      className="text-gray-400 hover:text-green-600"
                      title="Reactivar"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
