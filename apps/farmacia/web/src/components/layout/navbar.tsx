"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import type { ExchangeRate } from "@/lib/services/exchange-rate-service";
import type { PharmacyProfile, UserProfile } from "@/lib/services/dashboard-service";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

// ---------- Breadcrumb generation ----------

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  caja: "Caja / POS",
  productos: "Productos",
  caducidades: "Caducidades",
  alertas: "Alertas",
  ventas: "Historial Ventas",
  reportes: "Reportes",
  proveedores: "Proveedores",
  pedidos: "Pedidos",
  recetas: "Recetas",
  entregas: "Entregas",
  fidelizacion: "Fidelizacion",
  personal: "Personal",
  seguros: "Seguros",
  configuracion: "Configuracion",
  inventario: "Inventario",
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    label: ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
    href: "/" + segments.slice(0, index + 1).join("/"),
    isLast: index === segments.length - 1,
  }));
}

// ---------- Props ----------

interface NavbarProps {
  pharmacy: PharmacyProfile;
  user: UserProfile;
  exchangeRate: ExchangeRate | null;
  unreadAlerts: number;
  criticalAlerts: number;
}

// ---------- Navbar ----------

export function Navbar({
  pharmacy,
  user,
  exchangeRate,
  unreadAlerts,
  criticalAlerts,
}: NavbarProps) {
  const breadcrumbs = useBreadcrumbs();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [router]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile: pharmacy name (offset for hamburger) */}
      <div className="lg:hidden flex items-center gap-2 pl-12">
        <h1 className="text-sm font-semibold text-slate-900 truncate">
          {pharmacy.pharmacyName}
        </h1>
      </div>

      {/* Desktop: breadcrumbs */}
      <nav className="hidden lg:flex items-center gap-1 text-sm text-slate-500">
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {!crumb.isLast ? (
              <>
                <Link
                  href={crumb.href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </>
            ) : (
              <span className="font-medium text-slate-900">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search (desktop only) */}
      <div className="hidden lg:block relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Buscar productos, recetas..."
          className="h-9 pl-9 bg-slate-50 border-slate-200 text-sm"
        />
      </div>

      {/* BCV exchange rate */}
      {exchangeRate && (
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            BCV
          </span>
          <span className="text-sm font-bold text-slate-900">
            Bs. {exchangeRate.rate.toFixed(2)}
          </span>
          {exchangeRate.source !== "fallback" ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="text-[10px] text-slate-400">
            {exchangeRate.source === "fallback"
              ? "Sin datos"
              : new Date(exchangeRate.validDate).toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "short",
                })}
          </span>
        </div>
      )}

      {/* Notifications bell */}
      <Link href="/dashboard/alertas" className="relative">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-slate-500 hover:text-slate-900",
            criticalAlerts > 0 && "text-red-500 hover:text-red-600",
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadAlerts > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                criticalAlerts > 0 ? "bg-red-500" : "bg-blue-500",
              )}
            >
              {unreadAlerts > 99 ? "99+" : unreadAlerts}
            </span>
          )}
        </Button>
      </Link>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2 hover:bg-slate-100">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {user.fullName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/configuracion">Configuracion</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/personal">Gestionar Personal</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600"
          >
            Cerrar sesion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
