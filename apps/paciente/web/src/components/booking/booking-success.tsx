"use client";

import { CheckCircle, Calendar, Download, Plus } from "lucide-react";
import Link from "next/link";

import type { BookingState } from "@/hooks/use-booking";
import type { AppointmentResult } from "@/lib/services/booking-service";

interface BookingSuccessProps {
  state: BookingState;
  appointment: AppointmentResult | null;
  onBookAnother: () => void;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("es-VE", options);
}

function generateICSContent(
  state: BookingState,
  appointment: AppointmentResult | null
): string {
  if (!state.date || !state.timeSlot) return "";

  const doctorName =
    state.doctor?.profile.full_name || "Doctor";

  // Parse start time
  const [startH, startM] = state.timeSlot.start.split(":").map(Number);
  const start = new Date(state.date + "T12:00:00");
  start.setHours(startH, startM, 0, 0);

  // End time (30 min later)
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  const formatICSDate = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const uid = appointment?.id || crypto.randomUUID();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Red-Salud//Citas//ES",
    "BEGIN:VEVENT",
    `UID:${uid}@redsalud.com`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:Cita medica con Dr. ${doctorName}`,
    `DESCRIPTION:${state.appointmentType === "telemedicina" ? "Consulta por telemedicina" : "Consulta presencial"} - ${state.specialty?.name || ""} - Motivo: ${state.reason}`,
    `LOCATION:${state.appointmentType === "telemedicina" ? "Telemedicina (enlace pendiente)" : "Consultorio del doctor"}`,
    "STATUS:TENTATIVE",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Recordatorio de cita medica en 30 minutos",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function BookingSuccess({
  state,
  appointment,
  onBookAnother,
}: BookingSuccessProps) {
  const doctorName =
    state.doctor?.profile.full_name || "Doctor";

  const handleDownloadICS = () => {
    const icsContent = generateICSContent(state, appointment);
    if (!icsContent) return;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cita-${state.date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-4">
      {/* Success animation */}
      <div className="relative">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-[scale-in_0.5s_ease-out]">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        {/* Decorative circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-emerald-100 rounded-full animate-ping opacity-20" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cita agendada exitosamente!
        </h2>
        <p className="text-gray-500">
          Tu cita con Dr. {doctorName} ha sido registrada.
        </p>
      </div>

      {/* Appointment summary card */}
      <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Calendar className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Fecha y hora</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {state.date ? formatDateLabel(state.date) : "-"} a las{" "}
              {state.timeSlot?.start || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Especialidad</p>
            <p className="text-sm font-medium text-gray-900">
              {state.specialty?.name}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-2 text-center">
          Estado: <span className="text-amber-600 font-medium">Pendiente de confirmacion</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleDownloadICS}
          className="w-full py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Agregar al calendario
        </button>

        <Link
          href="/dashboard/citas"
          className="block w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition text-center"
        >
          Ver mis citas
        </Link>

        <button
          onClick={onBookAnother}
          className="w-full py-3 px-4 text-emerald-600 font-medium rounded-xl hover:bg-emerald-50 transition flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agendar otra cita
        </button>
      </div>
    </div>
  );
}
