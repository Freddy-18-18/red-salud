import { PATIENT_MODULE_CONFIG } from "@/lib/constants";
import { MenuGroup } from "@/components/dashboard/layout/dashboard-sidebar";

interface SecretaryPermissions {
    can_view_agenda?: boolean;
    can_view_patients?: boolean;
    can_send_messages?: boolean;
}

export function useDashboardMenuGroups(
    userRole: "paciente" | "medico" | "secretaria" = "paciente",
    secretaryPermissions?: SecretaryPermissions
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
        menuGroups = [
            {
                label: "Principal",
                items: [
                    {
                        key: "citas",
                        label: "Agenda",
                        icon: "Calendar",
                        route: "/dashboard/medico/citas",
                    },
                    {
                        key: "consulta",
                        label: "Consulta",
                        icon: "Stethoscope",
                        route: "/dashboard/medico/consulta",
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
                        key: "telemedicina",
                        label: "Telemedicina",
                        icon: "Video",
                        route: "/dashboard/medico/telemedicina",
                    },
                    {
                        key: "recipes",
                        label: "Recipes",
                        icon: "Pill",
                        route: "/dashboard/medico/recetas",
                    },
                    {
                        key: "estadisticas",
                        label: "Estadísticas",
                        icon: "Activity",
                        route: "/dashboard/medico/estadisticas",
                    },
                ],
            },
        ];
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
