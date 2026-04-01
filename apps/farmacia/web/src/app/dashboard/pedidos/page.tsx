"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Package,
  Truck,
  Eye,
  X,
  Save,
  Send,
  ClipboardCheck,
  DollarSign,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@red-salud/design-system";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@red-salud/design-system";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@red-salud/design-system";
import {
  type PurchaseOrder,
  type PurchaseOrderItem,
  type CreatePOItemInput,
  type ReceiveItemInput,
  PO_STATUS_LABELS,
  PO_STATUS_COLORS,
  fetchPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  cancelPurchaseOrder,
  receivePurchaseOrder,
  fetchProductsForPO,
  fetchSuppliersForPO,
} from "@/lib/services/purchase-order-service";
import { getLatestExchangeRate } from "@/lib/services/exchange-rate-service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateVE(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
// Create PO Dialog
// ---------------------------------------------------------------------------

interface ProductOption {
  id: string;
  name: string;
  generic_name: string;
  presentation: string | null;
  precio_compra_usd: number;
  stock_actual: number;
}

interface SupplierOption {
  id: string;
  name: string;
  contact_person: string | null;
}

interface POLineItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
}

function CreatePODialog({
  open,
  onClose,
  onCreated,
  exchangeRate,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  exchangeRate: number;
}) {
  const [step, setStep] = useState(1);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<POLineItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [addCost, setAddCost] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedSupplierId("");
      setExpectedDelivery("");
      setNotes("");
      setLineItems([]);
      setProductSearch("");
      Promise.all([fetchSuppliersForPO(), fetchProductsForPO()]).then(
        ([s, p]) => {
          setSuppliers(s);
          setProducts(p);
        }
      );
    }
  }, [open]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.generic_name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addLineItem = (product: ProductOption) => {
    // Avoid duplicates
    if (lineItems.find((li) => li.product_id === product.id)) {
      alert("Este producto ya esta en la orden");
      return;
    }
    setLineItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        quantity: addQty,
        unit_cost: addCost || product.precio_compra_usd,
      },
    ]);
    setAddQty(1);
    setAddCost(0);
    setProductSearch("");
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: "quantity" | "unit_cost",
    value: number
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unit_cost,
    0
  );
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const handleSave = async (asDraft: boolean) => {
    setSaving(true);
    const result = await createPurchaseOrder({
      supplier_id: selectedSupplierId,
      expected_delivery_date: expectedDelivery || null,
      notes,
      items: lineItems.map((li) => ({
        product_id: li.product_id,
        quantity_ordered: li.quantity,
        unit_cost_usd: li.unit_cost,
      })),
      saveAsDraft: asDraft,
    });
    setSaving(false);

    if (result) {
      onCreated();
      onClose();
    } else {
      alert("Error al crear la orden de compra");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nueva Orden de Compra
          </DialogTitle>
          <DialogDescription>
            Paso {step} de 3 —{" "}
            {step === 1
              ? "Seleccionar proveedor"
              : step === 2
                ? "Agregar productos"
                : "Revisar y enviar"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Supplier */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Proveedor *</Label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar proveedor...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.contact_person ? ` (${s.contact_person})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Fecha esperada de entrega</Label>
              <Input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Products */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Search & add */}
            <div className="space-y-2">
              <Label>Buscar producto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar por nombre o generico..."
                  className="pl-10"
                />
              </div>

              {/* Product search results */}
              {productSearch.length >= 2 && (
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {filteredProducts.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">
                      No se encontraron productos
                    </p>
                  ) : (
                    filteredProducts.slice(0, 10).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addLineItem(product)}
                      >
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.generic_name}
                            {product.presentation
                              ? ` | ${product.presentation}`
                              : ""}
                            {" | Stock: "}
                            {product.stock_actual}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatUSD(product.precio_compra_usd)}
                          </p>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Line items */}
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Productos en la orden ({lineItems.length})
              </h4>
              {lineItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Busca y agrega productos a la orden
                </p>
              ) : (
                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-md bg-muted/40"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                idx,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">x</span>
                        <div className="w-24">
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unit_cost}
                            onChange={(e) =>
                              updateLineItem(
                                idx,
                                "unit_cost",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <span className="text-sm font-medium w-20 text-right">
                          {formatUSD(item.quantity * item.unit_cost)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Proveedor</p>
                <p className="font-medium">
                  {suppliers.find((s) => s.id === selectedSupplierId)?.name ||
                    "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Entrega esperada
                </p>
                <p className="font-medium">
                  {expectedDelivery
                    ? formatDateVE(expectedDelivery)
                    : "No definida"}
                </p>
              </div>
            </div>

            {/* Items summary */}
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Productos ({lineItems.length})
              </h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cant.</TableHead>
                      <TableHead className="text-right">Costo Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">
                          {item.product_name}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatUSD(item.unit_cost)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatUSD(item.quantity * item.unit_cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatUSD(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA (16%)</span>
                <span>{formatUSD(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t">
                <span>Total USD</span>
                <span>{formatUSD(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total Bs. (tasa: {exchangeRate})</span>
                <span>{formatBs(total * exchangeRate)}</span>
              </div>
            </div>

            {notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={saving}
            >
              Anterior
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>

          {step < 3 && (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !selectedSupplierId) ||
                (step === 2 && lineItems.length === 0)
              }
            >
              Siguiente
            </Button>
          )}

          {step === 3 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button onClick={() => handleSave(false)} disabled={saving}>
                <Send className="h-4 w-4 mr-2" />
                {saving ? "Enviando..." : "Confirmar Orden"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// PO Detail Dialog
// ---------------------------------------------------------------------------

function PODetailDialog({
  open,
  onClose,
  poId,
  exchangeRate,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  poId: string | null;
  exchangeRate: number;
  onUpdated: () => void;
}) {
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [loadingPO, setLoadingPO] = useState(false);

  useEffect(() => {
    if (poId && open) {
      setLoadingPO(true);
      getPurchaseOrderById(poId).then((data) => {
        setPO(data);
        setLoadingPO(false);
      });
    }
  }, [poId, open]);

  if (!poId) return null;

  const statusColor =
    PO_STATUS_COLORS[po?.status || "pending"] || PO_STATUS_COLORS.pending;
  const statusLabel =
    PO_STATUS_LABELS[po?.status || "pending"] || po?.status || "—";

  // Status timeline
  const timelineSteps = [
    { key: "pending", label: "Pendiente", icon: Clock },
    { key: "confirmed", label: "Confirmada", icon: CheckCircle },
    { key: "shipped", label: "En transito", icon: Truck },
    { key: "delivered", label: "Recibida", icon: Package },
  ];

  const currentStepIndex = timelineSteps.findIndex(
    (s) => s.key === po?.status
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Orden {po?.po_number || "..."}
          </DialogTitle>
          <DialogDescription>Detalle de la orden de compra</DialogDescription>
        </DialogHeader>

        {loadingPO || !po ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Status timeline */}
            {po.status !== "cancelled" && (
              <div className="flex items-center gap-1">
                {timelineSteps.map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div
                        className={`flex flex-col items-center gap-1 flex-1 ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground/40"
                        }`}
                      >
                        <StepIcon
                          className={`h-5 w-5 ${isActive ? "text-primary" : ""}`}
                        />
                        <span className="text-xs">{step.label}</span>
                      </div>
                      {idx < timelineSteps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-1 ${
                            idx < currentStepIndex
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {po.status === "cancelled" && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-md p-3">
                <X className="h-5 w-5" />
                <span className="font-medium">Orden cancelada</span>
              </div>
            )}

            {/* Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Proveedor</p>
                <p className="font-medium text-sm">
                  {po.supplier?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha orden</p>
                <p className="font-medium text-sm">
                  {formatDateVE(po.order_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Entrega esperada
                </p>
                <p className="font-medium text-sm">
                  {formatDateVE(po.expected_delivery_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Productos ({po.items?.length || 0})
              </h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Pedido</TableHead>
                      <TableHead className="text-right">Recibido</TableHead>
                      <TableHead className="text-right">Costo Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {po.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {item.product?.name || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.product?.generic_name}
                              {item.batch_number
                                ? ` | Lote: ${item.batch_number}`
                                : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity_ordered}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              item.quantity_received < item.quantity_ordered
                                ? "text-yellow-600 font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {item.quantity_received}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatUSD(item.unit_cost_usd)}
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
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatUSD(po.subtotal_usd)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA</span>
                <span>{formatUSD(po.tax_usd)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t">
                <span>Total USD</span>
                <span>{formatUSD(po.total_usd)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total Bs. (tasa: {exchangeRate})</span>
                <span>{formatBs((po.total_usd || 0) * exchangeRate)}</span>
              </div>
            </div>

            {po.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-sm">{po.notes}</p>
              </div>
            )}
          </div>
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
// Receive PO Dialog
// ---------------------------------------------------------------------------

function ReceivePODialog({
  open,
  onClose,
  poId,
  onReceived,
}: {
  open: boolean;
  onClose: () => void;
  poId: string | null;
  onReceived: () => void;
}) {
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [loadingPO, setLoadingPO] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [receiveData, setReceiveData] = useState<
    Map<
      string,
      { quantity_received: number; batch_number: string; expiry_date: string }
    >
  >(new Map());

  useEffect(() => {
    if (poId && open) {
      setLoadingPO(true);
      setReceiveData(new Map());
      getPurchaseOrderById(poId).then((data) => {
        setPO(data);
        if (data?.items) {
          const initial = new Map<
            string,
            {
              quantity_received: number;
              batch_number: string;
              expiry_date: string;
            }
          >();
          for (const item of data.items) {
            initial.set(item.id, {
              quantity_received: item.quantity_ordered - item.quantity_received,
              batch_number: item.batch_number || "",
              expiry_date: item.expiry_date || "",
            });
          }
          setReceiveData(initial);
        }
        setLoadingPO(false);
      });
    }
  }, [poId, open]);

  const updateReceiveItem = (
    itemId: string,
    field: "quantity_received" | "batch_number" | "expiry_date",
    value: string | number
  ) => {
    setReceiveData((prev) => {
      const next = new Map(prev);
      const current = next.get(itemId) || {
        quantity_received: 0,
        batch_number: "",
        expiry_date: "",
      };
      next.set(itemId, { ...current, [field]: value });
      return next;
    });
  };

  const handleReceive = async () => {
    if (!po?.items) return;
    setReceiving(true);

    const items: ReceiveItemInput[] = [];
    for (const item of po.items) {
      const rd = receiveData.get(item.id);
      if (rd && rd.quantity_received > 0) {
        items.push({
          item_id: item.id,
          product_id: item.product_id,
          quantity_received: rd.quantity_received,
          batch_number: rd.batch_number,
          expiry_date: rd.expiry_date,
        });
      }
    }

    if (items.length === 0) {
      alert("No hay items para recibir");
      setReceiving(false);
      return;
    }

    const success = await receivePurchaseOrder(po.id, items);
    setReceiving(false);

    if (success) {
      onReceived();
      onClose();
    } else {
      alert("Error al recibir la orden");
    }
  };

  if (!poId) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Recibir Orden {po?.po_number || "..."}
          </DialogTitle>
          <DialogDescription>
            Ingresa las cantidades recibidas, numero de lote y fecha de
            vencimiento para cada producto
          </DialogDescription>
        </DialogHeader>

        {loadingPO || !po ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {po.items?.map((item) => {
              const rd = receiveData.get(item.id) || {
                quantity_received: 0,
                batch_number: "",
                expiry_date: "",
              };
              const remaining =
                item.quantity_ordered - item.quantity_received;

              return (
                <Card key={item.id}>
                  <CardContent className="pt-4 pb-3 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {item.product?.name || "Producto"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pedido: {item.quantity_ordered} | Ya recibido:{" "}
                          {item.quantity_received} | Pendiente: {remaining}
                        </p>
                      </div>
                      {remaining <= 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        >
                          Completo
                        </Badge>
                      )}
                    </div>

                    {remaining > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Cantidad recibida</Label>
                          <Input
                            type="number"
                            min={0}
                            max={remaining}
                            value={rd.quantity_received}
                            onChange={(e) =>
                              updateReceiveItem(
                                item.id,
                                "quantity_received",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Numero de lote</Label>
                          <Input
                            value={rd.batch_number}
                            onChange={(e) =>
                              updateReceiveItem(
                                item.id,
                                "batch_number",
                                e.target.value
                              )
                            }
                            placeholder="LOT-XXX-2026"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Fecha de vencimiento
                          </Label>
                          <Input
                            type="date"
                            value={rd.expiry_date}
                            onChange={(e) =>
                              updateReceiveItem(
                                item.id,
                                "expiry_date",
                                e.target.value
                              )
                            }
                            className="h-9"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={receiving}>
            Cancelar
          </Button>
          <Button onClick={handleReceive} disabled={receiving || !po}>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            {receiving ? "Procesando..." : "Confirmar Recepcion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PedidosPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exchangeRate, setExchangeRate] = useState(36);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [detailPOId, setDetailPOId] = useState<string | null>(null);
  const [receivePOId, setReceivePOId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPurchaseOrders({
        status: selectedStatus || undefined,
        supplierId: selectedSupplier || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setOrders(data);
    } catch (error) {
      console.error("Error cargando ordenes:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedSupplier, dateFrom, dateTo]);

  useEffect(() => {
    loadOrders();
    getLatestExchangeRate().then((r) => setExchangeRate(r.rate));
    fetchSuppliersForPO().then(setSuppliers);
  }, [loadOrders]);

  const handleCancel = async (orderId: string, poNumber: string) => {
    if (!confirm(`Cancelar orden ${poNumber}?`)) return;
    const success = await cancelPurchaseOrder(orderId);
    if (success) loadOrders();
    else alert("Error al cancelar la orden");
  };

  // Stats
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const totalUSD = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total_usd || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando ordenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Ordenes de Compra</h1>
              <p className="text-muted-foreground">
                Gestion de pedidos a proveedores
              </p>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {confirmedCount}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recibidas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {deliveredCount}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total USD</p>
                  <p className="text-2xl font-bold">{formatUSD(totalUSD)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="shipped">En transito</option>
                <option value="delivered">Recibida</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los proveedores</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Desde"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Hasta"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {orders.length} orden{orders.length !== 1 ? "es" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  No hay ordenes de compra
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Crea una nueva orden de compra para reabastecer tu inventario
                  desde tus proveedores registrados.
                </p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera orden
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Total USD</TableHead>
                      <TableHead className="text-right">Total Bs.</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const statusColor =
                        PO_STATUS_COLORS[order.status] ||
                        PO_STATUS_COLORS.pending;
                      const statusLabel =
                        PO_STATUS_LABELS[order.status] || order.status;
                      const canReceive =
                        order.status === "confirmed" ||
                        order.status === "shipped";
                      const canCancel =
                        order.status === "pending" ||
                        order.status === "confirmed";

                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-mono text-sm font-medium">
                                {order.po_number}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">
                              {order.supplier?.name || "—"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {formatDateVE(order.order_date)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatUSD(order.total_usd)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {formatBs(
                              (order.total_usd || 0) * exchangeRate
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Ver detalle"
                                onClick={() => setDetailPOId(order.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canReceive && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Recibir"
                                  onClick={() => setReceivePOId(order.id)}
                                >
                                  <ClipboardCheck className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {canCancel && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Cancelar"
                                  onClick={() =>
                                    handleCancel(order.id, order.po_number)
                                  }
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreatePODialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadOrders}
        exchangeRate={exchangeRate}
      />
      <PODetailDialog
        open={detailPOId !== null}
        onClose={() => setDetailPOId(null)}
        poId={detailPOId}
        exchangeRate={exchangeRate}
        onUpdated={loadOrders}
      />
      <ReceivePODialog
        open={receivePOId !== null}
        onClose={() => setReceivePOId(null)}
        poId={receivePOId}
        onReceived={loadOrders}
      />
    </div>
  );
}
