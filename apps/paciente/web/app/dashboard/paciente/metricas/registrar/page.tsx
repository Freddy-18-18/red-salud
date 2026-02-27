"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Textarea } from "@red-salud/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@red-salud/design-system";
import { useHealthMetricTypes, useCreateHealthMetric } from "@/hooks/use-health-metrics";
import { ArrowLeft, Activity, Save } from "lucide-react";
import Link from "next/link";

export default function RegistrarMetricaPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form state
  const [metricTypeId, setMetricTypeId] = useState("");
  const [valor, setValor] = useState("");
  const [valorSecundario, setValorSecundario] = useState("");
  const [fechaMedicion, setFechaMedicion] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [notas, setNotas] = useState("");
  const [ubicacion, setUbicacion] = useState("Casa");
  const [medidoPor, setMedidoPor] = useState("Paciente");
  const [dispositivo, setDispositivo] = useState("");

  const { metricTypes } = useHealthMetricTypes();
  const { create, loading: creating } = useCreateHealthMetric();

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

  const selectedMetricType = metricTypes.find((t) => t.id === metricTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !metricTypeId || !valor) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    const result = await create({
      paciente_id: userId,
      metric_type_id: metricTypeId,
      valor: parseFloat(valor),
      valor_secundario: valorSecundario ? parseFloat(valorSecundario) : undefined,
      fecha_medicion: new Date(fechaMedicion).toISOString(),
      notas: notas || undefined,
      ubicacion: ubicacion || undefined,
      medido_por: medidoPor || undefined,
      dispositivo: dispositivo || undefined,
    });

    if (result.success) {
      router.push("/dashboard/paciente/metricas");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/paciente/metricas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Registrar Métrica</h1>
        <p className="text-muted-foreground mt-1">
          Registra una nueva medición de salud
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Métrica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tipo de Métrica
            </CardTitle>
            <CardDescription>Selecciona qué deseas medir</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={metricTypeId} onValueChange={setMetricTypeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una métrica" />
              </SelectTrigger>
              <SelectContent>
                {metricTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.nombre} ({type.unidad_medida})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedMetricType && selectedMetricType.descripcion && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedMetricType.descripcion}
              </p>
            )}

            {selectedMetricType && selectedMetricType.rango_normal_min && selectedMetricType.rango_normal_max && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Rango Normal:</p>
                <p className="text-sm text-blue-700">
                  {selectedMetricType.rango_normal_min} - {selectedMetricType.rango_normal_max}{" "}
                  {selectedMetricType.unidad_medida}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Valores */}
        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
            <CardDescription>Ingresa las mediciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="valor">
                Valor {selectedMetricType?.requiere_multiple_valores && "(Sistólica)"} *
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="Ej: 120"
                  required
                  className="flex-1"
                />
                {selectedMetricType && (
                  <span className="flex items-center px-3 border rounded-md bg-muted text-sm">
                    {selectedMetricType.unidad_medida}
                  </span>
                )}
              </div>
            </div>

            {selectedMetricType?.requiere_multiple_valores && (
              <div>
                <Label htmlFor="valor-secundario">Valor Secundario (Diastólica)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="valor-secundario"
                    type="number"
                    step="0.01"
                    value={valorSecundario}
                    onChange={(e) => setValorSecundario(e.target.value)}
                    placeholder="Ej: 80"
                    className="flex-1"
                  />
                  <span className="flex items-center px-3 border rounded-md bg-muted text-sm">
                    {selectedMetricType.unidad_medida}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="fecha">Fecha y Hora de Medición *</Label>
              <Input
                id="fecha"
                type="datetime-local"
                value={fechaMedicion}
                onChange={(e) => setFechaMedicion(e.target.value)}
                required
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Select value={ubicacion} onValueChange={setUbicacion}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="Clínica">Clínica</SelectItem>
                  <SelectItem value="Farmacia">Farmacia</SelectItem>
                  <SelectItem value="Gimnasio">Gimnasio</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="medido-por">Medido Por</Label>
              <Select value={medidoPor} onValueChange={setMedidoPor}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paciente">Paciente</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Enfermera">Enfermera</SelectItem>
                  <SelectItem value="Familiar">Familiar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dispositivo">Dispositivo Usado</Label>
              <Input
                id="dispositivo"
                value={dispositivo}
                onChange={(e) => setDispositivo(e.target.value)}
                placeholder="Ej: Tensiómetro Omron HEM-7120"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Observaciones, síntomas, contexto..."
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-2">
          <Link href="/dashboard/paciente/metricas" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={creating} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            {creating ? "Guardando..." : "Guardar Métrica"}
          </Button>
        </div>
      </form>
    </div>
  );
}
