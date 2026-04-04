'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Calendar,
  AlertTriangle,
  Baby,
  Heart,
  Eye,
  X,
} from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  usePrenatal,
  type Pregnancy,
  type CreatePrenatalVisit,
  type PrenatalAlert,
} from './use-prenatal';
import { PrenatalForm } from './prenatal-form';
import { PrenatalCard } from './prenatal-card';
import { FundalHeightChart } from './fundal-height-chart';
import { PregnancyTimeline } from './pregnancy-timeline';

// ============================================================================
// TYPES
// ============================================================================

type ViewState = 'summary' | 'new-visit' | 'card' | 'chart';

// ============================================================================
// CONSTANTS
// ============================================================================

const RISK_COLORS: Record<string, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

const RISK_LABELS: Record<string, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};

const ALERT_SEVERITY_COLORS: Record<string, string> = {
  mild: '#EAB308',
  moderate: '#F97316',
  severe: '#EF4444',
};

// ============================================================================
// ALERT BANNER
// ============================================================================

function AlertBanner({ alerts }: { alerts: PrenatalAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {alerts.map((alert, i) => (
        <div
          key={`${alert.type}-${i}`}
          className="flex items-start gap-2 p-2.5 rounded-lg border"
          style={{
            backgroundColor: `${ALERT_SEVERITY_COLORS[alert.severity]}08`,
            borderColor: `${ALERT_SEVERITY_COLORS[alert.severity]}30`,
          }}
        >
          <AlertTriangle
            className="h-4 w-4 shrink-0 mt-0.5"
            style={{ color: ALERT_SEVERITY_COLORS[alert.severity] }}
          />
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: ALERT_SEVERITY_COLORS[alert.severity] }}
            >
              {alert.label}
            </p>
            <p className="text-xs text-gray-600">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ACTIVE PREGNANCY SUMMARY CARD
// ============================================================================

function PregnancySummaryCard({
  pregnancy,
  gestationalAge,
  daysToEdd,
  visits,
  alerts,
  themeColor,
  onViewCard,
  onViewChart,
}: {
  pregnancy: Pregnancy;
  gestationalAge: { weeks: number; days: number } | null;
  daysToEdd: number | null;
  visits: import('./use-prenatal').PrenatalVisit[];
  alerts: PrenatalAlert[];
  themeColor: string;
  onViewCard: () => void;
  onViewChart: () => void;
}) {
  const lastVisit = visits.length > 0 ? visits[visits.length - 1] : null;

  return (
    <div className="space-y-4">
      {/* Main stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Gestational age */}
        <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 text-center">
          <p className="text-[10px] text-gray-400 uppercase">Edad Gestacional</p>
          <p className="text-xl font-bold" style={{ color: themeColor }}>
            {gestationalAge ? `${gestationalAge.weeks}+${gestationalAge.days}` : '—'}
          </p>
          <p className="text-[10px] text-gray-400">semanas</p>
        </div>

        {/* Days to EDD */}
        <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 text-center">
          <p className="text-[10px] text-gray-400 uppercase">Para el Parto</p>
          <p className="text-xl font-bold text-gray-700">
            {daysToEdd != null ? (daysToEdd > 0 ? daysToEdd : 0) : '—'}
          </p>
          <p className="text-[10px] text-gray-400">
            {daysToEdd != null && daysToEdd <= 0 ? 'FPP alcanzada' : 'días'}
          </p>
        </div>

        {/* Total visits */}
        <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 text-center">
          <p className="text-[10px] text-gray-400 uppercase">Controles</p>
          <p className="text-xl font-bold text-gray-700">{visits.length}</p>
          <p className="text-[10px] text-gray-400">realizados</p>
        </div>

        {/* Risk level */}
        <div
          className="p-3 rounded-lg border text-center"
          style={{
            backgroundColor: `${RISK_COLORS[pregnancy.risk_level]}08`,
            borderColor: `${RISK_COLORS[pregnancy.risk_level]}30`,
          }}
        >
          <p className="text-[10px] text-gray-400 uppercase">Riesgo</p>
          <p
            className="text-xl font-bold"
            style={{ color: RISK_COLORS[pregnancy.risk_level] }}
          >
            {RISK_LABELS[pregnancy.risk_level]}
          </p>
          <p className="text-[10px] text-gray-400">
            G{pregnancy.gravida}P{pregnancy.para}A{pregnancy.abortos}C{pregnancy.cesareas}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      {/* Last visit quick data */}
      {lastVisit && (
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase mb-1.5">
            Último Control ({new Date(lastVisit.visit_date).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'short',
            })})
          </p>
          <div className="flex items-center gap-4 flex-wrap text-xs">
            {lastVisit.weight_kg != null && (
              <span className="text-gray-600">
                <span className="text-gray-400">Peso:</span>{' '}
                <span className="font-medium">{lastVisit.weight_kg} kg</span>
              </span>
            )}
            {lastVisit.blood_pressure_systolic != null && (
              <span className="text-gray-600">
                <span className="text-gray-400">TA:</span>{' '}
                <span className="font-medium">
                  {lastVisit.blood_pressure_systolic}/{lastVisit.blood_pressure_diastolic}
                </span>
              </span>
            )}
            {lastVisit.fundal_height_cm != null && (
              <span className="text-gray-600">
                <span className="text-gray-400">AU:</span>{' '}
                <span className="font-medium">{lastVisit.fundal_height_cm} cm</span>
              </span>
            )}
            {lastVisit.fetal_heart_rate != null && (
              <span className="text-gray-600">
                <span className="text-gray-400">FCF:</span>{' '}
                <span className="font-medium">{lastVisit.fetal_heart_rate} lpm</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onViewCard}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          Carnet Prenatal
        </button>
        <button
          type="button"
          onClick={onViewChart}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <Heart className="h-3.5 w-3.5" />
          Curva AU
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// VISIT HISTORY LIST
// ============================================================================

function VisitHistory({
  visits,
  themeColor,
}: {
  visits: import('./use-prenatal').PrenatalVisit[];
  themeColor: string;
}) {
  const sortedVisits = useMemo(
    () => [...visits].sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()),
    [visits],
  );

  if (sortedVisits.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-600 mb-2">
        Historial de Controles
      </h4>
      <div className="space-y-1.5">
        {sortedVisits.map((visit) => {
          const bpWarning =
            (visit.blood_pressure_systolic != null && visit.blood_pressure_systolic >= 140) ||
            (visit.blood_pressure_diastolic != null && visit.blood_pressure_diastolic >= 90);

          return (
            <div
              key={visit.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {/* Week badge */}
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                {visit.gestational_weeks}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-gray-700">
                    Semana {visit.gestational_weeks}+{visit.gestational_days}
                  </p>
                  <span className="text-[10px] text-gray-400">
                    {new Date(visit.visit_date).toLocaleDateString('es-VE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500">
                  {visit.weight_kg != null && <span>Peso: {visit.weight_kg} kg</span>}
                  {visit.blood_pressure_systolic != null && (
                    <span className={bpWarning ? 'text-red-600 font-medium' : ''}>
                      TA: {visit.blood_pressure_systolic}/{visit.blood_pressure_diastolic}
                    </span>
                  )}
                  {visit.fetal_heart_rate != null && <span>FCF: {visit.fetal_heart_rate}</span>}
                  {visit.fundal_height_cm != null && <span>AU: {visit.fundal_height_cm} cm</span>}
                </div>
              </div>

              {/* Risk factors indicator */}
              {visit.risk_factors.length > 0 && (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function GynecologyModule({
  doctorId,
  patientId,
  specialtySlug,
  config,
  themeColor = '#ec4899',
}: ModuleComponentProps) {
  // State
  const [viewState, setViewState] = useState<ViewState>('summary');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const {
    pregnancies,
    activePregnancy,
    visits,
    loading,
    error,
    alerts,
    addVisit,
    gestationalAge,
    daysToEdd,
    refresh,
  } = usePrenatal(doctorId, { patientId });

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleAddVisit = useCallback(
    async (data: CreatePrenatalVisit) => {
      setIsSubmitting(true);
      const result = await addVisit(data);
      setIsSubmitting(false);
      if (result) {
        setViewState('summary');
      }
    },
    [addVisit],
  );

  // Module actions
  const moduleActions = activePregnancy
    ? [
        {
          label: 'Nuevo Control',
          onClick: () => setViewState('new-visit'),
          icon: Plus,
        },
      ]
    : [];

  // ── New visit form ────────────────────────────────────────────────────

  if (viewState === 'new-visit' && activePregnancy) {
    return (
      <ModuleWrapper
        moduleKey="gynecology-prenatal"
        title="Nuevo Control Prenatal"
        icon="Baby"
        themeColor={themeColor}
      >
        <PrenatalForm
          pregnancy={activePregnancy}
          onSubmit={handleAddVisit}
          onCancel={() => setViewState('summary')}
          isSubmitting={isSubmitting}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Prenatal card view ────────────────────────────────────────────────

  if (viewState === 'card' && activePregnancy) {
    return (
      <ModuleWrapper
        moduleKey="gynecology-prenatal"
        title="Carnet Prenatal"
        icon="Baby"
        themeColor={themeColor}
        actions={[
          {
            label: 'Volver',
            onClick: () => setViewState('summary'),
            icon: X,
            variant: 'ghost',
          },
        ]}
      >
        <PrenatalCard
          pregnancy={activePregnancy}
          visits={visits}
          gestationalAge={gestationalAge}
        />
      </ModuleWrapper>
    );
  }

  // ── Fundal height chart view ──────────────────────────────────────────

  if (viewState === 'chart' && activePregnancy) {
    return (
      <ModuleWrapper
        moduleKey="gynecology-prenatal"
        title="Curva de Altura Uterina"
        icon="Baby"
        themeColor={themeColor}
        actions={[
          {
            label: 'Volver',
            onClick: () => setViewState('summary'),
            icon: X,
            variant: 'ghost',
          },
        ]}
      >
        <FundalHeightChart
          visits={visits}
          themeColor={themeColor}
        />
      </ModuleWrapper>
    );
  }

  // ── Summary view ──────────────────────────────────────────────────────

  return (
    <ModuleWrapper
      moduleKey="gynecology-prenatal"
      title="Control Prenatal"
      icon="Baby"
      description="Seguimiento de embarazo y controles"
      themeColor={themeColor}
      isEmpty={!loading && !activePregnancy}
      emptyMessage="Sin embarazo activo registrado"
      isLoading={loading}
      actions={moduleActions}
    >
      {activePregnancy && (
        <div className="space-y-5">
          {/* Active pregnancy summary */}
          <PregnancySummaryCard
            pregnancy={activePregnancy}
            gestationalAge={gestationalAge}
            daysToEdd={daysToEdd}
            visits={visits}
            alerts={alerts}
            themeColor={themeColor}
            onViewCard={() => setViewState('card')}
            onViewChart={() => setViewState('chart')}
          />

          {/* Pregnancy timeline */}
          <PregnancyTimeline
            gestationalAge={gestationalAge}
            visits={visits}
            riskFactors={
              visits.length > 0
                ? visits[visits.length - 1].risk_factors
                : []
            }
            themeColor={themeColor}
          />

          {/* Fundal height chart (inline preview) */}
          {visits.some((v) => v.fundal_height_cm != null && v.gestational_weeks >= 20) && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">
                Curva de Altura Uterina
              </h4>
              <FundalHeightChart visits={visits} themeColor={themeColor} />
            </div>
          )}

          {/* Visit history */}
          <VisitHistory visits={visits} themeColor={themeColor} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
