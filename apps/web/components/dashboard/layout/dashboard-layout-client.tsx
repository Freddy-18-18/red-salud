/**
 * @file dashboard-layout-client.tsx
 * @description Componente cliente del layout del dashboard. Maneja la navegación,
 * sidebars y modales de perfil según el rol del usuario.
 * @module Dashboard/Layout
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/supabase/auth";
import { UserProfileModal } from "@/components/dashboard/shared/profile";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardMobileSidebar } from "./dashboard-mobile-sidebar";
import { DashboardMobileHeader } from "./dashboard-mobile-header";
import { DashboardHeader } from "./dashboard-header";
import { SidebarAwareContent } from "./sidebar-aware-content";
import { useSessionSetup, useSessionValidation } from "@/hooks/auth";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { useDoctorProfile } from "@/hooks/use-doctor-profile";
import { useTourGuide } from "@/components/dashboard/shared/tour-guide/tour-guide-provider";
import { useMegaMenuConfig } from "@/hooks/dashboard/use-mega-menu-config";
import { useDashboardMenuGroups } from "@/hooks/dashboard/use-dashboard-menu-groups";

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Configurar y validar sesión automáticamente
  useSessionSetup();
  useSessionValidation();

  // Hooks de configuración de menú
  const megaMenuConfig = useMegaMenuConfig();
  const { menuGroups, dashboardRoute } = useDashboardMenuGroups(userRole, secretaryPermissions);

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
          menuGroups={menuGroups}
          dashboardRoute={dashboardRoute}
          onProfileClick={handleProfileClick}
        />

        {/* Mobile Sidebar */}
        <DashboardMobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          userName={userName}
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
