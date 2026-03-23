"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Pill,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@red-salud/design-system";

interface Receta {
  id: string;
  numero_receta: string;
  nombre_paciente: string;
  cedula_paciente: string;
  nombre_medico: string;
  especialidad_medico: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  diagnostico: string;
  medicamentos: unknown[];
  indicaciones: string;
  estado: string;
  prioridad: string;
}

export default function RecetasPage() {
  const [loading, setLoading] = useState(true);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [filteredRecetas, setFilteredRecetas] = useState<Receta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedPrioridad, setSelectedPrioridad] = useState("");

  const loadRecetas = useCallback(async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("farmacia_recetas")
        .select("*")
        .order("fecha_emision", { ascending: false });

      if (error) throw error;
      setRecetas(data || []);
    } catch (error) {
      console.error("Error cargando recetas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterRecetas = useCallback(() => {
    let filtered = recetas;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.nombre_medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.numero_receta?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEstado) {
      filtered = filtered.filter((r) => r.estado === selectedEstado);
    }

    if (selectedPrioridad) {
      filtered = filtered.filter((r) => r.prioridad === selectedPrioridad);
    }

    setFilteredRecetas(filtered);
  }, [recetas, searchTerm, selectedEstado, selectedPrioridad]);

  useEffect(() => {
    loadRecetas();
  }, [loadRecetas]);

  useEffect(() => {
    filterRecetas();
  }, [filterRecetas]);

  const procesarReceta = async (recetaId: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from("farmacia_recetas")
        .update({ estado: "procesada", fecha_procesamiento: new Date().toISOString() })
        .eq("id", recetaId);

      if (error) throw error;
      loadRecetas();
      alert("Receta procesada exitosamente");
    } catch (error) {
      console.error("Error procesando receta:", error);
      alert("Error al procesar la receta");
    }
  };

  const cancelarReceta = async (recetaId: string) => {
    if (!confirm("¿Estás seguro de cancelar esta receta?")) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from("farmacia_recetas")
        .update({ estado: "cancelada" })
        .eq("id", recetaId);

      if (error) throw error;
      loadRecetas();
    } catch (error) {
      console.error("Error cancelando receta:", error);
      alert("Error al cancelar la receta");
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "procesada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      case "vencida":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "bg-red-100 text-red-800";
      case "cronico":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando recetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Recetas</h1>
              <p className="text-muted-foreground">
                Gestión de recetas médicas
              </p>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Nueva Receta
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente, médico o número de receta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="procesada">Procesada</option>
                <option value="cancelada">Cancelada</option>
                <option value="vencida">Vencida</option>
              </select>
              <select
                value={selectedPrioridad}
                onChange={(e) => setSelectedPrioridad(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas las prioridades</option>
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
                <option value="cronico">Crónico</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredRecetas.length} receta{filteredRecetas.length !== 1 ? "s" : ""}
              </span>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecetas.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedEstado || selectedPrioridad
                    ? "No se encontraron recetas con los filtros aplicados"
                    : "No hay recetas registradas"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecetas.map((receta) => (
                      <TableRow key={receta.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {receta.numero_receta || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{receta.nombre_paciente}</p>
                            <p className="text-xs text-muted-foreground">
                              CI: {receta.cedula_paciente}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{receta.nombre_medico}</p>
                            <p className="text-xs text-muted-foreground">
                              {receta.especialidad_medico}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(receta.fecha_emision).toLocaleDateString(
                              "es-VE"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(
                              receta.prioridad
                            )}`}
                          >
                            {receta.prioridad}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                              receta.estado
                            )}`}
                          >
                            {receta.estado}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {receta.estado === "pendiente" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => procesarReceta(receta.id)}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => cancelarReceta(receta.id)}
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            {receta.estado === "vencida" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => procesarReceta(receta.id)}
                              >
                                <Clock className="h-4 w-4 text-yellow-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
