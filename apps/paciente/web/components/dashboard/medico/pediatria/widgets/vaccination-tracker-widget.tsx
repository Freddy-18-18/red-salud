// ============================================
// PEDIATRICS WIDGETS - Vaccination Tracker
// Vaccination coverage and upcoming vaccines
// ============================================

"use client";

import { Syringe, AlertCircle } from "lucide-react";

interface VaccinationTrackerWidgetProps {
  doctorId?: string;
}

interface VaccineData {
  name: string;
  completed: number;
  scheduled: number;
  coverage: number;
  isDue?: boolean;
}

interface UpcomingVaccine {
  patientName: string;
  vaccine: string;
  scheduledDate: string;
}

/**
 * Vaccination Tracker Widget
 *
 * Shows vaccination coverage metrics and upcoming vaccines
 */
export function VaccinationTrackerWidget({ doctorId }: VaccinationTrackerWidgetProps) {
  // Mock data for vaccination coverage
  const vaccines: VaccineData[] = [
    { name: "BCG", completed: 45, scheduled: 48, coverage: 94 },
    { name: "Hepatitis B", completed: 44, scheduled: 47, coverage: 94 },
    { name: "Pentavalente", completed: 42, scheduled: 46, coverage: 91 },
    { name: "Polio (IPV)", completed: 43, scheduled: 46, coverage: 93 },
    { name: "Rotavirus", completed: 40, scheduled: 45, coverage: 89 },
    { name: "Neumococo", completed: 38, scheduled: 42, coverage: 90 },
  ];

  const upcomingVaccines: UpcomingVaccine[] = [
    { patientName: "Lucía Fernández", vaccine: "MMR (12 meses)", scheduledDate: "Hoy" },
    { patientName: "Tomás González", vaccine: "Neumococo (18 meses)", scheduledDate: "Mañana" },
    { patientName: "Valentina Rodríguez", vaccine: "Varicela", scheduledDate: "En 2 días" },
  ];

  return (
    <div className="space-y-4">
      {/* Coverage Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Syringe className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Cobertura de Vacunación</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {vaccines.map((vax) => (
            <div
              key={vax.name}
              className={`p-2 rounded-lg border ${
                vax.coverage >= 90
                  ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                  : vax.coverage >= 80
                    ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
                    : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
              }`}
            >
              <p className="text-xs font-medium">{vax.name}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {vax.completed}/{vax.scheduled}
                </p>
                <span
                  className={`text-xs font-bold ${
                    vax.coverage >= 90
                      ? "text-green-700 dark:text-green-400"
                      : vax.coverage >= 80
                        ? "text-yellow-700 dark:text-yellow-400"
                        : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {vax.coverage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Vaccinations */}
      {upcomingVaccines.length > 0 && (
        <>
          <div className="h-px bg-border my-2" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
              <h4 className="text-xs font-semibold">Próximas Vacunas</h4>
            </div>
            <div className="space-y-1">
              {upcomingVaccines.map((vax, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-medium">{vax.patientName}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-primary">{vax.vaccine}</span>
                  <span className="text-muted-foreground ml-auto">{vax.scheduledDate}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
