"use client";

import {
  Pill,
  FlaskConical,
  UserPlus,
  CalendarClock,
  FileHeart,
  ArrowRight,
  CheckCircle2,
  Eye,
  type LucideIcon,
} from "lucide-react";
import type {
  PostConsultationAction,
  ActionType,
  PrescriptionActionData,
  LabOrderActionData,
  ReferralActionData,
  FollowUpActionData,
  CareInstructionsActionData,
} from "@/lib/services/post-consultation-service";

interface ActionCardProps {
  action: PostConsultationAction;
  onNavigate?: (action: PostConsultationAction) => void;
  onMarkViewed?: (actionId: string) => void;
  onMarkCompleted?: (actionId: string) => void;
}

interface ActionConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  iconColor: string;
  borderColor: string;
}

const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
  prescription: {
    icon: Pill,
    label: "Receta medica",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100",
  },
  lab_order: {
    icon: FlaskConical,
    label: "Orden de laboratorio",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100",
  },
  referral: {
    icon: UserPlus,
    label: "Referencia medica",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-100",
  },
  follow_up: {
    icon: CalendarClock,
    label: "Proxima cita",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-100",
  },
  care_instructions: {
    icon: FileHeart,
    label: "Instrucciones de cuidado",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    borderColor: "border-rose-100",
  },
};

function getPrescriptionSummary(data: PrescriptionActionData): string {
  const meds = data.medications || [];
  if (meds.length === 0) return "Sin medicamentos";
  const names = meds.slice(0, 2).map((m) => m.name);
  const suffix = meds.length > 2 ? `... +${meds.length - 2} mas` : "";
  return `${names.join(", ")}${suffix}`;
}

function getLabOrderSummary(data: LabOrderActionData): string {
  const tests = data.tests || [];
  if (tests.length === 0) return "Sin examenes";
  const names = tests.slice(0, 2).map((t) => t.name);
  const suffix = tests.length > 2 ? `... +${tests.length - 2} mas` : "";
  return `${names.join(", ")}${suffix}`;
}

function getReferralSummary(data: ReferralActionData): string {
  return `${data.specialty}${data.doctor_name ? ` — ${data.doctor_name}` : ""}`;
}

function getFollowUpSummary(data: FollowUpActionData): string {
  return `Sugerida en ${data.suggested_days} dias`;
}

function getCareInstructionsSummary(data: CareInstructionsActionData): string {
  const text = data.instructions || "";
  return text.length > 80 ? `${text.slice(0, 80)}...` : text;
}

function getActionSummary(action: PostConsultationAction): string {
  const data = action.action_data;
  switch (action.action_type) {
    case "prescription":
      return getPrescriptionSummary(data as PrescriptionActionData);
    case "lab_order":
      return getLabOrderSummary(data as LabOrderActionData);
    case "referral":
      return getReferralSummary(data as ReferralActionData);
    case "follow_up":
      return getFollowUpSummary(data as FollowUpActionData);
    case "care_instructions":
      return getCareInstructionsSummary(data as CareInstructionsActionData);
    default:
      return "";
  }
}

function getActionCount(action: PostConsultationAction): string | null {
  const data = action.action_data;
  switch (action.action_type) {
    case "prescription": {
      const count = (data as PrescriptionActionData).medications?.length || 0;
      return `${count} medicamento${count !== 1 ? "s" : ""}`;
    }
    case "lab_order": {
      const count = (data as LabOrderActionData).tests?.length || 0;
      return `${count} examen${count !== 1 ? "es" : ""}`;
    }
    default:
      return null;
  }
}

function getActionCTA(actionType: ActionType): string {
  switch (actionType) {
    case "prescription":
      return "Comparar precios en farmacias";
    case "lab_order":
      return "Buscar laboratorio";
    case "referral":
      return "Ver especialistas";
    case "follow_up":
      return "Agendar ahora";
    case "care_instructions":
      return "Ver completo";
    default:
      return "Ver detalles";
  }
}

export function ActionCard({
  action,
  onNavigate,
  onMarkViewed,
  onMarkCompleted,
}: ActionCardProps) {
  const config = ACTION_CONFIG[action.action_type];
  const Icon = config.icon;
  const summary = getActionSummary(action);
  const count = getActionCount(action);
  const cta = getActionCTA(action.action_type);

  const isCompleted = action.status === "completed";
  const isPending = action.status === "pending";

  const handleClick = () => {
    if (isPending && onMarkViewed) {
      onMarkViewed(action.id);
    }
    if (onNavigate) {
      onNavigate(action);
    }
  };

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md ${
        isCompleted ? "opacity-60 border-gray-100" : config.borderColor
      }`}
    >
      <button
        onClick={handleClick}
        className="w-full p-4 text-left"
        disabled={isCompleted}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}
          >
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-gray-900">
                {config.label}
              </h3>
              {count && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${config.color} ${config.iconColor} font-medium`}
                >
                  {count}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 truncate">{summary}</p>

            {/* CTA */}
            {!isCompleted && (
              <div
                className={`flex items-center gap-1 mt-2 text-xs font-medium ${config.iconColor}`}
              >
                {cta}
                <ArrowRight className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isPending && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {action.status === "viewed" && (
              <Eye className="h-4 w-4 text-gray-300" />
            )}
            {isCompleted && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            )}
          </div>
        </div>
      </button>

      {/* Mark completed button */}
      {!isCompleted && action.status !== "pending" && onMarkCompleted && (
        <div className="px-4 pb-3">
          <button
            onClick={() => onMarkCompleted(action.id)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Marcar como completado
          </button>
        </div>
      )}
    </div>
  );
}
