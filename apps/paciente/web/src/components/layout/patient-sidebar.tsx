"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Home,
  Search,
  CalendarPlus,
  Calendar,
  Clock,
  MessageSquare,
  User,
  FileText,
  Trophy,
  FolderOpen,
  IdCard,
  PanelLeftClose,
  PanelLeft,
  PanelLeftDashed,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SidebarMode = "open" | "hover" | "closed";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "paciente-sidebar-mode";

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

export const SIDEBAR_WIDTH_OPEN = 240; // ~w-60
export const SIDEBAR_WIDTH_COLLAPSED = 64; // ~w-16

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/dashboard", icon: Home },
  { label: "Agendar Cita", href: "/dashboard/agendar", icon: CalendarPlus, highlight: true },
  { label: "Buscar Medico", href: "/dashboard/buscar-medico", icon: Search },
  { label: "Mis Citas", href: "/dashboard/citas", icon: Calendar },
  { label: "Historial", href: "/dashboard/historial", icon: Clock },
  { label: "Recetas", href: "/dashboard/recetas", icon: FileText },
  { label: "Documentos", href: "/dashboard/documentos", icon: FolderOpen },
  { label: "QR Medico", href: "/dashboard/qr-medico", icon: IdCard },
  { label: "Mensajes", href: "/dashboard/mensajes", icon: MessageSquare },
  { label: "Recompensas", href: "/dashboard/recompensas", icon: Trophy },
  { label: "Mi Perfil", href: "/dashboard/perfil", icon: User },
];

/* ------------------------------------------------------------------ */
/*  Hook: useSidebarMode                                               */
/* ------------------------------------------------------------------ */

function useSidebarMode() {
  const [mode, setMode] = useState<SidebarMode>("open");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SidebarMode | null;
    if (stored && (stored === "open" || stored === "hover" || stored === "closed")) {
      setMode(stored);
    }
    setHydrated(true);
  }, []);

  const cycleMode = useCallback(() => {
    setMode((prev) => {
      const next = MODE_CYCLE[prev];
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { mode, cycleMode, hydrated };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface PatientSidebarProps {
  onWidthChange?: (width: number) => void;
}

export function PatientSidebar({ onWidthChange }: PatientSidebarProps) {
  const pathname = usePathname();
  const { mode, cycleMode, hydrated } = useSidebarMode();
  const [hovered, setHovered] = useState(false);

  // Derived: is the sidebar visually expanded right now?
  const expanded = mode === "open" || (mode === "hover" && hovered);

  // Notify parent about the "resting" width (not the hover-expanded width)
  useEffect(() => {
    const restingWidth = mode === "open" ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_COLLAPSED;
    onWidthChange?.(restingWidth);
  }, [mode, onWidthChange]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const ToggleIcon = MODE_ICON[mode];

  return (
    <aside
      suppressHydrationWarning
      onMouseEnter={() => mode === "hover" && setHovered(true)}
      onMouseLeave={() => mode === "hover" && setHovered(false)}
      style={{ width: expanded ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_COLLAPSED }}
      className={[
        "hidden lg:flex flex-col bg-white border-r border-gray-100",
        "sticky top-16 h-[calc(100vh-4rem)] overflow-hidden",
        "transition-[width] duration-200 ease-in-out",
        // In hover mode when expanded, float over content
        mode === "hover" && hovered ? "absolute z-30 shadow-lg" : "relative",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Nav links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              title={!expanded ? item.label : undefined}
              className={[
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center",
                item.highlight && !active
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <item.icon
                className={[
                  "h-5 w-5 shrink-0",
                  item.highlight && !active
                    ? "text-white"
                    : active
                      ? "text-emerald-600"
                      : "text-gray-400",
                ].join(" ")}
              />
              {expanded && <span className="truncate">{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="border-t border-gray-100 p-2 flex justify-center">
        <button
          type="button"
          onClick={cycleMode}
          title={MODE_TOOLTIP[mode]}
          className={[
            "flex items-center justify-center rounded-full",
            "h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50",
            "transition-colors duration-150",
          ].join(" ")}
        >
          <ToggleIcon className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
