"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@red-salud/core/utils";
import {
  UserCheck, UserCog, CheckCircle2, Clock, ArrowRight,
  QrCode, Loader2, RefreshCw, Stethoscope, User, AlertCircle, Copy, Check,
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Badge, ScrollArea, Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@red-salud/design-system";
import { useCheckin } from "@/hooks/use-checkin";
import { generateCheckinToken } from "@/lib/supabase/services/checkin-service";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CheckinTabProps {
  selectedOfficeId: string | null;
}

const STATUS_STYLES = {
  en_espera:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  en_consulta:  "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  pendiente:    "bg-gray-100 text-gray-600 dark:bg-black/60 dark:text-gray-400",
  confirmada:   "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  completada:   "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const STATUS_LABELS: Record<string, string> = {
  en_espera:   "En sala",
  en_consulta: "En consulta",
  pendiente:   "Pendiente",
  confirmada:  "Confirmada",
  completada:  "Completada",
};

// ── QR state ─────────────────────────────────────────────────────────────────
interface QrModalState {
  appointmentId: string;
  patientName:   string;
  token:         string | null;
  qrDataUrl:     string | null;
  loading:       boolean;
}

export function CheckinTab({ selectedOfficeId }: CheckinTabProps) {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [qrModal, setQrModal]   = useState<QrModalState | null>(null);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setDoctorId(user.id);
    });
  }, []);

  const openQrModal = useCallback(async (appointmentId: string, patientName: string) => {
    setQrModal({ appointmentId, patientName, token: null, qrDataUrl: null, loading: true });
    const token = await generateCheckinToken(appointmentId);
    if (!token) {
      setQrModal((prev) => prev ? { ...prev, loading: false } : null);
      return;
    }
    const checkinUrl = `${window.location.origin}/checkin/${token}`;
    try {
      const QRCode = await import("qrcode");
      const dataUrl = await QRCode.default.toDataURL(checkinUrl, { width: 256, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } });
      setQrModal({ appointmentId, patientName, token, qrDataUrl: dataUrl, loading: false });
    } catch {
      setQrModal({ appointmentId, patientName, token, qrDataUrl: null, loading: false });
    }
  }, []);

  const copyToken = useCallback(() => {
    if (!qrModal?.token) return;
    const url = `${window.location.origin}/checkin/${qrModal.token}`;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [qrModal]);

  const { queue, inConsult, upcoming, stats, loading, error, checkIn, callIn, complete, refresh } =
    useCheckin({ doctorId: doctorId ?? "", officeId: selectedOfficeId });

  if (!doctorId || loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span>Cargando sala de espera…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive gap-2">
        <AlertCircle className="size-4" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── KPI Strip ─────────────────────────────────────────────────── */}
      <div className="flex-none grid grid-cols-5 gap-3 px-6 py-3 border-b bg-muted/20">
        {[
          { label: "Hoy",        value: stats.total_today,         color: "text-foreground" },
          { label: "En sala",    value: stats.checked_in,          color: "text-yellow-600 dark:text-yellow-400" },
          { label: "Consultando",value: stats.in_consultation,      color: "text-green-600 dark:text-green-400" },
          { label: "Completadas",value: stats.completed,            color: "text-emerald-600 dark:text-emerald-400" },
          { label: "A tiempo",   value: `${stats.on_time_rate_pct}%`, color: "text-blue-600 dark:text-blue-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className={cn("text-2xl font-bold tabular-nums", color)}>{value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[1fr_1fr_1fr] divide-x overflow-hidden">
        {/* ── Column 1: Queue (en_espera) ───────────────────────────────── */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-yellow-50/50 dark:bg-yellow-900/10">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Clock className="size-3.5 text-yellow-600" />
              En sala de espera
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">{queue.length}</Badge>
            </h3>
            <Button variant="ghost" size="icon" className="size-6" onClick={refresh}>
              <RefreshCw className="size-3" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {queue.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Sin pacientes en espera</p>
              ) : null}
              {queue.map((entry) => (
                <Card key={entry.appointment_id} className="border-yellow-200 dark:border-yellow-900/40">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-none">
                          <User className="size-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{entry.patient_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.appointment_time), "HH:mm", { locale: es })}
                            {entry.motivo ? ` · ${entry.motivo}` : ""}
                          </p>
                        </div>
                      </div>
                      {entry.wait_elapsed_mins > 0 && (
                        <Badge variant="outline" className="text-[10px] flex-none">
                          {entry.wait_elapsed_mins}m
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() =>
                        entry.checkin_id && callIn(entry.appointment_id, entry.checkin_id)
                      }
                    >
                      <ArrowRight className="size-3 mr-1" />
                      Llamar al consultorio
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Column 2: In consultation (en_consulta) ──────────────────── */}
        <div className="flex flex-col min-h-0">
          <div className="px-4 py-2 border-b bg-green-50/50 dark:bg-green-900/10">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Stethoscope className="size-3.5 text-green-600" />
              En consulta
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">{inConsult.length}</Badge>
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {inConsult.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Consultorio disponible</p>
              ) : null}
              {inConsult.map((entry) => (
                <Card key={entry.appointment_id} className="border-green-200 dark:border-green-900/40">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-none">
                          <Stethoscope className="size-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{entry.patient_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.appointment_time), "HH:mm", { locale: es })}
                            {entry.motivo ? ` · ${entry.motivo}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-7 text-xs border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() =>
                        complete(entry.appointment_id, entry.checkin_id)
                      }
                    >
                      <CheckCircle2 className="size-3 mr-1 text-green-600" />
                      Completar consulta
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Column 3: Upcoming (pendiente/confirmada) ─────────────────── */}
        <div className="flex flex-col min-h-0">
          <div className="px-4 py-2 border-b bg-muted/20">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-muted-foreground" />
              Próximas
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">{upcoming.length}</Badge>
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Sin citas pendientes hoy</p>
              ) : null}
              {upcoming.map((entry) => (
                <Card key={entry.appointment_id} className="opacity-80">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center flex-none">
                          <User className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{entry.patient_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.appointment_time), "HH:mm", { locale: es })}
                            {entry.motivo ? ` · ${entry.motivo}` : ""}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn("text-[10px] flex-none", STATUS_STYLES[entry.status as keyof typeof STATUS_STYLES])}
                      >
                        {STATUS_LABELS[entry.status] ?? entry.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() =>
                          checkIn(entry.appointment_id, { method: "manual", patientId: null })
                        }
                      >
                        <UserCog className="size-3 mr-1" />
                        Check-in manual
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-7 p-0 flex-none"
                        title="Generar QR de check-in"
                        onClick={() => openQrModal(entry.appointment_id, entry.patient_name)}
                      >
                        <QrCode className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ── QR Modal ──────────────────────────────────────────────────────── */}
      <Dialog open={!!qrModal} onOpenChange={(o) => { if (!o) setQrModal(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="size-4 text-primary" />
              Check-in QR
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-sm text-muted-foreground text-center">
              {qrModal?.patientName} puede escanear este código para hacer
              su check-in desde su teléfono.
            </p>

            {qrModal?.loading && (
              <div className="size-[256px] flex items-center justify-center rounded-xl border bg-muted/20">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!qrModal?.loading && qrModal?.qrDataUrl && (
              <div className="rounded-xl border p-3 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrModal.qrDataUrl} alt="QR de check-in" width={256} height={256} />
              </div>
            )}

            {!qrModal?.loading && !qrModal?.qrDataUrl && (
              <div className="size-[256px] flex flex-col items-center justify-center rounded-xl border bg-muted/20 gap-2 text-muted-foreground">
                <AlertCircle className="size-6" />
                <span className="text-xs">No se pudo generar el QR</span>
              </div>
            )}

            {qrModal?.token && (
              <div className="w-full space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">Enlace directo</p>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-muted rounded px-2 py-1.5 truncate font-mono">
                    {window.location.origin}/checkin/{qrModal.token}
                  </code>
                  <Button variant="outline" size="icon" className="size-8 flex-none" onClick={copyToken}>
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
