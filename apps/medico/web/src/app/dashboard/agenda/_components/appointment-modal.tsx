'use client';

import { Calendar, Check, Clock, RotateCcw, User, X } from 'lucide-react';
import {
  STATUS_CONFIG,
  getTypeStyle,
  type Appointment,
} from './agenda-shared';

interface AppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export function AppointmentModal({
  appointment,
  onClose,
  onUpdateStatus,
}: AppointmentModalProps) {
  const time = new Date(appointment.scheduled_at);
  const status = STATUS_CONFIG[appointment.status];
  const type = getTypeStyle(appointment.appointment_type);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appt-modal-title"
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="appt-modal-title" className="text-lg font-bold text-foreground">
            Detalle de cita
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground/70" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {appointment.paciente?.full_name ?? 'Sin paciente'}
              </p>
              {appointment.paciente?.telefono && (
                <p className="text-xs text-muted-foreground">{appointment.paciente.telefono}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground/70" />
            <div>
              <p className="text-sm text-foreground/90">
                {time.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-xs text-muted-foreground">
                {time.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                {' — '}{appointment.duration_minutes || 30} min
              </p>
            </div>
          </div>

          {appointment.reason && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground/70" />
              <p className="text-sm text-foreground/90">{appointment.reason}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {status && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.pill}`}>
                {status.label}
              </span>
            )}
            {appointment.appointment_type && (
              <span className={`rounded-full bg-muted px-2.5 py-1 text-xs font-medium ${type.text}`}>
                {type.label}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <>
              <button
                type="button"
                onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success transition-colors hover:bg-success/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
              >
                <Check className="h-4 w-4" /> Confirmar
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
            </>
          )}
          {appointment.status === 'cancelled' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(appointment.id, 'scheduled')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-info/10 px-3 py-2 text-sm font-medium text-info transition-colors hover:bg-info/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-info/40"
            >
              <RotateCcw className="h-4 w-4" /> Reprogramar
            </button>
          )}
        </div>
      </div>
    </>
  );
}
