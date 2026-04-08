"use client";

import {
  CheckCircle2,
  Circle,
  Calendar,
  FlaskConical,
  Pill,
  CalendarPlus,
  ClipboardCheck,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import type { FollowUpItem } from "@/lib/services/rating-service";

interface FollowUpChecklistProps {
  items: FollowUpItem[];
  onComplete: (id: string, notes?: string) => Promise<{ success: boolean }>;
  onScheduleNext?: (doctorId: string) => void;
}

const TYPE_CONFIG: Record<
  string,
  { icon: LucideIcon; label: string; color: string; iconColor: string }
> = {
  lab_order: {
    icon: FlaskConical,
    label: "Examenes de laboratorio",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  prescription: {
    icon: Pill,
    label: "Receta medica",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  next_appointment: {
    icon: CalendarPlus,
    label: "Proximo control",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  custom: {
    icon: ClipboardCheck,
    label: "Indicacion",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
};

function getDoctorName(item: FollowUpItem): string {
  const profile = item.appointment?.doctor?.profile;
  if (!profile) return "Medico";
  return `${profile.first_name} ${profile.last_name}`;
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return `Vencido hace ${absDays} dia${absDays > 1 ? "s" : ""}`;
    }
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Manana";
    if (diffDays < 7) return `En ${diffDays} dias`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `En ${weeks} semana${weeks > 1 ? "s" : ""}`;
    }

    return date.toLocaleDateString("es-VE", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function FollowUpItemRow({
  item,
  onComplete,
  onScheduleNext,
}: {
  item: FollowUpItem;
  onComplete: (id: string, notes?: string) => Promise<{ success: boolean }>;
  onScheduleNext?: (doctorId: string) => void;
}) {
  const [completing, setCompleting] = useState(false);
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.custom;
  const Icon = config.icon;
  const overdue = isOverdue(item.due_date);

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(item.id);
    setCompleting(false);
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 bg-white border rounded-xl transition-all ${
        item.completed
          ? "border-gray-100 opacity-60"
          : overdue
            ? "border-red-200 bg-red-50/30"
            : "border-gray-100 hover:shadow-sm"
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={item.completed || completing}
        className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-300 rounded-full disabled:cursor-default"
        aria-label={item.completed ? "Completado" : "Marcar como completado"}
      >
        {completing ? (
          <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
        ) : item.completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-gray-300 hover:text-emerald-400 transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center ${config.color}`}
          >
            <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
          </div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {config.label}
          </span>
        </div>

        <p
          className={`text-sm font-medium ${
            item.completed ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {item.description}
        </p>

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Due date */}
          {item.due_date && (
            <div
              className={`flex items-center gap-1 text-xs ${
                overdue && !item.completed
                  ? "text-red-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {formatDueDate(item.due_date)}
            </div>
          )}

          {/* Suggested weeks */}
          {item.type === "next_appointment" && item.suggested_weeks && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Control en {item.suggested_weeks} semana
              {item.suggested_weeks > 1 ? "s" : ""}
            </span>
          )}

          {/* Doctor name */}
          <span className="text-xs text-gray-400">
            Dr. {getDoctorName(item)}
          </span>
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
            {item.notes}
          </p>
        )}

        {/* Schedule CTA for next_appointment type */}
        {item.type === "next_appointment" &&
          !item.completed &&
          onScheduleNext && (
            <button
              type="button"
              onClick={() => onScheduleNext(item.doctor_id)}
              className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Agendar siguiente cita
            </button>
          )}
      </div>
    </div>
  );
}

export function FollowUpChecklist({
  items,
  onComplete,
  onScheduleNext,
}: FollowUpChecklistProps) {
  const pendingItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);

  // --- All done state ---
  if (items.length > 0 && pendingItems.length === 0) {
    return (
      <div className="p-8 bg-white border border-gray-100 rounded-xl text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Todo al dia!
        </h3>
        <p className="text-sm text-gray-500">
          Completaste todas las indicaciones de tus consultas
        </p>
        <div className="mt-4">
          <a
            href="/dashboard/agendar"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
          >
            <CalendarPlus className="h-4 w-4" />
            Agendar nueva cita
          </a>
        </div>
      </div>
    );
  }

  // --- Empty state ---
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Pending items */}
      {pendingItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Pendientes ({pendingItems.length})
            </h3>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-4 max-w-[120px]">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    items.length > 0
                      ? (completedItems.length / items.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {pendingItems.map((item) => (
            <FollowUpItemRow
              key={item.id}
              item={item}
              onComplete={onComplete}
              onScheduleNext={onScheduleNext}
            />
          ))}
        </div>
      )}

      {/* Completed items (collapsed) */}
      {completedItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">
            Completados ({completedItems.length})
          </h3>
          {completedItems.map((item) => (
            <FollowUpItemRow
              key={item.id}
              item={item}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
