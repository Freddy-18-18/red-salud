"use client";

import { ShieldCheck } from "lucide-react";

interface DoctorBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function DoctorBadge({ size = "sm", className = "" }: DoctorBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium ${textSize} ${className}`}
    >
      <ShieldCheck className={iconSize} />
      Medico
    </span>
  );
}
