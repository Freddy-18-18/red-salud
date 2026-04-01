"use client";

import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Stethoscope,
} from "lucide-react";

import {
  type QueueEntry,
  type QueueStatus,
  QUEUE_STATUS_CONFIG,
  formatWaitTime,
  formatQueueDate,
} from "@/lib/services/queue-service";

interface QueueHistoryProps {
  entries: QueueEntry[];
  loading?: boolean;
}

const STATUS_ICONS: Record<QueueStatus, typeof CheckCircle2> = {
  waiting: Clock,
  in_progress: Stethoscope,
  completed: CheckCircle2,
  cancelled: XCircle,
  no_show: AlertCircle,
};

export function QueueHistory({
  entries,
  loading = false,
}: QueueHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-white border border-gray-100 rounded-xl skeleton"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
          <Clock className="h-7 w-7 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-900">
          Sin historial de turnos
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Tus turnos anteriores apareceran aqui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-900">
        Historial de turnos
      </p>

      {entries.map((entry) => {
        const statusConfig = QUEUE_STATUS_CONFIG[entry.status];
        const StatusIcon = STATUS_ICONS[entry.status] ?? Clock;

        // Calculate actual wait time if completed
        let actualWait: string | null = null;
        if (entry.completed_at && entry.joined_at) {
          const waitMs =
            new Date(entry.completed_at).getTime() -
            new Date(entry.joined_at).getTime();
          actualWait = formatWaitTime(Math.round(waitMs / 60000));
        }

        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig.bg}`}
            >
              <StatusIcon className={`h-5 w-5 ${statusConfig.text}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {entry.ticket_number}
                </p>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                {entry.doctor_name && (
                  <span>Dr. {entry.doctor_name}</span>
                )}
                {entry.specialty && (
                  <>
                    <span>&middot;</span>
                    <span>{entry.specialty}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                <span>{formatQueueDate(entry.joined_at)}</span>
                {actualWait && (
                  <>
                    <span>&middot;</span>
                    <span>Espera: {actualWait}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
