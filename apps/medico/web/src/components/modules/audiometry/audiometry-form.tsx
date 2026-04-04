'use client';

import { useState, useCallback } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  AUDIOGRAM_FREQUENCIES,
  TYMPANOGRAM_DESCRIPTIONS,
  calculatePTA,
  classifySeverity,
  type AudiogramThreshold,
  type SpeechAudiometry,
  type TympanometryResult,
  type TympanogramType,
  type EarSide,
} from './use-audiometry';

// ============================================================================
// TYPES
// ============================================================================

interface AudiometryFormProps {
  thresholds: AudiogramThreshold[];
  onThresholdsChange: (thresholds: AudiogramThreshold[]) => void;
  speech: SpeechAudiometry[];
  onSpeechChange: (speech: SpeechAudiometry[]) => void;
  tympanometry: TympanometryResult[];
  onTympanometryChange: (tympanometry: TympanometryResult[]) => void;
  themeColor?: string;
}

type FormTab = 'thresholds' | 'speech' | 'tympanometry';

// ============================================================================
// COMPONENT
// ============================================================================

export function AudiometryForm({
  thresholds,
  onThresholdsChange,
  speech,
  onSpeechChange,
  tympanometry,
  onTympanometryChange,
  themeColor = '#3B82F6',
}: AudiometryFormProps) {
  const [activeTab, setActiveTab] = useState<FormTab>('thresholds');

  // ── Threshold helpers ──────────────────────────────
  const getThreshold = useCallback(
    (freq: number, ear: EarSide): number | '' => {
      const t = thresholds.find(
        (th) => th.frequency === freq && th.ear === ear && th.conduction === 'air',
      );
      return t ? t.threshold : '';
    },
    [thresholds],
  );

  const setThreshold = useCallback(
    (freq: number, ear: EarSide, value: number) => {
      const existing = thresholds.find(
        (t) => t.frequency === freq && t.ear === ear && t.conduction === 'air',
      );
      const newEntry: AudiogramThreshold = {
        frequency: freq,
        ear,
        conduction: 'air',
        threshold: value,
      };

      const updated = existing
        ? thresholds.map((t) =>
            t.frequency === freq && t.ear === ear && t.conduction === 'air'
              ? newEntry
              : t,
          )
        : [...thresholds, newEntry];

      onThresholdsChange(updated);
    },
    [thresholds, onThresholdsChange],
  );

  // ── Speech helpers ─────────────────────────────────
  const getSpeech = useCallback(
    (ear: EarSide): SpeechAudiometry => {
      return speech.find((s) => s.ear === ear) ?? { ear, srt: null, wrs: null };
    },
    [speech],
  );

  const updateSpeech = useCallback(
    (ear: EarSide, field: 'srt' | 'wrs', value: number | null) => {
      const existing = speech.find((s) => s.ear === ear);
      const updated: SpeechAudiometry = {
        ear,
        srt: field === 'srt' ? value : existing?.srt ?? null,
        wrs: field === 'wrs' ? value : existing?.wrs ?? null,
      };

      const newSpeech = existing
        ? speech.map((s) => (s.ear === ear ? updated : s))
        : [...speech, updated];

      onSpeechChange(newSpeech);
    },
    [speech, onSpeechChange],
  );

  // ── Tympanometry helpers ───────────────────────────
  const getTymp = useCallback(
    (ear: EarSide): TympanometryResult => {
      return tympanometry.find((t) => t.ear === ear) ?? {
        ear,
        type: 'A',
        compliance: null,
        pressure: null,
        volume: null,
      };
    },
    [tympanometry],
  );

  const updateTymp = useCallback(
    (ear: EarSide, updates: Partial<TympanometryResult>) => {
      const existing = getTymp(ear);
      const updated: TympanometryResult = { ...existing, ...updates };

      const found = tympanometry.find((t) => t.ear === ear);
      const newTymp = found
        ? tympanometry.map((t) => (t.ear === ear ? updated : t))
        : [...tympanometry, updated];

      onTympanometryChange(newTymp);
    },
    [tympanometry, getTymp, onTympanometryChange],
  );

  // PTA
  const ptaRight = calculatePTA(thresholds, 'right');
  const ptaLeft = calculatePTA(thresholds, 'left');

  const TABS: Array<{ key: FormTab; label: string }> = [
    { key: 'thresholds', label: 'Umbrales' },
    { key: 'speech', label: 'Logoaudiometría' },
    { key: 'tympanometry', label: 'Timpanometría' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
              activeTab === tab.key
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              activeTab === tab.key
                ? { backgroundColor: themeColor }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Thresholds tab ───────────────────────────── */}
      {activeTab === 'thresholds' && (
        <div className="space-y-3">
          {/* PTA summary */}
          <div className="flex gap-4">
            {([
              { ear: 'right' as EarSide, label: 'OD', color: '#ef4444', pta: ptaRight },
              { ear: 'left' as EarSide, label: 'OI', color: '#3b82f6', pta: ptaLeft },
            ]).map(({ ear, label, color, pta }) => (
              <div
                key={ear}
                className="flex-1 p-2 rounded-lg border border-gray-100 text-center"
              >
                <p className="text-xs font-medium" style={{ color }}>{label}</p>
                <p className="text-lg font-bold text-gray-700">
                  {pta != null ? `${pta} dB` : '—'}
                </p>
                <p className="text-[10px] text-gray-400">
                  PTA{pta != null ? ` — ${classifySeverity(pta)}` : ''}
                </p>
              </div>
            ))}
          </div>

          {/* Input grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 px-2 py-1.5 bg-gray-50 text-xs font-medium text-gray-500 border-b">
              <span></span>
              {AUDIOGRAM_FREQUENCIES.map((f) => (
                <span key={f} className="text-center">
                  {f >= 1000 ? `${f / 1000}K` : f}
                </span>
              ))}
            </div>

            {(['right', 'left'] as EarSide[]).map((ear) => (
              <div
                key={ear}
                className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 px-2 py-1.5 items-center border-b last:border-b-0"
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: ear === 'right' ? '#ef4444' : '#3b82f6' }}
                >
                  {ear === 'right' ? 'OD' : 'OI'}
                </span>
                {AUDIOGRAM_FREQUENCIES.map((f) => (
                  <input
                    key={`${ear}-${f}`}
                    type="number"
                    min={-10}
                    max={120}
                    step={5}
                    value={getThreshold(f, ear)}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) setThreshold(f, ear, v);
                    }}
                    placeholder="—"
                    className="w-full text-center text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Speech audiometry tab ────────────────────── */}
      {activeTab === 'speech' && (
        <div className="space-y-3">
          {(['right', 'left'] as EarSide[]).map((ear) => {
            const s = getSpeech(ear);
            return (
              <div key={ear} className="p-3 rounded-lg border border-gray-200">
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: ear === 'right' ? '#ef4444' : '#3b82f6' }}
                >
                  {ear === 'right' ? 'Oído Derecho (OD)' : 'Oído Izquierdo (OI)'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SRT (dB)</label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      step={5}
                      value={s.srt ?? ''}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        updateSpeech(ear, 'srt', Number.isNaN(v) ? null : v);
                      }}
                      placeholder="—"
                      className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">WRS (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={4}
                      value={s.wrs ?? ''}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        updateSpeech(ear, 'wrs', Number.isNaN(v) ? null : v);
                      }}
                      placeholder="—"
                      className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tympanometry tab ─────────────────────────── */}
      {activeTab === 'tympanometry' && (
        <div className="space-y-3">
          {(['right', 'left'] as EarSide[]).map((ear) => {
            const t = getTymp(ear);
            return (
              <div key={ear} className="p-3 rounded-lg border border-gray-200">
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: ear === 'right' ? '#ef4444' : '#3b82f6' }}
                >
                  {ear === 'right' ? 'Oído Derecho (OD)' : 'Oído Izquierdo (OI)'}
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tipo de curva</label>
                    <div className="flex flex-wrap gap-2">
                      {(['A', 'As', 'Ad', 'B', 'C'] as TympanogramType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateTymp(ear, { type })}
                          className={cn(
                            'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                            t.type === type
                              ? 'border-transparent text-white'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                          )}
                          style={
                            t.type === type ? { backgroundColor: themeColor } : undefined
                          }
                          title={TYMPANOGRAM_DESCRIPTIONS[type]}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {TYMPANOGRAM_DESCRIPTIONS[t.type]}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Compliance (mL)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={t.compliance ?? ''}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          updateTymp(ear, { compliance: Number.isNaN(v) ? null : v });
                        }}
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Presión (daPa)</label>
                      <input
                        type="number"
                        step={5}
                        value={t.pressure ?? ''}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          updateTymp(ear, { pressure: Number.isNaN(v) ? null : v });
                        }}
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Volumen (mL)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={t.volume ?? ''}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          updateTymp(ear, { volume: Number.isNaN(v) ? null : v });
                        }}
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
