"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  Barcode,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Fingerprint,
  QrCode,
  Smartphone,
  Trash2,
  Plus,
  Minus,
  User,
  Package,
  Pill,
  Heart,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@red-salud/core/utils";

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  generic_name?: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_ves: number;
  total_usd: number;
  total_ves: number;
  iva_rate: number;
  iva_usd: number;
  iva_ves: number;
  requires_prescription: boolean;
  controlled_substance: boolean;
}

interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  generic_name: string;
  sale_price_usd: number;
  sale_price_ves: number;
  iva_rate: number;
  requires_prescription: boolean;
  controlled_substance: boolean;
  category: string;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [exchangeRate] = useState(36);

  // Calculate totals
  const subtotalUSD = cart.reduce((sum, item) => sum + item.total_usd, 0);
  const subtotalVES = cart.reduce((sum, item) => sum + item.total_ves, 0);
  const ivaUSD = cart.reduce((sum, item) => sum + item.iva_usd, 0);
  const ivaVES = cart.reduce((sum, item) => sum + item.iva_ves, 0);
  const totalUSD = subtotalUSD + ivaUSD;
  const totalVES = subtotalVES + ivaVES;

  // Quick access products (OTC medicines)
  const quickAccessProducts = [
    { id: "qa1", name: "Paracetamol 500mg", icon: Pill, color: "bg-blue-500" },
    { id: "qa2", name: "Ibuprofeno 400mg", icon: Package, color: "bg-green-500" },
    { id: "qa3", name: "Vitamina C", icon: Heart, color: "bg-red-500" },
    { id: "qa4", name: "Aspirina", icon: Activity, color: "bg-purple-500" },
    { id: "qa5", name: "Omeprazol", icon: Package, color: "bg-orange-500" },
    { id: "qa6", name: "Multivitamínico", icon: Heart, color: "bg-pink-500" },
    { id: "qa7", name: "Salbutamol", icon: Activity, color: "bg-cyan-500" },
    { id: "qa8", name: "Diazepam", icon: Pill, color: "bg-yellow-500" },
  ];

  // Payment methods
  const paymentMethods = [
    { id: "cash", name: "Efectivo", icon: DollarSign, color: "bg-green-600" },
    { id: "card", name: "Tarjeta", icon: CreditCard, color: "bg-blue-600" },
    { id: "biometric", name: "Biométrico", icon: Fingerprint, color: "bg-purple-600" },
    { id: "mobile", name: "Pago Móvil", icon: QrCode, color: "bg-orange-600" },
    { id: "zelle", name: "Zelle", icon: Smartphone, color: "bg-cyan-600" },
    { id: "transfer", name: "Transferencia", icon: Smartphone, color: "bg-indigo-600" },
  ];

  // Search products
  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,generic_name.ilike.%${query}%,barcode.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(10);

      setProducts(data || []);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add product to cart
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      const totalUSD = product.sale_price_usd * quantity;
      const totalVES = product.sale_price_ves * quantity;
      const ivaUSD = totalUSD * product.iva_rate;
      const ivaVES = totalVES * product.iva_rate;

      setCart([
        ...cart,
        {
          id: `cart-${Date.now()}`,
          product_id: product.id,
          product_name: product.name,
          generic_name: product.generic_name,
          quantity,
          unit_price_usd: product.sale_price_usd,
          unit_price_ves: product.sale_price_ves,
          total_usd: totalUSD,
          total_ves: totalVES,
          iva_rate: product.iva_rate,
          iva_usd: ivaUSD,
          iva_ves: ivaVES,
          requires_prescription: product.requires_prescription,
          controlled_substance: product.controlled_substance,
        },
      ]);
    }

    setSearchQuery("");
    setProducts([]);
    setSelectedProduct(null);
  };

  // Update quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(
      cart.map((item) => {
        if (item.id === itemId) {
          const totalUSD = item.unit_price_usd * quantity;
          const totalVES = item.unit_price_ves * quantity;
          const ivaUSD = totalUSD * item.iva_rate;
          const ivaVES = totalVES * item.iva_rate;

          return {
            ...item,
            quantity,
            total_usd: totalUSD,
            total_ves: totalVES,
            iva_usd: ivaUSD,
            iva_ves: ivaVES,
          };
        }
        return item;
      })
    );
  };

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setActivePaymentMethod(null);
    setShowPaymentModal(false);
  };

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0 || !activePaymentMethod) return;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Create invoice
      const { data: invoice } = await supabase
        .from("invoices")
        .insert([
          {
            invoice_number: `INV-${Date.now()}`,
            warehouse_id: "550e8400-e29b-41d4-a716-446655440001", // Default warehouse
            user_id: "cashier-001", // Default user
            status: "paid",
            subtotal_usd: subtotalUSD,
            subtotal_ves: subtotalVES,
            iva_usd: ivaUSD,
            iva_ves: ivaVES,
            total_usd: totalUSD,
            total_ves: totalVES,
            payment_method: activePaymentMethod,
            exchange_rate: exchangeRate,
          },
        ])
        .select()
        .single();

      if (invoice) {
        // Add invoice items
        const items = cart.map((item) => ({
          invoice_id: invoice.id,
          product_id: item.product_id,
          product_name: item.product_name,
          generic_name: item.generic_name,
          quantity: item.quantity,
          unit_type: "unit",
          unit_price_usd: item.unit_price_usd,
          unit_price_ves: item.unit_price_ves,
          total_usd: item.total_usd,
          total_ves: item.total_ves,
          iva_rate: item.iva_rate,
          iva_usd: item.iva_usd,
          iva_ves: item.iva_ves,
        }));

        await supabase.from("invoice_items").insert(items);

        // Clear cart and show success
        clearCart();
        alert("Venta procesada exitosamente!");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar el pago");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        document.getElementById("product-search")?.focus();
      } else if (e.key === "F9") {
        e.preventDefault();
        if (cart.length > 0) {
          setShowPaymentModal(true);
        }
      } else if (e.key === "F12") {
        e.preventDefault();
        clearCart();
      } else if (e.key === "Escape") {
        setShowPaymentModal(false);
        setActivePaymentMethod(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [cart]);

  // Search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Menu className="h-6 w-6 text-slate-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800">Punto de Venta</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  {new Date().toLocaleTimeString("es-VE")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Tasa BCV</div>
                <div className="font-bold text-slate-800">Bs. {exchangeRate.toFixed(2)}</div>
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Product Selection */}
          <div className="col-span-8 flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-slate-200 px-4 py-3">
                <Search className="h-6 w-6 text-slate-400" />
                <input
                  id="product-search"
                  type="text"
                  placeholder="Buscar producto (F1) o escanear código de barras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <Barcode className="h-6 w-6 text-blue-600" />
                </button>
              </div>

              {/* Product Search Results */}
              {products.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <div className="font-medium text-slate-800">{product.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-sm text-slate-500">{product.generic_name}</div>
                        <div className="font-bold text-green-600">
                          ${product.sale_price_usd.toFixed(2)} / Bs. {product.sale_price_ves.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Access Products */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Acceso Rápido - Medicamentos de Venta Libre
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {quickAccessProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      // Add to cart with default quantity
                      addToCart({
                        id: product.id,
                        sku: "QA001",
                        barcode: "",
                        name: product.name,
                        generic_name: "",
                        sale_price_usd: 0.50,
                        sale_price_ves: 25.00,
                        iva_rate: 0.16,
                        requires_prescription: false,
                        controlled_substance: false,
                        category: "analgesic",
                      });
                    }}
                    className={cn(
                      "aspect-square rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-2 group",
                      product.color
                    )}
                  >
                    <product.icon className="h-10 w-10 text-white" />
                    <div className="text-white font-semibold text-center text-sm px-2">
                      {product.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Barcode Scanner Modal */}
            {showScanner && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Escanear Código de Barras</h3>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="bg-slate-100 rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Barcode className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">
                      Coloca el código de barras frente al escáner
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Cart */}
          <div className="col-span-4 flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <ShoppingCart className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Ticket de Venta</h2>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShoppingCart className="h-16 w-16 mb-4" />
                  <p>El carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all",
                        item.controlled_substance
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-slate-50 border-slate-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 text-sm">
                            {item.product_name}
                          </div>
                          {item.generic_name && (
                            <div className="text-xs text-slate-500">{item.generic_name}</div>
                          )}
                          {item.requires_prescription && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>Requiere receta</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <div className="w-8 text-center font-semibold">{item.quantity}</div>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ${item.total_usd.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Bs. {item.total_ves.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            <div className="border-t border-slate-200 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <div className="text-right">
                  <div>${subtotalUSD.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Bs. {subtotalVES.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">IVA (16%)</span>
                <div className="text-right">
                  <div>${ivaUSD.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Bs. {ivaVES.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-800">Total a Pagar</span>
                <div className="text-right">
                  <div className="text-green-600">${totalUSD.toFixed(2)}</div>
                  <div className="text-sm text-slate-500">Bs. {totalVES.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setActivePaymentMethod(method.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                    activePaymentMethod === method.id
                      ? `${method.color} text-white shadow-lg scale-105`
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  )}
                >
                  <method.icon className="h-8 w-8" />
                  <span className="text-xs font-medium">{method.name}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={clearCart}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
              >
                Limpiar (F12)
              </button>
              <button
                onClick={() => cart.length > 0 && setShowPaymentModal(true)}
                disabled={cart.length === 0}
                className={cn(
                  "px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2",
                  cart.length > 0
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                Cobrar (F9)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center justify-between text-white">
                <h2 className="text-2xl font-bold">Procesar Pago</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  ${totalUSD.toFixed(2)}
                </div>
                <div className="text-xl text-slate-500">Bs. {totalVES.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setActivePaymentMethod(method.id)}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                      activePaymentMethod === method.id
                        ? `${method.color} border-transparent text-white shadow-lg`
                        : "bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-600"
                    )}
                  >
                    <method.icon className="h-10 w-10" />
                    <span className="font-semibold">{method.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={processPayment}
                  disabled={!activePaymentMethod}
                  className={cn(
                    "flex-1 px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2",
                    activePaymentMethod
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  )}
                >
                  <CheckCircle className="h-5 w-5" />
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
