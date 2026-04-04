'use client';

import { Printer } from 'lucide-react';
import {
  VACCINATION_SCHEDULE,
  VACCINE_SITE_LABELS,
  VACCINE_ROUTE_LABELS,
  formatAge,
  type VaccineScheduleEntry,
} from './vaccination-schedule';
import type { VaccinationRecord } from './use-vaccinations';

// ============================================================================
// TYPES
// ============================================================================

interface VaccinationCardProps {
  patientName: string;
  patientDob?: string;
  patientSex?: 'male' | 'female';
  records: VaccinationRecord[];
  themeColor?: string;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function VaccinationCard({
  patientName,
  patientDob,
  patientSex,
  records,
  themeColor = '#22c55e',
  onClose,
}: VaccinationCardProps) {
  const handlePrint = () => {
    window.print();
  };

  // Group records by vaccine_id + dose for quick lookup
  const recordMap = new Map<string, VaccinationRecord>();
  for (const r of records) {
    recordMap.set(`${r.vaccine_id}-${r.dose_number}`, r);
  }

  // Filter vaccines by sex
  const applicableVaccines = VACCINATION_SCHEDULE.filter(
    (entry) => !entry.sexRestriction || entry.sexRestriction === patientSex,
  );

  return (
    <div className="space-y-4">
      {/* Header actions (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <h3 className="text-sm font-semibold text-gray-700">
          Carnet de Vacunación
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
            style={{ backgroundColor: themeColor }}
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* ── Printable card ─────────────────────────────────────────── */}
      <div className="border border-gray-200 rounded-lg overflow-hidden print:border-2 print:border-gray-400">
        {/* Card header */}
        <div
          className="px-4 py-3 text-white print:text-black print:bg-gray-100"
          style={{ backgroundColor: themeColor }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold print:text-sm">
                Carnet de Vacunación
              </h2>
              <p className="text-xs opacity-90 print:opacity-100">
                República Bolivariana de Venezuela
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium opacity-90 print:opacity-100">
                Red Salud
              </p>
            </div>
          </div>
        </div>

        {/* Patient info */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Nombre
            </p>
            <p className="text-sm font-semibold text-gray-700">{patientName}</p>
          </div>
          {patientDob && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Fecha de nacimiento
              </p>
              <p className="text-sm font-medium text-gray-600">
                {new Date(patientDob).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
          {patientSex && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Sexo
              </p>
              <p className="text-sm font-medium text-gray-600">
                {patientSex === 'male' ? 'Masculino' : 'Femenino'}
              </p>
            </div>
          )}
        </div>

        {/* Vaccine table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-[180px]">
                  Vacuna
                </th>
                <th className="text-center px-2 py-2 font-semibold text-gray-600 w-[70px]">
                  Dosis
                </th>
                <th className="text-center px-2 py-2 font-semibold text-gray-600 w-[80px]">
                  Edad rec.
                </th>
                <th className="text-center px-2 py-2 font-semibold text-gray-600 w-[90px]">
                  Fecha
                </th>
                <th className="text-center px-2 py-2 font-semibold text-gray-600 w-[80px]">
                  Lote
                </th>
                <th className="text-center px-2 py-2 font-semibold text-gray-600 w-[80px]">
                  Sitio
                </th>
                <th className="text-center px-2 py-2 font-semibold text-gray-600 w-[60px]">
                  Vía
                </th>
              </tr>
            </thead>
            <tbody>
              {applicableVaccines.map((entry) =>
                entry.doses.map((dose, doseIdx) => {
                  const record = recordMap.get(
                    `${entry.id}-${dose.doseNumber}`,
                  );
                  const isFirst = doseIdx === 0;

                  return (
                    <tr
                      key={`${entry.id}-${dose.doseNumber}`}
                      className="border-b border-gray-100 hover:bg-gray-50/50"
                    >
                      {/* Vaccine name (merged row) */}
                      {isFirst ? (
                        <td
                          className="px-3 py-2 font-medium text-gray-700 border-r border-gray-100"
                          rowSpan={entry.doses.length}
                        >
                          {entry.vaccine}
                          {entry.note && (
                            <span className="block text-[10px] text-gray-400 mt-0.5">
                              {entry.note}
                            </span>
                          )}
                        </td>
                      ) : null}

                      {/* Dose */}
                      <td className="px-2 py-2 text-center text-gray-600">
                        {dose.label}
                      </td>

                      {/* Recommended age */}
                      <td className="px-2 py-2 text-center text-gray-400">
                        {formatAge(dose.ageMonths)}
                      </td>

                      {/* Date administered */}
                      <td className="px-2 py-2 text-center">
                        {record ? (
                          <span className="font-medium text-gray-700">
                            {new Date(record.date_administered).toLocaleDateString(
                              'es-VE',
                              { day: '2-digit', month: '2-digit', year: 'numeric' },
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-300">___/___/______</span>
                        )}
                      </td>

                      {/* Lot */}
                      <td className="px-2 py-2 text-center text-gray-500">
                        {record?.lot_number ?? (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Site */}
                      <td className="px-2 py-2 text-center text-gray-500">
                        {record?.site
                          ? VACCINE_SITE_LABELS[record.site] ?? record.site
                          : <span className="text-gray-300">—</span>}
                      </td>

                      {/* Route */}
                      <td className="px-2 py-2 text-center text-gray-500">
                        {record?.route
                          ? VACCINE_ROUTE_LABELS[record.route] ?? record.route
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-[10px] text-gray-400">
            Esquema de Vacunación PAI — Venezuela
          </p>
          <p className="text-[10px] text-gray-400">
            Generado: {new Date().toLocaleDateString('es-VE')}
          </p>
        </div>
      </div>
    </div>
  );
}
