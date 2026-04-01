'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Save,
  Calendar,
  Percent,
  FileText,
  Building2,
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
  type InsuranceContract,
  type CreateInsuranceInput,
  COVERAGE_TYPE_OPTIONS,
  getInsuranceContracts,
  createInsuranceContract,
  updateInsuranceContract,
  deleteInsuranceContract,
} from '@/lib/services/insurance-service';
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

function isContractActive(contract: InsuranceContract): boolean {
  if (!contract.is_active) return false;
  const today = new Date().toISOString().split('T')[0];
  return contract.valid_from <= today && contract.valid_until >= today;
}

// ---------------------------------------------------------------------------
// Contract Form Dialog
// ---------------------------------------------------------------------------

interface ContractForm {
  insurance_company: string;
  contract_number: string;
  discount_percent: string;
  copay_percent: string;
  coverage_types: string[];
  valid_from: string;
  valid_until: string;
}

const EMPTY_FORM: ContractForm = {
  insurance_company: '',
  contract_number: '',
  discount_percent: '0',
  copay_percent: '0',
  coverage_types: [],
  valid_from: '',
  valid_until: '',
};

function ContractFormDialog({
  open,
  onClose,
  contract,
  pharmacyId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  contract: InsuranceContract | null;
  pharmacyId: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ContractForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contract) {
      setForm({
        insurance_company: contract.insurance_company,
        contract_number: contract.contract_number,
        discount_percent: String(contract.discount_percent),
        copay_percent: String(contract.copay_percent),
        coverage_types: contract.coverage_types || [],
        valid_from: contract.valid_from,
        valid_until: contract.valid_until,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [contract, open]);

  const toggleCoverage = (value: string) => {
    setForm((prev) => ({
      ...prev,
      coverage_types: prev.coverage_types.includes(value)
        ? prev.coverage_types.filter((v) => v !== value)
        : [...prev.coverage_types, value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.insurance_company || !form.contract_number) return;
    setSaving(true);

    let success: boolean;
    if (contract) {
      success = await updateInsuranceContract(contract.id, {
        insurance_company: form.insurance_company,
        contract_number: form.contract_number,
        discount_percent: Number(form.discount_percent),
        copay_percent: Number(form.copay_percent),
        coverage_types: form.coverage_types,
        valid_from: form.valid_from,
        valid_until: form.valid_until,
      });
    } else {
      const input: CreateInsuranceInput = {
        pharmacy_id: pharmacyId,
        insurance_company: form.insurance_company,
        contract_number: form.contract_number,
        discount_percent: Number(form.discount_percent),
        copay_percent: Number(form.copay_percent),
        coverage_types: form.coverage_types,
        valid_from: form.valid_from,
        valid_until: form.valid_until,
      };
      const result = await createInsuranceContract(input);
      success = result !== null;
    }

    setSaving(false);
    if (success) {
      onSaved();
      onClose();
    } else {
      alert('Error al guardar el convenio');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contract ? 'Editar Convenio' : 'Agregar Convenio'}
          </DialogTitle>
          <DialogDescription>
            {contract
              ? 'Modifica los datos del convenio'
              : 'Registra un nuevo convenio con aseguradora'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aseguradora *</Label>
              <Input
                placeholder="Ej: Seguros Mercantil"
                value={form.insurance_company}
                onChange={(e) =>
                  setForm((p) => ({ ...p, insurance_company: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Numero de contrato *</Label>
              <Input
                placeholder="Ej: SM-2024-001"
                value={form.contract_number}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contract_number: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Descuento (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.discount_percent}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discount_percent: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Copago (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.copay_percent}
                onChange={(e) =>
                  setForm((p) => ({ ...p, copay_percent: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vigencia desde</Label>
              <Input
                type="date"
                value={form.valid_from}
                onChange={(e) =>
                  setForm((p) => ({ ...p, valid_from: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Vigencia hasta</Label>
              <Input
                type="date"
                value={form.valid_until}
                onChange={(e) =>
                  setForm((p) => ({ ...p, valid_until: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Coverage types */}
          <div className="space-y-2">
            <Label>Tipos de cobertura</Label>
            <div className="flex flex-wrap gap-2">
              {COVERAGE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleCoverage(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.coverage_types.includes(opt.value)
                      ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700'
                      : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              saving || !form.insurance_company || !form.contract_number
            }
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : contract ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SegurosPage() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<InsuranceContract[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editContract, setEditContract] = useState<InsuranceContract | null>(
    null
  );

  useEffect(() => {
    getCurrentPharmacyId().then((id) => setPharmacyId(id));
  }, []);

  const loadContracts = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const data = await getInsuranceContracts(pharmacyId);
      setContracts(data);
    } catch (err) {
      console.error('Error cargando convenios:', err);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const handleDelete = async (contract: InsuranceContract) => {
    if (
      !confirm(
        `¿Eliminar el convenio con ${contract.insurance_company}?`
      )
    )
      return;
    const success = await deleteInsuranceContract(contract.id);
    if (success) loadContracts();
    else alert('Error al eliminar el convenio');
  };

  const activeCount = contracts.filter(isContractActive).length;

  if (loading && contracts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando convenios...</p>
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
              <h1 className="text-3xl font-bold">Convenios con Seguros</h1>
              <p className="text-muted-foreground">
                Gestion de contratos con aseguradoras
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditContract(null);
                setFormOpen(true);
              }}
              disabled={!pharmacyId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Convenio
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
                  <p className="text-sm text-muted-foreground">Total Convenios</p>
                  <p className="text-2xl font-bold">{contracts.length}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vigentes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activeCount}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vencidos / Inactivos</p>
                  <p className="text-2xl font-bold text-gray-500">
                    {contracts.length - activeCount}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract cards */}
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <ShieldCheck className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  No hay convenios registrados
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Agrega tus convenios con aseguradoras para gestionar
                  descuentos y copagos automaticamente.
                </p>
                <Button
                  onClick={() => {
                    setEditContract(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer convenio
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {contracts.map((contract) => {
              const active = isContractActive(contract);
              return (
                <Card
                  key={contract.id}
                  className={`hover:shadow-md transition-shadow ${
                    !active ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <h3 className="font-semibold text-base truncate">
                            {contract.insurance_company}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Contrato: {contract.contract_number}
                        </p>
                      </div>
                      <Badge
                        className={
                          active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }
                      >
                        {active ? 'Vigente' : 'Inactivo'}
                      </Badge>
                    </div>

                    {/* Rates */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Percent className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-sm">
                          Descuento:{' '}
                          <span className="font-semibold">
                            {contract.discount_percent}%
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Percent className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-sm">
                          Copago:{' '}
                          <span className="font-semibold">
                            {contract.copay_percent}%
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Coverage tags */}
                    {contract.coverage_types &&
                      contract.coverage_types.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {contract.coverage_types.map((ct) => {
                            const opt = COVERAGE_TYPE_OPTIONS.find(
                              (o) => o.value === ct
                            );
                            return (
                              <Badge
                                key={ct}
                                variant="outline"
                                className="text-xs"
                              >
                                {opt?.label || ct}
                              </Badge>
                            );
                          })}
                        </div>
                      )}

                    {/* Validity dates */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateVE(contract.valid_from)} —{' '}
                        {formatDateVE(contract.valid_until)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-1 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Editar"
                        onClick={() => {
                          setEditContract(contract);
                          setFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Eliminar"
                        onClick={() => handleDelete(contract)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog */}
      {pharmacyId && (
        <ContractFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          contract={editContract}
          pharmacyId={pharmacyId}
          onSaved={loadContracts}
        />
      )}
    </div>
  );
}
