'use client';

import { useMemo } from 'react';
import { Printer } from 'lucide-react';
import { cn } from '@red-salud/core/utils';
import type { Pregnancy, PrenatalVisit, GestationalAge } from './use-prenatal';

// ============================================================================
// TYPES
// ============================================================================

interface PrenatalCardProps {
  pregnancy: Pregnancy;
  visits: PrenatalVisit[];
  gestationalAge: GestationalAge | null;
  patientName?: string;
  patientCedula?: string;
  patientDateOfBirth?: string;
  doctorName?: string;
  themeColor?: string;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const PRESENTATION_LABELS: Record<string, string> = {
  cephalic: 'Cef',
  breech: 'Pod',
  transverse: 'Transv',
  oblique: 'Obl',
  undetermined: 'ND',
};

const RISK_LABELS: Record<string, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};

const RISK_COLORS: Record<string, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PrenatalCard({
  pregnancy,
  visits,
  gestationalAge,
  patientName = 'Paciente',
  patientCedula,
  patientDateOfBirth,
  doctorName,
  themeColor = '#ec4899',
  className,
}: PrenatalCardProps) {
  const sortedVisits = useMemo(
    () => [...visits].sort((a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()),
    [visits],
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-xl p-6 relative print:border-black print:shadow-none',
        className,
      )}
    >
      {/* Print button */}
      <button
        type="button"
        onClick={handlePrint}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors print:hidden"
        title="Imprimir carnet"
      >
        <Printer className="h-4 w-4" />
      </button>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="text-center mb-6 print:mb-4">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
          Carnet de Control Prenatal
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Historia Perinatal — Venezuela
        </p>
        <div
          className="h-0.5 w-16 mx-auto mt-2 rounded-full"
          style={{ backgroundColor: themeColor }}
        />
      </div>

      {/* ── Patient demographics ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100 print:bg-white print:border-gray-300">
        <div>
          <p className="text-[10px] text-gray-400 uppercase">Nombre</p>
          <p className="text-sm font-medium text-gray-700">{patientName}</p>
        </div>
        {patientCedula && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Cédula</p>
            <p className="text-sm font-medium text-gray-700">{patientCedula}</p>
          </div>
        )}
        {patientDateOfBirth && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Fecha Nac.</p>
            <p className="text-sm font-medium text-gray-700">{formatDate(patientDateOfBirth)}</p>
          </div>
        )}
        {doctorName && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Médico</p>
            <p className="text-sm font-medium text-gray-700">{doctorName}</p>
          </div>
        )}
      </div>

      {/* ── Obstetric history ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center print:bg-white print:border-gray-300">
          <p className="text-[10px] text-gray-400 uppercase">FUR</p>
          <p className="text-sm font-bold text-gray-700">{formatDate(pregnancy.lmp_date)}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center print:bg-white print:border-gray-300">
          <p className="text-[10px] text-gray-400 uppercase">FPP</p>
          <p className="text-sm font-bold text-gray-700">{formatDate(pregnancy.edd)}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center print:bg-white print:border-gray-300">
          <p className="text-[10px] text-gray-400 uppercase">EG Actual</p>
          <p className="text-sm font-bold text-gray-700">
            {gestationalAge
              ? `${gestationalAge.weeks}+${gestationalAge.days}`
              : '—'}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center print:bg-white print:border-gray-300">
          <p className="text-[10px] text-gray-400 uppercase">Fórmula Obstétrica</p>
          <p className="text-sm font-bold text-gray-700">
            G{pregnancy.gravida}P{pregnancy.para}A{pregnancy.abortos}C{pregnancy.cesareas}V{pregnancy.vivos}
          </p>
        </div>
        <div className="p-3 rounded-lg border text-center print:border-gray-300" style={{ backgroundColor: `${RISK_COLORS[pregnancy.risk_level]}10`, borderColor: `${RISK_COLORS[pregnancy.risk_level]}30` }}>
          <p className="text-[10px] text-gray-400 uppercase">Riesgo</p>
          <p className="text-sm font-bold" style={{ color: RISK_COLORS[pregnancy.risk_level] }}>
            {RISK_LABELS[pregnancy.risk_level]}
          </p>
        </div>
      </div>

      {/* Blood type & Rh */}
      {(pregnancy.blood_type || pregnancy.rh_factor) && (
        <div className="flex items-center gap-4 mb-6">
          {pregnancy.blood_type && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">Grupo:</span>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                {pregnancy.blood_type}
              </span>
            </div>
          )}
          {pregnancy.rh_factor && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">Rh:</span>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded',
                  pregnancy.rh_factor === 'negative'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700',
                )}
              >
                {pregnancy.rh_factor === 'negative' ? 'Negativo' : 'Positivo'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Visit-by-visit table ─────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 print:border-gray-400">
              <th className="text-left py-2 px-1.5 text-gray-500 font-medium">Fecha</th>
              <th className="text-center py-2 px-1.5 text-gray-500 font-medium">EG</th>
              <th className="text-center py-2 px-1.5 text-gray-500 font-medium">Peso</th>
              <th className="text-center py-2 px-1.5 text-gray-500 font-medium">TA</th>
              <th className="text-center py-2 px-1.5 text-gray-500 font-medium">AU</th>
              <th className="text-center py-2 px-1.5 text-gray-500 font-medium">FCF</th>
              <th className="text-center py-2 px-1.5 text-gray-500 font-medium">Pres.</th>
              <th className="text-center py-2 px-1.5 text-gray-500 font-medium">Mov.</th>
              <th className="text-center py-2 px-1.5 text-gray-500 font-medium">Hb</th>
              <th className="text-left py-2 px-1.5 text-gray-500 font-medium">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedVisits.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-6 text-center text-gray-400">
                  Sin controles registrados
                </td>
              </tr>
            ) : (
              sortedVisits.map((visit) => {
                // BP warning
                const bpWarning =
                  (visit.blood_pressure_systolic != null && visit.blood_pressure_systolic >= 140) ||
                  (visit.blood_pressure_diastolic != null && visit.blood_pressure_diastolic >= 90);
                // FHR warning
                const fhrWarning =
                  visit.fetal_heart_rate != null &&
                  (visit.fetal_heart_rate < 120 || visit.fetal_heart_rate > 160);

                return (
                  <tr
                    key={visit.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors print:border-gray-300"
                  >
                    <td className="py-2 px-1.5 text-gray-700 whitespace-nowrap">
                      {new Date(visit.visit_date).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </td>
                    <td className="py-2 px-1.5 text-center text-gray-700">
                      {visit.gestational_weeks}+{visit.gestational_days}
                    </td>
                    <td className="py-2 px-1.5 text-center text-gray-700">
                      {visit.weight_kg != null ? `${visit.weight_kg}` : '—'}
                    </td>
                    <td
                      className={cn(
                        'py-2 px-1.5 text-center font-medium',
                        bpWarning ? 'text-red-600' : 'text-gray-700',
                      )}
                    >
                      {visit.blood_pressure_systolic != null && visit.blood_pressure_diastolic != null
                        ? `${visit.blood_pressure_systolic}/${visit.blood_pressure_diastolic}`
                        : '—'}
                    </td>
                    <td className="py-2 px-1.5 text-center text-gray-700">
                      {visit.fundal_height_cm != null ? `${visit.fundal_height_cm}` : '—'}
                    </td>
                    <td
                      className={cn(
                        'py-2 px-1.5 text-center font-medium',
                        fhrWarning ? 'text-red-600' : 'text-gray-700',
                      )}
                    >
                      {visit.fetal_heart_rate != null ? `${visit.fetal_heart_rate}` : '—'}
                    </td>
                    <td className="py-2 px-1.5 text-center text-gray-500">
                      {visit.fetal_presentation
                        ? PRESENTATION_LABELS[visit.fetal_presentation] ?? visit.fetal_presentation
                        : '—'}
                    </td>
                    <td className="py-2 px-1.5 text-center text-gray-500">
                      {visit.fetal_movements
                        ? visit.fetal_movements === 'present_normal'
                          ? '+'
                          : visit.fetal_movements === 'absent'
                            ? '—'
                            : '~'
                        : '—'}
                    </td>
                    <td className="py-2 px-1.5 text-center text-gray-700">
                      {visit.hemoglobin != null ? `${visit.hemoglobin}` : '—'}
                    </td>
                    <td className="py-2 px-1.5 text-gray-500 max-w-[150px] truncate">
                      {visit.notes ?? visit.plan ?? '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 print:border-gray-300">
        <span>{sortedVisits.length} control{sortedVisits.length !== 1 ? 'es' : ''} registrado{sortedVisits.length !== 1 ? 's' : ''}</span>
        <span>
          Generado: {new Date().toLocaleDateString('es-VE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}
