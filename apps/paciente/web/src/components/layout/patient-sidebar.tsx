"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PanelLeftClose,
  PanelLeft,
  PanelLeftDashed,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { PatientSidebarNav } from "./patient-sidebar-nav";

export type SidebarMode = "open" | "hover" | "closed";

const STORAGE_KEY = "paciente-sidebar-mode";
const W_OPEN = 240;
const W_COLLAPSED = 64;

const MODE_CYCLE: Record<SidebarMode, SidebarMode> = {
  open: "hover",
  hover: "closed",
  closed: "open",
};

const MODE_ICON: Record<SidebarMode, LucideIcon> = {
  open: PanelLeftClose,
  hover: PanelLeftDashed,
  closed: PanelLeft,
};

const MODE_TOOLTIP: Record<SidebarMode, string> = {
  open: "Colapsar al pasar mouse",
  hover: "Colapsar siempre",
  closed: "Expandir siempre",
};

function useSidebarMode() {
  const [mode, setMode] = useState<SidebarMode>("open");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SidebarMode | null;
    if (stored === "open" || stored === "hover" || stored === "closed") {
      setMode(stored);
    }
    setMounted(true);
  }, []);

  const cycleMode = useCallback(() => {
    setMode((prev) => {
      const next = MODE_CYCLE[prev];
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { mode, cycleMode, mounted };
}

export function PatientSidebar() {
  const pathname = usePathname();
  const { mode, cycleMode, mounted } = useSidebarMode();
  const [hovered, setHovered] = useState(false);

  const effectiveMode = mounted ? mode : "open";
  const expanded = effectiveMode === "open" || (effectiveMode === "hover" && hovered);
  const width = expanded ? W_OPEN : W_COLLAPSED;

  const ToggleIcon = MODE_ICON[effectiveMode];

  return (
    <aside
      onMouseEnter={() => effectiveMode === "hover" && setHovered(true)}
      onMouseLeave={() => effectiveMode === "hover" && setHovered(false)}
      style={{ width }}
      className={`hidden lg:flex flex-col bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] sticky top-16 h-[calc(100vh-4rem)] overflow-hidden transition-[width] duration-200 ease-in-out ${
        effectiveMode === "hover" && hovered ? "absolute z-30 shadow-lg" : "relative"
      }`}
    >
      <PatientSidebarNav pathname={pathname} expanded={expanded} />

      {mounted && (
        <div className="border-t border-[hsl(var(--border))] p-2 flex justify-center">
          <button
            type="button"
            onClick={cycleMode}
            title={MODE_TOOLTIP[effectiveMode]}
            className="flex items-center justify-center rounded-full h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors duration-150"
          >
            <ToggleIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
