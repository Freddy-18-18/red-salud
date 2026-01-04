"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, User, Calendar } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

export default function DoctorTelemedicineaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

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
      await loadSessions(user.id);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async (doctorId: string) => {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          nombre_completo,
          avatar_url
        )
      `)
      .eq("doctor_id", doctorId)
      .order("scheduled_start_time", { ascending: false });

    if (!error && data) {
      setSessions(data);
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
        <h1 className="text-3xl font-bold text-gray-900">Telemedicina</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{session.patient?.nombre_completo}</span>
                  <Badge>{session.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {new Date(session.scheduled_start_time).toLocaleDateString("es-ES")}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {new Date(session.scheduled_start_time).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {session.status === "waiting" && (
                  <Button className="w-full">
                    <Video className="h-4 w-4 mr-2" />
                    Unirse a la Sesión
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12">
              <div className="text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay sesiones de telemedicina
                </h3>
                <p className="text-gray-600">
                  Las videoconsultas programadas aparecerán aquí
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </VerificationGuard>
  );
}
