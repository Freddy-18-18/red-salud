"use client";

import {
  CalendarPlus,
  Check,
  Copy,
  Mail,
  MessageCircle,
  Share2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { AppointmentDetail } from "@/lib/services/appointments/appointments.types";

interface ShareAppointmentDialogProps {
  appointment: AppointmentDetail;
  onClose: () => void;
}

const APPOINTMENT_TYPE_LABEL: Record<string, string> = {
  in_person: "presencial",
  telemedicine: "videollamada",
  emergency: "emergencia",
  follow_up: "control",
  first_visit: "primera consulta",
};

function buildShareMessage(appointment: AppointmentDetail): string {
  const lines: string[] = [];
  const date = new Date(appointment.scheduled_at).toLocaleDateString("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = new Date(appointment.scheduled_at).toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const doctor = appointment.doctor?.full_name ?? "mi médico";
  const specialty = (() => {
    const dp = appointment.doctor?.doctor_profile;
    const sp = dp?.specialty;
    return sp?.name ?? null;
  })();

  const typeLabel =
    APPOINTMENT_TYPE_LABEL[appointment.appointment_type] ?? "consulta";

  lines.push(`Hola, te aviso que tengo cita ${typeLabel} el ${date} a las ${time}.`);
  if (specialty) {
    lines.push(`Con Dr. ${doctor} (${specialty}).`);
  } else {
    lines.push(`Con Dr. ${doctor}.`);
  }

  const loc = appointment.location;
  if (
    appointment.appointment_type !== "telemedicine" &&
    loc &&
    (loc.address_line || loc.city)
  ) {
    const parts = [loc.name, loc.address_line, loc.city, loc.state]
      .filter(Boolean)
      .join(", ");
    lines.push(`Sede: ${parts}.`);
    if (loc.phone) lines.push(`Tel. sede: ${loc.phone}.`);
  }
  if (appointment.appointment_type === "telemedicine") {
    lines.push("Es por videollamada — me uno desde Red-Salud.");
  }

  return lines.join("\n");
}

export function ShareAppointmentDialog({
  appointment,
  onClose,
}: ShareAppointmentDialogProps) {
  const message = useMemo(() => buildShareMessage(appointment), [appointment]);
  const subject = "Mi próxima cita médica";
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(message)}`;
  const icsUrl = `/api/appointments/${appointment.id}/ics`;

  const handleCopy = async () => {
    setError(null);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      // Revert after 2s so subsequent copies are obvious.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        "Tu navegador no permitió copiar al portapapeles. Seleccioná y copiá manualmente.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Share2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3
                id="share-dialog-title"
                className="text-base font-semibold text-gray-900"
              >
                Compartir cita
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Avisá a un familiar o acompañante
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {/* Message preview */}
          <div className="text-sm text-gray-800 bg-gray-50 border border-gray-100 rounded-xl p-3 whitespace-pre-line">
            {message}
          </div>

          {/* Channel buttons */}
          <div className="grid grid-cols-1 gap-2">
            <ShareLink
              icon={MessageCircle}
              label="Compartir por WhatsApp"
              hint="Abre WhatsApp con el mensaje listo"
              href={whatsappUrl}
              tone="emerald"
            />
            <ShareLink
              icon={Mail}
              label="Enviar por email"
              hint="Abre tu cliente de correo"
              href={mailtoUrl}
              tone="cyan"
            />
            <ShareLink
              icon={CalendarPlus}
              label="Descargar invitación de calendario"
              hint="Archivo .ics para Google / Apple / Outlook"
              href={icsUrl}
              tone="violet"
              download={`cita-${appointment.id}.ics`}
            />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Mensaje copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar mensaje
              </>
            )}
          </button>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <p className="text-[11px] text-gray-400 leading-relaxed">
            El mensaje contiene los datos de tu cita (doctor, fecha, hora, sede).
            No incluye información médica privada.
          </p>
        </div>
      </div>
    </div>
  );
}

interface ShareLinkProps {
  icon: LucideIcon;
  label: string;
  hint: string;
  href: string;
  tone: "emerald" | "cyan" | "violet";
  download?: string;
}

function ShareLink({ icon: Icon, label, hint, href, tone, download }: ShareLinkProps) {
  const palette =
    tone === "emerald"
      ? "bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-700"
      : tone === "cyan"
        ? "bg-cyan-50 border-cyan-100 hover:bg-cyan-100 text-cyan-700"
        : "bg-violet-50 border-violet-100 hover:bg-violet-100 text-violet-700";
  return (
    <a
      href={href}
      target={download ? undefined : "_blank"}
      rel="noopener noreferrer"
      download={download}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition ${palette}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs opacity-80 truncate">{hint}</p>
      </div>
    </a>
  );
}
