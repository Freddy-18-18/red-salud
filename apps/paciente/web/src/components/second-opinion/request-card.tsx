"use client";

import {
  CheckCircle2,
  Search,
  Clock,
  XCircle,
  FileCheck,
  ArrowRight,
} from "lucide-react";

import type { SecondOpinionRequest, SecondOpinionStatus } from "@/lib/services/second-opinion-service";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const STATUS_CONFIG: Record<
  SecondOpinionStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    color: string;
    bgColor: string;
  }
> = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
  accepted: {
    label: "Aceptada",
    icon: FileCheck,
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  in_review: {
    label: "En revision",
    icon: Search,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 border-indigo-200",
  },
  completed: {
    label: "Completada",
    icon: CheckCircle2,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  declined: {
    label: "Rechazada",
    icon: XCircle,
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
  },
};

interface RequestCardProps {
  request: SecondOpinionRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const statusConfig = STATUS_CONFIG[request.status];
  const StatusIcon = statusConfig.icon;

  const reviewerName =
    request.reviewing_doctor?.full_name || "Pendiente de asignacion";
  const specialtyName = request.specialty?.name || "Especialidad";

  const reviewerInitials = request.reviewing_doctor?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <a
      href={`/dashboard/segunda-opinion/${request.id}`}
      className="block p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {request.reviewing_doctor?.avatar_url ? (
            <img
              src={request.reviewing_doctor.avatar_url}
              alt={reviewerName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <span className="text-sm font-semibold text-emerald-600">
                {reviewerInitials}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {request.status === "pending" && !request.reviewing_doctor
                  ? "Esperando especialista"
                  : `Dr. ${reviewerName}`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{specialtyName}</p>
            </div>

            {/* Status badge */}
            <span
              className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
          </div>

          {/* Diagnosis preview */}
          <p className="text-sm text-gray-600 mt-2 line-clamp-1">
            {request.original_diagnosis}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {formatDate(request.created_at)}
            </span>

            {request.status === "completed" && request.agrees_with_original !== null && (
              <span
                className={`text-xs font-medium ${
                  request.agrees_with_original
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {request.agrees_with_original
                  ? "Coincide con diagnostico original"
                  : "Diagnostico diferente"}
              </span>
            )}

            {request.status !== "completed" && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Ver detalle <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
