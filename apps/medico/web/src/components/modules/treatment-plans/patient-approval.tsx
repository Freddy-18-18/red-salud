'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Send,
  Check,
  X,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  FileSignature,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { Button, Badge } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { TreatmentPlan, TreatmentPlanStatus } from './use-treatment-plans';

// ============================================================================
// TYPES
// ============================================================================

type ApprovalStatus = 'draft' | 'proposed' | 'accepted' | 'cancelled';

interface PaymentOption {
  id: string;
  label: string;
  description: string;
  installments: number;
}

interface PatientApprovalProps {
  plan: TreatmentPlan;
  onPropose: (planId: string) => Promise<boolean>;
  onApprove: (planId: string) => Promise<boolean>;
  onDecline: (planId: string) => Promise<boolean>;
  themeColor?: string;
}

// ============================================================================
// PAYMENT OPTIONS
// ============================================================================

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'single',
    label: 'Pago unico',
    description: 'Cancelar el monto total al inicio del tratamiento',
    installments: 1,
  },
  {
    id: 'two_parts',
    label: '2 cuotas',
    description: '50% al inicio + 50% a mitad del tratamiento',
    installments: 2,
  },
  {
    id: 'three_parts',
    label: '3 cuotas',
    description: 'Pago distribuido en 3 partes iguales segun fases',
    installments: 3,
  },
  {
    id: 'per_phase',
    label: 'Por fase',
    description: 'Pagar al completar cada fase del tratamiento',
    installments: 0, // dynamic
  },
];

// ============================================================================
// STATUS CONFIG
// ============================================================================

const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, {
  label: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
}> = {
  draft: {
    label: 'Borrador',
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
  proposed: {
    label: 'Pendiente de aprobacion',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  accepted: {
    label: 'Aprobado por paciente',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  cancelled: {
    label: 'Rechazado por paciente',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

// ============================================================================
// FORMAT CURRENCY
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PatientApproval({
  plan,
  onPropose,
  onApprove,
  onDecline,
  themeColor = '#3B82F6',
}: PatientApprovalProps) {
  const [selectedPayment, setSelectedPayment] = useState<string>('single');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const status = plan.status as ApprovalStatus;
  const statusCfg = APPROVAL_STATUS_CONFIG[status] ?? APPROVAL_STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.icon;

  const estimatedCost = plan.estimated_cost ?? 0;
  const insuranceCoverage = plan.insurance_coverage ?? 0;
  const patientCost = Math.max(0, estimatedCost - insuranceCoverage);

  // Group items by phase
  const phases = plan.items.reduce<Record<number, typeof plan.items>>((acc, item) => {
    const phase = item.phase ?? 1;
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(item);
    return acc;
  }, {});

  // Canvas drawing
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a1a';
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  }, [isDrawing]);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureData(null);
  }, []);

  // Handlers
  const handlePropose = useCallback(async () => {
    setIsSubmitting(true);
    await onPropose(plan.id);
    setIsSubmitting(false);
  }, [plan.id, onPropose]);

  const handleApprove = useCallback(async () => {
    setIsSubmitting(true);
    await onApprove(plan.id);
    setIsSubmitting(false);
  }, [plan.id, onApprove]);

  const handleDecline = useCallback(async () => {
    setIsSubmitting(true);
    await onDecline(plan.id);
    setIsSubmitting(false);
  }, [plan.id, onDecline]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* ── Status banner ─────────────────────────────────────────── */}
      <div className={cn('flex items-center gap-3 p-3 rounded-lg', statusCfg.bgColor)}>
        <StatusIcon className={cn('h-5 w-5', statusCfg.color)} />
        <span className={cn('text-sm font-medium', statusCfg.color)}>
          {statusCfg.label}
        </span>
      </div>

      {/* ── Plan summary (patient-friendly) ────────────────────── */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {plan.title}
        </h3>
        {plan.description && (
          <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
        )}
        {plan.diagnosis && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Diagnostico:</span> {plan.diagnosis}
            {plan.diagnosis_code && (
              <span className="text-xs text-gray-400 ml-1">({plan.diagnosis_code})</span>
            )}
          </p>
        )}
      </div>

      {/* ── Phases breakdown ───────────────────────────────────── */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Detalle del tratamiento
        </h4>
        {Object.entries(phases)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([phaseNum, phaseItems]) => {
            const phaseCost = phaseItems.reduce(
              (sum, item) => sum + (item.estimated_cost ?? 0),
              0,
            );
            return (
              <div
                key={phaseNum}
                className="border border-gray-100 rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">
                    Fase {phaseNum}
                  </span>
                  {phaseCost > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      {formatCurrency(phaseCost)}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-50">
                  {phaseItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-4 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        {item.duration_days != null && item.duration_days > 0 && (
                          <span className="text-xs text-gray-400">
                            {item.duration_days} dias
                          </span>
                        )}
                        {item.estimated_cost != null && item.estimated_cost > 0 && (
                          <span className="text-xs font-medium text-gray-600">
                            {formatCurrency(item.estimated_cost)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* ── Cost breakdown ─────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Resumen de costos
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Costo estimado total</span>
          <span className="text-sm font-medium text-gray-700">
            {formatCurrency(estimatedCost)}
          </span>
        </div>
        {insuranceCoverage > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Cobertura del seguro</span>
            <span className="text-sm font-medium text-emerald-600">
              -{formatCurrency(insuranceCoverage)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            Total a pagar por el paciente
          </span>
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(patientCost)}
          </span>
        </div>
      </div>

      {/* ── Payment plan options ───────────────────────────────── */}
      {patientCost > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowPaymentOptions(!showPaymentOptions)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3"
          >
            <CreditCard className="h-4 w-4" />
            Opciones de pago
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                showPaymentOptions && 'rotate-180',
              )}
            />
          </button>

          {showPaymentOptions && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((option) => {
                const installmentAmount =
                  option.installments > 0
                    ? patientCost / option.installments
                    : patientCost / Math.max(1, Object.keys(phases).length);
                const isSelected = selectedPayment === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedPayment(option.id)}
                    className={cn(
                      'flex flex-col p-3 rounded-lg border-2 transition-colors text-left',
                      isSelected
                        ? 'border-current bg-opacity-5'
                        : 'border-gray-100 hover:border-gray-200',
                    )}
                    style={isSelected ? { borderColor: themeColor, backgroundColor: `${themeColor}08` } : undefined}
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">
                      {option.description}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 mt-2">
                      {option.installments === 1
                        ? formatCurrency(patientCost)
                        : `${option.installments > 0 ? option.installments : Object.keys(phases).length} x ${formatCurrency(installmentAmount)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Digital signature ──────────────────────────────────── */}
      {(status === 'proposed' || status === 'draft') && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileSignature className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-700">
              Firma del paciente
            </h4>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-2">
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              className="w-full h-[150px] cursor-crosshair bg-white rounded touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                Firme dentro del recuadro
              </p>
              {signatureData && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Borrar firma
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Consent text ───────────────────────────────────────── */}
      {status === 'proposed' && (
        <div className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-lg p-3">
          <p>
            Al firmar y aprobar este plan de tratamiento, el paciente declara haber sido
            informado sobre los procedimientos propuestos, sus posibles riesgos, alternativas
            y costos asociados. El paciente entiende que los costos son estimados y pueden
            variar segun la evolucion del tratamiento. El paciente autoriza al medico tratante
            a realizar los procedimientos descritos en este plan.
          </p>
        </div>
      )}

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-t pt-4 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-1.5 h-4 w-4" />
          Imprimir
        </Button>

        <div className="flex items-center gap-2">
          {/* Draft → Proposed */}
          {status === 'draft' && (
            <Button
              onClick={handlePropose}
              disabled={isSubmitting}
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Enviando...
                </span>
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  Enviar al Paciente
                </>
              )}
            </Button>
          )}

          {/* Proposed → Accepted/Declined */}
          {status === 'proposed' && (
            <>
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={isSubmitting}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="mr-1.5 h-4 w-4" />
                Rechazar
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isSubmitting || !signatureData}
                style={{ backgroundColor: themeColor }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Aprobando...
                  </span>
                ) : (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    Aprobar Plan
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
