'use client';

import { useState, useCallback } from 'react';
import { Plus, Ear, History } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { ModuleComponentProps } from '../module-registry';
import { ModuleWrapper } from '../module-wrapper';
import {
  useAudiometry,
  calculatePTA,
  classifySeverity,
  type AudiogramThreshold,
  type SpeechAudiometry,
  type TympanometryResult,
  type EarSide,
  type CreateAudiometryTest,
} from './use-audiometry';
import { AudiogramChart } from './audiogram-chart';
import { AudiometryForm } from './audiometry-form';

// ============================================================================
// COMPONENT
// ============================================================================

export default function AudiometryModule({
  doctorId,
  patientId,
  config,
  themeColor = '#8B5CF6',
}: ModuleComponentProps) {
  // State
  const [showForm, setShowForm] = useState(false);
  const [selectedEar, setSelectedEar] = useState<EarSide>('right');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);

  // Form state
  const [thresholds, setThresholds] = useState<AudiogramThreshold[]>([]);
  const [speech, setSpeech] = useState<SpeechAudiometry[]>([]);
  const [tympanometry, setTympanometry] = useState<TympanometryResult[]>([]);
  const [notes, setNotes] = useState('');

  // Data
  const { tests, loading, error, create } = useAudiometry(doctorId, {
    patientId,
    limit: 20,
  });

  // Plot handler for chart click
  const handlePlot = useCallback(
    (frequency: number, threshold: number, ear: EarSide) => {
      const existing = thresholds.find(
        (t) => t.frequency === frequency && t.ear === ear && t.conduction === 'air',
      );
      const newEntry: AudiogramThreshold = {
        frequency,
        ear,
        conduction: 'air',
        threshold,
      };

      const updated = existing
        ? thresholds.map((t) =>
            t.frequency === frequency && t.ear === ear && t.conduction === 'air'
              ? newEntry
              : t,
          )
        : [...thresholds, newEntry];

      setThresholds(updated);
    },
    [thresholds],
  );

  const handleCreate = useCallback(async () => {
    setIsSubmitting(true);

    const ptaR = calculatePTA(thresholds, 'right');
    const ptaL = calculatePTA(thresholds, 'left');
    const interpretParts: string[] = [];
    if (ptaR != null) interpretParts.push(`OD: PTA ${ptaR} dB (${classifySeverity(ptaR)})`);
    if (ptaL != null) interpretParts.push(`OI: PTA ${ptaL} dB (${classifySeverity(ptaL)})`);

    const data: CreateAudiometryTest = {
      patient_id: patientId,
      thresholds,
      speech,
      tympanometry,
      notes: notes || null,
      interpretation: interpretParts.join('. ') || null,
    };

    await create(data);
    setIsSubmitting(false);
    setShowForm(false);
    resetForm();
  }, [thresholds, speech, tympanometry, notes, patientId, create]);

  const resetForm = useCallback(() => {
    setThresholds([]);
    setSpeech([]);
    setTympanometry([]);
    setNotes('');
  }, []);

  const moduleActions = [
    {
      label: 'Nuevo audiograma',
      onClick: () => setShowForm(true),
      icon: Plus,
    },
  ];

  // ── New test form ────────────────────────────────────────
  if (showForm) {
    return (
      <ModuleWrapper
        moduleKey="audiometry-test"
        title="Nuevo Audiograma"
        icon="Ear"
        themeColor={themeColor}
      >
        <div className="space-y-4">
          {/* Ear selector for chart clicking */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Oído para marcar:</span>
            {(['right', 'left'] as EarSide[]).map((ear) => (
              <button
                key={ear}
                type="button"
                onClick={() => setSelectedEar(ear)}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
                  selectedEar === ear
                    ? 'text-white'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
                )}
                style={
                  selectedEar === ear
                    ? { backgroundColor: ear === 'right' ? '#ef4444' : '#3b82f6' }
                    : undefined
                }
              >
                {ear === 'right' ? 'OD (derecho)' : 'OI (izquierdo)'}
              </button>
            ))}
          </div>

          {/* Chart */}
          <AudiogramChart
            thresholds={thresholds}
            onPlot={handlePlot}
            selectedEar={selectedEar}
            themeColor={themeColor}
          />

          {/* Form */}
          <AudiometryForm
            thresholds={thresholds}
            onThresholdsChange={setThresholds}
            speech={speech}
            onSpeechChange={setSpeech}
            tympanometry={tympanometry}
            onTympanometryChange={setTympanometry}
            themeColor={themeColor}
          />

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
              disabled={isSubmitting || thresholds.length === 0}
              className="text-xs font-medium px-4 py-2 text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar audiograma'}
            </button>
          </div>
        </div>
      </ModuleWrapper>
    );
  }

  // ── Main view ────────────────────────────────────────────
  const latestTest = tests[0];
  const overlayTest = compareIdx != null ? tests[compareIdx] : null;

  return (
    <ModuleWrapper
      moduleKey="audiometry-test"
      title="Audiometría"
      icon="Ear"
      description="Audiogramas y evaluación auditiva"
      themeColor={themeColor}
      isEmpty={!loading && tests.length === 0}
      emptyMessage="Sin audiogramas registrados"
      isLoading={loading}
      actions={moduleActions}
    >
      {/* Latest audiogram chart */}
      {latestTest && (
        <div className="mb-4">
          <AudiogramChart
            thresholds={latestTest.thresholds}
            overlayThresholds={overlayTest?.thresholds}
            showBone
            themeColor={themeColor}
          />

          {/* PTA summary */}
          <div className="flex gap-4 mt-2">
            {(['right', 'left'] as EarSide[]).map((ear) => {
              const pta = calculatePTA(latestTest.thresholds, ear);
              return (
                <div
                  key={ear}
                  className="flex-1 text-center p-2 rounded-lg bg-gray-50"
                >
                  <p
                    className="text-xs font-medium"
                    style={{ color: ear === 'right' ? '#ef4444' : '#3b82f6' }}
                  >
                    {ear === 'right' ? 'OD' : 'OI'}
                  </p>
                  <p className="text-sm font-bold text-gray-700">
                    {pta != null ? `${pta} dB` : '—'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {pta != null ? classifySeverity(pta) : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison selector */}
      {tests.length > 1 && (
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Comparar con:</label>
          <select
            value={compareIdx ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setCompareIdx(v === '' ? null : parseInt(v, 10));
            }}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">Sin comparación</option>
            {tests.slice(1).map((t, i) => (
              <option key={t.id} value={i + 1}>
                {new Date(t.created_at).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Test history */}
      <div className="space-y-2">
        {tests.map((test) => {
          const ptaR = calculatePTA(test.thresholds, 'right');
          const ptaL = calculatePTA(test.thresholds, 'left');

          return (
            <div
              key={test.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${themeColor}10` }}
              >
                <Ear className="h-5 w-5" style={{ color: themeColor }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Audiograma</p>
                <p className="text-xs text-gray-400">
                  OD: {ptaR != null ? `${ptaR} dB` : '—'} | OI:{' '}
                  {ptaL != null ? `${ptaL} dB` : '—'}
                </p>
              </div>

              <p className="text-xs text-gray-400 shrink-0">
                {new Date(test.created_at).toLocaleDateString('es-VE', {
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
