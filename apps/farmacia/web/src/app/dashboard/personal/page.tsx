'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Phone,
  Mail,
  Clock,
  DollarSign,
  UserX,
  UserCheck,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@red-salud/design-system';
import { Input } from '@red-salud/design-system';
import { Badge } from '@red-salud/design-system';
import {
  Card,
  CardContent,
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
  type StaffMember,
  type StaffRole,
  STAFF_ROLE_LABELS,
  STAFF_ROLE_DESCRIPTIONS,
  getStaffMembers,
  searchUserByEmail,
  createStaffMember,
  updateStaffMember,
} from '@/lib/services/staff-service';
import { getCurrentPharmacyId } from '@/lib/services/settings-service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_COLORS: Record<StaffRole, string> = {
  owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  pharmacist: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  assistant: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  cashier: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  delivery: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
};

const SCHEDULE_OPTIONS = [
  { value: 'morning', label: 'Manana (7:00 - 13:00)' },
  { value: 'afternoon', label: 'Tarde (13:00 - 19:00)' },
  { value: 'night', label: 'Noche (19:00 - 01:00)' },
  { value: 'full', label: 'Completo (8:00 - 17:00)' },
];

function formatDateVE(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Add Staff Dialog
// ---------------------------------------------------------------------------

function AddStaffDialog({
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
  const [emailSearch, setEmailSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{
    id: string;
    full_name: string;
    email: string;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [role, setRole] = useState<StaffRole>('assistant');
  const [schedule, setSchedule] = useState('morning');
  const [hourlyRate, setHourlyRate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmailSearch('');
      setFoundUser(null);
      setNotFound(false);
      setRole('assistant');
      setSchedule('morning');
      setHourlyRate('');
    }
  }, [open]);

  const handleSearchUser = async () => {
    if (!emailSearch.trim()) return;
    setSearching(true);
    setNotFound(false);
    const user = await searchUserByEmail(emailSearch.trim());
    if (user) {
      setFoundUser(user);
      setNotFound(false);
    } else {
      setFoundUser(null);
      setNotFound(true);
    }
    setSearching(false);
  };

  const handleCreate = async () => {
    if (!foundUser) return;
    setSaving(true);

    const scheduleMap: Record<string, { start: string; end: string }> = {};
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const timeMap: Record<string, { start: string; end: string }> = {
      morning: { start: '07:00', end: '13:00' },
      afternoon: { start: '13:00', end: '19:00' },
      night: { start: '19:00', end: '01:00' },
      full: { start: '08:00', end: '17:00' },
    };
    for (const day of days) {
      scheduleMap[day] = timeMap[schedule];
    }

    const result = await createStaffMember({
      pharmacy_id: pharmacyId,
      profile_id: foundUser.id,
      role,
      schedule: scheduleMap,
      hourly_rate_usd: hourlyRate ? Number(hourlyRate) : undefined,
    });

    setSaving(false);
    if (result) {
      onSaved();
      onClose();
    } else {
      alert('Error al agregar el empleado. Puede que ya este registrado.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Empleado</DialogTitle>
          <DialogDescription>
            Busca un usuario existente por email para agregarlo al personal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email search */}
          <div className="space-y-2">
            <Label>Buscar por email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="usuario@email.com"
                value={emailSearch}
                onChange={(e) => {
                  setEmailSearch(e.target.value);
                  setNotFound(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
              />
              <Button
                onClick={handleSearchUser}
                disabled={searching || !emailSearch.trim()}
                variant="outline"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {notFound && (
              <p className="text-sm text-destructive">
                No se encontro un usuario con ese email.
              </p>
            )}
          </div>

          {/* Found user */}
          {foundUser && (
            <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-sm font-medium">{foundUser.full_name}</p>
              <p className="text-xs text-muted-foreground">{foundUser.email}</p>
            </div>
          )}

          {/* Role */}
          <div className="space-y-2">
            <Label>Rol</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((r) => (
                <option key={r} value={r}>
                  {STAFF_ROLE_LABELS[r]} — {STAFF_ROLE_DESCRIPTIONS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label>Turno</Label>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {SCHEDULE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hourly rate */}
          <div className="space-y-2">
            <Label>Tarifa por hora (USD)</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              placeholder="Ej: 5.00"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={saving || !foundUser}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit Staff Dialog
// ---------------------------------------------------------------------------

function EditStaffDialog({
  open,
  onClose,
  staff,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onSaved: () => void;
}) {
  const [role, setRole] = useState<StaffRole>('assistant');
  const [hourlyRate, setHourlyRate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setRole(staff.role);
      setHourlyRate(staff.hourly_rate_usd ? String(staff.hourly_rate_usd) : '');
    }
  }, [staff]);

  if (!staff) return null;

  const handleSave = async () => {
    setSaving(true);
    const success = await updateStaffMember(staff.id, {
      role,
      hourly_rate_usd: hourlyRate ? Number(hourlyRate) : undefined,
    });
    setSaving(false);
    if (success) {
      onSaved();
      onClose();
    } else {
      alert('Error al actualizar el empleado');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
          <DialogDescription>
            {staff.profile?.full_name || 'Empleado'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rol</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((r) => (
                <option key={r} value={r}>
                  {STAFF_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Tarifa por hora (USD)</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Actualizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PersonalPage() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    getCurrentPharmacyId().then((id) => setPharmacyId(id));
  }, []);

  const loadStaff = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const data = await getStaffMembers(pharmacyId);
      setStaff(data);
    } catch (err) {
      console.error('Error cargando personal:', err);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleToggleActive = async (member: StaffMember) => {
    const label = member.is_active ? 'desactivar' : 'reactivar';
    if (!confirm(`¿Deseas ${label} a ${member.profile?.full_name || 'este empleado'}?`))
      return;
    const success = await updateStaffMember(member.id, {
      is_active: !member.is_active,
    });
    if (success) loadStaff();
    else alert('Error al actualizar el estado del empleado');
  };

  const filteredStaff = staff.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.profile?.full_name?.toLowerCase().includes(term) ||
      s.profile?.email?.toLowerCase().includes(term) ||
      STAFF_ROLE_LABELS[s.role]?.toLowerCase().includes(term)
    );
  });

  const activeCount = staff.filter((s) => s.is_active).length;
  const inactiveCount = staff.filter((s) => !s.is_active).length;

  if (loading && staff.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando personal...</p>
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
              <h1 className="text-3xl font-bold">Gestion de Personal</h1>
              <p className="text-muted-foreground">
                Administra los empleados de tu farmacia
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              disabled={!pharmacyId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Empleado
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
                  <p className="text-2xl font-bold">{staff.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary/30" />
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
                <UserCheck className="h-8 w-8 text-green-500/30" />
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
                <UserX className="h-8 w-8 text-gray-400/30" />
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
                placeholder="Buscar por nombre, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff cards */}
        {filteredStaff.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Users className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  {staff.length === 0
                    ? 'No hay empleados registrados'
                    : 'No se encontraron resultados'}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  {staff.length === 0
                    ? 'Agrega empleados buscando su email para asignarles un rol en la farmacia.'
                    : 'Intenta con otros terminos de busqueda.'}
                </p>
                {staff.length === 0 && (
                  <Button onClick={() => setAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar primer empleado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStaff.map((member) => (
              <Card
                key={member.id}
                className={`hover:shadow-md transition-shadow ${
                  !member.is_active ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {member.profile?.full_name || 'Sin nombre'}
                      </h3>
                      <Badge className={ROLE_COLORS[member.role]}>
                        {STAFF_ROLE_LABELS[member.role]}
                      </Badge>
                    </div>
                    <Badge
                      variant={member.is_active ? 'default' : 'secondary'}
                      className={
                        member.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }
                    >
                      {member.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5 mb-3">
                    {member.profile?.phone && (
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{member.profile.phone}</span>
                      </p>
                    )}
                    {member.profile?.email && (
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{member.profile.email}</span>
                      </p>
                    )}
                    {member.hourly_rate_usd != null && (
                      <p className="text-sm flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>${member.hourly_rate_usd.toFixed(2)}/hora</span>
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Desde: {formatDateVE(member.hired_at)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Editar"
                      onClick={() => setEditStaff(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title={member.is_active ? 'Desactivar' : 'Reactivar'}
                      onClick={() => handleToggleActive(member)}
                    >
                      {member.is_active ? (
                        <X className="h-4 w-4 text-destructive" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {pharmacyId && (
        <AddStaffDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          pharmacyId={pharmacyId}
          onSaved={loadStaff}
        />
      )}
      <EditStaffDialog
        open={editStaff !== null}
        onClose={() => setEditStaff(null)}
        staff={editStaff}
        onSaved={loadStaff}
      />
    </div>
  );
}
