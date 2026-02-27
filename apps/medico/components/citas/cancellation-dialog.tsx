/**
 * @file cancellation-dialog.tsx
 * @description Enterprise appointment cancellation flow:
 *  1. Capture cancellation reason (required)
 *  2. Find alternative slots to offer patient
 *  3. Notify patient with alternatives (multi-channel)
 *  4. Auto-trigger waitlist matching for freed slot
 *  5. Log cancellation for analytics
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Button,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Label, Textarea,
  Separator, Badge, ScrollArea,
} from "@red-salud/design-system";
import {
  XCircle, Send, CalendarX, RefreshCw, AlertTriangle, Check,
  Clock, Users, Bell, ArrowRight, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { format, addDays, startOfDay, addHours } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";
import type { CalendarAppointment } from "@/components/dashboard/medico/calendar/types";
import { notificationService } from "@/lib/services/notification-service";
import type { EditSeriesScope } from "@/hooks/use-appointment-series";

// ── Types ─────────────────────────────────────────────────────────────────────

type CancellationReason =
  | "emergencia_medica" | "emergencia_personal" | "conflicto_horario"
  | "olvido" | "costo" | "mejoria" | "traslado" | "no_encontro_lugar"
  | "otro_medico" | "sistema" | "otro";

interface AlternativeSlot {
  fecha_hora: string;
  duracion_minutos: number;
  label: string;
}

interface CancellationDialogProps {
  open: boolean;
  appointment: CalendarAppointment | null;
  /** If the appointment belongs to a series */
  seriesId?: string | null;
  onConfirm: (reason: string, offeredSlots: AlternativeSlot[]) => Promise<void>;
  onClose: () => void;
}

const REASON_OPTIONS: { value: CancellationReason; label: string; icon: string }[] = [
  { value: "conflicto_horario",   label: "Conflicto de horario",      icon: "⏰" },
  { value: "emergencia_medica",   label: "Emergencia médica",          icon: "🚨" },
  { value: "emergencia_personal", label: "Emergencia personal",        icon: "🏥" },
  { value: "olvido",              label: "Se olvidó / No confirmó",    icon: "🔔" },
  { value: "costo",               label: "Motivos económicos",         icon: "💰" },
  { value: "mejoria",             label: "Mejoría del paciente",       icon: "💚" },
  { value: "traslado",            label: "Traslado / Cambio de médico",icon: "🔄" },
  { value: "no_encontro_lugar",   label: "No encontró el lugar",       icon: "📍" },
  { value: "sistema",             label: "Error del sistema",          icon: "⚙️" },
  { value: "otro",                label: "Otro motivo",                icon: "📝" },
];

// ─── Cancellation Dialog ──────────────────────────────────────────────────────
export function CancellationDialog({
  open, appointment, seriesId, onConfirm, onClose,
}: CancellationDialogProps) {
  const [step, setStep] = useState<"reason" | "alternatives" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [customNote, setCustomNote]         = useState("");
  const [seriesScope, setSeriesScope]       = useState<EditSeriesScope>("this_only");
  const [alternatives, setAlternatives]     = useState<AlternativeSlot[]>([]);
  const [selectedSlots, setSelectedSlots]   = useState<AlternativeSlot[]>([]);
  const [loadingAlts, setLoadingAlts]       = useState(false);
  const [waitlistMatches, setWaitlistMatches] = useState(0);
  const [processing, setProcessing]         = useState(false);
  const [showSeriesOptions, setShowSeriesOptions] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("reason");
      setSelectedReason(null);
      setCustomNote("");
      setSeriesScope("this_only");
      setAlternatives([]);
      setSelectedSlots([]);
    }
  }, [open]);

  // Load alternative slots after reason selection
  const loadAlternatives = useCallback(async () => {
    if (!appointment) return;
    setLoadingAlts(true);

    try {
      // Find open slots in the next 7 days at the same duration
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const duration = appointment.duracion_minutos;
      const slots: AlternativeSlot[] = [];

      // Try next 7 days
      for (let dayOffset = 1; dayOffset <= 7 && slots.length < 5; dayOffset++) {
        const date = addDays(new Date(), dayOffset);
        const dateStr = format(date, "yyyy-MM-dd");

        // Get existing appointments for that day
        const { data: existing } = await supabase
          .from("appointments")
          .select("fecha_hora, duracion_minutos")
          .eq("medico_id", user.id)
          .gte("fecha_hora", `${dateStr}T00:00:00`)
          .lte("fecha_hora", `${dateStr}T23:59:59`)
          .not("status", "in", '("cancelada","no_asistio","rechazada")');

        const occupied = (existing ?? []).map((a) => ({
          start: new Date(a.fecha_hora),
          end:   new Date(new Date(a.fecha_hora).getTime() + (a.duracion_minutos ?? 30) * 60000),
        }));

        // Propose morning (9am, 10am, 11am) and afternoon (3pm, 4pm) slots
        const candidateHours = [9, 10, 11, 15, 16];
        for (const hour of candidateHours) {
          const slotStart = new Date(date);
          slotStart.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);

          const conflict = occupied.some((o) => o.start < slotEnd && o.end > slotStart);

          if (!conflict) {
            slots.push({
              fecha_hora:       slotStart.toISOString(),
              duracion_minutos: duration,
              label: format(slotStart, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es }),
            });
            break; // one per day
          }
        }
      }

      setAlternatives(slots);

      // Check waitlist matches
      const aptDate = new Date(appointment.fecha_hora);
      const dayOfWeek = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][aptDate.getDay()];
      const timeStr = format(aptDate, "HH:mm");

      const { count } = await supabase
        .from("smart_waitlist")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", user.id)
        .in("status", ["waiting", "notified"])
        .lte("estimated_duration", duration);

      setWaitlistMatches(count ?? 0);
    } finally {
      setLoadingAlts(false);
    }
  }, [appointment]);

  const handleNextStep = () => {
    if (step === "reason") {
      void loadAlternatives();
      setStep("alternatives");
    } else if (step === "alternatives") {
      setStep("confirm");
    }
  };

  const toggleSlot = (slot: AlternativeSlot) => {
    setSelectedSlots((prev) =>
      prev.some((s) => s.fecha_hora === slot.fecha_hora)
        ? prev.filter((s) => s.fecha_hora !== slot.fecha_hora)
        : [...prev, slot]
    );
  };

  const handleConfirm = async () => {
    if (!appointment || !selectedReason) return;
    setProcessing(true);

    try {
      const reasonText = [
        REASON_OPTIONS.find((r) => r.value === selectedReason)?.label,
        customNote,
      ].filter(Boolean).join(": ");

      await onConfirm(reasonText, selectedSlots);

      // Log the cancellation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("appointment_cancellation_logs").insert({
          appointment_id:       appointment.id,
          doctor_id:            user.id,
          patient_id:           appointment.paciente_id,
          cancelled_by:         "medico",
          cancellation_reason:  reasonText,
          reason_category:      selectedReason,
          reschedule_offered:   selectedSlots.length > 0,
          offered_slots:        JSON.stringify(selectedSlots),
          waitlist_notified:    waitlistMatches > 0,
          waitlist_matches:     waitlistMatches,
        });

        // Cancel pending reminders
        await notificationService.cancelForAppointment(appointment.id);
      }

      onClose();
    } finally {
      setProcessing(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarX className="w-5 h-5 text-red-500" />
            Cancelar Cita
          </DialogTitle>
        </DialogHeader>

        {/* Appointment summary */}
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
          <div className="font-semibold">{appointment.paciente_nombre}</div>
          <div className="text-muted-foreground text-xs mt-0.5">
            {format(new Date(appointment.fecha_hora), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
            {" · "}
            {appointment.duracion_minutos} min
            {appointment.motivo && ` · ${appointment.motivo}`}
          </div>
        </div>

        {/* Series scope (if applicable) */}
        {seriesId && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3">
            <button
              type="button"
              onClick={() => setShowSeriesOptions((v) => !v)}
              className="w-full flex items-center justify-between text-sm font-medium text-amber-700 dark:text-amber-400"
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Cita de una serie recurrente
              </span>
              {showSeriesOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSeriesOptions && (
              <div className="mt-3 space-y-2">
                {[
                  { value: "this_only", label: "Solo esta cita" },
                  { value: "this_and_future", label: "Esta y las siguientes" },
                  { value: "all", label: "Toda la serie" },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      value={value}
                      checked={seriesScope === value}
                      onChange={() => setSeriesScope(value as EditSeriesScope)}
                      className="accent-amber-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Reason ─────────────────────────────────────────────── */}
        {step === "reason" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">¿Cuál es el motivo?</Label>
            <div className="grid grid-cols-2 gap-2">
              {REASON_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedReason(r.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all",
                    selectedReason === r.value
                      ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-medium"
                      : "border-muted bg-muted/20 hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  <span>{r.icon}</span>
                  <span className="text-xs leading-tight">{r.label}</span>
                </button>
              ))}
            </div>

            {selectedReason === "otro" && (
              <Textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Describe el motivo..."
                className="text-sm resize-none"
                rows={2}
              />
            )}
          </div>
        )}

        {/* ── Step 2: Alternative Slots ──────────────────────────────────── */}
        {step === "alternatives" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Ofrecer alternativas al paciente</Label>
              <span className="text-xs text-muted-foreground">{selectedSlots.length} seleccionados</span>
            </div>

            {loadingAlts ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : alternatives.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground bg-muted/20 rounded-lg">
                No hay espacios disponibles en los próximos 7 días
              </div>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-1.5">
                  {alternatives.map((slot) => {
                    const isSelected = selectedSlots.some((s) => s.fecha_hora === slot.fecha_hora);
                    return (
                      <button
                        key={slot.fecha_hora}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-muted bg-muted/20 hover:bg-muted/40"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded flex items-center justify-center border-2 shrink-0",
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium capitalize">{slot.label}</p>
                          <p className="text-[10px] text-muted-foreground">{slot.duracion_minutos} min</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {/* Waitlist info */}
            {waitlistMatches > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 px-3 py-2">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>{waitlistMatches} paciente{waitlistMatches > 1 ? "s" : ""}</strong> en lista de espera
                  serán notificados automáticamente del espacio liberado.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep("confirm")}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Cancelar sin ofrecer alternativas
            </button>
          </div>
        )}

        {/* ── Step 3: Confirm ────────────────────────────────────────────── */}
        {step === "confirm" && (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarX className="w-4 h-4 text-red-500" />
                <span>Cita de <strong>{appointment.paciente_nombre}</strong> será cancelada</span>
              </div>
              <Separator />
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5" />
                  <span>
                    {appointment.paciente_id || appointment.paciente_telefono
                      ? "El paciente recibirá una notificación de cancelación"
                      : "Sin datos de contacto — notificación no enviada"}
                  </span>
                </div>

                {selectedSlots.length > 0 && (
                  <div className="flex items-start gap-2">
                    <RefreshCw className="w-3.5 h-3.5 mt-0.5" />
                    <span>
                      Se ofrecerán <strong>{selectedSlots.length} alternativa{selectedSlots.length > 1 ? "s" : ""}</strong> para reprogramar
                    </span>
                  </div>
                )}

                {waitlistMatches > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      <strong>{waitlistMatches} paciente{waitlistMatches > 1 ? "s" : ""}</strong> de lista de espera serán notificados
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Esta acción no se puede deshacer. La cita quedará como <strong>cancelada</strong>.
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {["reason", "alternatives", "confirm"].map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all",
                step === s ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={step === "reason" ? onClose : () => setStep(step === "confirm" ? "alternatives" : "reason")}>
            {step === "reason" ? "No cancelar" : "Atrás"}
          </Button>

          {step !== "confirm" ? (
            <Button
              size="sm"
              variant="destructive"
              disabled={step === "reason" && !selectedReason}
              onClick={handleNextStep}
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              disabled={processing}
              onClick={() => void handleConfirm()}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-1.5" />}
              Confirmar cancelación
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
