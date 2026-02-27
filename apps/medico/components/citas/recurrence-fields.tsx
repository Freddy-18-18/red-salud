/**
 * @file recurrence-fields.tsx
 * @description Recurring appointment configuration section.
 *   Added to the nueva cita form when doctor wants to create a series.
 */

"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Label, Input, Badge, Card, CardContent,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@red-salud/design-system";
import { RepeatIcon, Calendar, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format, addDays, addWeeks, addMonths, parseISO, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import type { RecurrenceType } from "@/hooks/use-appointment-series";
import { generateOccurrences } from "@/hooks/use-appointment-series";

export interface RecurrenceConfig {
  enabled: boolean;
  type: RecurrenceType;
  interval: number;
  days: number[];       // selected weekdays
  endsOn: "never" | "date" | "count";
  endDate?: string;     // YYYY-MM-DD
  maxCount?: number;
}

interface RecurrenceFieldsProps {
  startDate: string;     // YYYY-MM-DD
  startTime: string;     // HH:mm
  duration: number;      // minutos
  value: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
}

const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  daily:    "Diariamente",
  weekly:   "Semanalmente",
  biweekly: "Cada 2 semanas",
  monthly:  "Mensualmente",
  custom:   "Personalizado",
};

const WEEKDAYS = [
  { value: 1, short: "L", label: "Lunes" },
  { value: 2, short: "M", label: "Martes" },
  { value: 3, short: "X", label: "Miércoles" },
  { value: 4, short: "J", label: "Jueves" },
  { value: 5, short: "V", label: "Viernes" },
  { value: 6, short: "S", label: "Sábado" },
  { value: 0, short: "D", label: "Domingo" },
];

export function RecurrenceFields({
  startDate, startTime, duration, value, onChange,
}: RecurrenceFieldsProps) {
  const [showPreview, setShowPreview] = useState(false);

  const update = (partial: Partial<RecurrenceConfig>) =>
    onChange({ ...value, ...partial });

  const toggleDay = (day: number) => {
    const newDays = value.days.includes(day)
      ? value.days.filter((d) => d !== day)
      : [...value.days, day];
    update({ days: newDays });
  };

  // Preview occurrences
  const previewDates = useMemo(() => {
    if (!value.enabled || !startDate || !startTime) return [];
    try {
      return generateOccurrences(
        {
          recurrence_type:     value.type,
          recurrence_interval: value.interval,
          recurrence_days:     value.days,
          starts_on:           startDate,
          ends_on:             value.endsOn === "date" ? value.endDate : undefined,
          max_occurrences:     value.endsOn === "count" ? value.maxCount : undefined,
          duracion_minutos:    duration,
          tipo_cita:           "seguimiento",
          hora:                startTime,
        },
        24 // preview up to 24
      );
    } catch {
      return [];
    }
  }, [value, startDate, startTime, duration]);

  if (!value.enabled) {
    return (
      <button
        type="button"
        onClick={() => update({ enabled: true })}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <RepeatIcon className="w-4 h-4" />
        Crear como serie recurrente
      </button>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-4 pb-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <RepeatIcon className="w-4 h-4 text-primary" />
            Serie recurrente
          </div>
          <button
            type="button"
            onClick={() => update({ enabled: false })}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Quitar
          </button>
        </div>

        {/* Frequency */}
        <div className="space-y-1.5">
          <Label className="text-xs">Frecuencia</Label>
          <Select
            value={value.type}
            onValueChange={(v) => update({ type: v as RecurrenceType })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RECURRENCE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Weekday selector (for weekly/biweekly) */}
        {(value.type === "weekly" || value.type === "biweekly") && (
          <div className="space-y-1.5">
            <Label className="text-xs">Días de la semana</Label>
            <div className="flex gap-1.5">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  title={d.label}
                  className={cn(
                    "w-8 h-8 rounded-full text-xs font-bold transition-colors",
                    value.days.includes(d.value)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom interval */}
        {value.type === "custom" && (
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Cada</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={value.interval}
              onChange={(e) => update({ interval: parseInt(e.target.value) || 1 })}
              className="h-8 w-20 text-sm"
            />
            <span className="text-xs text-muted-foreground">días</span>
          </div>
        )}

        {/* End condition */}
        <div className="space-y-2">
          <Label className="text-xs">Termina</Label>
          <div className="space-y-2">
            {[
              { key: "never", label: "Nunca (indefinido)" },
              { key: "date",  label: "En una fecha" },
              { key: "count", label: "Después de N sesiones" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="ends-on"
                  value={key}
                  checked={value.endsOn === key}
                  onChange={() => update({ endsOn: key as RecurrenceConfig["endsOn"] })}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>

          {value.endsOn === "date" && (
            <Input
              type="date"
              value={value.endDate ?? ""}
              min={startDate}
              onChange={(e) => update({ endDate: e.target.value })}
              className="h-8 text-sm"
            />
          )}

          {value.endsOn === "count" && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={200}
                value={value.maxCount ?? 10}
                onChange={(e) => update({ maxCount: parseInt(e.target.value) || 1 })}
                className="h-8 w-20 text-sm"
              />
              <span className="text-xs text-muted-foreground">sesiones</span>
            </div>
          )}
        </div>

        {/* Preview */}
        {previewDates.length > 0 && (
          <div className="rounded-lg border bg-background p-3 space-y-2">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {previewDates.length} cita{previewDates.length > 1 ? "s" : ""} a crear
              </span>
              {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPreview && (
              <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                {previewDates.map((date, i) => (
                  <div key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-center">
                    {format(date, "d MMM HH:mm", { locale: es })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {previewDates.length === 0 && value.enabled && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded px-2 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Sin fechas generadas. Verifica la configuración.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
