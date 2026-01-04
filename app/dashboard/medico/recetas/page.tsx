"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Calendar, User } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

export default function DoctorRecetasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      await loadPrescriptions(user.id);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptions = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        paciente:profiles!prescriptions_paciente_id_fkey(
          nombre_completo,
          avatar_url
        )
      `)
      .eq("medico_id", doctorId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPrescriptions(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Recetas Médicas</h1>
        <Button onClick={() => router.push("/dashboard/medico/recetas/nueva")}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Receta
        </Button>
      </div>

      {prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg truncate">
                    {prescription.paciente?.nombre_completo}
                  </span>
                  <Badge>{prescription.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {new Date(prescription.fecha_prescripcion).toLocaleDateString("es-ES")}
                </div>
                {prescription.diagnostico && (
                  <p className="text-sm text-gray-600">
                    <strong>Diagnóstico:</strong> {prescription.diagnostico}
                  </p>
                )}
                <Button variant="outline" className="w-full">
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay recetas registradas
              </h3>
              <p className="text-gray-600 mb-4">
                Las recetas que emitas aparecerán aquí
              </p>
              <Button onClick={() => router.push("/dashboard/medico/recetas/nueva")}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Receta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </VerificationGuard>
  );
}
