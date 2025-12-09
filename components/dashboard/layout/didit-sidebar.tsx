"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  MessageSquare,
  FlaskConical,
  Video,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Mapa de iconos
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  MessageSquare,
  FlaskConical,
  Video,
  Star,
  Settings,
};

export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  color?: string;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export interface DiditSidebarProps {
  userName?: string;
  userEmail?: string;
  menuGroups: MenuGroup[];
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function DiditSidebar({
  userName = "Usuario",
  menuGroups,
  onProfileClick,
  onLogout,
}: DiditSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  const isActive = (route: string) => {
    // Comparación exacta para evitar que múltiples rutas estén activas
    return pathname === route;
  };

  // Aplanar todos los items de todos los grupos
  const allItems = menuGroups.flatMap(group => group.items);

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo activar si el sidebar tiene el foco
      if (!navRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % allItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0) {
            window.location.href = allItems[focusedIndex].route;
          }
          break;
        case "Escape":
          e.preventDefault();
          setFocusedIndex(-1);
          break;
        // Atajo para colapsar/expandir: Ctrl/Cmd + B
        case "b":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setCollapsed(!collapsed);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, allItems, collapsed]);

  return (
    <motion.div
      data-state={collapsed ? "collapsed" : "expanded"}
      data-collapsible="icon"
      className="group peer hidden md:block h-screen sticky top-0"
      animate={{ width: collapsed ? 72 : 224 }}
      transition={{ duration: 0.2, ease: "linear" }}
    >
      {/* Sidebar Container */}
      <div className="h-full p-2">
        <div
          data-sidebar="sidebar"
          className="bg-white border border-gray-200 rounded-lg shadow-sm flex h-full w-full flex-col"
        >
          {/* Header - User Info */}
          <div
            data-sidebar="header"
            data-tour="sidebar-profile"
            className={cn(
              "flex items-center border-b border-gray-200 p-3 transition-all",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <button
              onClick={onProfileClick}
              className={cn(
                "inline-flex items-center gap-2 rounded-md hover:bg-gray-50 transition-colors p-2 w-full",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-gray-900 text-white text-xs">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <div className="text-sm font-medium truncate">{userName}</div>
                </div>
              )}
            </button>
          </div>

          {/* Content - Navigation */}
          <div
            ref={navRef}
            data-sidebar="content"
            className="flex-1 overflow-y-auto overflow-x-hidden py-2"
          >
            <nav className={cn("space-y-0.5", collapsed ? "px-1.5" : "px-2")}>
              {allItems.map((item, index) => {
                const Icon = iconMap[item.icon];
                const active = isActive(item.route);
                const focused = focusedIndex === index;

                return (
                  <Link key={item.key} href={item.route}>
                    <button
                      data-tour={`sidebar-item-${item.key}`}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(-1)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-md transition-all",
                        "hover:bg-gray-100",
                        collapsed ? "justify-center p-3" : "justify-start px-3 py-2",
                        active && "bg-blue-50 text-blue-600 hover:bg-blue-100",
                        focused && !active && "ring-2 ring-blue-300"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "shrink-0",
                            collapsed ? "size-5" : "size-4.5",
                            active ? "text-blue-600" : "text-gray-700"
                          )}
                        />
                      )}
                      {!collapsed && (
                        <span className={cn(
                          "text-sm font-medium truncate",
                          active ? "text-blue-600" : "text-gray-700"
                        )}>
                          {item.label}
                        </span>
                      )}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className={cn(
            "border-t border-gray-200 p-2",
            collapsed ? "flex flex-col items-center gap-2" : "space-y-2"
          )}>
            <button
              data-tour="sidebar-logout"
              onClick={onLogout}
              className={cn(
                "flex items-center gap-2 rounded-md hover:bg-red-50 transition-colors text-red-600 text-sm font-medium",
                collapsed ? "justify-center p-3 w-full" : "justify-start px-3 py-2 w-full"
              )}
              title={collapsed ? "Cerrar Sesión" : undefined}
            >
              <LogOut className={cn("shrink-0", collapsed ? "size-5" : "size-4.5")} />
              {!collapsed && <span>Cerrar Sesión</span>}
            </button>
            {!collapsed && (
              <div className="text-xs text-gray-500 text-center px-2">
                © 2025 Red-Salud
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button - Centrado verticalmente */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
        title={collapsed ? "Expandir sidebar (Ctrl+B)" : "Contraer sidebar (Ctrl+B)"}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 size-7 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="size-4 text-gray-600" />
        ) : (
          <ChevronLeft className="size-4 text-gray-600" />
        )}
      </button>
    </motion.div>
  );
}
