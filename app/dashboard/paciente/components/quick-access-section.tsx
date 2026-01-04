"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Beaker, FileText, MessageSquare, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/hooks/use-i18n";

export function QuickAccessSection() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.quickAccess")}</CardTitle>
        <CardDescription>{t("dashboard.servicesAvailable")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => router.push("/dashboard/paciente/telemedicina")}
          >
            <Video className="h-6 w-6 text-blue-600" />
            <span className="text-xs text-center">
              {t("dashboard.telemedicine")}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => router.push("/dashboard/paciente/laboratorio")}
          >
            <Beaker className="h-6 w-6 text-purple-600" />
            <span className="text-xs text-center">
              {t("dashboard.laboratory")}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => router.push("/dashboard/paciente/historial")}
          >
            <FileText className="h-6 w-6 text-green-600" />
            <span className="text-xs text-center">
              {t("dashboard.medicalHistory")}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => router.push("/dashboard/paciente/mensajeria")}
          >
            <MessageSquare className="h-6 w-6 text-orange-600" />
            <span className="text-xs text-center">
              {t("dashboard.messages")}
            </span>
          </Button>
        </div>

        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.push("/dashboard/paciente/configuracion")}
        >
          <User className="h-4 w-4 mr-2" />
          {t("dashboard.settings")}
        </Button>
      </CardContent>
    </Card>
  );
}
