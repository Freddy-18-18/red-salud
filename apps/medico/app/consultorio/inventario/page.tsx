"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Package, QrCode, AlertTriangle, Plus, Search, ArrowLeft,
  ScanLine, TrendingDown, Calendar, BarChart3, Filter,
  ArrowUpDown, CheckCircle2, XCircle
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge, Input
} from "@red-salud/design-system";
import Link from "next/link";
import type { InventoryItem } from "@/types/dental";

// ─── Demo Inventory ──────────────────────────────────────────────────────────
const DEMO_ITEMS: InventoryItem[] = [
  { id: "inv-1", name: "Composite A2 (Jeringa 4g)", sku: "COM-A2-4G", barcode: "7501234567890", category: "Restaurativo", currentStock: 12, minStock: 5, maxStock: 30, unitCost: 18.50, supplier: "3M ESPE", location: "Estante A-3", expirationDate: "2027-06-15", lotNumber: "LOT2026A", lastRestocked: "2026-01-15" },
  { id: "inv-2", name: "Anestesia Lidocaína 2% c/epi", sku: "ANE-LID-2E", barcode: "7501234567891", category: "Anestésicos", currentStock: 3, minStock: 10, maxStock: 50, unitCost: 4.20, supplier: "DFL", location: "Refrigerador 1", expirationDate: "2026-08-30", lotNumber: "LOT2025X", lastRestocked: "2025-12-01" },
  { id: "inv-3", name: "Guantes Nitrilo M (Caja x100)", sku: "GUA-NIT-M", barcode: "7501234567892", category: "Desechables", currentStock: 25, minStock: 10, maxStock: 50, unitCost: 8.00, supplier: "Medline", location: "Almacén B-1", expirationDate: "2028-12-31", lotNumber: "LOT2026B" },
  { id: "inv-4", name: "Ácido grabador 37% (Jeringa)", sku: "ACI-GRA-37", barcode: "7501234567893", category: "Restaurativo", currentStock: 8, minStock: 5, maxStock: 20, unitCost: 5.50, supplier: "Ivoclar", location: "Estante A-3", expirationDate: "2026-03-10", lotNumber: "LOT2025Y", lastRestocked: "2025-11-20" },
  { id: "inv-5", name: "Adhesivo Universal (5ml)", sku: "ADH-UNI-5", barcode: "7501234567894", category: "Restaurativo", currentStock: 6, minStock: 3, maxStock: 15, unitCost: 32.00, supplier: "3M ESPE", location: "Estante A-4", expirationDate: "2027-01-20", lotNumber: "LOT2026C" },
  { id: "inv-6", name: "Algodón rollos (Bolsa x500)", sku: "ALG-ROL-500", barcode: "7501234567895", category: "Desechables", currentStock: 45, minStock: 10, maxStock: 60, unitCost: 3.00, supplier: "Medimart", location: "Almacén B-2", lotNumber: "LOT2026D" },
  { id: "inv-7", name: "Cemento ionómero vidrio", sku: "CEM-ION-VID", barcode: "7501234567896", category: "Restaurativo", currentStock: 0, minStock: 2, maxStock: 10, unitCost: 22.00, supplier: "GC America", location: "Estante A-5", expirationDate: "2027-04-15", lotNumber: "LOT2025Z" },
  { id: "inv-8", name: "Fresa diamante redonda FG", sku: "FRE-DIA-RD", barcode: "7501234567897", category: "Instrumental", currentStock: 15, minStock: 5, maxStock: 30, unitCost: 2.50, supplier: "SS White", location: "Gaveta C-1" },
  { id: "inv-9", name: "Hilo retractor #00", sku: "HIL-RET-00", barcode: "7501234567898", category: "Prostodoncia", currentStock: 4, minStock: 3, maxStock: 12, unitCost: 12.00, supplier: "Ultrapak", location: "Estante D-2", expirationDate: "2027-09-30", lotNumber: "LOT2026E" },
  { id: "inv-10", name: "Hipoclorito de sodio 5.25%", sku: "HIP-SOD-5", barcode: "7501234567899", category: "Endodoncia", currentStock: 7, minStock: 3, maxStock: 15, unitCost: 6.00, supplier: "Clorox Dental", location: "Estante D-3", expirationDate: "2026-05-01", lotNumber: "LOT2026F" },
];

const CATEGORIES = [...new Set(DEMO_ITEMS.map((i) => i.category))];

type SortField = "name" | "currentStock" | "expirationDate";

export default function InventoryPage() {
  const [items, setItems] = useState(DEMO_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAlert, setFilterAlert] = useState<"all" | "low" | "out" | "expiring">("all");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string>("");

  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const enriched = useMemo(() => {
    return items.map((item) => {
      const minStk = item.minStock ?? item.minimumStock ?? 0;
      const maxStk = item.maxStock ?? item.maximumStock ?? 0;
      const isLowStock = item.currentStock > 0 && item.currentStock <= minStk;
      const isOutOfStock = item.currentStock === 0;
      const isExpiringSoon = item.expirationDate && new Date(item.expirationDate) <= thirtyDays && new Date(item.expirationDate) > today;
      const isExpired = item.expirationDate && new Date(item.expirationDate) <= today;
      const stockPercent = maxStk > 0 ? (item.currentStock / maxStk) * 100 : 0;
      return { ...item, isLowStock, isOutOfStock, isExpiringSoon, isExpired, stockPercent };
    });
  }, [items]);

  const filtered = useMemo(() => {
    return enriched
      .filter((item) => {
        const matchSearch = !searchTerm ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.barcode && item.barcode.includes(searchTerm));
        const matchCat = filterCategory === "all" || item.category === filterCategory;
        const matchAlert =
          filterAlert === "all" ||
          (filterAlert === "low" && item.isLowStock) ||
          (filterAlert === "out" && item.isOutOfStock) ||
          (filterAlert === "expiring" && (item.isExpiringSoon || item.isExpired));
        return matchSearch && matchCat && matchAlert;
      })
      .sort((a, b) => {
        if (sortBy === "currentStock") return a.currentStock - b.currentStock;
        if (sortBy === "expirationDate") {
          const da = a.expirationDate ? new Date(a.expirationDate).getTime() : Infinity;
          const db = b.expirationDate ? new Date(b.expirationDate).getTime() : Infinity;
          return da - db;
        }
        return a.name.localeCompare(b.name);
      });
  }, [enriched, searchTerm, filterCategory, filterAlert, sortBy]);

  const stats = useMemo(() => ({
    total: items.length,
    lowStock: enriched.filter((i) => i.isLowStock).length,
    outOfStock: enriched.filter((i) => i.isOutOfStock).length,
    expiringSoon: enriched.filter((i) => i.isExpiringSoon || i.isExpired).length,
    totalValue: items.reduce((s, i) => s + i.currentStock * i.unitCost, 0),
  }), [items, enriched]);

  const handleScan = () => {
    // Simulate scanner result
    const found = items.find((i) => i.barcode === scanResult);
    if (found) {
      setSearchTerm(found.sku);
    }
    setShowScanner(false);
  };

  const adjustStock = (itemId: string, delta: number) => {
    setItems((prev) => prev.map((i) => {
      if (i.id !== itemId) return i;
      return { ...i, currentStock: Math.max(0, i.currentStock + delta) };
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/consultorio">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              Inventario Clínico
            </h1>
            <p className="text-sm text-muted-foreground">Control de insumos con código de barras y niveles PAR</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>
            <ScanLine className="w-4 h-4 mr-1" />Escanear
          </Button>
          <Button size="sm"><Plus className="w-4 h-4 mr-1" />Agregar Insumo</Button>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <Card className="border-primary">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">Escanear código de barras</span>
            </div>
            <div className="flex gap-2">
              <Input value={scanResult} onChange={(e) => setScanResult(e.target.value)} placeholder="Ingrese o escanee el código de barras..." className="flex-1" />
              <Button onClick={handleScan}>Buscar</Button>
              <Button variant="ghost" onClick={() => setShowScanner(false)}>Cerrar</Button>
            </div>
            <p className="text-xs text-muted-foreground">Conecte un lector de código de barras USB para escaneo automático.</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="pt-3 pb-3"><p className="text-xs text-muted-foreground">Total items</p><p className="text-xl font-bold">{stats.total}</p></CardContent></Card>
        <Card className={cn(stats.lowStock > 0 && "border-amber-300")}>
          <CardContent className="pt-3 pb-3 cursor-pointer" onClick={() => setFilterAlert(filterAlert === "low" ? "all" : "low")}>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingDown className="w-3 h-3 text-amber-500" />Stock bajo</p>
            <p className={cn("text-xl font-bold", stats.lowStock > 0 && "text-amber-600")}>{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card className={cn(stats.outOfStock > 0 && "border-red-300")}>
          <CardContent className="pt-3 pb-3 cursor-pointer" onClick={() => setFilterAlert(filterAlert === "out" ? "all" : "out")}>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" />Agotados</p>
            <p className={cn("text-xl font-bold", stats.outOfStock > 0 && "text-red-600")}>{stats.outOfStock}</p>
          </CardContent>
        </Card>
        <Card className={cn(stats.expiringSoon > 0 && "border-orange-300")}>
          <CardContent className="pt-3 pb-3 cursor-pointer" onClick={() => setFilterAlert(filterAlert === "expiring" ? "all" : "expiring")}>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3 text-orange-500" />Por vencer</p>
            <p className={cn("text-xl font-bold", stats.expiringSoon > 0 && "text-orange-600")}>{stats.expiringSoon}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-muted-foreground">Valor total</p>
            <p className="text-xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre, SKU o código de barras..." />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border rounded px-3 py-2 text-sm bg-background">
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)} className="border rounded px-3 py-2 text-sm bg-background">
          <option value="name">Nombre</option>
          <option value="currentStock">Stock (menor primero)</option>
          <option value="expirationDate">Vencimiento (próximo primero)</option>
        </select>
      </div>

      {/* Items Table */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "overflow-hidden",
              item.isOutOfStock && "border-red-300 bg-red-50/30 dark:bg-red-950/10",
              item.isLowStock && !item.isOutOfStock && "border-amber-300",
              item.isExpired && "border-orange-400"
            )}
          >
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.isOutOfStock && <Badge variant="destructive" className="text-[10px]">AGOTADO</Badge>}
                    {item.isLowStock && !item.isOutOfStock && <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Stock bajo</Badge>}
                    {item.isExpired && <Badge variant="destructive" className="text-[10px]">VENCIDO</Badge>}
                    {item.isExpiringSoon && !item.isExpired && <Badge className="text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Por vencer</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    SKU: {item.sku} • {item.category} • {item.supplier}
                    {item.location && ` • ${item.location}`}
                  </p>
                  {item.barcode && (
                    <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <QrCode className="w-3 h-3" />{item.barcode}
                      {item.lotNumber && ` • Lote: ${item.lotNumber}`}
                    </p>
                  )}
                </div>

                {/* Stock Level */}
                <div className="w-40">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Stock</span>
                    <span className="font-bold">{item.currentStock} / {item.maxStock ?? item.maximumStock ?? 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        item.stockPercent > 50 ? "bg-green-500" : item.stockPercent > 25 ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${Math.min(100, item.stockPercent)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Mín: {item.minStock ?? item.minimumStock ?? 0}</p>
                </div>

                {/* Expiration */}
                <div className="w-24 text-xs text-center">
                  {item.expirationDate ? (
                    <>
                      <p className={cn("font-medium", item.isExpired ? "text-red-600" : item.isExpiringSoon ? "text-orange-600" : "text-muted-foreground")}>
                        {item.expirationDate}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Vencimiento</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">N/A</p>
                  )}
                </div>

                {/* Cost & Actions */}
                <div className="text-right text-xs">
                  <p className="font-medium">${item.unitCost.toFixed(2)}</p>
                  <p className="text-muted-foreground">c/u</p>
                </div>

                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-xs" onClick={() => adjustStock(item.id, -1)} disabled={item.currentStock === 0}>-</Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-xs" onClick={() => adjustStock(item.id, 1)}>+</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No se encontraron insumos con los filtros aplicados.</p>
        </CardContent></Card>
      )}
    </div>
  );
}
