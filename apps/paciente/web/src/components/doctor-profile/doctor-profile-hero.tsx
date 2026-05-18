"use client";

import {
  CalendarPlus,
  CheckCircle2,
  Languages,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";
import { honorificFor } from "./helpers";
import { FavoriteButton } from "./favorite-button";

interface DoctorProfileHeroProps {
  doctor: FullDoctorProfile;
  onBook: () => void;
}

export function DoctorProfileHero({ doctor, onBook }: DoctorProfileHeroProps) {
  const fullName = doctor.profile.full_name || "Doctor";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const title = honorificFor(fullName, doctor.profile.gender);
  const location = [doctor.profile.city, doctor.profile.state]
    .filter(Boolean)
    .join(", ");
  const avatar = doctor.profile.avatar_url;
  const rating = doctor.average_rating;
  const reviews = doctor.total_reviews ?? 0;
  const consults = doctor.total_consultations ?? 0;
  const langs = (doctor.languages ?? []).filter(Boolean);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[hsl(var(--card))] dark:to-emerald-950/30 lg:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-700/15"
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        {/* Avatar */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-emerald-500/10 ring-2 ring-emerald-500/30 lg:h-32 lg:w-32">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={`${title} ${fullName}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 lg:text-4xl">
              {initials}
            </span>
          )}
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[hsl(var(--foreground))] lg:text-3xl">
              {title} {fullName}
            </h1>
            {doctor.sacs_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                <ShieldCheck className="h-3 w-3" />
                SACS
              </span>
            )}
            {doctor.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <Star className="h-3 w-3 fill-current" />
                Destacado
              </span>
            )}
          </div>

          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <Stethoscope className="h-3.5 w-3.5" />
            {doctor.specialty.name}
          </p>

          {/* Subspecialties */}
          {(doctor.subspecialties ?? []).length > 0 && (
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              {(doctor.subspecialties ?? []).slice(0, 3).join(" · ")}
            </p>
          )}

          {/* Quick stats */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[hsl(var(--muted-foreground))]">
            {rating != null && rating > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <strong className="font-bold text-[hsl(var(--foreground))]">
                  {rating.toFixed(1)}
                </strong>
                {reviews > 0 && <span>({reviews} reseñas)</span>}
              </span>
            )}
            {doctor.years_experience != null && doctor.years_experience > 0 && (
              <span>
                <strong className="font-bold text-[hsl(var(--foreground))]">
                  {doctor.years_experience}
                </strong>{" "}
                {doctor.years_experience === 1
                  ? "año de experiencia"
                  : "años de experiencia"}
              </span>
            )}
            {consults > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {consults.toLocaleString("es-VE")} consultas
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            {langs.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Languages className="h-3.5 w-3.5" />
                {langs.join(", ")}
              </span>
            )}
          </div>

          {/* Modality badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {doctor.accepts_telemedicine && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300">
                <Video className="h-3 w-3" />
                Telemedicina
              </span>
            )}
            {doctor.accepts_insurance && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">
                Acepta seguro
              </span>
            )}
            {doctor.accepts_new_patients && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Acepta pacientes nuevos
              </span>
            )}
          </div>
        </div>

        {/* Desktop CTA — visible up top so users don't need to scroll */}
        <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:shrink-0 lg:w-48">
          <button
            type="button"
            onClick={onBook}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            <CalendarPlus className="h-4 w-4" />
            Agendar cita
          </button>
          <FavoriteButton doctorId={doctor.id} className="w-full justify-center" />
          {doctor.consultation_fee != null && (
            <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
              Consulta:{" "}
              <strong className="text-emerald-700 dark:text-emerald-300">
                ${doctor.consultation_fee.toFixed(2)}
              </strong>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
