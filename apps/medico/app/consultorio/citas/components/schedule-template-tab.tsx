"use client";

import { useState, useEffect } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Save, RotateCcw, Clock, Moon, Coffee, Loader2, Info,
  CheckSquare, Square,
} from "lucide-react";
import {
  Button, Card, CardContent,
  Badge, ScrollArea,
} from "@red-salud/design-system";
import { useWeeklySchedule, DAY_LABELS } from "@/hooks/use-weekly-schedule";
import type { WeeklyScheduleDay, TimeSlot, DayBreak } from "@/hooks/use-weekly-schedule";
import { createClient } from "@/lib/supabase/client";

interface ScheduleTemplateTabProps {
  selectedOfficeId: string | null;
}

export function ScheduleTemplateTab({ selectedOfficeId }: ScheduleTemplateTabProps) {
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setDoctorId(user.id);
    });
  }, []);

  const {
    days, loading, saving, error, isDirty,
    weeklyCapacity, workingDays,
    updateDayDraft, saveAll, discard,
  } = useWeeklySchedule({ doctorId: doctorId ?? "", officeId: selectedOfficeId });

  if (!doctorId || loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span>Cargando plantilla de horarios…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between px-6 py-3 border-b">
        <div>
          <h2 className="text-sm font-semibold">Horario base semanal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {workingDays} días laborables · ~{weeklyCapacity} citas/semana
          </p>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={discard}>
              <RotateCcw className="size-3 mr-1" />
              Descartar
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={saveAll}
            disabled={!isDirty || saving}
          >
            {saving ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Save className="size-3 mr-1" />}
            Guardar horario
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex-none px-6 py-2 text-xs text-destructive bg-destructive/10 border-b">
          <Info className="size-3 mr-1 inline" />
          {error}
        </div>
      )}

      {/* ── Days Grid ─────────────────────────────────────────────────── */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-7 gap-3 p-4">
          {days.map((day) => (
            <DayCard
              key={day.id ?? `day-${day.day_of_week}`}
              day={day}
              onChange={(updates) => updateDayDraft(day.day_of_week, updates)}
            />
          ))}
        </div>
        <p className="px-4 pb-4 text-[11px] text-muted-foreground">
          * Este horario sirve como plantilla base. Los bloqueos individuales se gestionan en la pestaña <strong>Disponibilidad</strong>.
        </p>
      </ScrollArea>
    </div>
  );
}

// ── Day Card ──────────────────────────────────────────────────────────────────

function DayCard({
  day,
  onChange,
}: {
  day: WeeklyScheduleDay;
  onChange: (updates: Partial<WeeklyScheduleDay>) => void;
}) {
  return (
    <Card className={cn("transition-opacity min-w-0", !day.is_working_day && "opacity-50")}>
      <CardContent className="p-3 space-y-3">
        {/* Day header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">{DAY_LABELS[day.day_of_week]}</span>
          <button
            onClick={() => onChange({ is_working_day: !day.is_working_day })}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={day.is_working_day ? "Marcar como no laborable" : "Marcar como laborable"}
          >
            {day.is_working_day
              ? <CheckSquare className="size-3.5 text-primary" />
              : <Square className="size-3.5" />
            }
          </button>
        </div>

        {day.is_working_day && (
          <>
            {/* Slots */}
            {(day.slots ?? []).map((slot, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex gap-1 items-center">
                  <Clock className="size-3 text-muted-foreground flex-none" />
                  <TimeInput
                    value={slot.start}
                    onChange={(v) => {
                      const updated = [...(day.slots ?? [])];
                      const current = updated[i] ?? { start: "", end: "" };
                      updated[i] = { start: v, end: current.end };
                      onChange({ slots: updated });
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">—</span>
                  <TimeInput
                    value={slot.end}
                    onChange={(v) => {
                      const updated = [...(day.slots ?? [])];
                      const current = updated[i] ?? { start: "", end: "" };
                      updated[i] = { start: current.start, end: v };
                      onChange({ slots: updated });
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Breaks */}
            {(day.breaks ?? []).map((brk, i) => (
              <div key={`break-${i}`} className="flex gap-1 items-center text-[10px] text-muted-foreground">
                <Coffee className="size-3 flex-none" />
                <span>{brk.label}: {brk.start}–{brk.end}</span>
              </div>
            ))}

            {/* Duration */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Duración: </span>
              <input
                type="number"
                value={day.default_duration_mins}
                min={5}
                max={180}
                step={5}
                className="w-10 text-center text-[10px] border rounded px-1 bg-background"
                onChange={(e) => onChange({ default_duration_mins: Number(e.target.value) })}
              />
              <span>min</span>
            </div>
          </>
        )}

        {!day.is_working_day && (
          <div className="flex items-center justify-center py-2">
            <Moon className="size-4 text-muted-foreground/40" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      className="w-16 text-center text-[10px] border rounded px-1 bg-background text-foreground"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
