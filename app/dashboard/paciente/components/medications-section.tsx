"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/hooks/use-i18n";

interface MedicationsProps {
  medications: any[];
}

export function MedicationsSection({ medications }: MedicationsProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("dashboard.medications")}</CardTitle>
            <CardDescription>{t("dashboard.remindersConfigured")}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/paciente/medicamentos")}
          >
            {t("dashboard.viewAll")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {medications.length > 0 ? (
          <div className="space-y-3">
            {medications.map((med) => (
              <div
                key={med.id}
                className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg"
              >
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <Pill className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {med.nombre_medicamento}
                  </p>
                  <p className="text-xs text-gray-600">{med.dosis}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {med.horarios?.slice(0, 3).map((hora: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {hora}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Pill className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">
              {t("dashboard.noMedications")}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push(
                  "/dashboard/paciente/medicamentos/recordatorios/nuevo"
                )
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("dashboard.addReminder")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
