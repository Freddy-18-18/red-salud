"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@red-salud/core/utils";
import { Stethoscope } from "lucide-react";

/**
 * Toggle button for "Modo Clínico" (Advanced Mode) in the header.
 * Uses URL search params to persist state across page components.
 */
export function ClinicModeToggle() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isActive = searchParams.get("modo") === "clinico";

    const handleToggle = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (isActive) {
            params.delete("modo");
        } else {
            params.set("modo", "clinico");
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={cn(
                "relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full",
                "border transition-all duration-200",
                isActive
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent shadow-sm shadow-violet-500/30"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
            title={isActive ? "Desactivar Modo Clínico" : "Activar Modo Clínico"}
        >
            <Stethoscope className={cn("h-3.5 w-3.5", isActive && "text-white")} />
            <span>{isActive ? "Clínico" : "Clínico"}</span>
            {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
        </button>
    );
}
