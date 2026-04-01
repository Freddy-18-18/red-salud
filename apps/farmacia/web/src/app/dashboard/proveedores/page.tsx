"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  FileText,
  ChevronRight,
  X,
  Save,
  Truck,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Clock,
  ShoppingCart,
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
  type Supplier,
  type SupplierFormData,
  VENEZUELAN_STATES,
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
  getSupplierOrders,
  getSupplierProducts,
} from "@/lib/services/supplier-service";

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

// ---------------------------------------------------------------------------
// Supplier Form Dialog
// ---------------------------------------------------------------------------

const EMPTY_FORM: SupplierFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Venezuela",
  tax_id: "",
  bank_account: "",
  contact_person: "",
  contact_phone: "",
  payment_terms: "",
  is_active: true,
};

function SupplierFormDialog({
  open,
  onClose,
  supplier,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<SupplierFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [rifError, setRifError] = useState("");

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        city: supplier.city || "",
        country: supplier.country || "Venezuela",
        tax_id: supplier.tax_id || "",
        bank_account: supplier.bank_account || "",
        contact_person: supplier.contact_person || "",
        contact_phone: supplier.contact_phone || "",
        payment_terms: supplier.payment_terms || "",
        is_active: supplier.is_active ?? true,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setRifError("");
  }, [supplier, open]);

  const validateRIF = (rif: string): boolean => {
    if (!rif) return true;
    const rifPattern = /^[JGVEP]-\d{8}-\d$/;
    return rifPattern.test(rif);
  };

  const handleSubmit = async () => {
    if (form.tax_id && !validateRIF(form.tax_id)) {
      setRifError("Formato invalido. Ej: J-12345678-9");
      return;
    }
    setRifError("");
    setSaving(true);

    let result;
    if (supplier) {
      result = await updateSupplier(supplier.id, form);
    } else {
      result = await createSupplier(form);
    }

    setSaving(false);
    if (result) {
      onSaved();
      onClose();
    } else {
      alert("Error al guardar el proveedor");
    }
  };

  const updateField = (field: keyof SupplierFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Editar Proveedor" : "Agregar Proveedor"}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? "Modifica los datos del proveedor"
              : "Registra un nuevo proveedor"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Company info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la empresa *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Ej: Farmalogistica S.A."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">RIF</Label>
              <Input
                id="tax_id"
                value={form.tax_id}
                onChange={(e) => {
                  updateField("tax_id", e.target.value);
                  setRifError("");
                }}
                placeholder="J-12345678-9"
              />
              {rifError && (
                <p className="text-xs text-destructive">{rifError}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Persona de contacto</Label>
              <Input
                id="contact_person"
                value={form.contact_person}
                onChange={(e) => updateField("contact_person", e.target.value)}
                placeholder="Juan Perez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefono contacto</Label>
              <Input
                id="contact_phone"
                value={form.contact_phone}
                onChange={(e) => updateField("contact_phone", e.target.value)}
                placeholder="+58-212-5551234"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono empresa</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+58-212-5551234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="ventas@empresa.com"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Direccion</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Av. Libertador, Edif. Centro..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Caracas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Estado</Label>
              <select
                id="country"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar estado...</option>
                {VENEZUELAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Condiciones de pago</Label>
              <Input
                id="payment_terms"
                value={form.payment_terms}
                onChange={(e) => updateField("payment_terms", e.target.value)}
                placeholder="Ej: 30 dias, contado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account">Cuenta bancaria</Label>
              <Input
                id="bank_account"
                value={form.bank_account}
                onChange={(e) => updateField("bank_account", e.target.value)}
                placeholder="0102-0000-00-0000000000"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => updateField("is_active", !form.is_active)}
              className="flex items-center gap-2"
            >
              {form.is_active ? (
                <ToggleRight className="h-6 w-6 text-green-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {form.is_active ? "Activo" : "Inactivo"}
              </span>
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !form.name}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : supplier ? "Actualizar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Supplier Detail Dialog
// ---------------------------------------------------------------------------

function SupplierDetailDialog({
  open,
  onClose,
  supplier,
}: {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}) {
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      po_number: string;
      order_date: string;
      status: string;
      total_usd: number;
    }>
  >([]);
  const [products, setProducts] = useState<
    Array<{
      product_name: string;
      lot_number: string;
      quantity_received: number;
      expiration_date: string;
    }>
  >([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (supplier && open) {
      setLoadingDetail(true);
      Promise.all([
        getSupplierOrders(supplier.id),
        getSupplierProducts(supplier.id),
      ]).then(([o, p]) => {
        setOrders(o);
        setProducts(p);
        setLoadingDetail(false);
      });
    }
  }, [supplier, open]);

  if (!supplier) return null;

  const totalPurchases = orders.reduce((sum, o) => sum + (o.total_usd || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalPurchases / orders.length : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {supplier.name}
          </DialogTitle>
          <DialogDescription>
            {supplier.tax_id ? `RIF: ${supplier.tax_id}` : "Detalle del proveedor"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Contacto</p>
              <p className="text-sm font-medium">
                {supplier.contact_person || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Telefono</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {supplier.phone || supplier.contact_phone || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {supplier.email || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ubicacion</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[supplier.city, supplier.country].filter(Boolean).join(", ") ||
                  "—"}
              </p>
            </div>
          </div>

          {/* Payment & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Total compras
                </p>
                <p className="text-xl font-bold">{formatUSD(totalPurchases)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  Ordenes
                </p>
                <p className="text-xl font-bold">{orders.length}</p>
                <p className="text-xs text-muted-foreground">
                  Promedio: {formatUSD(avgOrderValue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Condiciones
                </p>
                <p className="text-xl font-bold">
                  {supplier.payment_terms || "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Historial de ordenes
            </h4>
            {loadingDetail ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin ordenes registradas
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Orden</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 10).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.po_number}
                        </TableCell>
                        <TableCell>{formatDateVE(order.order_date)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatUSD(order.total_usd)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Products supplied */}
          {products.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Productos suministrados
              </h4>
              <div className="space-y-1">
                {products.slice(0, 10).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-1.5 px-3 rounded bg-muted/40"
                  >
                    <span>{p.product_name}</span>
                    <span className="text-muted-foreground text-xs">
                      Lote {p.lot_number} | Qty {p.quantity_received} | Vence{" "}
                      {formatDateVE(p.expiration_date)}
                    </span>
                  </div>
                ))}
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
// Main Page
// ---------------------------------------------------------------------------

export default function ProveedoresPage() {
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  const loadProveedores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSuppliers({
        search: searchTerm || undefined,
        isActive: selectedEstado || undefined,
      });
      setProveedores(data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedEstado]);

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const handleDeactivate = async (supplier: Supplier) => {
    if (!confirm(`Desactivar proveedor "${supplier.name}"?`)) return;
    const success = await deactivateSupplier(supplier.id);
    if (success) {
      loadProveedores();
    } else {
      alert("Error al desactivar el proveedor");
    }
  };

  // Stats
  const activeCount = proveedores.filter((p) => p.is_active).length;
  const inactiveCount = proveedores.filter((p) => !p.is_active).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando proveedores...</p>
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
              <h1 className="text-3xl font-bold">Proveedores</h1>
              <p className="text-muted-foreground">
                Gestion de proveedores y relaciones comerciales
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditSupplier(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Proveedor
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{proveedores.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeCount}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-500">
                    {inactiveCount}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, RIF o contacto..."
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
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Cards Grid */}
        {proveedores.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Building2 className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  No hay proveedores registrados
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Agrega proveedores para gestionar tus ordenes de compra y
                  mantener un registro de relaciones comerciales.
                </p>
                <Button
                  onClick={() => {
                    setEditSupplier(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer proveedor
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {proveedores.map((proveedor) => (
              <Card
                key={proveedor.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setDetailSupplier(proveedor)}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {proveedor.name}
                      </h3>
                      {proveedor.tax_id && (
                        <p className="text-xs text-muted-foreground">
                          RIF: {proveedor.tax_id}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={proveedor.is_active ? "default" : "secondary"}
                      className={
                        proveedor.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }
                    >
                      {proveedor.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1.5 mb-3">
                    {proveedor.contact_person && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-muted-foreground text-xs w-16 shrink-0">
                          Contacto
                        </span>
                        <span className="truncate">
                          {proveedor.contact_person}
                        </span>
                      </p>
                    )}
                    {(proveedor.phone || proveedor.contact_phone) && (
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {proveedor.contact_phone || proveedor.phone}
                        </span>
                      </p>
                    )}
                    {proveedor.email && (
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{proveedor.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      {proveedor.payment_terms && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {proveedor.payment_terms}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {proveedor.last_order_date && (
                        <span className="text-xs text-muted-foreground">
                          Ultimo pedido: {formatDateVE(proveedor.last_order_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex justify-end gap-1 mt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Editar"
                      onClick={() => {
                        setEditSupplier(proveedor);
                        setFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Ver detalle"
                      onClick={() => setDetailSupplier(proveedor)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {proveedor.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Desactivar"
                        onClick={() => handleDeactivate(proveedor)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SupplierFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        supplier={editSupplier}
        onSaved={loadProveedores}
      />
      <SupplierDetailDialog
        open={detailSupplier !== null}
        onClose={() => setDetailSupplier(null)}
        supplier={detailSupplier}
      />
    </div>
  );
}
