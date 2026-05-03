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
      className={`group relative w-full overflow-hidden rounded-2xl border bg-[hsl(var(--card))] p-4 sm:p-5 text-left shadow-sm transition-all duration-200 active:scale-[0.997] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/15 shadow-md"
          : "border-[hsl(var(--border))] hover:border-emerald-300 hover:shadow-md"
      }`}
    >
      {/* Selected check pin */}
      {isSelected && (
        <span className="pointer-events-none absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
          <CheckCircle2 className="h-4 w-4" />
        </span>
      )}

      <div className="flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {doctor.profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.profile.avatar_url}
              alt={fullName}
              className="h-14 w-14 rounded-2xl object-cover ring-1 ring-black/5 sm:h-16 sm:w-16"
            />
          ) : (
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold sm:h-16 sm:w-16 sm:text-lg ${
                isSelected
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
              }`}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          {/* Name + specialty */}
          <div className="flex items-start justify-between gap-2 pr-8">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-[hsl(var(--foreground))] sm:text-lg">
                {title} {fullName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <Stethoscope className="h-3 w-3" />
                <span className="truncate">{doctor.specialty?.name}</span>
              </div>
            </div>
          </div>

          {/* Meta row: rating · experience · location */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            {doctor.avg_rating !== null && doctor.avg_rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {doctor.avg_rating.toFixed(1)}
                </span>
                {(doctor.review_count ?? 0) > 0 && (
                  <span>({doctor.review_count})</span>
                )}
              </div>
            )}
            {doctor.years_experience !== null &&
              doctor.years_experience !== undefined &&
              doctor.years_experience > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{doctor.years_experience} años</span>
                </div>
              )}
            {location && (
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          {/* Badges row: only render the ones that apply */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {doctor.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/40">
                <ShieldCheck className="h-3 w-3" />
                Verificado SACS
              </span>
            )}
            {doctor.accepts_telemedicine && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/40">
                <Video className="h-3 w-3" />
                Telemedicina
              </span>
            )}
            {doctor.accepts_insurance && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/40">
                Acepta seguro
              </span>
            )}
          </div>

          {/* Bio preview */}
          {(doctor.biography || doctor.biografia) && (
            <p className="mt-2.5 line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">
              {doctor.biography ?? doctor.biografia}
            </p>
          )}

          {/* Fee row, separated visually */}
          <div className="mt-3 flex items-end justify-between border-t border-[hsl(var(--border))] pt-3">
            <div className="flex items-baseline gap-1">
              {fee !== null && fee !== undefined ? (
                <>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    ${fee.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    por consulta
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  Consulta sin precio publicado
                </span>
              )}
            </div>
            {duration && duration > 0 && (
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                {duration} min/cita
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
