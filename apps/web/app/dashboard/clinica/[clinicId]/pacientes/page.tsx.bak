/**
 * Página de Pacientes Internacionales
 */

'use client';

import { useParams } from 'next/navigation';
import { useInternationalPatients } from '@/hooks/use-clinic-international';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, FileText, Calendar } from 'lucide-react';

export default function InternationalPatientsPage() {
  const params = useParams();
  const clinicId = params?.clinicId as string;

  const {
    activePatients,
    pendingArrivals,
    pendingDocs,
    stats,
    isLoading,
  } = useInternationalPatients(clinicId);

  if (isLoading) {
    return null;
  }


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pacientes Internacionales</h2>
        <p className="text-muted-foreground">
          Gestión de pacientes extranjeros y turismo médico
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Pacientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatients?.length || 0}</div>
            <p className="text-xs text-muted-foreground">En tratamiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Próximas Llegadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArrivals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Próximos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Docs Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDocs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Por verificar</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="arrivals">Próximas Llegadas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes en Tratamiento</CardTitle>
              <CardDescription>
                Pacientes internacionales actualmente en la clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePatients && activePatients.length > 0 ? (
                <div className="space-y-2">
                  {activePatients.map((patient: { id: string; patient?: { raw_user_meta_data?: { full_name?: string }; email?: string }; origin_country?: string; preferred_language?: string; status?: string }) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {patient.patient?.raw_user_meta_data?.full_name ||
                            patient.patient?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.origin_country} • {patient.preferred_language}
                        </p>
                      </div>
                      <Badge>{patient.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay pacientes activos actualmente
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arrivals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Llegadas</CardTitle>
              <CardDescription>
                Pacientes confirmados que llegarán en los próximos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingArrivals && pendingArrivals.length > 0 ? (
                <div className="space-y-2">
                  {pendingArrivals.map((patient: { id: string; patient?: { raw_user_meta_data?: { full_name?: string }; email?: string }; origin_country?: string; preferred_language?: string; status?: string; expected_arrival_date?: string; estimated_arrival_date?: string }) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {patient.patient?.raw_user_meta_data?.full_name ||
                            patient.patient?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.origin_country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {patient.estimated_arrival_date &&
                            new Date(patient.estimated_arrival_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Llegada estimada</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay llegadas programadas
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Pendientes de Verificación</CardTitle>
              <CardDescription>
                Requieren revisión y aprobación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDocs && pendingDocs.length > 0 ? (
                <div className="space-y-2">
                  {pendingDocs.map((doc: { id: string; patient?: { raw_user_meta_data?: { full_name?: string }; email?: string }; document_type?: string; uploaded_at?: string; document_name?: string; international_patient?: { patient?: { raw_user_meta_data?: { full_name?: string }; email?: string } } }) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{doc.document_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.international_patient?.patient?.raw_user_meta_data
                            ?.full_name ||
                            doc.international_patient?.patient?.email}
                        </p>
                      </div>
                      <Badge variant="outline">{doc.document_type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Todos los documentos están verificados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Por País de Origen</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.by_country && Object.keys(stats.by_country).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.by_country).map(([country, count]) => (
                      <div
                        key={country}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="font-medium">{country}</span>
                        <Badge>{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.by_status && Object.keys(stats.by_status).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.by_status).map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="font-medium capitalize">{status}</span>
                        <Badge>{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
