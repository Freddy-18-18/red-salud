'use client';

import { useMemo } from 'react';
import {
  formatDateKey,
  getMonthGrid,
  getTypeStyle,
  isSameDay,
  isSameMonth,
  type Appointment,
} from './agenda-shared';

interface MonthGridProps {
  date: Date;
  today: Date;
  appointments: Appointment[];
  loading: boolean;
  onSelectDate: (d: Date) => void;
}

export function MonthGrid({
  date,
  today,
  appointments,
  loading,
  onSelectDate,
}: MonthGridProps) {
  const days = useMemo(() => getMonthGrid(date), [date]);
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const apptsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const apt of appointments) {
      const key = apt.scheduled_at.slice(0, 10);
      (map[key] ??= []).push(apt);
    }
    return map;
  }, [appointments]);

  if (loading) {
    return (
      <div className="flex-1 animate-pulse p-4">
        <div className="grid h-full grid-cols-7 grid-rows-6 gap-px">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="rounded bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border bg-card/95 backdrop-blur">
        {dayNames.map((name) => (
          <div
            key={name}
            className="border-r border-border/60 px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground last:border-r-0"
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 grid-rows-6 overflow-hidden">
        {days.map((day, i) => {
          const key = formatDateKey(day);
          const dayAppts = apptsByDate[key] ?? [];
          const inCurrentMonth = isSameMonth(day, date);
          const isToday = isSameDay(day, today);
          const rowIndex = Math.floor(i / 7);
          const colIndex = i % 7;
          const visibleDots = dayAppts.slice(0, 3);
          const overflow = dayAppts.length - visibleDots.length;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`group flex flex-col items-stretch gap-1 border-b border-r border-border/60 p-1.5 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                colIndex === 6 ? 'border-r-0' : ''
              } ${rowIndex === 5 ? 'border-b-0' : ''} ${
                inCurrentMonth ? 'bg-card' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    isToday
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : inCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/60'
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayAppts.length > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {dayAppts.length}
                  </span>
                )}
              </div>

              <div className="flex min-h-0 flex-col gap-0.5 overflow-hidden">
                {visibleDots.map((apt) => {
                  const type = getTypeStyle(apt.appointment_type);
                  const time = new Date(apt.scheduled_at);
                  return (
                    <span
                      key={apt.id}
                      className={`flex items-center gap-1 truncate rounded-sm border px-1 py-0.5 text-[10px] leading-tight ${type.surface}`}
                    >
                      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${type.bar}`} />
                      <span className={`flex-shrink-0 font-semibold ${type.text}`}>
                        {time.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="truncate text-foreground">
                        {apt.paciente?.full_name ?? 'Sin paciente'}
                      </span>
                    </span>
                  );
                })}
                {overflow > 0 && (
                  <span className="px-1 text-[10px] font-medium text-muted-foreground">
                    +{overflow} más
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
