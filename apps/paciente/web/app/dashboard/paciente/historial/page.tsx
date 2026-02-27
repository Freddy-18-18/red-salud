"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/design-system";
import {
  usePatientMedicalRecords,
  useMedicalHistorySummary,
  useSearchMedicalRecords,
} from "@/hooks/use-medical-records";
import {
  FileText,
  Search,
  Calendar,
  User,
  Pill,
  Activity,
  Download,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function HistorialClinicoPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const { records, loading: recordsLoading } = usePatientMedicalRecords(userId || undefined);
  const { summary, loading: summaryLoading } = useMedicalHistorySummary(userId || undefined);
  const { results: searchResults, search, clearSearch } = useSearchMedicalRecords(
    userId || undefined
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      search(searchTerm);
    } else {
      clearSearch();
    }
  };

  if (loading || recordsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando historial clínico...</p>
        </div>
      </div>
    );
  }

  const displayRecords = searchTerm ? searchResults : records;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Historial Clínico</h1>
          <p className="text-muted-foreground mt-1">
            Tu historial médico completo y registros de consultas
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Consultas</p>
                  <p className="text-2xl font-bold">{summary.total_consultas}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Doctores</p>
                  <p className="text-2xl font-bold">{summary.doctores_consultados.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Medicamentos</p>
                  <p className="text-2xl font-bold">{summary.medicamentos_actuales.length}</p>
                </div>
                <Pill className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Última Consulta</p>
                  <p className="text-sm font-medium">
                    {summary.ultima_consulta
                      ? new Date(summary.ultima_consulta).toLocaleDateString("es-ES")
                      : "N/A"}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en tu historial médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Buscar</Button>
            {searchTerm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  clearSearch();
                }}
              >
                Limpiar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="registros" className="space-y-6">
        <TabsList>
          <TabsTrigger value="registros">
            Registros Médicos ({displayRecords.length})
          </TabsTrigger>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Registros Médicos */}
        <TabsContent value="registros" className="space-y-4">
          {displayRecords.length > 0 ? (
            displayRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{record.diagnostico}</h3>
                          <Badge variant="outline">
                            {new Date(record.created_at).toLocaleDateString("es-ES")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Dr. {record.medico?.nombre_completo || "No especificado"} •{" "}
                          {record.medico?.especialidad || "Medicina General"}
                        </p>
                        {record.sintomas && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Síntomas:</p>
                            <p className="text-sm text-muted-foreground">{record.sintomas}</p>
                          </div>
                        )}
                        {record.tratamiento && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Tratamiento:</p>
                            <p className="text-sm text-muted-foreground">{record.tratamiento}</p>
                          </div>
                        )}
                        {record.medicamentos && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Medicamentos:</p>
                            <p className="text-sm text-muted-foreground">{record.medicamentos}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/dashboard/paciente/historial/${record.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">
                  {searchTerm ? "No se encontraron resultados" : "No tienes registros médicos"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : "Tus registros médicos aparecerán aquí después de tus consultas"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          {summary && (
            <>
              {/* Diagnósticos Frecuentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Diagnósticos Frecuentes
                  </CardTitle>
                  <CardDescription>
                    Los diagnósticos más comunes en tu historial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.diagnosticos_frecuentes.length > 0 ? (
                    <div className="space-y-3">
                      {summary.diagnosticos_frecuentes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{item.diagnostico}</span>
                          <Badge variant="secondary">{item.count} veces</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay diagnósticos registrados
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Medicamentos Actuales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Medicamentos Actuales
                  </CardTitle>
                  <CardDescription>Medicamentos recetados en los últimos 3 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.medicamentos_actuales.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {summary.medicamentos_actuales.map((med, index) => (
                        <Badge key={index} variant="outline">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay medicamentos actuales registrados
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Doctores Consultados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Doctores Consultados
                  </CardTitle>
                  <CardDescription>Profesionales que te han atendido</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.doctores_consultados.length > 0 ? (
                    <div className="space-y-3">
                      {summary.doctores_consultados.map((doctor) => (
                        <div
                          key={doctor.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{doctor.nombre}</p>
                            <p className="text-sm text-muted-foreground">{doctor.especialidad}</p>
                          </div>
                          <Badge>{doctor.consultas} consultas</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay doctores registrados
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Estadísticas */}
        <TabsContent value="estadisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Salud</CardTitle>
              <CardDescription>Análisis de tu historial médico</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Próximamente: Gráficos y análisis detallados de tu historial médico
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
