"use client";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  Bell,
  Calendar,
  CalendarPlus,
  Clock,
  Languages,
  MapPin,
  Phone,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CancelAppointmentDialog } from "@/components/citas/cancel-appointment-dialog";
import { PaymentDialog } from "@/components/citas/payment-dialog";
import { PreconsultDialog } from "@/components/citas/preconsult-dialog";
import { RateAppointmentDialog } from "@/components/citas/rate-appointment-dialog";
import { RescheduleAppointmentDialog } from "@/components/citas/reschedule-appointment-dialog";
import { ShareAppointmentDialog } from "@/components/citas/share-appointment-dialog";
import { VideoJoinButton } from "@/components/citas/video-join-button";
import { WaitlistToggle } from "@/components/citas/waitlist-toggle";
import { PriceDisplay } from "@/components/currency/price-display";
import {
  useCancelAppointment,
  useRescheduleAppointment,
} from "@/hooks/use-appointments";
import type {
  AppointmentDetail,
  AppointmentStatus,
  AppointmentType,
} from "@/lib/services/appointments/appointments.types";

interface CitaDetailProps {
  appointment: AppointmentDetail;
  userId: string;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "Pendiente", bg: "bg-amber-50", text: "text-amber-700" },
  confirmed: { label: "Confirmada", bg: "bg-emerald-50", text: "text-emerald-700" },
  completed: { label: "Completada", bg: "bg-blue-50", text: "text-blue-700" },
  cancelled: { label: "Cancelada", bg: "bg-red-50", text: "text-red-700" },
  waiting: { label: "En espera", bg: "bg-purple-50", text: "text-purple-700" },
  in_progress: { label: "En curso", bg: "bg-cyan-50", text: "text-cyan-700" },
  no_show: { label: "No asistió", bg: "bg-gray-100", text: "text-gray-600" },
};

const APPOINTMENT_TYPE_CONFIG: Record<
  AppointmentType,
  { label: string; icon: LucideIcon; bg: string; text: string }
> = {
  in_person: {
    label: "Presencial",
    icon: MapPin,
    bg: "bg-gray-100",
    text: "text-gray-700",
  },
  telemedicine: {
    label: "Video consulta",
    icon: Video,
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  emergency: {
    label: "Emergencia",
    icon: AlertCircle,
    bg: "bg-red-50",
    text: "text-red-700",
  },
  follow_up: {
    label: "Control",
    icon: RefreshCw,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  first_visit: {
    label: "Primera visita",
    icon: Stethoscope,
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
};

function formatLongDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-VE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function formatRelative(iso: string): string {
  try {
    const dt = new Date(iso).getTime();
    const now = Date.now();
    const diffMs = dt - now;
    const diffHours = Math.round(diffMs / 3_600_000);
    const diffDays = Math.round(diffMs / 86_400_000);

    if (diffMs < 0) {
      const past = Math.abs(diffMs);
      const pastHours = Math.round(past / 3_600_000);
      const pastDays = Math.round(past / 86_400_000);
      if (pastHours < 24) return `Hace ${pastHours}h`;
      if (pastDays < 7) return `Hace ${pastDays} día${pastDays > 1 ? "s" : ""}`;
      return "Cita pasada";
    }
    if (diffHours < 1) {
      const mins = Math.max(1, Math.round(diffMs / 60_000));
      return `En ${mins} min`;
    }
    if (diffHours < 24) return `En ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays < 7) return `En ${diffDays} día${diffDays > 1 ? "s" : ""}`;
    return formatLongDate(iso);
  } catch {
    return "";
  }
}

function buildMapUrl(
  lat?: number | null,
  lng?: number | null,
  fallbackQuery?: string,
): string | null {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (fallbackQuery) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      fallbackQuery,
    )}`;
  }
  return null;
}

export function CitaDetail({ appointment, userId }: CitaDetailProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showPreconsultDialog, setShowPreconsultDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [optimisticAppointment, setOptimisticAppointment] = useState(appointment);
  const { cancel, loading: cancelling } = useCancelAppointment();
  const { reschedule, loading: rescheduling } = useRescheduleAppointment();

  const statusConfig =
    STATUS_CONFIG[optimisticAppointment.status] ?? STATUS_CONFIG.pending;
  const typeConfig =
    APPOINTMENT_TYPE_CONFIG[optimisticAppointment.appointment_type] ??
    APPOINTMENT_TYPE_CONFIG.in_person;
  const TypeIcon = typeConfig.icon;

  const isUpcoming =
    new Date(optimisticAppointment.scheduled_at).getTime() > Date.now();
  const canCancel =
    isUpcoming &&
    optimisticAppointment.status !== "cancelled" &&
    optimisticAppointment.status !== "completed";
  const isVideo = optimisticAppointment.appointment_type === "telemedicine";
  const isCompleted = optimisticAppointment.status === "completed";

  const reviewRow = (() => {
    const r = optimisticAppointment.review;
    if (!r) return null;
    return Array.isArray(r) ? r[0] ?? null : r;
  })();
  const hasReview = !!reviewRow;
  const hasPreconsult = !!optimisticAppointment.notes?.includes(
    "[Pre-consulta IA]",
  );

  const doctor = optimisticAppointment.doctor;
  const doctorProfile = doctor?.doctor_profile ?? null;
  const specialty = doctorProfile?.specialty?.name ?? null;
  const location = optimisticAppointment.location;

  const initials = (doctor?.full_name || "D")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const mapUrl = buildMapUrl(
    location?.latitude,
    location?.longitude,
    location
      ? [location.address_line, location.city, location.state]
          .filter(Boolean)
          .join(", ")
      : undefined,
  );

  const handleConfirmCancel = async (reason: string | undefined) => {
    const result = await cancel(optimisticAppointment.id, userId, reason);
    if (result.success) {
      setShowCancelDialog(false);
      setOptimisticAppointment((prev) => ({
        ...prev,
        status: "cancelled",
        cancellation_reason: reason ?? null,
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
      }));
      router.refresh();
    }
    return result;
  };

  const handleConfirmReschedule = async (newScheduledAtIso: string) => {
    const result = await reschedule(optimisticAppointment.id, newScheduledAtIso);
    if (result.success && result.data) {
      setShowRescheduleDialog(false);
      setOptimisticAppointment((prev) => ({
        ...prev,
        scheduled_at: newScheduledAtIso,
        // The API moves a `confirmed` booking back to `pending` so the doctor
        // re-confirms; mirror that locally for an optimistic UI.
        status: prev.status === "confirmed" ? "pending" : prev.status,
      }));
      router.refresh();
    }
    return { success: result.success, error: result.error };
  };

  return (
    <div className="space-y-6">
      {/* Header con back button + share */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/citas"
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Volver a Mis Citas"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Detalle de cita
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {formatRelative(optimisticAppointment.scheduled_at)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowShareDialog(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          aria-label="Compartir cita"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Compartir</span>
        </button>
      </div>

      {/* Doctor card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {doctor?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name ?? "Médico"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-semibold text-emerald-600">
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">
                  Dr. {doctor?.full_name ?? "Médico"}
                </h2>
                {specialty && (
                  <p className="text-sm text-gray-500 mt-0.5">{specialty}</p>
                )}
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}
              >
                {statusConfig.label}
              </span>
            </div>

            {/* Doctor badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {doctorProfile?.sacs_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  SACS verificado
                </span>
              )}
              {doctorProfile?.verified && !doctorProfile.sacs_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                  <ShieldCheck className="h-3 w-3" />
                  Verificado
                </span>
              )}
              {doctorProfile?.years_experience != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                  <Award className="h-3 w-3" />
                  {doctorProfile.years_experience} años de experiencia
                </span>
              )}
              {doctorProfile?.languages && doctorProfile.languages.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                  <Languages className="h-3 w-3" />
                  {doctorProfile.languages.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cita info */}
      <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Información de la cita</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow
            icon={Calendar}
            label="Fecha"
            value={
              <span className="capitalize">
                {formatLongDate(optimisticAppointment.scheduled_at)}
              </span>
            }
          />
          <InfoRow
            icon={Clock}
            label="Hora"
            value={`${formatTime(optimisticAppointment.scheduled_at)} (${
              optimisticAppointment.duration_minutes
            } min)`}
          />
          <InfoRow
            icon={TypeIcon}
            label="Tipo de consulta"
            value={
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}
              >
                <TypeIcon className="h-3 w-3" />
                {typeConfig.label}
              </span>
            }
          />
          {optimisticAppointment.price != null && (
            <InfoRow
              icon={Award}
              label="Tarifa"
              value={
                <PriceDisplay
                  amount={Number(optimisticAppointment.price)}
                  currency="USD"
                  showBs
                />
              }
            />
          )}
        </div>

        {optimisticAppointment.reason && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Motivo</p>
            <p className="text-sm text-gray-700">
              {optimisticAppointment.reason}
            </p>
          </div>
        )}

        {optimisticAppointment.notes && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Notas</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {optimisticAppointment.notes}
            </p>
          </div>
        )}

        {optimisticAppointment.status === "cancelled" &&
          optimisticAppointment.cancellation_reason && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Motivo de cancelación</p>
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                {optimisticAppointment.cancellation_reason}
              </p>
            </div>
          )}
      </section>

      {/* Sede (in-person only) */}
      {!isVideo && (
        <section className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            Sede
          </h3>

          {location ? (
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {location.name}
                </p>
                {location.organization?.name && (
                  <p className="text-xs text-gray-500">
                    {location.organization.name}
                  </p>
                )}
              </div>

              {(location.address_line || location.city || location.state) && (
                <p className="text-sm text-gray-600">
                  {[location.address_line, location.city, location.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {location.phone && (
                  <a
                    href={`tel:${location.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {location.phone}
                  </a>
                )}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Ver en mapa
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              La sede será confirmada por el médico antes de tu cita.
            </p>
          )}
        </section>
      )}

      {/* Reminders (only when upcoming) */}
      {isUpcoming && optimisticAppointment.status !== "cancelled" && (
        <section className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Bell className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900">
              Recordatorios automáticos activos
            </p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Te avisaremos 24 horas, 2 horas y 30 minutos antes de la cita.
            </p>
            <Link
              href="/dashboard/notificaciones"
              className="text-xs text-emerald-700 underline hover:text-emerald-900 mt-1 inline-block"
            >
              Configurar canales
            </Link>
          </div>
        </section>
      )}

      {/* Pre-consulta IA — only for upcoming citas where the patient hasn't
          already sent a brief, or where they may want to update it. */}
      {canCancel && (
        <section className="bg-violet-50/60 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-violet-900">
              {hasPreconsult
                ? "Pre-consulta enviada al médico"
                : "Pre-consulta con IA (opcional)"}
            </p>
            <p className="text-xs text-violet-800 mt-0.5">
              {hasPreconsult
                ? "El médico recibió tu resumen estructurado. Podés actualizarlo si surgen nuevos síntomas."
                : "Contanos lo que sentís — la IA arma un resumen para que el médico lo lea antes de la cita."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreconsultDialog(true)}
            className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition bg-violet-500 text-white hover:bg-violet-600"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {hasPreconsult ? "Actualizar" : "Empezar"}
          </button>
        </section>
      )}

      {/* Waitlist (only for upcoming non-cancelled citas, in-person OR video) */}
      {canCancel && (
        <WaitlistToggle appointment={optimisticAppointment} />
      )}

      {/* Payment status (only when there's a price) */}
      {optimisticAppointment.price != null &&
        Number(optimisticAppointment.price) > 0 && (
          <PaymentSection
            paymentStatus={optimisticAppointment.payment_status ?? null}
            paymentMethod={optimisticAppointment.payment_method ?? null}
            amountUsd={Number(optimisticAppointment.price)}
            canRegister={canCancel}
            onRegister={() => setShowPaymentDialog(true)}
          />
        )}

      {/* Cancellation policy (only when applicable) */}
      {canCancel && (
        <section className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Política de cancelación:</span>{" "}
            puedes cancelar sin costo hasta{" "}
            {optimisticAppointment.cancellation_window_hours} horas antes de la
            cita.
          </p>
        </section>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        {isVideo && canCancel && (
          <VideoJoinButton
            appointmentId={optimisticAppointment.id}
            scheduledAt={optimisticAppointment.scheduled_at}
            durationMinutes={optimisticAppointment.duration_minutes}
            status={optimisticAppointment.status}
            onError={setVideoError}
          />
        )}

        {canCancel && (
          <button
            type="button"
            onClick={() => setShowRescheduleDialog(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Reagendar
          </button>
        )}

        {canCancel && (
          <a
            href={`/api/appointments/${optimisticAppointment.id}/ics`}
            download={`cita-${optimisticAppointment.id}.ics`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
            title="Descarga un archivo .ics para Google Calendar, Apple Calendar u Outlook"
          >
            <CalendarPlus className="h-4 w-4" />
            Agregar al calendario
          </a>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={() => setShowCancelDialog(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition"
          >
            <X className="h-4 w-4" />
            Cancelar cita
          </button>
        )}

        {isCompleted && !hasReview && (
          <button
            type="button"
            onClick={() => setShowRateDialog(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition"
          >
            <Star className="h-4 w-4 fill-white" />
            Calificar consulta
          </button>
        )}

        {isCompleted && hasReview && reviewRow && (
          <span
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-xl"
            title={`Calificada con ${reviewRow.rating}/5`}
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {reviewRow.rating}/5 — Reseña enviada
          </span>
        )}

        {isCompleted && (
          <Link
            href="/dashboard/agendar"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
          >
            <Calendar className="h-4 w-4" />
            Agendar de nuevo
          </Link>
        )}
      </div>

      {videoError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed flex-1">
            {videoError}
          </p>
          <button
            type="button"
            onClick={() => setVideoError(null)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Cerrar
          </button>
        </div>
      )}

      {showCancelDialog && (
        <CancelAppointmentDialog
          appointment={optimisticAppointment}
          onConfirm={handleConfirmCancel}
          onClose={() => setShowCancelDialog(false)}
          loading={cancelling}
        />
      )}

      {showRescheduleDialog && (
        <RescheduleAppointmentDialog
          appointment={optimisticAppointment}
          onConfirm={handleConfirmReschedule}
          onClose={() => setShowRescheduleDialog(false)}
          loading={rescheduling}
        />
      )}

      {showRateDialog && (
        <RateAppointmentDialog
          appointment={optimisticAppointment}
          onSubmitted={(rating) => {
            setShowRateDialog(false);
            setOptimisticAppointment((prev) => ({
              ...prev,
              review: {
                id: "optimistic",
                rating,
                created_at: new Date().toISOString(),
              },
            }));
            router.refresh();
          }}
          onClose={() => setShowRateDialog(false)}
        />
      )}

      {showPreconsultDialog && (
        <PreconsultDialog
          appointmentId={optimisticAppointment.id}
          onSaved={() => {
            setShowPreconsultDialog(false);
            // Mark as having a preconsult so the section flips state until the
            // server-rendered notes refresh on next navigation.
            setOptimisticAppointment((prev) => ({
              ...prev,
              notes: prev.notes
                ? `${prev.notes}\n\n[Pre-consulta IA]`
                : "[Pre-consulta IA]",
            }));
            router.refresh();
          }}
          onClose={() => setShowPreconsultDialog(false)}
        />
      )}

      {showPaymentDialog && optimisticAppointment.price != null && (
        <PaymentDialog
          appointmentId={optimisticAppointment.id}
          amountUsd={Number(optimisticAppointment.price)}
          onSubmitted={(method) => {
            setShowPaymentDialog(false);
            setOptimisticAppointment((prev) => ({
              ...prev,
              payment_method: method,
              payment_status: "processing",
            }));
            router.refresh();
          }}
          onClose={() => setShowPaymentDialog(false)}
        />
      )}

      {showShareDialog && (
        <ShareAppointmentDialog
          appointment={optimisticAppointment}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}

interface PaymentSectionProps {
  paymentStatus: string | null;
  paymentMethod: string | null;
  amountUsd: number;
  canRegister: boolean;
  onRegister: () => void;
}

function PaymentSection({
  paymentStatus,
  paymentMethod,
  amountUsd,
  canRegister,
  onRegister,
}: PaymentSectionProps) {
  const isPaid = paymentStatus === "paid";
  const isProcessing = paymentStatus === "processing";
  const isPending = !isPaid && !isProcessing;

  const tone = isPaid
    ? "bg-emerald-50/60 border-emerald-100"
    : isProcessing
      ? "bg-cyan-50/60 border-cyan-100"
      : "bg-gray-50 border-gray-200";

  return (
    <section className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isPaid
              ? "bg-emerald-100 text-emerald-600"
              : isProcessing
                ? "bg-cyan-100 text-cyan-600"
                : "bg-gray-200 text-gray-600"
          }`}
        >
          <Award className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {isPaid
              ? "Pago confirmado"
              : isProcessing
                ? "Pago en verificación"
                : "Pago pendiente"}
          </p>
          <div className="text-xs text-gray-600 mt-0.5">
            <PriceDisplay amount={amountUsd} currency="USD" showBs />
          </div>
          {isProcessing && paymentMethod && (
            <p className="text-xs text-cyan-700 mt-1">
              Método: {humanPaymentMethod(paymentMethod)} — esperando que el
              médico verifique.
            </p>
          )}
          {isPending && (
            <p className="text-xs text-gray-600 mt-1">
              Registrá tu pago anticipado para asegurar tu cita.
            </p>
          )}
        </div>
        {isPending && canRegister && (
          <button
            type="button"
            onClick={onRegister}
            className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
          >
            Registrar pago
          </button>
        )}
      </div>
    </section>
  );
}

function humanPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    pago_movil: "Pago Móvil",
    transferencia: "Transferencia",
    efectivo: "Efectivo",
    zelle: "Zelle",
    tarjeta_credito: "Tarjeta de crédito",
    tarjeta_debito: "Tarjeta de débito",
    cash: "Efectivo",
    transfer: "Transferencia",
    card: "Tarjeta",
    insurance: "Seguro",
    mobile_payment: "Pago Móvil",
    pending: "Pendiente",
  };
  return map[method] ?? method;
}

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="text-sm font-medium text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  );
}
