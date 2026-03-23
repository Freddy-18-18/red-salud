"use client";

import {
  Stethoscope,
  FlaskConical,
  Pill,
  Siren,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  type CoverageDetails,
  type PatientInsurance,
  formatCurrency,
} from "@/lib/services/insurance-service";

interface CoverageDetailProps {
  insurance: PatientInsurance;
  onClose?: () => void;
}

interface CoverageLineItem {
  key: keyof CoverageDetails;
  label: string;
  icon: typeof Stethoscope;
  color: string;
}

const COVERAGE_LINES: CoverageLineItem[] = [
  {
    key: "consultas",
    label: "Consultas",
    icon: Stethoscope,
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "laboratorio",
    label: "Laboratorio",
    icon: FlaskConical,
    color: "bg-purple-50 text-purple-600",
  },
  {
    key: "farmacia",
    label: "Farmacia",
    icon: Pill,
    color: "bg-amber-50 text-amber-600",
  },
  {
    key: "emergencia",
    label: "Emergencia",
    icon: Siren,
    color: "bg-red-50 text-red-600",
  },
  {
    key: "hospitalizacion",
    label: "Hospitalizacion",
    icon: Building2,
    color: "bg-teal-50 text-teal-600",
  },
];

export function CoverageDetail({ insurance, onClose }: CoverageDetailProps) {
  const details = insurance.coverage_details || {};
  const hasCoverageData = Object.keys(details).length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Detalle de Cobertura
          </h3>
          <p className="text-sm text-gray-500">
            {insurance.insurance_company} - {insurance.plan_name}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {!hasCoverageData ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <Info className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            No se han registrado detalles de cobertura para esta poliza.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Puedes agregarlos editando tu seguro.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {COVERAGE_LINES.map((line) => {
            const data = details[line.key];
            if (!data) return null;

            const hasPreauth =
              line.key === "hospitalizacion" &&
              (data as CoverageDetails["hospitalizacion"])
                ?.requires_preauth;

            return (
              <div
                key={line.key}
                className="p-4 bg-white border border-gray-100 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${line.color}`}
                  >
                    <line.icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {line.label}
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pl-12">
                  {data.covered_pct !== undefined && (
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 tracking-wider">
                        Cubierto
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {data.covered_pct}%
                        </span>
                      </div>
                    </div>
                  )}

                  {data.copay !== undefined && data.copay > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 tracking-wider">
                        Copago
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {formatCurrency(data.copay)}
                      </p>
                    </div>
                  )}

                  {data.limit !== undefined && data.limit > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 tracking-wider">
                        Limite
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {formatCurrency(data.limit)}
                      </p>
                    </div>
                  )}
                </div>

                {hasPreauth && (
                  <div className="flex items-center gap-1.5 mt-2 pl-12">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs text-amber-700">
                      Requiere pre-autorizacion
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
