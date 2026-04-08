'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Bot, AlertTriangle, Info } from 'lucide-react';
import { Button, Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface AiFinding {
  id: string;
  anomaly: string;
  confidence: number;
  location: string | null;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string | null;
}

export interface AiAnalysis {
  model: string;
  analyzed_at: string;
  findings: AiFinding[];
  summary: string | null;
}

type FindingValidation = 'confirmed' | 'discarded' | null;

interface AiFindingsPanelProps {
  aiAnalysis: AiAnalysis;
  onValidateFinding?: (findingId: string, validation: 'confirmed' | 'discarded') => void;
  themeColor?: string;
}

// ============================================================================
// SEVERITY CONFIG
// ============================================================================

const SEVERITY_CONFIG: Record<string, { label: string; color: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Bajo', color: 'text-gray-600', badgeVariant: 'secondary' },
  moderate: { label: 'Moderado', color: 'text-amber-600', badgeVariant: 'secondary' },
  high: { label: 'Alto', color: 'text-orange-600', badgeVariant: 'default' },
  critical: { label: 'Crítico', color: 'text-red-600', badgeVariant: 'destructive' },
};

// ============================================================================
// CONFIDENCE BAR
// ============================================================================

function ConfidenceBar({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const color =
    percentage >= 90
      ? 'bg-emerald-500'
      : percentage >= 70
        ? 'bg-amber-500'
        : 'bg-red-500';

  const textColor =
    percentage >= 90
      ? 'text-emerald-700'
      : percentage >= 70
        ? 'text-amber-700'
        : 'text-red-700';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn('text-xs font-medium tabular-nums', textColor)}>
        {percentage}%
      </span>
    </div>
  );
}

// ============================================================================
// FINDING CARD
// ============================================================================

function FindingCard({
  finding,
  validation,
  onConfirm,
  onDiscard,
}: {
  finding: AiFinding;
  validation: FindingValidation;
  onConfirm: () => void;
  onDiscard: () => void;
}) {
  const severityCfg = SEVERITY_CONFIG[finding.severity] ?? SEVERITY_CONFIG.low;

  return (
    <div
      className={cn(
        'rounded-lg border p-3 space-y-2 transition-colors',
        validation === 'confirmed'
          ? 'border-emerald-200 bg-emerald-50/50'
          : validation === 'discarded'
            ? 'border-gray-200 bg-gray-50 opacity-60'
            : 'border-gray-200 bg-white',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {finding.anomaly}
          </p>
          {finding.location && (
            <p className="text-xs text-gray-400 mt-0.5">
              Ubicación: {finding.location}
            </p>
          )}
        </div>
        <Badge variant={severityCfg.badgeVariant} className="text-[10px] shrink-0">
          {severityCfg.label}
        </Badge>
      </div>

      {/* Confidence */}
      <ConfidenceBar confidence={finding.confidence} />

      {/* Description */}
      {finding.description && (
        <p className="text-xs text-gray-500 leading-relaxed">
          {finding.description}
        </p>
      )}

      {/* Validation buttons */}
      {validation === null && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            onClick={onConfirm}
          >
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Confirmar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
            onClick={onDiscard}
          >
            <XCircle className="mr-1 h-3.5 w-3.5" />
            Descartar
          </Button>
        </div>
      )}

      {/* Validation status */}
      {validation === 'confirmed' && (
        <p className="flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="h-3 w-3" />
          Confirmado por el médico
        </p>
      )}
      {validation === 'discarded' && (
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <XCircle className="h-3 w-3" />
          Descartado por el médico
        </p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AiFindingsPanel({
  aiAnalysis,
  onValidateFinding,
  themeColor = '#3B82F6',
}: AiFindingsPanelProps) {
  const [validations, setValidations] = useState<Record<string, FindingValidation>>({});

  const handleValidate = useCallback(
    (findingId: string, validation: 'confirmed' | 'discarded') => {
      setValidations((prev) => ({ ...prev, [findingId]: validation }));
      onValidateFinding?.(findingId, validation);
    },
    [onValidateFinding],
  );

  const hasCriticalFindings = aiAnalysis.findings.some(
    (f) => f.severity === 'critical' || f.severity === 'high',
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4" style={{ color: themeColor }} />
        <h4 className="text-sm font-semibold text-gray-700">
          Análisis de IA
        </h4>
        <Badge variant="outline" className="text-[10px]">
          {aiAnalysis.findings.length} hallazgo{aiAnalysis.findings.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Critical alert */}
      {hasCriticalFindings && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed">
            Se detectaron hallazgos de alta severidad. Requiere revisión prioritaria.
          </p>
        </div>
      )}

      {/* Summary */}
      {aiAnalysis.summary && (
        <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-2.5">
          {aiAnalysis.summary}
        </p>
      )}

      {/* Findings list */}
      {aiAnalysis.findings.length === 0 ? (
        <div className="text-center py-6">
          <Info className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Sin hallazgos detectados por IA</p>
        </div>
      ) : (
        <div className="space-y-2">
          {aiAnalysis.findings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              validation={validations[finding.id] ?? null}
              onConfirm={() => handleValidate(finding.id, 'confirmed')}
              onDiscard={() => handleValidate(finding.id, 'discarded')}
            />
          ))}
        </div>
      )}

      {/* Model info */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">
          Modelo: {aiAnalysis.model}
        </p>
        <p className="text-[10px] text-gray-400">
          {new Date(aiAnalysis.analyzed_at).toLocaleString('es-VE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 leading-relaxed">
          Análisis generado por IA. Requiere validación médica. No constituye un diagnóstico definitivo.
        </p>
      </div>
    </div>
  );
}
