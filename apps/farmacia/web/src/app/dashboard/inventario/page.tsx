"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Search,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  DollarSign,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  ShieldAlert,
  Thermometer,
  Pill,
  ToggleLeft,
  ToggleRight,
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
import {
  type ProductCategory,
  type ProductWithStock,
  type PharmacyBatch,
  type ProductFilters,
  type CreateProductInput,
  type UpdateProductInput,
  CATEGORY_LABELS,
  fetchProducts,
  createProduct,
  updateProduct,
  fetchExchangeRate,
} from "@/lib/services/inventory-service";
import { getCurrentPharmacyId } from "@/lib/services/settings-service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUSD(amount: number | null | undefined): string {
  if (amount == null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatBs(amount: number | null | undefined): string {
  if (amount == null) return "Bs 0,00";
  return `Bs ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function formatDateVE(dateStr: string | null | undefined): string {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStockStatusBadge(status: "normal" | "bajo" | "agotado") {
  switch (status) {
    case "normal":
      return { label: "Normal", classes: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "bajo":
      return { label: "Bajo", classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    case "agotado":
      return { label: "Agotado", classes: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
  }
}

function getBatchStatusBadge(status: string) {
  switch (status) {
    case "active":
      return { label: "Activo", classes: "bg-green-100 text-green-800" };
    case "expired":
      return { label: "Vencido", classes: "bg-red-100 text-red-800" };
    case "recalled":
      return { label: "Retirado", classes: "bg-orange-100 text-orange-800" };
    case "depleted":
      return { label: "Agotado", classes: "bg-gray-100 text-gray-600" };
    default:
      return { label: status, classes: "bg-gray-100 text-gray-600" };
  }
}

const ALL_CATEGORIES: ProductCategory[] = [
  "medicamentos",
  "otc",
  "cuidado_personal",
  "suplementos",
  "equipos_medicos",
  "bebes",
  "otros",
];

const STOCK_STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "normal", label: "Normal" },
  { value: "bajo", label: "Bajo stock" },
  { value: "agotado", label: "Agotado" },
] as const;

// ---------------------------------------------------------------------------
// Product Form Dialog
// ---------------------------------------------------------------------------

interface ProductFormData {
  name: string;
  generic_name: string;
  barcode: string;
  internal_code: string;
  presentation: string;
  concentration: string;
  pharmaceutical_form: string;
  manufacturer: string;
  category: ProductCategory;
  price_usd: string;
  cost_usd: string;
  min_stock: string;
  max_stock: string;
  reorder_point: string;
  requires_prescription: boolean;
  is_controlled: boolean;
  is_refrigerated: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  generic_name: "",
  barcode: "",
  internal_code: "",
  presentation: "",
  concentration: "",
  pharmaceutical_form: "",
  manufacturer: "",
  category: "medicamentos",
  price_usd: "",
  cost_usd: "",
  min_stock: "10",
  max_stock: "",
  reorder_point: "",
  requires_prescription: false,
  is_controlled: false,
  is_refrigerated: false,
};

function ProductFormDialog({
  open,
  onClose,
  product,
  pharmacyId,
  exchangeRate,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductWithStock | null;
  pharmacyId: string;
  exchangeRate: number;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        generic_name: product.generic_name || "",
        barcode: product.barcode || "",
        internal_code: product.internal_code || "",
        presentation: product.presentation || "",
        concentration: product.concentration || "",
        pharmaceutical_form: product.pharmaceutical_form || "",
        manufacturer: product.manufacturer || "",
        category: product.category,
        price_usd: product.price_usd?.toString() || "",
        cost_usd: product.cost_usd?.toString() || "",
        min_stock: product.min_stock?.toString() || "10",
        max_stock: product.max_stock?.toString() || "",
        reorder_point: product.reorder_point?.toString() || "",
        requires_prescription: product.requires_prescription,
        is_controlled: product.is_controlled,
        is_refrigerated: product.is_refrigerated,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [product, open]);

  const priceUsd = parseFloat(form.price_usd) || 0;
  const priceBs = priceUsd * exchangeRate;
  const costUsd = parseFloat(form.cost_usd) || 0;
  const margin = priceUsd > 0 && costUsd > 0 ? ((priceUsd - costUsd) / priceUsd) * 100 : 0;

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!form.price_usd || parseFloat(form.price_usd) <= 0) {
      setError("El precio USD es obligatorio");
      return;
    }
    setError("");
    setSaving(true);

    try {
      if (product) {
        const input: UpdateProductInput = {
          name: form.name.trim(),
          generic_name: form.generic_name.trim() || null,
          barcode: form.barcode.trim() || null,
          internal_code: form.internal_code.trim() || null,
          presentation: form.presentation.trim() || null,
          concentration: form.concentration.trim() || null,
          pharmaceutical_form: form.pharmaceutical_form.trim() || null,
          manufacturer: form.manufacturer.trim() || null,
          category: form.category,
          price_usd: parseFloat(form.price_usd),
          price_bs: parseFloat(form.price_usd) * exchangeRate,
          cost_usd: form.cost_usd ? parseFloat(form.cost_usd) : null,
          min_stock: parseInt(form.min_stock) || 0,
          max_stock: form.max_stock ? parseInt(form.max_stock) : null,
          reorder_point: form.reorder_point ? parseInt(form.reorder_point) : null,
          requires_prescription: form.requires_prescription,
          is_controlled: form.is_controlled,
          is_refrigerated: form.is_refrigerated,
        };
        await updateProduct(product.id, input);
      } else {
        const input: CreateProductInput = {
          pharmacy_id: pharmacyId,
          medication_catalog_id: null,
          name: form.name.trim(),
          generic_name: form.generic_name.trim() || null,
          barcode: form.barcode.trim() || null,
          internal_code: form.internal_code.trim() || null,
          presentation: form.presentation.trim() || null,
          concentration: form.concentration.trim() || null,
          pharmaceutical_form: form.pharmaceutical_form.trim() || null,
          manufacturer: form.manufacturer.trim() || null,
          category: form.category,
          subcategory: null,
          price_usd: parseFloat(form.price_usd),
          price_bs: parseFloat(form.price_usd) * exchangeRate,
          cost_usd: form.cost_usd ? parseFloat(form.cost_usd) : null,
          cost_bs: form.cost_usd ? parseFloat(form.cost_usd) * exchangeRate : null,
          profit_margin: margin > 0 ? Math.round(margin * 100) / 100 : null,
          tax_rate: null,
          min_stock: parseInt(form.min_stock) || 0,
          max_stock: form.max_stock ? parseInt(form.max_stock) : null,
          reorder_point: form.reorder_point ? parseInt(form.reorder_point) : null,
          requires_prescription: form.requires_prescription,
          is_controlled: form.is_controlled,
          controlled_type: null,
          is_refrigerated: form.is_refrigerated,
          storage_conditions: null,
          image_url: null,
          is_active: true,
        };
        await createProduct(input);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error guardando producto:", err);
      setError("Error al guardar el producto. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProductFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Producto" : "Agregar Producto"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Modifica los datos del producto"
              : "Registra un nuevo producto en el inventario"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-800 text-sm dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Ej: Losartan 50mg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generic_name">Nombre generico</Label>
              <Input
                id="generic_name"
                value={form.generic_name}
                onChange={(e) => updateField("generic_name", e.target.value)}
                placeholder="Ej: Losartan Potasico"
              />
            </div>
          </div>

          {/* Codes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Codigo de barras</Label>
              <Input
                id="barcode"
                value={form.barcode}
                onChange={(e) => updateField("barcode", e.target.value)}
                placeholder="7501234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internal_code">Codigo interno</Label>
              <Input
                id="internal_code"
                value={form.internal_code}
                onChange={(e) => updateField("internal_code", e.target.value)}
                placeholder="MED-001"
              />
            </div>
          </div>

          {/* Presentation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="presentation">Presentacion</Label>
              <Input
                id="presentation"
                value={form.presentation}
                onChange={(e) => updateField("presentation", e.target.value)}
                placeholder="Caja x 30 tabletas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concentration">Concentracion</Label>
              <Input
                id="concentration"
                value={form.concentration}
                onChange={(e) => updateField("concentration", e.target.value)}
                placeholder="50mg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmaceutical_form">Forma farmaceutica</Label>
              <Input
                id="pharmaceutical_form"
                value={form.pharmaceutical_form}
                onChange={(e) => updateField("pharmaceutical_form", e.target.value)}
                placeholder="Tableta"
              />
            </div>
          </div>

          {/* Manufacturer & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante / Laboratorio</Label>
              <Input
                id="manufacturer"
                value={form.manufacturer}
                onChange={(e) => updateField("manufacturer", e.target.value)}
                placeholder="Ej: Pfizer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_usd">Precio venta USD *</Label>
              <Input
                id="price_usd"
                type="number"
                step="0.01"
                min="0"
                value={form.price_usd}
                onChange={(e) => updateField("price_usd", e.target.value)}
                placeholder="0.00"
              />
              {priceUsd > 0 && (
                <p className="text-xs text-muted-foreground">
                  = {formatBs(priceBs)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_usd">Costo USD</Label>
              <Input
                id="cost_usd"
                type="number"
                step="0.01"
                min="0"
                value={form.cost_usd}
                onChange={(e) => updateField("cost_usd", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Margen</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm">
                {margin > 0 ? `${margin.toFixed(1)}%` : "--"}
              </div>
            </div>
          </div>

          {/* Stock levels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_stock">Stock minimo</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={form.min_stock}
                onChange={(e) => updateField("min_stock", e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_stock">Stock maximo</Label>
              <Input
                id="max_stock"
                type="number"
                min="0"
                value={form.max_stock}
                onChange={(e) => updateField("max_stock", e.target.value)}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_point">Punto de reorden</Label>
              <Input
                id="reorder_point"
                type="number"
                min="0"
                value={form.reorder_point}
                onChange={(e) => updateField("reorder_point", e.target.value)}
                placeholder="20"
              />
            </div>
          </div>

          {/* Boolean toggles */}
          <div className="flex flex-wrap gap-6 pt-2">
            <button
              type="button"
              onClick={() => updateField("requires_prescription", !form.requires_prescription)}
              className="flex items-center gap-2"
            >
              {form.requires_prescription ? (
                <ToggleRight className="h-6 w-6 text-blue-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm font-medium flex items-center gap-1">
                <Pill className="h-3.5 w-3.5" />
                Requiere receta
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateField("is_controlled", !form.is_controlled)}
              className="flex items-center gap-2"
            >
              {form.is_controlled ? (
                <ToggleRight className="h-6 w-6 text-red-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm font-medium flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Controlado
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateField("is_refrigerated", !form.is_refrigerated)}
              className="flex items-center gap-2"
            >
              {form.is_refrigerated ? (
                <ToggleRight className="h-6 w-6 text-cyan-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm font-medium flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5" />
                Refrigerado
              </span>
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !form.name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : product ? "Actualizar" : "Crear Producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Product Detail Dialog (view mode)
// ---------------------------------------------------------------------------

function ProductDetailDialog({
  open,
  onClose,
  product,
  exchangeRate,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductWithStock | null;
  exchangeRate: number;
}) {
  if (!product) return null;

  const badge = getStockStatusBadge(product.stock_status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.name}
          </DialogTitle>
          <DialogDescription>
            {product.generic_name || product.internal_code || "Detalle del producto"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Codigo interno</p>
              <p className="text-sm font-medium font-mono">{product.internal_code || "--"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Codigo de barras</p>
              <p className="text-sm font-medium font-mono">{product.barcode || "--"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Categoria</p>
              <p className="text-sm font-medium">{CATEGORY_LABELS[product.category]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fabricante</p>
              <p className="text-sm font-medium">{product.manufacturer || "--"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Presentacion</p>
              <p className="text-sm font-medium">{product.presentation || "--"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Concentracion</p>
              <p className="text-sm font-medium">{product.concentration || "--"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Forma farmaceutica</p>
              <p className="text-sm font-medium">{product.pharmaceutical_form || "--"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Stock total</p>
              <p className="text-sm font-bold flex items-center gap-2">
                {product.total_stock}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.classes}`}>
                  {badge.label}
                </span>
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Precio venta</p>
                <p className="text-xl font-bold">{formatUSD(product.price_usd)}</p>
                <p className="text-xs text-muted-foreground">{formatBs(product.price_usd * exchangeRate)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Costo</p>
                <p className="text-xl font-bold">{formatUSD(product.cost_usd)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Margen</p>
                <p className="text-xl font-bold">
                  {product.profit_margin != null ? `${product.profit_margin.toFixed(1)}%` : "--"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-2">
            {product.requires_prescription && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <Pill className="h-3 w-3 mr-1" />
                Requiere receta
              </Badge>
            )}
            {product.is_controlled && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Controlado
              </Badge>
            )}
            {product.is_refrigerated && (
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                <Thermometer className="h-3 w-3 mr-1" />
                Refrigerado
              </Badge>
            )}
          </div>

          {/* Stock levels */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Stock minimo</p>
              <p className="text-sm font-medium">{product.min_stock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Stock maximo</p>
              <p className="text-sm font-medium">{product.max_stock ?? "--"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Punto de reorden</p>
              <p className="text-sm font-medium">{product.reorder_point ?? "--"}</p>
            </div>
          </div>

          {/* Batches */}
          {product.batches.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Lotes activos ({product.batches.length})
              </h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-right">Disponible</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.batches.map((batch) => {
                      const bs = getBatchStatusBadge(batch.status);
                      return (
                        <TableRow key={batch.id}>
                          <TableCell className="font-mono text-sm">
                            {batch.batch_number}
                          </TableCell>
                          <TableCell>{formatDateVE(batch.expiry_date)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {batch.quantity_available}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bs.classes}`}>
                              {bs.label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

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
// Batch Expansion Row
// ---------------------------------------------------------------------------

function BatchRows({ batches }: { batches: PharmacyBatch[] }) {
  return (
    <>
      {batches.map((batch) => {
        const bs = getBatchStatusBadge(batch.status);
        return (
          <TableRow key={batch.id} className="bg-muted/30">
            <TableCell className="pl-10 text-xs text-muted-foreground" colSpan={2}>
              Lote: <span className="font-mono font-medium text-foreground">{batch.batch_number}</span>
            </TableCell>
            <TableCell className="text-xs">
              Vence: {formatDateVE(batch.expiry_date)}
            </TableCell>
            <TableCell className="text-xs" colSpan={2}>
              {batch.supplier_id ? `Proveedor: ${batch.supplier_id.slice(0, 8)}...` : ""}
            </TableCell>
            <TableCell className="text-right text-xs font-medium">
              {batch.quantity_available}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bs.classes}`}>
                {bs.label}
              </span>
            </TableCell>
            <TableCell />
          </TableRow>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function InventarioPage() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(36);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "">("");
  const [stockFilter, setStockFilter] = useState<"todos" | "normal" | "bajo" | "agotado">("todos");
  const [prescriptionFilter, setPrescriptionFilter] = useState<boolean | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductWithStock | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductWithStock | null>(null);

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Init
  useEffect(() => {
    getCurrentPharmacyId().then((id) => setPharmacyId(id));
    fetchExchangeRate().then(setExchangeRate);
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const filters: ProductFilters = {
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        stockStatus: stockFilter,
        requiresPrescription: prescriptionFilter,
        isActive: true,
        page,
        pageSize,
      };
      const result = await fetchProducts(pharmacyId, filters);
      setProducts(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error("Error cargando inventario:", err);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId, searchTerm, categoryFilter, stockFilter, prescriptionFilter, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, stockFilter, prescriptionFilter]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Compute stats
  const totalProducts = totalCount;
  const lowStockCount = products.filter((p) => p.stock_status === "bajo").length;
  const outOfStockCount = products.filter((p) => p.stock_status === "agotado").length;
  const inventoryValueUsd = products.reduce(
    (sum, p) => sum + p.price_usd * p.total_stock,
    0
  );
  const inventoryValueBs = inventoryValueUsd * exchangeRate;

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  // No pharmacy
  if (!pharmacyId && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            No se encontro una farmacia asociada
          </p>
          <p className="text-sm text-muted-foreground">
            Verifica que tu cuenta este vinculada a una farmacia.
          </p>
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
              <h1 className="text-3xl font-bold">Inventario</h1>
              <p className="text-muted-foreground">
                Gestion de medicamentos y productos
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditProduct(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total productos</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bajo stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agotados</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                </div>
                <Package className="h-8 w-8 text-red-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor inventario</p>
                  <p className="text-2xl font-bold">{formatUSD(inventoryValueUsd)}</p>
                  <p className="text-xs text-muted-foreground">{formatBs(inventoryValueBs)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, generico, codigo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | "")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas las categorias</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as "todos" | "normal" | "bajo" | "agotado")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {STOCK_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  setPrescriptionFilter((prev) =>
                    prev === null ? true : prev === true ? false : null
                  )
                }
                className={`flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm transition-colors ${
                  prescriptionFilter === true
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : prescriptionFilter === false
                    ? "border-gray-400 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    : "border-input bg-background text-muted-foreground"
                }`}
              >
                <Pill className="h-4 w-4" />
                {prescriptionFilter === true
                  ? "Con receta"
                  : prescriptionFilter === false
                  ? "Sin receta"
                  : "Receta: Todos"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {products.length} producto{products.length !== 1 ? "s" : ""}
                {totalCount > products.length && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    de {totalCount} en total
                  </span>
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  {searchTerm || categoryFilter || stockFilter !== "todos" || prescriptionFilter !== null
                    ? "No se encontraron productos con los filtros aplicados"
                    : "No hay productos en el inventario"}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  {!searchTerm && !categoryFilter && stockFilter === "todos" && prescriptionFilter === null
                    ? "Agrega tu primer producto para empezar a gestionar tu inventario."
                    : "Prueba ajustando los filtros de busqueda."}
                </p>
                {!searchTerm && !categoryFilter && stockFilter === "todos" && prescriptionFilter === null && (
                  <Button
                    onClick={() => {
                      setEditProduct(null);
                      setFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar primer producto
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8" />
                        <TableHead>Codigo</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Precio USD</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const isExpanded = expandedRows.has(product.id);
                        const badge = getStockStatusBadge(product.stock_status);
                        return (
                          <>
                            <TableRow
                              key={product.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => toggleRow(product.id)}
                            >
                              <TableCell className="w-8">
                                {product.batches.length > 0 && (
                                  isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm text-muted-foreground">
                                  {product.internal_code || "--"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium flex items-center gap-1.5">
                                    {product.name}
                                    {product.requires_prescription && (
                                      <Pill className="h-3.5 w-3.5 text-blue-500" title="Requiere receta" />
                                    )}
                                    {product.is_controlled && (
                                      <ShieldAlert className="h-3.5 w-3.5 text-red-500" title="Controlado" />
                                    )}
                                    {product.is_refrigerated && (
                                      <Thermometer className="h-3.5 w-3.5 text-cyan-500" title="Refrigerado" />
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {[product.presentation, product.concentration]
                                      .filter(Boolean)
                                      .join(" - ") || product.manufacturer || ""}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {CATEGORY_LABELS[product.category]}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{formatUSD(product.price_usd)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatBs(product.price_usd * exchangeRate)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-medium">{product.total_stock}</span>
                                  {product.stock_status === "bajo" && (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.classes}`}>
                                  {badge.label}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Editar"
                                    onClick={() => {
                                      setEditProduct(product);
                                      setFormOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Ver detalle"
                                    onClick={() => setDetailProduct(product)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {isExpanded && product.batches.length > 0 && (
                              <BatchRows key={`batches-${product.id}`} batches={product.batches} />
                            )}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Pagina {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {pharmacyId && (
        <ProductFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          product={editProduct}
          pharmacyId={pharmacyId}
          exchangeRate={exchangeRate}
          onSaved={loadProducts}
        />
      )}
      <ProductDetailDialog
        open={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
        exchangeRate={exchangeRate}
      />
    </div>
  );
}
