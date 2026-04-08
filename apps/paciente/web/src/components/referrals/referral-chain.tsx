"use client";

import { ArrowRight, UserRound } from "lucide-react";
import Image from "next/image";

import type { ReferralDoctor } from "@/lib/services/medical-referral-service";

// ── Types ─────────────────────────────────────────────────────────────

interface ChainNode {
  doctor: ReferralDoctor;
  isCurrent?: boolean;
}

interface ReferralChainProps {
  nodes: ChainNode[];
  /** Compact mode for card previews */
  compact?: boolean;
}

// ── Avatar ────────────────────────────────────────────────────────────

function DoctorAvatar({
  doctor,
  size,
}: {
  doctor: ReferralDoctor;
  size: "sm" | "md";
}) {
  const dimensions = size === "sm" ? 36 : 48;
  const avatarUrl = doctor.profile.avatar_url;
  const initials =
    (doctor.profile.first_name?.[0] ?? "") +
    (doctor.profile.last_name?.[0] ?? "");

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${doctor.profile.first_name} ${doctor.profile.last_name}`}
        width={dimensions}
        height={dimensions}
        className={`rounded-full object-cover ${
          size === "sm" ? "h-9 w-9" : "h-12 w-12"
        }`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold ${
        size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm"
      }`}
    >
      {initials || <UserRound className="h-4 w-4" />}
    </div>
  );
}

// ── Chain Node ────────────────────────────────────────────────────────

function ChainNodeCard({
  doctor,
  isCurrent,
  compact,
}: {
  doctor: ReferralDoctor;
  isCurrent?: boolean;
  compact?: boolean;
}) {
  const fullName = `Dr. ${doctor.profile.first_name} ${doctor.profile.last_name}`;
  const specialtyName = doctor.specialty.name;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
        isCurrent
          ? "border-emerald-200 bg-emerald-50 ring-2 ring-emerald-500/20"
          : "border-gray-100 bg-white"
      } ${compact ? "min-w-0" : ""}`}
    >
      <DoctorAvatar doctor={doctor} size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold text-gray-900 truncate ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {fullName}
        </p>
        <p
          className={`text-gray-500 truncate ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {specialtyName}
        </p>
      </div>
    </div>
  );
}

// ── Chain Arrow ───────────────────────────────────────────────────────

function ChainArrow({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center justify-center shrink-0">
      <div
        className={`flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ${
          compact ? "h-6 w-6" : "h-8 w-8"
        }`}
      >
        <ArrowRight className={compact ? "h-3 w-3" : "h-4 w-4"} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export function ReferralChain({ nodes, compact = false }: ReferralChainProps) {
  if (nodes.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {nodes.map((node, index) => (
        <div key={node.doctor.id} className="flex items-center gap-2 min-w-0">
          {index > 0 && <ChainArrow compact={compact} />}
          <ChainNodeCard
            doctor={node.doctor}
            isCurrent={node.isCurrent}
            compact={compact}
          />
        </div>
      ))}
    </div>
  );
}
