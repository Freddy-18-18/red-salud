"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Truck,
  Search,
  MapPin,
  CheckCircle,
  XCircle,
  Navigation,
  User,
  Filter,
  Calendar,
} from "lucide-react";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@red-salud/ui";

interface Entrega {
  id: string;
  venta_id: string;
  nombre_cliente: string;
  cedula_cliente: string;
  telefono: string;
  direccion_entrega: string;
  referencia_direccion: string;
  fecha_programada: string;
  fecha_entrega: string;
  estado: string;
  costo_entrega: number;
  asignado_a: string;
  tracking_code: string;
}

export default function EntregasPage() {
  const [loading, setLoading] = useState(true);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [filteredEntregas, setFilteredEntregas] = useState<Entrega[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");

  const filterEntregas = useCallback(() => {
    let filtered = entregas;

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.cedula_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEstado) {
      filtered = filtered.filter((e) => e.estado === selectedEstado);
    }

    setFilteredEntregas(filtered);
  }, [entregas, searchTerm, selectedEstado]);

  useEffect(() => {
    loadEntregas();
  }, []);

  useEffect(() => {
    filterEntregas();
  }, [entregas, searchTerm, selectedEstado, filterEntregas]);

  const loadEntregas = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("farmacia_entregas")
        .select("*")
        .order("fecha_programada", { ascending: false });

      if (error) throw error;
      setEntregas(data || []);
    } catch (error) {
      console.error("Error cargando entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "en_ruta":
        return "bg-blue-100 text-blue-800";
      case "entregada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      case "fallida":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const actualizarEstado = async (entregaId: string, nuevoEstado: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from("farmacia_entregas")
        .update({
          estado: nuevoEstado,
          fecha_entrega: nuevoEstado === "entregada" ? new Date().toISOString() : undefined,
        })
        .eq("id", entregaId);

      if (error) throw error;
      loadEntregas();
    } catch (error) {
      console.error("Error actualizando entrega:", error);
      alert("Error al actualizar el estado de la entrega");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando entregas...</p>
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
              <h1 className="text-3xl font-bold">Entregas a Domicilio</h1>
              <p className="text-muted-foreground">Gestión de entregas</p>
            </div>
            <Button size="sm">
              <Truck className="h-4 w-4 mr-2" />
              Nueva Entrega
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente, cédula o tracking..."
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
                <option value="en_ruta">En Ruta</option>
                <option value="entregada">Entregada</option>
                <option value="cancelada">Cancelada</option>
                <option value="fallida">Fallida</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredEntregas.length} entrega{filteredEntregas.length !== 1 ? "s" : ""}
              </span>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEntregas.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedEstado
                    ? "No se encontraron entregas con los filtros aplicados"
                    : "No hay entregas registradas"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Fecha Programada</TableHead>
                      <TableHead>Repartidor</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntregas.map((entrega) => (
                      <TableRow key={entrega.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entrega.nombre_cliente}</p>
                            <p className="text-xs text-muted-foreground">
                              CI: {entrega.cedula_cliente}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm">{entrega.direccion_entrega}</p>
                                {entrega.referencia_direccion && (
                                  <p className="text-xs text-muted-foreground">
                                    {entrega.referencia_direccion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(entrega.fecha_programada).toLocaleString(
                              "es-VE"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {entrega.asignado_a || "Sin asignar"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-muted-foreground" />
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {entrega.tracking_code || "N/A"}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                              entrega.estado
                            )}`}
                          >
                            {entrega.estado}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {entrega.estado === "pendiente" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => actualizarEstado(entrega.id, "en_ruta")}
                              >
                                <Truck className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            {entrega.estado === "en_ruta" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => actualizarEstado(entrega.id, "entregada")}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {(entrega.estado === "pendiente" ||
                              entrega.estado === "en_ruta") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => actualizarEstado(entrega.id, "cancelada")}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
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
