"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { DashboardLayoutClient } from "@/components/dashboard/layout/dashboard-layout-client";
import { AppProviders } from "@/components/providers/app-providers";
import { useAuth } from "@/hooks/use-auth";

export default function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      if (loading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // Verificar que el usuario sea paciente
        if (profileData?.role !== "paciente") {
          router.push(`/dashboard/${profileData?.role || "paciente"}`);
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    }

    getProfile();
  }, [user, loading, router]);

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay usuario y no estamos cargando, useEffect redirigirá
  if (!user && !loading) return null;

  return (
    <AppProviders>
      <DashboardLayoutClient
        userName={profile?.nombre_completo as string | undefined || user?.email?.split("@")[0]}
        userEmail={user?.email}
        userId={user?.id}
        userRole="paciente"
      >
        {children}
      </DashboardLayoutClient>
    </AppProviders>
  );
}
