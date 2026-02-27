import { PATIENT_MODULE_CONFIG } from "@/lib/constants";
import { MenuGroup } from "@/components/dashboard/layout/dashboard-sidebar";
import { getSpecialtyExperienceConfig, isOdontologySpecialty } from "@/lib/specialty-experience/engine";

interface SecretaryPermissions {
    can_view_agenda?: boolean;
    can_view_patients?: boolean;
    can_send_messages?: boolean;
}

export function useDashboardMenuGroups(
    userRole: "paciente" | "medico" | "secretaria" = "paciente",
    secretaryPermissions?: SecretaryPermissions,
    specialtyName?: string,
    subSpecialties?: string[]
): {
    menuGroups: MenuGroup[];
    dashboardRoute: string;
} {
    const dashboardRoute =
        userRole === "secretaria"
            ? "/dashboard/secretaria"
            : userRole === "medico"
                ? "/dashboard/medico"
                : "/dashboard/paciente";

    let menuGroups: MenuGroup[] = [];

    if (userRole === "secretaria") {
        menuGroups = [
            {
                label: "Principal",
                items: [
                    ...(secretaryPermissions?.can_view_agenda
                        ? [
                            {
                                key: "agenda",
                                label: "Agenda",
                                icon: "Calendar",
                                route: "/dashboard/secretaria/agenda",
                            },
                        ]
                        : []),
                    ...(secretaryPermissions?.can_view_patients
                        ? [
                            {
                                key: "pacientes",
                                label: "Pacientes",
                                icon: "User",
                                route: "/dashboard/secretaria/pacientes",
                            },
                        ]
                        : []),
                    ...(secretaryPermissions?.can_send_messages
                        ? [
                            {
                                key: "mensajes",
                                label: "Mensajes",
                                icon: "MessageSquare",
                                route: "/dashboard/secretaria/mensajes",
                            },
                        ]
                        : []),
                ],
            },
        ].filter((group) => group.items.length > 0);
    } else if (userRole === "medico") {
        const specialtyExperience = getSpecialtyExperienceConfig({
            specialtyName,
            subSpecialties,
        });

        const isOdontologist = isOdontologySpecialty(specialtyName);

        // Menú base - Ajustado según especialidad
        const baseItems = [
            {
                key: "citas",
                label: isOdontologist ? "Agenda & Operaciones" : "Agenda",
                icon: "Calendar",
                route: "/dashboard/medico/citas",
                description: isOdontologist ? "Citas, Morning Huddle, Lista de Espera" : undefined,
            },
            {
                key: "pacientes",
                label: "Pacientes",
                icon: "User",
                route: "/dashboard/medico/pacientes",
            },
            {
                key: "mensajeria",
                label: "Mensajes",
                icon: "MessageSquare",
                route: "/dashboard/medico/mensajeria",
            },
            {
                key: "estadisticas",
                label: "Estadísticas",
                icon: "Activity",
                route: "/dashboard/medico/estadisticas",
            },
        ];

        // Items específicos para médicos NO odontólogos
        if (!isOdontologist) {
            baseItems.splice(1, 0, {
                key: "consulta",
                label: "Consulta",
                icon: "Stethoscope",
                route: "/dashboard/medico/consulta",
            });
            baseItems.splice(4, 0, {
                key: "telemedicina",
                label: "Telemedicina",
                icon: "Video",
                route: "/dashboard/medico/telemedicina",
            });
            baseItems.splice(5, 0, {
                key: "recipes",
                label: "Recetas",
                icon: "Pill",
                route: "/dashboard/medico/recetas",
            });
        }

        menuGroups = [
            {
                label: "Principal",
                items: baseItems,
            },
        ];

        // Agregar menús de especialidad organizados por categorías
        if (specialtyExperience.modules.length > 0) {
            // Definir metadatos de grupos
            const groupMetadata: Record<string, { label: string; icon: string; order: number }> = {
                clinical: { label: "Clínica", icon: "Stethoscope", order: 1 },
                financial: { label: "Finanzas", icon: "DollarSign", order: 2 },
                lab: { label: "Laboratorio", icon: "FlaskConical", order: 3 },
                technology: { label: "Tecnología", icon: "Sparkles", order: 4 },
                communication: { label: "Comunicación", icon: "MessageCircle", order: 5 },
                growth: { label: "Crecimiento", icon: "TrendingUp", order: 6 },
            };

            // Agrupar módulos por categoría
            const modulesByGroup = specialtyExperience.modules.reduce((acc, module) => {
                const group = module.group || "other";
                if (!acc[group]) {
                    acc[group] = [];
                }
                acc[group].push(module);
                return acc;
            }, {} as Record<string, typeof specialtyExperience.modules>);

            // Crear MenuGroup para cada categoría
            Object.entries(modulesByGroup)
                .sort(([groupA], [groupB]) => {
                    const orderA = groupMetadata[groupA]?.order ?? 999;
                    const orderB = groupMetadata[groupB]?.order ?? 999;
                    return orderA - orderB;
                })
                .forEach(([groupKey, modules]) => {
                    const metadata = groupMetadata[groupKey];
                    menuGroups.push({
                        label: metadata?.label || groupKey,
                        icon: metadata?.icon,
                        items: modules,
                    });
                });
        }
    } else {
        menuGroups = [
            {
                label: "Principal",
                items: Object.entries(PATIENT_MODULE_CONFIG)
                    .filter(([key]) => key !== "configuracion") // Excluir configuración del menú
                    .map(([key, config]) => ({
                        key,
                        label: config.label,
                        icon: config.icon,
                        route: config.route,
                        color: config.color,
                    })),
            },
        ];
    }

    return { menuGroups, dashboardRoute };
}
