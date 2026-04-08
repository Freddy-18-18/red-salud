"use client";

import {
  ArrowRight,
  CalendarPlus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserRound,
} from "lucide-react";
import Image from "next/image";

import type {
  MedicalReferral,
  ReferralStatus,
  ReferralUrgency,
} from "@/lib/services/medical-referral-service";

// ── Status config ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReferralStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  scheduled: {
    label: "Agendada",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completada",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  expired: {
    label: "Vencida",
    className: "bg-gray-50 text-gray-500 border-gray-200",
  },
};

const URGENCY_CONFIG: Record<
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

interface ReferralCardProps {
  referral: MedicalReferral;
  onSelect: (referral: MedicalReferral) => void;
  onBook: (referral: MedicalReferral) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────

function MiniAvatar({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
      {initials || <UserRound className="h-3 w-3" />}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getExpiryInfo(expiresAt: string | null): {
  text: string;
  isUrgent: boolean;
} | null {
  if (!expiresAt) return null;

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Vencida", isUrgent: true };
  }
  if (diffDays === 0) {
    return { text: "Vence hoy", isUrgent: true };
  }
  if (diffDays <= 7) {
    return { text: `Vence en ${diffDays} dia${diffDays > 1 ? "s" : ""}`, isUrgent: true };
  }
  return {
    text: `Vence el ${formatDate(expiresAt)}`,
    isUrgent: false,
  };
}

// ── Component ─────────────────────────────────────────────────────────

export function ReferralCard({ referral, onSelect, onBook }: ReferralCardProps) {
  const statusCfg = STATUS_CONFIG[referral.status];
  const urgencyCfg = URGENCY_CONFIG[referral.urgency];
  const UrgencyIcon = urgencyCfg.icon;
  const expiryInfo = getExpiryInfo(referral.expires_at);

  const referringName = `Dr. ${referral.referring_doctor.profile.first_name} ${referral.referring_doctor.profile.last_name}`;
  const referringSpecialty = referral.referring_doctor.specialty.name;

  const specialistName = referral.specialist
    ? `Dr. ${referral.specialist.profile.first_name} ${referral.specialist.profile.last_name}`
    : null;
  const targetSpecialty = referral.target_specialty.name;

  return (
    <div
      onClick={() => onSelect(referral)}
      className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
    >
      {/* Top: badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${urgencyCfg.className}`}
          >
            <UrgencyIcon className="h-3 w-3" />
            {urgencyCfg.label}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusCfg.className}`}
          >
            {statusCfg.label}
          </span>
        </div>
        <time className="text-xs text-gray-400">
          {formatDate(referral.created_at)}
        </time>
      </div>

      {/* Doctor chain: referring → specialist */}
      <div className="flex items-center gap-3 mb-3">
        {/* Referring doctor */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MiniAvatar
            url={referral.referring_doctor.profile.avatar_url}
            name={referringName}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {referringName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {referringSpecialty}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Specialist or specialty placeholder */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {specialistName ? (
            <>
              <MiniAvatar
                url={referral.specialist!.profile.avatar_url}
                name={specialistName}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {specialistName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {targetSpecialty}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {targetSpecialty}
                </p>
                <p className="text-xs text-gray-400">Sin asignar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reason */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {referral.reason}
      </p>

      {/* Bottom: expiry + CTA */}
      <div className="flex items-center justify-between">
        {expiryInfo && (
          <span
            className={`text-xs font-medium ${
              expiryInfo.isUrgent ? "text-red-600" : "text-gray-400"
            }`}
          >
            <Clock className="inline h-3 w-3 mr-1" />
            {expiryInfo.text}
          </span>
        )}
        {!expiryInfo && <span />}

        {referral.status === "pending" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook(referral);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 active:bg-emerald-800"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Agendar con especialista
          </button>
        )}
      </div>
    </div>
  );
}
