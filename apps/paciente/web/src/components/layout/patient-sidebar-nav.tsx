"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRightLeft,
  Bell,
  Bot,
  Calendar,
  CalendarPlus,
  ChevronDown,
  Clock,
  FileText,
  FolderOpen,
  HeartPulse,
  Home,
  IdCard,
  MessageSquare,
  Receipt,
  Scale,
  Search,
  ShieldAlert,
  Star,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Sidebar information architecture (5 semantic groups).
 * Reduces cognitive load from 20 flat items -> 5 scannable buckets.
 * Group order: most-frequent-first per UX audit (engram #153).
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "salud",
    label: "Salud",
    items: [
      { label: "Inicio", href: "/dashboard", icon: Home },
      { label: "Health Score", href: "/dashboard/health-score", icon: HeartPulse },
      { label: "Mis Cronicos", href: "/dashboard/cronicos", icon: Activity },
      { label: "Historial", href: "/dashboard/historial", icon: Clock },
      { label: "Documentos", href: "/dashboard/documentos", icon: FolderOpen },
    ],
  },
  {
    id: "atencion",
    label: "Atencion Medica",
    items: [
      { label: "Agendar Cita", href: "/dashboard/agendar", icon: CalendarPlus, highlight: true },
      { label: "Mis Citas", href: "/dashboard/citas", icon: Calendar },
      { label: "Buscar Medico", href: "/dashboard/buscar-medico", icon: Search },
      { label: "Comparador", href: "/dashboard/comparador", icon: Scale },
      { label: "Referencias", href: "/dashboard/referencias-medicas", icon: ArrowRightLeft },
      { label: "Valoraciones", href: "/dashboard/valoraciones", icon: Star },
    ],
  },
  {
    id: "comunicacion",
    label: "Comunicacion",
    items: [
      { label: "Mensajes", href: "/dashboard/mensajes", icon: MessageSquare },
      { label: "Notificaciones", href: "/dashboard/notificaciones", icon: Bell },
      { label: "Asistente IA", href: "/dashboard/asistente-ia", icon: Bot },
    ],
  },
  {
    id: "servicios",
    label: "Recetas y Servicios",
    items: [
      { label: "Recetas", href: "/dashboard/recetas", icon: FileText },
      { label: "QR Medico", href: "/dashboard/qr-medico", icon: IdCard },
      { label: "Perfil Emergencia", href: "/dashboard/emergencia-perfil", icon: ShieldAlert },
      { label: "Gastos Medicos", href: "/dashboard/gastos", icon: Receipt },
      { label: "Recompensas", href: "/dashboard/recompensas", icon: Trophy },
    ],
  },
  {
    id: "perfil",
    label: "Perfil",
    items: [{ label: "Mi Perfil", href: "/dashboard/perfil", icon: User }],
  },
];

/** Flat list — kept for any consumer that still needs the full list. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isActive(itemHref: string, currentPathname: string): boolean {
  if (itemHref === "/dashboard") return currentPathname === "/dashboard";
  return currentPathname === itemHref || currentPathname.startsWith(`${itemHref}/`);
}

const COLLAPSE_STORAGE_KEY = "paciente-sidebar-groups";

function useGroupCollapsedState() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (stored) setCollapsed(JSON.parse(stored));
    } catch {
      // ignore malformed json
    }
    setMounted(true);
  }, []);

  const toggle = (groupId: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  };

  return { collapsed, toggle, mounted };
}

interface PatientSidebarNavProps {
  pathname: string;
  expanded: boolean;
  onItemClick?: () => void;
}

export function PatientSidebarNav({ pathname, expanded, onItemClick }: PatientSidebarNavProps) {
  const { collapsed, toggle, mounted } = useGroupCollapsedState();

  // Collapsed (icon-only) sidebar: render flat icons with subtle separators
  // between groups. Headings are hidden because there's no horizontal space.
  if (!expanded) {
    return (
      <nav
        aria-label="Navegacion principal"
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center py-2"
      >
        {NAV_GROUPS.map((group, idx) => (
          <div key={group.id} className="flex flex-col items-center gap-1 w-full">
            {idx > 0 && (
              <div
                aria-hidden="true"
                className="w-8 h-px bg-[hsl(var(--border))] my-1"
              />
            )}
            {group.items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                active={isActive(item.href, pathname)}
                expanded={false}
                onClick={onItemClick}
              />
            ))}
          </div>
        ))}
      </nav>
    );
  }

  // Expanded sidebar: render groups with headings + collapsible regions.
  return (
    <nav
      aria-label="Navegacion principal"
      className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1"
    >
      {NAV_GROUPS.map((group) => {
        const isCollapsed = mounted ? !!collapsed[group.id] : false;
        const groupHeadingId = `sidebar-group-${group.id}`;

        return (
          <div key={group.id} className="pb-1">
            <button
              type="button"
              id={groupHeadingId}
              onClick={() => toggle(group.id)}
              aria-expanded={!isCollapsed}
              aria-controls={`${groupHeadingId}-list`}
              className="w-full flex items-center justify-between px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <span>{group.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  isCollapsed ? "-rotate-90" : "rotate-0"
                }`}
                aria-hidden="true"
              />
            </button>
            {!isCollapsed && (
              <ul
                id={`${groupHeadingId}-list`}
                role="list"
                aria-labelledby={groupHeadingId}
                className="space-y-0.5"
              >
                {group.items.map((item) => (
                  <li key={item.href}>
                    <SidebarItem
                      item={item}
                      active={isActive(item.href, pathname)}
                      expanded
                      onClick={onItemClick}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

interface SidebarItemProps {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  onClick?: () => void;
}

function SidebarItem({ item, active, expanded, onClick }: SidebarItemProps) {
  const isHighlight = item.highlight && !active;
  const Icon = item.icon;

  // Highlight (primary CTA — "Agendar Cita") overrides the active state styling
  // because it should stand out even when the user is on another page.
  const baseClasses = expanded
    ? "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap"
    : "relative flex items-center justify-center h-10 w-10 rounded-xl text-sm font-medium transition-colors";

  const stateClasses = isHighlight
    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 shadow-sm"
    : active
      ? "bg-[hsl(var(--accent-domain))]/10 text-[hsl(var(--foreground))]"
      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]";

  return (
    <Link
      href={item.href}
      title={!expanded ? item.label : undefined}
      onClick={onClick}
      data-active={active ? "true" : "false"}
      aria-current={active ? "page" : undefined}
      className={`${baseClasses} ${stateClasses}`}
    >
      {/* Active indicator — left border in domain accent (coral for paciente). */}
      {active && !isHighlight && expanded && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[hsl(var(--accent-domain))]"
        />
      )}
      <Icon
        className={`shrink-0 h-5 w-5 ${
          isHighlight
            ? "text-[hsl(var(--primary-foreground))]"
            : active
              ? "text-[hsl(var(--accent-domain))]"
              : "text-[hsl(var(--muted-foreground))]"
        }`}
      />
      {expanded && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
