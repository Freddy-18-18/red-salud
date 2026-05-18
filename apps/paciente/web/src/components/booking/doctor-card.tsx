"use client";

import {
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
  Video,
} from "lucide-react";

import type { DoctorProfile } from "@/lib/services/booking-service";

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Pick the right Spanish honorific. We prefer the explicit `gender` from the
 * row, then fall back to a heuristic on the first name (vowel ending → fem.)
 * which is close enough for Venezuelan first names. Worst case the doctor
 * gets the masculine default.
 */
function honorific(doctor: DoctorProfile): "Dr." | "Dra." {
  const gender = (doctor.profile.gender || "").toLowerCase();
  if (gender === "femenino" || gender === "f" || gender === "female") return "Dra.";
  if (gender === "masculino" || gender === "m" || gender === "male") return "Dr.";

  const first = (
    doctor.profile.first_name ||
    doctor.profile.full_name?.split(" ")[0] ||
    ""
  ).toLowerCase();

  // Names ending in "a" (María, Ana, Patricia, Carolina) → female.
  // Common male exceptions in Venezuela: Andrés, José, etc. don't end in "a".
  if (/[aeiou]$/.test(first) && first.endsWith("a")) return "Dra.";
  return "Dr.";
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter((p) => p.length > 0)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Component ─────────────────────────────────────────────────────────────

interface DoctorCardProps {
  doctor: DoctorProfile;
  isSelected: boolean;
  onSelect: () => void;
}

export function DoctorCard({ doctor, isSelected, onSelect }: DoctorCardProps) {
  const fullName = doctor.profile.full_name || "Profesional";
  const initials = getInitials(fullName);
  const title = honorific(doctor);
  const fee =
    doctor.consultation_fee ??
    (doctor as unknown as { consultation_price?: number }).consultation_price ??
    null;
  const duration = doctor.consultation_duration ?? null;
  const location = [doctor.profile.city, doctor.profile.state]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-[hsl(var(--card))] text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.998] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10"
          : "border-[hsl(var(--border))] hover:border-emerald-300"
      }`}
    >
      {/* Compact horizontal card — avatar left, info right, footer bottom.
          The previous "banner + floating avatar" version was beautiful but
          ate ~280px per card; this one fits twice as many on the same
          screen and still keeps the visual hierarchy. */}
      <div className="flex gap-3 p-3">
        {/* Avatar */}
        {doctor.profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doctor.profile.avatar_url}
            alt={fullName}
            className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
          />
        ) : (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
              isSelected
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
            }`}
          >
            {initials}
          </div>
        )}

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[hsl(var(--foreground))]">
                {title} {fullName}
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <Stethoscope className="h-2.5 w-2.5" />
                <span className="truncate">{doctor.specialty?.name}</span>
              </div>
            </div>
            {isSelected ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            ) : (
              doctor.avg_rating !== null &&
              doctor.avg_rating !== undefined && (
                <div className="flex shrink-0 items-center gap-0.5 leading-tight">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-[hsl(var(--foreground))]">
                    {doctor.avg_rating.toFixed(1)}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
            {doctor.years_experience &&
              doctor.years_experience > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {doctor.years_experience} años
                </span>
              )}
            {location && (
              <span className="inline-flex min-w-0 items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            )}
            {doctor.verified && (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-2.5 w-2.5" />
                SACS
              </span>
            )}
            {doctor.accepts_telemedicine && (
              <span className="inline-flex items-center gap-0.5 text-sky-700 dark:text-sky-400">
                <Video className="h-2.5 w-2.5" />
                Tele
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              {fee !== null && fee !== undefined ? (
                <>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                    ${fee.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    / consulta
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  Sin precio publicado
                </span>
              )}
            </div>
            {duration && duration > 0 && (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {duration} min
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
