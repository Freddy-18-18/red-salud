'use client';

import { useState, useMemo, useCallback } from 'react';
import { Save, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import {
  type ScaleDefinition,
  type ScaleQuestion,
  calculateTotalScore,
  getSeverityBand,
  hasSuicideRisk,
  getCompletionPercent,
} from './psychiatric-scales-data';

// ============================================================================
// TYPES
// ============================================================================

interface ScaleQuestionnaireProps {
  scale: ScaleDefinition;
  initialResponses?: Record<string, number>;
  onSubmit: (responses: Record<string, number>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  themeColor?: string;
}

// ============================================================================
// SUICIDE RISK ALERT
// ============================================================================

function SuicideRiskAlert({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl border-2 border-red-500 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-700">
              ALERTA: Riesgo Suicida Detectado
            </h3>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-700">
            El paciente ha indicado respuestas positivas en preguntas de
            evaluación de riesgo suicida. Se requiere:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 ml-4">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              Evaluación clínica inmediata del riesgo
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              Documentar plan de seguridad
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              Considerar referencia a psiquiatría de emergencia si es necesario
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              No dejar al paciente solo hasta completar evaluación
            </li>
          </ul>
        </div>

        <Button
          onClick={onDismiss}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Entendido — Proceder con evaluación
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// QUESTION ITEM
// ============================================================================

function QuestionItem({
  question,
  index,
  value,
  onChange,
  themeColor,
}: {
  question: ScaleQuestion;
  index: number;
  value: number | undefined;
  onChange: (questionId: string, value: number) => void;
  themeColor: string;
}) {
  const isRiskQuestion = question.isSuicideRisk;
  const hasPositiveRisk = isRiskQuestion && value !== undefined && value > 0;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-colors',
        hasPositiveRisk
          ? 'border-red-300 bg-red-50'
          : isRiskQuestion
            ? 'border-red-200 bg-red-50/30'
            : value !== undefined
              ? 'border-gray-200 bg-gray-50/50'
              : 'border-gray-100',
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <span
          className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5',
            hasPositiveRisk
              ? 'bg-red-600 text-white'
              : isRiskQuestion
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-500',
          )}
        >
          {index + 1}
        </span>
        <div className="flex-1">
          <p className={cn(
            'text-sm font-medium',
            hasPositiveRisk ? 'text-red-800' : 'text-gray-700',
          )}>
            {question.text}
          </p>
          {isRiskQuestion && (
            <div className="flex items-center gap-1.5 mt-1">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-medium text-red-500">
                Pregunta de tamizaje de riesgo suicida
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 ml-8">
        {question.options.map((option) => {
          // Skip options with empty labels (MADRS intermediate values)
          const showLabel = option.label !== '';
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(question.id, option.value)}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
                isSelected
                  ? hasPositiveRisk
                    ? 'bg-red-600 text-white border-red-600'
                    : 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
              )}
              style={
                isSelected && !hasPositiveRisk
                  ? { backgroundColor: themeColor, borderColor: themeColor }
                  : undefined
              }
              title={showLabel ? undefined : `Valor: ${option.value}`}
            >
              {showLabel ? (
                <>
                  <span className="font-bold mr-1">{option.value}</span>
                  {option.label}
                </>
              ) : (
                option.value
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ScaleQuestionnaire({
  scale,
  initialResponses,
  onSubmit,
  onCancel,
  isSubmitting = false,
  themeColor = '#7C3AED',
}: ScaleQuestionnaireProps) {
  const [responses, setResponses] = useState<Record<string, number>>(
    initialResponses ?? {},
  );
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  // Derived state
  const totalScore = useMemo(
    () => calculateTotalScore(scale.id, responses),
    [scale.id, responses],
  );

  const severityBand = useMemo(
    () => getSeverityBand(scale.id, totalScore),
    [scale.id, totalScore],
  );

  const completionPercent = useMemo(
    () => getCompletionPercent(scale.id, responses),
    [scale.id, responses],
  );

  const suicideRisk = useMemo(
    () => hasSuicideRisk(scale.id, responses),
    [scale.id, responses],
  );

  const isComplete = completionPercent === 100;

  // Handle response change
  const handleResponseChange = useCallback(
    (questionId: string, value: number) => {
      setResponses((prev) => {
        const next = { ...prev, [questionId]: value };

        // Check if this triggered a suicide risk flag
        const question = scale.questions.find((q) => q.id === questionId);
        if (question?.isSuicideRisk && value > 0 && !riskAcknowledged) {
          setShowRiskAlert(true);
        }

        return next;
      });
    },
    [scale.questions, riskAcknowledged],
  );

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!isComplete) return;

    // Show risk alert if not yet acknowledged
    if (suicideRisk && !riskAcknowledged) {
      setShowRiskAlert(true);
      return;
    }

    onSubmit(responses);
  }, [isComplete, suicideRisk, riskAcknowledged, responses, onSubmit]);

  const handleRiskDismiss = useCallback(() => {
    setShowRiskAlert(false);
    setRiskAcknowledged(true);
  }, []);

  return (
    <>
      {/* Suicide risk alert modal */}
      {showRiskAlert && <SuicideRiskAlert onDismiss={handleRiskDismiss} />}

      <div className="space-y-5">
        {/* ── Header info ────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-700">
              {scale.abbreviation} — {scale.name}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {scale.type === 'self-report' ? 'Auto-reporte del paciente' : 'Evaluación del clínico'}
              {' · '}
              {scale.questions.length} ítems · Puntaje máximo: {scale.maxScore}
            </p>
          </div>
        </div>

        {/* ── Progress bar ───────────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Progreso: {Object.keys(responses).length} / {scale.questions.length} ítems
            </span>
            <span className="font-medium" style={{ color: themeColor }}>
              {completionPercent}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completionPercent}%`,
                backgroundColor: suicideRisk ? '#EF4444' : themeColor,
              }}
            />
          </div>
        </div>

        {/* ── Live scoring panel ─────────────────────────────────── */}
        <div
          className={cn(
            'flex items-center justify-between p-3 rounded-lg border',
            suicideRisk
              ? 'border-red-300 bg-red-50'
              : 'border-gray-100 bg-gray-50',
          )}
        >
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-400">Puntaje actual</p>
              <p className="text-2xl font-bold" style={{ color: severityBand?.color ?? '#6B7280' }}>
                {totalScore}
                <span className="text-sm font-normal text-gray-400">/{scale.maxScore}</span>
              </p>
            </div>
            {severityBand && (
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', severityBand.badgeClass)}>
                {severityBand.label}
              </span>
            )}
          </div>

          {suicideRisk && (
            <div className="flex items-center gap-1.5 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-xs font-bold uppercase">Riesgo Suicida</span>
            </div>
          )}
        </div>

        {/* ── Questions ──────────────────────────────────────────── */}
        <div className="space-y-3">
          {scale.questions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              value={responses[question.id]}
              onChange={handleResponseChange}
              themeColor={themeColor}
            />
          ))}
        </div>

        {/* ── Actions ────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="mr-1.5 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isComplete}
            style={{ backgroundColor: isComplete ? themeColor : undefined }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Guardando...
              </span>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Guardar evaluación
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
