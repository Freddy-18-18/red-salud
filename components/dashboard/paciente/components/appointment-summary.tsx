"use client";

import { Card, CardContent } from "@/components/ui/card";

interface Props {
  doctorName?: string;
  doctorFee?: number | null;
  date?: Date;
  time?: string;
  type: "video" | "presencial" | "telefono";
}

export function AppointmentSummary({ doctorName, doctorFee, date, time, type }: Props) {
  return (
    <div className="p-4 bg-muted rounded-lg space-y-2">
      <h3 className="font-semibold mb-3">Resumen de la Cita</h3>
      <div className="text-sm space-y-1">
        <p><span className="text-muted-foreground">Doctor:</span> {doctorName}</p>
        <p><span className="text-muted-foreground">Fecha:</span> {date?.toLocaleDateString("es-ES")}</p>
        <p><span className="text-muted-foreground">Hora:</span> {time?.slice(0, 5)}</p>
        <p><span className="text-muted-foreground">Tipo:</span> {type === "video" ? "Videollamada" : type === "presencial" ? "Presencial" : "Teléfono"}</p>
        {doctorFee != null && (<p className="font-semibold mt-2">Total: ${doctorFee.toFixed(2)}</p>)}
      </div>
    </div>
  );
}

