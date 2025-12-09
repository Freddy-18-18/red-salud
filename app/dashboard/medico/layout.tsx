import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/dashboard/layout/dashboard-layout-client";
import { AppProviders } from "@/components/providers/app-providers";
import { TourGuideProvider } from "@/components/dashboard/tour-guide/tour-guide-provider";

export default async function MedicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options || {})
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/medico");
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Verificar que el usuario sea médico
  if (profile?.role !== "medico") {
    redirect(`/dashboard/${profile?.role || "paciente"}`);
  }

  return (
    <AppProviders>
      <TourGuideProvider>
        <DashboardLayoutClient
          userName={profile?.nombre_completo || user.email?.split("@")[0]}
          userEmail={user.email}
          userRole="medico"
          userId={user.id}
        >
          {children}
        </DashboardLayoutClient>
      </TourGuideProvider>
    </AppProviders>
  );
}
