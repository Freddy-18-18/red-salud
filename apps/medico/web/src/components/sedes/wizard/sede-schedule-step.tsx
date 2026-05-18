'use client';

import { Input, Label, Switch } from '@red-salud/design-system';
import { Clock, Plus, Trash2 } from 'lucide-react';

import type {
  ScheduleDay,
  ScheduleSlot,
  SedeWizardDraft,
  WeeklySchedule,
} from '../sede-wizard-types';
import { SPANISH_DAY_NAMES } from '../sede-wizard-types';

/**
 * @file sede-schedule-step.tsx
 * @description Step 3 of the sede wizard: weekly working hours.
 *
 * Minimalist per-day editor: each day toggles a switch (working / off) and
 * exposes 0-N time slots. Power users still go to /configuracion/horarios
 * for global blocks + exceptions; this step is the per-sede baseline.
 *
 * Time inputs use native `<input type="time">` because:
 *   - Browser-native UX is hard to beat for time pickers
 *   - Mobile gets a system picker for free
 *   - Output format is already HH:MM 24-hour, matching what we persist
 */

interface Props {
  draft: SedeWizardDraft;
  onPatch: (patch: Partial<SedeWizardDraft>) => void;
}

function setSlot(
  schedule: WeeklySchedule,
  dow: number,
  slotIdx: number,
  slot: ScheduleSlot,
): WeeklySchedule {
  return {
    ...schedule,
    days: schedule.days.map((day) =>
      day.dayOfWeek === dow
        ? {
            ...day,
            slots: day.slots.map((s, i) => (i === slotIdx ? slot : s)),
          }
        : day,
    ),
  };
}

function patchDay(
  schedule: WeeklySchedule,
  dow: number,
  patch: Partial<ScheduleDay>,
): WeeklySchedule {
  return {
    ...schedule,
    days: schedule.days.map((day) =>
      day.dayOfWeek === dow ? { ...day, ...patch } : day,
    ),
  };
}

function addSlot(schedule: WeeklySchedule, dow: number): WeeklySchedule {
  return {
    ...schedule,
    days: schedule.days.map((day) =>
      day.dayOfWeek === dow
        ? {
            ...day,
            slots: [...day.slots, { start: '09:00', end: '12:00' }],
          }
        : day,
    ),
  };
}

function removeSlot(
  schedule: WeeklySchedule,
  dow: number,
  slotIdx: number,
): WeeklySchedule {
  return {
    ...schedule,
    days: schedule.days.map((day) =>
      day.dayOfWeek === dow
        ? { ...day, slots: day.slots.filter((_, i) => i !== slotIdx) }
        : day,
    ),
  };
}

export function SedeScheduleStep({ draft, onPatch }: Props): React.ReactElement {
  const schedule = draft.schedule;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-foreground-lighter" aria-hidden="true" />
          Configuración general
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="schedule-duration" className="text-xs font-medium">
              Duración por consulta (minutos)
            </Label>
            <Input
              id="schedule-duration"
              type="number"
              min={5}
              max={240}
              step={5}
              value={schedule.defaultDurationMins}
              onChange={(e) =>
                onPatch({
                  schedule: {
                    ...schedule,
                    defaultDurationMins: Math.max(
                      5,
                      Math.min(240, Number(e.target.value) || 30),
                    ),
                  },
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="schedule-buffer" className="text-xs font-medium">
              Buffer entre citas (minutos)
            </Label>
            <Input
              id="schedule-buffer"
              type="number"
              min={0}
              max={60}
              step={5}
              value={schedule.bufferAfterMins}
              onChange={(e) =>
                onPatch({
                  schedule: {
                    ...schedule,
                    bufferAfterMins: Math.max(
                      0,
                      Math.min(60, Number(e.target.value) || 0),
                    ),
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {schedule.days.map((day) => {
          const names = SPANISH_DAY_NAMES[day.dayOfWeek];
          return (
            <div
              key={day.dayOfWeek}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{names.long}</div>
                  {!day.isWorkingDay && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      No atendés este día
                    </p>
                  )}
                </div>
                <Switch
                  aria-label={`Trabajo el ${names.long}`}
                  checked={day.isWorkingDay}
                  onCheckedChange={(checked) =>
                    onPatch({
                      schedule: patchDay(schedule, day.dayOfWeek, {
                        isWorkingDay: checked,
                        slots:
                          checked && day.slots.length === 0
                            ? [{ start: '09:00', end: '12:00' }]
                            : day.slots,
                      }),
                    })
                  }
                />
              </div>

              {day.isWorkingDay && (
                <div className="mt-3 space-y-2">
                  {day.slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2"
                      data-testid={`schedule-slot-${day.dayOfWeek}-${idx}`}
                    >
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          onPatch({
                            schedule: setSlot(schedule, day.dayOfWeek, idx, {
                              ...slot,
                              start: e.target.value,
                            }),
                          })
                        }
                        className="w-32"
                        aria-label={`Inicio ${names.long} bloque ${idx + 1}`}
                      />
                      <span className="text-sm text-muted-foreground">a</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          onPatch({
                            schedule: setSlot(schedule, day.dayOfWeek, idx, {
                              ...slot,
                              end: e.target.value,
                            }),
                          })
                        }
                        className="w-32"
                        aria-label={`Fin ${names.long} bloque ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onPatch({
                            schedule: removeSlot(schedule, day.dayOfWeek, idx),
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Eliminar bloque"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      onPatch({ schedule: addSlot(schedule, day.dayOfWeek) })
                    }
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground-light transition-colors hover:bg-sidebar-accent hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    Agregar bloque horario
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: podés tener varios bloques en un día (mañana y tarde, por
        ejemplo). Los pacientes solo verán los slots disponibles dentro de
        estos bloques.
      </p>
    </div>
  );
}

/**
 * Validates a weekly schedule. Returns an array of human-readable error
 * strings — empty array means valid.
 */
export function validateSchedule(schedule: WeeklySchedule): string[] {
  const errors: string[] = [];
  for (const day of schedule.days) {
    if (!day.isWorkingDay) continue;
    const names = SPANISH_DAY_NAMES[day.dayOfWeek];
    if (day.slots.length === 0) {
      errors.push(`${names.long}: agregá al menos un bloque horario o marcá el día como no laborable.`);
      continue;
    }
    for (let i = 0; i < day.slots.length; i++) {
      const slot = day.slots[i];
      if (!slot.start || !slot.end) {
        errors.push(`${names.long} bloque ${i + 1}: falta horario.`);
        continue;
      }
      if (slot.start >= slot.end) {
        errors.push(
          `${names.long} bloque ${i + 1}: el inicio debe ser anterior al fin.`,
        );
      }
    }
  }
  return errors;
}
