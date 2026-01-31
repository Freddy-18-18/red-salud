/**
 * @file impact-section.types.ts
 * @description Tipos compartidos para las variantes de la sección de impacto
 */

import { LucideIcon } from "lucide-react";

/**
 * Datos de cobertura geográfica obtenidos del API
 */
export interface CoverageData {
    /** Número de estados con cobertura de doctores */
    estadosConCobertura: number;
    /** Total de estados en Venezuela */
    totalEstados: number;
    /** Porcentaje de penetración del servicio */
    porcentajePenetracion: number;
}

/**
 * Configuración de una estadística individual
 */
export interface StatItem {
    /** Icono de Lucide a mostrar */
    icon: LucideIcon;
    /** Valor de la estadística (puede ser número, porcentaje o texto) */
    value: string;
    /** Etiqueta corta de la estadística */
    label: string;
    /** Descripción adicional */
    description: string;
    /** Clases de gradiente de color */
    color: string;
    /** Color de fondo del icono (formato Tailwind) */
    bgColor?: string;
    /** Color de fondo de la tarjeta */
    cardBgColor?: string;
    /** Color del borde de la tarjeta */
    cardBorderColor?: string;
}

/**
 * Props comunes para las variantes de la sección de impacto
 */
export interface ImpactSectionProps {
    /** Clase CSS adicional para la sección */
    className?: string;
}
