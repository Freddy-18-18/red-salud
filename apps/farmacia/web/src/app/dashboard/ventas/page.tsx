"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Download,
  Calendar,
  DollarSign,
  Receipt,
  Eye,
  Printer,
  XCircle,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRightLeft,
  Wallet,
  ChevronLeft,
  Layers,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@red-salud/design-system";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@red-salud/design-system";
import { getCurrentPharmacyId } from "@/lib/services/settings-service";
import {
  getSalesHistory,
  getSalesSummary,
  getInvoiceDetail,
  type SalesFilters,
  type SalesSummary,
  type PaginatedSales,
} from "@/lib/services/sales-service";
import { voidInvoice } from "@/lib/services/pos-service";
import type {
  Invoice,
  InvoiceWithItems,
  InvoiceItem,
  PaymentMethod,
  InvoiceStatus,
} from "@/lib/services/pos-service";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateVE(dateStr: string | null | undefined): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTimeVE(dateStr: string | null | undefined): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatUSD(amount: number | null | undefined): string {
  if (amount == null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatBs(amount: number | null | undefined): string {
  if (amount == null) return "Bs. 0,00";
  return `Bs. ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

// ---------------------------------------------------------------------------
// Payment Method Config
// ---------------------------------------------------------------------------

const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; color: string; icon: typeof DollarSign }
> = {
  cash_bs: {
    label: "Efectivo Bs",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: Banknote,
  },
  cash_usd: {
    label: "Efectivo USD",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: DollarSign,
  },
  zelle: {
    label: "Zelle",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    icon: Wallet,
  },
  pago_movil: {
    label: "Pago Movil",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    icon: Smartphone,
  },
  punto_venta: {
    label: "Punto de Venta",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    icon: CreditCard,
  },
  transferencia: {
    label: "Transferencia",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    icon: ArrowRightLeft,
  },
  mixed: {
    label: "Mixto",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    icon: Layers,
  },
};

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string }
> = {
  completed: {
    label: "Completada",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  voided: {
    label: "Anulada",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  pending: {
    label: "Pendiente",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
};

// ---------------------------------------------------------------------------
// Void Confirm Dialog
// ---------------------------------------------------------------------------

function VoidConfirmDialog({
  open,
  onClose,
  invoice,
  userId,
  onVoided,
}: {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  userId: string;
  onVoided: () => void;
}) {
  const [reason, setReason] = useState("");
  const [voiding, setVoiding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const handleVoid = async () => {
    if (!invoice) return;
    if (!reason.trim()) {
      setError("Debes indicar el motivo de la anulacion.");
      return;
    }

    setVoiding(true);
    setError("");
    try {
      await voidInvoice(invoice.id, userId, reason.trim());
      onVoided();
      onClose();
    } catch (err) {
      console.error("Error al anular factura:", err);
      setError("Error al anular la factura. Intenta nuevamente.");
    } finally {
      setVoiding(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Anular Factura #{invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Esta accion no se puede deshacer. Se marcara la factura como anulada
            y se revertira el inventario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-3 text-sm">
            <p className="font-medium">Factura: {invoice.invoice_number}</p>
            <p>Total: {formatUSD(invoice.total_usd)}</p>
            <p>Fecha: {formatDateTimeVE(invoice.created_at)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="void-reason">Motivo de anulacion *</Label>
            <textarea
              id="void-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Ej: Error en el monto, devolucion del cliente..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={voiding}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleVoid}
            disabled={voiding || !reason.trim()}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {voiding ? "Anulando..." : "Confirmar Anulacion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Invoice Detail Dialog
// ---------------------------------------------------------------------------

function InvoiceDetailDialog({
  open,
  onClose,
  invoiceId,
}: {
  open: boolean;
  onClose: () => void;
  invoiceId: string | null;
}) {
  const [detail, setDetail] = useState<InvoiceWithItems | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoiceId && open) {
      setLoading(true);
      getInvoiceDetail(invoiceId)
        .then((data) => setDetail(data))
        .finally(() => setLoading(false));
    }
  }, [invoiceId, open]);

  if (!invoiceId) return null;

  const inv = detail;
  const payConf = inv ? PAYMENT_METHOD_CONFIG[inv.payment_method] : null;
  const statusConf = inv ? STATUS_CONFIG[inv.status] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Factura #{inv?.invoice_number ?? "..."}
          </DialogTitle>
          <DialogDescription>
            {inv ? formatDateTimeVE(inv.created_at) : "Cargando..."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : inv ? (
          <div className="space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="text-sm font-medium">
                  {inv.customer_name || "Cliente generico"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cedula/RIF</p>
                <p className="text-sm font-medium">
                  {inv.customer_ci || inv.customer_rif || "\u2014"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Metodo de pago</p>
                {payConf && (
                  <Badge className={payConf.color}>{payConf.label}</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estado</p>
                {statusConf && (
                  <Badge className={statusConf.color}>{statusConf.label}</Badge>
                )}
              </div>
            </div>

            {/* Items table */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Productos</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">P. Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inv.pharmacy_invoice_items?.map((item: InvoiceItem) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-sm">
                            {item.pharmacy_products?.name ?? "Producto"}
                          </p>
                          {item.pharmacy_products?.presentation && (
                            <p className="text-xs text-muted-foreground">
                              {item.pharmacy_products.presentation}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatUSD(item.unit_price_usd)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatUSD(item.subtotal_usd)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatUSD(inv.subtotal_usd)}</span>
              </div>
              {inv.discount_usd > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento:</span>
                  <span>-{formatUSD(inv.discount_usd)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA:</span>
                <span>{formatUSD(inv.tax_usd)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total USD:</span>
                <span className="text-green-600">
                  {formatUSD(inv.total_usd)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total Bs:</span>
                <span>{formatBs(inv.total_bs)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tasa de cambio:</span>
                <span>Bs. {inv.exchange_rate_used?.toFixed(2) ?? "\u2014"}</span>
              </div>
            </div>

            {/* Void info */}
            {inv.status === "voided" && inv.void_reason && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm">
                <p className="font-medium text-destructive">Factura Anulada</p>
                <p>Motivo: {inv.void_reason}</p>
                <p>Fecha: {formatDateTimeVE(inv.voided_at)}</p>
              </div>
            )}

            {inv.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground">Notas:</p>
                <p>{inv.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No se pudo cargar el detalle de la factura.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Expandable Invoice Row Items
// ---------------------------------------------------------------------------

function InvoiceItemsRow({
  invoiceId,
  expanded,
}: {
  invoiceId: string;
  expanded: boolean;
}) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (expanded && !loaded.current) {
      loaded.current = true;
      setLoading(true);
      getInvoiceDetail(invoiceId)
        .then((data) => {
          if (data) setItems(data.pharmacy_invoice_items || []);
        })
        .finally(() => setLoading(false));
    }
  }, [expanded, invoiceId]);

  if (!expanded) return null;

  return (
    <TableRow>
      <TableCell colSpan={9} className="bg-muted/30 p-0">
        <div className="px-8 py-3">
          {loading ? (
            <p className="text-sm text-muted-foreground py-2">
              Cargando items...
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Sin items registrados
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left py-1 pr-4">Producto</th>
                  <th className="text-center py-1 px-2">Cant.</th>
                  <th className="text-right py-1 px-2">P. Unit. USD</th>
                  <th className="text-right py-1 px-2">Subtotal USD</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-muted/50">
                    <td className="py-1.5 pr-4">
                      <span className="font-medium">
                        {item.pharmacy_products?.name ?? "Producto"}
                      </span>
                      {item.pharmacy_products?.presentation && (
                        <span className="text-muted-foreground ml-1">
                          ({item.pharmacy_products.presentation})
                        </span>
                      )}
                    </td>
                    <td className="text-center py-1.5 px-2">
                      {item.quantity}
                    </td>
                    <td className="text-right py-1.5 px-2">
                      {formatUSD(item.unit_price_usd)}
                    </td>
                    <td className="text-right py-1.5 px-2 font-medium">
                      {formatUSD(item.subtotal_usd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

function exportSalesCSV(invoices: Invoice[]) {
  const headers = [
    "Factura",
    "Fecha",
    "Cliente",
    "Cedula",
    "Subtotal USD",
    "Descuento USD",
    "IVA USD",
    "Total USD",
    "Total Bs",
    "Metodo Pago",
    "Estado",
    "Referencia",
    "Notas",
  ];

  const rows = invoices.map((inv) => [
    inv.invoice_number,
    formatDateTimeVE(inv.created_at),
    inv.customer_name || "Cliente generico",
    inv.customer_ci || "",
    inv.subtotal_usd.toFixed(2),
    inv.discount_usd.toFixed(2),
    inv.tax_usd.toFixed(2),
    inv.total_usd.toFixed(2),
    inv.total_bs.toFixed(2),
    PAYMENT_METHOD_CONFIG[inv.payment_method]?.label || inv.payment_method,
    STATUS_CONFIG[inv.status]?.label || inv.status,
    inv.payment_reference || "",
    inv.notes || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ventas_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const PER_PAGE = 25;

export default function VentasPage() {
  // Auth
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  // Data
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<PaginatedSales>({
    invoices: [],
    total: 0,
    page: 1,
    per_page: PER_PAGE,
    total_pages: 0,
  });
  const [summary, setSummary] = useState<SalesSummary | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null);
  const [voidInvoiceTarget, setVoidInvoiceTarget] = useState<Invoice | null>(
    null
  );
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // ─── Initialize ─────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const phId = await getCurrentPharmacyId();
        setPharmacyId(phId);

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      } catch (err) {
        console.error("Error initializing ventas:", err);
      }
    }
    init();
  }, []);

  // ─── Load Sales ─────────────────────────────────────────────────────
  const loadSales = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const filters: SalesFilters = {
        pharmacy_id: pharmacyId,
        page: currentPage,
        per_page: PER_PAGE,
        search: searchTerm || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        payment_method: (paymentMethod as PaymentMethod) || undefined,
        status: (statusFilter as InvoiceStatus) || undefined,
      };

      const [sales, sum] = await Promise.all([
        getSalesHistory(filters),
        getSalesSummary(pharmacyId),
      ]);

      setSalesData(sales);
      setSummary(sum);
    } catch (err) {
      console.error("Error cargando ventas:", err);
    } finally {
      setLoading(false);
    }
  }, [
    pharmacyId,
    currentPage,
    searchTerm,
    dateFrom,
    dateTo,
    paymentMethod,
    statusFilter,
  ]);

  useEffect(() => {
    if (pharmacyId) loadSales();
  }, [pharmacyId, loadSales]);

  // ─── Debounced search ───────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 400);
  };

  // ─── Pagination ─────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    if (page >= 1 && page <= salesData.total_pages) {
      setCurrentPage(page);
    }
  };

  // ─── Export ─────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!pharmacyId) return;
    try {
      // Fetch all matching invoices for export (up to 10000)
      const allData = await getSalesHistory({
        pharmacy_id: pharmacyId,
        per_page: 10000,
        page: 1,
        search: searchTerm || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        payment_method: (paymentMethod as PaymentMethod) || undefined,
        status: (statusFilter as InvoiceStatus) || undefined,
      });
      exportSalesCSV(allData.invoices);
    } catch (err) {
      console.error("Error al exportar CSV:", err);
    }
  };

  // ─── Print receipt ──────────────────────────────────────────────────
  const handlePrint = (invoiceNumber: string) => {
    // Open print dialog with minimal receipt view
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(
        `<html><head><title>Recibo ${invoiceNumber}</title></head><body>` +
          `<h2 style="text-align:center">Recibo ${invoiceNumber}</h2>` +
          `<p style="text-align:center">Imprimiendo...</p>` +
          `<script>window.print();window.close();</script></body></html>`
      );
    }
  };

  // ─── Void callback ─────────────────────────────────────────────────
  const handleVoided = () => {
    loadSales();
  };

  // ─── Loading state ─────────────────────────────────────────────────
  if (!pharmacyId && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  if (!pharmacyId && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            No se pudo determinar la farmacia
          </p>
          <p className="text-sm text-muted-foreground">
            Verifica que tu usuario este asignado a una farmacia.
          </p>
        </div>
      </div>
    );
  }

  const { invoices, total, total_pages } = salesData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Historial de Ventas</h1>
              <p className="text-muted-foreground">
                {total} venta{total !== 1 ? "s" : ""} registrada
                {total !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-36 text-sm"
                />
                <span className="text-muted-foreground text-sm">a</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-36 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas Hoy</p>
                    <p className="text-2xl font-bold">
                      {summary.total_sales_today_count}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-green-600 font-medium">
                        {formatUSD(summary.total_sales_today_usd)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBs(summary.total_sales_today_bs)}
                      </p>
                    </div>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-primary/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ventas esta Semana
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatUSD(summary.total_sales_week_usd)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBs(summary.total_sales_week_bs)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ventas este Mes
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatUSD(summary.total_sales_month_usd)}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {formatBs(summary.total_sales_month_bs)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {summary.total_sales_month_count} ventas
                      </p>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Promedio por Venta
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatUSD(summary.avg_sale_usd)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Basado en ventas del mes
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar factura o cliente..."
                    defaultValue={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value as PaymentMethod | "");
                  setCurrentPage(1);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los metodos</option>
                <option value="cash_bs">Efectivo Bs</option>
                <option value="cash_usd">Efectivo USD</option>
                <option value="zelle">Zelle</option>
                <option value="pago_movil">Pago Movil</option>
                <option value="punto_venta">Punto de Venta</option>
                <option value="transferencia">Transferencia</option>
                <option value="mixed">Mixto</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as InvoiceStatus | "");
                  setCurrentPage(1);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="completed">Completada</option>
                <option value="voided">Anulada</option>
                <option value="pending">Pendiente</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => {
                  setSearchTerm("");
                  setDateFrom("");
                  setDateTo("");
                  setPaymentMethod("");
                  setStatusFilter("");
                  setCurrentPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Facturas
              </span>
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 && !loading ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  No hay ventas registradas.
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ||
                  dateFrom ||
                  dateTo ||
                  paymentMethod ||
                  statusFilter
                    ? "No se encontraron ventas con los filtros aplicados."
                    : "Las ventas apareceran aqui cuando se procesen desde la caja."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>#Factura</TableHead>
                      <TableHead>Fecha/Hora</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center"># Items</TableHead>
                      <TableHead className="text-right">Total USD</TableHead>
                      <TableHead className="text-right">Total Bs</TableHead>
                      <TableHead>Metodo Pago</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => {
                      const payConf =
                        PAYMENT_METHOD_CONFIG[inv.payment_method];
                      const statusConf = STATUS_CONFIG[inv.status];
                      const PayIcon = payConf?.icon ?? DollarSign;
                      const isExpanded = expandedRow === inv.id;

                      return (
                        <>
                          <TableRow
                            key={inv.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : inv.id)
                            }
                          >
                            <TableCell className="w-8 pr-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm font-medium">
                                {inv.invoice_number}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDateTimeVE(inv.created_at)}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-sm">
                                {inv.customer_name || "Cliente generico"}
                              </p>
                              {inv.customer_ci && (
                                <p className="text-xs text-muted-foreground">
                                  CI: {inv.customer_ci}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {/* Item count loaded lazily in expanded row */}
                              \u2014
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-green-600">
                                {formatUSD(inv.total_usd)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {formatBs(inv.total_bs)}
                            </TableCell>
                            <TableCell>
                              {payConf && (
                                <Badge
                                  className={`${payConf.color} gap-1 text-xs`}
                                >
                                  <PayIcon className="h-3 w-3" />
                                  {payConf.label}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {statusConf && (
                                <Badge className={`${statusConf.color} text-xs`}>
                                  {statusConf.label}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Ver detalle"
                                  onClick={() => setDetailInvoiceId(inv.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Imprimir recibo"
                                  onClick={() =>
                                    handlePrint(inv.invoice_number)
                                  }
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                {inv.status === "completed" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Anular"
                                    onClick={() => setVoidInvoiceTarget(inv)}
                                  >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          <InvoiceItemsRow
                            key={`${inv.id}-items`}
                            invoiceId={inv.id}
                            expanded={isExpanded}
                          />
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {total_pages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <p className="text-sm text-muted-foreground">
                  Pagina {currentPage} de {total_pages} ({total} ventas)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
                    let pageNum: number;
                    if (total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= total_pages - 2) {
                      pageNum = total_pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        className="w-9"
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= total_pages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <InvoiceDetailDialog
        open={detailInvoiceId !== null}
        onClose={() => setDetailInvoiceId(null)}
        invoiceId={detailInvoiceId}
      />
      <VoidConfirmDialog
        open={voidInvoiceTarget !== null}
        onClose={() => setVoidInvoiceTarget(null)}
        invoice={voidInvoiceTarget}
        userId={userId}
        onVoided={handleVoided}
      />
    </div>
  );
}
