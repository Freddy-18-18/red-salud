"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Receipt,
  X,
  Package,
  Pause,
  Play,
  Keyboard,
  Percent,
  AlertTriangle,
  CheckCircle,
  Printer,
  RotateCcw,
  Banknote,
  CreditCard,
  Smartphone,
  ArrowRightLeft,
  CircleDollarSign,
  Lock,
  Unlock,
  User,
  Phone,
  Hash,
  Building,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Separator } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";

import {
  searchProducts,
  selectFEFOBatch,
  createInvoice,
  type ProductSearchResult,
  type CartItem,
  type PaymentMethod,
  type PaymentSplit,
  type InvoiceWithItems,
} from "@/lib/services/pos-service";
import {
  getCurrentSession,
  openSession,
  closeSession,
  type CashSession,
} from "@/lib/services/cash-session-service";
import {
  getLatestExchangeRateClient,
  formatUsd,
  formatBs,
  type ExchangeRate,
} from "@/lib/services/exchange-rate-client";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ───────────────────────────────────────────────────────

const PAYMENT_METHODS: {
  value: Exclude<PaymentMethod, "mixed">;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "cash_bs", label: "Efectivo Bs", icon: <Banknote className="h-4 w-4" /> },
  { value: "cash_usd", label: "Efectivo USD", icon: <DollarSign className="h-4 w-4" /> },
  { value: "pago_movil", label: "Pago Movil", icon: <Smartphone className="h-4 w-4" /> },
  { value: "zelle", label: "Zelle", icon: <CircleDollarSign className="h-4 w-4" /> },
  { value: "punto_venta", label: "Punto Venta", icon: <CreditCard className="h-4 w-4" /> },
  { value: "transferencia", label: "Transferencia", icon: <ArrowRightLeft className="h-4 w-4" /> },
];

const CATEGORIES = [
  "Analgesicos",
  "Antibioticos",
  "Antiinflamatorios",
  "Antialergicos",
  "Cardiovascular",
  "Dermatologicos",
  "Gastrointestinal",
  "Vitaminas",
  "OTC",
  "Higiene",
];

interface HeldCart {
  id: string;
  items: CartItem[];
  customerName?: string;
  timestamp: string;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Component ───────────────────────────────────────────────────────

export default function CajaPage() {
  // Auth & Context
  const [pharmacyId, setPharmacyId] = useState("");
  const [cashierId, setCashierId] = useState("");
  const [loading, setLoading] = useState(true);

  // Exchange Rate
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const rate = exchangeRate?.rate ?? 36;

  // Cash Session
  const [session, setSession] = useState<CashSession | null>(null);
  const [showOpenSession, setShowOpenSession] = useState(false);
  const [showCloseSession, setShowCloseSession] = useState(false);
  const [openingBs, setOpeningBs] = useState("0");
  const [openingUsd, setOpeningUsd] = useState("0");
  const [closingBs, setClosingBs] = useState("0");
  const [closingUsd, setClosingUsd] = useState("0");
  const [closeNotes, setCloseNotes] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);

  // Product Search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [showHeldCarts, setShowHeldCarts] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_bs");
  const [paymentRef, setPaymentRef] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [mixedSplits, setMixedSplits] = useState<PaymentSplit[]>([]);
  const [showMixedModal, setShowMixedModal] = useState(false);

  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerCI, setCustomerCI] = useState("");
  const [customerRIF, setCustomerRIF] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);

  // Processing
  const [processing, setProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<InvoiceWithItems | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountItemId, setDiscountItemId] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState("");

  // ─── Cart Calculations ──────────────────────────────────────────
  const cartTotals = useMemo(() => {
    const subtotalUsd = cart.reduce((sum, item) => {
      const itemSubtotal = item.unit_price_usd * item.quantity;
      const discount = itemSubtotal * (item.discount_percent / 100);
      return sum + (itemSubtotal - discount);
    }, 0);

    const discountUsd = cart.reduce(
      (sum, item) =>
        sum + item.unit_price_usd * item.quantity * (item.discount_percent / 100),
      0,
    );

    const taxUsd = cart.reduce((sum, item) => {
      const itemSubtotal = item.unit_price_usd * item.quantity;
      const discounted = itemSubtotal * (1 - item.discount_percent / 100);
      return sum + discounted * (item.product.tax_rate || 0);
    }, 0);

    const totalUsd = subtotalUsd + taxUsd;
    const totalBs = totalUsd * rate;

    return { subtotalUsd, discountUsd, taxUsd, totalUsd, totalBs };
  }, [cart, rate]);

  // Cash change
  const cashChange = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    if (paymentMethod === "cash_usd") return received - cartTotals.totalUsd;
    if (paymentMethod === "cash_bs") return received - cartTotals.totalBs;
    return 0;
  }, [cashReceived, paymentMethod, cartTotals]);

  // Mixed total
  const mixedTotal = mixedSplits.reduce((sum, s) => sum + s.amount_usd, 0);
  const mixedRemaining = cartTotals.totalUsd - mixedTotal;

  // ─── Initialize ─────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;
        setCashierId(user.id);

        // Check pharmacy_staff first (employee), then pharmacy_details (owner)
        const { data: staff } = await supabase
          .from("pharmacy_staff")
          .select("pharmacy_id")
          .eq("profile_id", user.id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        let phId = staff?.pharmacy_id ?? null;

        if (!phId) {
          const { data: owned } = await supabase
            .from("pharmacy_details")
            .select("id")
            .eq("profile_id", user.id)
            .limit(1)
            .maybeSingle();
          phId = owned?.id ?? null;
        }

        if (phId) {
          setPharmacyId(phId);
          const [exRate, sess] = await Promise.all([
            getLatestExchangeRateClient(),
            getCurrentSession(phId, user.id),
          ]);
          setExchangeRate(exRate);
          setSession(sess);
        }
        loadHeldCarts();
      } catch (err) {
        console.error("Error initializing POS:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Keyboard Shortcuts ─────────────────────────────────────────
  const processPaymentRef = useRef<() => void>();
  const holdCartRef = useRef<() => void>();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";

      switch (e.key) {
        case "F1":
          e.preventDefault();
          newSale();
          break;
        case "F2":
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case "F4":
          e.preventDefault();
          holdCartRef.current?.();
          break;
        case "F5":
          e.preventDefault();
          setShowHeldCarts(true);
          break;
        case "F9":
          e.preventDefault();
          setShowDiscountModal(true);
          break;
        case "F10":
          e.preventDefault();
          processPaymentRef.current?.();
          break;
        case "F12":
          e.preventDefault();
          setShowReceipt(true);
          break;
        case "Escape":
          if (!isInput) {
            e.preventDefault();
            setShowSearchDropdown(false);
            setShowReceipt(false);
            setShowShortcuts(false);
            setShowHeldCarts(false);
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ─── Click Outside Search Dropdown ──────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Product Search (debounced) ─────────────────────────────────
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!searchTerm.trim() || !pharmacyId) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchProducts(pharmacyId, searchTerm, 15);
      setSearchResults(results);
      setShowSearchDropdown(true);
      setSearching(false);
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm, pharmacyId]);

  // ─── Held Carts ─────────────────────────────────────────────────
  const loadHeldCarts = useCallback(() => {
    const held: HeldCart[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("pos_hold_")) {
        try {
          const val = localStorage.getItem(key);
          if (val) held.push(JSON.parse(val));
        } catch { /* skip */ }
      }
    }
    held.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setHeldCarts(held);
  }, []);

  // ─── Cart Actions ───────────────────────────────────────────────
  const addToCart = useCallback(
    async (product: ProductSearchResult) => {
      if (product.requires_prescription) {
        if (!window.confirm(`"${product.name}" requiere receta medica. ¿Desea continuar?`))
          return;
      }

      if (product.stock_available <= 0) {
        window.alert("Sin stock disponible para este producto.");
        return;
      }

      const existingIdx = cart.findIndex((c) => c.product.id === product.id);
      if (existingIdx >= 0) {
        const existing = cart[existingIdx];
        const newQty = existing.quantity + 1;
        if (newQty > product.stock_available) {
          window.alert(`Stock insuficiente. Disponible: ${product.stock_available}`);
          return;
        }
        const batch = await selectFEFOBatch(product.id, pharmacyId, newQty);
        if (!batch) {
          window.alert("No hay lote disponible con suficiente stock.");
          return;
        }
        setCart((prev) =>
          prev.map((item, idx) =>
            idx === existingIdx
              ? {
                  ...item,
                  quantity: newQty,
                  batch_id: batch.id,
                  batch_number: batch.batch_number,
                  expiry_date: batch.expiry_date,
                  subtotal_usd: item.unit_price_usd * newQty,
                  subtotal_bs: item.unit_price_bs * newQty,
                }
              : item,
          ),
        );
      } else {
        const batch = await selectFEFOBatch(product.id, pharmacyId, 1);
        if (!batch) {
          window.alert("No hay lote disponible para este producto.");
          return;
        }
        const newItem: CartItem = {
          product,
          quantity: 1,
          batch_id: batch.id,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          unit_price_usd: product.price_usd,
          unit_price_bs: product.price_usd * rate,
          discount_percent: 0,
          subtotal_usd: product.price_usd,
          subtotal_bs: product.price_usd * rate,
          is_prescription_item: product.requires_prescription,
        };
        setCart((prev) => [...prev, newItem]);
      }

      setSearchTerm("");
      setShowSearchDropdown(false);
    },
    [cart, pharmacyId, rate],
  );

  const updateQuantity = useCallback(
    async (productId: string, newQty: number) => {
      if (newQty <= 0) {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        return;
      }
      const batch = await selectFEFOBatch(productId, pharmacyId, newQty);
      if (!batch) {
        window.alert("Stock insuficiente para esta cantidad.");
        return;
      }
      setCart((prev) =>
        prev.map((c) =>
          c.product.id === productId
            ? {
                ...c,
                quantity: newQty,
                batch_id: batch.id,
                batch_number: batch.batch_number,
                expiry_date: batch.expiry_date,
                subtotal_usd: c.unit_price_usd * newQty,
                subtotal_bs: c.unit_price_bs * newQty,
              }
            : c,
        ),
      );
    },
    [pharmacyId],
  );

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((item) => item.product.id !== productId));

  const applyDiscount = (productId: string, percent: number) => {
    const clamped = Math.max(0, Math.min(100, percent));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, discount_percent: clamped } : item,
      ),
    );
  };

  const newSale = () => {
    setCart([]);
    setCustomerName("");
    setCustomerCI("");
    setCustomerRIF("");
    setCustomerPhone("");
    setPaymentMethod("cash_bs");
    setPaymentRef("");
    setCashReceived("");
    setMixedSplits([]);
    setShowCustomerPanel(false);
    setLastInvoice(null);
    searchInputRef.current?.focus();
  };

  const holdCart = useCallback(() => {
    if (cart.length === 0) return;
    const holdId = `pos_hold_${Date.now()}`;
    const held: HeldCart = {
      id: holdId,
      items: cart,
      customerName: customerName || undefined,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(holdId, JSON.stringify(held));
    setCart([]);
    setCustomerName("");
    loadHeldCarts();
  }, [cart, customerName, loadHeldCarts]);
  holdCartRef.current = holdCart;

  const retrieveHeldCart = (holdId: string) => {
    const val = localStorage.getItem(holdId);
    if (val) {
      const held: HeldCart = JSON.parse(val);
      setCart(held.items);
      if (held.customerName) setCustomerName(held.customerName);
      localStorage.removeItem(holdId);
      loadHeldCarts();
      setShowHeldCarts(false);
    }
  };

  const deleteHeldCart = (holdId: string) => {
    localStorage.removeItem(holdId);
    loadHeldCarts();
  };

  // ─── Payment Processing ─────────────────────────────────────────
  const processPayment = useCallback(async () => {
    if (cart.length === 0 || !session) return;

    if (paymentMethod === "cash_bs" || paymentMethod === "cash_usd") {
      const received = parseFloat(cashReceived) || 0;
      const needed = paymentMethod === "cash_usd" ? cartTotals.totalUsd : cartTotals.totalBs;
      if (received < needed) {
        window.alert("Monto recibido insuficiente.");
        return;
      }
    }

    if (
      ["zelle", "pago_movil", "punto_venta", "transferencia"].includes(paymentMethod) &&
      !paymentRef.trim()
    ) {
      window.alert("Ingrese el numero de referencia.");
      return;
    }

    if (paymentMethod === "mixed" && Math.abs(mixedRemaining) > 0.01) {
      window.alert("El monto del pago mixto no coincide con el total.");
      return;
    }

    setProcessing(true);
    try {
      const invoice = await createInvoice({
        pharmacy_id: pharmacyId,
        customer_name: customerName || undefined,
        customer_ci: customerCI || undefined,
        customer_rif: customerRIF || undefined,
        customer_phone: customerPhone || undefined,
        items: cart,
        subtotal_usd: cartTotals.subtotalUsd,
        discount_usd: cartTotals.discountUsd,
        tax_usd: cartTotals.taxUsd,
        total_usd: cartTotals.totalUsd,
        exchange_rate: rate,
        total_bs: cartTotals.totalBs,
        payment_method: paymentMethod,
        payment_reference: paymentRef || undefined,
        payment_details: paymentMethod === "mixed" ? mixedSplits : undefined,
        cashier_id: cashierId,
        is_fiscal: false,
        cash_session_id: session.id,
      });

      setLastInvoice(invoice);
      setShowReceipt(true);
      setCart([]);
      setCustomerName("");
      setCustomerCI("");
      setCustomerRIF("");
      setCustomerPhone("");
      setPaymentRef("");
      setCashReceived("");
      setMixedSplits([]);
    } catch (err) {
      window.alert(
        `Error al procesar venta: ${err instanceof Error ? err.message : "Error desconocido"}`,
      );
    } finally {
      setProcessing(false);
    }
  }, [
    cart, session, paymentMethod, cashReceived, paymentRef, pharmacyId,
    customerName, customerCI, customerRIF, customerPhone,
    cartTotals, rate, mixedSplits, cashierId, mixedRemaining,
  ]);
  processPaymentRef.current = processPayment;

  // ─── Session Actions ────────────────────────────────────────────
  const handleOpenSession = async () => {
    setSessionLoading(true);
    try {
      const sess = await openSession({
        pharmacy_id: pharmacyId,
        cashier_id: cashierId,
        opening_balance_bs: parseFloat(openingBs) || 0,
        opening_balance_usd: parseFloat(openingUsd) || 0,
      });
      setSession(sess);
      setShowOpenSession(false);
      setOpeningBs("0");
      setOpeningUsd("0");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al abrir sesion");
    } finally {
      setSessionLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    setSessionLoading(true);
    try {
      const closed = await closeSession({
        session_id: session.id,
        closing_balance_bs: parseFloat(closingBs) || 0,
        closing_balance_usd: parseFloat(closingUsd) || 0,
        notes: closeNotes || undefined,
      });
      setSession(null);
      setShowCloseSession(false);
      setClosingBs("0");
      setClosingUsd("0");
      setCloseNotes("");
      window.alert(
        `Sesion cerrada.\n\nVentas: ${closed.total_sales_count}\nEsperado USD: ${formatUsd(closed.expected_usd || 0)}\nContado USD: ${formatUsd(closed.closing_balance_usd || 0)}\nDiferencia USD: ${formatUsd(closed.difference_usd || 0)}\n\nEsperado Bs: ${formatBs(closed.expected_bs || 0)}\nContado Bs: ${formatBs(closed.closing_balance_bs || 0)}\nDiferencia Bs: ${formatBs(closed.difference_bs || 0)}`,
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al cerrar sesion");
    } finally {
      setSessionLoading(false);
    }
  };

  // ─── Mixed Payment ──────────────────────────────────────────────
  const addMixedSplit = () =>
    setMixedSplits((prev) => [...prev, { method: "cash_bs", amount_usd: 0, amount_bs: 0 }]);

  const updateMixedSplit = (index: number, field: keyof PaymentSplit, value: string | number) =>
    setMixedSplits((prev) =>
      prev.map((split, i) => {
        if (i !== index) return split;
        if (field === "method") return { ...split, method: value as Exclude<PaymentMethod, "mixed"> };
        if (field === "amount_usd") {
          const usd = parseFloat(value as string) || 0;
          return { ...split, amount_usd: usd, amount_bs: usd * rate };
        }
        if (field === "reference") return { ...split, reference: value as string };
        return split;
      }),
    );

  const removeMixedSplit = (index: number) =>
    setMixedSplits((prev) => prev.filter((_, i) => i !== index));

  // ─── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando punto de venta...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Caja POS
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowRightLeft className="h-3 w-3" />
                    Tasa BCV: {formatBs(rate)}/$1
                    {exchangeRate?.source !== "fallback" && exchangeRate?.validDate && (
                      <span className="text-xs">
                        ({new Date(exchangeRate.validDate).toLocaleDateString("es-VE")})
                      </span>
                    )}
                    {exchangeRate?.source === "fallback" && (
                      <Badge variant="outline" className="text-[10px] ml-1 text-yellow-600 border-yellow-600">
                        Referencial
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCloseSession(true)}
                  className="text-green-600 border-green-600"
                >
                  <Unlock className="h-4 w-4 mr-1" />
                  Caja Abierta
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOpenSession(true)}
                  className="text-red-600 border-red-600"
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Abrir Caja
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(true)} title="Atajos de teclado">
                <Keyboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── No Session Warning ──────────────────────────────────── */}
      {!session && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
          <div className="container mx-auto flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Debe abrir una sesion de caja antes de procesar ventas.</p>
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => setShowOpenSession(true)}>
              Abrir Caja
            </Button>
          </div>
        </div>
      )}

      {/* ── Main Layout: 60/40 Split ───────────────────────────── */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* LEFT: Products + Cart (3/5 = 60%) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search Bar */}
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar producto por nombre, codigo de barras o codigo interno... (F2)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  </div>
                )}
              </div>

              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute z-40 w-full mt-1 bg-card border rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b last:border-b-0 transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{product.name}</span>
                            {product.requires_prescription && (
                              <Badge variant="destructive" className="text-[10px] shrink-0">Rx</Badge>
                            )}
                            {product.is_controlled && (
                              <Badge variant="outline" className="text-[10px] text-red-600 border-red-600 shrink-0">
                                Controlado
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            {product.generic_name && <span>{product.generic_name}</span>}
                            {product.presentation && <span>- {product.presentation}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <div className="font-bold text-green-600">{formatUsd(product.price_usd)}</div>
                          <div className="text-xs text-muted-foreground">
                            Stock: {product.stock_available}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showSearchDropdown && searchTerm && searchResults.length === 0 && !searching && (
                <div className="absolute z-40 w-full mt-1 bg-card border rounded-lg shadow-xl p-6 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </div>
              )}
            </div>

            {/* Quick Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="shrink-0"
              >
                Todos
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className="shrink-0"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Cart Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrito ({cart.length} {cart.length === 1 ? "item" : "items"})
                  </span>
                  {cart.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Carrito vacio</p>
                    <p className="text-sm mt-1">Busque un producto o use F2 para enfocar la busqueda</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2 pb-1 border-b">
                      <div className="col-span-4">Producto</div>
                      <div className="col-span-2 text-center">Lote / Venc.</div>
                      <div className="col-span-2 text-center">Cantidad</div>
                      <div className="col-span-1 text-center">Desc.</div>
                      <div className="col-span-2 text-right">Subtotal</div>
                      <div className="col-span-1" />
                    </div>

                    {cart.map((item) => {
                      const itemGross = item.unit_price_usd * item.quantity;
                      const itemDiscount = itemGross * (item.discount_percent / 100);
                      const itemNet = itemGross - itemDiscount;

                      return (
                        <div
                          key={item.product.id}
                          className="grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="col-span-4 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.product.presentation} &middot; {formatUsd(item.unit_price_usd)}/u
                            </p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="text-xs font-mono">{item.batch_number}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Venc: {new Date(item.expiry_date).toLocaleDateString("es-VE")}
                            </p>
                          </div>

                          <div className="col-span-2 flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.product.id, parseInt(e.target.value) || 1)
                              }
                              className="w-10 h-7 text-center text-sm border rounded-md bg-background"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="col-span-1 text-center">
                            <button
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded border transition-colors",
                                item.discount_percent > 0
                                  ? "bg-green-50 border-green-300 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300"
                                  : "border-dashed text-muted-foreground hover:border-primary",
                              )}
                              onClick={() => {
                                setDiscountItemId(item.product.id);
                                setDiscountValue(String(item.discount_percent));
                                setShowDiscountModal(true);
                              }}
                            >
                              {item.discount_percent > 0
                                ? `${item.discount_percent}%`
                                : <Percent className="h-3 w-3 inline" />}
                            </button>
                          </div>

                          <div className="col-span-2 text-right">
                            <p className="font-medium text-sm">{formatUsd(itemNet)}</p>
                            <p className="text-[10px] text-muted-foreground">{formatBs(itemNet * rate)}</p>
                          </div>

                          <div className="col-span-1 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <Separator className="my-3" />
                    <div className="space-y-1.5 px-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">
                          {formatUsd(cartTotals.subtotalUsd + cartTotals.discountUsd)}
                        </span>
                      </div>
                      {cartTotals.discountUsd > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Descuento:</span>
                          <span>-{formatUsd(cartTotals.discountUsd)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">IVA:</span>
                        <span>{formatUsd(cartTotals.taxUsd)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <div className="text-right">
                          <div className="text-green-600">{formatUsd(cartTotals.totalUsd)}</div>
                          <div className="text-sm font-normal text-muted-foreground">
                            {formatBs(cartTotals.totalBs)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Payment Panel (2/5 = 40%) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2"><User className="h-4 w-4" />Cliente</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowCustomerPanel(!showCustomerPanel)}>
                    {showCustomerPanel ? "Ocultar" : "Agregar"}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showCustomerPanel && (
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><User className="h-3 w-3" /> Nombre</Label>
                    <Input placeholder="Nombre del cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-9" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Hash className="h-3 w-3" /> C.I.</Label>
                      <Input placeholder="V-12345678" value={customerCI} onChange={(e) => setCustomerCI(e.target.value)} className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Building className="h-3 w-3" /> RIF</Label>
                      <Input placeholder="J-12345678-9" value={customerRIF} onChange={(e) => setCustomerRIF(e.target.value)} className="h-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Telefono</Label>
                    <Input placeholder="0412-1234567" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="h-9" />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Metodo de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <Button
                      key={pm.value}
                      variant={paymentMethod === pm.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setPaymentMethod(pm.value); setCashReceived(""); setPaymentRef(""); }}
                      className="flex flex-col items-center gap-1 h-auto py-2"
                    >
                      {pm.icon}
                      <span className="text-[10px] leading-tight">{pm.label}</span>
                    </Button>
                  ))}
                  <Button
                    variant={paymentMethod === "mixed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setPaymentMethod("mixed"); setShowMixedModal(true); }}
                    className="flex flex-col items-center gap-1 h-auto py-2"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    <span className="text-[10px] leading-tight">Mixto</span>
                  </Button>
                </div>

                {/* Cash: Change Calculation */}
                {(paymentMethod === "cash_bs" || paymentMethod === "cash_usd") && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">Monto recibido ({paymentMethod === "cash_usd" ? "USD" : "Bs"})</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="h-12 text-lg font-mono"
                    />
                    {cashReceived && (
                      <div className={cn(
                        "p-3 rounded-lg text-center",
                        cashChange >= 0
                          ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800"
                          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
                      )}>
                        <p className="text-xs text-muted-foreground mb-1">Cambio</p>
                        <p className="text-xl font-bold">
                          {paymentMethod === "cash_usd"
                            ? formatUsd(Math.max(0, cashChange))
                            : formatBs(Math.max(0, cashChange))}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reference for electronic methods */}
                {["zelle", "pago_movil", "punto_venta", "transferencia"].includes(paymentMethod) && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">Numero de Referencia</Label>
                    <Input placeholder="Ingrese referencia..." value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} className="h-10 font-mono" />
                  </div>
                )}

                {/* Mixed summary */}
                {paymentMethod === "mixed" && mixedSplits.length > 0 && (
                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Pago dividido:</p>
                    {mixedSplits.map((split, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>{PAYMENT_METHODS.find((p) => p.value === split.method)?.label || split.method}</span>
                        <span>{formatUsd(split.amount_usd)}</span>
                      </div>
                    ))}
                    {Math.abs(mixedRemaining) > 0.01 && (
                      <div className="text-xs text-yellow-600 flex items-center gap-1 pt-1">
                        <AlertTriangle className="h-3 w-3" />
                        Restante: {formatUsd(mixedRemaining)}
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => setShowMixedModal(true)}>
                      Editar Pago Mixto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full h-14 text-lg"
                onClick={processPayment}
                disabled={processing || cart.length === 0 || !session || (paymentMethod === "mixed" && Math.abs(mixedRemaining) > 0.01)}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Receipt className="h-5 w-5 mr-2" />
                    Cobrar {cart.length > 0 ? formatUsd(cartTotals.totalUsd) : ""} (F10)
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={holdCart} disabled={cart.length === 0} className="h-10">
                  <Pause className="h-4 w-4 mr-1" />
                  Apartar (F4)
                </Button>
                <Button variant="outline" onClick={() => setShowHeldCarts(true)} disabled={heldCarts.length === 0} className="h-10">
                  <Play className="h-4 w-4 mr-1" />
                  Recuperar (F5)
                  {heldCarts.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-[10px]">{heldCarts.length}</Badge>
                  )}
                </Button>
              </div>

              <Button variant="outline" className="w-full" onClick={newSale}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Nueva Venta (F1)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIALOGS ─────────────────────────────────────────────── */}

      {/* Open Session */}
      <Dialog open={showOpenSession} onOpenChange={setShowOpenSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Sesion de Caja</DialogTitle>
            <DialogDescription>Ingrese el saldo inicial de la caja para comenzar a vender.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Saldo inicial (Bs)</Label>
              <Input type="number" step="0.01" min="0" value={openingBs} onChange={(e) => setOpeningBs(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Saldo inicial (USD)</Label>
              <Input type="number" step="0.01" min="0" value={openingUsd} onChange={(e) => setOpeningUsd(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenSession(false)}>Cancelar</Button>
            <Button onClick={handleOpenSession} disabled={sessionLoading}>
              {sessionLoading ? "Abriendo..." : "Abrir Caja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Session */}
      <Dialog open={showCloseSession} onOpenChange={setShowCloseSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Sesion de Caja</DialogTitle>
            <DialogDescription>Cuente el efectivo en caja e ingrese los montos finales.</DialogDescription>
          </DialogHeader>
          {session && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Apertura Bs</p>
                  <p className="font-medium">{formatBs(session.opening_balance_bs)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Apertura USD</p>
                  <p className="font-medium">{formatUsd(session.opening_balance_usd)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Abierta</p>
                  <p className="font-medium">{fmtDate(session.opened_at)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Saldo final (Bs)</Label>
                <Input type="number" step="0.01" min="0" value={closingBs} onChange={(e) => setClosingBs(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Saldo final (USD)</Label>
                <Input type="number" step="0.01" min="0" value={closingUsd} onChange={(e) => setClosingUsd(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Input value={closeNotes} onChange={(e) => setCloseNotes(e.target.value)} placeholder="Observaciones..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseSession(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleCloseSession} disabled={sessionLoading}>
              {sessionLoading ? "Cerrando..." : "Cerrar Caja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Held Carts */}
      <Dialog open={showHeldCarts} onOpenChange={setShowHeldCarts}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Carritos en Espera</DialogTitle>
            <DialogDescription>Seleccione un carrito para recuperarlo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {heldCarts.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No hay carritos en espera</p>
            ) : (
              heldCarts.map((held) => {
                const total = held.items.reduce((sum, item) => sum + item.unit_price_usd * item.quantity, 0);
                return (
                  <div key={held.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {held.items.length} {held.items.length === 1 ? "producto" : "productos"}
                        {held.customerName && ` - ${held.customerName}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{fmtDate(held.timestamp)} &middot; {formatUsd(total)}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" onClick={() => retrieveHeldCart(held.id)}>
                        <Play className="h-3 w-3 mr-1" />Recuperar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteHeldCart(held.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Discount */}
      <Dialog open={showDiscountModal} onOpenChange={setShowDiscountModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Aplicar Descuento</DialogTitle>
            <DialogDescription>
              {discountItemId
                ? `Descuento para: ${cart.find((c) => c.product.id === discountItemId)?.product.name || "item"}`
                : "Seleccione un item primero"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descuento (%)</Label>
              <div className="relative">
                <Input
                  type="number" min="0" max="100" step="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="pr-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && discountItemId) {
                      applyDiscount(discountItemId, parseFloat(discountValue) || 0);
                      setShowDiscountModal(false);
                    }
                  }}
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 25, 50].map((pct) => (
                <Button key={pct} variant="outline" size="sm" onClick={() => setDiscountValue(String(pct))} className="flex-1">
                  {pct}%
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscountModal(false)}>Cancelar</Button>
            <Button onClick={() => { if (discountItemId) applyDiscount(discountItemId, parseFloat(discountValue) || 0); setShowDiscountModal(false); }}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mixed Payment */}
      <Dialog open={showMixedModal} onOpenChange={setShowMixedModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pago Mixto</DialogTitle>
            <DialogDescription>Divida el pago en multiples metodos. Total: {formatUsd(cartTotals.totalUsd)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {mixedSplits.map((split, i) => (
              <div key={i} className="flex items-end gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Metodo</Label>
                  <select
                    value={split.method}
                    onChange={(e) => updateMixedSplit(i, "method", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.value} value={pm.value}>{pm.label}</option>
                    ))}
                  </select>
                </div>
                <div className="w-28 space-y-1.5">
                  <Label className="text-xs">Monto USD</Label>
                  <Input type="number" step="0.01" min="0" value={split.amount_usd || ""} onChange={(e) => updateMixedSplit(i, "amount_usd", e.target.value)} className="h-9" />
                </div>
                {["zelle", "pago_movil", "punto_venta", "transferencia"].includes(split.method) && (
                  <div className="w-28 space-y-1.5">
                    <Label className="text-xs">Ref.</Label>
                    <Input value={split.reference || ""} onChange={(e) => updateMixedSplit(i, "reference", e.target.value)} className="h-9" placeholder="Ref..." />
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={() => removeMixedSplit(i)} className="h-9 w-9 p-0 shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={addMixedSplit}>
              <Plus className="h-4 w-4 mr-1" />Agregar Metodo
            </Button>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t">
            <span>Total asignado:</span>
            <span className={cn(Math.abs(mixedRemaining) < 0.01 ? "text-green-600" : "text-yellow-600")}>
              {formatUsd(mixedTotal)} / {formatUsd(cartTotals.totalUsd)}
            </span>
          </div>
          {Math.abs(mixedRemaining) > 0.01 && (
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />Restante: {formatUsd(mixedRemaining)}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMixedModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />Venta Procesada
            </DialogTitle>
          </DialogHeader>
          {lastInvoice && (
            <div className="space-y-4" id="receipt-content">
              <div className="text-center border-b pb-3">
                <p className="font-bold text-lg">{lastInvoice.invoice_number}</p>
                <p className="text-sm text-muted-foreground">{fmtDate(lastInvoice.created_at)}</p>
              </div>

              {lastInvoice.customer_name && (
                <div className="text-sm">
                  <p><span className="text-muted-foreground">Cliente:</span> {lastInvoice.customer_name}</p>
                  {lastInvoice.customer_ci && <p><span className="text-muted-foreground">C.I.:</span> {lastInvoice.customer_ci}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                {lastInvoice.pharmacy_invoice_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1 truncate">{item.pharmacy_products?.name || "Producto"} x{item.quantity}</span>
                    <span className="font-medium ml-2">{formatUsd(Number(item.subtotal_usd))}</span>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatUsd(Number(lastInvoice.subtotal_usd))}</span>
                </div>
                {Number(lastInvoice.discount_usd) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>-{formatUsd(Number(lastInvoice.discount_usd))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA:</span>
                  <span>{formatUsd(Number(lastInvoice.tax_usd))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-1 border-t">
                  <span>Total:</span>
                  <div className="text-right">
                    <div className="text-green-600">{formatUsd(Number(lastInvoice.total_usd))}</div>
                    <div className="text-sm font-normal text-muted-foreground">{formatBs(Number(lastInvoice.total_bs))}</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-center text-muted-foreground pt-2 border-t">
                <p>Metodo: {PAYMENT_METHODS.find((p) => p.value === lastInvoice.payment_method)?.label || lastInvoice.payment_method}</p>
                {lastInvoice.payment_reference && <p>Ref: {lastInvoice.payment_reference}</p>}
                <p>Tasa: {formatBs(Number(lastInvoice.exchange_rate_used))}/$1</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" />Imprimir
            </Button>
            <Button onClick={() => { setShowReceipt(false); newSale(); }}>Nueva Venta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />Atajos de Teclado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { key: "F1", desc: "Nueva venta" },
              { key: "F2", desc: "Buscar producto" },
              { key: "F4", desc: "Apartar carrito" },
              { key: "F5", desc: "Recuperar carrito" },
              { key: "F9", desc: "Aplicar descuento" },
              { key: "F10", desc: "Cobrar / Procesar pago" },
              { key: "F12", desc: "Ver ultimo recibo" },
              { key: "ESC", desc: "Cerrar dialogos" },
            ].map(({ key, desc }) => (
              <div key={key} className="flex items-center justify-between py-1.5">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono font-bold">{key}</kbd>
                <span className="text-sm text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
