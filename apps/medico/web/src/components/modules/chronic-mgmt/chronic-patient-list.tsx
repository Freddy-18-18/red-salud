'use client';

import { Target, UserRound } from 'lucide-react';
import { cn } from '@red-salud/core/utils';

import type { ChronicPatientSummary } from '@/lib/chronic/patient-resolver';

export interface ChronicPatientListProps {
  patients: ChronicPatientSummary[];
  selectedPatientId: string | null;
  onSelect: (patientId: string) => void;
}

export function ChronicPatientList({
  patients,
  selectedPatientId,
  onSelect,
}: ChronicPatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UserRound className="h-10 w-10 text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">Sin pacientes crónicos</p>
        <p className="text-xs text-gray-300 mt-1">
          Agregá una condición a un paciente para que aparezca acá
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {patients.map((p) => {
        const isSelected = p.patient_id === selectedPatientId;
        return (
          <li key={p.patient_id}>
            <button
              type="button"
              onClick={() => onSelect(p.patient_id)}
              aria-current={isSelected ? 'true' : 'false'}
              className={cn(
                'w-full text-left rounded-lg border px-3 py-2.5 transition-colors',
                isSelected
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {p.full_name}
                  </p>
                  {p.cedula && (
                    <p className="text-[11px] text-gray-400">CI {p.cedula}</p>
                  )}
                </div>
                {p.activeGoalsCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                    <Target className="h-3 w-3" />
                    {p.activeGoalsCount} meta{p.activeGoalsCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
