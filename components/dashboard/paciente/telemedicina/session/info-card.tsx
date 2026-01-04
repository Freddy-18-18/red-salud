"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface Props {
  scheduled_start_time: string;
  reason?: string | null;
  duration_minutes?: number | null;
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

export function InfoCard({ scheduled_start_time, reason, duration_minutes }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Consulta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{new Date(scheduled_start_time).toLocaleDateString("es-ES")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{formatTime(scheduled_start_time)}</span>
          </div>
        </div>
        {reason && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Motivo de consulta:</p>
            <p className="text-sm text-gray-600">{reason}</p>
          </div>
        )}
        {duration_minutes && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Duración:</p>
            <p className="text-sm text-gray-600">{duration_minutes} minutos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

