'use client';

import { useMemo } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Building2,
  CalendarDays,
  Clock,
  CreditCard,
  FileText,
  MessageCircle,
  Paperclip,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  User,
  Video,
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@red-salud/design-system';

import type { AppointmentRow } from '@red-salud/core';
import type { SelectedPatient } from './patient-picker';
import type { CompanionData } from './companion-field';
import type { PaymentMethod } from './payment-field';
import type { SlotIssue } from './slot-validation';
import { DayMiniPreview } from './day-mini-preview';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash_usd: 'Efectivo USD',
  cash_bs: 'Efectivo Bs',
  transfer_bcv: 'Transferencia BCV',
  transfer_usd: 'Transferencia USD',
  zelle: 'Zelle',
  pago_movil: 'Pago Móvil',
  insurance: 'Seguro',
  courtesy: 'Cortesía',
};

const TYPE_LABELS: Record<string, string> = {
  in_person: 'Presencial',
  first_visit: 'Primera vez',
  follow_up: 'Control',
  telemedicine: 'Telemedicina (online)',
  emergency: 'Urgencia',
};

interface ReviewStepProps {
  patient: SelectedPatient | null;
  date: string;
  time: string;
  durationMin: number;
  appointmentType: string;
  reason: string;
  /** String separado por comas. Parseamos al renderizar como chips. */
  preparations: string;
  companion: CompanionData;
  companionRequired: boolean;
  paymentMethod: PaymentMethod;
  paymentAmount: number | null;
  notifyEnabled: boolean;
  notifyChannel: 'whatsapp' | 'sms';
  notifyAdvance: Set<string>;
  attachments: File[];
  meetingUrl: string | null;
  internalNotes: string;
  // Sede selector
  sedes: Array<{ id: string; name: string; address?: string | null }>;
  selectedSedeId: string | null;
  onSedeChange: (id: string) => void;
  // Validation
  issues: SlotIssue[];
  validationOk: boolean;
  // Day preview
  dayAppointments: AppointmentRow[];
  // Override warnings
  hasWarnings: boolean;
  overrideWarnings: boolean;
  onOverrideWarningsChange: (v: boolean) => void;
}

/**
 * Paso final del wizard: muestra TODO lo configurado en cards de solo lectura
 * + selector de sede + validation + mini-preview del día. Permite al doctor
 * confirmar antes de crear la cita.
 */
export function ReviewStep({
  patient,
  date,
  time,
  durationMin,
  appointmentType,
  reason,
  preparations,
  companion,
  companionRequired,
  paymentMethod,
  paymentAmount,
  notifyEnabled,
  notifyChannel,
  notifyAdvance,
  attachments,
  meetingUrl,
  internalNotes,
  sedes,
  selectedSedeId,
  onSedeChange,
  issues,
  validationOk,
  dayAppointments,
  hasWarnings,
  overrideWarnings,
  onOverrideWarningsChange,
}: ReviewStepProps) {
  const friendlyDate = useMemo(() => {
    try {
      return new Date(`${date}T${time}:00`).toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  }, [date, time]);

  const typeLabel = TYPE_LABELS[appointmentType] ?? appointmentType;
  const selectedSede = sedes.find((s) => s.id === selectedSedeId) ?? null;

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ===== LEFT: resumen de campos ===== */}
      <div className="space-y-3">
        {/* Paciente */}
        <SummaryCard icon={User} title="Paciente">
          {patient ? (
            <div>
              <p className="text-sm font-semibold text-foreground">{patient.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {patient.nacionalidad}-{patient.national_id}
              </p>
            </div>
          ) : (
            <p className="text-xs text-warning">Sin paciente seleccionado</p>
          )}
        </SummaryCard>

        {/* Fecha + tipo */}
        <SummaryCard icon={CalendarDays} title="Cita">
          <div className="space-y-1">
            <p className="text-sm font-semibold capitalize text-foreground">{friendlyDate}</p>
            <p className="text-xs text-muted-foreground">
              {time} hs · {durationMin} min · <span className="font-medium">{typeLabel}</span>
            </p>
            {meetingUrl && (
              <div className="mt-2 rounded-md border border-violet-500/30 bg-violet-500/5 p-2">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                  <Video className="h-3 w-3" />
                  Sala de telemedicina
                </p>
                <p className="mt-0.5 break-all text-[10px] text-foreground">{meetingUrl}</p>
              </div>
            )}
          </div>
        </SummaryCard>

        {/* Motivo + preparación */}
        <SummaryCard icon={Stethoscope} title="Motivo y preparación">
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Motivo
              </p>
              <p className="text-sm text-foreground">{reason || <em className="text-muted-foreground">—</em>}</p>
            </div>
            {(() => {
              const items = preparations
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
              if (items.length === 0) return null;
              return (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Preparación
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {items.map((p) => (
                      <span key={p} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </SummaryCard>

        {/* Acompañante (solo si <18) */}
        {companionRequired && (
          <SummaryCard icon={ShieldAlert} title="Acompañante / responsable">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{companion.name || '—'}</p>
              <p className="text-xs text-muted-foreground">
                {companion.relationship}
                {companion.phone && ` · ${companion.phone}`}
              </p>
            </div>
          </SummaryCard>
        )}

        {/* Pago */}
        <SummaryCard icon={CreditCard} title="Pago">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">
              {PAYMENT_LABELS[paymentMethod]}
            </span>
            {paymentAmount != null && paymentMethod !== 'courtesy' && (
              <span className="text-xs text-muted-foreground">
                · ${paymentAmount.toFixed(2)}
              </span>
            )}
            {paymentMethod === 'courtesy' && (
              <span className="text-xs text-muted-foreground">· Sin costo</span>
            )}
          </div>
        </SummaryCard>

        {/* Aviso */}
        <SummaryCard icon={notifyEnabled ? Bell : BellOff} title="Aviso al paciente">
          {notifyEnabled ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                {notifyChannel === 'whatsapp' ? (
                  <MessageCircle className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Phone className="h-3.5 w-3.5 text-info" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {notifyChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[...notifyAdvance].map((a) => (
                  <span key={a} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {a === '24h' ? '24h antes' : a === '2h' ? '2h antes' : '30min antes'}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No se enviará aviso</p>
          )}
        </SummaryCard>

        {/* Archivos */}
        {attachments.length > 0 && (
          <SummaryCard icon={Paperclip} title={`Archivos (${attachments.length})`}>
            <ul className="space-y-0.5">
              {attachments.map((f, i) => (
                <li key={i} className="truncate text-xs text-foreground" title={f.name}>
                  · {f.name} <span className="text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
                </li>
              ))}
            </ul>
          </SummaryCard>
        )}

        {/* Notas internas */}
        {internalNotes.trim().length > 0 && (
          <SummaryCard icon={FileText} title="Notas internas">
            <p className="whitespace-pre-line text-xs text-foreground">{internalNotes}</p>
          </SummaryCard>
        )}
      </div>

      {/* ===== RIGHT: sede + validation + preview ===== */}
      <aside className="space-y-3">
        {/* Sede selector */}
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            Consultorio
          </h3>
          {sedes.length === 0 ? (
            <p className="text-xs text-warning">Sin sedes configuradas.</p>
          ) : sedes.length === 1 ? (
            <div className="rounded-md bg-muted/40 px-2.5 py-2 text-xs">
              <p className="font-medium text-foreground">{selectedSede?.name}</p>
              {selectedSede?.address && (
                <p className="text-[11px] text-muted-foreground">{selectedSede.address}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="rev-sede" className="text-xs">Elegí la sede</Label>
              <Select value={selectedSedeId ?? undefined} onValueChange={onSedeChange}>
                <SelectTrigger id="rev-sede" className="h-9 w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Validation */}
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Disponibilidad
          </h3>
          {validationOk && (
            <Alert className="py-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <AlertTitle className="text-xs text-success">Slot disponible</AlertTitle>
              <AlertDescription className="text-[11px]">Sin conflictos.</AlertDescription>
            </Alert>
          )}
          {issues.length > 0 && (
            <ul className="space-y-1.5">
              {issues.map((issue, idx) => (
                <li
                  key={`${issue.code}-${idx}`}
                  className={
                    issue.severity === 'error'
                      ? 'rounded-md border border-destructive/30 bg-destructive/5 p-2'
                      : 'rounded-md border border-warning/30 bg-warning/5 p-2'
                  }
                >
                  <div className="flex items-start gap-1.5">
                    {issue.severity === 'error' ? (
                      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-destructive" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
                    )}
                    <div className="min-w-0">
                      <p className={issue.severity === 'error' ? 'text-xs font-medium text-destructive' : 'text-xs font-medium text-warning'}>
                        {issue.message}
                      </p>
                      {issue.detail && <p className="mt-0.5 text-[10px] text-muted-foreground">{issue.detail}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Override warnings checkbox */}
        {hasWarnings && (
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-xs text-foreground/90">
            <input
              type="checkbox"
              checked={overrideWarnings}
              onChange={(e) => onOverrideWarningsChange(e.target.checked)}
              className="mt-0.5"
            />
            <span>Entiendo las advertencias y quiero crear la cita igual.</span>
          </label>
        )}

        {/* Mini preview */}
        <DayMiniPreview
          date={date}
          time={time}
          durationMin={durationMin}
          appointments={dayAppointments}
        />
      </aside>
    </div>
  );
}

// ============================================================================
// SUB: SummaryCard
// ============================================================================

function SummaryCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof CalendarDays;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
