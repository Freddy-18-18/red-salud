/**
 * Página de Operaciones Clínicas
 */

'use client';

import { useParams } from 'next/navigation';
import { useClinicScope } from '@/components/dashboard/clinica/clinic-scope-provider';
import { useClinicOperations } from '@/hooks/use-clinic-operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


import { Bed, DoorOpen, Activity, Users } from 'lucide-react';

export default function ClinicOperationsPage() {
  const params = useParams();
  const { selectedLocationIds } = useClinicScope();

  const {
    beds,
    availableBeds,
    operatingRooms,
    availableOperatingRooms,
    consultationRooms,
    availableConsultationRooms,
    bedOccupancyRate,
    activeShifts,
    todayMetrics,
    isLoading,
  } = useClinicOperations(selectedLocationIds);

  if (isLoading) {
    return null;
  }


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Operaciones</h2>
        <p className="text-muted-foreground">
          Gestión de recursos, turnos y métricas operacionales
        </p>
      </div>

      {/* Recursos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bed className="h-4 w-4 mr-2" />
              Camas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableBeds.length} / {beds.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponibles • {bedOccupancyRate.toFixed(1)}% ocupación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DoorOpen className="h-4 w-4 mr-2" />
              Quirófanos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableOperatingRooms.length} / {operatingRooms.length}
            </div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Consultorios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableConsultationRooms.length} / {consultationRooms.length}
            </div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Personal en Turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShifts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Activos ahora</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas del Día */}
      {todayMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Hoy</CardTitle>
            <CardDescription>Resumen de actividad del día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Citas Totales</p>
                <p className="text-2xl font-bold">{todayMetrics.total_appointments}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {todayMetrics.completed_appointments}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">
                  {todayMetrics.cancelled_appointments}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes</p>
                <p className="text-2xl font-bold">{todayMetrics.total_patients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listado de Recursos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Camas Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            {availableBeds.length > 0 ? (
              <div className="space-y-2">
                {availableBeds.map((bed) => (
                  <div
                    key={bed.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">{bed.name}</p>
                      <p className="text-sm text-muted-foreground">{bed.department}</p>
                    </div>
                    <Badge variant="outline">{bed.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay camas disponibles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal en Turno</CardTitle>
          </CardHeader>
          <CardContent>
            {activeShifts && activeShifts.length > 0 ? (
              <div className="space-y-2">
                {activeShifts.map((shift: { id: string; staff?: { raw_user_meta_data?: { full_name?: string }; email?: string }; staff_role?: string; start_time?: string; end_time?: string }) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {shift.staff?.raw_user_meta_data?.full_name ||
                          shift.staff?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">{shift.staff_role}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {shift.start_time} - {shift.end_time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay personal en turno actualmente
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
