"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { User, MapPin, Phone, Clock } from "lucide-react";
import Image from "next/image";
import type { DoctorProfile } from "@/lib/supabase/types/appointments";

interface Props {
  doctors: DoctorProfile[];
  selectedDoctor: string;
  selectedSpecialtyName?: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function DoctorSelector({ doctors, selectedDoctor, selectedSpecialtyName, onSelect, onBack, onContinue }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecciona un Doctor</CardTitle>
        <CardDescription>
          {doctors.length} doctor{doctors.length !== 1 ? "es" : ""} disponible{doctors.length !== 1 ? "s" : ""}{selectedSpecialtyName ? ` en ${selectedSpecialtyName}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {doctors.length > 0 ? (
          <>
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => onSelect(doctor.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${selectedDoctor === doctor.id ? "border-primary bg-primary/5 shadow-md" : "hover:border-primary/50 hover:shadow"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {doctor.profile?.avatar_url ? (
                        <Image src={doctor.profile.avatar_url} alt={doctor.profile?.nombre_completo || "Doctor"} width={64} height={64} className="rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl font-semibold text-primary">{doctor.profile?.nombre_completo?.charAt(0) || "D"}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">Dr. {doctor.profile?.nombre_completo || "Médico"}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialty?.name}</p>
                        </div>
                        {doctor.verified && (<Badge className="bg-green-100 text-green-800">Verificado</Badge>)}
                      </div>
                      <div className="mt-2 space-y-1">
                        {doctor.anos_experiencia && doctor.anos_experiencia > 0 && (<p className="text-sm text-gray-600">⭐ {doctor.anos_experiencia} años de experiencia</p>)}
                        {doctor.tarifa_consulta && (<p className="text-sm font-medium text-green-600">💵 ${doctor.tarifa_consulta.toFixed(2)} por consulta</p>)}
                        {/* Note: address fields are not in DoctorProfile, but we can check if they exist in props or if we need to extend the type */}
                        {/* For now keeping the original logic but checking if fields exist */}
                        {(doctor as any).direccion || (doctor as any).ciudad && (
                          <p className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="h-3 w-3" />{(doctor as any).ciudad && (doctor as any).estado ? `${(doctor as any).ciudad}, ${(doctor as any).estado}` : (doctor as any).direccion || (doctor as any).ciudad || (doctor as any).estado}</p>
                        )}
                        {(doctor as any).telefono && (<p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="h-3 w-3" />{(doctor as any).telefono}</p>)}
                        {(doctor as any).horario && (<p className="text-sm text-gray-600 flex items-center gap-1"><Clock className="h-3 w-3" />Horarios disponibles</p>)}
                        {doctor.biografia && (<p className="text-sm text-gray-600 line-clamp-2 mt-2">{doctor.biografia}</p>)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack} className="flex-1">Atrás</Button>
              <Button onClick={onContinue} disabled={!selectedDoctor} className="flex-1">Continuar</Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay médicos disponibles</h3>
            <p className="text-gray-600 mb-4">Aún no hay médicos verificados en esta especialidad</p>
            <Button variant="outline" onClick={onBack}>Elegir Otra Especialidad</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
