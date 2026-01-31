"use client";

import { Card, CardContent } from "@red-salud/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Eye, Mail, Phone, MessageSquare } from "lucide-react";
import { calculateAge, getInitials, RegisteredPatient, OfflinePatient } from "./utils";

import { Skeleton } from "@red-salud/ui";

interface PatientsGridProps {
  patients: (RegisteredPatient | OfflinePatient)[];
  onView: (p: RegisteredPatient | OfflinePatient) => void;
  onMessage: (p: RegisteredPatient) => void;
  loading?: boolean;
}

export function PatientsGrid({ patients, onView, onMessage, loading = false }: PatientsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        patients.map((patient) => {
          const isRegistered = "patient" in patient;
          const pData = isRegistered ? (patient as RegisteredPatient).patient : (patient as OfflinePatient);
          const age = calculateAge(pData.fecha_nacimiento);
          return (
            <Card key={(patient as any).id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    {isRegistered && "avatar_url" in pData && (
                      <AvatarImage src={pData.avatar_url || undefined} />
                    )}
                    <AvatarFallback className="text-sm">{getInitials(pData.nombre_completo)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{pData.nombre_completo}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      {age && <span>{age} años</span>}
                      {age && pData.genero && <span>•</span>}
                      {pData.genero && (
                        <span>{pData.genero === "M" ? "Masculino" : "Femenino"}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {!isRegistered && (patient as OfflinePatient).cedula && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-mono text-xs">{(patient as OfflinePatient).cedula}</span>
                    </div>
                  )}
                  {pData.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{pData.telefono}</span>
                    </div>
                  )}
                  {pData.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{pData.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(patient)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  {isRegistered && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onMessage(patient as RegisteredPatient)}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Mensaje
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

