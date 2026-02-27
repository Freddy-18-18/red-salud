import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CONFIGURACION_MEGA_MENU } from "@/components/dashboard/medico/configuracion/configuracion-mega-menu-config";
import { ESTADISTICAS_MEGA_MENU } from "@/components/dashboard/medico/estadisticas/estadisticas-mega-menu-config";
import { MegaMenuSection } from "@/components/dashboard/medico/configuracion/configuracion-mega-menu-config";

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
                        ? "/consultorio/configuracion"
                        : `/consultorio/configuracion?tab=${itemId}`;
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
                        ? "/consultorio/estadisticas"
                        : `/consultorio/estadisticas?tab=${itemId}`;
                router.push(newUrl, { scroll: false });
            },
        };
    }

    return undefined;
}
