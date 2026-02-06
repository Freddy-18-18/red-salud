"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Receipt,
  X,
  Barcode,
  Package,
  Clock,
  AlertCircle,
  Pause,
  Play,
  Save,
  Keyboard,
  User,
  Scan,
  DollarSign as CurrencyIcon,
} from "lucide-react";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import { CurrencyManager, BCVRateFetcher } from "@red-salud/core/pharmacy";

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  presentacion: string;
  concentracion: string;
  stock_actual: number;
  precio_venta_usd: number;
  precio_venta_ves: number;
  precio_costo_usd: number;
  requiere_receta: boolean;
  sustancia_controlada: boolean;
  ingrediente_activo?: string;
  nombre_generico?: string;
  iva_rate: number;
  iva_exento: boolean;
  fecha_vencimiento?: string;
  lote?: string;
}

interface CarritoItem {
  producto: Producto;
  cantidad: number;
  lote_id?: string;
}

interface HeldCart {
  id: string;
  items: CarritoItem[];
  timestamp: string;
}

export default function CajaPage() {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta" | "pago_movil" | "zelle" | "transferencia">("efectivo");
  const [procesando, setProcesando] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(36);
  const [showUSD, setShowUSD] = useState(true);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [showHeldCarts, setShowHeldCarts] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  useEffect(() => {
    loadProductos();
    loadExchangeRate();
    loadHeldCarts();
    setupKeyboardShortcuts();
  }, []);

  const setupKeyboardShortcuts = useCallback(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F1 - Focus search
      if (e.key === 'F1') {
        e.preventDefault();
        document.getElementById('product-search')?.focus();
      }
      // F4 - Hold cart
      if (e.key === 'F4') {
        e.preventDefault();
        holdCart();
      }
      // F5 - Retrieve held cart
      if (e.key === 'F5') {
        e.preventDefault();
        setShowHeldCarts(!showHeldCarts);
      }
      // F9 - Checkout
      if (e.key === 'F9') {
        e.preventDefault();
        if (carrito.length > 0) procesarVenta();
      }
      // F10 - Show totals
      if (e.key === 'F10') {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      // F12 - Clear cart
      if (e.key === 'F12') {
        e.preventDefault();
        if (confirm('¿Limpiar carrito?')) setCarrito([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [carrito, showHeldCarts]);

  const loadExchangeRate = async () => {
    try {
      const rate = await BCVRateFetcher.fetchRateWithFallback(36);
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    }
  };

  const loadHeldCarts = () => {
    const held: HeldCart[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('hold_')) {
        const heldCartStr = localStorage.getItem(key);
        if (heldCartStr) {
          held.push(JSON.parse(heldCartStr));
        }
      }
    }
    setHeldCarts(held);
  };

  useEffect(() => {
    filterProductos();
  }, [productos, searchTerm]);

  const loadProductos = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from("farmacia_inventario")
        .select("*")
        .eq("estado", "activo")
        .order("nombre");

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProductos = () => {
    let filtered = productos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.categoria.toLowerCase().includes(term) ||
          p.ingrediente_activo?.toLowerCase().includes(term) ||
          p.nombre_generico?.toLowerCase().includes(term) ||
          p.presentacion.toLowerCase().includes(term)
      );
    }

    setFilteredProductos(filtered);
  };

  const agregarAlCarrito = (producto: Producto, cantidad: number = 1) => {
    // Check if product requires prescription
    if (producto.requiere_receta) {
      if (!confirm(`⚠️ ${producto.nombre} requiere receta médica. ¿Continuar?`)) {
        return;
      }
    }

    // Check if product is controlled substance
    if (producto.sustancia_controlada) {
      if (!confirm(`⚠️ ${producto.nombre} es sustancia controlada. ¿Continuar?`)) {
        return;
      }
    }

    // Check stock availability
    const currentInCart = carrito
      .filter((item) => item.producto.id === producto.id)
      .reduce((sum, item) => sum + item.cantidad, 0);

    if (currentInCart + cantidad > producto.stock_actual) {
      alert(`Stock insuficiente. Disponible: ${producto.stock_actual - currentInCart}`);
      return;
    }

    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { producto, cantidad }];
    });
    setQuantityInput(1);
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }

    setCarrito((prev) =>
      prev.map((item) => {
        if (item.producto.id === productoId) {
          if (nuevaCantidad > item.producto.stock_actual) {
            alert(`Stock máximo: ${item.producto.stock_actual}`);
            return item;
          }
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      })
    );
  };

  const subtotalUSD = carrito.reduce(
    (sum, item) => sum + item.producto.precio_venta_usd * item.cantidad,
    0
  );
  const subtotalVES = carrito.reduce(
    (sum, item) => sum + item.producto.precio_venta_ves * item.cantidad,
    0
  );
  const ivaUSD = carrito.reduce(
    (sum, item) => sum + (item.producto.precio_venta_usd * item.cantidad * item.producto.iva_rate),
    0
  );
  const ivaVES = carrito.reduce(
    (sum, item) => sum + (item.producto.precio_venta_ves * item.cantidad * item.producto.iva_rate),
    0
  );
  const totalUSD = subtotalUSD + ivaUSD;
  const totalVES = subtotalVES + ivaVES;

  const holdCart = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    const holdId = `hold_${Date.now()}`;
    const heldCart: HeldCart = {
      id: holdId,
      items: carrito,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(holdId, JSON.stringify(heldCart));
    setCarrito([]);
    loadHeldCarts();
    alert('Carrito guardado en espera');
  };

  const retrieveHeldCart = (holdId: string) => {
    const heldCartStr = localStorage.getItem(holdId);
    if (heldCartStr) {
      const heldCart = JSON.parse(heldCartStr);
      setCarrito(heldCart.items);
      localStorage.removeItem(holdId);
      loadHeldCarts();
      setShowHeldCarts(false);
    }
  };

  const deleteHeldCart = (holdId: string) => {
    localStorage.removeItem(holdId);
    loadHeldCarts();
  };

  const procesarVenta = async () => {
    if (carrito.length === 0) return;

    setProcesando(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create venta
      const { data: venta, error: ventaError } = await supabase
        .from("farmacia_ventas")
        .insert({
          invoice_number: invoiceNumber,
          productos: carrito.map((item) => ({
            producto_id: item.producto.id,
            nombre: item.producto.nombre,
            cantidad: item.cantidad,
            precio_unitario_usd: item.producto.precio_venta_usd,
            precio_unitario_ves: item.producto.precio_venta_ves,
            subtotal_usd: item.producto.precio_venta_usd * item.cantidad,
            subtotal_ves: item.producto.precio_venta_ves * item.cantidad,
            iva_rate: item.producto.iva_rate,
          })),
          subtotal_usd: subtotalUSD,
          subtotal_ves: subtotalVES,
          iva_usd: ivaUSD,
          iva_ves: ivaVES,
          total_usd: totalUSD,
          total_ves: totalVES,
          metodo_pago: metodoPago,
          exchange_rate: exchangeRate,
          estado: "completada",
        })
        .select()
        .single();

      if (ventaError) throw ventaError;

      // Update inventory (FEFO - First Expired First Out)
      for (const item of carrito) {
        const { error: updateError } = await supabase
          .from("farmacia_inventario")
          .update({ stock_actual: item.producto.stock_actual - item.cantidad })
          .eq("id", item.producto.id);

        if (updateError) throw updateError;
      }

      // Clear cart and reload products
      setCarrito([]);
      loadProductos();
      alert(`Venta procesada exitosamente\nFactura: ${invoiceNumber}`);
    } catch (error) {
      console.error("Error procesando venta:", error);
      alert("Error al procesar la venta");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando caja...</p>
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
              <h1 className="text-3xl font-bold">Caja POS</h1>
              <p className="text-muted-foreground">Punto de venta</p>
            </div>
            <Button variant="outline" size="sm">
              <Receipt className="h-4 w-4 mr-2" />
              Historial
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar producto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProductos.map((producto) => (
                    <Card
                      key={producto.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="h-4 w-4 text-primary" />
                              <h3 className="font-medium text-sm">{producto.nombre}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {producto.presentacion} - {producto.concentracion}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-green-600">
                                ${producto.precio_venta_usd.toFixed(2)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Stock: {producto.stock_actual}
                              </span>
                            </div>
                          </div>
                          <Plus className="h-5 w-5 text-primary shrink-0 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredProductos.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No se encontraron productos"
                        : "No hay productos disponibles"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Carrito */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito ({carrito.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {carrito.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Carrito vacío
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Items del carrito */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {carrito.map((item) => (
                        <div
                          key={item.producto.id}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.producto.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${item.producto.precio_venta_usd.toFixed(2)} x{" "}
                              {item.cantidad}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                actualizarCantidad(item.producto.id, -1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.cantidad}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                actualizarCantidad(item.producto.id, 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => eliminarDelCarrito(item.producto.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Resumen */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm items-center">
                        <span>Subtotal:</span>
                        <div className="text-right">
                          <div className="font-medium">${subtotalUSD.toFixed(2)} USD</div>
                          <div className="text-xs text-muted-foreground">Bs. {subtotalVES.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span>IVA (16%):</span>
                        <div className="text-right">
                          <div className="font-medium">${ivaUSD.toFixed(2)} USD</div>
                          <div className="text-xs text-muted-foreground">Bs. {ivaVES.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="flex justify-between font-bold text-lg items-center">
                        <span>Total:</span>
                        <div className="text-right">
                          <div className="text-green-600 text-lg">${totalUSD.toFixed(2)} USD</div>
                          <div className="text-xs text-muted-foreground">Bs. {totalVES.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-center pt-2">
                        Tasa: ${exchangeRate.toFixed(2)} USD/Bs.
                      </div>
                    </div>

                    {/* Método de pago */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Método de pago:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={metodoPago === "efectivo" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMetodoPago("efectivo")}
                          className="flex flex-col items-center gap-1"
                        >
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs">Efectivo</span>
                        </Button>
                        <Button
                          variant={metodoPago === "tarjeta" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMetodoPago("tarjeta")}
                          className="flex flex-col items-center gap-1"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span className="text-xs">Tarjeta</span>
                        </Button>
                        <Button
                          variant={metodoPago === "pago_movil" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMetodoPago("pago_movil")}
                          className="flex flex-col items-center gap-1"
                        >
                          <Barcode className="h-4 w-4" />
                          <span className="text-xs">Pago Móvil</span>
                        </Button>
                        <Button
                          variant={metodoPago === "zelle" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMetodoPago("zelle")}
                          className="flex flex-col items-center gap-1"
                        >
                          <CurrencyIcon className="h-4 w-4" />
                          <span className="text-xs">Zelle</span>
                        </Button>
                        <Button
                          variant={metodoPago === "transferencia" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMetodoPago("transferencia")}
                          className="flex flex-col items-center gap-1"
                        >
                          <Barcode className="h-4 w-4" />
                          <span className="text-xs">Transf.</span>
                        </Button>
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={holdCart}
                        disabled={carrito.length === 0}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        <span className="text-xs">Poner en Espera (F4)</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHeldCarts(!showHeldCarts)}
                        disabled={heldCarts.length === 0}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        <span className="text-xs">Recuperar (F5)</span>
                      </Button>
                    </div>

                    {/* Botón procesar */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={procesarVenta}
                      disabled={procesando || carrito.length === 0}
                    >
                      {procesando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Receipt className="h-4 w-4 mr-2" />
                          Procesar Venta
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Held Carts Modal */}
      {showHeldCarts && heldCarts.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Carritos en Espera</span>
                <Button variant="ghost" size="sm" onClick={() => setShowHeldCarts(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-2">
                {heldCarts.map((held) => (
                  <div
                    key={held.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{held.items.length} productos</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(held.timestamp).toLocaleString('es-VE')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retrieveHeldCart(held.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Recuperar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHeldCart(held.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Atajos de Teclado</span>
                <Button variant="ghost" size="sm" onClick={() => setShowKeyboardShortcuts(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>F1</span>
                  <span className="text-muted-foreground">Buscar producto</span>
                </div>
                <div className="flex justify-between">
                  <span>F4</span>
                  <span className="text-muted-foreground">Poner en espera</span>
                </div>
                <div className="flex justify-between">
                  <span>F5</span>
                  <span className="text-muted-foreground">Recuperar carrito</span>
                </div>
                <div className="flex justify-between">
                  <span>F9</span>
                  <span className="text-muted-foreground">Procesar venta</span>
                </div>
                <div className="flex justify-between">
                  <span>F10</span>
                  <span className="text-muted-foreground">Ver atajos</span>
                </div>
                <div className="flex justify-between">
                  <span>F12</span>
                  <span className="text-muted-foreground">Limpiar carrito</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
