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
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border bg-[hsl(var(--card))] text-left shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.997] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
          : "border-[hsl(var(--border))] hover:border-emerald-300"
      }`}
    >
      {/* Banner. A subtle gradient strip at the top gives the card a
          presentation-quality framing without using a real photo asset.
          Lights up emerald when the card is selected. */}
      <div
        className={`relative h-12 w-full overflow-hidden transition-colors duration-300 ${
          isSelected
            ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600"
            : "bg-gradient-to-r from-emerald-50 via-emerald-100 to-teal-50 dark:from-emerald-950/60 dark:via-emerald-900/40 dark:to-teal-950/60"
        }`}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_50%,white_0,transparent_40%),radial-gradient(circle_at_80%_30%,white_0,transparent_40%)]"
        />
        {isSelected && (
          <span className="pointer-events-none absolute right-4 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow-md">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        )}
      </div>

      {/* Avatar floats over the banner like a profile cover photo */}
      <div className="relative px-5">
        <div className="-mt-10 mb-3 flex items-end justify-between gap-3">
          {doctor.profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.profile.avatar_url}
              alt={fullName}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-[hsl(var(--card))] shadow-md"
            />
          ) : (
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl text-xl font-bold ring-4 ring-[hsl(var(--card))] shadow-md transition-colors ${
                isSelected
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:group-hover:bg-emerald-900/60"
              }`}
            >
              {initials}
            </div>
          )}

          {/* Right-side rating callout — readable at a glance */}
          {doctor.avg_rating !== null && doctor.avg_rating !== undefined && (
            <div className="flex flex-col items-end leading-tight">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-base font-bold text-[hsl(var(--foreground))]">
                  {doctor.avg_rating.toFixed(1)}
                </span>
              </div>
              {(doctor.review_count ?? 0) > 0 && (
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {doctor.review_count} reseñas
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Name + specialty */}
        <div>
          <h3 className="truncate text-base font-bold text-[hsl(var(--foreground))] sm:text-lg">
            {title} {fullName}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <Stethoscope className="h-3 w-3" />
            <span className="truncate">{doctor.specialty?.name}</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[hsl(var(--muted-foreground))]">
          {doctor.years_experience !== null &&
            doctor.years_experience !== undefined &&
            doctor.years_experience > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{doctor.years_experience} años exp.</span>
              </div>
            )}
          {location && (
            <div className="flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
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

        {/* Bio (clamped) — pushes the footer down */}
        {(doctor.biography || doctor.biografia) && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
            {doctor.biography ?? doctor.biografia}
          </p>
        )}

        <div className="grow" />

        {/* Footer: price · duration */}
        <div className="mt-4 flex items-end justify-between border-t border-[hsl(var(--border))] pt-3">
          <div className="flex items-baseline gap-1">
            {fee !== null && fee !== undefined ? (
              <>
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  ${fee.toFixed(2)}
                </span>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  / consulta
                </span>
              </>
            ) : (
              <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Sin precio publicado
              </span>
            )}
          </div>
          {duration && duration > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
              <Clock className="h-2.5 w-2.5" />
              {duration} min
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
