"use client";

import {
  ArrowLeft,
  CalendarPlus,
  Stethoscope,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { MedicalReferral } from "@/lib/services/medical-referral-service";

// ── Props ─────────────────────────────────────────────────────────────

interface BookFromReferralProps {
  referral: MedicalReferral;
  onBack: () => void;
}

// ── Component ─────────────────────────────────────────────────────────

export function BookFromReferral({ referral, onBack }: BookFromReferralProps) {
  const router = useRouter();

  const referringName = `Dr. ${referral.referring_doctor.profile.first_name} ${referral.referring_doctor.profile.last_name}`;
  const referringSpecialty = referral.referring_doctor.specialty.name;

  const specialistName = referral.specialist
    ? `Dr. ${referral.specialist.profile.first_name} ${referral.specialist.profile.last_name}`
    : null;
  const specialistAvatar = referral.specialist?.profile.avatar_url ?? null;
  const targetSpecialty = referral.target_specialty.name;

  const handleBookDirectly = () => {
    if (referral.specialist) {
      // Navigate to booking with pre-selected specialist
      const params = new URLSearchParams({
        doctor_id: referral.specialist.id,
        referral_id: referral.id,
        specialty: referral.target_specialty.name,
      });
      router.push(`/dashboard/agendar?${params.toString()}`);
    }
  };

  const handleSearchSpecialists = () => {
    // Navigate to search pre-filtered by the target specialty
    const params = new URLSearchParams({
      specialty_id: referral.specialty_id,
      referral_id: referral.id,
    });
    router.push(`/dashboard/buscar-medico?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Agendar desde referencia
          </h2>
          <p className="text-sm text-gray-500">
            Referido por {referringName} — {referringSpecialty}
          </p>
        </div>
      </div>

      {/* Referral context banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-900">
              Referencia medica activa
            </p>
            <p className="text-sm text-emerald-700 mt-0.5">
              {referral.reason}
            </p>
            {referral.diagnosis && (
              <p className="text-xs text-emerald-600 mt-1">
                Diagnostico: {referral.diagnosis}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Specialist card (if assigned) */}
      {referral.specialist && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Especialista referido
          </p>
          <div className="flex items-center gap-4">
            {specialistAvatar ? (
              <Image
                src={specialistAvatar}
                alt={specialistName ?? ""}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-lg font-semibold">
                {referral.specialist.profile.first_name?.[0] ?? ""}
                {referral.specialist.profile.last_name?.[0] ?? ""}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900">
                {specialistName}
              </p>
              <p className="text-sm text-gray-500">{targetSpecialty}</p>
              {referral.specialist.consultation_fee !== null && (
                <p className="text-sm font-medium text-emerald-600 mt-0.5">
                  Consulta: $
                  {referral.specialist.consultation_fee?.toLocaleString(
                    "es-VE",
                  )}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleBookDirectly}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
          >
            <CalendarPlus className="h-4 w-4" />
            Agendar con {specialistName}
          </button>
        </div>
      )}

      {/* Search other specialists */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shrink-0">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {referral.specialist
                ? "Preferis otro especialista?"
                : `Buscar especialista en ${targetSpecialty}`}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {referral.specialist
                ? `Busca otros especialistas en ${targetSpecialty} disponibles.`
                : "Tu medico no asigno un especialista puntual. Busca entre los disponibles."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearchSpecialists}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Buscar especialistas en {targetSpecialty}
        </button>
      </div>

      {/* Info notice */}
      <div className="rounded-xl bg-gray-50 p-4 text-center">
        <p className="text-xs text-gray-500">
          Al agendar desde una referencia, el especialista recibira el contexto
          medico de tu consulta anterior para una mejor atencion.
        </p>
      </div>
    </div>
  );
}
