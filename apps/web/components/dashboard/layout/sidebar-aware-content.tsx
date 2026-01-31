"use client";

import { useEffect, useState } from "react";
import { cn } from "@red-salud/core/utils";

interface SidebarAwareContentProps {
  children: React.ReactNode;
  className?: string;
  userRole?: string;
}

export function SidebarAwareContent({
  children,
  className,
  userRole
}: SidebarAwareContentProps) {
  const [currentMode, setCurrentMode] = useState<string>("hover");

  // Calcular width basado en el modo actual (derivado)
  // FIX: En modo hover y collapsed, reservamos espacio para la barra colapsada (48px)
  const sidebarWidth = currentMode === "expanded" ? 256 : 48;

  useEffect(() => {
    // 1. Leer estado inicial
    const savedMode = localStorage.getItem("sidebar-mode") || "hover";
    setCurrentMode(savedMode);

    // 2. Suscribirse a cambios
    const handleSidebarModeChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setCurrentMode(customEvent.detail.mode);
    };

    window.addEventListener("sidebar-mode-change", handleSidebarModeChange);
    return () => {
      window.removeEventListener("sidebar-mode-change", handleSidebarModeChange);
    };
  }, []);

  return (
    <main
      className={cn(
        "flex-1 min-h-full transition-all duration-200 ease-out",
        // En mobile: ancho completo, sin margen
        "w-full ml-0",
        // En desktop: margen y ancho ajustados según el sidebar
        "md:ml-[var(--sidebar-width)] md:w-[calc(100%-var(--sidebar-width))]",
        className
      )}
      style={{
        "--sidebar-width": `${sidebarWidth}px`
      } as React.CSSProperties}
    >
      <div className={userRole === "medico" ? "" : "pt-14 md:pt-0"}>
        {children}
      </div>
    </main>
  );
}
