'use client';

import { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  Calendar,
  Repeat,
  AlertCircle,
  Coffee,
  Users,
  Palmtree,
  Zap,
  ClipboardList,
  Briefcase,
  Ban,
  X,
} from 'lucide-react';
import type { TimeBlock, BlockType } from '@/hooks/use-doctor-schedule';

// ============================================================================
// CONSTANTS
// ============================================================================

const BLOCK_TYPE_CONFIG: Record<
  BlockType,
  { label: string; icon: typeof Clock; color: string; bgColor: string }
> = {
  block: {
    label: 'Bloqueo general',
    icon: Ban,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  lunch: {
    label: 'Almuerzo',
    icon: Coffee,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  meeting: {
    label: 'Reunion',
    icon: Users,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  vacation: {
    label: 'Vacaciones',
    icon: Palmtree,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
  },
  emergency: {
    label: 'Emergencia',
    icon: Zap,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  preparation: {
    label: 'Preparacion',
    icon: ClipboardList,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  administrative: {
    label: 'Administrativo',
    icon: Briefcase,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
  },
};

// ============================================================================
// PROPS
// ============================================================================

interface TimeBlocksProps {
  blocks: TimeBlock[];
  doctorId: string;
  saving: boolean;
  onAdd: (block: Omit<TimeBlock, 'id'>) => void;
  onDelete: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TimeBlocks({ blocks, doctorId, saving, onAdd, onDelete }: TimeBlocksProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    block_type: BlockType;
    title: string;
    starts_at: string;
    ends_at: string;
    all_day: boolean;
    is_recurring: boolean;
    recurrence_rule: string;
    notes: string;
  }>({
    block_type: 'block',
    title: '',
    starts_at: '',
    ends_at: '',
    all_day: false,
    is_recurring: false,
    recurrence_rule: '',
    notes: '',
  });

  const resetForm = useCallback(() => {
    setForm({
      block_type: 'block',
      title: '',
      starts_at: '',
      ends_at: '',
      all_day: false,
      is_recurring: false,
      recurrence_rule: '',
      notes: '',
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.title.trim()) return;
    if (!form.all_day && (!form.starts_at || !form.ends_at)) return;

    let startsAt = form.starts_at;
    let endsAt = form.ends_at;

    if (form.all_day) {
      // For all-day blocks, set full day range
      const dateStr = form.starts_at.split('T')[0] || form.starts_at;
      startsAt = `${dateStr}T00:00:00`;
      endsAt = form.ends_at
        ? `${(form.ends_at.split('T')[0] || form.ends_at)}T23:59:59`
        : `${dateStr}T23:59:59`;
    }

    onAdd({
      doctor_id: doctorId,
      block_type: form.block_type,
      title: form.title.trim(),
      starts_at: startsAt,
      ends_at: endsAt,
      all_day: form.all_day,
      is_recurring: form.is_recurring,
      recurrence_rule: form.is_recurring ? form.recurrence_rule || null : null,
      notes: form.notes.trim() || null,
    });

    resetForm();
    setShowForm(false);
  }, [form, doctorId, onAdd, resetForm]);

  // Group blocks: upcoming vs past
  const now = new Date().toISOString();
  const upcoming = blocks.filter((b) => b.ends_at >= now);
  const past = blocks.filter((b) => b.ends_at < now);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Bloqueos de tiempo</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Bloquea periodos especificos para reuniones, vacaciones u otros compromisos
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancelar' : 'Nuevo bloqueo'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Tipo de bloqueo</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(BLOCK_TYPE_CONFIG) as [BlockType, typeof BLOCK_TYPE_CONFIG['block']][]).map(
                ([type, config]) => {
                  const Icon = config.icon;
                  const isSelected = form.block_type === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setForm((f) => ({ ...f, block_type: type }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                        isSelected
                          ? `${config.bgColor} ${config.color} border-current`
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Titulo</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ej: Congreso de cardiologia"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
            />
          </div>

          {/* All day toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm((f) => ({ ...f, all_day: !f.all_day }))}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                form.all_day ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                  form.all_day ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">Todo el dia</span>
          </div>

          {/* Date/time pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {form.all_day ? 'Fecha inicio' : 'Inicio'}
              </label>
              <input
                type={form.all_day ? 'date' : 'datetime-local'}
                value={form.starts_at}
                onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {form.all_day ? 'Fecha fin' : 'Fin'}
              </label>
              <input
                type={form.all_day ? 'date' : 'datetime-local'}
                value={form.ends_at}
                onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm((f) => ({ ...f, is_recurring: !f.is_recurring }))}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                form.is_recurring ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                  form.is_recurring ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700 flex items-center gap-1">
              <Repeat className="h-3.5 w-3.5 text-gray-400" />
              Recurrente
            </span>
          </div>

          {form.is_recurring && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Regla de recurrencia (iCal RRULE)
              </label>
              <input
                type="text"
                value={form.recurrence_rule}
                onChange={(e) => setForm((f) => ({ ...f, recurrence_rule: e.target.value }))}
                placeholder="FREQ=WEEKLY;BYDAY=MO,WE,FR"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300 font-mono text-xs"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Notas (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Detalles adicionales..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300 resize-y"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Crear bloqueo
          </button>
        </div>
      )}

      {/* Upcoming blocks */}
      {upcoming.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Proximos bloqueos ({upcoming.length})
          </p>
          {upcoming.map((block) => (
            <TimeBlockCard key={block.id} block={block} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Sin bloqueos programados</p>
            <p className="text-xs text-gray-400 mt-1">
              Agrega bloqueos para marcar periodos no disponibles
            </p>
          </div>
        )
      )}

      {/* Past blocks (collapsed) */}
      {past.length > 0 && (
        <details className="group">
          <summary className="text-xs font-medium text-gray-400 cursor-pointer hover:text-gray-500 transition-colors">
            Bloqueos pasados ({past.length})
          </summary>
          <div className="mt-2 space-y-2 opacity-60">
            {past.slice(0, 10).map((block) => (
              <TimeBlockCard key={block.id} block={block} onDelete={onDelete} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TimeBlockCard({
  block,
  onDelete,
}: {
  block: TimeBlock;
  onDelete: (id: string) => void;
}) {
  const config = BLOCK_TYPE_CONFIG[block.block_type] ?? BLOCK_TYPE_CONFIG.block;
  const Icon = config.icon;

  const formatDatetime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const formatDateOnly = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-VE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border border-gray-100 ${config.bgColor}`}>
      <div className={`p-2 rounded-lg bg-white/80 ${config.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.color}`}>{block.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {block.all_day
            ? `${formatDateOnly(block.starts_at)} — ${formatDateOnly(block.ends_at)}`
            : `${formatDatetime(block.starts_at)} — ${formatDatetime(block.ends_at)}`}
        </p>
        {block.is_recurring && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 mt-1">
            <Repeat className="h-3 w-3" />
            Recurrente
          </span>
        )}
        {block.notes && (
          <p className="text-xs text-gray-400 mt-1 truncate">{block.notes}</p>
        )}
      </div>
      {block.id && (
        <button
          onClick={() => onDelete(block.id!)}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="Eliminar bloqueo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
