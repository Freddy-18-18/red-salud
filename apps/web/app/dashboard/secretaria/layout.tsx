"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { DashboardLayoutClient } from "./layout-client";
import { useAuth } from "@/hooks/use-auth";
import type {
  SecretaryPermissions,
  DoctorSecretaryRelationshipView,
} from "@red-salud/types";

interface Doctor {
  id: string;
  name: string;
  email: string;
  permissions: SecretaryPermissions;
  status: string;
}

interface Profile {
  role: string;
}

export default function SecretariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    async function setupSecretaria() {
      if (loading) return;

      if (!user) {
        router.push("/login/secretaria");
        return;
      }

      try {
        // Verificar perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profileData || profileData.role !== "secretaria") {
          router.push("/login");
          return;
        }

        // Obtener médicos vinculados
        const { data: relations, error: relError } = await supabase
          .from("doctor_secretary_relationships")
          .select("*")
          .eq("secretary_id", user.id)
          .eq("status", "active");

        if (relError) throw relError;

        if (relations) {
          // Asumimos que la tabla/vista retorna los campos necesarios
          const mappedDoctors: Doctor[] = relations.map(
            (rel: DoctorSecretaryRelationshipView) => ({
              id: rel.doctor_id,
              name: rel.doctor_name,
              email: rel.doctor_email,
              permissions: rel.permissions,
              status: rel.status,
            })
          );
          setDoctors(mappedDoctors);
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Error setting up secretaria layout:", error);
      } finally {
        setProfileLoading(false);
      }
    }

    setupSecretaria();
  }, [user, loading, router]);

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no tiene médicos asignados, mostrar pantalla de aviso
  if (user && profile && doctors.length === 0 && !profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sin Médicos Asignados
          </h2>
          <p className="text-gray-600 mb-6">
            Aún no tienes médicos asignados a tu cuenta. Contacta con el médico
            para que te agregue como secretaria.
          </p>
          <button
            onClick={() => router.push("/dashboard/secretaria/perfil")}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Mi Perfil
          </button>
        </div>
      </div>
    );
  }

  if (!user && !loading) return null;

  return (
    <DashboardLayoutClient
      doctors={doctors}
    >
      {children}
    </DashboardLayoutClient>
  );
}
