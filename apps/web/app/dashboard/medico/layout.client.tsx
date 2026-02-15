"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { DashboardLayoutClient } from "@/components/dashboard/layout/dashboard-layout-client";
import { AppProviders } from "@/components/providers/app-providers";
import { TourGuideProvider } from "@/components/dashboard/shared/tour-guide/tour-guide-provider";
import { SidebarProvider } from "@/lib/contexts/sidebar-context";

import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  role: string;
  nombre_completo: string | null;
  scheduled_deletion_at: string | null;
  specialtyName?: string;
  subSpecialties?: string[];
}

export function MedicoLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Obtener perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "medico") {
        router.push(`/dashboard/${profile?.role || "paciente"}`);
        return;
      }

      setProfile(profile);

      // Obtener especialidad si es médico
      if (profile?.role === "medico") {
        const { data: doctorDetails } = await supabase
          .from("doctor_details")
          .select("especialidad:specialties(name), subespecialidades")
          .eq("profile_id", user.id)
          .single();

        if (doctorDetails?.especialidad) {
          profile.specialtyName = (doctorDetails.especialidad as { name?: string }).name;
        }

        profile.subSpecialties = Array.isArray(doctorDetails?.subespecialidades)
          ? doctorDetails.subespecialidades
          : [];
      }

      setLoading(false);
    };

    checkAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          router.push("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <AppProviders>
      <SidebarProvider>
        <TourGuideProvider>
          <DashboardLayoutClient
            userName={profile?.nombre_completo || user.email?.split("@")[0] || "Usuario"}
            userEmail={user.email || ""}
            userRole="medico"
            userId={user.id}
            specialtyName={profile.specialtyName}
            subSpecialties={profile.subSpecialties}
          >
            {profile?.scheduled_deletion_at && (
              <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between text-sm animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="font-bold">⚠️ ELIMINACIÓN PROGRAMADA:</span>
                  <span>Tu cuenta se eliminará el {new Date(profile.scheduled_deletion_at).toLocaleDateString()}.</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard/medico/configuracion?tab=seguridad')}
                  className="bg-white text-orange-600 px-2 py-0.5 rounded text-xs font-bold hover:bg-orange-50 transition-colors"
                >
                  Gestionar / Cancelar
                </button>
              </div>
            )}
            {children}
          </DashboardLayoutClient>
        </TourGuideProvider>
      </SidebarProvider>
    </AppProviders>
  );
}
