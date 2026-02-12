"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  MessageSquare,
  Video,
  Stethoscope,
  Home,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { SidebarModeSelector } from "./sidebar-mode-selector";

// Mapa de iconos
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  MessageSquare,
  Video,
  Stethoscope,
  Home,
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

export interface DashboardSidebarProps {
  userName?: string;
  menuGroups: MenuGroup[];
  dashboardRoute: string;
  onProfileClick?: () => void;
}

export function DashboardSidebar({
  userName = "Usuario",
  menuGroups,
  dashboardRoute,
  onProfileClick,
}: DashboardSidebarProps) {
  const { mode, isExpanded, handleMouseEnter, handleMouseLeave } = useSidebarState();
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route;
  };

  // Aplanar todos los items de todos los grupos
  const allItems = menuGroups.flatMap(group => group.items);

  return (
    <>
      {/* Zona de activación para hover - más ancha para evitar flickering */}
      {mode === "hover" && (
        <div
          className="fixed left-0 top-12 h-[calc(100vh-48px)] w-16 z-40"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Sidebar Content - Fixed Position debajo del header */}
      <div
        className={cn(
          "fixed left-0 flex flex-col glass border-r border-sidebar-border/50 transition-all duration-200 ease-out",
          isExpanded ? "w-64" : "w-12",
          // Posicionar debajo del header (48px de altura)
          "top-12 h-[calc(100vh-48px)]",
          // En modo hover, z-index más alto para overlay
          mode === "hover" ? "z-50" : "z-40",
          "hidden md:flex"
        )}
        data-state={isExpanded ? "expanded" : "collapsed"}
        data-collapsible="icon"
        data-variant="sidebar"
        data-side="left"
        // Solo agregar handlers si está en modo hover
        onMouseEnter={mode === "hover" ? handleMouseEnter : undefined}
        onMouseLeave={mode === "hover" ? handleMouseLeave : undefined}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col"
        >
          {/* Content - Scrollable */}
          <div
            data-sidebar="content"
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden",
              !isExpanded && "overflow-hidden",
              // Custom scrollbar styling
              "scrollbar-thin scrollbar-track-sidebar scrollbar-thumb-sidebar-accent hover:scrollbar-thumb-sidebar-accent/80"
            )}
          >
            <div>
              <ul
                data-sidebar="menu"
                className="flex w-full min-w-0 flex-col gap-1"
              >
                <div
                  data-sidebar="group"
                  className="relative flex w-full min-w-0 flex-col p-2 gap-0.5"
                >
                  {/* Logo Red-Salud */}
                  <li data-sidebar="menu-item" className="group/menu-item relative mb-1">
                    <Link href={dashboardRoute}>
                      <button
                        data-sidebar="menu-button"
                        data-size="default"
                        data-active={isActive(dashboardRoute)}
                        data-has-icon="true"
                        tabIndex={0}
                        title={!isExpanded ? "Red-Salud" : undefined}
                        className={cn(
                          "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md py-2 px-1.5 text-left outline-none ring-sidebar-ring",
                          "transition-[width,height,padding] transition-colors duration-200 ease-out focus-visible:ring-2",
                          "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                          "disabled:pointer-events-none disabled:opacity-50",
                          "group-has-[[data-sidebar=menu-action]]/menu-item:pr-8",
                          "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                          "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium",
                          "data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground",
                          "[&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0",
                          "text-sidebar-foreground/60 data-[active=true]:text-sidebar-foreground",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          "h-8 text-sm",
                          !isExpanded && "!size-8 !pl-1.5 !pr-2 justify-center"
                        )}
                      >
                        <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white size-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0">
                          RS
                        </div>
                        {isExpanded && <span>Red-Salud</span>}
                      </button>
                    </Link>

                    {/* Tooltip para logo cuando está colapsado */}
                    {!isExpanded && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md border opacity-0 pointer-events-none group-hover/menu-item:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        Red-Salud
                      </div>
                    )}
                  </li>

                  {/* Menu Items */}
                  {allItems.map((item) => {
                    const Icon = iconMap[item.icon];
                    const active = isActive(item.route);

                    return (
                      <li
                        key={item.key}
                        data-sidebar="menu-item"
                        className="group/menu-item relative"
                      >
                        <Link href={item.route}>
                          <button
                            data-sidebar="menu-button"
                            data-size="default"
                            data-active={active}
                            data-has-icon="true"
                            tabIndex={0}
                            title={!isExpanded ? item.label : undefined}
                            className={cn(
                              "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md py-2 px-1.5 text-left outline-none ring-sidebar-ring",
                              "transition-[width,height,padding] transition-colors duration-200 ease-out focus-visible:ring-2",
                              "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                              "disabled:pointer-events-none disabled:opacity-50",
                              "group-has-[[data-sidebar=menu-action]]/menu-item:pr-8",
                              "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                              "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
                              "data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground",
                              "[&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0",
                              "text-sidebar-foreground/60 data-[active=true]:text-sidebar-foreground",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              "h-8 text-sm",
                              !isExpanded && "!size-8 !pl-1.5 !pr-2 justify-center"
                            )}
                          >
                            {Icon && <Icon />}
                            {isExpanded && <span>{item.label}</span>}
                          </button>
                        </Link>

                        {/* Tooltip para sidebar colapsado */}
                        {!isExpanded && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md border opacity-0 pointer-events-none group-hover/menu-item:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </div>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div data-sidebar="footer" className="flex flex-col gap-2 p-2">
            {/* User Profile - Botón de Configuración */}
            <button
              onClick={onProfileClick}
              className={cn(
                "flex w-full items-center gap-2 overflow-hidden rounded-md py-2 px-1.5 text-left outline-none transition-colors duration-200 ease-out",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus-visible:ring-2 ring-sidebar-ring",
                "text-sidebar-foreground/60",
                "h-10",
                !isExpanded && "px-1.5"
              )}
              title={!isExpanded ? "Configuración" : undefined}
            >
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground font-bold text-xs">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isExpanded && (
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-medium text-sidebar-foreground truncate">
                    {userName}
                  </div>
                  <div className="text-[10px] text-sidebar-foreground/50 truncate">
                    Configuración
                  </div>
                </div>
              )}
            </button>

            {/* Sidebar Mode Selector */}
            <div
              data-sidebar="group"
              className="relative flex w-full min-w-0 flex-col p-0"
            >
              <SidebarModeSelector />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
