"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PATIENT_MODULE_CONFIG, PATIENT_MODULES } from "@/lib/constants";

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

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export function DashboardLayoutClient({
  children,
  userName = "Usuario",
  userEmail = "usuario@email.com",
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = Object.entries(PATIENT_MODULE_CONFIG).map(
    ([key, config]) => ({
      key,
      ...config,
    })
  );

  const isActive = (route: string) => {
    if (route === "/dashboard/paciente") {
      return pathname === route;
    }
    return pathname.startsWith(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <div className="bg-linear-to-br from-blue-600 to-teal-600 text-white px-2 py-1 rounded font-bold">
              RS
            </div>
            <span className="font-bold text-lg">Red-Salud</span>
          </Link>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-linear-to-br from-blue-600 to-teal-600 text-white px-2 py-1 rounded font-bold">
                RS
              </div>
              <span className="font-bold text-lg">Red-Salud</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = iconMap[item.icon];
                const active = isActive(item.route);

                return (
                  <Link key={item.key} href={item.route}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}

              {/* Configuración */}
              <Link href="/dashboard/paciente/configuracion">
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === "/dashboard/paciente/configuracion"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Configuración</span>
                </div>
              </Link>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                // TODO: Implementar logout
                window.location.href = "/auth/login";
              }}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween" }}
              className="lg:hidden fixed top-0 left-0 h-screen w-64 bg-white z-50 shadow-xl"
            >
              <div className="h-full flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="bg-linear-to-br from-blue-600 to-teal-600 text-white px-2 py-1 rounded font-bold">
                      RS
                    </div>
                    <span className="font-bold text-lg">Red-Salud</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="px-4 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-3">
                    {menuItems.map((item) => {
                      const Icon = iconMap[item.icon];
                      const active = isActive(item.route);

                      return (
                        <Link
                          key={item.key}
                          href={item.route}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              active
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}

                    {/* Configuración */}
                    <Link
                      href="/dashboard/paciente/configuracion"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          pathname === "/dashboard/paciente/configuracion"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          Configuración
                        </span>
                      </div>
                    </Link>
                  </div>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      // TODO: Implementar logout
                      window.location.href = "/auth/login";
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0">{children}</div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-30">
        <div className="h-full grid grid-cols-5 gap-1 px-2">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = iconMap[item.icon];
            const active = isActive(item.route);

            return (
              <Link key={item.key} href={item.route}>
                <div
                  className={`flex flex-col items-center justify-center h-full ${
                    active ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="text-xs mt-1">{item.label.split(" ")[0]}</span>
                </div>
              </Link>
            );
          })}

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center h-full text-gray-600"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">Más</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
