export type SpecialtyModuleKey =
  | "dental-imaging"
  | "dental-growth"
  | "dental-rcm"
  | "dental-periodontogram"
  | "dental-intake-forms"
  | "dental-treatment-estimates"
  | "dental-insurance"
  | "dental-lab-tracking"
  | "dental-inventory"
  | "dental-memberships"
  | "dental-voip"
  | "dental-3d-models"
  | "dental-remote-monitoring"
  | "dental-consultation"
  | "dental-recipes";

export interface SpecialtyExperienceContext {
  specialtyName?: string | null;
  subSpecialties?: string[] | null;
  // Campo para forzar una variante de dashboard en modo desarrollo
  // En producción esto debería ser null o undefined
  forceDashboardVariant?: "default" | "odontologia" | null;
}

export interface SpecialtyExperienceConfig {
  key: "default" | "odontologia";
  dashboardVariant: "default" | "odontologia";
  menuGroupLabel?: string;
  modules: Array<{
    key: SpecialtyModuleKey;
    label: string;
    icon: string;
    route: string;
    group?: string; // Categoría para agrupar módulos
  }>;
  prioritizedKpis: string[];
}

const ODONTOLOGY_MODULES: SpecialtyExperienceConfig["modules"] = [
  // 🦷 Gestión Clínica (group: clinical)
  {
    key: "dental-consultation",
    label: "Consulta Dental",
    icon: "Stethoscope",
    route: "/dashboard/medico/odontologia/consulta",
    group: "clinical",
  },
  {
    key: "dental-periodontogram",
    label: "Periodontograma",
    icon: "Gum",
    route: "/dashboard/medico/odontologia/periodontograma",
    group: "clinical",
  },
  {
    key: "dental-recipes",
    label: "Recetas",
    icon: "Pill",
    route: "/dashboard/medico/recetas",
    group: "clinical",
  },
  {
    key: "dental-intake-forms",
    label: "Formularios",
    icon: "Clipboard",
    route: "/dashboard/medico/odontologia/formularios",
    group: "clinical",
  },
  // 💰 Gestión Financiera (group: financial)
  {
    key: "dental-treatment-estimates",
    label: "Presupuestos",
    icon: "FileText",
    route: "/dashboard/medico/odontologia/presupuestos",
    group: "financial",
  },
  {
    key: "dental-insurance",
    label: "Seguros",
    icon: "Shield",
    route: "/dashboard/medico/odontology/seguros",
    group: "financial",
  },
  {
    key: "dental-memberships",
    label: "Membresías",
    icon: "CreditCard",
    route: "/dashboard/medico/odontologia/membresias",
    group: "financial",
  },
  {
    key: "dental-rcm",
    label: "RCM Dental",
    icon: "DollarSign",
    route: "/dashboard/medico/odontologia/rcm",
    group: "financial",
  },
  // 🔬 Servicios de Laboratorio (group: lab)
  {
    key: "dental-lab-tracking",
    label: "Laboratorio",
    icon: "FlaskConical",
    route: "/dashboard/medico/odontologia/laboratorio",
    group: "lab",
  },
  {
    key: "dental-inventory",
    label: "Inventario",
    icon: "Package",
    route: "/dashboard/medico/odontologia/inventario",
    group: "lab",
  },
  // 📸 Tecnología Avanzada (group: technology)
  {
    key: "dental-imaging",
    label: "Imágenes IA",
    icon: "Scan",
    route: "/dashboard/medico/odontologia/imaging",
    group: "technology",
  },
  {
    key: "dental-3d-models",
    label: "Modelos 3D",
    icon: "Box",
    route: "/dashboard/medico/odontologia/modelos-3d",
    group: "technology",
  },
  // 📞 Comunicación (group: communication)
  {
    key: "dental-remote-monitoring",
    label: "Teledentología",
    icon: "Video",
    route: "/dashboard/medico/odontologia/teledentologia",
    group: "communication",
  },
  {
    key: "dental-voip",
    label: "Llamadas",
    icon: "Phone",
    route: "/dashboard/medico/odontologia/llamadas",
    group: "communication",
  },
  // 📈 Crecimiento de la Práctica (group: growth)
  {
    key: "dental-growth",
    label: "Practice Growth",
    icon: "TrendingUp",
    route: "/dashboard/medico/odontologia/growth",
    group: "growth",
  },
];

function normalizeText(value?: string | null): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Lista de términos que indican especialidad odontológica
const ODONTOLOGY_KEYWORDS = [
  "odontologia",
  "odontología",
  "cirujano dentista",
  "doctor en odontologia",
  "doctor en odontología",
  "estomatologia",
  "estomatología",
  "odontologo",
  "odontólogo",
  "dental",
];

export function isOdontologySpecialty(specialtyName?: string | null): boolean {
  if (!specialtyName) return false;

  const normalized = normalizeText(specialtyName);

  // Verificar si algún término de odontología está presente
  return ODONTOLOGY_KEYWORDS.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return (
      normalized === normalizedKeyword ||
      normalized.includes(normalizedKeyword) ||
      normalizedKeyword.includes(normalized)
    );
  });
}

export function getPrimarySubSpecialty(subSpecialties?: string[] | null): string | null {
  if (!subSpecialties || subSpecialties.length === 0) {
    return null;
  }

  const [first] = subSpecialties;
  return first || null;
}

export function getSpecialtyExperienceConfig(
  context: SpecialtyExperienceContext
): SpecialtyExperienceConfig {
  const { specialtyName, subSpecialties, forceDashboardVariant } = context;

  // MODO DESARROLLO: Si se fuerza una variante, usarla (ignorar en producción)
  if (forceDashboardVariant && process.env.NODE_ENV !== "production") {
    if (forceDashboardVariant === "odontologia") {
      const primarySubSpecialty = getPrimarySubSpecialty(subSpecialties);
      return {
        key: "odontologia",
        dashboardVariant: "odontologia",
        menuGroupLabel: primarySubSpecialty
          ? `Odontología · ${primarySubSpecialty} (MODO PRUEBA)`
          : "Odontología Pro (MODO PRUEBA)",
        modules: ODONTOLOGY_MODULES,
        prioritizedKpis: [
          "case_acceptance_rate",
          "no_show_rate",
          "claim_first_pass_acceptance",
          "recall_recovery_rate",
        ],
      };
    }
  }

  // LÓGICA NORMAL: Detectar especialidad odontológica
  if (isOdontologySpecialty(specialtyName)) {
    const primarySubSpecialty = getPrimarySubSpecialty(subSpecialties);

    return {
      key: "odontologia",
      dashboardVariant: "odontologia",
      menuGroupLabel: primarySubSpecialty
        ? `Odontología · ${primarySubSpecialty}`
        : "Odontología Pro",
      modules: ODONTOLOGY_MODULES,
      prioritizedKpis: [
        "case_acceptance_rate",
        "no_show_rate",
        "claim_first_pass_acceptance",
        "recall_recovery_rate",
      ],
    };
  }

  return {
    key: "default",
    dashboardVariant: "default",
    modules: [],
    prioritizedKpis: [],
  };
}
