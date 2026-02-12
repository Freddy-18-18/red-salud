"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LogOut,
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

export interface DashboardMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;

  menuGroups: MenuGroup[];
  dashboardRoute: string;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function DashboardMobileSidebar({
  isOpen,
  onClose,
  userName = "Usuario",
  menuGroups,
  dashboardRoute,
  onProfileClick,
  onLogout,
}: DashboardMobileSidebarProps) {
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route;
  };

  // Aplanar todos los items
  const allItems = menuGroups.flatMap(group => group.items);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay con backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar shadow-2xl md:hidden border-r border-sidebar-border"
          >
            <div className="flex h-full flex-col">
              {/* Header - Logo Red-Salud */}
              <div className="flex items-center justify-between border-b border-sidebar-border p-4 h-16">
                <Link href={dashboardRoute} onClick={onClose}>
                  <motion.div
                    className="flex items-center gap-3 cursor-pointer"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white size-8 rounded-lg flex items-center justify-center font-bold text-sm">
                      RS
                    </div>
                    <span className="text-base font-bold text-sidebar-foreground">
                      Red-Salud
                    </span>
                  </motion.div>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <X className="size-5" />
                </motion.button>
              </div>

              {/* Content - Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-1">
                  {allItems.map((item, index) => {
                    const Icon = iconMap[item.icon];
                    const active = isActive(item.route);

                    return (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link href={item.route} onClick={onClose}>
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              active && "bg-sidebar-accent text-sidebar-primary shadow-sm ring-1 ring-sidebar-ring/50",
                              !active && "text-sidebar-foreground/80"
                            )}
                          >
                            {Icon && (
                              <Icon
                                className={cn(
                                  "size-5 shrink-0",
                                  active ? "text-sidebar-primary" : "text-sidebar-foreground/70"
                                )}
                              />
                            )}
                            <span className={active ? "text-sidebar-primary font-semibold" : "text-sidebar-foreground/90"}>
                              {item.label}
                            </span>
                          </motion.button>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Footer - User Profile & Logout */}
              <div className="border-t border-sidebar-border p-4 space-y-2 bg-sidebar">
                {/* User Profile Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onProfileClick?.();
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-all text-sidebar-foreground/80 hover:text-sidebar-foreground"
                >
                  <Avatar className="size-9 shrink-0 ring-2 ring-sidebar-border">
                    <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground text-xs font-bold">
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-sidebar-foreground truncate">
                      {userName}
                    </div>
                    <div className="text-xs text-sidebar-foreground/50">
                      Configuración
                    </div>
                  </div>
                </motion.button>

                {/* Logout Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onLogout?.();
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-all text-destructive/80 hover:text-destructive text-sm font-medium"
                >
                  <LogOut className="size-5" />
                  <span>Cerrar Sesión</span>
                </motion.button>

                {/* Copyright */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.24 }}
                  className="text-xs text-sidebar-foreground/40 text-center pt-2"
                >
                  © 2025 Red-Salud
                </motion.div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
