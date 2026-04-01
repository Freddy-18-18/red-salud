"use client";

import { Flame, Zap } from "lucide-react";

import type { StreakInfo } from "@/lib/services/rewards-service";

interface StreakCounterProps {
  streak: StreakInfo;
}

function getCalendarDays(activityDays: string[]): { date: string; active: boolean }[] {
  const days: { date: string; active: boolean }[] = [];
  const activitySet = new Set(activityDays);
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      active: activitySet.has(dateStr),
    });
  }

  return days;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const calendarDays = getCalendarDays(streak.activityDays);
  const isActiveToday = calendarDays[calendarDays.length - 1]?.active;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      {/* Streak Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              streak.current > 0
                ? "bg-gradient-to-br from-orange-400 to-red-500"
                : "bg-gray-100"
            }`}
          >
            <Flame
              className={`h-6 w-6 ${
                streak.current > 0 ? "text-white" : "text-gray-400"
              }`}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900">
                {streak.current}
              </span>
              <span className="text-sm text-gray-500">
                {streak.current === 1 ? "dia" : "dias"} de racha
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Zap className="h-3 w-3" />
              Mejor racha: {streak.longest} dias
            </div>
          </div>
        </div>

        {!isActiveToday && streak.current > 0 && (
          <div className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg">
            <p className="text-xs font-medium text-orange-600">
              No pierdas tu racha!
            </p>
          </div>
        )}
      </div>

      {/* Heat Map */}
      <div>
        <p className="text-xs text-gray-400 mb-2 font-medium">
          Ultimos 30 dias
        </p>
        <div className="grid grid-cols-10 gap-1">
          {calendarDays.map((day) => (
            <div
              key={day.date}
              title={`${new Date(day.date + "T00:00:00").toLocaleDateString("es-VE", {
                day: "numeric",
                month: "short",
              })} - ${day.active ? "Activo" : "Sin actividad"}`}
              className={`aspect-square rounded-sm transition-colors ${
                day.active
                  ? "bg-emerald-400 hover:bg-emerald-500"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <span className="text-[10px] text-gray-400">Menos</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-100" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
          <span className="text-[10px] text-gray-400">Mas</span>
        </div>
      </div>
    </div>
  );
}
