'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Users,
  Plus,
  Search,
  Settings,
  Save,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  DollarSign,
  Calendar,
  Hash,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
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
  type LoyaltyProgram,
  type LoyaltyMember,
  type LoyaltyTransaction,
  type LoyaltyTier,
  type TierSummary,
  TIER_LABELS,
  TIER_COLORS,
  TRANSACTION_TYPE_LABELS,
  getLoyaltyProgram,
  updateLoyaltyProgram,
  createLoyaltyProgram,
  getLoyaltyMembers,
  getTierSummary,
  createLoyaltyMember,
  getMemberTransactions,
} from '@/lib/services/loyalty-service';
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

// ---------------------------------------------------------------------------
// Program Config Section
// ---------------------------------------------------------------------------

function ProgramConfig({
  program,
  pharmacyId,
  onUpdate,
}: {
  program: LoyaltyProgram | null;
  pharmacyId: string;
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [pointsPerUsd, setPointsPerUsd] = useState('1');
  const [pointsPerBs, setPointsPerBs] = useState('0.1');
  const [minRedemption, setMinRedemption] = useState('100');
  const [redemptionValue, setRedemptionValue] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (program) {
      setPointsPerUsd(String(program.points_per_usd));
      setPointsPerBs(String(program.points_per_bs));
      setMinRedemption(String(program.min_redemption_points));
      setRedemptionValue(String(program.redemption_value_usd));
      setIsActive(program.is_active);
    }
  }, [program]);

  const handleSave = async () => {
    setSaving(true);
    if (program) {
      await updateLoyaltyProgram(program.id, {
        points_per_usd: Number(pointsPerUsd),
        points_per_bs: Number(pointsPerBs),
        min_redemption_points: Number(minRedemption),
        redemption_value_usd: Number(redemptionValue),
        is_active: isActive,
      });
    } else {
      await createLoyaltyProgram(pharmacyId, 'Programa de Fidelizacion');
    }
    setSaving(false);
    setEditing(false);
    onUpdate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuracion del Programa
          </span>
          <div className="flex items-center gap-2">
            {program && (
              <Badge
                className={
                  isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-600'
                }
              >
                {isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (editing) handleSave();
                else setEditing(true);
              }}
              disabled={saving}
            >
              {editing ? (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </>
              ) : (
                'Editar'
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!program && !editing ? (
          <div className="text-center py-6">
            <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground mb-3">
              No tienes un programa de fidelizacion configurado.
            </p>
            <Button onClick={() => setEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Programa
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Puntos por USD</p>
              {editing ? (
                <Input
                  type="number"
                  step={0.1}
                  value={pointsPerUsd}
                  onChange={(e) => setPointsPerUsd(e.target.value)}
                />
              ) : (
                <p className="text-lg font-bold">
                  {program?.points_per_usd ?? 1}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Puntos por Bs</p>
              {editing ? (
                <Input
                  type="number"
                  step={0.01}
                  value={pointsPerBs}
                  onChange={(e) => setPointsPerBs(e.target.value)}
                />
              ) : (
                <p className="text-lg font-bold">
                  {program?.points_per_bs ?? 0.1}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Min. canje (pts)</p>
              {editing ? (
                <Input
                  type="number"
                  value={minRedemption}
                  onChange={(e) => setMinRedemption(e.target.value)}
                />
              ) : (
                <p className="text-lg font-bold">
                  {program?.min_redemption_points ?? 100}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Valor de canje (USD)
              </p>
              {editing ? (
                <Input
                  type="number"
                  step={0.1}
                  value={redemptionValue}
                  onChange={(e) => setRedemptionValue(e.target.value)}
                />
              ) : (
                <p className="text-lg font-bold">
                  ${program?.redemption_value_usd ?? 1}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Estado</p>
              {editing ? (
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className="flex items-center gap-2 pt-1"
                >
                  {isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </button>
              ) : (
                <p className="text-lg font-bold">
                  {program?.is_active ? 'Activo' : 'Inactivo'}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Add Member Dialog
// ---------------------------------------------------------------------------

function AddMemberDialog({
  open,
  onClose,
  pharmacyId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  pharmacyId: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [ci, setCi] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setCi('');
      setPhone('');
      setEmail('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name || !ci) return;
    setSaving(true);
    const result = await createLoyaltyMember({
      pharmacy_id: pharmacyId,
      customer_name: name,
      customer_ci: ci,
      customer_phone: phone || undefined,
      customer_email: email || undefined,
    });
    setSaving(false);
    if (result) {
      onSaved();
      onClose();
    } else {
      alert('Error al registrar el miembro. Puede que la cedula ya este registrada.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Miembro</DialogTitle>
          <DialogDescription>
            Registrar un nuevo miembro al programa de fidelizacion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre completo *</Label>
            <Input
              placeholder="Juan Perez"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Cedula de Identidad *</Label>
            <Input
              placeholder="V-12345678"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input
                placeholder="+58-412-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="correo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name || !ci}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Expandable Transaction Row
// ---------------------------------------------------------------------------

function MemberRow({ member }: { member: LoyaltyMember }) {
  const [expanded, setExpanded] = useState(false);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const loadTransactions = async () => {
    if (transactions.length > 0) {
      setExpanded(!expanded);
      return;
    }
    setExpanded(true);
    setLoadingTx(true);
    const data = await getMemberTransactions(member.id);
    setTransactions(data);
    setLoadingTx(false);
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={loadTransactions}
      >
        <TableCell>
          <div className="font-medium">{member.customer_name}</div>
        </TableCell>
        <TableCell>
          <span className="text-sm">{member.customer_ci}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm">
            {member.customer_phone || '—'}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <span className="font-bold text-green-600">
            {member.points_balance.toLocaleString()}
          </span>
        </TableCell>
        <TableCell>
          <Badge className={TIER_COLORS[member.tier]}>
            {TIER_LABELS[member.tier]}
          </Badge>
        </TableCell>
        <TableCell className="text-right text-sm">
          {member.total_points_earned.toLocaleString()}
        </TableCell>
        <TableCell className="text-right text-sm">
          {member.total_points_redeemed.toLocaleString()}
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="sm">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 p-0">
            <div className="px-6 py-3">
              <p className="text-sm font-semibold mb-2">
                Historial de transacciones
              </p>
              {loadingTx ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin transacciones registradas
                </p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-sm py-1.5 px-3 rounded bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            tx.transaction_type === 'earn'
                              ? 'text-green-600 border-green-300'
                              : tx.transaction_type === 'redeem'
                                ? 'text-red-600 border-red-300'
                                : 'text-muted-foreground'
                          }
                        >
                          {TRANSACTION_TYPE_LABELS[tx.transaction_type]}
                        </Badge>
                        <span className="text-muted-foreground">
                          {tx.description || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-semibold ${
                            tx.transaction_type === 'earn'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {tx.transaction_type === 'earn' ? '+' : '-'}
                          {tx.points}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateVE(tx.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function FidelizacionPage() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [tierSummary, setTierSummary] = useState<TierSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    getCurrentPharmacyId().then((id) => setPharmacyId(id));
  }, []);

  const loadData = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const [prog, memb, tiers] = await Promise.all([
        getLoyaltyProgram(pharmacyId),
        getLoyaltyMembers(pharmacyId),
        getTierSummary(pharmacyId),
      ]);
      setProgram(prog);
      setMembers(memb);
      setTierSummary(tiers);
    } catch (err) {
      console.error('Error cargando fidelizacion:', err);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMembers = members.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.customer_name?.toLowerCase().includes(term) ||
      m.customer_ci?.toLowerCase().includes(term) ||
      m.customer_phone?.toLowerCase().includes(term)
    );
  });

  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Cargando programa de fidelizacion...
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
              <h1 className="text-3xl font-bold">Programa de Fidelizacion</h1>
              <p className="text-muted-foreground">
                Puntos, niveles y recompensas para tus clientes
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              disabled={!pharmacyId || !program}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Program config */}
        <ProgramConfig
          program={program}
          pharmacyId={pharmacyId || ''}
          onUpdate={loadData}
        />

        {/* Tier distribution */}
        {tierSummary.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tierSummary.map((t) => (
              <Card key={t.tier}>
                <CardContent className="pt-4 pb-3 text-center">
                  <Badge className={`${TIER_COLORS[t.tier]} mb-2`}>
                    {TIER_LABELS[t.tier]}
                  </Badge>
                  <p className="text-2xl font-bold">{t.count}</p>
                  <p className="text-xs text-muted-foreground">miembros</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cedula o telefono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredMembers.length} miembro
              {filteredMembers.length !== 1 ? 's' : ''} registrado
              {filteredMembers.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  {members.length === 0
                    ? 'No hay miembros registrados'
                    : 'No se encontraron resultados'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {members.length === 0
                    ? 'Agrega miembros para comenzar a acumular puntos.'
                    : 'Intenta con otros terminos de busqueda.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cedula</TableHead>
                      <TableHead>Telefono</TableHead>
                      <TableHead className="text-right">Puntos</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead className="text-right">Ganados</TableHead>
                      <TableHead className="text-right">Canjeados</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <MemberRow key={member.id} member={member} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {pharmacyId && (
        <AddMemberDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          pharmacyId={pharmacyId}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
