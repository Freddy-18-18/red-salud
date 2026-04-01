"use client";

import {
  Clock,
  Users,
  Stethoscope,
  Building2,
} from "lucide-react";

import {
  type QueueEntry,
  QUEUE_STATUS_CONFIG,
  formatWaitTime,
} from "@/lib/services/queue-service";

interface QueueTicketProps {
  entry: QueueEntry;
}

export function QueueTicket({ entry }: QueueTicketProps) {
  const statusConfig = QUEUE_STATUS_CONFIG[entry.status];
  const isActive = entry.status === "waiting" || entry.status === "in_progress";
  const isCalled = entry.status === "in_progress";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 ${
        isCalled
          ? "border-blue-500 bg-blue-50"
          : isActive
            ? "border-emerald-500 bg-white"
            : "border-gray-200 bg-gray-50"
      }`}
    >
      {/* Decorative top bar */}
      <div
        className={`h-1.5 ${
          isCalled ? "bg-blue-500" : isActive ? "bg-emerald-500" : "bg-gray-300"
        }`}
      />

      <div className="p-5 text-center">
        {/* Ticket number */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Tu turno
        </p>
        <p
          className={`text-5xl font-black tracking-tight ${
            isCalled ? "text-blue-600" : isActive ? "text-emerald-600" : "text-gray-400"
          }`}
        >
          {entry.ticket_number}
        </p>

        {/* Status badge */}
        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}
          >
            {isCalled && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
            )}
            {statusConfig.label}
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
          {statusConfig.description}
        </p>

        {/* Position and wait time */}
        {isActive && !isCalled && (
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Posicion</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                #{entry.position}
              </p>
              <p className="text-[10px] text-gray-400">
                {entry.total_ahead} persona{entry.total_ahead !== 1 ? "s" : ""} antes
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Espera est.</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatWaitTime(entry.estimated_wait_minutes)}
              </p>
              <p className="text-[10px] text-gray-400">aproximado</p>
            </div>
          </div>
        )}

        {/* Doctor / Clinic info */}
        <div className="mt-4 space-y-1.5">
          {entry.doctor_name && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Dr. {entry.doctor_name}</span>
            </div>
          )}
          {entry.specialty && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <span>{entry.specialty}</span>
            </div>
          )}
          {entry.clinic_name && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <Building2 className="h-3.5 w-3.5" />
              <span>{entry.clinic_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
