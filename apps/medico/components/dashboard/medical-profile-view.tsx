"use client";

import { usePatientProfile, usePatientDocuments } from "@/hooks/use-patient-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/design-system";
import {
  AlertCircle,
  Heart,
  Pill,
  Scissors,
  FileText,
  Share2,
  Shield,
  User,
  Phone,
  Droplet,
} from "lucide-react";

interface MedicalProfileViewProps {
  userId: string;
  isOwner: boolean;
  isShared?: boolean;
}

interface MedicalDocument {
  id: string;
  document_name: string;
  document_type: string;
  document_url?: string;
  created_at?: string;
}

export default function MedicalProfileView({
  userId,
  isOwner,
  isShared = false,
}: MedicalProfileViewProps) {
  const { profile, loading } = usePatientProfile(userId);
  const { documents } = usePatientDocuments(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil médico...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No se pudo cargar el perfil médico
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Perfil Médico</h1>
          <p className="text-muted-foreground mt-1">
            {isShared
              ? "Vista compartida de información médica"
              : "Información médica para compartir con profesionales de salud"}
          </p>
        </div>
        {isOwner && !isShared && (
          <Button>
            <Share2 className="mr-2 h-4 w-4" />
            Compartir Perfil
          </Button>
        )}
      </div>

      {isShared && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <Shield className="h-5 w-5" />
              <p className="text-sm font-medium">
                Esta es una vista compartida. Solo se muestra información médica relevante.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="medical" className="space-y-6">
        <TabsList>
          <TabsTrigger value="medical">Información Médica</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          {isOwner && <TabsTrigger value="sharing">Compartir</TabsTrigger>}
        </TabsList>

        {/* Información Médica */}
        <TabsContent value="medical" className="space-y-6">
          {/* Datos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{profile.nombre_completo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {profile.fecha_nacimiento
                      ? new Date(profile.fecha_nacimiento).toLocaleDateString("es-ES")
                      : "No especificada"}
                  </p>
                </div>
                {!isShared && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Cédula</p>
                      <p className="font-medium">{profile.cedula || "No especificada"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ciudad</p>
                      <p className="font-medium">{profile.ciudad || "No especificada"}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grupo Sanguíneo */}
          {profile.grupo_sanguineo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-red-500" />
                  Grupo Sanguíneo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {profile.grupo_sanguineo}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Alergias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Alergias
              </CardTitle>
              <CardDescription>
                Reacciones adversas conocidas a medicamentos o sustancias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.alergias && profile.alergias.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.alergias.map((alergia, index) => (
                    <Badge key={index} variant="destructive">
                      {alergia}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No se han registrado alergias</p>
              )}
            </CardContent>
          </Card>

          {/* Enfermedades Crónicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                Condiciones Médicas Crónicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.enfermedades_cronicas && profile.enfermedades_cronicas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.enfermedades_cronicas.map((enfermedad, index) => (
                    <Badge key={index} variant="secondary">
                      {enfermedad}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No se han registrado condiciones crónicas
                </p>
              )}
            </CardContent>
          </Card>

          {/* Medicamentos Actuales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-green-500" />
                Medicamentos Actuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.medicamentos_actuales ? (
                <p className="whitespace-pre-wrap">{profile.medicamentos_actuales}</p>
              ) : (
                <p className="text-muted-foreground">No se han registrado medicamentos</p>
              )}
            </CardContent>
          </Card>

          {/* Cirugías Previas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-purple-500" />
                Cirugías y Procedimientos Previos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.cirugias_previas ? (
                <p className="whitespace-pre-wrap">{profile.cirugias_previas}</p>
              ) : (
                <p className="text-muted-foreground">
                  No se han registrado cirugías previas
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contacto de Emergencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-orange-500" />
                Contacto de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.contacto_emergencia_nombre ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{profile.contacto_emergencia_nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{profile.contacto_emergencia_telefono}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Relación</p>
                    <p className="font-medium">{profile.contacto_emergencia_relacion}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No se ha registrado contacto de emergencia
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Médicos
              </CardTitle>
              <CardDescription>
                Análisis, imágenes y otros documentos médicos relevantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {(documents as MedicalDocument[]).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.document_type} •{" "}
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString("es-ES") : ""}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay documentos disponibles</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compartir */}
        {isOwner && (
          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compartir Perfil Médico</CardTitle>
                <CardDescription>
                  Genera enlaces temporales para compartir tu información médica con
                  profesionales de salud
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Funcionalidad de compartir próximamente...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
