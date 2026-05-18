'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  useDoctorAppointments,
  useDoctorSchedule,
  useRescheduleAppointment,
  useTimeBlocks,
  useUpdateAppointmentStatus,
} from '@red-salud/core';
import { useActiveSede } from '@/hooks/use-active-sede';
import { supabase } from '@/lib/supabase/client';
import {
  emptyFilters,
  formatDateKey,
  getMonthGrid,
  getWeekDays,
  matchesFilters,
  type AgendaFilters,
  type Appointment,
  type ViewMode,
} from './_components/agenda-shared';
import { useOfflinePatientsMap } from './_components/use-offline-patients-map';
import { AgendaToolbar } from './_components/agenda-toolbar';
import { TimeGrid } from './_components/agenda-time-grid';
import { MonthGrid } from './_components/agenda-month-grid';
import { AppointmentModal } from './_components/appointment-modal';

export default function AgendaPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState<AgendaFilters>(() => emptyFilters());

  /**
   * Mobile detection — el TimeGrid de 7 columnas es ilegible en pantallas
   * <640px, así que forzamos vista 'day' (state change, NO render branch).
   *
   * IMPORTANTE: la visibilidad del botón "Semana" en el ViewToggle se
   * resuelve con CSS (`hidden sm:inline-flex`), no con este flag — sino
   * generaríamos hydration mismatch en `<FiltersPopover>` por divergencia
   * del counter de useId() de Radix.
   */
  useEffect(() => {
    const detect = () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth < 640;
      if (mobile && viewMode === 'week') setViewMode('day');
    };
    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, [viewMode]);

  // Altura dinámica — compensa header (56px) + bottom-nav (108 mobile / 32 desktop)
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [frameHeight, setFrameHeight] = useState<number>(600);

  useLayoutEffect(() => {
    const update = () => {
      if (!wrapperRef.current) return;
      const top = wrapperRef.current.getBoundingClientRect().top;
      const isDesktop = window.innerWidth >= 1024;
      const bottomReserve = isDesktop ? 32 : 108;
      const next = Math.max(window.innerHeight - top - bottomReserve, 460);
      setFrameHeight(next);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      return { start: formatDateKey(currentDate), end: formatDateKey(currentDate) };
    }
    if (viewMode === 'week') {
      const w = getWeekDays(currentDate);
      return { start: formatDateKey(w[0]), end: formatDateKey(w[6]) };
    }
    const grid = getMonthGrid(currentDate);
    return { start: formatDateKey(grid[0]), end: formatDateKey(grid[41]) };
  }, [currentDate, viewMode]);

  const { activeSedeId } = useActiveSede();

  const {
    appointments: rawAppointments,
    loading,
    refresh: fetchAppointments,
  } = useDoctorAppointments(supabase, userId, {
    dateRange,
    locationId: activeSedeId,
  });

  const { map: offlinePatientsMap } = useOfflinePatientsMap(userId);
  const { weeklySchedule } = useDoctorSchedule(supabase, userId);
  const { timeBlocks } = useTimeBlocks(supabase, userId);

  const appointments = useMemo<Appointment[]>(
    () =>
      rawAppointments.map((apt) => {
        // El SELECT del core usa `*`, así que offline_patient_id viene aunque
        // el tipo AppointmentRow no lo declare. Casteamos puntualmente.
        const offlineId = (apt as unknown as { offline_patient_id?: string | null }).offline_patient_id ?? null;
        const offline = offlineId ? offlinePatientsMap.get(offlineId) : null;

        return {
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
            : offline
              ? {
                  id: offline.id,
                  full_name: offline.full_name,
                  avatar_url: null,
                  telefono: offline.phone ?? null,
                }
              : null,
        };
      }),
    [rawAppointments, offlinePatientsMap],
  );

  const filteredAppointments = useMemo(
    () => appointments.filter((apt) => matchesFilters(apt, filters)),
    [appointments, filters],
  );

  const kpis = useMemo(() => {
    const c: Record<string, number> = {};
    for (const apt of filteredAppointments) c[apt.status] = (c[apt.status] ?? 0) + 1;
    return {
      total: filteredAppointments.length,
      confirmed: c.confirmed ?? 0,
      pending: (c.scheduled ?? 0) + (c.waiting ?? 0),
      cancelled: (c.cancelled ?? 0) + (c.no_show ?? 0),
    };
  }, [filteredAppointments]);

  /**
   * Realtime — antes refetcheábamos en CADA cambio de cualquier cita del
   * doctor, incluso fuera del rango visible. Ahora chequeamos si la cita
   * (en su estado nuevo O viejo) cae dentro de `[dateRange.start, end]`.
   *
   * Casos cubiertos:
   *  - INSERT en rango visible       → new dentro    → refetch
   *  - DELETE de cita visible         → old dentro    → refetch
   *  - UPDATE que mueve cita AL rango → new dentro    → refetch
   *  - UPDATE que mueve cita FUERA    → old dentro    → refetch (limpia)
   *  - Cambio fuera del rango         → ninguno       → ignorar
   */
  useEffect(() => {
    if (!userId) return;
    const inRange = (iso?: string | null) => {
      if (!iso) return false;
      const day = iso.slice(0, 10);
      return day >= dateRange.start && day <= dateRange.end;
    };

    const channel = supabase
      .channel(`agenda-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `doctor_id=eq.${userId}`,
        },
        (payload) => {
          const newRow = payload.new as { scheduled_at?: string | null } | null;
          const oldRow = payload.old as { scheduled_at?: string | null } | null;
          if (inRange(newRow?.scheduled_at) || inRange(oldRow?.scheduled_at)) {
            fetchAppointments();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchAppointments, dateRange.start, dateRange.end]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      const delta = direction === 'next' ? 1 : -1;
      if (viewMode === 'day') d.setDate(d.getDate() + delta);
      else if (viewMode === 'week') d.setDate(d.getDate() + delta * 7);
      else d.setMonth(d.getMonth() + delta);
      return d;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const { updateStatus: coreUpdateStatus } = useUpdateAppointmentStatus(supabase);
  const { reschedule: coreReschedule } = useRescheduleAppointment(supabase);

  const updateStatus = useCallback(async (id: string, newStatus: string) => {
    await coreUpdateStatus(id, newStatus);
    fetchAppointments();
    setSelectedAppointment(null);
  }, [coreUpdateStatus, fetchAppointments]);

  const rescheduleAppointment = useCallback(async (id: string, newScheduledAt: Date) => {
    await coreReschedule(id, newScheduledAt);
    fetchAppointments();
  }, [coreReschedule, fetchAppointments]);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const today = useMemo(() => new Date(), []);

  const viewLabel = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    if (viewMode === 'week') {
      return `${weekDays[0].toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })} — ${weekDays[6].toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
  }, [currentDate, viewMode, weekDays]);

  const handleSelectDateFromMonth = useCallback((d: Date) => {
    setCurrentDate(d);
    setViewMode('day');
  }, []);

  const handleCreateAt = useCallback(
    (day: Date, time: string) => {
      const fecha = formatDateKey(day);
      router.push(`/dashboard/agenda/nueva?fecha=${fecha}&hora=${time}`);
    },
    [router],
  );

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      style={{ height: frameHeight }}
    >
      <AgendaToolbar
        viewMode={viewMode}
        viewLabel={viewLabel}
        kpis={kpis}
        filters={filters}
        onFiltersChange={setFilters}
        onNavigate={navigate}
        onToday={goToToday}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'month' ? (
        <MonthGrid
          date={currentDate}
          today={today}
          appointments={filteredAppointments}
          loading={loading}
          onSelectDate={handleSelectDateFromMonth}
        />
      ) : (
        <TimeGrid
          viewMode={viewMode}
          visibleDays={viewMode === 'week' ? weekDays : [currentDate]}
          today={today}
          appointments={filteredAppointments}
          loading={loading}
          onSelectAppointment={setSelectedAppointment}
          onReschedule={rescheduleAppointment}
          onCreateAt={handleCreateAt}
          weeklySchedule={weeklySchedule}
          timeBlocks={timeBlocks}
        />
      )}

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
