"use client";


import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Receipt,
  Eye,
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

interface Venta {
  id: string;
  numero_factura: string;
  fecha: string;
  nombre_cliente: string;
  cedula_cliente: string;
  productos: unknown[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  metodo_pago: string;
  estado: string;
}

export default function VentasPage() {
  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedMetodoPago, setSelectedMetodoPago] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  const filterVentas = useCallback(() => {
    let filtered = ventas;

    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.cedula_cliente?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEstado) {
      filtered = filtered.filter((v) => v.estado === selectedEstado);
    }

    if (selectedMetodoPago) {
      filtered = filtered.filter((v) => v.metodo_pago === selectedMetodoPago);
    }

    setFilteredVentas(filtered);
  }, [ventas, searchTerm, selectedEstado, selectedMetodoPago]);

  useEffect(() => {
    filterVentas();
  }, [ventas, searchTerm, selectedEstado, selectedMetodoPago, filterVentas]);

  const loadVentas = useCallback(async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("farmacia_ventas")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setVentas(data || []);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVentas();
  }, [loadVentas]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "completada":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      case "devuelta":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando ventas...</p>
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
              <h1 className="text-3xl font-bold">Ventas</h1>
              <p className="text-muted-foreground">Historial de transacciones</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <Receipt className="h-4 w-4 mr-2" />
                Nueva Venta
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
                    placeholder="Buscar por cliente, factura o cédula..."
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
                <option value="completada">Completada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
                <option value="devuelta">Devuelta</option>
              </select>
              <select
                value={selectedMetodoPago}
                onChange={(e) => setSelectedMetodoPago(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="punto_venta">Punto de Venta</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredVentas.length} venta{filteredVentas.length !== 1 ? "s" : ""}
              </span>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVentas.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedEstado || selectedMetodoPago
                    ? "No se encontraron ventas con los filtros aplicados"
                    : "No hay ventas registradas"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVentas.map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {venta.numero_factura || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{venta.nombre_cliente || "Cliente genérico"}</p>
                            <p className="text-xs text-muted-foreground">
                              {venta.cedula_cliente || "Sin cédula"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(venta.fecha).toLocaleDateString("es-VE")}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {venta.metodo_pago}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">
                              ${venta.total.toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                              venta.estado
                            )}`}
                          >
                            {venta.estado}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVentaSeleccionada(venta)}
                          >
                            <Eye className="h-4 w-4" />
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

        {ventaSeleccionada && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalle de Venta #{ventaSeleccionada.numero_factura}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVentaSeleccionada(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{ventaSeleccionada.nombre_cliente || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cédula</p>
                    <p className="font-medium">{ventaSeleccionada.cedula_cliente || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {new Date(ventaSeleccionada.fecha).toLocaleString("es-VE")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Método de Pago</p>
                    <p className="font-medium capitalize">
                      {ventaSeleccionada.metodo_pago}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Productos</p>
                  <div className="space-y-2">
                    {ventaSeleccionada.productos?.map((producto, index) => {
                      const prod = producto as { nombre: string; cantidad: number; precio_unitario: number };
                      return (
                        <div
                          key={index}
                          className="flex justify-between p-2 bg-muted/50 rounded"
                        >
                          <span>{prod.nombre}</span>
                          <span>
                            {prod.cantidad} x ${prod.precio_unitario.toFixed(2)} = $
                            {(prod.cantidad * prod.precio_unitario).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${ventaSeleccionada.subtotal.toFixed(2)}</span>
                  </div>
                  {ventaSeleccionada.descuento > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span>-${ventaSeleccionada.descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>IVA (16%):</span>
                    <span>${ventaSeleccionada.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">
                      ${ventaSeleccionada.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
