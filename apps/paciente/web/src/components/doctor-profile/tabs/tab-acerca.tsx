"use client";

import { Globe, Languages } from "lucide-react";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";

interface TabAcercaProps {
  doctor: FullDoctorProfile;
}

export function TabAcerca({ doctor }: TabAcercaProps) {
  const bio = doctor.biography?.trim() || null;
  const langs = (doctor.languages ?? []).filter(Boolean);
  const social = doctor.social_media ?? {};

  const socialLinks = [
    social.linkedin && { label: "LinkedIn", href: social.linkedin },
    social.instagram && { label: "Instagram", href: social.instagram },
    social.facebook && { label: "Facebook", href: social.facebook },
    social.twitter && { label: "Twitter / X", href: social.twitter },
    social.youtube && { label: "YouTube", href: social.youtube },
    doctor.website && { label: "Sitio web", href: doctor.website },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section
      role="tabpanel"
      aria-label="Acerca del doctor"
      className="space-y-4"
    >
      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
          Acerca de
        </h2>
        {bio ? (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {bio}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-[hsl(var(--muted-foreground))]">
            Este doctor aún no ha completado su biografía.
          </p>
        )}
      </article>

      {langs.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            <Languages className="h-4 w-4 text-emerald-600" />
            Idiomas en consulta
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {langs.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))]"
              >
                {lang}
              </span>
            ))}
          </div>
        </article>
      )}

      {socialLinks.length > 0 && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            <Globe className="h-4 w-4 text-emerald-600" />
            Presencia en línea
          </h3>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}
