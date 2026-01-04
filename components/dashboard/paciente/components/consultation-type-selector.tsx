"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Video, MapPin, Phone } from "lucide-react";

interface Props {
  consultationType: "video" | "presencial" | "telefono";
  onChange: (t: "video" | "presencial" | "telefono") => void;
}

export function ConsultationTypeSelector({ consultationType, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Consulta</CardTitle>
        <CardDescription>Completa la información de tu cita</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 block">Tipo de Consulta</Label>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onChange("video")} className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${consultationType === "video" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
              <Video className="h-6 w-6" />
              <span className="text-sm font-medium">Videollamada</span>
            </button>
            <button onClick={() => onChange("presencial")} className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${consultationType === "presencial" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
              <MapPin className="h-6 w-6" />
              <span className="text-sm font-medium">Presencial</span>
            </button>
            <button onClick={() => onChange("telefono")} className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${consultationType === "telefono" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
              <Phone className="h-6 w-6" />
              <span className="text-sm font-medium">Teléfono</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

