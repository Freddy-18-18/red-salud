'use client';

import { useState, useMemo } from 'react';
import { cn } from '@red-salud/core/utils';
import {
  IPSS_QUESTIONS,
  IPSS_QOL_QUESTION,
  IPSS_SEVERITY_RANGES,
  classifyIPSS,
  QOL_LABELS,
  type IPSSSeverityRange,
} from './urology-scales-data';
import type { IPSSAssessment } from './use-urology';

// ============================================================================
// TYPES
// ============================================================================

interface IPSSFormProps {
  onSubmit: (assessment: IPSSAssessment) => void;
  previousAssessment?: IPSSAssessment | null;
  themeColor?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function IPSSForm({
  onSubmit,
  previousAssessment,
  themeColor = '#7C3AED',
  isSubmitting = false,
  onCancel,
}: IPSSFormProps) {
  const [scores, setScores] = useState<number[]>(Array(7).fill(-1));
  const [qolScore, setQolScore] = useState<number>(-1);

  const totalScore = useMemo(() => {
    const answered = scores.filter((s) => s >= 0);
    if (answered.length < 7) return null;
    return answered.reduce((sum, s) => sum + s, 0);
  }, [scores]);

  const severity: IPSSSeverityRange | null = useMemo(
    () => (totalScore != null ? classifyIPSS(totalScore) : null),
    [totalScore],
  );

  const allAnswered = scores.every((s) => s >= 0) && qolScore >= 0;

  const handleScoreChange = (questionIndex: number, value: number) => {
    setScores((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    if (!allAnswered || totalScore == null) return;
    onSubmit({
      scores,
      qolScore,
      totalScore,
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Score bar ──────────────────────────────────────── */}
      <div className="p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500">
            Puntuación IPSS
          </p>
          {totalScore != null && severity && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                color: severity.color,
                backgroundColor: `${severity.color}15`,
              }}
            >
              {totalScore}/35 — {severity.label}
            </span>
          )}
        </div>

        {/* Visual bar */}
        <div className="relative h-3 rounded-full overflow-hidden bg-gray-100">
          {IPSS_SEVERITY_RANGES.map((range) => {
            const startPct = (range.min / 35) * 100;
            const widthPct = ((range.max - range.min + 1) / 35) * 100;
            return (
              <div
                key={range.level}
                className="absolute top-0 h-full opacity-30"
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: range.color,
                }}
              />
            );
          })}
          {totalScore != null && (
            <div
              className="absolute top-0 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(totalScore / 35) * 100}%`,
                backgroundColor: severity?.color ?? themeColor,
              }}
            />
          )}
        </div>

        <div className="flex justify-between mt-1">
          {IPSS_SEVERITY_RANGES.map((range) => (
            <span
              key={range.level}
              className="text-[10px]"
              style={{ color: range.color }}
            >
              {range.label} ({range.min}-{range.max})
            </span>
          ))}
        </div>
      </div>

      {/* ── Comparison with previous ────────────────────── */}
      {previousAssessment && totalScore != null && (
        <div
          className={cn(
            'p-3 rounded-lg border text-xs',
            totalScore < previousAssessment.totalScore
              ? 'bg-green-50 border-green-100 text-green-700'
              : totalScore > previousAssessment.totalScore
                ? 'bg-red-50 border-red-100 text-red-700'
                : 'bg-gray-50 border-gray-100 text-gray-600',
          )}
        >
          <span className="font-medium">Comparación: </span>
          Anterior: {previousAssessment.totalScore}/35
          {' → '}
          Actual: {totalScore}/35
          {totalScore < previousAssessment.totalScore && ' (mejoría)'}
          {totalScore > previousAssessment.totalScore && ' (empeoramiento)'}
          {totalScore === previousAssessment.totalScore && ' (sin cambios)'}
        </div>
      )}

      {/* ── Symptom questions ───────────────────────────── */}
      <div className="space-y-4">
        {IPSS_QUESTIONS.map((question, qi) => (
          <div key={question.id} className="p-3 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-700 mb-2">
              <span
                className="inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold text-white mr-2"
                style={{ backgroundColor: themeColor }}
              >
                {question.id}
              </span>
              {question.text}
            </p>
            <div className="grid grid-cols-6 gap-1">
              {question.options.map((option, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => handleScoreChange(qi, oi)}
                  className={cn(
                    'text-[10px] leading-tight p-1.5 rounded-lg border text-center transition-colors min-h-[44px] flex items-center justify-center',
                    scores[qi] === oi
                      ? 'text-white border-transparent font-medium'
                      : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  )}
                  style={
                    scores[qi] === oi
                      ? { backgroundColor: themeColor }
                      : undefined
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quality of Life question ────────────────────── */}
      <div className="p-3 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700 mb-2 font-medium">
          Calidad de vida
        </p>
        <p className="text-xs text-gray-500 mb-3">
          {IPSS_QOL_QUESTION.text}
        </p>
        <div className="grid grid-cols-7 gap-1">
          {IPSS_QOL_QUESTION.options.map((option, oi) => (
            <button
              key={oi}
              type="button"
              onClick={() => setQolScore(oi)}
              className={cn(
                'text-[10px] leading-tight p-1.5 rounded-lg border text-center transition-colors min-h-[44px] flex items-center justify-center',
                qolScore === oi
                  ? 'text-white border-transparent font-medium'
                  : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              )}
              style={
                qolScore === oi
                  ? { backgroundColor: themeColor }
                  : undefined
              }
            >
              {option}
            </button>
          ))}
        </div>
        {qolScore >= 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Calidad de vida: <span className="font-medium">{QOL_LABELS[qolScore]}</span> ({qolScore}/6)
          </p>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-medium px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="text-xs font-medium px-4 py-2 text-white rounded-lg disabled:opacity-50"
          style={{ backgroundColor: themeColor }}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar IPSS'}
        </button>
      </div>
    </div>
  );
}
