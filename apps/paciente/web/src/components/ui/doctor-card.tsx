import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Video,
  Languages,
  HeartPulse,
} from "lucide-react";
import Link from "next/link";

interface DoctorCardProps {
  id: string;
  slug?: string | null;
  name: string;
  specialty: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  fee?: number;
  city?: string;
  state?: string;
  yearsExperience?: number;
  verified?: boolean;
  sacsVerified?: boolean | null;
  acceptsTelemedicine?: boolean | null;
  acceptsInsurance?: boolean | null;
  languages?: string[] | null;
  subspecialties?: string[] | null;
  totalConsultations?: number | null;
  nextAvailable?: string;
  onBook?: () => void;
}

const titleFor = (full: string, hint?: string): "Dr." | "Dra." => {
  const g = (hint || "").toLowerCase();
  if (g === "f" || g === "femenino" || g === "female") return "Dra.";
  if (g === "m" || g === "masculino" || g === "male") return "Dr.";
  const first = (full?.split(" ")[0] || "").toLowerCase();
  return first.endsWith("a") ? "Dra." : "Dr.";
};

export function DoctorCard({
  id,
  slug,
  name,
  specialty,
  avatarUrl,
  rating,
  reviewCount,
  fee,
  city,
  state,
  yearsExperience,
  verified,
  sacsVerified,
  acceptsTelemedicine,
  acceptsInsurance,
  languages,
  subspecialties,
  totalConsultations,
  nextAvailable,
  onBook,
}: DoctorCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const honorific = titleFor(name);
  const location = [city, state].filter(Boolean).join(", ");
  const profileHref = `/dashboard/buscar-medico/doctor/${slug || id}`;
  const subSpecsToShow = (subspecialties ?? []).slice(0, 2);

  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={`${honorific} ${name}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
              {initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={profileHref}
                className="group inline-flex items-center gap-1.5"
              >
                <h3 className="font-semibold text-[hsl(var(--foreground))] truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {honorific} {name}
                </h3>
                {(verified || sacsVerified) && (
                  <span
                    title={sacsVerified ? "SACS verificado" : "Verificado"}
                    className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    SACS
                  </span>
                )}
              </Link>
              <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                {specialty}
              </p>
              {subSpecsToShow.length > 0 && (
                <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))] truncate">
                  {subSpecsToShow.join(" · ")}
                </p>
              )}
            </div>
            {fee != null && (
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                  ${fee.toFixed(2)}
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  consulta
                </p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[hsl(var(--muted-foreground))]">
            {rating != null && rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
                <span className="font-semibold text-[hsl(var(--foreground))] tabular-nums">
                  {rating.toFixed(1)}
                </span>
                {reviewCount != null && reviewCount > 0 && (
                  <span className="tabular-nums">({reviewCount})</span>
                )}
              </div>
            )}
            {yearsExperience != null && yearsExperience > 0 && (
              <span className="inline-flex items-center gap-1">
                <HeartPulse className="h-3.5 w-3.5" />
                {yearsExperience} {yearsExperience === 1 ? "año" : "años"}
              </span>
            )}
            {totalConsultations != null && totalConsultations > 0 && (
              <span className="tabular-nums">
                {totalConsultations.toLocaleString("es-VE")} consultas
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{location}</span>
              </span>
            )}
            {nextAvailable && (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                <Clock className="h-3.5 w-3.5" />
                {nextAvailable}
              </span>
            )}
          </div>

          {/* Badges row */}
          {(acceptsTelemedicine || acceptsInsurance || (languages && languages.length > 0)) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {acceptsTelemedicine && (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300">
                  <Video className="h-3 w-3" />
                  Telemedicina
                </span>
              )}
              {acceptsInsurance && (
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">
                  Acepta seguro
                </span>
              )}
              {languages && languages.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                  <Languages className="h-3 w-3" />
                  {languages.slice(0, 2).join(", ")}
                  {languages.length > 2 && ` +${languages.length - 2}`}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <Link
              href={profileHref}
              className="px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] transition"
            >
              Ver perfil completo
            </Link>
            {onBook && (
              <button
                type="button"
                onClick={onBook}
                className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm"
              >
                Agendar cita
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
