"use client";

import { usePathname } from "next/navigation";
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
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
}

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

export function PatientSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:w-60 flex-col bg-white border-r border-gray-100 sticky top-16 h-[calc(100vh-4rem)]">
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.highlight && !active
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${
                item.highlight && !active
                  ? "text-white"
                  : active
                    ? "text-emerald-600"
                    : "text-gray-400"
              }`} />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
