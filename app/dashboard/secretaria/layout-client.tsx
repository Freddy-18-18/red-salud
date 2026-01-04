"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { DoctorSelector } from "@/components/dashboard/secretaria/doctor-selector";
import { supabase } from "@/lib/supabase/client";
import type { SecretaryPermissions } from "@/lib/types/secretary";

interface Doctor {
  id: string;
  name: string;
  email: string;
  permissions: SecretaryPermissions;
  status: string;
}

interface DashboardLayoutClientProps {
  doctors: Doctor[];
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  doctors,
  children,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<SecretaryPermissions | null>(null);

  useEffect(() => {
    // Cargar el médico seleccionado del localStorage o usar el primero
    const savedDoctorId = localStorage.getItem("secretary_current_doctor_id");
    const selectedDoctor = savedDoctorId
      ? doctors.find((d) => d.id === savedDoctorId) || doctors[0]
      : doctors[0];

    setCurrentDoctorId(selectedDoctor.id);
    setPermissions(selectedDoctor.permissions);
  }, [doctors]);

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return;

    setCurrentDoctorId(doctorId);
    setPermissions(doctor.permissions);
    localStorage.setItem("secretary_current_doctor_id", doctorId);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login/secretaria";
  };

  const navigation = [
    {
      name: "Agenda",
      href: "/dashboard/secretaria/agenda",
      icon: Calendar,
      permission: "can_view_agenda" as keyof SecretaryPermissions,
    },
    {
      name: "Pacientes",
      href: "/dashboard/secretaria/pacientes",
      icon: Users,
      permission: "can_view_patients" as keyof SecretaryPermissions,
    },
    {
      name: "Mensajes",
      href: "/dashboard/secretaria/mensajes",
      icon: MessageSquare,
      permission: "can_send_messages" as keyof SecretaryPermissions,
    },
    {
      name: "Estadísticas",
      href: "/dashboard/secretaria/estadisticas",
      icon: BarChart3,
      permission: "can_view_statistics" as keyof SecretaryPermissions,
    },
  ];

  const filteredNavigation = navigation.filter((item) => {
    if (!permissions) return false;
    return permissions[item.permission] === true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RS</span>
              </div>
              <span className="font-semibold text-gray-900">Red-Salud</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Selector de médico */}
          <div className="p-4 border-b">
            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
              Médico Actual
            </label>
            <DoctorSelector
              doctors={doctors}
              currentDoctorId={currentDoctorId}
              onDoctorChange={handleDoctorChange}
            />
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-1">
            <Link
              href="/dashboard/secretaria/perfil"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Mi Perfil</span>
            </Link>
            <Link
              href="/dashboard/secretaria/configuracion"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Configuración</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header móvil */}
        <div className="sticky top-0 z-30 bg-white border-b lg:hidden">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-semibold text-gray-900">Dashboard</span>
            <div className="w-6" />
          </div>
        </div>

        {/* Contenido */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
