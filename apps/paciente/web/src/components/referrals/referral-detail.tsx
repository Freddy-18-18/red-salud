"use client";

import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  ExternalLink,
  FileText,
  Stethoscope,
  UserRound,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

import { ReferralChain } from "./referral-chain";

import type {
  MedicalReferralDetail as ReferralDetailType,
  ReferralDoctor,
  ReferralStatus,
  ReferralUrgency,
} from "@/lib/services/medical-referral-service";

// ── Config ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: "Pendiente",
  scheduled: "Agendada",
  completed: "Completada",
  expired: "Vencida",
};

const STATUS_STYLES: Record<ReferralStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
};

const URGENCY_STYLES: Record<
  ReferralUrgency,
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  urgente: {
    label: "Urgente",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  prioritario: {
    label: "Prioritario",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  electivo: {
    label: "Electivo",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
};

// ── Props ─────────────────────────────────────────────────────────────

interface ReferralDetailProps {
  referral: ReferralDetailType;
  onBack: () => void;
  onBook: (referral: ReferralDetailType) => void;
  onViewProfile: (doctorId: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DoctorProfileCard({
  doctor,
  label,
  onViewProfile,
}: {
  doctor: ReferralDoctor;
  label: string;
  onViewProfile: (doctorId: string) => void;
}) {
  const fullName = `Dr. ${doctor.profile.first_name} ${doctor.profile.last_name}`;
  const avatarUrl = doctor.profile.avatar_url;
  const initials =
    (doctor.profile.first_name?.[0] ?? "") +
    (doctor.profile.last_name?.[0] ?? "");

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        {label}
      </p>
      <div className="flex items-start gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={fullName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
            {initials || <UserRound className="h-5 w-5" />}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{fullName}</p>
          <p className="text-sm text-gray-500">{doctor.specialty.name}</p>
          {doctor.years_experience && (
            <p className="text-xs text-gray-400 mt-0.5">
              {doctor.years_experience} anos de experiencia
            </p>
          )}
          {doctor.consultation_fee !== null && (
            <p className="text-sm font-medium text-emerald-600 mt-1">
              Consulta: ${doctor.consultation_fee?.toLocaleString("es-VE")}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onViewProfile(doctor.id)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Ver perfil del especialista
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export function ReferralDetail({
  referral,
  onBack,
  onBook,
  onViewProfile,
}: ReferralDetailProps) {
  const urgencyCfg = URGENCY_STYLES[referral.urgency];
  const UrgencyIcon = urgencyCfg.icon;

  const chainNodes = [
    { doctor: referral.referring_doctor, isCurrent: false },
    ...(referral.specialist
      ? [{ doctor: referral.specialist, isCurrent: true }]
      : []),
  ];

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
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">
            Referencia medica
          </h2>
          <p className="text-sm text-gray-500">
            Emitida el {formatDate(referral.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${urgencyCfg.className}`}
          >
            <UrgencyIcon className="h-3 w-3" />
            {urgencyCfg.label}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[referral.status]}`}
          >
            {STATUS_LABELS[referral.status]}
          </span>
        </div>
      </div>

      {/* Referral chain visualization */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Cadena de referencia
        </p>
        <ReferralChain nodes={chainNodes} />
      </div>

      {/* Doctor profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DoctorProfileCard
          doctor={referral.referring_doctor}
          label="Medico que refiere"
          onViewProfile={onViewProfile}
        />
        {referral.specialist && (
          <DoctorProfileCard
            doctor={referral.specialist}
            label="Especialista referido"
            onViewProfile={onViewProfile}
          />
        )}
      </div>

      {/* Medical context */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-gray-900">Contexto medico</h3>
        </div>

        {/* Diagnosis */}
        {referral.diagnosis && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Diagnostico
            </p>
            <p className="text-sm text-gray-700">{referral.diagnosis}</p>
          </div>
        )}

        {/* Reason for referral */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Motivo de la referencia
          </p>
          <p className="text-sm text-gray-700">{referral.reason}</p>
        </div>

        {/* Clinical notes */}
        {referral.clinical_notes && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Notas clinicas
            </p>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {referral.clinical_notes}
            </p>
          </div>
        )}
      </div>

      {/* Attached documents */}
      {referral.attached_documents && referral.attached_documents.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900">
              Documentos adjuntos
            </h3>
          </div>
          <div className="space-y-2">
            {referral.attached_documents.map((doc) => (
              <a
                key={doc.url}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="truncate flex-1">{doc.name}</span>
                <span className="text-xs text-gray-400 uppercase">
                  {doc.type}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Expiry notice */}
      {referral.expires_at && referral.status === "pending" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Esta referencia vence el {formatDate(referral.expires_at)}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Agenda tu cita con el especialista antes de la fecha de
              vencimiento.
            </p>
          </div>
        </div>
      )}

      {/* Action section */}
      {referral.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onBook(referral)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
          >
            <CalendarPlus className="h-4 w-4" />
            Agendar cita con especialista
          </button>
          {referral.specialist && (
            <button
              type="button"
              onClick={() => onViewProfile(referral.specialist!.id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
              Ver perfil del especialista
            </button>
          )}
        </div>
      )}
    </div>
  );
}
