"use client";

import { usePathname } from "next/navigation";
import {
  Home,
  CalendarPlus,
  Calendar,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";

interface TabItem {
  label: string;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
}

const TABS: TabItem[] = [
  { label: "Inicio", href: "/dashboard", icon: Home },
  { label: "Citas", href: "/dashboard/citas", icon: Calendar },
  { label: "Agendar", href: "/dashboard/agendar", icon: CalendarPlus, highlight: true },
  { label: "Mensajes", href: "/dashboard/mensajes", icon: MessageSquare },
  { label: "Perfil", href: "/dashboard/perfil", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <a
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg min-w-[60px] transition-colors ${
                tab.highlight
                  ? "-mt-3"
                  : ""
              } ${
                active ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {tab.highlight ? (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                  active ? "bg-emerald-600" : "bg-emerald-500"
                }`}>
                  <tab.icon className="h-6 w-6 text-white" />
                </div>
              ) : (
                <tab.icon className={`h-5 w-5 ${active ? "text-emerald-600" : "text-gray-400"}`} />
              )}
              <span className={`text-[10px] font-medium ${
                tab.highlight
                  ? "text-emerald-600"
                  : active
                    ? "text-emerald-600"
                    : "text-gray-400"
              }`}>
                {tab.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
