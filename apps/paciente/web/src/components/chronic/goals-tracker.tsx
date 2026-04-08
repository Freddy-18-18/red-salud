"use client";

import { Target, CheckCircle2, Clock } from "lucide-react";

import { type ChronicGoal } from "@/lib/services/chronic-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface GoalsTrackerProps {
  goals: ChronicGoal[];
  loading?: boolean;
  onCompleteGoal?: (goalId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function computeProgress(goal: ChronicGoal): number {
  if (goal.is_completed) return 100;
  if (goal.target_value === 0) return 0;
  const raw = (goal.current_value / goal.target_value) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function daysUntilDeadline(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getProgressColor(percent: number): string {
  if (percent >= 75) return "bg-emerald-500";
  if (percent >= 50) return "bg-amber-500";
  if (percent >= 25) return "bg-orange-500";
  return "bg-red-500";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GoalsTracker({
  goals,
  loading = false,
  onCompleteGoal,
}: GoalsTrackerProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="py-8 text-center">
        <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          No tenes metas activas. Crea una meta para mantener tu motivacion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) => {
        const progress = computeProgress(goal);
        const days = daysUntilDeadline(goal.target_date);
        const isOverdue = days < 0 && !goal.is_completed;
        const progressColor = goal.is_completed
          ? "bg-emerald-500"
          : getProgressColor(progress);

        return (
          <div
            key={goal.id}
            className={`p-4 rounded-xl border transition-colors ${
              goal.is_completed
                ? "bg-emerald-50 border-emerald-200"
                : isOverdue
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {goal.is_completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Target className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                  <p
                    className={`text-sm font-medium truncate ${
                      goal.is_completed
                        ? "text-emerald-700 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {goal.description}
                  </p>
                </div>

                {goal.condition && (
                  <p className="text-xs text-gray-400 mt-0.5 ml-6">
                    {goal.condition.condition_label}
                  </p>
                )}
              </div>

              {/* Progress percentage */}
              <span
                className={`text-sm font-bold shrink-0 ${
                  goal.is_completed ? "text-emerald-600" : "text-gray-900"
                }`}
              >
                {progress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {goal.current_value} / {goal.target_value}{" "}
                {goal.metric_type === "weight" ? "kg" : ""}
              </span>

              <div className="flex items-center gap-3">
                {!goal.is_completed && (
                  <span
                    className={`flex items-center gap-1 ${
                      isOverdue ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {isOverdue
                      ? `${Math.abs(days)} dias vencida`
                      : `${days} dia${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`}
                  </span>
                )}

                {!goal.is_completed && onCompleteGoal && progress >= 100 && (
                  <button
                    type="button"
                    onClick={() => onCompleteGoal(goal.id)}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Completar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
