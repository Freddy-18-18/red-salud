"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Home,
  Search,
  CalendarPlus,
  Calendar,
  Clock,
  MessageSquare,
  User,
  FileText,
  Trophy,
  HeartPulse,
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

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/dashboard", icon: Home },
  { label: "Agendar Cita", href: "/dashboard/agendar", icon: CalendarPlus, highlight: true },
  { label: "Buscar Medico", href: "/dashboard/buscar-medico", icon: Search },
  { label: "Mis Citas", href: "/dashboard/citas", icon: Calendar },
  { label: "Historial", href: "/dashboard/historial", icon: Clock },
  { label: "Asistente IA", href: "/dashboard/asistente-ia", icon: Bot },
  { label: "Recetas", href: "/dashboard/recetas", icon: FileText },
  { label: "Documentos", href: "/dashboard/documentos", icon: FolderOpen },
  { label: "QR Medico", href: "/dashboard/qr-medico", icon: IdCard },
  { label: "Mensajes", href: "/dashboard/mensajes", icon: MessageSquare },
  { label: "Recompensas", href: "/dashboard/recompensas", icon: Trophy },
  { label: "Health Score", href: "/dashboard/health-score", icon: HeartPulse },
  { label: "Mi Perfil", href: "/dashboard/perfil", icon: User },
];

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

function useSidebarMode() {
  // Start with "open" — matches the server render (no localStorage on server)
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PatientSidebar() {
  const pathname = usePathname();
  const { mode, cycleMode, mounted } = useSidebarMode();
  const [hovered, setHovered] = useState(false);

  // Before mount, always render as "open" to match SSR
  const effectiveMode = mounted ? mode : "open";
  const expanded = effectiveMode === "open" || (effectiveMode === "hover" && hovered);
  const width = expanded ? W_OPEN : W_COLLAPSED;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const ToggleIcon = MODE_ICON[effectiveMode];

  return (
    <aside
      onMouseEnter={() => effectiveMode === "hover" && setHovered(true)}
      onMouseLeave={() => effectiveMode === "hover" && setHovered(false)}
      style={{ width }}
      className={`hidden lg:flex flex-col bg-white border-r border-gray-100 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden transition-[width] duration-200 ease-in-out ${
        effectiveMode === "hover" && hovered ? "absolute z-30 shadow-lg" : "relative"
      }`}
    >
      {/* Nav links */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${
        expanded ? "p-2 space-y-1" : "flex flex-col items-center py-2 gap-1"
      }`}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const isHighlight = item.highlight && !active;

          return (
            <a
              key={item.href}
              href={item.href}
              title={!expanded ? item.label : undefined}
              className={`flex items-center rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                expanded
                  ? "gap-3 px-3 py-2.5"
                  : "justify-center h-10 w-10"
              } ${
                isHighlight
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  : active
                    ? `bg-emerald-50 text-emerald-700 ${!expanded ? "ring-1 ring-emerald-200" : ""}`
                    : `text-gray-600 hover:text-gray-900 ${expanded ? "hover:bg-gray-50" : "hover:bg-gray-100"}`
              }`}
            >
              <item.icon
                className={`shrink-0 ${expanded ? "h-5 w-5" : "h-5 w-5"} ${
                  isHighlight
                    ? "text-white"
                    : active
                      ? "text-emerald-600"
                      : "text-gray-500"
                }`}
              />
              <span
                className={`truncate transition-opacity duration-150 ${
                  expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Toggle button — only show after mount to avoid hydration mismatch */}
      {mounted && (
        <div className="border-t border-gray-100 p-2 flex justify-center">
          <button
            type="button"
            onClick={cycleMode}
            title={MODE_TOOLTIP[effectiveMode]}
            className="flex items-center justify-center rounded-full h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-150"
          >
            <ToggleIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
