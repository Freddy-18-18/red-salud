"use client";

import { CheckCircle2, XCircle, Stethoscope } from "lucide-react";
import type { SecondOpinionRequest } from "@/lib/services/second-opinion-service";

interface DiagnosisComparisonProps {
  request: SecondOpinionRequest;
}

export function DiagnosisComparison({ request }: DiagnosisComparisonProps) {
  const agreesWithOriginal = request.agrees_with_original;

  return (
    <div className="space-y-4">
      {/* Agreement banner */}
      {agreesWithOriginal !== null && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            agreesWithOriginal
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          {agreesWithOriginal ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-amber-600 shrink-0" />
          )}
          <div>
            <p
              className={`font-semibold text-sm ${
                agreesWithOriginal ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {agreesWithOriginal
                ? "El especialista coincide con el diagnostico original"
                : "El especialista tiene un diagnostico diferente"}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                agreesWithOriginal ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {agreesWithOriginal
                ? "Ambos doctores llegaron a la misma conclusion"
                : "Te recomendamos consultar con tu medico original para discutir las diferencias"}
            </p>
          </div>
        </div>
      )}

      {/* Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original diagnosis */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Diagnostico Original
              </h4>
              <p className="text-xs text-gray-500">
                Dr. {request.original_doctor?.nombre_completo || "Doctor"}
              </p>
            </div>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg">
            <p className="text-sm text-gray-800 leading-relaxed">
              {request.original_diagnosis}
            </p>
          </div>
        </div>

        {/* Reviewer diagnosis */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Segunda Opinion
              </h4>
              <p className="text-xs text-gray-500">
                Dr. {request.reviewing_doctor?.nombre_completo || "Revisor"}
              </p>
            </div>
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-lg">
            <p className="text-sm text-gray-800 leading-relaxed">
              {request.reviewer_diagnosis || "Diagnostico no disponible"}
            </p>
          </div>
        </div>
      </div>

      {/* Reviewer's full opinion */}
      {request.reviewer_opinion && (
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Opinion detallada del especialista
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {request.reviewer_opinion}
          </p>
        </div>
      )}
    </div>
  );
}
