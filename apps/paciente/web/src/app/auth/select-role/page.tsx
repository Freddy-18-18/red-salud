import {
    AuthRoleSelect,
    buildDefaultRoleOptions,
} from "@red-salud/design-system";

export const metadata = {
    title: "Elegí tu portal — Red Salud",
    description:
        "Iniciá sesión en el portal correcto: paciente, médico, farmacia o clínica.",
};

// =============================================================================
// /auth/select-role — disambiguator landing.
// A user who types redsalud.com or hits the paciente subdomain by accident
// can re-route to the right portal from here. URLs are env-driven so dev uses
// localhost ports and prod uses real subdomains.
// =============================================================================

function urlFor(envVar: string, defaultDevPort: number, devPath = "/auth/login") {
    const envUrl = process.env[envVar];
    if (envUrl) return `${envUrl.replace(/\/$/, "")}${devPath}`;
    if (process.env.NODE_ENV !== "production") {
        return `http://localhost:${defaultDevPort}${devPath}`;
    }
    // Production fallback — set the env vars in deployment.
    return devPath;
}

export default function SelectRolePage() {
    const options = buildDefaultRoleOptions({
        paciente: "/auth/login",
        medico: urlFor("NEXT_PUBLIC_MEDICO_URL", 3002),
        farmacia: urlFor("NEXT_PUBLIC_FARMACIA_URL", 3001),
        clinica: urlFor("NEXT_PUBLIC_CLINICA_URL", 3004),
    });

    return <AuthRoleSelect options={options} />;
}
