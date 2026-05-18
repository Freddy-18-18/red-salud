import * as React from "react";
import {
    Stethoscope,
    UserRound,
    Pill,
    Building2,
    ArrowRight,
} from "lucide-react";

import { cn } from "./lib/utils";

// =============================================================================
// AuthRoleSelect — the "¿En qué portal entrás?" disambiguator.
// Rendered at /auth/select-role on every Red Salud portal so a user landing
// on any subdomain can switch to the correct one. Each card is a static <a>
// link — no client logic — so this can be used as a Server Component.
// =============================================================================

export interface AuthRoleSelectOption {
    /** Stable id used for keys / data-attributes. */
    id: string;
    /** Big card label, e.g., "Soy Paciente". */
    label: string;
    /** One-line description shown under the label. */
    description: string;
    /** Icon component from lucide-react (or any react-element). */
    icon: React.ComponentType<{ className?: string }>;
    /** Final href. In dev this is a localhost URL on the right port; in
     *  production each app is at its own subdomain. The choice belongs to
     *  the caller (env-driven in the page). */
    href: string;
    /** Token name (without --) for this card's accent. */
    accentToken: string;
}

export interface AuthRoleSelectProps {
    options: AuthRoleSelectOption[];
    /** Optional title override. Defaults to friendly Rioplatense copy. */
    title?: string;
    /** Optional subtitle override. */
    subtitle?: string;
    className?: string;
}

/**
 * The 4-card portal disambiguator. Caller passes the cards (so dev/prod URLs
 * can be set per environment) and we render the warm welcome screen.
 */
export function AuthRoleSelect({
    options,
    title = "Bienvenido a Red Salud",
    subtitle = "¿En qué portal necesitás entrar? Elegí abajo y te llevamos.",
    className,
}: AuthRoleSelectProps) {
    return (
        <main
            className={cn(
                "min-h-screen bg-background text-foreground flex flex-col",
                className
            )}
        >
            {/* Top brand strip */}
            <header className="px-4 sm:px-8 py-6 flex items-center justify-between">
                <a
                    href="/"
                    aria-label="Ir al inicio"
                    className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <span
                        className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-md"
                        style={{
                            background:
                                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(205 70% 22%) 100%)",
                        }}
                    >
                        <BrandGlyph />
                    </span>
                    <span className="text-lg font-bold tracking-tight">
                        Red Salud
                    </span>
                </a>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                    Plataforma de salud · Venezuela
                </span>
            </header>

            {/* Hero copy */}
            <section className="flex-1 flex flex-col items-center justify-center px-4 pb-14">
                <div className="w-full max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    </div>

                    {/* Card grid */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {options.map((opt) => (
                            <li key={opt.id}>
                                <RoleCard option={opt} />
                            </li>
                        ))}
                    </ul>

                    {/* Help row */}
                    <p className="text-center text-sm text-muted-foreground mt-10">
                        ¿No estás seguro? Si sos paciente, elegí{" "}
                        <strong className="text-foreground">Soy Paciente</strong>
                        .
                    </p>
                </div>
            </section>

            <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Red Salud · Tu salud, conectada.
            </footer>
        </main>
    );
}

// =============================================================================
// RoleCard — one tile in the disambiguator grid. Distinct accent per role,
// hover lifts the card, focus state is keyboard-accessible.
// =============================================================================

function RoleCard({ option }: { option: AuthRoleSelectOption }) {
    const Icon = option.icon;
    return (
        <a
            href={option.href}
            data-role={option.id}
            className={cn(
                "group relative flex h-full flex-col gap-4 rounded-2xl p-6",
                "bg-card border border-border text-card-foreground",
                "shadow-sm transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-lg hover:border-transparent",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "focus-visible:ring-[hsl(var(--accent-domain))]"
            )}
            style={
                {
                    ["--accent-domain" as string]: `var(--${option.accentToken})`,
                } as React.CSSProperties
            }
        >
            {/* Accent bar — top edge */}
            <span
                aria-hidden="true"
                className="absolute inset-x-6 top-0 h-1 rounded-b-full opacity-90"
                style={{
                    background: "hsl(var(--accent-domain))",
                }}
            />

            <div
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{
                    backgroundColor: "hsl(var(--accent-domain) / 0.12)",
                    color: "hsl(var(--accent-domain))",
                }}
            >
                <Icon className="h-6 w-6" />
            </div>

            <div className="flex-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {option.label}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                </p>
            </div>

            <span
                className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                style={{ color: "hsl(var(--accent-domain))" }}
            >
                Entrar
                <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                />
            </span>
        </a>
    );
}

// =============================================================================
// Default options builder — most apps want the same 4 cards (Paciente, Médico,
// Farmacia, Clínica). Apps pass a `urls` map keyed by role and we wire the rest.
// =============================================================================

export interface DefaultRoleSelectUrls {
    paciente: string;
    medico: string;
    farmacia: string;
    clinica: string;
}

export function buildDefaultRoleOptions(
    urls: DefaultRoleSelectUrls
): AuthRoleSelectOption[] {
    return [
        {
            id: "paciente",
            label: "Soy Paciente",
            description:
                "Buscá médicos, agendá citas y consultá tu historial.",
            icon: UserRound,
            href: urls.paciente,
            accentToken: "domain-paciente",
        },
        {
            id: "medico",
            label: "Soy Médico",
            description:
                "Tu consultorio digital: agenda, consultas, recetas.",
            icon: Stethoscope,
            href: urls.medico,
            accentToken: "domain-medico",
        },
        {
            id: "farmacia",
            label: "Soy Farmacia",
            description:
                "Inventario, ventas y recetas digitales conectadas.",
            icon: Pill,
            href: urls.farmacia,
            accentToken: "domain-farmacia",
        },
        {
            id: "clinica",
            label: "Trabajo en Clínica",
            description:
                "Sedes, personal, recursos y métricas operativas.",
            icon: Building2,
            href: urls.clinica,
            accentToken: "domain-clinica",
        },
    ];
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
