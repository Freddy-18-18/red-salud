/**
 * @file impact-section.data.ts
 * @description Datos estáticos y configuración para la sección de impacto
 */

import { TrendingUp, Users, Award, Globe } from "lucide-react";
import { StatItem } from "./impact-section.types";

/**
 * Estadísticas base (sin datos dinámicos de cobertura)
 * @returns Array de configuración de estadísticas
 */
export const getBaseStats = (): Omit<StatItem, "value" | "description">[] => [
    {
        icon: Users,
        label: "Roles integrados",
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-500/10",
        cardBgColor: "bg-blue-50/50 dark:bg-blue-900/10",
        cardBorderColor: "border-blue-100 dark:border-blue-800/30",
    },
    {
        icon: Globe,
        label: "Cobertura",
        color: "from-teal-500 to-teal-600",
        bgColor: "bg-teal-500/10",
        cardBgColor: "bg-teal-50/50 dark:bg-teal-900/10",
        cardBorderColor: "border-teal-100 dark:border-teal-800/30",
    },
    {
        icon: TrendingUp,
        label: "Disponibilidad",
        color: "from-indigo-500 to-indigo-600",
        bgColor: "bg-indigo-500/10",
        cardBgColor: "bg-indigo-50/50 dark:bg-indigo-900/10",
        cardBorderColor: "border-indigo-100 dark:border-indigo-800/30",
    },
    {
        icon: Award,
        label: "Verificado",
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-500/10",
        cardBgColor: "bg-purple-50/50 dark:bg-purple-900/10",
        cardBorderColor: "border-purple-100 dark:border-purple-800/30",
    },
];

/**
 * Textos de la sección
 */
export const IMPACT_SECTION_CONTENT = {
    badge: "Nuestro impacto",
    title: {
        line1: "Transformando la",
        highlight: "salud digital",
        line2: "en Venezuela",
    },
    subtitle:
        "La primera plataforma que conecta todo el ecosistema de salud en un solo lugar, diseñada por venezolanos para revolucionar el acceso a servicios médicos de calidad.",
    vision: {
        label: "Nuestra visión",
        title: "Democratizar el acceso a servicios de salud de calidad",
        description:
            "Conectamos pacientes, profesionales, farmacias, laboratorios y aseguradoras en un ecosistema digital seguro, transparente y eficiente.",
    },
} as const;
