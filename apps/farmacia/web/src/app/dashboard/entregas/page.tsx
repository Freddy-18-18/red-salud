'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Plus,
  Search,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Save,
  DollarSign,
  Navigation,
  Edit,
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
  type Delivery,
  type DeliveryStatus,
  type DeliveryZone,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  getDeliveries,
  getDeliveryStats,
  createDelivery,
  updateDeliveryStatus,
  assignDeliveryPerson,
  getDeliveryZones,
  createDeliveryZone,
} from '@/lib/services/delivery-service';
import {
  type StaffMember,
  getStaffByRole,
} from '@/lib/services/staff-service';
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

type StatusTab = 'all' | DeliveryStatus;

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'in_transit', label: 'En transito' },
  { key: 'delivered', label: 'Entregadas' },
  { key: 'failed', label: 'Fallidas' },
];

// Next possible status transitions
const STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ['assigned', 'failed'],
  assigned: ['in_transit', 'failed'],
  in_transit: ['delivered', 'failed'],
  delivered: [],
  failed: ['pending'],
  returned: [],
};

// ---------------------------------------------------------------------------
// New Delivery Dialog
// ---------------------------------------------------------------------------

function NewDeliveryDialog({
  open,
  onClose,
  pharmacyId,
  zones,
  deliveryStaff,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  pharmacyId: string;
  zones: DeliveryZone[];
  deliveryStaff: StaffMember[];
  onSaved: () => void;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [deliveryPersonId, setDeliveryPersonId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setCustomerName('');
      setCustomerPhone('');
      setAddress('');
      setZoneId('');
      setDeliveryPersonId('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!customerName || !address) return;
    setSaving(true);
    const result = await createDelivery({
      pharmacy_id: pharmacyId,
      customer_name: customerName,
      customer_phone: customerPhone || undefined,
      delivery_address: address,
      zone_id: zoneId || undefined,
      delivery_person_id: deliveryPersonId || undefined,
      delivery_notes: notes || undefined,
    });
    setSaving(false);
    if (result) {
      onSaved();
      onClose();
    } else {
      alert('Error al crear la entrega');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Entrega</DialogTitle>
          <DialogDescription>
            Registrar una nueva entrega a domicilio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del cliente *</Label>
              <Input
                placeholder="Nombre completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input
                placeholder="+58-412-1234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Direccion de entrega *</Label>
            <Input
              placeholder="Av. Libertador, Edif. Torre..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Zona</Label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sin zona asignada</option>
                {zones
                  .filter((z) => z.is_active)
                  .map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.zone_name} (${z.delivery_fee_usd.toFixed(2)})
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Repartidor</Label>
              <select
                value={deliveryPersonId}
                onChange={(e) => setDeliveryPersonId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sin asignar</option>
                {deliveryStaff.map((s) => (
                  <option key={s.profile_id} value={s.profile_id}>
                    {s.profile?.full_name || 'Repartidor'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Input
              placeholder="Instrucciones especiales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !customerName || !address}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creando...' : 'Crear Entrega'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Zone Management Dialog
// ---------------------------------------------------------------------------

function ZoneDialog({
  open,
  onClose,
  pharmacyId,
  zones,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  pharmacyId: string;
  zones: DeliveryZone[];
  onSaved: () => void;
}) {
  const [zoneName, setZoneName] = useState('');
  const [feeUsd, setFeeUsd] = useState('');
  const [feeBs, setFeeBs] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!zoneName) return;
    setSaving(true);
    const result = await createDeliveryZone({
      pharmacy_id: pharmacyId,
      zone_name: zoneName,
      municipalities: [],
      delivery_fee_usd: Number(feeUsd) || 0,
      delivery_fee_bs: Number(feeBs) || 0,
      estimated_time_minutes: Number(estimatedMinutes) || 30,
    });
    setSaving(false);
    if (result) {
      setZoneName('');
      setFeeUsd('');
      setFeeBs('');
      setEstimatedMinutes('');
      onSaved();
    } else {
      alert('Error al crear la zona');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zonas de Entrega</DialogTitle>
          <DialogDescription>
            Configura las zonas y tarifas de entrega
          </DialogDescription>
        </DialogHeader>

        {/* Existing zones */}
        {zones.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Zonas actuales</p>
            <div className="space-y-1.5">
              {zones.map((z) => (
                <div
                  key={z.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{z.zone_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>${z.delivery_fee_usd.toFixed(2)}</span>
                    <span>{z.estimated_time_minutes} min</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        z.is_active ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {z.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new zone */}
        <div className="space-y-3 pt-3 border-t">
          <p className="text-sm font-medium">Agregar nueva zona</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nombre de zona</Label>
              <Input
                placeholder="Ej: Centro"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tiempo estimado (min)</Label>
              <Input
                type="number"
                placeholder="30"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tarifa USD</Label>
              <Input
                type="number"
                step={0.5}
                placeholder="2.00"
                value={feeUsd}
                onChange={(e) => setFeeUsd(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tarifa Bs</Label>
              <Input
                type="number"
                step={1}
                placeholder="72"
                value={feeBs}
                onChange={(e) => setFeeBs(e.target.value)}
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={saving || !zoneName}
          >
            <Plus className="h-4 w-4 mr-2" />
            {saving ? 'Creando...' : 'Agregar Zona'}
          </Button>
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
// Assign Delivery Person Dialog
// ---------------------------------------------------------------------------

function AssignDialog({
  open,
  onClose,
  delivery,
  deliveryStaff,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  delivery: Delivery | null;
  deliveryStaff: StaffMember[];
  onSaved: () => void;
}) {
  const [personId, setPersonId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (delivery?.delivery_person_id) {
      setPersonId(delivery.delivery_person_id);
    } else {
      setPersonId('');
    }
  }, [delivery]);

  if (!delivery) return null;

  const handleAssign = async () => {
    if (!personId) return;
    setSaving(true);
    const success = await assignDeliveryPerson(delivery.id, personId);
    setSaving(false);
    if (success) {
      onSaved();
      onClose();
    } else {
      alert('Error al asignar repartidor');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Asignar Repartidor</DialogTitle>
          <DialogDescription>
            Entrega para {delivery.customer_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Repartidor</Label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Seleccionar...</option>
            {deliveryStaff.map((s) => (
              <option key={s.profile_id} value={s.profile_id}>
                {s.profile?.full_name || 'Repartidor'}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={saving || !personId}>
            {saving ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function EntregasPage() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    in_transit: 0,
    delivered: 0,
    failed: 0,
    returned: 0,
    total: 0,
  });
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [deliveryStaff, setDeliveryStaff] = useState<StaffMember[]>([]);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);
  const [assignDelivery, setAssignDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    getCurrentPharmacyId().then((id) => setPharmacyId(id));
  }, []);

  const loadData = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const filter =
        activeTab === 'all' ? undefined : (activeTab as DeliveryStatus);
      const [deliveryData, statsData, zonesData, staffData] = await Promise.all(
        [
          getDeliveries(pharmacyId, filter),
          getDeliveryStats(pharmacyId),
          getDeliveryZones(pharmacyId),
          getStaffByRole(pharmacyId, 'delivery'),
        ]
      );
      setDeliveries(deliveryData);
      setStats(statsData);
      setZones(zonesData);
      setDeliveryStaff(staffData);
    } catch (err) {
      console.error('Error cargando entregas:', err);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async (
    deliveryId: string,
    newStatus: DeliveryStatus
  ) => {
    const success = await updateDeliveryStatus(deliveryId, newStatus);
    if (success) loadData();
    else alert('Error al actualizar el estado');
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.customer_name?.toLowerCase().includes(term) ||
      d.delivery_address?.toLowerCase().includes(term) ||
      d.delivery_person?.full_name?.toLowerCase().includes(term)
    );
  });

  if (loading && deliveries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando entregas...</p>
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
              <h1 className="text-3xl font-bold">Entregas a Domicilio</h1>
              <p className="text-muted-foreground">
                Gestion de entregas y zonas de cobertura
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoneOpen(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Zonas
              </Button>
              <Button
                size="sm"
                onClick={() => setNewOpen(true)}
                disabled={!pharmacyId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Entrega
              </Button>
            </div>
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
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-7 w-7 text-yellow-500/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En transito</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.in_transit + stats.assigned}
                  </p>
                </div>
                <Truck className="h-7 w-7 text-blue-500/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entregadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.delivered}
                  </p>
                </div>
                <CheckCircle2 className="h-7 w-7 text-green-500/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fallidas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.failed}
                  </p>
                </div>
                <XCircle className="h-7 w-7 text-red-500/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, direccion o repartidor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-1 border-b -mb-px">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deliveries list */}
        <Card>
          <CardContent className="pt-6">
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-16">
                <Truck className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  {searchTerm
                    ? 'No se encontraron entregas con esos criterios'
                    : 'No hay entregas registradas'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {!searchTerm &&
                    'Crea una nueva entrega para comenzar a rastrear envios.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDeliveries.map((d) => (
                  <div
                    key={d.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: customer info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-semibold">
                            {d.customer_name}
                          </span>
                          <Badge className={DELIVERY_STATUS_COLORS[d.status]}>
                            {DELIVERY_STATUS_LABELS[d.status]}
                          </Badge>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{d.delivery_address}</span>
                        </div>
                        {d.customer_phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{d.customer_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                          {d.delivery_person?.full_name && (
                            <span className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {d.delivery_person.full_name}
                            </span>
                          )}
                          {d.zone?.zone_name && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {d.zone.zone_name}
                            </span>
                          )}
                          {d.zone?.delivery_fee_usd != null && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />$
                              {d.zone.delivery_fee_usd.toFixed(2)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateVE(d.created_at)}
                          </span>
                        </div>
                        {d.delivery_notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            {d.delivery_notes}
                          </p>
                        )}
                      </div>

                      {/* Right: actions */}
                      <div className="flex flex-col gap-1">
                        {!d.delivery_person_id &&
                          (d.status === 'pending' ||
                            d.status === 'assigned') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAssignDelivery(d)}
                            >
                              <User className="h-3.5 w-3.5 mr-1" />
                              Asignar
                            </Button>
                          )}
                        {STATUS_TRANSITIONS[d.status]?.map((next) => (
                          <Button
                            key={next}
                            variant={
                              next === 'delivered'
                                ? 'default'
                                : next === 'failed'
                                  ? 'destructive'
                                  : 'outline'
                            }
                            size="sm"
                            onClick={() => handleStatusUpdate(d.id, next)}
                          >
                            {next === 'delivered' && (
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            )}
                            {next === 'in_transit' && (
                              <Truck className="h-3.5 w-3.5 mr-1" />
                            )}
                            {next === 'failed' && (
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                            )}
                            {DELIVERY_STATUS_LABELS[next]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {pharmacyId && (
        <>
          <NewDeliveryDialog
            open={newOpen}
            onClose={() => setNewOpen(false)}
            pharmacyId={pharmacyId}
            zones={zones}
            deliveryStaff={deliveryStaff}
            onSaved={loadData}
          />
          <ZoneDialog
            open={zoneOpen}
            onClose={() => setZoneOpen(false)}
            pharmacyId={pharmacyId}
            zones={zones}
            onSaved={loadData}
          />
        </>
      )}
      <AssignDialog
        open={assignDelivery !== null}
        onClose={() => setAssignDelivery(null)}
        delivery={assignDelivery}
        deliveryStaff={deliveryStaff}
        onSaved={loadData}
      />
    </div>
  );
}
