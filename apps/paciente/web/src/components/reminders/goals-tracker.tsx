"use client";

import { useState } from "react";
import {
  Target,
  ChevronDown,
  ChevronUp,
  Plus,
  Trophy,
  Calendar,
} from "lucide-react";
import type { HealthGoal, CreateHealthGoal } from "@/lib/services/reminders-service";

interface GoalsTrackerProps {
  goals: HealthGoal[];
  loading: boolean;
  onAddGoal: (data: CreateHealthGoal) => Promise<unknown>;
  onUpdateProgress: (goalId: string, value: number) => Promise<unknown>;
  onCompleteGoal: (goalId: string) => Promise<unknown>;
}

export function GoalsTracker({
  goals,
  loading,
  onAddGoal,
  onUpdateProgress,
  onCompleteGoal,
}: GoalsTrackerProps) {
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState("");

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const handleUpdateProgress = async (goalId: string) => {
    const value = parseFloat(progressInput);
    if (isNaN(value)) return;
    await onUpdateProgress(goalId, value);
    setUpdatingGoal(null);
    setProgressInput("");
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-20" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Target className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">
              Metas de salud
            </h3>
            <p className="text-xs text-gray-500">
              {activeGoals.length} activa{activeGoals.length !== 1 ? "s" : ""}
              {completedGoals.length > 0 &&
                ` - ${completedGoals.length} completada${completedGoals.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Active goals */}
          {activeGoals.length === 0 && !showForm ? (
            <div className="text-center py-6">
              <Target className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No tienes metas activas
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-2 text-sm text-emerald-600 font-medium hover:text-emerald-700"
              >
                Crear mi primera meta
              </button>
            </div>
          ) : (
            <>
              {activeGoals.map((goal) => {
                const progress =
                  goal.target_value && goal.target_value > 0
                    ? Math.min(
                        Math.round(
                          ((goal.current_value || 0) / goal.target_value) * 100,
                        ),
                        100,
                      )
                    : 0;
                const isUpdating = updatingGoal === goal.id;

                return (
                  <div
                    key={goal.id}
                    className="p-3 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 flex-1">
                        {goal.description}
                      </p>
                      {goal.target_date && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0 ml-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(goal.target_date).toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    {goal.target_value ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                progress >= 100
                                  ? "bg-emerald-500"
                                  : progress >= 50
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 min-w-[3rem] text-right">
                            {progress}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {goal.current_value || 0}
                          {goal.unit ? ` ${goal.unit}` : ""} de{" "}
                          {goal.target_value}
                          {goal.unit ? ` ${goal.unit}` : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">
                        {goal.notes || "Sin meta numerica definida"}
                      </p>
                    )}

                    {/* Actions */}
                    {isUpdating ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          autoFocus
                          placeholder={`Progreso actual${goal.unit ? ` (${goal.unit})` : ""}`}
                          value={progressInput}
                          onChange={(e) => setProgressInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleUpdateProgress(goal.id);
                            if (e.key === "Escape") setUpdatingGoal(null);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateProgress(goal.id)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUpdatingGoal(goal.id);
                            setProgressInput(
                              String(goal.current_value || ""),
                            );
                          }}
                          className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
                        >
                          Actualizar progreso
                        </button>
                        {progress >= 100 && (
                          <button
                            type="button"
                            onClick={() => onCompleteGoal(goal.id)}
                            className="flex items-center gap-1 text-xs text-amber-600 font-medium hover:text-amber-700"
                          >
                            <Trophy className="h-3 w-3" />
                            Completar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Completed goals (collapsed) */}
          {completedGoals.length > 0 && (
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Metas completadas
              </p>
              {completedGoals.slice(0, 2).map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-2 py-1.5 text-xs text-gray-500"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-2.5 w-2.5 text-emerald-600" />
                  </span>
                  <span className="line-through">{goal.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add goal form */}
          {showForm ? (
            <AddGoalForm
              onSubmit={async (data) => {
                await onAddGoal(data);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva meta
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Goal Form ───────────────────────────────────────────────────────────

interface AddGoalFormProps {
  onSubmit: (data: CreateHealthGoal) => Promise<unknown>;
  onCancel: () => void;
}

function AddGoalForm({ onSubmit, onCancel }: AddGoalFormProps) {
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);

    await onSubmit({
      description: description.trim(),
      target_value: targetValue ? parseFloat(targetValue) : undefined,
      current_value: 0,
      unit: unit || undefined,
      starts_at: new Date().toISOString().split("T")[0],
      target_date: targetDate || undefined,
    });

    setSubmitting(false);
  };

  return (
    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-3">
      <p className="text-sm font-medium text-gray-900">Nueva meta</p>

      <input
        type="text"
        autoFocus
        placeholder="Descripcion (ej: Bajar 5kg)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
      />

      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          step="any"
          placeholder="Meta"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        />
        <input
          type="text"
          placeholder="Unidad"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        />
        <input
          type="date"
          placeholder="Fecha limite"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={submitting || !description.trim()}
          onClick={handleSubmit}
          className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {submitting ? "Creando..." : "Crear meta"}
        </button>
      </div>
    </div>
  );
}
