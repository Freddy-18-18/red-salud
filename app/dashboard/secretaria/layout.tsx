import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "./layout-client";

export default async function SecretariaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/secretaria");
  }

  // Verificar que el usuario sea secretaria
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "secretaria") {
    redirect("/login");
  }

  // Obtener permisos y médicos vinculados
  const { data: relations } = await supabase
    .from("doctor_secretary_relationships")
    .select("*")
    .eq("secretary_id", user.id)
    .eq("status", "active");

  if (!relations || relations.length === 0) {
    // No tiene médicos asignados
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
          <a
            href="/dashboard/secretaria/perfil"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Mi Perfil
          </a>
        </div>
      </div>
    );
  }

  // Mapear los médicos disponibles
  const doctors = relations.map((rel: any) => ({
    id: rel.doctor_id,
    name: rel.doctor_name,
    email: rel.doctor_email,
    permissions: rel.permissions,
    status: rel.status,
  }));

  return (
    <DashboardLayoutClient doctors={doctors}>
      {children}
    </DashboardLayoutClient>
  );
}
