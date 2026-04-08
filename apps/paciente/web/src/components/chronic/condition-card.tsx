"use client";

import {
  Droplets,
  Heart,
  Wind,
  Thermometer,
  Bone,
  Zap,
  Activity,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import {
  type ChronicCondition,
  type ChronicReading,
  getConditionColor,
  formatReadingValue,
  computeTrend,
} from "@/lib/services/chronic-service";

/* ------------------------------------------------------------------ */
/*  Icon mapping                                                       */
/* ------------------------------------------------------------------ */

const CONDITION_ICONS: Record<string, LucideIcon> = {
  diabetes_tipo_1: Droplets,
  diabetes_tipo_2: Droplets,
  hipertension: Heart,
  asma: Wind,
  hipotiroidismo: Thermometer,
  hipertiroidismo: Thermometer,
  epoc: Wind,
  artritis: Bone,
  epilepsia: Zap,
  insuficiencia_renal: Activity,
  otro: PlusCircle,
};

const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  leve: { label: "Leve", color: "bg-green-100 text-green-700" },
  moderado: { label: "Moderado", color: "bg-amber-100 text-amber-700" },
  severo: { label: "Severo", color: "bg-red-100 text-red-700" },
};

const TREND_ICONS: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  up: { icon: TrendingUp, color: "text-red-500", label: "Subiendo" },
  down: { icon: TrendingDown, color: "text-blue-500", label: "Bajando" },
  stable: { icon: Minus, color: "text-green-500", label: "Estable" },
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ConditionCardProps {
  condition: ChronicCondition;
  latestReadings?: ChronicReading[];
  selected?: boolean;
  onSelect: (id: string) => void;
  onLogReading: (conditionId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConditionCard({
  condition,
  latestReadings = [],
  selected = false,
  onSelect,
  onLogReading,
}: ConditionCardProps) {
  const colors = getConditionColor(condition.condition_type);
  const Icon = CONDITION_ICONS[condition.condition_type] ?? PlusCircle;
  const severity = SEVERITY_LABELS[condition.severity] ?? SEVERITY_LABELS.leve;
  const trend = computeTrend(latestReadings);
  const latestReading = latestReadings.length > 0 ? latestReadings[latestReadings.length - 1] : null;

  const diagnosedDate = new Date(condition.diagnosed_date).toLocaleDateString(
    "es-VE",
    { month: "short", year: "numeric" },
  );

  return (
    <div
      className={`group relative rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer ${
        selected
          ? `${colors.bg} ${colors.border} shadow-md`
          : `bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm`
      }`}
      onClick={() => onSelect(condition.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(condition.id);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${colors.bg}`}
        >
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 truncate text-base">
              {condition.condition_label}
            </h3>
            <ChevronRight
              className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                selected ? "rotate-90" : ""
              }`}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${severity.color}`}
            >
              {severity.label}
            </span>
            <span className="text-xs text-gray-400">
              Dx: {diagnosedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Latest reading */}
      <div className="mt-3 flex items-center justify-between">
        {latestReading ? (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatReadingValue(latestReading)}
            </span>
            {trend && TREND_ICONS[trend] && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${TREND_ICONS[trend].color}`}
                title={TREND_ICONS[trend].label}
              >
                {(() => {
                  const TrendIcon = TREND_ICONS[trend].icon;
                  return <TrendIcon className="h-3.5 w-3.5" />;
                })()}
                {TREND_ICONS[trend].label}
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400 italic">
            Sin lecturas aun
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLogReading(condition.id);
          }}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors min-h-[36px] min-w-[36px] justify-center"
        >
          Registrar
        </button>
      </div>

      {/* Doctor */}
      {condition.treating_doctor && (
        <div className="mt-2 text-xs text-gray-500">
          Dr. {condition.treating_doctor.full_name}
        </div>
      )}
    </div>
  );
}
