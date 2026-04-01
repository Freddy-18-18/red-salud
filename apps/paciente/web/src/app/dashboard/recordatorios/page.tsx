"use client";

import { Bell, ArrowLeft } from "lucide-react";
import { useState } from "react";

import { AddMedicationForm } from "@/components/reminders/add-medication-form";
import { AppointmentsPreview } from "@/components/reminders/appointments-preview";
import { GoalsTracker } from "@/components/reminders/goals-tracker";
import {
  HealthMetricLogger,
  MetricTrendChart,
} from "@/components/reminders/health-metric-logger";
import { MedicationTracker } from "@/components/reminders/medication-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import { useRemindersDashboard } from "@/hooks/use-reminders";
import { getHealthMetrics } from "@/lib/services/reminders-service";
import type { HealthMetric, HealthMetricType } from "@/lib/services/reminders-service";

function getTodayHeader(): string {
  const now = new Date();
  return now.toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function RecordatoriosPage() {
  const {
    userId,
    initialLoading,
    medications,
    metrics,
    goals,
    appointments,
  } = useRemindersDashboard();

  const [showAddMedication, setShowAddMedication] = useState(false);
  const [trendChart, setTrendChart] = useState<{
    metrics: HealthMetric[];
    metricType: HealthMetricType;
  } | null>(null);

  const handleViewHistory = async (metricTypeId: string) => {
    if (!userId) return;

    const result = await getHealthMetrics(userId, metricTypeId, 30);
    const metricType = metrics.metricTypes.find((mt) => mt.id === metricTypeId);

    if (result.success && metricType) {
      setTrendChart({
        metrics: result.data,
        metricType,
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-64" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const todayHeader = getTodayHeader();

  return (
    <div className="space-y-4 pb-4">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <a
          href="/dashboard"
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Recordatorios
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">
            {todayHeader}
          </p>
        </div>
      </div>

      {/* Today Summary */}
      <div className="grid grid-cols-4 gap-2">
        {(() => {
          const entries = medications.entries;
          const taken = entries.filter((e) => e.status === "taken").length;
          const pending = entries.filter((e) => e.status === "pending").length;
          const missed = entries.filter((e) => e.status === "missed").length;

          return (
            <>
              <div className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">
                  {entries.length}
                </p>
                <p className="text-[10px] text-gray-500">Total</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{taken}</p>
                <p className="text-[10px] text-emerald-600">Tomadas</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-600">{pending}</p>
                <p className="text-[10px] text-blue-600">Pendientes</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-red-600">{missed}</p>
                <p className="text-[10px] text-red-600">Perdidas</p>
              </div>
            </>
          );
        })()}
      </div>

      {/* Medication Tracker */}
      <MedicationTracker
        entries={medications.entries}
        adherence={medications.adherence}
        streak={medications.streak}
        loading={medications.loading}
        onMarkTaken={medications.markAsTaken}
        onAddNew={() => setShowAddMedication(true)}
      />

      {/* Appointments Preview */}
      <AppointmentsPreview
        appointments={appointments.appointments}
        loading={appointments.loading}
      />

      {/* Health Metrics Logger */}
      <HealthMetricLogger
        latestMetrics={metrics.latestMetrics}
        loading={metrics.loading}
        onLogMetric={metrics.log}
        onViewHistory={handleViewHistory}
      />

      {/* Goals Tracker */}
      <GoalsTracker
        goals={goals.goals}
        loading={goals.loading}
        onAddGoal={goals.add}
        onUpdateProgress={goals.updateProgress}
        onCompleteGoal={goals.complete}
      />

      {/* Add Medication Modal */}
      {showAddMedication && userId && (
        <AddMedicationForm
          onSubmit={async (data) => {
            const { addMedicationReminder } = await import(
              "@/lib/services/reminders-service"
            );
            const result = await addMedicationReminder(userId, data);
            if (result.success) {
              await medications.refresh();
              setShowAddMedication(false);
            }
          }}
          onClose={() => setShowAddMedication(false)}
        />
      )}

      {/* Trend Chart Modal */}
      {trendChart && (
        <MetricTrendChart
          metrics={trendChart.metrics}
          metricType={trendChart.metricType}
          onClose={() => setTrendChart(null)}
        />
      )}
    </div>
  );
}
