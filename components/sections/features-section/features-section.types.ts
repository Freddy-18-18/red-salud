/**
 * @file features-section.types.ts
 * @description Tipos e interfaces para la sección de Características premium
 * @module FeaturesSection
 */

import type { LucideIcon } from "lucide-react";

/**
 * Representa una característica individual del ecosistema
 */
export interface Feature {
    /** Identificador único de la característica */
    id: string;

    /** Título corto de la característica (visible siempre) */
    title: string;

    /** Icono de Lucide React */
    icon: LucideIcon;

    /** Color del gradiente para el icono (tailwind classes) */
    gradient: string;

    /** Color del glow effect (tailwind class) */
    glowColor: string;

    /** Descripción breve (visible en hover) */
    description: string;

    /** Descripción extendida (visible en hover expandido) */
    extendedDescription: string;

    /** Lista de beneficios específicos */
    benefits: string[];

    /** Etiqueta destacada opcional (ej: "Nuevo", "Popular") */
    badge?: string;
}

/**
 * Props para el componente FeatureCard
 */
export interface FeatureCardProps {
    /** Datos de la característica a mostrar */
    feature: Feature;

    /** Índice para animaciones escalonadas */
    index: number;
}

/**
 * Props para el componente principal FeaturesSection
 */
export interface FeaturesSectionProps {
    /** ID personalizado para la sección */
    id?: string;

    /** Clases adicionales para la sección */
    className?: string;
}
