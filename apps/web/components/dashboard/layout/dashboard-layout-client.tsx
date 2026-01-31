/**
 * @file dashboard-layout-client.tsx
 * @description Componente cliente del layout del dashboard. Maneja la navegación,
 * sidebars y modales de perfil según el rol del usuario.
 * @module Dashboard/Layout
 */

"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { Button } from "@red-salud/ui";
import { PATIENT_MODULE_CONFIG } from "@/lib/constants";
import { signOut } from "@/lib/supabase/auth";
import { UserProfileModal } from "@/components/dashboard/shared/profile";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardMobileSidebar } from "./dashboard-mobile-sidebar";
import { DashboardMobileHeader } from "./dashboard-mobile-header";
import { DashboardHeader } from "./dashboard-header";
import { SidebarAwareContent } from "./sidebar-aware-content";
import { useSessionSetup, useSessionValidation } from "@/hooks/auth";
import { SessionTimer } from "@/components/auth";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { useDoctorProfile } from "@/hooks/use-doctor-profile";
import { useTourGuide } from "@/components/dashboard/shared/tour-guide/tour-guide-provider";
import { CONFIGURACION_MEGA_MENU } from "@/components/dashboard/medico/configuracion/configuracion-mega-menu-config";
import { ESTADISTICAS_MEGA_MENU } from "@/components/dashboard/medico/estadisticas/estadisticas-mega-menu-config";

interface SecretaryPermissions {
  can_view_agenda?: boolean;
  can_view_patients?: boolean;
  can_send_messages?: boolean;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  userId?: string;
  userRole?: "paciente" | "medico" | "secretaria";
  secretaryPermissions?: SecretaryPermissions;
}

export function DashboardLayoutClient({
  children,
  userName = "Usuario",
  userEmail = "usuario@email.com",
  userId,
  userRole = "paciente",
  secretaryPermissions,
}: DashboardLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Configurar y validar sesión automáticamente
  useSessionSetup();
  useSessionValidation();

  // Detectar si estamos en la página de configuración, estadísticas o citas y configurar mega menú
  const isConfiguracionPage = pathname?.includes("/configuracion");
  const isEstadisticasPage = pathname?.includes("/estadisticas");
  const isCitasPage = pathname?.includes("/citas");
  const activeTab = (searchParams?.get("tab") as string) || (isConfiguracionPage ? "perfil" : "resumen");

  const megaMenuConfig = isConfiguracionPage
    ? {
      sections: CONFIGURACION_MEGA_MENU,
      activeItem: activeTab,
      onItemClick: (itemId: string) => {
        const newUrl =
          itemId === "perfil"
            ? "/dashboard/medico/configuracion"
            : `/dashboard/medico/configuracion?tab=${itemId}`;
        router.push(newUrl, { scroll: false });
      },
    }
    : isEstadisticasPage
      ? {
        sections: ESTADISTICAS_MEGA_MENU,
        activeItem: activeTab,
        onItemClick: (itemId: string) => {
          const newUrl =
            itemId === "resumen"
              ? "/dashboard/medico/estadisticas"
              : `/dashboard/medico/estadisticas?tab=${itemId}`;
          router.push(newUrl, { scroll: false });
        },
      }
      : undefined;

  // Hooks para médicos
  const { profile: doctorProfile } = useDoctorProfile(
    userRole === "medico" ? userId : undefined
  );
  const { startTour } = useTourGuide();

  /**
   * Maneja el clic en el perfil del usuario.
   * Para médicos, navega directamente a configuración.
   * Para otros roles, abre el modal de perfil.
   */
  const handleProfileClick = () => {
    if (userRole === "medico") {
      // Médicos: navegar directamente a configuración
      router.push("/dashboard/medico/configuracion");
    } else {
      // Otros roles: abrir modal de perfil
      setProfileModalOpen(true);
    }
  };

  /**
   * Maneja el clic en el perfil desde el sidebar móvil.
   */
  const handleMobileProfileClick = () => {
    setMobileSidebarOpen(false);
    if (userRole === "medico") {
      router.push("/dashboard/medico/configuracion");
    } else {
      setProfileModalOpen(true);
    }
  };

  // Configurar menú según el rol
  const dashboardRoute = userRole === "secretaria"
    ? "/dashboard/secretaria"
    : userRole === "medico"
      ? "/dashboard/medico"
      : "/dashboard/paciente";

  const menuGroups = userRole === "secretaria"
    ? [
      {
        label: "Principal",
        items: [
          ...(secretaryPermissions?.can_view_agenda ? [
            { key: "agenda", label: "Agenda", icon: "Calendar", route: "/dashboard/secretaria/agenda" }
          ] : []),
          ...(secretaryPermissions?.can_view_patients ? [
            { key: "pacientes", label: "Pacientes", icon: "User", route: "/dashboard/secretaria/pacientes" }
          ] : []),
          ...(secretaryPermissions?.can_send_messages ? [
            { key: "mensajes", label: "Mensajes", icon: "MessageSquare", route: "/dashboard/secretaria/mensajes" }
          ] : []),
        ],
      },
    ].filter(group => group.items.length > 0)
    : userRole === "medico"
      ? [
        {
          label: "Principal",
          items: [
            { key: "citas", label: "Agenda", icon: "Calendar", route: "/dashboard/medico/citas" },
            { key: "consulta", label: "Consulta", icon: "Stethoscope", route: "/dashboard/medico/consulta" },
            { key: "pacientes", label: "Pacientes", icon: "User", route: "/dashboard/medico/pacientes" },
            { key: "mensajeria", label: "Mensajes", icon: "MessageSquare", route: "/dashboard/medico/mensajeria" },
            { key: "telemedicina", label: "Telemedicina", icon: "Video", route: "/dashboard/medico/telemedicina" },
            { key: "recipes", label: "Recipes", icon: "Pill", route: "/dashboard/medico/recetas" },
            { key: "estadisticas", label: "Estadísticas", icon: "Activity", route: "/dashboard/medico/estadisticas" },
          ],
        },
      ]
      : [
        {
          label: "Principal",
          items: Object.entries(PATIENT_MODULE_CONFIG)
            .filter(([key]) => key !== "configuracion") // Excluir configuración del menú
            .map(([key, config]) => ({
              key,
              ...config,
            })),
        },
      ];

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - Estilo Supabase */}
      <DashboardMobileHeader
        dashboardRoute={dashboardRoute}
        onMenuClick={() => setMobileSidebarOpen(true)}
        onSearchClick={() => {
          // TODO: Implementar búsqueda
          console.log("Search clicked");
        }}
      />

      {/* Desktop Header - Solo para médicos - Full Width */}
      {userRole === "medico" && (
        <DashboardHeader
          userName={userName}
          userEmail={userEmail}
          doctorProfile={doctorProfile}
          onTourClick={() => startTour("dashboard-overview")}
          onChatClick={() => {
            document.dispatchEvent(new CustomEvent("toggle-chat"));
          }}
          megaMenu={megaMenuConfig}
          className="hidden md:flex"
        />
      )}

      {/* Layout con Sidebar y Contenido */}
      <div className="flex" style={{ minHeight: userRole === "medico" ? "calc(100vh - 48px)" : "100vh" }}>
        {/* Desktop Sidebar */}
        <DashboardSidebar
          userName={userName}
          userEmail={userEmail}
          menuGroups={menuGroups}
          dashboardRoute={dashboardRoute}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
        />

        {/* Mobile Sidebar */}
        <DashboardMobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          userName={userName}
          userEmail={userEmail}
          menuGroups={menuGroups}
          dashboardRoute={dashboardRoute}
          onProfileClick={handleMobileProfileClick}
          onLogout={handleLogout}
        />

        {/* Main Content - Con ajuste dinámico para sidebar */}
        <SidebarAwareContent userRole={userRole}>
          {children}
        </SidebarAwareContent>
      </div>

      {/* User Profile Modal - Solo para pacientes y secretarias */}
      {userRole !== "medico" && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          userName={userName}
          userEmail={userEmail}
          userId={userId}
        />
      )}

      {/* Chat Widget */}
      <ChatWidget hideTrigger={userRole === "medico"} />
    </div>
  );
}
