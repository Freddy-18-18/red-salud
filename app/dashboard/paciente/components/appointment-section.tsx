"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useI18n } from "@/lib/hooks/use-i18n";

interface AppointmentAlertProps {
  activeTelemed: number;
}

interface UpcomingAppointmentsProps {
  appointments: any[];
  activeTelemed: number;
}

export function AppointmentAlert({ activeTelemed }: AppointmentAlertProps) {
  const router = useRouter();

  if (activeTelemed <= 0) return null;

  return (
    <Card className="border-blue-500 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Video className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900">
              Tienes {activeTelemed} sesión(es) de telemedicina activa(s)
            </p>
            <p className="text-sm text-blue-700">
              Haz clic para unirte a la videoconsulta
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/paciente/telemedicina")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Unirse Ahora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function UpcomingAppointmentsSection({
  appointments,
  activeTelemed,
}: UpcomingAppointmentsProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <>
      {/* Alert */}
      <AppointmentAlert activeTelemed={activeTelemed} />

      {/* Próximas Citas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.upcomingAppointments")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/paciente/citas")}
            >
              {t("dashboard.viewAll")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((apt) => {
                const fechaHora = new Date(apt.fecha_hora);
                return (
                  <div
                    key={apt.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/paciente/citas`)}
                  >
                    <div className="h-12 w-12 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {apt.motivo || "Consulta Médica"}
                        </h3>
                        <Badge
                          variant={
                            apt.status === "confirmada" ? "default" : "secondary"
                          }
                        >
                          {apt.status === "confirmada"
                            ? "Confirmada"
                            : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Dr. {apt.doctor?.nombre_completo || "Por asignar"}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(fechaHora, "EEEE, d 'de' MMMM 'a las' HH:mm", {
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {t("dashboard.noAppointments")}
              </p>
              <Button
                onClick={() =>
                  router.push("/dashboard/paciente/citas/nueva")
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.scheduleAppointment")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
