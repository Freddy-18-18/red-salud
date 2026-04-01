'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  ShieldAlert,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { Badge } from '@red-salud/design-system';
import {
  Card,
  CardContent,
} from '@red-salud/design-system';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { Input } from '@red-salud/design-system';
import {
  type BatchWithProduct,
  type ExpirySummary,
  type ExpiryTab,
  type BatchAction,
  fetchBatchesWithExpiry,
  fetchExpirySummary,
  executeBatchAction,
} from '@/lib/services/batch-service';
import { getCurrentPharmacyId } from '@/lib/services/settings-service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateVE(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const TAB_CONFIG: { key: ExpiryTab; label: string; color: string }[] = [
  { key: 'expired', label: 'Vencidos', color: 'text-red-600' },
  { key: 'next30', label: 'Proximos 30 dias', color: 'text-orange-600' },
  { key: 'next90', label: 'Proximos 90 dias', color: 'text-yellow-600' },
  { key: 'all', label: 'Todos', color: 'text-foreground' },
];

function expiryRowClass(status: string): string {
  switch (status) {
    case 'expired':
      return 'bg-red-50 dark:bg-red-950/20';
    case 'critical':
      return 'bg-orange-50 dark:bg-orange-950/20';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-950/20';
    default:
      return '';
  }
}

function expiryBadge(status: string) {
  switch (status) {
    case 'expired':
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          Vencido
        </Badge>
      );
    case 'critical':
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
          Critico
        </Badge>
      );
    case 'warning':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          Proximo
        </Badge>
      );
    default:
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Sano
        </Badge>
      );
  }
}

// ---------------------------------------------------------------------------
// Action Dialog
// ---------------------------------------------------------------------------

function BatchActionDialog({
  open,
  onClose,
  batch,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  batch: BatchWithProduct | null;
  onDone: () => void;
}) {
  const [action, setAction] = useState<BatchAction>('mark_damaged');
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (batch) {
      setQuantity(String(batch.quantity_available));
      setAction('mark_damaged');
    }
  }, [batch]);

  if (!batch) return null;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await executeBatchAction(batch.id, action, Number(quantity) || undefined);
      onDone();
      onClose();
    } catch (err) {
      console.error('Error ejecutando accion:', err);
      alert('Error al procesar la accion sobre el lote');
    } finally {
      setSaving(false);
    }
  };

  const ACTION_LABELS: Record<BatchAction, string> = {
    mark_damaged: 'Marcar como danado',
    return_supplier: 'Devolver a proveedor',
    withdraw: 'Retirar del inventario',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Accion sobre lote</DialogTitle>
          <DialogDescription>
            {batch.product_name} — Lote {batch.batch_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Accion</Label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as BatchAction)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(ACTION_LABELS) as BatchAction[]).map((k) => (
                <option key={k} value={k}>
                  {ACTION_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          {action !== 'withdraw' && (
            <div className="space-y-2">
              <Label>Cantidad (disponible: {batch.quantity_available})</Label>
              <Input
                type="number"
                min={1}
                max={batch.quantity_available}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CaducidadesPage() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ExpiryTab>('expired');
  const [batches, setBatches] = useState<BatchWithProduct[]>([]);
  const [summary, setSummary] = useState<ExpirySummary>({
    expired: 0,
    next30Days: 0,
    next90Days: 0,
    healthy: 0,
  });
  const [actionBatch, setActionBatch] = useState<BatchWithProduct | null>(null);

  // Init
  useEffect(() => {
    getCurrentPharmacyId().then((id) => {
      setPharmacyId(id);
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const [batchData, summaryData] = await Promise.all([
        fetchBatchesWithExpiry(pharmacyId, activeTab),
        fetchExpirySummary(pharmacyId),
      ]);
      setBatches(batchData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error cargando caducidades:', err);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Summary cards config
  const summaryCards = [
    {
      label: 'Vencidos',
      value: summary.expired,
      icon: XCircle,
      bg: 'bg-red-50 dark:bg-red-950/30',
      text: 'text-red-600',
      iconColor: 'text-red-500',
    },
    {
      label: 'Proximos 30 dias',
      value: summary.next30Days,
      icon: AlertTriangle,
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      text: 'text-orange-600',
      iconColor: 'text-orange-500',
    },
    {
      label: 'Proximos 90 dias',
      value: summary.next90Days,
      icon: Clock,
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      text: 'text-yellow-600',
      iconColor: 'text-yellow-500',
    },
    {
      label: 'Stock sano',
      value: summary.healthy,
      icon: CheckCircle2,
      bg: 'bg-green-50 dark:bg-green-950/30',
      text: 'text-green-600',
      iconColor: 'text-green-500',
    },
  ];

  if (loading && batches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando caducidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-3xl font-bold">Control de Caducidades</h1>
            <p className="text-muted-foreground">
              Seguimiento de vencimientos por lote — FEFO (First Expired, First
              Out)
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className={card.bg}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                    <p className={`text-2xl font-bold ${card.text}`}>
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground">lotes</p>
                  </div>
                  <card.icon className={`h-8 w-8 ${card.iconColor} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? `${tab.color} border-current`
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/30'
              }`}
            >
              {tab.label}
              {tab.key === 'expired' && summary.expired > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs font-semibold dark:bg-red-900 dark:text-red-300">
                  {summary.expired}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {batches.length === 0 ? (
              <div className="text-center py-16">
                <ShieldAlert className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  {activeTab === 'expired'
                    ? 'No hay lotes vencidos'
                    : activeTab === 'next30'
                      ? 'No hay lotes proximos a vencer en 30 dias'
                      : activeTab === 'next90'
                        ? 'No hay lotes proximos a vencer en 90 dias'
                        : 'No hay lotes con stock disponible'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'expired'
                    ? 'Excelente, no tienes productos vencidos.'
                    : 'Tu inventario esta en buen estado.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                      <TableHead className="text-right">
                        Cant. Disponible
                      </TableHead>
                      <TableHead className="text-right">
                        Dias Restantes
                      </TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow
                        key={batch.id}
                        className={expiryRowClass(batch.expiry_status)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{batch.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {[
                                batch.product_presentation,
                                batch.product_concentration,
                              ]
                                .filter(Boolean)
                                .join(' — ') || batch.product_manufacturer || ''}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <code className="text-sm">{batch.batch_number}</code>
                            {batch.is_fefo_priority && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0"
                              >
                                FEFO
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDateVE(batch.expiry_date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {batch.quantity_available}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              batch.days_until_expiry < 0
                                ? 'text-red-600 font-semibold'
                                : batch.days_until_expiry <= 30
                                  ? 'text-orange-600 font-semibold'
                                  : batch.days_until_expiry <= 90
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                            }
                          >
                            {batch.days_until_expiry < 0
                              ? `${Math.abs(batch.days_until_expiry)}d vencido`
                              : `${batch.days_until_expiry}d`}
                          </span>
                        </TableCell>
                        <TableCell>{expiryBadge(batch.expiry_status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Marcar danado"
                              onClick={() => setActionBatch(batch)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Devolver a proveedor"
                              onClick={() => {
                                setActionBatch(batch);
                              }}
                            >
                              <RotateCcw className="h-4 w-4 text-blue-500" />
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

      {/* Action dialog */}
      <BatchActionDialog
        open={actionBatch !== null}
        onClose={() => setActionBatch(null)}
        batch={actionBatch}
        onDone={loadData}
      />
    </div>
  );
}
