import { useRouter, usePathname, useSearchParams } from "next/navigation";
// TODO: Import these configs from the app when component configs are migrated
type MegaMenuSection = { id: string; title: string; items: any[] };
declare const CONFIGURACION_MEGA_MENU: MegaMenuSection[];
declare const ESTADISTICAS_MEGA_MENU: MegaMenuSection[];

export interface MegaMenuConfig {
    sections: MegaMenuSection[];
    activeItem: string;
    onItemClick: (itemId: string) => void;
}

export function useMegaMenuConfig(): MegaMenuConfig | undefined {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Detectar si estamos en la página de configuración o estadísticas
    const isConfiguracionPage = pathname?.includes("/configuracion");
    const isEstadisticasPage = pathname?.includes("/estadisticas");

    const activeTab = (searchParams?.get("tab") as string) || (isConfiguracionPage ? "perfil" : "resumen");

    if (isConfiguracionPage) {
        return {
            sections: CONFIGURACION_MEGA_MENU,
            activeItem: activeTab,
            onItemClick: (itemId: string) => {
                const newUrl =
                    itemId === "perfil"
                        ? "/dashboard/medico/configuracion"
                        : `/dashboard/medico/configuracion?tab=${itemId}`;
                router.push(newUrl, { scroll: false });
            },
        };
    }

    if (isEstadisticasPage) {
        return {
            sections: ESTADISTICAS_MEGA_MENU,
            activeItem: activeTab,
            onItemClick: (itemId: string) => {
                const newUrl =
                    itemId === "resumen"
                        ? "/dashboard/medico/estadisticas"
                        : `/dashboard/medico/estadisticas?tab=${itemId}`;
                router.push(newUrl, { scroll: false });
            },
        };
    }

    return undefined;
}
