'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FileText,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import { Button, Input, Label } from '@red-salud/design-system';
import { cn } from '@red-salud/core/utils';
import type { TelemedicineSession } from './use-telemedicine';

// ============================================================================
// TYPES
// ============================================================================

interface SoapNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface PatientVitals {
  blood_pressure: string;
  heart_rate: string;
  temperature: string;
  respiratory_rate: string;
  oxygen_saturation: string;
  weight: string;
}

interface ConsultationNotesPanelProps {
  session: TelemedicineSession;
  startedAt: string | null;
  onSaveNotes?: (notes: SoapNotes) => void;
  themeColor?: string;
  className?: string;
}

// ============================================================================
// DURATION DISPLAY
// ============================================================================

function SessionTimer({ startedAt }: { startedAt: string | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatted = hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5 text-gray-400" />
      <span className="text-xs font-mono text-gray-600">{formatted}</span>
    </div>
  );
}

// ============================================================================
// COLLAPSIBLE SECTION
// ============================================================================

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="p-3">{children}</div>}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConsultationNotesPanel({
  session,
  startedAt,
  onSaveNotes,
  themeColor = '#3B82F6',
  className,
}: ConsultationNotesPanelProps) {
  // SOAP notes
  const [soap, setSoap] = useState<SoapNotes>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  // Patient-reported vitals
  const [vitals, setVitals] = useState<PatientVitals>({
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSoapChange = useCallback(
    (field: keyof SoapNotes, value: string) => {
      setSoap((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleVitalsChange = useCallback(
    (field: keyof PatientVitals, value: string) => {
      setVitals((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    onSaveNotes?.(soap);
    // Simulate save delay
    await new Promise((r) => setTimeout(r, 500));
    setIsSaving(false);
  }, [soap, onSaveNotes]);

  const textareaClass =
    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground resize-y min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className={cn('space-y-3', className)}>
      {/* ── Session info ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-semibold text-gray-700">
            {session.patient_name ?? 'Paciente'}
          </p>
          {session.reason && (
            <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[200px]">
              Motivo: {session.reason}
            </p>
          )}
        </div>
        <SessionTimer startedAt={startedAt} />
      </div>

      {/* ── SOAP Notes ───────────────────────────────────────────── */}
      <CollapsibleSection
        title="Notas SOAP"
        icon={FileText}
        defaultOpen={true}
      >
        <div className="space-y-3">
          {/* Subjective */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-gray-400">
              S — Subjetivo
            </Label>
            <textarea
              placeholder="Síntomas referidos por el paciente..."
              value={soap.subjective}
              onChange={(e) => handleSoapChange('subjective', e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </div>

          {/* Objective */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-gray-400">
              O — Objetivo
            </Label>
            <textarea
              placeholder="Observaciones clínicas durante la consulta..."
              value={soap.objective}
              onChange={(e) => handleSoapChange('objective', e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </div>

          {/* Assessment */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-gray-400">
              A — Evaluación
            </Label>
            <textarea
              placeholder="Diagnóstico o impresión clínica..."
              value={soap.assessment}
              onChange={(e) => handleSoapChange('assessment', e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </div>

          {/* Plan */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wide text-gray-400">
              P — Plan
            </Label>
            <textarea
              placeholder="Plan terapéutico, indicaciones, exámenes..."
              value={soap.plan}
              onChange={(e) => handleSoapChange('plan', e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Patient-reported vitals ──────────────────────────────── */}
      <CollapsibleSection
        title="Signos Vitales (Reportados)"
        icon={Activity}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="vt_bp" className="text-[10px] text-gray-400">
              TA (mmHg)
            </Label>
            <Input
              id="vt_bp"
              placeholder="120/80"
              value={vitals.blood_pressure}
              onChange={(e) => handleVitalsChange('blood_pressure', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="vt_hr" className="text-[10px] text-gray-400">
              FC (lpm)
            </Label>
            <Input
              id="vt_hr"
              type="number"
              placeholder="72"
              value={vitals.heart_rate}
              onChange={(e) => handleVitalsChange('heart_rate', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="vt_temp" className="text-[10px] text-gray-400">
              Temp. (°C)
            </Label>
            <Input
              id="vt_temp"
              type="number"
              step={0.1}
              placeholder="36.5"
              value={vitals.temperature}
              onChange={(e) => handleVitalsChange('temperature', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="vt_rr" className="text-[10px] text-gray-400">
              FR (rpm)
            </Label>
            <Input
              id="vt_rr"
              type="number"
              placeholder="16"
              value={vitals.respiratory_rate}
              onChange={(e) => handleVitalsChange('respiratory_rate', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="vt_spo2" className="text-[10px] text-gray-400">
              SpO2 (%)
            </Label>
            <Input
              id="vt_spo2"
              type="number"
              placeholder="98"
              value={vitals.oxygen_saturation}
              onChange={(e) => handleVitalsChange('oxygen_saturation', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="vt_weight" className="text-[10px] text-gray-400">
              Peso (kg)
            </Label>
            <Input
              id="vt_weight"
              type="number"
              step={0.1}
              placeholder="70.0"
              value={vitals.weight}
              onChange={(e) => handleVitalsChange('weight', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Save button ──────────────────────────────────────────── */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full h-9 text-xs"
        style={{ backgroundColor: themeColor }}
      >
        {isSaving ? (
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Guardando...
          </span>
        ) : (
          <>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Guardar Notas
          </>
        )}
      </Button>
    </div>
  );
}
