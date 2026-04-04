'use client';

import { useState, useCallback } from 'react';
import { Plus, Radiation, Activity } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useOncology,
  type CreateOncologyRecord,
  type TreatmentCycle,
} from './use-oncology';
import {
  CANCER_TYPES,
  ECOG_SCALE,
  RECIST_CRITERIA,
  STAGE_COLORS,
  type TCategory,
  type NCategory,
  type MCategory,
  type OverallStage,
  type HistologicGrade,
  type ECOGScore,
  type KarnofskyScore,
  type RECISTResponse,
} from './oncology-staging-data';
import { StagingForm } from './staging-form';
import { TreatmentProtocol } from './treatment-protocol';

// ============================================================================
// COMPONENT
// ============================================================================

export default function OncologyModule({
  doctorId,
  patientId,
  config,
  themeColor = '#8B5CF6',
}: ModuleComponentProps) {
  // State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<'staging' | 'treatment'>('staging');

  // Staging form state
  const [cancerType, setCancerType] = useState('breast');
  const [diagnosisDate, setDiagnosisDate] = useState<string | null>(null);
  const [tCategory, setTCategory] = useState<TCategory>('T1');
  const [nCategory, setNCategory] = useState<NCategory>('N0');
  const [mCategory, setMCategory] = useState<MCategory>('M0');
  const [overallStage, setOverallStage] = useState<OverallStage>('I');
  const [histologicGrade, setHistologicGrade] = useState<HistologicGrade>('GX');
  const [biomarkers, setBiomarkers] = useState<Record<string, string>>({});
  const [ecog, setEcog] = useState<ECOGScore>(0);
  const [karnofsky, setKarnofsky] = useState<KarnofskyScore>(100);

  // Treatment form state
  const [protocolName, setProtocolName] = useState<string | null>(null);
  const [cycles, setCycles] = useState<TreatmentCycle[]>([]);
  const [recistResponse, setRecistResponse] = useState<RECISTResponse | null>(null);
  const [notes, setNotes] = useState('');

  // Data
  const { records, loading, error, create } = useOncology(doctorId, {
    patientId,
    limit: 10,
  });

  const handleCreate = useCallback(async () => {
    setIsSubmitting(true);

    const data: CreateOncologyRecord = {
      patient_id: patientId,
      cancer_type: cancerType,
      diagnosis_date: diagnosisDate,
      t_category: tCategory,
      n_category: nCategory,
      m_category: mCategory,
      overall_stage: overallStage,
      histologic_grade: histologicGrade,
      biomarkers,
      ecog,
      karnofsky,
      protocol_name: protocolName,
      cycles,
      recist_response: recistResponse,
      notes: notes || null,
    };

    await create(data);
    setIsSubmitting(false);
    setShowForm(false);
    resetForm();
  }, [
    cancerType, diagnosisDate, tCategory, nCategory, mCategory, overallStage,
    histologicGrade, biomarkers, ecog, karnofsky, protocolName, cycles,
    recistResponse, notes, patientId, create,
  ]);

  const resetForm = useCallback(() => {
    setCancerType('breast');
    setDiagnosisDate(null);
    setTCategory('T1');
    setNCategory('N0');
    setMCategory('M0');
    setOverallStage('I');
    setHistologicGrade('GX');
    setBiomarkers({});
    setEcog(0);
    setKarnofsky(100);
    setProtocolName(null);
    setCycles([]);
    setRecistResponse(null);
    setNotes('');
  }, []);

  const moduleActions = [
    {
      label: 'Nuevo registro',
      onClick: () => setShowForm(true),
      icon: Plus,
    },
  ];

  // ── New record form ──────────────────────────────────────
  if (showForm) {
    return (
      <ModuleWrapper
        moduleKey="oncology-staging"
        title="Registro Oncológico"
        icon="Radiation"
        themeColor={themeColor}
      >
        <div className="space-y-4">
          {/* View toggle */}
          <div className="flex gap-2">
            {([
              { key: 'staging' as const, label: 'Estadificación' },
              { key: 'treatment' as const, label: 'Tratamiento' },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveView(tab.key)}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
                  activeView === tab.key
                    ? 'text-white'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
                )}
                style={
                  activeView === tab.key ? { backgroundColor: themeColor } : undefined
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeView === 'staging' && (
            <StagingForm
              cancerType={cancerType}
              onCancerTypeChange={setCancerType}
              diagnosisDate={diagnosisDate}
              onDiagnosisDateChange={setDiagnosisDate}
              tCategory={tCategory}
              onTChange={setTCategory}
              nCategory={nCategory}
              onNChange={setNCategory}
              mCategory={mCategory}
              onMChange={setMCategory}
              overallStage={overallStage}
              onStageChange={setOverallStage}
              histologicGrade={histologicGrade}
              onGradeChange={setHistologicGrade}
              biomarkers={biomarkers}
              onBiomarkersChange={setBiomarkers}
              ecog={ecog}
              onEcogChange={setEcog}
              karnofsky={karnofsky}
              onKarnofskyChange={setKarnofsky}
              themeColor={themeColor}
            />
          )}

          {activeView === 'treatment' && (
            <>
              <TreatmentProtocol
                protocolName={protocolName}
                onProtocolNameChange={setProtocolName}
                cycles={cycles}
                onCyclesChange={setCycles}
                themeColor={themeColor}
              />

              {/* RECIST response */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Respuesta RECIST</label>
                <div className="flex gap-2">
                  {RECIST_CRITERIA.map((r) => (
                    <button
                      key={r.response}
                      type="button"
                      onClick={() => setRecistResponse(r.response)}
                      className={cn(
                        'flex-1 text-xs font-medium px-2 py-2 rounded-lg border transition-colors text-center',
                        recistResponse === r.response
                          ? 'border-transparent text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                      style={
                        recistResponse === r.response
                          ? { backgroundColor: r.color }
                          : undefined
                      }
                      title={r.description}
                    >
                      <span className="block">{r.response}</span>
                      <span
                        className={cn(
                          'block text-[10px] mt-0.5',
                          recistResponse === r.response
                            ? 'text-white/80'
                            : 'text-gray-400',
                        )}
                      >
                        {r.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Observaciones
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-xs font-medium px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="text-xs font-medium px-4 py-2 text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar registro'}
            </button>
          </div>
        </div>
      </ModuleWrapper>
    );
  }

  // ── Main view ────────────────────────────────────────────
  const latest = records[0];

  return (
    <ModuleWrapper
      moduleKey="oncology-staging"
      title="Oncología"
      icon="Radiation"
      description="Estadificación y seguimiento oncológico"
      themeColor={themeColor}
      isEmpty={!loading && records.length === 0}
      emptyMessage="Sin registros oncológicos"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* Latest cancer summary card */}
      {latest && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {CANCER_TYPES.find((c) => c.value === latest.cancer_type)?.label ?? latest.cancer_type}
              </p>
              {latest.diagnosis_date && (
                <p className="text-xs text-gray-400">
                  Dx: {new Date(latest.diagnosis_date).toLocaleDateString('es-VE')}
                </p>
              )}
            </div>
            <div className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: STAGE_COLORS[latest.overall_stage] ?? themeColor }}
              >
                {latest.overall_stage}
              </p>
              <p className="text-[10px] text-gray-400">
                {latest.t_category}{latest.n_category}{latest.m_category}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-600">
              ECOG {latest.ecog}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-600">
              KPS {latest.karnofsky}%
            </span>
            {latest.histologic_grade !== 'GX' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-600">
                {latest.histologic_grade}
              </span>
            )}
            {latest.recist_response && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  color: RECIST_CRITERIA.find((r) => r.response === latest.recist_response)?.color,
                  backgroundColor: `${RECIST_CRITERIA.find((r) => r.response === latest.recist_response)?.color}15`,
                }}
              >
                RECIST: {latest.recist_response}
              </span>
            )}
          </div>

          {/* Biomarkers */}
          {Object.keys(latest.biomarkers).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(latest.biomarkers).map(([key, value]) => (
                <span
                  key={key}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          )}

          {/* Treatment info */}
          {latest.protocol_name && (
            <p className="text-xs text-gray-500">
              Protocolo: <span className="font-medium">{latest.protocol_name}</span>
              {latest.cycles.length > 0 && (
                <span className="text-gray-400">
                  {' '}— {latest.cycles.filter((c) => c.status === 'completed').length}/{latest.cycles.length} ciclos
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Record history */}
      <div className="space-y-2">
        {records.map((record) => {
          const cancerLabel =
            CANCER_TYPES.find((c) => c.value === record.cancer_type)?.label ?? record.cancer_type;

          return (
            <div
              key={record.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                style={{
                  backgroundColor: `${STAGE_COLORS[record.overall_stage] ?? themeColor}15`,
                  color: STAGE_COLORS[record.overall_stage] ?? themeColor,
                }}
              >
                {record.overall_stage}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{cancerLabel}</p>
                <p className="text-xs text-gray-400">
                  {record.t_category}{record.n_category}{record.m_category}
                  {record.protocol_name ? ` — ${record.protocol_name}` : ''}
                </p>
              </div>

              <p className="text-xs text-gray-400 shrink-0">
                {new Date(record.created_at).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </ModuleWrapper>
  );
}
