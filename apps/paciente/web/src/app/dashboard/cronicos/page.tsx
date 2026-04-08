"use client";

import { useState, useCallback, useMemo } from "react";
import {
  HeartPulse,
  Plus,
  Activity,
} from "lucide-react";

import { ConditionCard } from "@/components/chronic/condition-card";
import { ReadingForm } from "@/components/chronic/reading-form";
import { TrendChart } from "@/components/chronic/trend-chart";
import { GoalsTracker } from "@/components/chronic/goals-tracker";
import { AlertsPanel, CriticalAlertBanner } from "@/components/chronic/alerts-panel";
import { AddConditionDialog } from "@/components/chronic/add-condition-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";

import {
  useChronicConditions,
  useAddCondition,
  useConditionDetail,
  useChronicReadings,
  useLogReading,
  useChronicGoals,
  useUpdateGoal,
  useChronicAlerts,
} from "@/hooks/use-chronic";

import {
  type ConditionType,
  type LogReadingData,
  type AddConditionData,
  getConditionOption,
} from "@/lib/services/chronic-service";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type Period = "7d" | "30d" | "90d" | "6m" | "1y";

export default function CronicosPage() {
  // --- State ---
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const [readingConditionId, setReadingConditionId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<Period>("30d");

  // --- Data hooks ---
  const { conditions, loading: conditionsLoading } = useChronicConditions();
  const { addCondition, adding } = useAddCondition();
  const { alerts, loading: alertsLoading } = useChronicAlerts();
  const { goals, loading: goalsLoading } = useChronicGoals();
  const { updateGoal } = useUpdateGoal();
  const { logReading: logReadingMutation, logging } = useLogReading();

  // Selected condition detail
  const selectedCondition = useMemo(
    () => conditions.find((c) => c.id === selectedConditionId) ?? null,
    [conditions, selectedConditionId],
  );

  const { condition: conditionDetail } = useConditionDetail(
    selectedConditionId ?? undefined,
  );

  // Chart readings for selected condition
  const selectedReadingType = useMemo(() => {
    if (!selectedCondition) return undefined;
    const option = getConditionOption(selectedCondition.condition_type);
    return option?.defaultReadingType;
  }, [selectedCondition]);

  const { readings: chartReadings, loading: readingsLoading } =
    useChronicReadings(
      selectedConditionId ?? undefined,
      selectedReadingType,
      chartPeriod,
    );

  // Reading form target
  const readingTarget = useMemo(() => {
    const targetId = readingConditionId ?? selectedConditionId;
    return conditions.find((c) => c.id === targetId) ?? null;
  }, [readingConditionId, selectedConditionId, conditions]);

  // --- Handlers ---
  const handleSelectCondition = useCallback(
    (id: string) => {
      setSelectedConditionId((prev) => (prev === id ? null : id));
      setReadingConditionId(null);
      setChartPeriod("30d");
    },
    [],
  );

  const handleLogReadingClick = useCallback((conditionId: string) => {
    setReadingConditionId(conditionId);
    setSelectedConditionId(conditionId);
  }, []);

  const handleSubmitReading = useCallback(
    async (data: LogReadingData) => {
      await logReadingMutation(data);
      setReadingConditionId(null);
    },
    [logReadingMutation],
  );

  const handleAddCondition = useCallback(
    async (data: AddConditionData) => {
      await addCondition(data);
    },
    [addCondition],
  );

  const handleCompleteGoal = useCallback(
    async (goalId: string) => {
      await updateGoal({ id: goalId, data: { is_completed: true } });
    },
    [updateGoal],
  );

  const handleScheduleAppointment = useCallback(() => {
    window.location.href = "/dashboard/agendar";
  }, []);

  // --- Loading state ---
  if (conditionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-48" />
        <SkeletonList count={3} />
      </div>
    );
  }

  // --- Empty state ---
  if (conditions.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <HeartPulse className="h-7 w-7 text-emerald-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Mis Cronicos
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            Gestion y seguimiento de tus condiciones cronicas
          </p>
        </div>

        <EmptyState
          icon={Activity}
          title="No tenes condiciones cronicas registradas"
          description="Aca podes llevar un control diario de condiciones como diabetes, hipertension, asma y mas. Registra tus lecturas, visualiza tendencias y recibir alertas automaticas."
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Agregar mi primera condicion
          </button>
        </div>

        <AddConditionDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddCondition}
          submitting={adding}
        />
      </div>
    );
  }

  // --- Goals for the selected condition ---
  const selectedGoals = selectedConditionId
    ? goals.filter((g) => g.condition_id === selectedConditionId)
    : goals;

  // --- Main render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <HeartPulse className="h-7 w-7 text-emerald-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Mis Cronicos
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            Seguimiento diario de tus condiciones cronicas
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddDialog(true)}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar condicion</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Critical alerts banner */}
      {!alertsLoading && <CriticalAlertBanner alerts={alerts} />}

      {/* Quick reading buttons */}
      {conditions.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {conditions.map((c) => {
            const option = getConditionOption(c.condition_type);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleLogReadingClick(c.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border min-h-[40px] ${
                  readingConditionId === c.id
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                }`}
              >
                Registrar {option?.label ?? c.condition_label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Condition cards */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Mis condiciones
          </h2>
          <div className="space-y-3">
            {conditions.map((condition) => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                latestReadings={
                  conditionDetail?.id === condition.id
                    ? conditionDetail.latest_readings
                    : []
                }
                selected={selectedConditionId === condition.id}
                onSelect={handleSelectCondition}
                onLogReading={handleLogReadingClick}
              />
            ))}
          </div>
        </div>

        {/* Right column: Detail / Reading form / Chart / Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reading form (if open) */}
          {readingTarget && readingConditionId && (
            <section className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Registrar lectura — {readingTarget.condition_label}
              </h3>
              <ReadingForm
                conditionId={readingTarget.id}
                conditionType={readingTarget.condition_type as ConditionType}
                onSubmit={handleSubmitReading}
                submitting={logging}
              />
            </section>
          )}

          {/* Trend chart for selected condition */}
          {selectedConditionId && (
            <section className="bg-white border border-gray-100 rounded-2xl p-5">
              <TrendChart
                readings={chartReadings}
                readingType={selectedReadingType ?? "custom"}
                conditionType={selectedCondition?.condition_type ?? "otro"}
                loading={readingsLoading}
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
              />
            </section>
          )}

          {/* Goals tracker */}
          <section className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              {selectedConditionId ? "Metas" : "Todas las metas"}
            </h3>
            <GoalsTracker
              goals={selectedGoals}
              loading={goalsLoading}
              onCompleteGoal={handleCompleteGoal}
            />
          </section>

          {/* Alerts panel */}
          {alerts.length > 0 && (
            <section className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Alertas y recordatorios
              </h3>
              <AlertsPanel
                alerts={alerts}
                loading={alertsLoading}
                onLogReading={handleLogReadingClick}
                onScheduleAppointment={handleScheduleAppointment}
                onViewCondition={handleSelectCondition}
              />
            </section>
          )}

          {/* No condition selected prompt */}
          {!selectedConditionId && !readingConditionId && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
              <Activity className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Selecciona una condicion para ver su grafico de tendencia y registrar lecturas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Condition Dialog */}
      <AddConditionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddCondition}
        submitting={adding}
      />
    </div>
  );
}
