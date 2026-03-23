"use client";

import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Shield,
  Star,
  MapPin,
  Video,
  Building2,
  Stethoscope,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSecondOpinionDetail } from "@/hooks/use-second-opinion";
import { DiagnosisComparison } from "@/components/second-opinion/diagnosis-comparison";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import type { SecondOpinionStatus } from "@/lib/services/second-opinion-service";

// --- Status Timeline ---

interface TimelineStep {
  key: SecondOpinionStatus;
  label: string;
  description: string;
  icon: typeof Clock;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: "pending",
    label: "Solicitada",
    description: "Solicitud enviada al especialista",
    icon: Clock,
  },
  {
    key: "accepted",
    label: "Aceptada",
    description: "El especialista acepto revisar tu caso",
    icon: FileCheck,
  },
  {
    key: "in_review",
    label: "En revision",
    description: "El especialista esta revisando tu caso",
    icon: Search,
  },
  {
    key: "completed",
    label: "Completada",
    description: "El especialista emitio su opinion",
    icon: CheckCircle2,
  },
];

const STATUS_ORDER: SecondOpinionStatus[] = [
  "pending",
  "accepted",
  "in_review",
  "completed",
];

function StatusTimeline({ currentStatus }: { currentStatus: SecondOpinionStatus }) {
  const isDeclined = currentStatus === "declined";
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  if (isDeclined) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Solicitud rechazada</p>
            <p className="text-sm text-red-600 mt-0.5">
              El especialista no pudo aceptar esta solicitud. Puedes solicitar
              una segunda opinion con otro doctor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = step.key === currentStatus;
        const StepIcon = step.icon;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isCurrent
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                    : isComplete
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isComplete && !isCurrent ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-12 my-1 rounded ${
                    index < currentIndex ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 last:pb-0">
              <h4
                className={`font-semibold text-sm ${
                  isCurrent
                    ? "text-emerald-700"
                    : isComplete
                      ? "text-gray-900"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  isComplete ? "text-gray-500" : "text-gray-300"
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Main Page ---

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function SecondOpinionDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const { request, loading, error } = useSecondOpinionDetail(requestId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard/segunda-opinion"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </a>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalle de solicitud
          </h1>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">
              {error || "No se encontro la solicitud"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const originalDoctorInitials =
    request.original_doctor?.nombre_completo
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "D";

  const reviewerInitials =
    request.reviewing_doctor?.nombre_completo
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a
          href="/dashboard/segunda-opinion"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </a>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Detalle de segunda opinion
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {request.specialty?.name} — Solicitada el{" "}
            {formatDate(request.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original diagnosis card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Diagnostico original
              </h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {request.original_doctor?.avatar_url ? (
                  <img
                    src={request.original_doctor.avatar_url}
                    alt={request.original_doctor.nombre_completo}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {originalDoctorInitials}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Dr. {request.original_doctor?.nombre_completo || "Doctor"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.specialty?.name}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {formatDate(request.created_at)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {request.original_diagnosis}
                </p>
              </div>
            </div>
          </div>

          {/* Patient reason */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              Motivo de la solicitud
            </h3>
            <p className="text-sm text-gray-700">{request.reason}</p>
            {request.patient_notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">
                  Notas adicionales del paciente:
                </p>
                <p className="text-sm text-gray-600">{request.patient_notes}</p>
              </div>
            )}
          </div>

          {/* Diagnosis comparison (only when completed) */}
          {request.status === "completed" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Comparacion de diagnosticos
              </h3>
              <DiagnosisComparison request={request} />
            </div>
          )}

          {/* Consultation type */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              Tipo de consulta
            </h3>
            <div className="flex items-center gap-2">
              {request.consultation_type === "remote" ? (
                <Video className="h-4 w-4 text-emerald-600" />
              ) : (
                <Building2 className="h-4 w-4 text-emerald-600" />
              )}
              <p className="text-sm text-gray-700">
                {request.consultation_type === "remote"
                  ? "Consulta remota"
                  : "Consulta presencial"}
              </p>
            </div>
            {request.fee !== null && (
              <p className="text-sm text-gray-500 mt-2">
                Costo:{" "}
                <span className="font-semibold text-emerald-700">
                  ${request.fee.toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Right column: Sidebar */}
        <div className="space-y-6">
          {/* Status timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">
              Estado de la solicitud
            </h3>
            <StatusTimeline currentStatus={request.status} />
          </div>

          {/* Reviewer info */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Especialista revisor
              </h3>
            </div>
            <div className="p-4">
              {request.reviewing_doctor ? (
                <div className="flex flex-col items-center text-center">
                  {request.reviewing_doctor.avatar_url ? (
                    <img
                      src={request.reviewing_doctor.avatar_url}
                      alt={request.reviewing_doctor.nombre_completo}
                      className="w-16 h-16 rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-indigo-600">
                        {reviewerInitials}
                      </span>
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900">
                    Dr. {request.reviewing_doctor.nombre_completo}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {request.specialty?.name}
                  </p>

                  <div className="flex items-center gap-1 mt-2">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">
                      Verificado
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Esperando que un especialista acepte la solicitud
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {request.status === "completed" && (
            <a
              href="/dashboard/segunda-opinion/solicitar"
              className="block w-full text-center px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              Solicitar otra opinion
            </a>
          )}

          {request.status === "declined" && (
            <a
              href="/dashboard/segunda-opinion/solicitar"
              className="block w-full text-center px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              Solicitar con otro doctor
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
