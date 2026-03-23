import { Calendar, Clock, MoreVertical } from "lucide-react";

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface AppointmentCardProps {
  id: string;
  doctorName: string;
  specialty?: string;
  avatarUrl?: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  reason?: string;
  onCancel?: () => void;
  onReschedule?: () => void;
  onRate?: () => void;
  onRebook?: () => void;
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pendiente", bg: "bg-amber-50", text: "text-amber-700" },
  confirmed: { label: "Confirmada", bg: "bg-emerald-50", text: "text-emerald-700" },
  completed: { label: "Completada", bg: "bg-blue-50", text: "text-blue-700" },
  cancelled: { label: "Cancelada", bg: "bg-red-50", text: "text-red-700" },
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-VE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function AppointmentCard({
  doctorName,
  specialty,
  avatarUrl,
  date,
  time,
  duration,
  status,
  reason,
  onCancel,
  onReschedule,
  onRate,
  onRebook,
}: AppointmentCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const initials = doctorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={doctorName} className="h-full w-full object-cover rounded-xl" />
          ) : (
            <span className="text-lg font-semibold text-emerald-600">{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">Dr. {doctorName}</h3>
              {specialty && <p className="text-xs text-gray-500">{specialty}</p>}
            </div>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="capitalize">{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{time?.slice(0, 5)} ({duration} min)</span>
            </div>
          </div>

          {reason && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-1">
              Motivo: {reason}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {status === "confirmed" || status === "pending" ? (
              <>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                  >
                    Cancelar
                  </button>
                )}
                {onReschedule && (
                  <button
                    onClick={onReschedule}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    Reprogramar
                  </button>
                )}
              </>
            ) : null}
            {status === "completed" && onRate && (
              <button
                onClick={onRate}
                className="px-3 py-1.5 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition"
              >
                Calificar
              </button>
            )}
            {status === "completed" && onRebook && (
              <button
                onClick={onRebook}
                className="px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
              >
                Agendar de nuevo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
