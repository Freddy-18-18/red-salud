'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  CalendarOff,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { AvailabilityException, TimeSlot } from '@/hooks/use-doctor-schedule';

// ============================================================================
// PROPS
// ============================================================================

interface AvailabilityExceptionsProps {
  exceptions: AvailabilityException[];
  doctorId: string;
  saving: boolean;
  onAdd: (exception: Omit<AvailabilityException, 'id'>) => void;
  onDelete: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AvailabilityExceptions({
  exceptions,
  doctorId,
  saving,
  onAdd,
  onDelete,
}: AvailabilityExceptionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'unavailable' | 'custom'>('unavailable');
  const [form, setForm] = useState({
    date: '',
    reason: '',
    custom_slots: [{ start: '09:00', end: '13:00' }] as TimeSlot[],
  });

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const resetForm = useCallback(() => {
    setForm({
      date: '',
      reason: '',
      custom_slots: [{ start: '09:00', end: '13:00' }],
    });
    setFormType('unavailable');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.date) return;

    onAdd({
      doctor_id: doctorId,
      date: form.date,
      is_available: formType === 'custom',
      reason: form.reason.trim() || null,
      custom_slots: formType === 'custom' ? form.custom_slots : null,
    });

    resetForm();
    setShowForm(false);
  }, [form, formType, doctorId, onAdd, resetForm]);

  // Calendar helpers
  const exceptionDates = useMemo(
    () => new Set(exceptions.map((e) => e.date)),
    [exceptions],
  );

  const exceptionMap = useMemo(
    () => new Map(exceptions.map((e) => [e.date, e])),
    [exceptions],
  );

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun

    const days: Array<{ date: string; dayNum: number; isCurrentMonth: boolean }> = [];

    // Previous month padding
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const dt = new Date(year, month - 1, d);
      days.push({
        date: dt.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dt = new Date(year, month, d);
      days.push({
        date: dt.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remaining = 42 - days.length; // 6 rows
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(year, month + 1, d);
      days.push({
        date: dt.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [calendarMonth]);

  const monthLabel = new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString(
    'es-VE',
    { month: 'long', year: 'numeric' },
  );

  const navigateMonth = (delta: number) => {
    setCalendarMonth((prev) => {
      const d = new Date(prev.year, prev.month + delta);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Excepciones de disponibilidad</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Marca dias como no disponibles o configura horarios especiales
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancelar' : 'Nueva excepcion'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setFormType('unavailable')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                formType === 'unavailable'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CalendarOff className="h-4 w-4" />
              Dia no disponible
            </button>
            <button
              onClick={() => setFormType('custom')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
                formType === 'custom'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CalendarCheck className="h-4 w-4" />
              Horario especial
            </button>
          </div>

          {/* Date picker */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha</label>
            <input
              type="date"
              value={form.date}
              min={today}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder={
                formType === 'unavailable'
                  ? 'Ej: Dia libre, enfermedad, compromiso personal'
                  : 'Ej: Solo atencion en la manana'
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-gray-300"
            />
          </div>

          {/* Custom slots (only for custom hours) */}
          {formType === 'custom' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 block">
                Horarios para este dia
              </label>
              {form.custom_slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => {
                      const slots = [...form.custom_slots];
                      slots[idx] = { ...slots[idx], start: e.target.value };
                      setForm((f) => ({ ...f, custom_slots: slots }));
                    }}
                    className="px-2 py-1.5 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="text-sm text-gray-400">a</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => {
                      const slots = [...form.custom_slots];
                      slots[idx] = { ...slots[idx], end: e.target.value };
                      setForm((f) => ({ ...f, custom_slots: slots }));
                    }}
                    className="px-2 py-1.5 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {form.custom_slots.length > 1 && (
                    <button
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          custom_slots: f.custom_slots.filter((_, i) => i !== idx),
                        }));
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    custom_slots: [...f.custom_slots, { start: '14:00', end: '18:00' }],
                  }))
                }
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar horario
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || !form.date}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {formType === 'unavailable' ? 'Marcar como no disponible' : 'Guardar horario especial'}
          </button>
        </div>
      )}

      {/* Calendar view */}
      <div className="p-4 bg-white rounded-xl border border-gray-200">
        {/* Calendar navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-900 capitalize">{monthLabel}</span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map(({ date, dayNum, isCurrentMonth }) => {
            const exception = exceptionMap.get(date);
            const isToday = date === today;
            const isPast = date < today;

            let cellClass = 'text-gray-900';
            let dotClass = '';

            if (!isCurrentMonth) {
              cellClass = 'text-gray-300';
            } else if (exception) {
              if (!exception.is_available) {
                cellClass = 'text-red-700 font-semibold';
                dotClass = 'bg-red-500';
              } else {
                cellClass = 'text-amber-700 font-semibold';
                dotClass = 'bg-amber-500';
              }
            } else if (isPast) {
              cellClass = 'text-gray-400';
            }

            return (
              <div
                key={date}
                className={`relative flex flex-col items-center py-1.5 rounded-lg text-xs ${
                  isToday ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                } ${isCurrentMonth && exception ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                title={exception ? `${exception.is_available ? 'Horario especial' : 'No disponible'}: ${exception.reason || ''}` : undefined}
              >
                <span className={cellClass}>{dayNum}</span>
                {dotClass && (
                  <div className={`h-1 w-1 rounded-full ${dotClass} mt-0.5`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-gray-500">No disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-gray-500">Horario especial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-[10px] text-gray-500">Hoy</span>
          </div>
        </div>
      </div>

      {/* Exception list */}
      {exceptions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Excepciones configuradas ({exceptions.length})
          </p>
          {exceptions.map((exc) => (
            <ExceptionCard key={exc.id} exception={exc} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-6">
            <CalendarCheck className="h-10 w-10 mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-500">Sin excepciones configuradas</p>
            <p className="text-xs text-gray-400 mt-1">Tu horario semanal regular se aplica todos los dias</p>
          </div>
        )
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ExceptionCard({
  exception,
  onDelete,
}: {
  exception: AvailabilityException;
  onDelete: (id: string) => void;
}) {
  const formatDate = (dateStr: string) => {
    try {
      // Parse as local date to avoid timezone shift
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        exception.is_available
          ? 'bg-amber-50/50 border-amber-100'
          : 'bg-red-50/50 border-red-100'
      }`}
    >
      <div
        className={`p-2 rounded-lg ${
          exception.is_available ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {exception.is_available ? (
          <CalendarCheck className="h-4 w-4" />
        ) : (
          <CalendarOff className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium capitalize ${
            exception.is_available ? 'text-amber-800' : 'text-red-800'
          }`}
        >
          {formatDate(exception.date)}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {exception.is_available ? 'Horario especial' : 'No disponible'}
          {exception.reason && ` — ${exception.reason}`}
        </p>
        {exception.is_available && exception.custom_slots && (
          <div className="flex gap-1.5 mt-1">
            {exception.custom_slots.map((slot, idx) => (
              <span key={idx} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                {slot.start} - {slot.end}
              </span>
            ))}
          </div>
        )}
      </div>
      {exception.id && (
        <button
          onClick={() => onDelete(exception.id!)}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="Eliminar excepcion"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
