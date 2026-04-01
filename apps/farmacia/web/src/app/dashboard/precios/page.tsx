'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Search,
  Edit,
  Save,
  X,
  Percent,
  Package,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { Input } from '@red-salud/design-system';
import { Badge } from '@red-salud/design-system';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@red-salud/design-system';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@red-salud/design-system';
import { Label } from '@red-salud/design-system';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@red-salud/design-system';
import {
  type PharmacyProduct,
  fetchProducts,
  updateProduct,
  fetchExchangeRate,
} from '@/lib/services/inventory-service';
import { getCurrentPharmacyId } from '@/lib/services/settings-service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUSD(amount: number | null | undefined): string {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatBs(amount: number | null | undefined): string {
  if (amount == null) return 'Bs 0,00';
  return `Bs ${new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

// ---------------------------------------------------------------------------
// Bulk Price Update Dialog
// ---------------------------------------------------------------------------

function BulkPriceDialog({
  open,
  onClose,
  pharmacyId,
  products,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  pharmacyId: string;
  products: PharmacyProduct[];
  onDone: () => void;
}) {
  const [percent, setPercent] = useState('');
  const [direction, setDirection] = useState<'increase' | 'decrease'>(
    'increase'
  );
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setPercent('');
      setDirection('increase');
      setProgress(0);
    }
  }, [open]);

  const handleApply = async () => {
    const pct = Number(percent);
    if (!pct || pct <= 0) return;
    if (
      !confirm(
        `¿${direction === 'increase' ? 'Aumentar' : 'Disminuir'} precios en ${pct}% para ${products.length} productos?`
      )
    )
      return;

    setSaving(true);
    const factor = direction === 'increase' ? 1 + pct / 100 : 1 - pct / 100;

    let processed = 0;
    for (const product of products) {
      try {
        await updateProduct(product.id, {
          price_usd: Math.round(product.price_usd * factor * 100) / 100,
          price_bs: Math.round(product.price_bs * factor * 100) / 100,
        });
      } catch (err) {
        console.error(`Error updating ${product.name}:`, err);
      }
      processed++;
      setProgress(Math.round((processed / products.length) * 100));
    }

    setSaving(false);
    onDone();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuste Masivo de Precios</DialogTitle>
          <DialogDescription>
            Aplicar un cambio porcentual a todos los productos listados (
            {products.length} productos)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de ajuste</Label>
            <select
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as 'increase' | 'decrease')
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="increase">Aumentar precios</option>
              <option value="decrease">Disminuir precios</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Porcentaje (%)</Label>
            <Input
              type="number"
              min={0.1}
              max={100}
              step={0.5}
              placeholder="Ej: 5"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </div>

          {saving && (
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {progress}% completado
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={saving || !percent || Number(percent) <= 0}
          >
            <Percent className="h-4 w-4 mr-2" />
            {saving ? 'Aplicando...' : 'Aplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Inline Edit Price
// ---------------------------------------------------------------------------

function EditablePrice({
  product,
  exchangeRate,
  onSaved,
}: {
  product: PharmacyProduct;
  exchangeRate: number;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [priceUsd, setPriceUsd] = useState(String(product.price_usd));
  const [priceBs, setPriceBs] = useState(String(product.price_bs));
  const [saving, setSaving] = useState(false);

  const handleUsdChange = (val: string) => {
    setPriceUsd(val);
    const numVal = Number(val);
    if (numVal > 0) {
      setPriceBs(String(Math.round(numVal * exchangeRate * 100) / 100));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProduct(product.id, {
        price_usd: Number(priceUsd),
        price_bs: Number(priceBs),
      });
      onSaved();
      setEditing(false);
    } catch (err) {
      alert('Error al actualizar el precio');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="font-medium">{formatUSD(product.price_usd)}</p>
          <p className="text-xs text-muted-foreground">
            {formatBs(product.price_bs)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPriceUsd(String(product.price_usd));
            setPriceBs(String(product.price_bs));
            setEditing(true);
          }}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="space-y-1">
        <Input
          type="number"
          step={0.01}
          value={priceUsd}
          onChange={(e) => handleUsdChange(e.target.value)}
          className="h-8 w-24 text-sm"
        />
        <p className="text-[10px] text-muted-foreground text-right">
          {formatBs(Number(priceBs))}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={saving}
      >
        <Save className="h-3.5 w-3.5 text-green-600" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PreciosPage() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [exchangeRate, setExchangeRate] = useState(36);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    getCurrentPharmacyId().then((id) => setPharmacyId(id));
    fetchExchangeRate().then(setExchangeRate);
  }, []);

  const loadProducts = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const result = await fetchProducts(pharmacyId, {
        search: searchTerm || undefined,
        isActive: true,
        page,
        pageSize,
      });
      setProducts(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId, searchTerm, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando precios...</p>
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
              <h1 className="text-3xl font-bold">Gestion de Precios</h1>
              <p className="text-muted-foreground">
                Ajusta precios individuales o masivamente — Tasa BCV: Bs{' '}
                {exchangeRate.toFixed(2)}/USD
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  fetchExchangeRate().then((r) => setExchangeRate(r))
                }
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Tasa
              </Button>
              <Button size="sm" onClick={() => setBulkOpen(true)}>
                <Percent className="h-4 w-4 mr-2" />
                Ajuste Masivo
              </Button>
            </div>
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
                  <p className="text-sm text-muted-foreground">
                    Productos activos
                  </p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
                <Package className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasa BCV</p>
                  <p className="text-2xl font-bold">
                    Bs {exchangeRate.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pagina</p>
                  <p className="text-2xl font-bold">
                    {page}/{totalPages || 1}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto por nombre, generico o codigo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products table */}
        <Card>
          <CardContent className="pt-6">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground">
                  No se encontraron productos
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Costo USD</TableHead>
                        <TableHead>Margen</TableHead>
                        <TableHead className="text-right">
                          Precio de Venta
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const margin =
                          product.cost_usd && product.price_usd > 0
                            ? (
                                ((product.price_usd - product.cost_usd) /
                                  product.price_usd) *
                                100
                              ).toFixed(1)
                            : '—';
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {[
                                    product.presentation,
                                    product.concentration,
                                  ]
                                    .filter(Boolean)
                                    .join(' — ') || product.generic_name || ''}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {product.cost_usd != null
                                ? formatUSD(product.cost_usd)
                                : '—'}
                            </TableCell>
                            <TableCell>
                              {margin !== '—' ? (
                                <span
                                  className={`font-medium ${
                                    Number(margin) >= 30
                                      ? 'text-green-600'
                                      : Number(margin) >= 15
                                        ? 'text-yellow-600'
                                        : 'text-red-600'
                                  }`}
                                >
                                  {margin}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <EditablePrice
                                  product={product}
                                  exchangeRate={exchangeRate}
                                  onSaved={loadProducts}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {(page - 1) * pageSize + 1} -{' '}
                      {Math.min(page * pageSize, totalCount)} de {totalCount}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
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

      {/* Bulk dialog */}
      <BulkPriceDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        pharmacyId={pharmacyId || ''}
        products={products}
        onDone={loadProducts}
      />
    </div>
  );
}
