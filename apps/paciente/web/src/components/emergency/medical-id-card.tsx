"use client";

import {
  Heart,
  Pill,
  AlertTriangle,
  Droplets,
  Phone,
  User,
  Activity,
} from "lucide-react";

import type { MedicalSummary } from "@/lib/services/emergency-service";

interface MedicalIdCardProps {
  summary: MedicalSummary;
  compact?: boolean;
}

/**
 * Quick-access card that displays critical medical information.
 * Designed to be shown to paramedics during an emergency.
 * Also accessible from the emergency page and patient profile.
 */
export function MedicalIdCard({ summary, compact = false }: MedicalIdCardProps) {
  const hasAllergies = summary.alergias.length > 0;
  const hasConditions = summary.enfermedades_cronicas.length > 0;
  const hasEmergencyContact = summary.contacto_emergencia.nombre;

  if (compact) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <Activity className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{summary.nombre_completo}</p>
            <p className="text-xs text-gray-500">
              {summary.edad ? `${summary.edad} años` : "Edad desconocida"}
              {summary.grupo_sanguineo ? ` · ${summary.grupo_sanguineo}` : ""}
            </p>
          </div>
        </div>

        {hasAllergies && (
          <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700">Alergias</p>
              <p className="text-xs text-red-600">{summary.alergias.join(", ")}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-red-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{summary.nombre_completo}</h3>
            <p className="text-red-100 text-sm">
              {summary.edad ? `${summary.edad} años` : ""}
              {summary.grupo_sanguineo ? ` · Sangre: ${summary.grupo_sanguineo}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Blood type */}
        {summary.grupo_sanguineo && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Droplets className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Grupo sanguíneo</p>
              <p className="text-sm font-bold text-gray-900">{summary.grupo_sanguineo}</p>
            </div>
          </div>
        )}

        {/* Allergies — highlighted */}
        <div className={`rounded-xl p-4 ${hasAllergies ? "bg-red-50 border border-red-100" : "bg-gray-50"}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`h-4 w-4 ${hasAllergies ? "text-red-600" : "text-gray-400"}`} />
            <p className={`text-xs font-semibold ${hasAllergies ? "text-red-700" : "text-gray-500"}`}>
              Alergias
            </p>
          </div>
          {hasAllergies ? (
            <div className="flex flex-wrap gap-1.5">
              {summary.alergias.map((alergia) => (
                <span
                  key={alergia}
                  className="inline-block px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"
                >
                  {alergia}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin alergias conocidas</p>
          )}
        </div>

        {/* Medications */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Pill className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Medicamentos actuales</p>
            <p className="text-sm text-gray-900 mt-0.5">
              {summary.medicamentos_actuales || "Ninguno registrado"}
            </p>
          </div>
        </div>

        {/* Chronic conditions */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Condiciones crónicas</p>
            {hasConditions ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {summary.enfermedades_cronicas.map((cond) => (
                  <span
                    key={cond}
                    className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-full"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-0.5">Ninguna registrada</p>
            )}
          </div>
        </div>

        {/* Emergency contact */}
        {hasEmergencyContact && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Contacto de emergencia</p>
                <p className="text-sm font-semibold text-gray-900">
                  {summary.contacto_emergencia.nombre}
                  {summary.contacto_emergencia.relacion
                    ? ` (${summary.contacto_emergencia.relacion})`
                    : ""}
                </p>
                {summary.contacto_emergencia.telefono && (
                  <a
                    href={`tel:${summary.contacto_emergencia.telefono}`}
                    className="text-sm text-emerald-600 font-medium hover:underline"
                  >
                    {summary.contacto_emergencia.telefono}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center">
          ID MÉDICO · Red-Salud · Información para personal de emergencia
        </p>
      </div>
    </div>
  );
}
