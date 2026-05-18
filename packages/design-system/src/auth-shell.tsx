import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "./lib/utils";

// =============================================================================
// AuthShell — unified auth chrome for every Red Salud portal.
// Replaces bespoke per-app gradients (paciente emerald, medico zinc/teal) with
// a single Caribbean-Trust shell that re-skins via the role prop. Authentication
// LOGIC stays in the consumer (paciente, medico, etc.); this component owns
// only the visual frame, branding, and copy slots.
// =============================================================================

export type AuthRole =
    | "paciente"
    | "medico"
    | "farmacia"
    | "clinica"
    | "laboratorio"
    | "secretaria"
    | "seguro"
    | "ambulancia"
    | "academia";

interface RoleCopy {
    /** Side-panel headline shown next to the form on desktop. */
    headline: string;
    /** Lead paragraph under the headline. */
    lead: string;
    /** 3 short benefit bullets. */
    bullets: [string, string, string];
    /** Token name (without `--`) for the per-domain accent. */
    accentToken: string;
}

const ROLE_COPY: Record<AuthRole, RoleCopy> = {
    paciente: {
        headline: "Tu salud, en un solo lugar",
        lead: "Agendá citas con especialistas, consultá tu historial y comunicate con tu doctor desde casa.",
        bullets: [
            "Agendá citas en segundos",
            "Historial médico digital",
            "Telemedicina desde tu celular",
        ],
        accentToken: "domain-paciente",
    },
    medico: {
        headline: "Tu consultorio digital",
        lead: "Gestioná pacientes, consultas, recetas y agenda — todo desde un solo panel pensado para profesionales.",
        bullets: [
            "Agenda y consultas en un click",
            "Recetas con firma digital",
            "Verificación SACS integrada",
        ],
        accentToken: "domain-medico",
    },
    farmacia: {
        headline: "Tu farmacia, conectada",
        lead: "Inventario en tiempo real, ventas, recetas y entregas — todo coordinado con la red.",
        bullets: [
            "Stock siempre actualizado",
            "Recetas digitales validadas",
            "Reportes BCV automáticos",
        ],
        accentToken: "domain-farmacia",
    },
    clinica: {
        headline: "Administrá tu clínica",
        lead: "Sedes, personal, recursos y métricas operativas en un panel diseñado para administradores.",
        bullets: [
            "Sedes y consultorios",
            "Personal y permisos",
            "Métricas en vivo",
        ],
        accentToken: "domain-clinica",
    },
    laboratorio: {
        headline: "Tu laboratorio, sin papeles",
        lead: "Órdenes, muestras, resultados y control de calidad en un flujo digital integrado.",
        bullets: [
            "Órdenes y muestras",
            "Resultados firmados",
            "Control de calidad",
        ],
        accentToken: "domain-laboratorio",
    },
    secretaria: {
        headline: "Coordiná la agenda",
        lead: "Gestioná citas, pacientes y tareas administrativas para uno o varios médicos.",
        bullets: [
            "Agenda multi-médico",
            "Recepción de pacientes",
            "Recordatorios automáticos",
        ],
        accentToken: "domain-secretaria",
    },
    seguro: {
        headline: "Tu aseguradora, integrada",
        lead: "Pólizas, reclamos y red de prestadores en un panel diseñado para el sector salud.",
        bullets: [
            "Pólizas y afiliados",
            "Reclamos digitales",
            "Red de prestadores",
        ],
        accentToken: "domain-seguro",
    },
    ambulancia: {
        headline: "Despacho de emergencias",
        lead: "Coordiná flotas, triage y respuesta rápida con visibilidad en tiempo real.",
        bullets: [
            "Despacho geolocalizado",
            "Triage en ruta",
            "Hospitales coordinados",
        ],
        accentToken: "domain-ambulancia",
    },
    academia: {
        headline: "Tu formación médica",
        lead: "Cursos, certificaciones y gamificación para crecer profesionalmente desde la red.",
        bullets: [
            "Cursos certificados",
            "Progreso gamificado",
            "Comunidad de profesionales",
        ],
        accentToken: "domain-academia",
    },
};

export interface AuthShellProps {
    /** Drives the side-panel benefit copy and the per-domain accent token. */
    role: AuthRole;
    /** Form heading inside the card (e.g., "Iniciá sesión"). */
    title: string;
    /** Subtitle below the heading (e.g., "Ingresá a tu portal del paciente"). */
    subtitle?: string;
    /** The form itself. */
    children: React.ReactNode;
    /** Footer content under the card (typically the "¿No tenés cuenta?" link). */
    footer?: React.ReactNode;
    /**
     * If provided, shows a "Volver a elegir portal" link in the top-left.
     * Defaults to "/auth/select-role" (relative to current app).
     * Pass `null` to hide the link entirely (e.g., on select-role itself).
     */
    selectRoleHref?: string | null;
    /**
     * Override the "no account" / footer link target. Defaults to false.
     * If true, the shell renders compact (no benefits panel), useful for short
     * confirmation states like "Revisá tu correo".
     */
    compact?: boolean;
    /** Optional className for the root element. */
    className?: string;
}

/**
 * Two-column auth layout (desktop) / stacked (mobile).
 * Left: Caribbean-Trust gradient brand panel + role-specific benefits.
 * Right: form card on a calm neutral surface.
 */
export function AuthShell({
    role,
    title,
    subtitle,
    children,
    footer,
    selectRoleHref = "/auth/select-role",
    compact = false,
    className,
}: AuthShellProps) {
    const copy = ROLE_COPY[role];

    return (
        <main
            className={cn(
                "flex min-h-screen bg-background text-foreground",
                className
            )}
            // Per-instance accent: the role chooses which --domain-* token feeds
            // the local --accent-domain. Apps still set a default in globals.css.
            style={
                {
                    ["--accent-domain" as string]: `var(--${copy.accentToken})`,
                } as React.CSSProperties
            }
        >
            {/* ── Left brand panel — desktop only, hidden in compact mode ── */}
            {!compact && (
                <aside
                    aria-hidden="true"
                    className="relative hidden lg:flex lg:w-[44%] xl:w-[42%] overflow-hidden"
                    style={{
                        background:
                            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(205 70% 22%) 60%, hsl(var(--accent-domain) / 0.85) 100%)",
                    }}
                >
                    {/* Atmospheric blobs — pure decoration, very low opacity */}
                    <div className="absolute inset-0 opacity-[0.08]">
                        <div className="absolute top-16 left-12 w-72 h-72 rounded-full bg-white blur-3xl" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
                    </div>

                    <div className="relative z-10 flex flex-col justify-between px-12 xl:px-16 py-12 text-white w-full">
                        {/* Brand mark — anchor (not next/link) so this works */}
                        {/* across every Next app without a framework dep. */}
                        <a
                            href="/"
                            aria-label="Ir al inicio"
                            className="flex items-center gap-3 w-fit rounded-md transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                            <BrandMark />
                            <span className="text-2xl font-bold tracking-tight">
                                Red Salud
                            </span>
                        </a>

                        {/* Headline + benefits */}
                        <div className="max-w-md">
                            <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
                                {copy.headline}
                            </h2>
                            <p className="text-base xl:text-lg text-white/85 leading-relaxed mb-10">
                                {copy.lead}
                            </p>
                            <ul className="space-y-3">
                                {copy.bullets.map((bullet) => (
                                    <li
                                        key={bullet}
                                        className="flex items-center gap-3 text-white/90"
                                    >
                                        <span
                                            className="block h-2 w-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    "hsl(var(--accent-domain))",
                                                boxShadow:
                                                    "0 0 0 4px hsl(var(--accent-domain) / 0.25)",
                                            }}
                                        />
                                        <span className="text-sm xl:text-base">
                                            {bullet}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Footer of the panel — quiet legal */}
                        <p className="text-xs text-white/60">
                            Plataforma de salud digital · Venezuela
                        </p>
                    </div>
                </aside>
            )}

            {/* ── Right form panel ── */}
            <section
                className={cn(
                    "flex-1 flex flex-col items-center justify-center bg-background",
                    compact ? "px-4 py-10" : "px-4 py-10 sm:px-8"
                )}
            >
                <div className="w-full max-w-md">
                    {/* Mobile brand — visible only on stacked layout */}
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <a
                            href="/"
                            aria-label="Ir al inicio"
                            className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition hover:opacity-80"
                        >
                            <span
                                className="grid h-9 w-9 place-items-center rounded-xl text-white"
                                style={{
                                    background:
                                        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent-domain)) 100%)",
                                }}
                            >
                                <BrandGlyph />
                            </span>
                            <span className="text-xl font-bold text-foreground tracking-tight">
                                Red Salud
                            </span>
                        </a>
                    </div>

                    {/* Back-to-portal-select link */}
                    {selectRoleHref && (
                        <a
                            href={selectRoleHref}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Cambiar de portal
                        </a>
                    )}

                    {/* Card */}
                    <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-6 sm:p-8">
                        <header className="mb-6 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </header>

                        {children}
                    </div>

                    {footer && (
                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            {footer}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

// =============================================================================
// Brand glyphs — kept inline so AuthShell has zero asset dependencies.
// Heart silhouette evokes care without being clinical-cold.
// =============================================================================

function BrandMark() {
    return (
        <span
            className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-lg"
            style={{
                background:
                    "linear-gradient(135deg, hsl(0 0% 100% / 0.16) 0%, hsl(var(--accent-domain) / 0.55) 100%)",
                boxShadow:
                    "inset 0 0 0 1px hsl(0 0% 100% / 0.18), 0 8px 24px -10px hsl(var(--accent-domain) / 0.5)",
            }}
        >
            <BrandGlyph />
        </span>
    );
}

function BrandGlyph() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10Z" />
            <path d="M9 11h2v-2h2v2h2" />
        </svg>
    );
}

// =============================================================================
// AuthDivider — tiny convenience used inside AuthShell forms (e.g., between
// "Continuá con Google" and the email form). Kept here to avoid forcing each
// app to re-implement the same hairline + label pattern.
// =============================================================================

export function AuthDivider({
    label = "o",
    className,
}: {
    label?: string;
    className?: string;
}) {
    return (
        <div className={cn("relative my-6", className)}>
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-card px-3 text-muted-foreground">
                    {label}
                </span>
            </div>
        </div>
    );
}
