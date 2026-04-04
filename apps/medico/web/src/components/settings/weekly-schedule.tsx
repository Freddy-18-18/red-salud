'use client';

import { useState, useCallback } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Coffee,
  Save,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { WeeklyScheduleRow, BreakSlot, TimeSlot } from '@/hooks/use-doctor-schedule';

// ============================================================================
// CONSTANTS
// ============================================================================

const DAYS_ES: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miercoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sabado',
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

const BUFFER_OPTIONS = [
  { value: 0, label: 'Sin buffer' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

// ============================================================================
// PROPS
// ============================================================================

interface WeeklyScheduleProps {
  schedule: WeeklyScheduleRow[];
  consultationDuration: number;
  saving: boolean;
  onScheduleChange: (schedule: WeeklyScheduleRow[]) => void;
  onSave: (schedule: WeeklyScheduleRow[]) => void;
  onDurationChange: (duration: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WeeklySchedule({
  schedule,
  consultationDuration,
  saving,
  onScheduleChange,
  onSave,
  onDurationChange,
}: WeeklyScheduleProps) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getDay = useCallback(
    (dow: number) => schedule.find((s) => s.day_of_week === dow),
    [schedule],
  );

  const updateDay = useCallback(
    (dow: number, updates: Partial<WeeklyScheduleRow>) => {
      const next = schedule.map((s) =>
        s.day_of_week === dow ? { ...s, ...updates } : s,
      );
      onScheduleChange(next);
    },
    [schedule, onScheduleChange],
  );

  const toggleDay = useCallback(
    (dow: number) => {
      const day = getDay(dow);
      if (!day) return;
      const isActive = !day.is_active;
      updateDay(dow, {
        is_active: isActive,
        slots: isActive && day.slots.length === 0
          ? [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
          : day.slots,
        breaks: isActive && day.breaks.length === 0
          ? [{ label: 'Almuerzo', start: '12:00', end: '14:00' }]
          : day.breaks,
      });
    },
    [getDay, updateDay],
  );

  const updateSlot = useCallback(
    (dow: number, idx: number, field: 'start' | 'end', value: string) => {
      const day = getDay(dow);
      if (!day) return;
      const slots = [...day.slots];
      slots[idx] = { ...slots[idx], [field]: value };
      updateDay(dow, { slots });
    },
    [getDay, updateDay],
  );

  const addSlot = useCallback(
    (dow: number) => {
      const day = getDay(dow);
      if (!day) return;
      const lastEnd = day.slots.length > 0 ? day.slots[day.slots.length - 1].end : '14:00';
      const newStart = lastEnd;
      const [h] = lastEnd.split(':').map(Number);
      const newEnd = `${String(Math.min(h + 4, 23)).padStart(2, '0')}:00`;
      updateDay(dow, { slots: [...day.slots, { start: newStart, end: newEnd }] });
    },
    [getDay, updateDay],
  );

  const removeSlot = useCallback(
    (dow: number, idx: number) => {
      const day = getDay(dow);
      if (!day) return;
      updateDay(dow, { slots: day.slots.filter((_, i) => i !== idx) });
    },
    [getDay, updateDay],
  );

  const addBreak = useCallback(
    (dow: number) => {
      const day = getDay(dow);
      if (!day) return;
      updateDay(dow, {
        breaks: [...day.breaks, { label: 'Descanso', start: '12:00', end: '13:00' }],
      });
    },
    [getDay, updateDay],
  );

  const updateBreak = useCallback(
    (dow: number, idx: number, field: keyof BreakSlot, value: string) => {
      const day = getDay(dow);
      if (!day) return;
      const breaks = [...day.breaks];
      breaks[idx] = { ...breaks[idx], [field]: value };
      updateDay(dow, { breaks });
    },
    [getDay, updateDay],
  );

  const removeBreak = useCallback(
    (dow: number, idx: number) => {
      const day = getDay(dow);
      if (!day) return;
      updateDay(dow, { breaks: day.breaks.filter((_, i) => i !== idx) });
    },
    [getDay, updateDay],
  );

  const handleSave = useCallback(async () => {
    onSave(schedule);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }, [schedule, onSave]);

  // Compute estimated slots for a day
  const estimateSlotCount = (day: WeeklyScheduleRow): number => {
    if (!day.is_active) return 0;
    let totalMinutes = 0;
    for (const slot of day.slots) {
      const [sh, sm] = slot.start.split(':').map(Number);
      const [eh, em] = slot.end.split(':').map(Number);
      totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
    }
    for (const brk of day.breaks) {
      const [sh, sm] = brk.start.split(':').map(Number);
      const [eh, em] = brk.end.split(':').map(Number);
      totalMinutes -= (eh * 60 + em) - (sh * 60 + sm);
    }
    const perAppt = consultationDuration + (day.buffer_after_mins ?? 0);
    return perAppt > 0 ? Math.max(0, Math.floor(totalMinutes / perAppt)) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Global settings */}
      <div className="flex flex-wrap gap-4 p-4 bg-blue-50/60 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <label className="text-sm font-medium text-gray-700">Duracion consulta</label>
          <select
            value={consultationDuration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {DURATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : saveSuccess ? 'Guardado' : 'Guardar horario'}
          </button>
        </div>
      </div>

      {/* Day rows */}
      <div className="space-y-3">
        {DAY_ORDER.map((dow) => {
          const day = getDay(dow);
          if (!day) return null;
          const slotCount = estimateSlotCount(day);

          return (
            <div
              key={dow}
              className={`rounded-xl border transition-colors ${
                day.is_active
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center gap-4 px-4 py-3">
                {/* Toggle */}
                <button
                  onClick={() => toggleDay(dow)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    day.is_active ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  aria-label={`Toggle ${DAYS_ES[dow]}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      day.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Day name */}
                <span
                  className={`w-24 text-sm font-semibold ${
                    day.is_active ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {DAYS_ES[dow]}
                </span>

                {/* Summary */}
                {day.is_active ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      ~{slotCount} citas
                    </span>
                    {day.breaks.length > 0 && (
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Coffee className="h-3 w-3" />
                        {day.breaks.length} {day.breaks.length === 1 ? 'descanso' : 'descansos'}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No disponible</span>
                )}

                {/* Buffer & max */}
                {day.is_active && (
                  <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-gray-400">Buffer</label>
                      <select
                        value={day.buffer_after_mins}
                        onChange={(e) =>
                          updateDay(dow, { buffer_after_mins: Number(e.target.value) })
                        }
                        className="px-2 py-1 text-xs rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        {BUFFER_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-gray-400">Max citas</label>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={day.max_appointments ?? ''}
                        onChange={(e) =>
                          updateDay(dow, {
                            max_appointments: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="-"
                        className="w-14 px-2 py-1 text-xs rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300 text-center"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Slots & breaks (expanded when active) */}
              {day.is_active && (
                <div className="px-4 pb-4 pt-1 space-y-3">
                  {/* Time slots */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Horarios de atencion
                    </p>
                    {day.slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <TimeInput
                          value={slot.start}
                          onChange={(v) => updateSlot(dow, idx, 'start', v)}
                        />
                        <span className="text-gray-400 text-sm">a</span>
                        <TimeInput
                          value={slot.end}
                          onChange={(v) => updateSlot(dow, idx, 'end', v)}
                        />
                        {day.slots.length > 1 && (
                          <button
                            onClick={() => removeSlot(dow, idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Eliminar horario"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addSlot(dow)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar horario
                    </button>
                  </div>

                  {/* Breaks */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Descansos
                    </p>
                    {day.breaks.map((brk, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={brk.label}
                          onChange={(e) => updateBreak(dow, idx, 'label', e.target.value)}
                          placeholder="Almuerzo"
                          className="w-28 px-2 py-1.5 text-xs rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
                        />
                        <TimeInput
                          value={brk.start}
                          onChange={(v) => updateBreak(dow, idx, 'start', v)}
                        />
                        <span className="text-gray-400 text-xs">a</span>
                        <TimeInput
                          value={brk.end}
                          onChange={(v) => updateBreak(dow, idx, 'end', v)}
                        />
                        <button
                          onClick={() => removeBreak(dow, idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Eliminar descanso"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addBreak(dow)}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      <Coffee className="h-3.5 w-3.5" />
                      Agregar descanso
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Visual preview */}
      <SchedulePreview
        schedule={schedule}
        consultationDuration={consultationDuration}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1.5 text-xs rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  );
}

function SchedulePreview({
  schedule,
  consultationDuration,
}: {
  schedule: WeeklyScheduleRow[];
  consultationDuration: number;
}) {
  const activeDays = DAY_ORDER
    .map((dow) => schedule.find((s) => s.day_of_week === dow))
    .filter((d): d is WeeklyScheduleRow => !!d && d.is_active);

  if (activeDays.length === 0) return null;

  // Find earliest start and latest end across all days
  let minHour = 24;
  let maxHour = 0;
  for (const day of activeDays) {
    for (const slot of day.slots) {
      const sh = parseInt(slot.start.split(':')[0]);
      const eh = parseInt(slot.end.split(':')[0]);
      if (sh < minHour) minHour = sh;
      if (eh > maxHour) maxHour = eh;
    }
  }
  if (minHour >= maxHour) return null;

  const totalHours = maxHour - minHour;
  const hourLabels = Array.from({ length: totalHours + 1 }, (_, i) => minHour + i);

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        Vista previa semanal
      </p>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex mb-1 ml-24">
            {hourLabels.map((h) => (
              <div
                key={h}
                className="text-[10px] text-gray-400"
                style={{ width: `${100 / totalHours}%` }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day bars */}
          {DAY_ORDER.map((dow) => {
            const day = schedule.find((s) => s.day_of_week === dow);
            if (!day) return null;

            return (
              <div key={dow} className="flex items-center mb-1.5">
                <span
                  className={`w-24 text-xs font-medium pr-3 text-right ${
                    day.is_active ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  {DAYS_ES[dow]}
                </span>
                <div className="flex-1 relative h-7 bg-gray-100 rounded-md overflow-hidden">
                  {day.is_active &&
                    day.slots.map((slot, idx) => {
                      const [sh, sm] = slot.start.split(':').map(Number);
                      const [eh, em] = slot.end.split(':').map(Number);
                      const startPct =
                        ((sh * 60 + sm - minHour * 60) / (totalHours * 60)) * 100;
                      const widthPct =
                        (((eh * 60 + em) - (sh * 60 + sm)) / (totalHours * 60)) * 100;

                      return (
                        <div
                          key={idx}
                          className="absolute top-0.5 bottom-0.5 bg-blue-400/80 rounded-sm"
                          style={{
                            left: `${startPct}%`,
                            width: `${widthPct}%`,
                          }}
                        />
                      );
                    })}
                  {day.is_active &&
                    day.breaks.map((brk, idx) => {
                      const [sh, sm] = brk.start.split(':').map(Number);
                      const [eh, em] = brk.end.split(':').map(Number);
                      const startPct =
                        ((sh * 60 + sm - minHour * 60) / (totalHours * 60)) * 100;
                      const widthPct =
                        (((eh * 60 + em) - (sh * 60 + sm)) / (totalHours * 60)) * 100;

                      return (
                        <div
                          key={`brk-${idx}`}
                          className="absolute top-0.5 bottom-0.5 bg-amber-300/70 rounded-sm border border-amber-400/50"
                          style={{
                            left: `${startPct}%`,
                            width: `${widthPct}%`,
                          }}
                          title={brk.label}
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 ml-24">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-blue-400/80" />
              <span className="text-[10px] text-gray-500">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-amber-300/70 border border-amber-400/50" />
              <span className="text-[10px] text-gray-500">Descanso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-gray-100" />
              <span className="text-[10px] text-gray-500">No disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
