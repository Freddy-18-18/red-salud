"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Bell,
  Search,
  AlertTriangle,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Archive,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";

interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  entidad_id: string;
  entidad_tipo: string;
  datos: Record<string, unknown>;
  fecha_creacion: string;
}

export default function AlertasPage() {
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [filteredAlertas, setFilteredAlertas] = useState<Alerta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedPrioridad, setSelectedPrioridad] = useState("");
  const [selectedEstado] = useState("");

  const filterAlertas = useCallback(() => {
    let filtered = alertas;

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTipo) {
      filtered = filtered.filter((a) => a.tipo === selectedTipo);
    }

    if (selectedPrioridad) {
      filtered = filtered.filter((a) => a.prioridad === selectedPrioridad);
    }

    if (selectedEstado) {
      filtered = filtered.filter((a) => a.estado === selectedEstado);
    }

    setFilteredAlertas(filtered);
  }, [alertas, searchTerm, selectedTipo, selectedPrioridad, selectedEstado]);

  const loadAlertas = useCallback(async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("farmacia_alertas")
        .select("*")
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;
      setAlertas(data || []);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlertas();
  }, [loadAlertas]);

  useEffect(() => {
    filterAlertas();
  }, [filterAlertas]);

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "critica":
        return "bg-red-100 border-red-300 text-red-800";
      case "alta":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "media":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "baja":
        return "bg-blue-100 border-blue-300 text-blue-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case "critica":
        return <AlertTriangle className="h-5 w-5" />;
      case "alta":
        return <AlertTriangle className="h-5 w-5" />;
      case "media":
        return <Clock className="h-5 w-5" />;
      case "baja":
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "stock_bajo":
        return <Package className="h-5 w-5" />;
      case "vencimiento":
        return <Clock className="h-5 w-5" />;
      case "pedido_pendiente":
        return <Package className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const marcarResuelta = async (alertaId: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from("farmacia_alertas")
        .update({ estado: "resuelta", fecha_resolucion: new Date().toISOString() })
        .eq("id", alertaId);

      if (error) throw error;
      loadAlertas();
    } catch (error) {
      console.error("Error marcando alerta como resuelta:", error);
      alert("Error al marcar la alerta como resuelta");
    }
  };

  const descartarAlerta = async (alertaId: string) => {
    if (!confirm("¿Estás seguro de descartar esta alerta?")) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from("farmacia_alertas")
        .update({ estado: "descartada" })
        .eq("id", alertaId);

      if (error) throw error;
      loadAlertas();
    } catch (error) {
      console.error("Error descartando alerta:", error);
      alert("Error al descartar la alerta");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando alertas...</p>
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
              <h1 className="text-3xl font-bold">Alertas</h1>
              <p className="text-muted-foreground">Centro de notificaciones</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archivar
              </Button>
              <Button size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Marcar Todas Leídas
              </Button>
            </div>
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
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los tipos</option>
                <option value="stock_bajo">Stock Bajo</option>
                <option value="vencimiento">Vencimiento</option>
                <option value="pedido_pendiente">Pedido Pendiente</option>
                <option value="receta_pendiente">Receta Pendiente</option>
              </select>
              <select
                value={selectedPrioridad}
                onChange={(e) => setSelectedPrioridad(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas las prioridades</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {alertas.filter((a) => a.prioridad === "critica" && a.estado === "activa").length}
                </div>
                <p className="text-sm text-muted-foreground">Críticas Activas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {alertas.filter((a) => a.prioridad === "alta" && a.estado === "activa").length}
                </div>
                <p className="text-sm text-muted-foreground">Altas Activas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {alertas.filter((a) => a.prioridad === "media" && a.estado === "activa").length}
                </div>
                <p className="text-sm text-muted-foreground">Medias Activas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {alertas.filter((a) => a.estado === "activa").length}
                </div>
                <p className="text-sm text-muted-foreground">Total Activas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredAlertas.length} alerta{filteredAlertas.length !== 1 ? "s" : ""}
              </span>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAlertas.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedTipo || selectedPrioridad
                    ? "No se encontraron alertas con los filtros aplicados"
                    : "No hay alertas activas"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-lg border ${alerta.estado === "activa"
                        ? getPrioridadColor(alerta.prioridad)
                        : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">
                            {getPrioridadIcon(alerta.prioridad)}
                          </span>
                          <span className="text-xl">
                            {getTipoIcon(alerta.tipo)}
                          </span>
                          <h3 className="font-semibold">{alerta.titulo}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${alerta.estado === "activa" ? getPrioridadColor(alerta.prioridad) : "bg-gray-200 text-gray-600"
                              }`}
                          >
                            {alerta.prioridad.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{alerta.descripcion}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="capitalize">{alerta.tipo.replace("_", " ")}</span>
                          <span>•</span>
                          <span>
                            {new Date(alerta.fecha_creacion).toLocaleString("es-VE")}
                          </span>
                        </div>
                      </div>
                      {alerta.estado === "activa" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => marcarResuelta(alerta.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => descartarAlerta(alerta.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
