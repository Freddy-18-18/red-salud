'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  useDoctorAppointments,
  useUpdateAppointmentStatus,
  type AppointmentRow,
} from '@red-salud/core';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Check,
  X,
  RotateCcw,
  Video,
  Plus,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Appointment {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  reason: string | null;
  status: string;
  appointment_type: string | null;
  internal_notes: string | null;
  paciente: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    telefono: string | null;
  } | null;
}

type ViewMode = 'day' | 'week';

// ============================================================================
// STATUS HELPERS
// ============================================================================

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  scheduled: { label: 'Programada', bg: 'bg-blue-100', text: 'text-blue-700' },
  confirmed: { label: 'Confirmada', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  waiting: { label: 'En espera', bg: 'bg-amber-100', text: 'text-amber-700' },
  in_progress: { label: 'En curso', bg: 'bg-purple-100', text: 'text-purple-700' },
  completed: { label: 'Completada', bg: 'bg-gray-100', text: 'text-gray-600' },
  cancelled: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-600' },
  no_show: { label: 'No asistió', bg: 'bg-red-100', text: 'text-red-600' },
};

const TYPE_COLORS: Record<string, string> = {
  in_person: '#3B82F6',
  follow_up: '#10B981',
  telemedicine: '#8B5CF6',
  emergency: '#EF4444',
  first_visit: '#F59E0B',
};

// ============================================================================
// TIME HELPERS
// ============================================================================

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

// ============================================================================
// COMPONENT
// ============================================================================

export default function AgendaPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Get date range for current view
  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      return {
        start: formatDateKey(currentDate),
        end: formatDateKey(currentDate),
      };
    }
    const weekDays = getWeekDays(currentDate);
    return {
      start: formatDateKey(weekDays[0]),
      end: formatDateKey(weekDays[6]),
    };
  }, [currentDate, viewMode]);

  // Fetch appointments via core hook
  const {
    appointments: rawAppointments,
    loading,
    refresh: fetchAppointments,
  } = useDoctorAppointments(supabase, userId, { dateRange });

  // Map core AppointmentRow to local Appointment shape (paciente alias)
  const appointments = useMemo<Appointment[]>(
    () =>
      rawAppointments.map((apt) => ({
        id: apt.id,
        scheduled_at: apt.scheduled_at,
        duration_minutes: apt.duration_minutes,
        reason: apt.reason ?? null,
        status: apt.status,
        appointment_type: apt.appointment_type ?? null,
        internal_notes: apt.internal_notes ?? null,
        paciente: apt.patient
          ? {
              id: apt.patient.id,
              full_name: apt.patient.full_name ?? 'Sin nombre',
              avatar_url: apt.patient.avatar_url ?? null,
              telefono: apt.patient.telefono ?? null,
            }
          : null,
      })),
    [rawAppointments],
  );

  // Real-time subscription — core hook provides initial data, subscription refreshes
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`agenda-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `doctor_id=eq.${userId}`,
      }, () => fetchAppointments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchAppointments]);

  // Navigation
  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'day') {
        d.setDate(d.getDate() + (direction === 'next' ? 1 : -1));
      } else {
        d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
      }
      return d;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  // Update appointment status via core hook
  const { updateStatus: coreUpdateStatus } = useUpdateAppointmentStatus(supabase);

  const updateStatus = useCallback(async (id: string, newStatus: string) => {
    await coreUpdateStatus(id, newStatus);
    fetchAppointments();
    setSelectedAppointment(null);
  }, [coreUpdateStatus, fetchAppointments]);

  const weekDays = getWeekDays(currentDate);
  const today = new Date();

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const apt of appointments) {
      const key = apt.scheduled_at.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(apt);
    }
    return map;
  }, [appointments]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gestión de citas y horarios disponibles
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('prev')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button onClick={() => navigate('next')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Hoy
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          {viewMode === 'day'
            ? currentDate.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })
            : `${weekDays[0].toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })} — ${weekDays[6].toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}`
          }
        </h2>

        <div className="text-sm text-gray-500">
          {appointments.length} cita{appointments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Calendar grid */}
      {viewMode === 'week' ? (
        <WeekView
          weekDays={weekDays}
          appointmentsByDate={appointmentsByDate}
          today={today}
          loading={loading}
          onSelectAppointment={setSelectedAppointment}
        />
      ) : (
        <DayView
          date={currentDate}
          appointments={appointmentsByDate[formatDateKey(currentDate)] ?? []}
          loading={loading}
          onSelectAppointment={setSelectedAppointment}
        />
      )}

      {/* Appointment detail modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}

// ============================================================================
// WEEK VIEW
// ============================================================================

function WeekView({
  weekDays,
  appointmentsByDate,
  today,
  loading,
  onSelectAppointment,
}: {
  weekDays: Date[];
  appointmentsByDate: Record<string, Appointment[]>;
  today: Date;
  loading: boolean;
  onSelectAppointment: (apt: Appointment) => void;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
              <div className="h-20 bg-gray-100 rounded" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className={`text-center py-3 ${isToday ? 'bg-blue-50' : ''} ${i < 6 ? 'border-r border-gray-200' : ''}`}
            >
              <p className="text-xs font-medium text-gray-500">{DAY_NAMES[i]}</p>
              <p className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDays.map((day, i) => {
          const dateKey = formatDateKey(day);
          const dayAppts = appointmentsByDate[dateKey] ?? [];
          const isToday = isSameDay(day, today);

          return (
            <div
              key={i}
              className={`p-2 ${isToday ? 'bg-blue-50/30' : ''} ${i < 6 ? 'border-r border-gray-100' : ''}`}
            >
              {dayAppts.length === 0 ? (
                <p className="text-xs text-gray-300 text-center mt-4">Disponible</p>
              ) : (
                <div className="space-y-1.5">
                  {dayAppts.map((apt) => {
                    const time = new Date(apt.scheduled_at);
                    const color = TYPE_COLORS[apt.appointment_type ?? 'in_person'] ?? '#6B7280';
                    const status = STATUS_CONFIG[apt.status];

                    return (
                      <button
                        key={apt.id}
                        onClick={() => onSelectAppointment(apt)}
                        className="w-full text-left p-2 rounded-lg border transition-all hover:shadow-sm cursor-pointer"
                        style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
                      >
                        <p className="text-xs font-bold" style={{ color }}>
                          {time.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-gray-700 truncate mt-0.5">
                          {apt.paciente?.full_name ?? 'Sin paciente'}
                        </p>
                        {status && (
                          <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// DAY VIEW
// ============================================================================

function DayView({
  date,
  appointments,
  loading,
  onSelectAppointment,
}: {
  date: Date;
  appointments: Appointment[];
  loading: boolean;
  onSelectAppointment: (apt: Appointment) => void;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 py-3">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="flex-1 h-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Map appointments by hour
  const aptByHour: Record<number, Appointment[]> = {};
  for (const apt of appointments) {
    const hour = new Date(apt.scheduled_at).getHours();
    if (!aptByHour[hour]) aptByHour[hour] = [];
    aptByHour[hour].push(apt);
  }

  const now = new Date();
  const currentHour = isSameDay(now, date) ? now.getHours() : -1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {HOURS.map((hour) => {
        const hourAppts = aptByHour[hour] ?? [];
        const isCurrent = hour === currentHour;

        return (
          <div
            key={hour}
            className={`flex border-b border-gray-100 last:border-b-0 ${isCurrent ? 'bg-blue-50/30' : ''}`}
          >
            {/* Hour label */}
            <div className="w-16 py-3 px-3 text-right border-r border-gray-100 flex-shrink-0">
              <span className={`text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>

            {/* Appointment slots */}
            <div className="flex-1 py-2 px-3 min-h-[56px]">
              {hourAppts.length === 0 ? (
                <div className="h-full flex items-center">
                  <span className="text-xs text-gray-300">Disponible</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {hourAppts.map((apt) => {
                    const time = new Date(apt.scheduled_at);
                    const color = TYPE_COLORS[apt.appointment_type ?? 'in_person'] ?? '#6B7280';

                    return (
                      <button
                        key={apt.id}
                        onClick={() => onSelectAppointment(apt)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all hover:shadow-sm text-left"
                        style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
                      >
                        <div className="w-1 h-10 rounded-full" style={{ backgroundColor: color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {apt.paciente?.full_name ?? 'Sin paciente'}
                            </p>
                            {apt.appointment_type === 'telemedicine' && (
                              <Video className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {time.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                            {' — '}{apt.duration_minutes || 30} min
                            {apt.reason && ` • ${apt.reason}`}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[apt.status]?.bg ?? 'bg-gray-100'} ${STATUS_CONFIG[apt.status]?.text ?? 'text-gray-600'}`}>
                          {STATUS_CONFIG[apt.status]?.label ?? apt.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// APPOINTMENT DETAIL MODAL
// ============================================================================

function AppointmentModal({
  appointment,
  onClose,
  onUpdateStatus,
}: {
  appointment: Appointment;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const time = new Date(appointment.scheduled_at);
  const status = STATUS_CONFIG[appointment.status];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Detalle de cita</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {appointment.paciente?.full_name ?? 'Sin paciente'}
              </p>
              {appointment.paciente?.telefono && (
                <p className="text-xs text-gray-400">{appointment.paciente.telefono}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-700">
                {time.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-xs text-gray-500">
                {time.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                {' — '}{appointment.duration_minutes || 30} min
              </p>
            </div>
          </div>

          {appointment.reason && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-700">{appointment.reason}</p>
            </div>
          )}

          {status && (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              {appointment.appointment_type && (
                <span className="text-xs text-gray-500 capitalize">{appointment.appointment_type}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <>
              <button
                onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Check className="h-4 w-4" /> Confirmar
              </button>
              <button
                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
            </>
          )}
          {appointment.status === 'cancelled' && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'scheduled')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Reprogramar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
