'use client';

import { useState, useCallback } from 'react';
import {
  FileText,
  Eye,
  Stethoscope,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface SoapNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SoapEditorProps {
  value: SoapNotes;
  onChange: (notes: SoapNotes) => void;
  disabled?: boolean;
  themeColor?: string;
}

// ============================================================================
// SOAP SECTION CONFIG
// ============================================================================

const SOAP_SECTIONS = [
  {
    key: 'subjective' as const,
    label: 'Subjetivo (S)',
    description: 'Lo que el paciente reporta: síntomas, historia, molestias',
    icon: FileText,
    placeholder: 'Motivo de consulta, síntomas reportados, historia de enfermedad actual, antecedentes relevantes...',
    color: '#3B82F6',
  },
  {
    key: 'objective' as const,
    label: 'Objetivo (O)',
    description: 'Hallazgos del examen físico, signos vitales, datos medibles',
    icon: Eye,
    placeholder: 'Signos vitales, examen físico, resultados de laboratorio, hallazgos clínicos...',
    color: '#10B981',
  },
  {
    key: 'assessment' as const,
    label: 'Evaluación (A)',
    description: 'Diagnóstico o impresión diagnóstica, razonamiento clínico',
    icon: Stethoscope,
    placeholder: 'Diagnóstico principal, diagnósticos diferenciales, análisis de la condición...',
    color: '#F59E0B',
  },
  {
    key: 'plan' as const,
    label: 'Plan (P)',
    description: 'Tratamiento, órdenes, indicaciones, seguimiento',
    icon: ClipboardList,
    placeholder: 'Medicamentos, exámenes solicitados, referencia a especialistas, fecha de control...',
    color: '#8B5CF6',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function SoapEditor({
  value,
  onChange,
  disabled = false,
  themeColor = '#3B82F6',
}: SoapEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    subjective: true,
    objective: true,
    assessment: true,
    plan: true,
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleChange = useCallback(
    (key: keyof SoapNotes, text: string) => {
      onChange({ ...value, [key]: text });
    },
    [value, onChange],
  );

  return (
    <div className="space-y-3">
      {SOAP_SECTIONS.map((section) => {
        const Icon = section.icon;
        const isExpanded = expandedSections[section.key] ?? true;

        return (
          <div
            key={section.key}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${section.color}15` }}
              >
                <Icon className="h-4 w-4" style={{ color: section.color }} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{section.label}</p>
                <p className="text-xs text-gray-400 truncate">{section.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {value[section.key].length > 0 && (
                  <span className="text-xs text-gray-400">
                    {value[section.key].length} caracteres
                  </span>
                )}
                {isExpanded
                  ? <ChevronUp className="h-4 w-4 text-gray-400" />
                  : <ChevronDown className="h-4 w-4 text-gray-400" />
                }
              </div>
            </button>

            {/* Section content */}
            {isExpanded && (
              <div className="px-4 pb-4">
                <textarea
                  value={value[section.key]}
                  onChange={(e) => handleChange(section.key, e.target.value)}
                  disabled={disabled}
                  placeholder={section.placeholder}
                  rows={4}
                  className={`
                    w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm
                    placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-transparent
                    resize-y min-h-[100px] transition-colors
                    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900'}
                  `}
                  style={{
                    // @ts-expect-error -- CSS custom property for focus ring
                    '--tw-ring-color': `${section.color}40`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
