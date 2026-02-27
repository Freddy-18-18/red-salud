"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Users,
  Search,
  Gift,
  Award,
  TrendingUp,
  Calendar,
  Filter,
  DollarSign,
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

interface ClienteFidelizacion {
  id: string;
  cliente_id: string;
  puntos_acumulados: number;
  puntos_gastados: number;
  puntos_disponibles: number;
  nivel: string;
  fecha_ultima_compra: string;
  total_compras: number;
  numero_compras: number;
  beneficios_activos: unknown[];
}

export default function FidelizacionPage() {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteFidelizacion[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteFidelizacion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNivel, setSelectedNivel] = useState("");

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("farmacia_fidelizacion")
        .select("*")
        .order("puntos_acumulados", { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterClientes = useCallback(() => {
    let filtered = clientes;

    if (searchTerm) {
      filtered = filtered.filter((c) =>
        c.cliente_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedNivel) {
      filtered = filtered.filter((c) => c.nivel === selectedNivel);
    }

    setFilteredClientes(filtered);
  }, [clientes, searchTerm, selectedNivel]);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm, selectedNivel, filterClientes]);

  useEffect(() => {
    loadClientes();
  }, []);


  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case "bronce":
        return "🥉";
      case "plata":
        return "🥈";
      case "oro":
        return "🥇";
      case "platino":
        return "💎";
      default:
        return "⭐";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando clientes...</p>
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
              <h1 className="text-3xl font-bold">Fidelización</h1>
              <p className="text-muted-foreground">Programa de puntos y recompensas</p>
            </div>
            <Button size="sm">
              <Gift className="h-4 w-4 mr-2" />
              Nueva Promoción
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
                    placeholder="Buscar por cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedNivel}
                onChange={(e) => setSelectedNivel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los niveles</option>
                <option value="bronce">Bronce</option>
                <option value="plata">Plata</option>
                <option value="oro">Oro</option>
                <option value="platino">Platino</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredClientes.length} cliente{filteredClientes.length !== 1 ? "s" : ""}
              </span>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClientes.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedNivel
                    ? "No se encontraron clientes con los filtros aplicados"
                    : "No hay clientes registrados"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Puntos</TableHead>
                      <TableHead>Compras</TableHead>
                      <TableHead>Total Gastado</TableHead>
                      <TableHead>Última Compra</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{cliente.cliente_id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {getNivelIcon(cliente.nivel)}
                            </span>
                            <span className="capitalize ml-2">{cliente.nivel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-green-600">
                              {cliente.puntos_disponibles} pts
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cliente.puntos_acumulados} acumulados
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{cliente.numero_compras}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">
                              ${(cliente.total_compras || 0).toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {cliente.fecha_ultima_compra
                              ? new Date(cliente.fecha_ultima_compra).toLocaleDateString(
                                "es-VE"
                              )
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Award className="h-4 w-4 mr-2" />
                            Ver Beneficios
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Programa de Puntos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-4xl mb-2">🥉</div>
                <p className="font-bold">Bronce</p>
                <p className="text-sm text-muted-foreground">
                  1 punto por cada $10
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  5% descuento
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-4xl mb-2">🥈</div>
                <p className="font-bold">Plata</p>
                <p className="text-sm text-muted-foreground">
                  1.5 puntos por cada $10
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  10% descuento
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-4xl mb-2">🥇</div>
                <p className="font-bold">Oro</p>
                <p className="text-sm text-muted-foreground">
                  2 puntos por cada $10
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  15% descuento
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-4xl mb-2">💎</div>
                <p className="font-bold">Platino</p>
                <p className="text-sm text-muted-foreground">
                  3 puntos por cada $10
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  20% descuento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
