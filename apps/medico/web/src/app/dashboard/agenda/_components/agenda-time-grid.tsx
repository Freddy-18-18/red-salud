'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { AlertTriangle, Video } from 'lucide-react';
import type { TimeBlockRow, WeeklyScheduleRow } from '@red-salud/core';
import {
  DAY_START_HOUR,
  DRAG_THRESHOLD_PX,
  HOURS,
  HOUR_HEIGHT_PX,
  SLOT_HEIGHT_PX,
  SLOT_MINUTES,
  STATUS_CONFIG,
  TOTAL_GRID_HEIGHT_PX,
  blockHeight,
  blockTop,
  clamp,
  formatDateKey,
  getTypeStyle,
  isSameDay,
  minutesFromDayStart,
  type Appointment,
  type ViewMode,
} from './agenda-shared';
import { detectOverlapIds } from './detect-overlaps';

type DragState = {
  apt: Appointment;
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  dayColumnWidth: number;
  isDragging: boolean;
};

interface TimeGridProps {
  viewMode: ViewMode;
  visibleDays: Date[];
  today: Date;
  appointments: Appointment[];
  loading: boolean;
  onSelectAppointment: (apt: Appointment) => void;
  onReschedule: (id: string, newScheduledAt: Date) => Promise<void> | void;
  onCreateAt: (day: Date, time: string) => void;
  weeklySchedule: WeeklyScheduleRow[];
  timeBlocks: TimeBlockRow[];
}

export function TimeGrid({
  viewMode,
  visibleDays,
  today,
  appointments,
  loading,
  onSelectAppointment,
  onReschedule,
  onCreateAt,
  weeklySchedule,
  timeBlocks,
}: TimeGridProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const dayCount = visibleDays.length;
  const gridTemplate =
    dayCount === 1
      ? 'grid-cols-[3.25rem_minmax(0,1fr)]'
      : 'grid-cols-[3.25rem_repeat(7,minmax(0,1fr))]';

  useEffect(() => {
    if (!scrollRef.current) return;
    const earliest = appointments.reduce<number | null>((acc, apt) => {
      const m = minutesFromDayStart(new Date(apt.scheduled_at));
      if (m < 0) return acc;
      return acc === null ? m : Math.min(acc, m);
    }, null);
    const targetMinutes = Math.max(0, (earliest ?? 60) - 60);
    const targetPx = (targetMinutes / SLOT_MINUTES) * SLOT_HEIGHT_PX;
    scrollRef.current.scrollTop = targetPx;
  }, [appointments, viewMode]);

  const apptsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const apt of appointments) {
      const key = apt.scheduled_at.slice(0, 10);
      (map[key] ??= []).push(apt);
    }
    return map;
  }, [appointments]);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>, apt: Appointment) => {
      if (e.button !== 0) return;
      const gridEl = gridRef.current;
      if (!gridEl) return;
      const firstDayCol = gridEl.querySelector<HTMLElement>('[data-day-col="0"]');
      const dayColumnWidth =
        firstDayCol?.getBoundingClientRect().width ?? gridEl.clientWidth / (dayCount + 1);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragState({
        apt,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        dayColumnWidth,
        isDragging: false,
      });
    },
    [dayCount],
  );

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    setDragState((state) => {
      if (!state || state.pointerId !== e.pointerId) return state;
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const isDragging =
        state.isDragging || Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX;
      return { ...state, currentX: e.clientX, currentY: e.clientY, isDragging };
    });
  }, []);

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      setDragState((state) => {
        if (!state || state.pointerId !== e.pointerId) return state;
        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;
        const wasDragging =
          state.isDragging || Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX;

        if (!wasDragging) {
          onSelectAppointment(state.apt);
          return null;
        }

        const original = new Date(state.apt.scheduled_at);
        const slotsDelta = Math.round(dy / SLOT_HEIGHT_PX);
        const minutesDelta = slotsDelta * SLOT_MINUTES;
        const daysDelta = viewMode === 'week'
          ? Math.round(dx / state.dayColumnWidth)
          : 0;

        const newDate = new Date(original);
        newDate.setDate(newDate.getDate() + daysDelta);
        newDate.setMinutes(newDate.getMinutes() + minutesDelta);

        const minDate = new Date(newDate);
        minDate.setHours(DAY_START_HOUR, 0, 0, 0);
        const maxDate = new Date(newDate);
        const lastSlotMin = HOURS.length * 60 - state.apt.duration_minutes;
        maxDate.setHours(DAY_START_HOUR, 0, 0, 0);
        maxDate.setMinutes(maxDate.getMinutes() + lastSlotMin);

        const clamped = new Date(clamp(newDate.getTime(), minDate.getTime(), maxDate.getTime()));

        if (clamped.getTime() !== original.getTime()) {
          void onReschedule(state.apt.id, clamped);
        }
        return null;
      });
    },
    [onReschedule, onSelectAppointment, viewMode],
  );

  const handlePointerCancel = useCallback(() => setDragState(null), []);

  const handleEmptyClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>, day: Date) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-apt-id]')) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      if (offsetY < 0) return;

      const slotIndex = Math.floor(offsetY / SLOT_HEIGHT_PX);
      const minutesFromStart = slotIndex * SLOT_MINUTES;
      const totalMinutes = DAY_START_HOUR * 60 + minutesFromStart;
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const mm = String(totalMinutes % 60).padStart(2, '0');

      onCreateAt(day, `${hh}:${mm}`);
    },
    [onCreateAt],
  );

  if (loading) {
    return (
      <div className="flex-1 animate-pulse space-y-2 p-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-6 w-14 rounded bg-muted" />
            <div className="h-6 flex-1 rounded bg-muted/60" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className={`sticky top-0 z-30 grid ${gridTemplate} border-b border-border bg-card/95 backdrop-blur`}>
        <div className="border-r border-border" aria-hidden="true" />
        {visibleDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          return (
            <div
              key={i}
              className={`flex items-center justify-center gap-2 px-2 py-2 ${
                i < visibleDays.length - 1 ? 'border-r border-border/60' : ''
              } ${isToday ? 'bg-primary/[0.06]' : ''}`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {dayNames[day.getDay()]}
              </span>
              <span
                className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-sm font-bold ${
                  isToday ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground'
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div
        ref={gridRef}
        className={`relative grid ${gridTemplate}`}
        style={{ height: TOTAL_GRID_HEIGHT_PX }}
      >
        <div className="relative border-r border-border" aria-hidden="true">
          {HOURS.map((hour, i) => (
            <div
              key={hour}
              className="absolute left-0 right-0 -translate-y-1/2 pr-2 text-right text-[10px] font-medium text-muted-foreground/80"
              style={{ top: i * HOUR_HEIGHT_PX }}
            >
              {i === 0 ? '' : `${String(hour).padStart(2, '0')}:00`}
            </div>
          ))}
        </div>

        {visibleDays.map((day, dayIndex) => {
          const dateKey = formatDateKey(day);
          const dayAppts = apptsByDate[dateKey] ?? [];
          const isToday = isSameDay(day, today);
          const draggedApt = dragState?.apt;
          const draggedDayIndex = draggedApt
            ? visibleDays.findIndex((d) => isSameDay(d, new Date(draggedApt.scheduled_at)))
            : -1;

          const dayOfWeek = day.getDay();
          const dayTemplate = weeklySchedule.find(
            (row) => row.day_of_week === dayOfWeek && row.is_active,
          );
          const dayBreaks = dayTemplate?.breaks ?? [];

          const dayTimeBlocks = timeBlocks.filter((b) => {
            const startDay = b.starts_at.slice(0, 10);
            const endDay = b.ends_at.slice(0, 10);
            return startDay <= dateKey && dateKey <= endDay;
          });

          const overlapIds = detectOverlapIds(dayAppts);

          return (
            <div
              key={dayIndex}
              data-day-col={dayIndex}
              onClick={(e) => handleEmptyClick(e, day)}
              role="presentation"
              className={`group/day relative cursor-pointer ${
                dayIndex < visibleDays.length - 1 ? 'border-r border-border/60' : ''
              } ${isToday ? 'bg-primary/[0.025]' : ''}`}
              title="Click para crear una cita en este horario"
            >
              {dayBreaks.map((br, brIdx) => {
                const [bsH = '0', bsM = '0'] = br.start.split(':');
                const [beH = '0', beM = '0'] = br.end.split(':');
                const startMin = (Number(bsH) - DAY_START_HOUR) * 60 + Number(bsM);
                const endMin = (Number(beH) - DAY_START_HOUR) * 60 + Number(beM);
                if (endMin <= 0 || startMin >= HOURS.length * 60) return null;
                const top = Math.max(0, (startMin / SLOT_MINUTES) * SLOT_HEIGHT_PX);
                const height =
                  ((Math.min(endMin, HOURS.length * 60) - Math.max(startMin, 0)) /
                    SLOT_MINUTES) *
                  SLOT_HEIGHT_PX;
                return (
                  <div
                    key={`break-${brIdx}`}
                    className="pointer-events-none absolute inset-x-0 flex items-start justify-end overflow-hidden bg-muted/30 px-1.5 py-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground"
                    style={{ top, height }}
                    aria-label={`Pausa: ${br.label}`}
                  >
                    <span className="rounded bg-card/80 px-1 py-0.5 backdrop-blur">
                      {br.label}
                    </span>
                  </div>
                );
              })}

              {dayTimeBlocks.map((tb) => {
                const startDate = new Date(tb.starts_at);
                const endDate = new Date(tb.ends_at);
                const startMin =
                  startDate.toISOString().slice(0, 10) < dateKey
                    ? 0
                    : (startDate.getHours() - DAY_START_HOUR) * 60 + startDate.getMinutes();
                const endMin =
                  endDate.toISOString().slice(0, 10) > dateKey
                    ? HOURS.length * 60
                    : (endDate.getHours() - DAY_START_HOUR) * 60 + endDate.getMinutes();
                if (endMin <= 0 || startMin >= HOURS.length * 60) return null;
                const top = Math.max(0, (startMin / SLOT_MINUTES) * SLOT_HEIGHT_PX);
                const height =
                  ((Math.min(endMin, HOURS.length * 60) - Math.max(startMin, 0)) /
                    SLOT_MINUTES) *
                  SLOT_HEIGHT_PX;
                return (
                  <div
                    key={`block-${tb.id}`}
                    className="pointer-events-none absolute inset-x-0 flex items-start justify-end overflow-hidden border-l-2 border-muted-foreground/40 bg-muted/40 px-1.5 py-1 text-[9px] font-medium uppercase tracking-wide text-muted-foreground"
                    style={{ top, height }}
                    aria-label={`Bloqueado: ${tb.title}`}
                  >
                    <span className="rounded bg-card/80 px-1 py-0.5 backdrop-blur">
                      {tb.title}
                    </span>
                  </div>
                );
              })}

              {HOURS.map((_, hourIndex) => (
                <div key={hourIndex}>
                  <div
                    className="pointer-events-none absolute left-0 right-0 border-t border-border/70"
                    style={{ top: hourIndex * HOUR_HEIGHT_PX }}
                  />
                  {[1, 2, 3].map((q) => (
                    <div
                      key={q}
                      className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-border/30"
                      style={{ top: hourIndex * HOUR_HEIGHT_PX + q * SLOT_HEIGHT_PX }}
                    />
                  ))}
                </div>
              ))}

              {isToday && <NowLine />}

              {dayAppts.length === 0 && !dragState && (
                <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                  <span className="text-[11px] text-muted-foreground/50">Sin citas</span>
                </div>
              )}

              {dayAppts.map((apt) => {
                const time = new Date(apt.scheduled_at);
                const top = blockTop(time);
                const height = blockHeight(apt.duration_minutes || 30);
                const type = getTypeStyle(apt.appointment_type);
                const status = STATUS_CONFIG[apt.status];
                const isBeingDragged = dragState?.apt.id === apt.id && dragState.isDragging;
                const isOverlapping = overlapIds.has(apt.id);

                const dragOffsetX = isBeingDragged
                  ? viewMode === 'week'
                    ? dragState.currentX - dragState.startX
                    : 0
                  : 0;
                const dragOffsetY = isBeingDragged
                  ? dragState.currentY - dragState.startY
                  : 0;

                return (
                  <button
                    key={apt.id}
                    type="button"
                    data-apt-id={apt.id}
                    onPointerDown={(e) => handlePointerDown(e, apt)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    className={`absolute left-1 right-1 flex flex-col overflow-hidden rounded-md border px-1.5 py-1 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-none ${type.surface} ${
                      isBeingDragged
                        ? 'z-50 cursor-grabbing opacity-90 shadow-lg ring-1 ring-ring/40'
                        : 'cursor-grab hover:shadow-sm'
                    } ${isOverlapping ? 'ring-1 ring-destructive/50' : ''}`}
                    style={{
                      top,
                      height,
                      transform: isBeingDragged
                        ? `translate3d(${dragOffsetX}px, ${dragOffsetY}px, 0)`
                        : undefined,
                    }}
                    title={`${apt.paciente?.full_name ?? 'Sin paciente'} — ${time.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}${isOverlapping ? ' · ⚠️ se superpone con otra cita' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${type.bar}`} />
                      <span className={`text-[10px] font-semibold leading-none ${type.text}`}>
                        {time.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {apt.appointment_type === 'telemedicine' && (
                        <Video className="h-3 w-3 flex-shrink-0 text-violet-500 dark:text-violet-300" />
                      )}
                      {isOverlapping && (
                        <AlertTriangle
                          className="ml-auto h-3 w-3 flex-shrink-0 text-destructive"
                          aria-label="Se superpone con otra cita"
                        />
                      )}
                    </div>
                    {height >= SLOT_HEIGHT_PX * 2 && (
                      <p className="mt-0.5 truncate text-[11px] font-medium leading-tight text-foreground">
                        {apt.paciente?.full_name ?? 'Sin paciente'}
                      </p>
                    )}
                    {height >= SLOT_HEIGHT_PX * 4 && status && (
                      <span className={`mt-auto inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium leading-none ${status.pill}`}>
                        {status.label}
                      </span>
                    )}
                  </button>
                );
              })}

              {draggedApt && dragState?.isDragging && viewMode === 'week' && (() => {
                const daysDelta = Math.round((dragState.currentX - dragState.startX) / dragState.dayColumnWidth);
                const targetDayIndex = draggedDayIndex + daysDelta;
                if (targetDayIndex !== dayIndex) return null;
                if (targetDayIndex === draggedDayIndex) return null;
                return (
                  <div className="pointer-events-none absolute inset-0 bg-primary/[0.06] ring-2 ring-inset ring-primary/40" />
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NowLine() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const minutes = minutesFromDayStart(now);
  if (minutes < 0 || minutes > HOURS.length * 60) return null;
  const top = (minutes / SLOT_MINUTES) * SLOT_HEIGHT_PX;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20"
      style={{ top }}
      aria-hidden="true"
    >
      <div className="relative h-px bg-destructive">
        <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-destructive shadow-sm" />
      </div>
    </div>
  );
}
