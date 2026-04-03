"use client";

import {
  Calendar,
  Pill,
  HeartPulse,
  Flame,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { HealthScoreBreakdown } from "@/lib/services/health-score-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface CategoryBreakdownProps {
  breakdown: HealthScoreBreakdown;
}

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */

interface CategoryConfig {
  key: keyof Omit<HealthScoreBreakdown, "total" | "level">;
  label: string;
  icon: LucideIcon;
}

const CATEGORIES: CategoryConfig[] = [
  { key: "appointments", label: "Citas Médicas", icon: Calendar },
  { key: "medications", label: "Medicación", icon: Pill },
  { key: "vitals", label: "Signos Vitales", icon: HeartPulse },
  { key: "activity", label: "Actividad", icon: Flame },
  { key: "profile", label: "Perfil Completo", icon: UserCheck },
];

function barColor(score: number): string {
  if (score >= 16) return "bg-emerald-500";
  if (score >= 12) return "bg-yellow-500";
  if (score >= 8) return "bg-orange-500";
  return "bg-red-500";
}

function textColor(score: number): string {
  if (score >= 16) return "text-emerald-600";
  if (score >= 12) return "text-yellow-600";
  if (score >= 8) return "text-orange-600";
  return "text-red-600";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Desglose por Categoría
      </h3>
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const score = breakdown[cat.key];
          const percent = (score / 20) * 100;
          const Icon = cat.icon;

          return (
            <div key={cat.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {cat.label}
                  </span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${textColor(score)}`}>
                  {score}/20
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor(score)}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
