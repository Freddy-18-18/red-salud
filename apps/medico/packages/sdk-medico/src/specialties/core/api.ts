import type { SpecialtyConfig, SpecialtyContext } from './types';
import { getSpecialtyForContext, normalizeText } from './detector';

/**
 * Get the complete specialty experience configuration for a user context.
 * This is the main entry point for the specialty system.
 *
 * @param context - User profile and detection context
 * @returns The specialty configuration or default config
 */
export function getSpecialtyExperienceConfig(
    context: SpecialtyContext
): SpecialtyConfig {
    const config = getSpecialtyForContext(context, true);

    if (!config) {
        // Return a minimal default config if nothing is found
        // This should ideally match the one in the app, but moved here for SDK consistency
        return {
            id: 'default',
            name: 'Médico',
            slug: 'medico',
            category: 'medical',
            keywords: [],
            dashboardVariant: 'default',
            modules: {},
            prioritizedKpis: [],
        };
    }

    return config;
}

/**
 * Check if a user context matches a specific specialty
 */
export function isSpecialtyMatch(
    context: SpecialtyContext,
    specialtyId: string
): boolean {
    const config = getSpecialtyForContext(context, false);
    return config?.id === specialtyId;
}

/**
 * Get menu groups for a specialty (for sidebar navigation)
 */
export function getSpecialtyMenuGroups(config: SpecialtyConfig): Array<{
    label: string;
    icon?: string;
    items: Array<{
        key: string;
        label: string;
        icon: string;
        route: string;
        badge?: string | number;
        description?: string;
    }>;
    order?: number;
}> {
    const groups: Array<{
        label: string;
        icon?: string;
        items: Array<{
            key: string;
            label: string;
            icon: string;
            route: string;
            badge?: string | number;
            description?: string;
        }>;
        order?: number;
    }> = [];

    // Group metadata for display order
    const groupMetadata: Record<
        string,
        { label: string; icon: string; order: number }
    > = {
        clinical: {
            label: config.slug === 'urologia' ? 'Urología' : 'Clínica',
            icon: 'Stethoscope',
            order: 1
        },
        financial: { label: 'Finanzas', icon: 'DollarSign', order: 2 },
        lab: { label: 'Laboratorio', icon: 'FlaskConical', order: 3 },
        technology: { label: 'Tecnología', icon: 'Sparkles', order: 4 },
        communication: { label: 'Comunicación', icon: 'MessageCircle', order: 5 },
        growth: { label: 'Crecimiento', icon: 'TrendingUp', order: 6 },
        administrative: {
            label: 'Administración',
            icon: 'Settings',
            order: 7,
        },
        education: { label: 'Educación', icon: 'BookOpen', order: 8 },
    };

    // Build menu groups from config
    for (const [groupKey, modules] of Object.entries(config.modules)) {
        if (!modules || modules.length === 0) continue;

        const metadata = groupMetadata[groupKey];
        if (!metadata) continue;

        groups.push({
            label: metadata.label,
            icon: metadata.icon,
            order: metadata.order,
            items: modules
                .filter((m) => m.enabledByDefault !== false)
                .sort((a, b) => (a.order || 999) - (b.order || 999))
                .map((module) => ({
                    key: module.key,
                    label: module.label,
                    icon: module.icon,
                    route: module.route,
                    description: module.settings?.description as string | undefined,
                })),
        });
    }

    // Sort by order
    groups.sort((a, b) => (a.order || 999) - (b.order || 999));

    return groups;
}

/**
 * Legacy support for checking if a specialty name matches odontology
 * @deprecated Use getSpecialtyExperienceConfig() instead
 */
export function isOdontologySpecialtyLegacy(specialtyName?: string | null): boolean {
    if (!specialtyName) return false;

    const keywords = [
        'odontologia',
        'odontología',
        'cirujano dentista',
        'doctor en odontologia',
        'doctor en odontología',
        'estomatologia',
        'estomatología',
        'odontologo',
        'odontólogo',
        'dental',
    ];

    const normalized = normalizeText(specialtyName);

    return keywords.some((keyword) => {
        const normalizedKeyword = normalizeText(keyword);
        return (
            normalized === normalizedKeyword ||
            normalized.includes(normalizedKeyword) ||
            normalizedKeyword.includes(normalized)
        );
    });
}
