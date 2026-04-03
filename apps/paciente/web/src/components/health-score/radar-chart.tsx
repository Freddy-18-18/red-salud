"use client";

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

import type { HealthScoreBreakdown } from "@/lib/services/health-score-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface HealthRadarChartProps {
  breakdown: HealthScoreBreakdown;
}

/* ------------------------------------------------------------------ */
/*  Data mapping                                                       */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<string, string> = {
  appointments: "Citas",
  medications: "Medicación",
  vitals: "Signos Vitales",
  activity: "Actividad",
  profile: "Perfil",
};

function buildRadarData(breakdown: HealthScoreBreakdown) {
  return [
    { category: CATEGORY_LABELS.appointments, value: breakdown.appointments, max: 20 },
    { category: CATEGORY_LABELS.medications, value: breakdown.medications, max: 20 },
    { category: CATEGORY_LABELS.vitals, value: breakdown.vitals, max: 20 },
    { category: CATEGORY_LABELS.activity, value: breakdown.activity, max: 20 },
    { category: CATEGORY_LABELS.profile, value: breakdown.profile, max: 20 },
  ];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HealthRadarChart({ breakdown }: HealthRadarChartProps) {
  const data = buildRadarData(breakdown);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Distribución por Categoría
      </h3>
      <div className="w-full" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
