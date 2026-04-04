'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import {
  BARTHEL_ITEMS,
  BARTHEL_MAX_SCORE,
  classifyBarthel,
  FIM_ITEMS,
  FIM_LEVELS,
  FIM_TOTAL_MAX,
  FIM_MOTOR_MAX,
  FIM_COGNITIVE_MAX,
  classifyFim,
  BERG_ITEMS,
  BERG_MAX_SCORE,
  classifyBerg,
  VAS_MAX,
  classifyVas,
  type ScaleType,
} from './rehab-scales-data';
import type { ScaleScore } from './use-rehabilitation';

// ============================================================================
// TYPES
// ============================================================================

interface FunctionalScalesProps {
  scores: ScaleScore[];
  onChange: (scores: ScaleScore[]) => void;
  /** Past scores for trend display */
  history?: ScaleScore[][];
  readOnly?: boolean;
  themeColor?: string;
}

// ============================================================================
// SCORE GAUGE
// ============================================================================

function ScoreGauge({
  score,
  maxScore,
  label,
  color,
}: {
  score: number;
  maxScore: number;
  label: string;
  color: string;
}) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle
            cx="35"
            cy="35"
            r="30"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="5"
          />
          <circle
            cx="35"
            cy="35"
            r="30"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 35 35)"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-[8px] text-gray-400">/{maxScore}</span>
        </div>
      </div>
      <p className="text-[10px] text-gray-500 mt-1 text-center">{label}</p>
    </div>
  );
}

// ============================================================================
// MINI TREND
// ============================================================================

function MiniTrend({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  if (values.length < 2) return null;

  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const w = 80;
  const h = 24;

  const points = values
    .map((v, i) => {
      const x = 2 + (i / (values.length - 1)) * (w - 4);
      const y = h - 2 - ((v - minV) / range) * (h - 4);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20" style={{ height: '24px' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// BARTHEL FORM
// ============================================================================

function BarthelForm({
  currentScores,
  onChange,
  readOnly,
  themeColor,
}: {
  currentScores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  const total = useMemo(
    () => Object.values(currentScores).reduce((s, v) => s + v, 0),
    [currentScores],
  );
  const classification = classifyBarthel(total);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <ScoreGauge
          score={total}
          maxScore={BARTHEL_MAX_SCORE}
          label={classification.label}
          color={classification.color}
        />
      </div>

      {BARTHEL_ITEMS.map((item) => (
        <div key={item.id} className="space-y-1">
          <p className="text-xs font-medium text-gray-600">{item.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {item.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={readOnly}
                onClick={() => onChange({ ...currentScores, [item.id]: opt.value })}
                className={cn(
                  'px-2 py-1 text-[11px] font-medium rounded-lg border transition-colors',
                  currentScores[item.id] === opt.value
                    ? 'text-white border-transparent'
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50',
                )}
                style={
                  currentScores[item.id] === opt.value
                    ? { backgroundColor: themeColor }
                    : undefined
                }
              >
                {opt.label} ({opt.value})
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// FIM FORM
// ============================================================================

function FimForm({
  currentScores,
  onChange,
  readOnly,
  themeColor,
}: {
  currentScores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  const motorItems = FIM_ITEMS.filter((i) => i.subscale === 'motor');
  const cognitiveItems = FIM_ITEMS.filter((i) => i.subscale === 'cognitive');

  const motorTotal = motorItems.reduce((s, i) => s + (currentScores[i.id] ?? 1), 0);
  const cogTotal = cognitiveItems.reduce((s, i) => s + (currentScores[i.id] ?? 1), 0);
  const total = motorTotal + cogTotal;
  const classification = classifyFim(total);

  const [expandedSubscale, setExpandedSubscale] = useState<'motor' | 'cognitive' | null>('motor');

  const renderItems = (items: typeof FIM_ITEMS) =>
    items.map((item) => (
      <div key={item.id} className="flex items-center gap-3 py-1.5">
        <span className="text-xs text-gray-600 flex-1 min-w-0 truncate">
          {item.label}
        </span>
        <div className="flex items-center gap-0.5">
          {FIM_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              disabled={readOnly}
              title={level.label}
              onClick={() => onChange({ ...currentScores, [item.id]: level.value })}
              className={cn(
                'h-6 w-6 rounded text-[10px] font-bold transition-colors',
                (currentScores[item.id] ?? 1) === level.value
                  ? 'text-white'
                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100',
              )}
              style={
                (currentScores[item.id] ?? 1) === level.value
                  ? { backgroundColor: themeColor }
                  : undefined
              }
            >
              {level.value}
            </button>
          ))}
        </div>
      </div>
    ));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4">
        <ScoreGauge score={motorTotal} maxScore={FIM_MOTOR_MAX} label="Motor" color={themeColor} />
        <ScoreGauge score={cogTotal} maxScore={FIM_COGNITIVE_MAX} label="Cognitivo" color="#8B5CF6" />
        <ScoreGauge score={total} maxScore={FIM_TOTAL_MAX} label={classification.label} color={classification.color} />
      </div>

      {/* Motor */}
      <button
        type="button"
        onClick={() => setExpandedSubscale(expandedSubscale === 'motor' ? null : 'motor')}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-medium text-gray-600">Motor ({motorTotal}/{FIM_MOTOR_MAX})</span>
        <ChevronDown className={cn('h-4 w-4 text-gray-400', expandedSubscale === 'motor' && 'rotate-180')} />
      </button>
      {expandedSubscale === 'motor' && renderItems(motorItems)}

      {/* Cognitive */}
      <button
        type="button"
        onClick={() => setExpandedSubscale(expandedSubscale === 'cognitive' ? null : 'cognitive')}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-medium text-gray-600">Cognitivo ({cogTotal}/{FIM_COGNITIVE_MAX})</span>
        <ChevronDown className={cn('h-4 w-4 text-gray-400', expandedSubscale === 'cognitive' && 'rotate-180')} />
      </button>
      {expandedSubscale === 'cognitive' && renderItems(cognitiveItems)}
    </div>
  );
}

// ============================================================================
// BERG FORM
// ============================================================================

function BergForm({
  currentScores,
  onChange,
  readOnly,
  themeColor,
}: {
  currentScores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  const total = useMemo(
    () => Object.values(currentScores).reduce((s, v) => s + v, 0),
    [currentScores],
  );
  const classification = classifyBerg(total);

  return (
    <div className="space-y-3">
      <ScoreGauge
        score={total}
        maxScore={BERG_MAX_SCORE}
        label={classification.label}
        color={classification.color}
      />

      {BERG_ITEMS.map((item) => (
        <div key={item.id} className="space-y-1.5 p-2 rounded-lg bg-gray-50">
          <p className="text-xs font-medium text-gray-600">{item.label}</p>
          <div className="space-y-1">
            {item.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={readOnly}
                onClick={() => onChange({ ...currentScores, [item.id]: opt.value })}
                className={cn(
                  'w-full text-left px-2 py-1.5 text-[11px] rounded-lg border transition-colors',
                  currentScores[item.id] === opt.value
                    ? 'text-white border-transparent'
                    : 'text-gray-500 border-gray-200 bg-white hover:bg-gray-50',
                )}
                style={
                  currentScores[item.id] === opt.value
                    ? { backgroundColor: themeColor }
                    : undefined
                }
              >
                <span className="font-bold mr-1">{opt.value}.</span> {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// VAS FORM
// ============================================================================

function VasForm({
  currentScores,
  onChange,
  readOnly,
  themeColor,
}: {
  currentScores: Record<string, number>;
  onChange: (scores: Record<string, number>) => void;
  readOnly: boolean;
  themeColor: string;
}) {
  const value = currentScores['vas'] ?? 0;
  const classification = classifyVas(value);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ color: classification.color }}
        >
          {value}
        </span>
        <span className="text-xs font-medium" style={{ color: classification.color }}>
          {classification.label}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={VAS_MAX}
        step={1}
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange({ ...currentScores, vas: Number(e.target.value) })}
        className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: classification.color }}
      />

      <div className="flex justify-between text-[10px] text-gray-400 px-1">
        <span>Sin dolor (0)</span>
        <span>Moderado (5)</span>
        <span>Peor dolor (10)</span>
      </div>
    </div>
  );
}

// ============================================================================
// SCALE TABS
// ============================================================================

const SCALE_TABS: Array<{ id: ScaleType; label: string }> = [
  { id: 'barthel', label: 'Barthel' },
  { id: 'fim', label: 'FIM' },
  { id: 'berg', label: 'Berg' },
  { id: 'vas', label: 'EVA' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function FunctionalScales({
  scores,
  onChange,
  history,
  readOnly = false,
  themeColor = '#3B82F6',
}: FunctionalScalesProps) {
  const [activeScale, setActiveScale] = useState<ScaleType>('barthel');

  const currentScaleScore = scores.find((s) => s.scale_id === activeScale);
  const currentScores = currentScaleScore?.scores ?? {};

  const handleScoresChange = useCallback(
    (newScores: Record<string, number>) => {
      const total = Object.values(newScores).reduce((s, v) => s + v, 0);
      const updated: ScaleScore = {
        scale_id: activeScale,
        scores: newScores,
        total,
      };
      const existing = scores.findIndex((s) => s.scale_id === activeScale);
      if (existing >= 0) {
        const next = [...scores];
        next[existing] = updated;
        onChange(next);
      } else {
        onChange([...scores, updated]);
      }
    },
    [activeScale, scores, onChange],
  );

  // Historical totals for trend
  const trendValues = useMemo(() => {
    if (!history) return [];
    return history
      .map((sessionScores) => {
        const found = sessionScores.find((s) => s.scale_id === activeScale);
        return found?.total ?? null;
      })
      .filter((v) => v !== null) as number[];
  }, [history, activeScale]);

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        Escalas Funcionales
      </p>

      {/* Scale tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SCALE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveScale(tab.id)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap',
              activeScale === tab.id
                ? 'text-white'
                : 'text-gray-500 bg-gray-100 hover:bg-gray-200',
            )}
            style={
              activeScale === tab.id ? { backgroundColor: themeColor } : undefined
            }
          >
            {tab.label}
          </button>
        ))}
        {trendValues.length >= 2 && (
          <div className="ml-auto flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-gray-400" />
            <MiniTrend values={trendValues} color={themeColor} />
          </div>
        )}
      </div>

      {/* Scale form */}
      {activeScale === 'barthel' && (
        <BarthelForm
          currentScores={currentScores}
          onChange={handleScoresChange}
          readOnly={readOnly}
          themeColor={themeColor}
        />
      )}
      {activeScale === 'fim' && (
        <FimForm
          currentScores={currentScores}
          onChange={handleScoresChange}
          readOnly={readOnly}
          themeColor={themeColor}
        />
      )}
      {activeScale === 'berg' && (
        <BergForm
          currentScores={currentScores}
          onChange={handleScoresChange}
          readOnly={readOnly}
          themeColor={themeColor}
        />
      )}
      {activeScale === 'vas' && (
        <VasForm
          currentScores={currentScores}
          onChange={handleScoresChange}
          readOnly={readOnly}
          themeColor={themeColor}
        />
      )}
    </div>
  );
}
