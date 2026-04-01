"use client";

import { CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

import { ActionCard } from "./action-card";

import type {
  PostConsultationAction,
  PostConsultationSummary,
  PrescriptionActionData,
} from "@/lib/services/post-consultation-service";

interface ActionsListProps {
  summaries: PostConsultationSummary[];
  onMarkViewed: (actionId: string) => void;
  onMarkCompleted: (actionId: string) => void;
}

function formatConsultationDate(date: string, time: string): string {
  try {
    const dt = new Date(`${date}T${time}`);
    const now = new Date();
    const diffMs = now.getTime() - dt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Hace un momento";
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} dias`;

    return dt.toLocaleDateString("es-VE", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function formatTime(time: string): string {
  try {
    return time.slice(0, 5);
  } catch {
    return time;
  }
}

export function ActionsList({
  summaries,
  onMarkViewed,
  onMarkCompleted,
}: ActionsListProps) {
  const router = useRouter();

  const handleNavigate = (action: PostConsultationAction) => {
    switch (action.action_type) {
      case "prescription": {
        const data = action.action_data as PrescriptionActionData;
        router.push(
          `/dashboard/farmacias?prescription_id=${data.prescription_id}`
        );
        break;
      }
      case "lab_order":
        router.push("/dashboard/buscar-medico?specialty=laboratorio");
        break;
      case "referral":
        router.push("/dashboard/buscar-medico");
        break;
      case "follow_up":
        router.push(`/dashboard/agendar?doctor_id=${action.doctor_id}`);
        break;
      case "care_instructions":
        // Expand in-place (handled by parent if needed)
        break;
    }
  };

  if (summaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {summaries.map((summary) => {
        const pendingCount = summary.actions.filter(
          (a) => a.status !== "completed"
        ).length;
        const totalCount = summary.actions.length;
        const allCompleted = pendingCount === 0;

        return (
          <div key={summary.appointment_id} className="space-y-4">
            {/* Consultation header */}
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  allCompleted ? "bg-emerald-100" : "bg-emerald-50"
                }`}
              >
                {allCompleted ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <span className="text-sm font-bold text-emerald-600">
                    {summary.doctor_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-semibold text-gray-900">
                    {allCompleted
                      ? "Consulta completada"
                      : "Tu consulta ha sido completada"}
                  </h2>
                  {!allCompleted && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                  <span>Dr. {summary.doctor_name}</span>
                  {summary.specialty && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{summary.specialty}</span>
                    </>
                  )}
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatConsultationDate(summary.date, summary.time)}{" "}
                    {formatTime(summary.time)}
                  </div>
                </div>

                {/* Progress indicator */}
                {!allCompleted && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            ((totalCount - pendingCount) / totalCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {totalCount - pendingCount}/{totalCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action cards */}
            <div className="space-y-3 ml-0 lg:ml-13">
              {summary.actions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onNavigate={handleNavigate}
                  onMarkViewed={onMarkViewed}
                  onMarkCompleted={onMarkCompleted}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
