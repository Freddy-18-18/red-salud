'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SpecialtyConfig } from '@/lib/specialties';
import { getSpecialtyMenuGroups } from '@/lib/specialties';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Pill,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SidebarProps {
  doctorName: string;
  specialtyName: string;
  avatarUrl?: string | null;
  specialtyConfig: SpecialtyConfig;
}

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ============================================================================
// ICON MAP — Maps string icon names from config to Lucide components
// ============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Pill,
  BarChart3,
  Settings,
  ShieldCheck,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? LayoutDashboard;
}

// ============================================================================
// CORE NAVIGATION — Always visible for all specialties
// ============================================================================

const CORE_NAV: NavItem[] = [
  { key: 'dashboard', label: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'agenda', label: 'Agenda', icon: Calendar, href: '/dashboard/agenda' },
  { key: 'pacientes', label: 'Pacientes', icon: Users, href: '/dashboard/pacientes' },
  { key: 'consulta', label: 'Consulta', icon: Stethoscope, href: '/dashboard/consulta' },
  { key: 'recetas', label: 'Recetas', icon: Pill, href: '/dashboard/recetas' },
];

const CONFIG_NAV: NavItem[] = [
  { key: 'estadisticas', label: 'Estadísticas', icon: BarChart3, href: '/dashboard/estadisticas' },
  { key: 'verificacion', label: 'Verificación', icon: ShieldCheck, href: '/dashboard/verificacion' },
  { key: 'configuracion', label: 'Configuración', icon: Settings, href: '/dashboard/configuracion' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardSidebar({
  doctorName,
  specialtyName,
  avatarUrl,
  specialtyConfig,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Build specialty nav groups from config
  const specialtyGroups = getSpecialtyMenuGroups(specialtyConfig);

  const themeColor = specialtyConfig.theme?.primaryColor ?? '#3B82F6';

  function isActive(href: string): boolean {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }

  // ---- Render helpers ----

  function renderNavItem(item: NavItem) {
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.key}
        href={item.href}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-150 group relative
          ${active
            ? 'text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }
        `}
        style={active ? { backgroundColor: themeColor } : undefined}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
        {!collapsed && (
          <>
            <span className="truncate">{item.label}</span>
            {item.badge !== undefined && (
              <span className={`
                ml-auto text-xs font-semibold px-2 py-0.5 rounded-full
                ${active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  }

  function renderNavGroup(group: { label: string; items: Array<{ key: string; label: string; icon: string; route: string; badge?: string | number }> }, index: number) {
    if (group.items.length === 0) return null;

    const navItems: NavItem[] = group.items.map((item) => ({
      key: item.key,
      label: item.label,
      icon: getIcon(item.icon),
      href: item.route,
      badge: item.badge,
    }));

    return (
      <div key={`specialty-${index}`} className="mt-4">
        {!collapsed && (
          <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {group.label}
          </p>
        )}
        <nav className="space-y-0.5">
          {navItems.map(renderNavItem)}
        </nav>
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header: Doctor identity */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={doctorName} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              doctorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{doctorName}</p>
              <p className="text-xs text-gray-500 truncate">{specialtyName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Core navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Principal
          </p>
        )}
        <nav className="space-y-0.5">
          {CORE_NAV.map(renderNavItem)}
        </nav>

        {/* Specialty-specific navigation */}
        {specialtyGroups.length > 0 && specialtyGroups.map((group, i) => renderNavGroup(group, i))}

        {/* Configuration section */}
        <div className="mt-4">
          {!collapsed && (
            <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Configuración
            </p>
          )}
          <nav className="space-y-0.5">
            {CONFIG_NAV.map(renderNavItem)}
          </nav>
        </div>
      </div>

      {/* Footer: Collapse toggle */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span className="ml-2">Colapsar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="absolute right-3 top-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col bg-white border-r border-gray-200 flex-shrink-0
          transition-all duration-200 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
