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
// /auth/select-role — disambiguator landing for medico.
// Same UX as paciente; only the "Soy Médico" link is local.
// =============================================================================

function urlFor(envVar: string, defaultDevPort: number, devPath = "/auth/login") {
    const envUrl = process.env[envVar];
    if (envUrl) return `${envUrl.replace(/\/$/, "")}${devPath}`;
    if (process.env.NODE_ENV !== "production") {
        return `http://localhost:${defaultDevPort}${devPath}`;
    }
    return devPath;
}

export default function SelectRolePage() {
    const options = buildDefaultRoleOptions({
        paciente: urlFor("NEXT_PUBLIC_PACIENTE_URL", 3003),
        medico: "/auth/login",
        farmacia: urlFor("NEXT_PUBLIC_FARMACIA_URL", 3001),
        clinica: urlFor("NEXT_PUBLIC_CLINICA_URL", 3004),
    });

    return <AuthRoleSelect options={options} />;
}
