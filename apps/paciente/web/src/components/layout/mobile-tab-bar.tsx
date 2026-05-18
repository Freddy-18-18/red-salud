"use client";

import {
  Home,
  CalendarPlus,
  Calendar,
  MessageSquare,
  Menu,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabLink {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
  highlight?: boolean;
}

interface TabAction {
  type: "action";
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export type TabItem = TabLink | TabAction;

export const MOBILE_TABS: TabItem[] = [
  { type: "link", label: "Inicio", href: "/dashboard", icon: Home },
  { type: "link", label: "Citas", href: "/dashboard/citas", icon: Calendar },
  {
    type: "link",
    label: "Agendar",
    href: "/dashboard/agendar",
    icon: CalendarPlus,
    highlight: true,
  },
  {
    type: "link",
    label: "Mensajes",
    href: "/dashboard/mensajes",
    icon: MessageSquare,
  },
  { type: "action", label: "Más", icon: Menu },
];

interface MobileTabBarProps {
  onMenuClick: () => void;
}

export function MobileTabBar({ onMenuClick }: MobileTabBarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_TABS.map((tab) => {
          const active = tab.type === "link" ? isActive(tab.href) : false;
          const className = `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg min-w-[60px] transition-colors ${
            tab.highlight ? "-mt-3" : ""
          } ${
            active
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-[hsl(var(--muted-foreground))]"
          }`;

          const inner = (
            <>
              {tab.highlight ? (
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                    active ? "bg-emerald-600" : "bg-emerald-500"
                  }`}
                >
                  <tab.icon className="h-6 w-6 text-white" />
                </div>
              ) : (
                <tab.icon
                  className={`h-5 w-5 ${
                    active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-[hsl(var(--muted-foreground))]"
                  }`}
                />
              )}
              <span
                className={`text-[10px] font-medium ${
                  tab.highlight
                    ? "text-emerald-600 dark:text-emerald-400"
                    : active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {tab.label}
              </span>
            </>
          );

          if (tab.type === "link") {
            return (
              <Link key={tab.label} href={tab.href} className={className}>
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={tab.label}
              type="button"
              onClick={onMenuClick}
              className={className}
              aria-label="Más opciones"
            >
              {inner}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
