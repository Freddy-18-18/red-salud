"use client";

import {
  Droplets,
  AlertTriangle,
  Pill,
  Activity,
  Phone,
  Shield,
  Heart,
  Clock,
  User,
} from "lucide-react";

import type { PublicEmergencyProfile } from "@/lib/services/emergency-profile-service";

// --- Types ---

interface PublicProfileViewProps {
  profile: PublicEmergencyProfile;
}

// --- Severity detection for allergies ---

const SEVERE_KEYWORDS = [
  "penicilina",
  "sulfa",
  "latex",
  "yodo",
  "mariscos",
  "mani",
  "cacahuate",
  "nueces",
  "anafilax",
  "severa",
  "grave",
  "critica",
];

function getAllergySeverity(
  allergy: string,
): "severe" | "moderate" | "mild" {
  const lower = allergy.toLowerCase();
  if (SEVERE_KEYWORDS.some((kw) => lower.includes(kw))) return "severe";
  if (lower.includes("moderada") || lower.includes("importante"))
    return "moderate";
  return "mild";
}

// --- Component ---

export function PublicProfileView({ profile }: PublicProfileViewProps) {
  const hasAllergies =
    profile.allergies && profile.allergies.length > 0;
  const hasMedications =
    profile.medications && profile.medications.length > 0;
  const hasConditions =
    profile.conditions && profile.conditions.length > 0;
  const hasContacts =
    profile.emergency_contacts && profile.emergency_contacts.length > 0;
  const hasInsurance = !!profile.insurance;

  return (
    <div className="min-h-screen bg-white">
      {/* Emergency header */}
      <header className="bg-gradient-to-b from-red-600 to-red-700 text-white px-4 pt-6 pb-8 text-center relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Medical cross icon */}
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 text-white"
              fill="currentColor"
            >
              <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold tracking-tight">
            Perfil Medico de Emergencia
          </h1>

          <div className="flex items-center justify-center gap-2 mt-3">
            <User className="h-4 w-4 opacity-80" />
            <span className="text-lg font-semibold">
              {profile.full_name}
            </span>
          </div>

          {profile.age != null && (
            <p className="text-red-100 text-sm mt-1">
              {profile.age} anos
            </p>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 space-y-4">
        {/* Blood type — prominent */}
        {profile.blood_type && (
          <div className="bg-white rounded-2xl shadow-md border border-red-100 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Droplets className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Grupo sanguineo
              </p>
              <p className="text-2xl font-black text-red-600 mt-0.5">
                {profile.blood_type}
              </p>
            </div>
          </div>
        )}

        {/* Allergies — high priority, danger styling */}
        {hasAllergies && (
          <section className="bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
              <h2 className="text-sm font-bold text-red-800 uppercase tracking-wider">
                Alergias
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {profile.allergies!.map((allergy, i) => {
                const severity = getAllergySeverity(allergy);
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      severity === "severe"
                        ? "bg-red-50 border border-red-200"
                        : severity === "moderate"
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold flex-1 ${
                        severity === "severe"
                          ? "text-red-800"
                          : severity === "moderate"
                            ? "text-orange-800"
                            : "text-yellow-800"
                      }`}
                    >
                      {allergy}
                    </span>
                    {severity === "severe" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                        Severa
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Current medications */}
        {hasMedications && (
          <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <Pill className="h-4.5 w-4.5 text-blue-600" />
              <h2 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                Medicamentos actuales
              </h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {profile.medications!.map((med, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50/50 rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">
                      {med}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Chronic conditions */}
        {hasConditions && (
          <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-amber-600" />
              <h2 className="text-sm font-bold text-amber-800 uppercase tracking-wider">
                Condiciones cronicas
              </h2>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {profile.conditions!.map((condition, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded-lg"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Emergency contacts — with click-to-call */}
        {hasContacts && (
          <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
              <Phone className="h-4.5 w-4.5 text-emerald-600" />
              <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
                Contactos de emergencia
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {profile.emergency_contacts!.map((contact, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {contact.name}
                    </p>
                    {contact.relationship && (
                      <p className="text-xs text-gray-500">
                        {contact.relationship}
                      </p>
                    )}
                  </div>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition active:scale-95"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Llamar
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Insurance */}
        {hasInsurance && (
          <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-indigo-600" />
              <h2 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">
                Seguro medico
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {profile.insurance!.company}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Poliza: {profile.insurance!.policy_number}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Timestamp */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-2">
          <Clock className="h-3 w-3" />
          <span>
            Consultado el{" "}
            {new Date().toLocaleDateString("es-VE", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Footer branding */}
        <footer className="text-center pt-4 pb-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Heart className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs font-semibold text-gray-500">
              Generado por Red Salud
            </span>
          </div>
          <p className="text-[10px] text-gray-400">
            red-salud.org — Tu salud en un solo lugar
          </p>
        </footer>
      </div>
    </div>
  );
}

// --- Not found view ---

export function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* Medical cross icon — muted */}
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 text-gray-300"
            fill="currentColor"
          >
            <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Perfil no encontrado
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Este perfil medico de emergencia no existe, fue desactivado por el
          paciente, o el enlace es incorrecto.
        </p>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition"
        >
          Ir a Red Salud
        </a>
      </div>

      <footer className="absolute bottom-6 text-center">
        <p className="text-[10px] text-gray-400">
          red-salud.org — Tu salud en un solo lugar
        </p>
      </footer>
    </div>
  );
}
