"use client";

import { CheckCircle2, Clock, XCircle, User, Star } from "lucide-react";

import type { Referral } from "@/lib/services/referral-service";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: typeof CheckCircle2 }
> = {
  registered: {
    label: "Registrado",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pendiente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: Clock,
  },
  expired: {
    label: "Expirado",
    bg: "bg-gray-50",
    text: "text-gray-600",
    icon: XCircle,
  },
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

interface ReferralListProps {
  referrals: Referral[];
}

export function ReferralList({ referrals }: ReferralListProps) {
  if (referrals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
          <User className="h-7 w-7 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900">
          Todavia no tenés referidos
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Comparti tu codigo para empezar a ganar puntos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {referrals.map((referral) => {
        const config = STATUS_CONFIG[referral.status] || STATUS_CONFIG.pending;
        const StatusIcon = config.icon;
        const name =
          referral.referred_profile?.full_name ||
          referral.referred_name ||
          referral.referred_email ||
          "Invitado";
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div
            key={referral.id}
            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              {referral.referred_profile?.avatar_url ? (
                <img
                  src={referral.referred_profile.avatar_url}
                  alt={name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-emerald-600">
                  {initials}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${config.text}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(referral.registered_at || referral.created_at)}
                </span>
              </div>
            </div>
            {referral.points_earned > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg flex-shrink-0">
                <Star className="h-3 w-3 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700">
                  +{referral.points_earned}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
