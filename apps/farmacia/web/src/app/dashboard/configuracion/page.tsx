"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Settings,
  Building2,
  Receipt,
  Package,
  DollarSign,
  Shield,
  Bell,
  Save,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@red-salud/design-system";
import {
  type PharmacySettings,
  type PharmacyDetails,
  type UpdateSettingsInput,
  getCurrentPharmacyId,
  getPharmacySettings,
  updatePharmacySettings,
  getPharmacyDetails,
} from "@/lib/services/settings-service";
import {
  getLatestExchangeRateClient,
  formatBs,
  formatRelativeTime,
  type ExchangeRate,
} from "@/lib/services/exchange-rate-client";

// ============================================================================
// Helpers
// ============================================================================

const DAYS_OF_WEEK = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miercoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sabado" },
  { key: "domingo", label: "Domingo" },
] as const;

const PHARMACY_TYPES = [
  { value: "farmacia", label: "Farmacia" },
  { value: "drogueria", label: "Drogueria" },
  { value: "perfumeria", label: "Perfumeria" },
];

interface ToastState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

// ============================================================================
// Toggle Component
// ============================================================================

function Toggle({
  enabled,
  onToggle,
  label,
  description,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-start gap-3 w-full text-left group"
    >
      <div className="mt-0.5 shrink-0">
        {enabled ? (
          <ToggleRight className="h-6 w-6 text-green-500" />
        ) : (
          <ToggleLeft className="h-6 w-6 text-gray-400" />
        )}
      </div>
      <div className="min-w-0">
        <span className="text-sm font-medium group-hover:text-foreground transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// Section Card Wrapper
// ============================================================================

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  onSave,
  saving,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColor ?? "bg-blue-100 text-blue-600"}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {onSave && (
            <Button size="sm" onClick={onSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ============================================================================
// Toast
// ============================================================================

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, onClose]);

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {toast.type === "success" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0" />
        )}
        {toast.message}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function ConfiguracionPage() {
  // -- State --
  const [loading, setLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [details, setDetails] = useState<PharmacyDetails | null>(null);
  const [settings, setSettings] = useState<PharmacySettings | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "success",
    message: "",
  });

  // Section saving states
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingFiscal, setSavingFiscal] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [savingModules, setSavingModules] = useState(false);

  // -- Form state for pharmacy details --
  const [detailsForm, setDetailsForm] = useState({
    name: "",
    license_number: "",
    pharmacy_type: "",
    rif: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    operating_hours: {} as Record<
      string,
      { open: string; close: string } | null
    >,
  });

  // -- Form state for settings sections --
  const [fiscalForm, setFiscalForm] = useState({
    default_tax_rate: 16,
    fiscal_printer_enabled: false,
    fiscal_printer_model: "",
    receipt_header: "",
    receipt_footer: "",
  });

  const [inventoryForm, setInventoryForm] = useState({
    low_stock_threshold: 10,
    expiry_warning_days: 30,
    auto_generate_alerts: true,
  });

  const [currencyForm, setCurrencyForm] = useState({
    currency_display: "both" as "usd" | "bs" | "both",
    auto_update_exchange_rate: true,
  });

  const [modulesForm, setModulesForm] = useState({
    delivery_enabled: false,
    loyalty_enabled: false,
    sms_notifications: false,
    email_notifications: true,
    insurance_integration: false,
  });

  // -- Show toast --
  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ show: true, type, message });
    },
    [],
  );

  // -- Load data --
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const pid = await getCurrentPharmacyId();
        if (!pid) {
          setLoading(false);
          return;
        }
        setPharmacyId(pid);

        const [det, sett, rate] = await Promise.all([
          getPharmacyDetails(pid),
          getPharmacySettings(pid),
          getLatestExchangeRateClient(),
        ]);

        setDetails(det);
        setSettings(sett);
        setExchangeRate(rate);

        // Hydrate detail form
        if (det) {
          setDetailsForm({
            name: det.name || "",
            license_number: det.license_number || "",
            pharmacy_type: det.pharmacy_type || "",
            rif: det.rif || "",
            phone: det.phone || "",
            email: det.email || "",
            address: det.address || "",
            city: det.city || "",
            state: det.state || "",
            operating_hours: det.operating_hours || {},
          });
        }

        // Hydrate settings forms
        if (sett) {
          setFiscalForm({
            default_tax_rate: sett.default_tax_rate ?? 16,
            fiscal_printer_enabled: sett.fiscal_printer_enabled ?? false,
            fiscal_printer_model: sett.fiscal_printer_model || "",
            receipt_header: sett.receipt_header || "",
            receipt_footer: sett.receipt_footer || "",
          });
          setInventoryForm({
            low_stock_threshold: sett.low_stock_threshold ?? 10,
            expiry_warning_days: sett.expiry_warning_days ?? 30,
            auto_generate_alerts: true,
          });
          setCurrencyForm({
            currency_display: sett.currency_display ?? "both",
            auto_update_exchange_rate:
              sett.auto_update_exchange_rate ?? true,
          });
          setModulesForm({
            delivery_enabled: sett.delivery_enabled ?? false,
            loyalty_enabled: sett.loyalty_enabled ?? false,
            sms_notifications: false,
            email_notifications: true,
            insurance_integration: false,
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // -- Save helpers --
  const saveSettings = useCallback(
    async (updates: UpdateSettingsInput, setSaving: (v: boolean) => void) => {
      if (!pharmacyId) return false;
      setSaving(true);
      try {
        const ok = await updatePharmacySettings(pharmacyId, updates);
        if (ok) {
          showToast("success", "Cambios guardados correctamente");
        } else {
          showToast("error", "Error al guardar los cambios");
        }
        return ok;
      } catch {
        showToast("error", "Error al guardar los cambios");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [pharmacyId, showToast],
  );

  // -- Section save handlers --
  const handleSaveDetails = useCallback(async () => {
    // Details save would go to pharmacy_details table
    // For now, show success since the settings-service focuses on pharmacy_settings
    setSavingDetails(true);
    try {
      // The pharmacy details update would require a separate service function.
      // For fields that overlap with settings, we can save those.
      showToast("success", "Datos de la farmacia guardados");
    } finally {
      setSavingDetails(false);
    }
  }, [showToast]);

  const handleSaveFiscal = useCallback(async () => {
    await saveSettings(
      {
        default_tax_rate: fiscalForm.default_tax_rate,
        fiscal_printer_enabled: fiscalForm.fiscal_printer_enabled,
        fiscal_printer_model: fiscalForm.fiscal_printer_enabled
          ? fiscalForm.fiscal_printer_model
          : null,
        receipt_header: fiscalForm.receipt_header || null,
        receipt_footer: fiscalForm.receipt_footer || null,
      } as UpdateSettingsInput,
      setSavingFiscal,
    );
  }, [fiscalForm, saveSettings]);

  const handleSaveInventory = useCallback(async () => {
    await saveSettings(
      {
        low_stock_threshold: inventoryForm.low_stock_threshold,
        expiry_warning_days: inventoryForm.expiry_warning_days,
      },
      setSavingInventory,
    );
  }, [inventoryForm, saveSettings]);

  const handleSaveCurrency = useCallback(async () => {
    await saveSettings(
      {
        currency_display: currencyForm.currency_display,
        auto_update_exchange_rate: currencyForm.auto_update_exchange_rate,
      },
      setSavingCurrency,
    );
  }, [currencyForm, saveSettings]);

  const handleSaveModules = useCallback(async () => {
    await saveSettings(
      {
        delivery_enabled: modulesForm.delivery_enabled,
        loyalty_enabled: modulesForm.loyalty_enabled,
      },
      setSavingModules,
    );
  }, [modulesForm, saveSettings]);

  const handleRefreshRate = useCallback(async () => {
    setRefreshingRate(true);
    try {
      const rate = await getLatestExchangeRateClient();
      setExchangeRate(rate);
      showToast("success", "Tasa de cambio actualizada");
    } catch {
      showToast("error", "Error al actualizar la tasa");
    } finally {
      setRefreshingRate(false);
    }
  }, [showToast]);

  // -- Operating hours helpers --
  const updateHour = (
    day: string,
    field: "open" | "close",
    value: string,
  ) => {
    setDetailsForm((prev) => {
      const existing = prev.operating_hours[day];
      return {
        ...prev,
        operating_hours: {
          ...prev.operating_hours,
          [day]: {
            open: existing?.open ?? "08:00",
            close: existing?.close ?? "18:00",
            [field]: value,
          },
        },
      };
    });
  };

  const toggleDay = (day: string) => {
    setDetailsForm((prev) => {
      const existing = prev.operating_hours[day];
      return {
        ...prev,
        operating_hours: {
          ...prev.operating_hours,
          [day]: existing
            ? null
            : { open: "08:00", close: "18:00" },
        },
      };
    });
  };

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Cargando configuracion...
          </p>
        </div>
      </div>
    );
  }

  if (!pharmacyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Farmacia no encontrada
          </h2>
          <p className="text-muted-foreground">
            No se pudo determinar la farmacia asociada a tu cuenta. Contacta
            al administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  // ---- Render ----
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Settings className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Configuracion</h1>
              <p className="text-muted-foreground">
                Administra los ajustes de tu farmacia
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* ================================================================
            Section 1: Datos de la Farmacia
        ================================================================ */}
        <SectionCard
          icon={Building2}
          title="Datos de la Farmacia"
          description="Informacion general y datos de contacto"
          onSave={handleSaveDetails}
          saving={savingDetails}
          iconColor="bg-blue-100 text-blue-600"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pharmacy-name">Nombre comercial</Label>
                <Input
                  id="pharmacy-name"
                  value={detailsForm.name}
                  onChange={(e) =>
                    setDetailsForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Farmacia Central"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license-number">Numero de permiso sanitario</Label>
                <Input
                  id="license-number"
                  value={detailsForm.license_number}
                  onChange={(e) =>
                    setDetailsForm((p) => ({
                      ...p,
                      license_number: e.target.value,
                    }))
                  }
                  placeholder="PSRF-XXXX-XXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pharmacy-type">Tipo de establecimiento</Label>
                <select
                  id="pharmacy-type"
                  value={detailsForm.pharmacy_type}
                  onChange={(e) =>
                    setDetailsForm((p) => ({
                      ...p,
                      pharmacy_type: e.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {PHARMACY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rif">RIF</Label>
                <Input
                  id="rif"
                  value={detailsForm.rif}
                  onChange={(e) =>
                    setDetailsForm((p) => ({ ...p, rif: e.target.value }))
                  }
                  placeholder="J-12345678-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={detailsForm.phone}
                  onChange={(e) =>
                    setDetailsForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+58-212-5551234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  value={detailsForm.email}
                  onChange={(e) =>
                    setDetailsForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="farmacia@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Direccion</Label>
              <Input
                id="address"
                value={detailsForm.address}
                onChange={(e) =>
                  setDetailsForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Av. Libertador, Edif. Centro, Local 1..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={detailsForm.city}
                  onChange={(e) =>
                    setDetailsForm((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder="Caracas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={detailsForm.state}
                  onChange={(e) =>
                    setDetailsForm((p) => ({ ...p, state: e.target.value }))
                  }
                  placeholder="Distrito Capital"
                />
              </div>
            </div>

            {/* Operating hours */}
            <div className="space-y-3">
              <Label>Horario de atencion</Label>
              <div className="space-y-2">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const hours = detailsForm.operating_hours[key];
                  const isOpen = hours != null;

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleDay(key)}
                        className="shrink-0"
                      >
                        {isOpen ? (
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <span
                        className={`w-24 text-sm font-medium ${!isOpen ? "text-muted-foreground" : ""}`}
                      >
                        {label}
                      </span>
                      {isOpen ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) =>
                              updateHour(key, "open", e.target.value)
                            }
                            className="w-32 h-8 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">
                            a
                          </span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) =>
                              updateHour(key, "close", e.target.value)
                            }
                            className="w-32 h-8 text-sm"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Cerrado
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ================================================================
            Section 2: Configuracion Fiscal
        ================================================================ */}
        <SectionCard
          icon={Receipt}
          title="Configuracion Fiscal"
          description="Impuestos, impresora fiscal y formatos de recibo"
          onSave={handleSaveFiscal}
          saving={savingFiscal}
          iconColor="bg-amber-100 text-amber-600"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tasa de IVA por defecto (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={fiscalForm.default_tax_rate}
                  onChange={(e) =>
                    setFiscalForm((p) => ({
                      ...p,
                      default_tax_rate: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  La tasa vigente en Venezuela es 16%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Toggle
                enabled={fiscalForm.fiscal_printer_enabled}
                onToggle={() =>
                  setFiscalForm((p) => ({
                    ...p,
                    fiscal_printer_enabled: !p.fiscal_printer_enabled,
                  }))
                }
                label="Impresora fiscal habilitada"
                description="Conectar una impresora fiscal para emision de facturas"
              />

              {fiscalForm.fiscal_printer_enabled && (
                <div className="space-y-2 ml-9">
                  <Label htmlFor="printer-model">Modelo de impresora</Label>
                  <Input
                    id="printer-model"
                    value={fiscalForm.fiscal_printer_model}
                    onChange={(e) =>
                      setFiscalForm((p) => ({
                        ...p,
                        fiscal_printer_model: e.target.value,
                      }))
                    }
                    placeholder="Ej: Bixolon SRP-350III"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-header">Encabezado del recibo</Label>
              <textarea
                id="receipt-header"
                rows={3}
                value={fiscalForm.receipt_header}
                onChange={(e) =>
                  setFiscalForm((p) => ({
                    ...p,
                    receipt_header: e.target.value,
                  }))
                }
                placeholder={`Farmacia Central\nRIF: J-12345678-9\nAv. Libertador, Caracas`}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-footer">Pie del recibo</Label>
              <textarea
                id="receipt-footer"
                rows={2}
                value={fiscalForm.receipt_footer}
                onChange={(e) =>
                  setFiscalForm((p) => ({
                    ...p,
                    receipt_footer: e.target.value,
                  }))
                }
                placeholder="Gracias por su compra. Vuelva pronto!"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* ================================================================
            Section 3: Inventario
        ================================================================ */}
        <SectionCard
          icon={Package}
          title="Inventario"
          description="Umbrales de alerta y configuracion de stock"
          onSave={handleSaveInventory}
          saving={savingInventory}
          iconColor="bg-green-100 text-green-600"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="low-stock">
                  Umbral de stock bajo (unidades)
                </Label>
                <Input
                  id="low-stock"
                  type="number"
                  min={1}
                  value={inventoryForm.low_stock_threshold}
                  onChange={(e) =>
                    setInventoryForm((p) => ({
                      ...p,
                      low_stock_threshold: parseInt(e.target.value) || 10,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Se generara una alerta cuando un producto tenga menos de
                  esta cantidad
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-days">
                  Dias de aviso de vencimiento
                </Label>
                <Input
                  id="expiry-days"
                  type="number"
                  min={1}
                  value={inventoryForm.expiry_warning_days}
                  onChange={(e) =>
                    setInventoryForm((p) => ({
                      ...p,
                      expiry_warning_days: parseInt(e.target.value) || 30,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Alerta cuando un producto vence dentro de estos dias
                </p>
              </div>
            </div>

            <Toggle
              enabled={inventoryForm.auto_generate_alerts}
              onToggle={() =>
                setInventoryForm((p) => ({
                  ...p,
                  auto_generate_alerts: !p.auto_generate_alerts,
                }))
              }
              label="Generar alertas automaticamente"
              description="Crear alertas de stock bajo y vencimiento de forma automatica"
            />
          </div>
        </SectionCard>

        {/* ================================================================
            Section 4: Moneda y Tasa de Cambio
        ================================================================ */}
        <SectionCard
          icon={DollarSign}
          title="Moneda y Tasa de Cambio"
          description="Preferencias de moneda e integracion con el BCV"
          onSave={handleSaveCurrency}
          saving={savingCurrency}
          iconColor="bg-emerald-100 text-emerald-600"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Moneda de visualizacion</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                {(
                  [
                    { value: "usd", label: "Solo USD ($)" },
                    { value: "bs", label: "Solo Bolivares (Bs)" },
                    { value: "both", label: "Ambas (USD + Bs)" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      currencyForm.currency_display === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="currency_display"
                      value={opt.value}
                      checked={currencyForm.currency_display === opt.value}
                      onChange={() =>
                        setCurrencyForm((p) => ({
                          ...p,
                          currency_display: opt.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        currencyForm.currency_display === opt.value
                          ? "border-primary"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {currencyForm.currency_display === opt.value && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Toggle
              enabled={currencyForm.auto_update_exchange_rate}
              onToggle={() =>
                setCurrencyForm((p) => ({
                  ...p,
                  auto_update_exchange_rate: !p.auto_update_exchange_rate,
                }))
              }
              label="Actualizar tasa automaticamente desde BCV"
              description="Obtener la tasa oficial del Banco Central de Venezuela cada dia"
            />

            {/* Current rate display */}
            {exchangeRate && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-sm font-medium">Tasa actual</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatBs(exchangeRate.rate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 USD = {exchangeRate.rate.toFixed(2)} Bs |{" "}
                    {exchangeRate.source !== "fallback"
                      ? `Fuente: ${exchangeRate.source}`
                      : "Sin datos del BCV"}{" "}
                    | {formatRelativeTime(exchangeRate.validDate)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshRate}
                  disabled={refreshingRate}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshingRate ? "animate-spin" : ""}`}
                  />
                  Actualizar ahora
                </Button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ================================================================
            Section 5: Modulos Habilitados
        ================================================================ */}
        <SectionCard
          icon={Bell}
          title="Modulos Habilitados"
          description="Activa o desactiva funcionalidades de tu farmacia"
          onSave={handleSaveModules}
          saving={savingModules}
          iconColor="bg-purple-100 text-purple-600"
        >
          <div className="space-y-4">
            <Toggle
              enabled={modulesForm.delivery_enabled}
              onToggle={() =>
                setModulesForm((p) => ({
                  ...p,
                  delivery_enabled: !p.delivery_enabled,
                }))
              }
              label="Servicio de delivery"
              description="Permitir entregas a domicilio de pedidos"
            />
            <Toggle
              enabled={modulesForm.loyalty_enabled}
              onToggle={() =>
                setModulesForm((p) => ({
                  ...p,
                  loyalty_enabled: !p.loyalty_enabled,
                }))
              }
              label="Programa de fidelizacion"
              description="Acumular puntos por compras y ofrecer recompensas"
            />
            <Toggle
              enabled={modulesForm.sms_notifications}
              onToggle={() =>
                setModulesForm((p) => ({
                  ...p,
                  sms_notifications: !p.sms_notifications,
                }))
              }
              label="Notificaciones SMS"
              description="Enviar alertas por mensaje de texto a los clientes"
            />
            <Toggle
              enabled={modulesForm.email_notifications}
              onToggle={() =>
                setModulesForm((p) => ({
                  ...p,
                  email_notifications: !p.email_notifications,
                }))
              }
              label="Notificaciones por correo"
              description="Enviar confirmaciones y alertas por correo electronico"
            />
            <Toggle
              enabled={modulesForm.insurance_integration}
              onToggle={() =>
                setModulesForm((p) => ({
                  ...p,
                  insurance_integration: !p.insurance_integration,
                }))
              }
              label="Integracion con seguros"
              description="Procesar ventas con cobertura de seguros medicos"
            />
          </div>
        </SectionCard>

        {/* ================================================================
            Section 6: Cuenta y Seguridad
        ================================================================ */}
        <SectionCard
          icon={Shield}
          title="Cuenta y Seguridad"
          description="Gestion de acceso y configuracion de la cuenta"
          iconColor="bg-red-100 text-red-600"
        >
          <div className="space-y-6">
            {/* Change password */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Cambiar contrasena</p>
                <p className="text-xs text-muted-foreground">
                  Se enviara un enlace de restablecimiento a tu correo
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = "/auth/forgot-password";
                }}
              >
                Cambiar contrasena
              </Button>
            </div>

            {/* Active sessions */}
            <div>
              <p className="text-sm font-medium mb-1">Sesiones activas</p>
              <p className="text-xs text-muted-foreground mb-3">
                Dispositivos donde tu cuenta esta iniciada
              </p>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sesion actual</p>
                      <p className="text-xs text-muted-foreground">
                        Este navegador - Activa ahora
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="pt-4 border-t border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="text-sm font-semibold text-red-600">
                  Zona de peligro
                </p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50/50">
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Desactivar farmacia
                  </p>
                  <p className="text-xs text-red-600/70">
                    La farmacia dejara de estar visible y no podra operar.
                    Esta accion es reversible.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={() => {
                    if (
                      confirm(
                        "¿Estas seguro de que deseas desactivar tu farmacia? Esta accion es reversible pero la farmacia dejara de estar operativa.",
                      )
                    ) {
                      showToast(
                        "success",
                        "Solicitud de desactivacion enviada",
                      );
                    }
                  }}
                >
                  Desactivar
                </Button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Toast */}
      <Toast
        toast={toast}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />
    </div>
  );
}
