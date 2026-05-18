'use client';

import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import type { AppointmentRow } from '@red-salud/core';

interface DayMiniPreviewProps {
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  durationMin: number;
  appointments: AppointmentRow[];
}

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;
const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => i + DAY_START_HOUR);
const ROW_HEIGHT_PX = 14;
// Max-height interna para que el preview NO empuje el form hacia abajo
// y tenga su propio scroll en pantallas pequeñas.
const PREVIEW_MAX_HEIGHT_PX = 380;

/**
 * Mini-preview vertical del día con todas las citas existentes + la nueva
 * cita resaltada. Update reactivo cuando cambian inputs del form.
 */
export function DayMiniPreview({
  date,
  time,
  durationMin,
  appointments,
}: DayMiniPreviewProps) {
  const friendlyDate = useMemo(() => {
    try {
      return new Date(`${date}T12:00:00`).toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return date;
    }
  }, [date]);

  const newSlot = useMemo(() => {
    const [h = '0', m = '0'] = time.split(':');
    const startMin = (Number(h) - DAY_START_HOUR) * 60 + Number(m);
    const endMin = startMin + durationMin;
    return { startMin, endMin };
  }, [time, durationMin]);

  const dayAppts = useMemo(
    () =>
      appointments
        .filter((a) => a.scheduled_at.slice(0, 10) === date)
        .map((a) => {
          const d = new Date(a.scheduled_at);
          const startMin = (d.getHours() - DAY_START_HOUR) * 60 + d.getMinutes();
          return {
            id: a.id,
            startMin,
            endMin: startMin + (a.duration_minutes || 30),
            label: a.patient?.full_name ?? 'Cita',
            status: a.status,
          };
        }),
    [appointments, date],
  );

  const totalMins = (DAY_END_HOUR - DAY_START_HOUR) * 60;
  const pxFromMin = (m: number) => (m / 60) * ROW_HEIGHT_PX * 4; // 4 quartiles por hora
  const totalHeight = pxFromMin(totalMins);

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          Vista del día
        </h3>
        <p className="truncate text-[10px] capitalize text-muted-foreground">{friendlyDate}</p>
      </div>

      {/* Wrapper con max-height + overflow-y-auto: scroll PROPIO,
          no empuja al form hacia abajo. */}
      <div
        className="relative overflow-y-auto rounded-md border border-border/60 bg-background"
        style={{ maxHeight: PREVIEW_MAX_HEIGHT_PX }}
      >
        <div
          className="relative grid grid-cols-[24px_1fr]"
          style={{ height: totalHeight }}
        >
          {/* Gutter de horas */}
          <div className="relative border-r border-border/60">
            {HOURS.map((hour, i) => (
              <div
                key={hour}
                className="absolute left-0 right-0 -translate-y-1/2 pr-1 text-right text-[8px] font-medium text-muted-foreground/70"
                style={{ top: pxFromMin(i * 60) }}
              >
                {i === 0 ? '' : `${String(hour).padStart(2, '0')}`}
              </div>
            ))}
          </div>

          {/* Track */}
          <div className="relative">
            {HOURS.map((_, i) => (
              <div
                key={i}
                className="pointer-events-none absolute left-0 right-0 border-t border-border/40"
                style={{ top: pxFromMin(i * 60) }}
              />
            ))}

            {dayAppts.map((apt) => {
              const top = pxFromMin(apt.startMin);
              const height = Math.max(pxFromMin(apt.endMin - apt.startMin), 6);
              const isCancelled = apt.status === 'cancelled' || apt.status === 'no_show';
              return (
                <div
                  key={apt.id}
                  className={`absolute left-0.5 right-0.5 overflow-hidden rounded-sm px-1 text-[8px] leading-tight ${
                    isCancelled
                      ? 'border border-muted-foreground/20 bg-muted/40 text-muted-foreground line-through'
                      : 'border border-info/40 bg-info/10 text-info'
                  }`}
                  style={{ top, height }}
                  title={apt.label}
                >
                  <span className="block truncate font-medium">{apt.label}</span>
                </div>
              );
            })}

            {/* Nueva cita resaltada */}
            {newSlot.startMin >= 0 && newSlot.endMin <= totalMins && (
              <div
                className="absolute left-0.5 right-0.5 overflow-hidden rounded-sm border-2 border-primary bg-primary/20 px-1 text-[8px] font-bold leading-tight text-primary shadow-sm"
                style={{
                  top: pxFromMin(newSlot.startMin),
                  height: Math.max(pxFromMin(newSlot.endMin - newSlot.startMin), 10),
                }}
              >
                <span className="block truncate">Nueva</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
