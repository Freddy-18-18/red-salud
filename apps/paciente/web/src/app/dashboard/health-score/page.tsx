"use client";

import { ArrowLeft, HeartPulse } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { CategoryBreakdown } from "@/components/health-score/category-breakdown";
import { ImprovementTips } from "@/components/health-score/improvement-tips";
import { HealthRadarChart } from "@/components/health-score/radar-chart";
import { ScoreRing } from "@/components/health-score/score-ring";
import { useHealthScore } from "@/hooks/use-health-score";

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded-lg" />
      <div className="flex justify-center">
        <div className="w-[200px] h-[200px] bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-gray-200 rounded-2xl" />
        <div className="h-72 bg-gray-200 rounded-2xl" />
      </div>
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HealthScorePage() {
  const { score, breakdown, history, tips, loading } = useHealthScore();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a
          href="/dashboard"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-emerald-500" />
            Tu Health Score
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Un resumen de tu salud basado en 5 categorias clave
          </p>
        </div>
      </div>

      {/* Score Ring — prominently centered */}
      <div className="flex justify-center py-4">
        <ScoreRing score={score} level={breakdown.level} />
      </div>

      {/* Radar Chart + Category Breakdown side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthRadarChart breakdown={breakdown} />
        <CategoryBreakdown breakdown={breakdown} />
      </div>

      {/* Improvement Tips */}
      <ImprovementTips tips={tips} />

      {/* Score History */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Evolución de tu Score (últimos 30 días)
          </h3>
          <div className="w-full" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  tickFormatter={(val: string) => {
                    const d = new Date(val);
                    return d.toLocaleDateString("es-VE", {
                      day: "numeric",
                      month: "short",
                    });
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 13,
                  }}
                  labelFormatter={((val: unknown) =>
                    new Date(String(val)).toLocaleDateString("es-VE", {
                      day: "numeric",
                      month: "long",
                    })) as never}
                  formatter={((value: unknown) => [`${Number(value)} pts`, "Score"]) as never}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
