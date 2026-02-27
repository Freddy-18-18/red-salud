"use client";

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
  User,
  Phone,
  Droplet,
} from "lucide-react";

// Componente de preview con datos de ejemplo
export default function MedicalProfilePreview() {
  const mockProfile = {
    nombre_completo: "Juan Pérez García",
    fecha_nacimiento: "1985-03-15",
    cedula: "V-12345678",
    ciudad: "Caracas",
    grupo_sanguineo: "O+",
    alergias: ["Penicilina", "Mariscos", "Polen"],
    enfermedades_cronicas: ["Hipertensión", "Diabetes Tipo 2"],
    medicamentos_actuales: "Metformina 850mg - 2 veces al día\nLosartán 50mg - 1 vez al día",
    cirugias_previas: "Apendicectomía (2010)\nCirugía de rodilla (2018)",
    contacto_emergencia_nombre: "María Pérez",
    contacto_emergencia_telefono: "+58 412-1234567",
    contacto_emergencia_relacion: "Esposa",
  };

  const mockDocuments = [
    {
      id: 1,
      document_name: "Análisis de Sangre - Marzo 2024",
      document_type: "Laboratorio",
      created_at: "2024-03-15",
    },
    {
      id: 2,
      document_name: "Radiografía de Tórax",
      document_type: "Imagen",
      created_at: "2024-02-20",
    },
    {
      id: 3,
      document_name: "Informe Cardiológico",
      document_type: "Informe Médico",
      created_at: "2024-01-10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Perfil Médico</h1>
          <p className="text-muted-foreground mt-1">
            Información médica para compartir con profesionales de salud
          </p>
        </div>
        <Button>
          <Share2 className="mr-2 h-4 w-4" />
          Compartir Perfil
        </Button>
      </div>

      <Tabs defaultValue="medical" className="space-y-6">
        <TabsList>
          <TabsTrigger value="medical">Información Médica</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="sharing">Compartir</TabsTrigger>
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
                  <p className="font-medium">{mockProfile.nombre_completo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {new Date(mockProfile.fecha_nacimiento).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cédula</p>
                  <p className="font-medium">{mockProfile.cedula}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ciudad</p>
                  <p className="font-medium">{mockProfile.ciudad}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grupo Sanguíneo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-red-500" />
                Grupo Sanguíneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {mockProfile.grupo_sanguineo}
              </Badge>
            </CardContent>
          </Card>

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
              <div className="flex flex-wrap gap-2">
                {mockProfile.alergias.map((alergia, index) => (
                  <Badge key={index} variant="destructive">
                    {alergia}
                  </Badge>
                ))}
              </div>
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
              <div className="flex flex-wrap gap-2">
                {mockProfile.enfermedades_cronicas.map((enfermedad, index) => (
                  <Badge key={index} variant="secondary">
                    {enfermedad}
                  </Badge>
                ))}
              </div>
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
              <p className="whitespace-pre-wrap">{mockProfile.medicamentos_actuales}</p>
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
              <p className="whitespace-pre-wrap">{mockProfile.cirugias_previas}</p>
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
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{mockProfile.contacto_emergencia_nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{mockProfile.contacto_emergencia_telefono}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Relación</p>
                  <p className="font-medium">{mockProfile.contacto_emergencia_relacion}</p>
                </div>
              </div>
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
              <div className="space-y-3">
                {mockDocuments.map((doc) => (
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
                          {new Date(doc.created_at).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compartir */}
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
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Próximamente:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Generar enlaces temporales con expiración</li>
                    <li>• Código QR para consultas presenciales</li>
                    <li>• Compartir directo con doctores de la plataforma</li>
                    <li>• Control de permisos sobre información visible</li>
                    <li>• Registro de accesos y notificaciones</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
