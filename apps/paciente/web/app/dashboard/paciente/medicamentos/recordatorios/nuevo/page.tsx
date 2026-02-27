"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Textarea } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Calendar } from "@red-salud/design-system";
import { useCreateReminder, useSearchMedications } from "@/hooks/use-medications";
import { ArrowLeft, Plus, X, Search, Bell, Clock } from "lucide-react";
import Link from "next/link";
import { es } from "date-fns/locale";

export default function NuevoRecordatorioPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form state
  const [nombreMedicamento, setNombreMedicamento] = useState("");
  const [dosis, setDosis] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [nuevoHorario, setNuevoHorario] = useState("");
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date | undefined>();
  const [notas, setNotas] = useState("");
  const [notificarEmail, setNotificarEmail] = useState(false);
  const [notificarPush, setNotificarPush] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { create, loading: creating } = useCreateReminder();
  const { results: searchResults, search, clearSearch } = useSearchMedications();

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      search(term);
    } else {
      clearSearch();
    }
  };

  const selectMedication = (medication: { nombre_comercial: string; dosis_usual?: string }) => {
    setNombreMedicamento(medication.nombre_comercial);
    setDosis(medication.dosis_usual || "");
    clearSearch();
    setSearchTerm("");
  };

  const agregarHorario = () => {
    if (nuevoHorario && !horarios.includes(nuevoHorario)) {
      setHorarios([...horarios, nuevoHorario].sort());
      setNuevoHorario("");
    }
  };

  const eliminarHorario = (horario: string) => {
    setHorarios(horarios.filter((h) => h !== horario));
  };

  const toggleDiaSemana = (dia: number) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter((d) => d !== dia));
    } else {
      setDiasSemana([...diasSemana, dia].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !nombreMedicamento || !dosis || horarios.length === 0) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const result = await create({
      paciente_id: userId,
      nombre_medicamento: nombreMedicamento,
      dosis,
      horarios,
      dias_semana: diasSemana.length > 0 ? diasSemana : undefined,
      fecha_inicio: fechaInicio.toISOString().split("T")[0] || "",
      fecha_fin: fechaFin?.toISOString().split("T")[0],
      notificar_email: notificarEmail,
      notificar_push: notificarPush,
      notas,
    });

    if (result.success) {
      router.push("/dashboard/paciente/medicamentos");
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

  const diasSemanaLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/paciente/medicamentos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nuevo Recordatorio</h1>
        <p className="text-muted-foreground mt-1">
          Configura un recordatorio para tu medicamento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Buscar Medicamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Medicamento
            </CardTitle>
            <CardDescription>Busca en el catálogo o escribe el nombre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">Buscar medicamento</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => selectMedication(med)}
                      className="w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                    >
                      <p className="font-medium">{med.nombre_comercial}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.nombre_generico} - {med.concentracion}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="nombre">Nombre del Medicamento *</Label>
              <Input
                id="nombre"
                value={nombreMedicamento}
                onChange={(e) => setNombreMedicamento(e.target.value)}
                placeholder="Ej: Paracetamol"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="dosis">Dosis *</Label>
              <Input
                id="dosis"
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Ej: 500mg"
                required
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Horarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios
            </CardTitle>
            <CardDescription>¿A qué horas debes tomar el medicamento?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="time"
                value={nuevoHorario}
                onChange={(e) => setNuevoHorario(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={agregarHorario}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {horarios.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {horarios.map((horario) => (
                  <Badge key={horario} variant="secondary" className="text-base px-3 py-1">
                    {horario}
                    <button
                      type="button"
                      onClick={() => eliminarHorario(horario)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {horarios.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Agrega al menos un horario
              </p>
            )}
          </CardContent>
        </Card>

        {/* Días de la Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Días de la Semana</CardTitle>
            <CardDescription>
              Deja vacío para todos los días o selecciona días específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {diasSemanaLabels.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDiaSemana(index)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                    diasSemana.includes(index)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card>
          <CardHeader>
            <CardTitle>Duración</CardTitle>
            <CardDescription>¿Cuándo inicia y termina el tratamiento?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Inicio *</Label>
                <Calendar
                  mode="single"
                  selected={fechaInicio}
                  onSelect={(date) => date && setFechaInicio(date)}
                  locale={es}
                  className="rounded-md border mt-2"
                />
              </div>
              <div>
                <Label>Fecha de Fin (Opcional)</Label>
                <Calendar
                  mode="single"
                  selected={fechaFin}
                  onSelect={setFechaFin}
                  locale={es}
                  disabled={(date) => date < fechaInicio}
                  className="rounded-md border mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones y Notas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones y Notas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notificar-push"
                checked={notificarPush}
                onChange={(e) => setNotificarPush(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="notificar-push" className="cursor-pointer">
                Notificaciones push
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notificar-email"
                checked={notificarEmail}
                onChange={(e) => setNotificarEmail(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="notificar-email" className="cursor-pointer">
                Notificaciones por email
              </Label>
            </div>

            <div>
              <Label htmlFor="notas">Notas (Opcional)</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Instrucciones especiales, efectos secundarios a vigilar, etc."
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-2">
          <Link href="/dashboard/paciente/medicamentos" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={creating} className="flex-1">
            {creating ? "Creando..." : "Crear Recordatorio"}
          </Button>
        </div>
      </form>
    </div>
  );
}
