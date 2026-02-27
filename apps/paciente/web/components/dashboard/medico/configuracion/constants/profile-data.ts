export const INSURANCE_COMPANIES = [
    { value: "Seguros Mercantil", label: "Seguros Mercantil" },
    { value: "Seguros Caracas", label: "Seguros Caracas" },
    { value: "Mapfre Seguros", label: "Mapfre Seguros" },
    { value: "Seguros La Previsora", label: "Seguros La Previsora" },
    { value: "Seguros Pirámide", label: "Seguros Pirámide" },
    { value: "Estar Seguros", label: "Estar Seguros" },
    { value: "Seguros Universitas", label: "Seguros Universitas" },
    { value: "Seguros Constitución", label: "Seguros Constitución" },
    { value: "Banesco Seguros", label: "Banesco Seguros" },
    { value: "Oceanic de Seguros", label: "Oceanic de Seguros" },
    { value: "Seguros Venezuela", label: "Seguros Venezuela" },
    { value: "Hispana de Seguros", label: "Hispana de Seguros" },
    { value: "Vivir Seguros", label: "Vivir Seguros" },
    { value: "Seguros Altamira", label: "Seguros Altamira" },
    { value: "Atrio Seguros", label: "Atrio Seguros" },
].sort((a, b) => a.label.localeCompare(b.label));

export const AGE_GROUPS = [
    { value: "bebes", label: "Bebés (0-2 años)" },
    { value: "ninos", label: "Niños (3-12 años)" },
    { value: "adolescentes", label: "Adolescentes (13-17 años)" },
    { value: "adultos", label: "Adultos (18-64 años)" },
    { value: "tercera_edad", label: "Tercera Edad (65+ años)" },
];

export const SOCIAL_PLATFORMS = [
    { id: "instagram", label: "Instagram", placeholder: "@usuario", prefix: "instagram.com/" },
    { id: "linkedin", label: "LinkedIn", placeholder: "in/usuario", prefix: "linkedin.com/" },
    { id: "website", label: "Sitio Web", placeholder: "www.tupagina.com", prefix: "https://" },
    { id: "facebook", label: "Facebook", placeholder: "usuario", prefix: "facebook.com/" },
    { id: "twitter", label: "X (Twitter)", placeholder: "@usuario", prefix: "x.com/" },
];
