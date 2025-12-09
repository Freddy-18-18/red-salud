"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { calculateAge, getInitials, RegisteredPatient, OfflinePatient } from "./utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientsTableProps {
  patients: (RegisteredPatient | OfflinePatient)[];
  onView: (p: RegisteredPatient | OfflinePatient) => void;
  onMessage: (p: RegisteredPatient) => void;
  loading?: boolean;
}

export function PatientsTable({ patients, onView, onMessage, loading = false }: PatientsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Pacientes</CardTitle>
        <CardDescription>
          {loading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            `${patients.length} pacientes encontrados`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Edad/Género</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                patients.map((patient) => {
                  const isRegistered = "patient" in patient;
                  const pData = isRegistered ? (patient as RegisteredPatient).patient : (patient as OfflinePatient);
                  const age = calculateAge(pData.fecha_nacimiento);
                  const lastActivity = isRegistered && (patient as RegisteredPatient).last_consultation_date
                    ? new Date((patient as RegisteredPatient).last_consultation_date!)
                    : new Date((patient as OfflinePatient).created_at);

                  return (
                    <TableRow key={(patient as any).id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {isRegistered && "avatar_url" in pData && (
                              <AvatarImage src={pData.avatar_url || undefined} />
                            )}
                            <AvatarFallback>{getInitials(pData.nombre_completo)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{pData.nombre_completo}</div>
                            {!isRegistered && (patient as OfflinePatient).cedula && (
                              <div className="text-xs text-muted-foreground">
                                {(patient as OfflinePatient).cedula}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {pData.telefono && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {pData.telefono}
                            </div>
                          )}
                          {pData.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {pData.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{age ? `${age} años` : "N/A"}</span>
                          <span className="text-muted-foreground">
                            {pData.genero === "M" ? "Masculino" : pData.genero === "F" ? "Femenino" : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{format(lastActivity, "dd/MM/yyyy", { locale: es })}</span>
                          <span className="text-xs text-muted-foreground">
                            {isRegistered && (patient as RegisteredPatient).last_consultation_date
                              ? "Última consulta"
                              : "Registrado"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => onView(patient)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isRegistered && (
                            <Button variant="ghost" size="icon" onClick={() => onMessage(patient as RegisteredPatient)}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
