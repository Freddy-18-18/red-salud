"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Filter,
  Download,
  Upload,
  Warehouse,
  Calendar,
  DollarSign,
  RefreshCw,
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

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  presentacion: string;
  concentracion: string;
  laboratorio: string;
  lote: string;
  fecha_vencimiento: string;
  stock_actual: number;
  stock_minimo: number;
  precio_costo_usd: number;
  precio_venta_usd: number;
  precio_venta_ves: number;
  requiere_receta: boolean;
  estado: string;
  ubicacion?: string;
  zona?: string;
}

export default function InventarioPage() {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number>(36);
  const [showUSD, setShowUSD] = useState(true);

  const filterProductos = useCallback(() => {
    let filtered = productos;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.laboratorio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategoria) {
      filtered = filtered.filter((p) => p.categoria === selectedCategoria);
    }

    if (selectedEstado) {
      filtered = filtered.filter((p) => p.estado === selectedEstado);
    }

    if (selectedWarehouse) {
      filtered = filtered.filter((p) => p.ubicacion?.includes(selectedWarehouse));
    }

    setFilteredProductos(filtered);
  }, [productos, searchTerm, selectedCategoria, selectedEstado, selectedWarehouse]);

  useEffect(() => {
    loadProductos();
    loadExchangeRate();
  }, []);

  useEffect(() => {
    filterProductos();
  }, [productos, searchTerm, selectedCategoria, selectedEstado, selectedWarehouse, filterProductos]);

  const loadProductos = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("farmacia_inventario")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    try {
      // In a real implementation, this would use BCVRateFetcher from @red-salud/core/pharmacy
      setExchangeRate(36);
    } catch (error) {
      console.error("Error cargando tasa de cambio:", error);
    }
  };

  const categorias = Array.from(
    new Set(productos.map((p) => p.categoria).filter(Boolean))
  );

  const warehouses = Array.from(
    new Set(productos.map((p) => p.ubicacion).filter(Boolean))
  );

  const getExpiryStatus = (fecha: string) => {
    const expiryDate = new Date(fecha);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { status: 'expired', color: 'bg-red-200 text-red-900', label: 'Vencido' };
    if (daysUntilExpiry <= 30) return { status: 'warning', color: 'bg-orange-100 text-orange-800', label: `${daysUntilExpiry} días` };
    if (daysUntilExpiry <= 90) return { status: 'caution', color: 'bg-yellow-100 text-yellow-800', label: `${daysUntilExpiry} días` };
    return { status: 'ok', color: 'bg-green-100 text-green-800', label: 'OK' };
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "stock_bajo":
        return "bg-yellow-100 text-yellow-800";
      case "agotado":
        return "bg-red-100 text-red-800";
      case "vencido":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando inventario...</p>
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
              <h1 className="text-3xl font-bold">Inventario</h1>
              <p className="text-muted-foreground">
                Gestión de medicamentos y productos
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowUSD(!showUSD)}>
                <DollarSign className="h-4 w-4 mr-2" />
                {showUSD ? 'USD' : 'VES'}
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Tasa
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, descripción o laboratorio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas las ubicaciones</option>
                {warehouses.map((wh) => (
                  <option key={wh} value={wh}>
                    {wh}
                  </option>
                ))}
              </select>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="stock_bajo">Stock Bajo</option>
                <option value="agotado">Agotado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredProductos.length} producto{filteredProductos.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProductos.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategoria || selectedEstado
                    ? "No se encontraron productos con los filtros aplicados"
                    : "No hay productos en el inventario"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Laboratorio</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Precio {showUSD ? 'USD' : 'VES'}</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{producto.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {producto.presentacion} - {producto.concentracion}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{producto.categoria}</TableCell>
                        <TableCell>{producto.laboratorio}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{producto.ubicacion || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{producto.stock_actual}</span>
                            {producto.stock_actual <= producto.stock_minimo && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {showUSD 
                                ? `$${producto.precio_venta_usd?.toFixed(2) || '0.00'}` 
                                : `Bs. ${producto.precio_venta_ves?.toFixed(2) || '0.00'}`
                              }
                            </span>
                            {!showUSD && (
                              <span className="text-xs text-muted-foreground">
                                ~${((producto.precio_venta_ves || 0) / exchangeRate).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(producto.fecha_vencimiento).toLocaleDateString("es-VE")}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpiryStatus(producto.fecha_vencimiento).color}`}>
                              {getExpiryStatus(producto.fecha_vencimiento).label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                              producto.estado
                            )}`}
                          >
                            {producto.estado}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
