import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Heart, Phone, Activity, Shield } from "lucide-react";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Página de Perfil del Paciente
 * Gestiona información personal, médica, contactos de emergencia y seguridad
 */

export default async function PerfilPage() {
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
            // Ignore
          }
        },
      },
    }
  );

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Obtener detalles del paciente
  const { data: patientDetails } = await supabase
    .from("patient_details")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-600">
          Gestiona tu información personal, médica y de seguridad
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Médica</span>
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Emergencia</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        {/* Información Personal */}
        <TabsContent value="personal">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Información Personal</h2>
              <p className="text-gray-600">
                Nombre: {profile?.nombre_completo || "No disponible"}
              </p>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-sm text-gray-500">
                Formulario en construcción...
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Información Médica */}
        <TabsContent value="medical">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Información Médica</h2>
              <p className="text-gray-600">
                Grupo Sanguíneo: {patientDetails?.grupo_sanguineo || "No registrado"}
              </p>
              <p className="text-sm text-gray-500">
                Formulario en construcción...
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Contacto de Emergencia */}
        <TabsContent value="emergency">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contacto de Emergencia</h2>
              <p className="text-sm text-gray-500">
                Formulario en construcción...
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Métricas Físicas */}
        <TabsContent value="metrics">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Métricas Físicas</h2>
              <p className="text-gray-600">
                Peso: {patientDetails?.peso_kg ? `${patientDetails.peso_kg} kg` : "No registrado"}
              </p>
              <p className="text-gray-600">
                Altura: {patientDetails?.altura_cm ? `${patientDetails.altura_cm} cm` : "No registrado"}
              </p>
              <p className="text-sm text-gray-500">
                Formulario en construcción...
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="security">
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Seguridad</h2>
              <p className="text-sm text-gray-500">
                Formulario en construcción...
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
