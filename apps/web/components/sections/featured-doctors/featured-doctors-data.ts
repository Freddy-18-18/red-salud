// Tipos y constantes para featured-doctors

export type Profile = {
    id: string;
    nombre_completo?: string;
    avatar_url?: string;
};

export type Specialty = {
    id: string;
    name: string;
};

export type Doctor = {
    id: string;
    profile?: Profile;
    specialty?: Specialty;
    tarifa_consulta?: number;
    consultation_duration?: number;
};

// Especialidades placeholder para mostrar "Próximamente"
export const placeholderSpecialties = [
    "Cardiología",
    "Dermatología",
    "Pediatría",
    "Ginecología",
    "Neurología",
    "Oftalmología",
    "Traumatología",
    "Psiquiatría",
    "Endocrinología",
    "Urología",
];

export function formatUSD(value?: number) {
    if (!value && value !== 0) return undefined;
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    } catch {
        return `${value}`;
    }
}
