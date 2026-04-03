"use client";

import {
  Award,
  BellRing,
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  HeartPulse,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTubeDiagonal,
  TrendingUp,
  UserCheck,
  UserCog,
  UserX,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useHealthInsights } from "@/hooks/use-health-insights";
import type { HealthInsight } from "@/lib/services/health-insights-service";

// ─── Icon Registry ───────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  BellRing,
  CalendarClock,
  CalendarX2,
  HeartPulse,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  TestTubeDiagonal,
  TrendingUp,
  UserCheck,
  UserCog,
  UserX,
};

// ─── Style Map ───────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<
  HealthInsight["type"],
  { border: string; bg: string; icon: string; badge: string }
> = {
  warning: {
    border: "border-l-amber-400",
    bg: "bg-amber-50/50",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  positive: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-50/50",
    icon: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  reminder: {
    border: "border-l-blue-400",
    bg: "bg-blue-50/50",
    icon: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  tip: {
    border: "border-l-purple-400",
    bg: "bg-purple-50/50",
    icon: "text-purple-500",
    badge: "bg-purple-100 text-purple-700",
  },
};

const TYPE_LABELS: Record<HealthInsight["type"], string> = {
  warning: "Alerta",
  positive: "Logro",
  reminder: "Recordatorio",
  tip: "Consejo",
};

// ─── LocalStorage Dismissed State ────────────────────────────────────────────

const DISMISSED_KEY = "health-insights-dismissed";

function getDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistDismissedIds(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

// ─── Card Component ──────────────────────────────────────────────────────────

function InsightCard({
  insight,
  onDismiss,
}: {
  insight: HealthInsight;
  onDismiss: (id: string) => void;
}) {
  const style = TYPE_STYLES[insight.type];
  const Icon = ICON_MAP[insight.icon] ?? Sparkles;

  return (
    <div
      className={`relative flex flex-col gap-2 p-4 rounded-xl border border-gray-100 border-l-4 ${style.border} ${style.bg} shadow-sm min-w-[260px] max-w-[320px] snap-start shrink-0 md:min-w-0 md:max-w-none`}
    >
      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(insight.id)}
        className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/60 transition"
        aria-label="Descartar"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2.5 pr-6">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.icon} bg-white/80 shrink-0`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {insight.title}
          </h3>
          <span
            className={`inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${style.badge}`}
          >
            {TYPE_LABELS[insight.type]}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
        {insight.description}
      </p>

      {/* Action */}
      {insight.actionLabel && insight.actionHref && (
        <a
          href={insight.actionHref}
          className="mt-auto inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
        >
          {insight.actionLabel}
          <span className="ml-1">&rarr;</span>
        </a>
      )}
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function InsightsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[260px] h-[140px] rounded-xl bg-gray-100 animate-pulse shrink-0"
        />
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function InsightsEmpty() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-emerald-800">
          Todo en orden!
        </p>
        <p className="text-xs text-emerald-600 mt-0.5">
          No tienes alertas pendientes. Sigue asi.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const MAX_VISIBLE = 5;

export function InsightsCards() {
  const { insights, loading } = useHealthInsights();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load dismissed IDs from localStorage on mount
  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistDismissedIds(next);
      return next;
    });
  }, []);

  const visibleInsights = insights
    .filter((insight) => !dismissedIds.has(insight.id))
    .slice(0, MAX_VISIBLE);

  return (
    <div>
      {/* Heading */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-gray-900">
          Insights de Salud
        </h2>
      </div>

      {/* Content */}
      {loading ? (
        <InsightsSkeleton />
      ) : visibleInsights.length === 0 ? (
        <InsightsEmpty />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0">
          {visibleInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
