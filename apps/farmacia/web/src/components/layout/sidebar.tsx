"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  CalendarClock,
  Bell,
  Receipt,
  BarChart3,
  Truck,
  ClipboardList,
  FileText,
  MapPin,
  Star,
  Users,
  DollarSign,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Pill,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ScrollArea,
  Separator,
  Sheet,
  SheetContent,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import { createClient } from "@/lib/supabase/client";
import type { PharmacyProfile, UserProfile } from "@/lib/services/dashboard-service";

// ---------- Navigation config ----------

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Caja / POS", href: "/dashboard/caja", icon: ShoppingCart },
    ],
  },
  {
    title: "Inventario",
    items: [
      { label: "Productos", href: "/dashboard/inventario", icon: Package },
      { label: "Caducidades", href: "/dashboard/caducidades", icon: CalendarClock },
      { label: "Alertas", href: "/dashboard/alertas", icon: Bell },
    ],
  },
  {
    title: "Ventas",
    items: [
      { label: "Historial Ventas", href: "/dashboard/ventas", icon: Receipt },
      { label: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    ],
  },
  {
    title: "Compras",
    items: [
      { label: "Proveedores", href: "/dashboard/proveedores", icon: Truck },
      { label: "Pedidos", href: "/dashboard/pedidos", icon: ClipboardList },
    ],
  },
  {
    title: "Clientes",
    items: [
      { label: "Recetas", href: "/dashboard/recetas", icon: FileText },
      { label: "Entregas", href: "/dashboard/entregas", icon: MapPin },
      { label: "Fidelizacion", href: "/dashboard/fidelizacion", icon: Star },
    ],
  },
  {
    title: "Administracion",
    items: [
      { label: "Precios", href: "/dashboard/precios", icon: DollarSign },
      { label: "Personal", href: "/dashboard/personal", icon: Users },
      { label: "Seguros", href: "/dashboard/seguros", icon: Shield },
      { label: "Configuracion", href: "/dashboard/configuracion", icon: Settings },
    ],
  },
];

// ---------- Props ----------

interface SidebarProps {
  pharmacy: PharmacyProfile;
  user: UserProfile;
  unreadAlerts?: number;
}

// ---------- Sidebar content (shared between desktop + mobile) ----------

function SidebarNav({
  collapsed,
  pharmacy,
  user,
  unreadAlerts,
  onNavigate,
}: {
  collapsed: boolean;
  pharmacy: PharmacyProfile;
  user: UserProfile;
  unreadAlerts: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [router]);

  // Inject badge count into Alertas nav item
  const getItemBadge = (item: NavItem): number | undefined => {
    if (item.href === "/dashboard/alertas" && unreadAlerts > 0) {
      return unreadAlerts;
    }
    return item.badge;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Pharmacy header */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-slate-700/50">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
          {pharmacy.logoUrl ? (
            <img
              src={pharmacy.logoUrl}
              alt={pharmacy.pharmacyName}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <Pill className="h-5 w-5" />
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {pharmacy.pharmacyName}
            </p>
            {pharmacy.rif && (
              <p className="truncate text-xs text-slate-400">{pharmacy.rif}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="py-1">
              {!collapsed && (
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.title}
                </p>
              )}
              {collapsed && <Separator className="my-1 bg-slate-700/50" />}
              {group.items.map((item) => {
                const active = isActive(item.href);
                const badge = getItemBadge(item);
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        active ? "text-blue-400" : "text-slate-400 group-hover:text-white",
                      )}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge != null && badge > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badge != null && badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <div className="relative">{linkContent}</div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{linkContent}</div>;
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User profile at bottom */}
      <div className="border-t border-slate-700/50 p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "flex-col",
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
            <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          )}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar sesion</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="shrink-0 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Main sidebar export ----------

export function Sidebar({ pharmacy, user, unreadAlerts = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-800 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] lg:flex sidebar-transition",
          collapsed ? "w-[72px]" : "w-[280px]",
        )}
      >
        <SidebarNav
          collapsed={collapsed}
          pharmacy={pharmacy}
          user={user}
          unreadAlerts={unreadAlerts}
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-md hover:text-white transition-colors"
          aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile hamburger trigger (rendered in navbar, but we export the state) */}
      <MobileMenuButton open={mobileOpen} onToggle={() => setMobileOpen((o) => !o)} />

      {/* Mobile sheet sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] border-slate-800">
          <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
          <SidebarNav
            collapsed={false}
            pharmacy={pharmacy}
            user={user}
            unreadAlerts={unreadAlerts}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Spacer for desktop to push content right */}
      <div
        className={cn(
          "hidden lg:block shrink-0 sidebar-transition",
          collapsed ? "w-[72px]" : "w-[280px]",
        )}
      />
    </TooltipProvider>
  );
}

// ---------- Mobile menu button (used by navbar) ----------

function MobileMenuButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden fixed top-3 left-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
      aria-label={open ? "Cerrar menu" : "Abrir menu"}
    >
      {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}

export { NAV_GROUPS };
