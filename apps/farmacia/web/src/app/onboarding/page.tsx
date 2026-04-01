"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Clock,
  Settings,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Pill,
  Store,
  Truck,
  Gift,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StateCitySelector,
} from "@red-salud/design-system";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PharmacyFormData {
  // Step 1 — Datos de la Farmacia
  businessName: string;
  rif: string;
  pharmacyType: "farmacia" | "drogueria" | "perfumeria" | "";
  licenseNumber: string;
  // Step 2 — Ubicacion
  estadoCode: string;
  ciudad: string;
  address: string;
  // Step 3 — Horario
  officeHours: Record<string, { open: string; close: string; enabled: boolean }>;
  // Step 4 — Configuracion
  taxRate: number;
  currencyDisplay: "USD" | "Bs" | "both";
  deliveryEnabled: boolean;
  loyaltyEnabled: boolean;
}

interface StepError {
  field: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 1, label: "Datos", icon: Building2 },
  { id: 2, label: "Ubicacion", icon: MapPin },
  { id: 3, label: "Horario", icon: Clock },
  { id: 4, label: "Configuracion", icon: Settings },
] as const;

const PHARMACY_TYPES = [
  { value: "farmacia", label: "Farmacia" },
  { value: "drogueria", label: "Drogueria" },
  { value: "perfumeria", label: "Perfumeria" },
] as const;

const DAYS_OF_WEEK = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miercoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sabado" },
  { key: "domingo", label: "Domingo" },
] as const;

const CURRENCY_OPTIONS = [
  { value: "USD", label: "Dolares (USD)" },
  { value: "Bs", label: "Bolivares (Bs)" },
  { value: "both", label: "Ambos (USD + Bs)" },
] as const;

const DEFAULT_WEEKDAY_HOURS = { open: "07:00", close: "20:00", enabled: true };
const DEFAULT_SATURDAY_HOURS = { open: "08:00", close: "14:00", enabled: true };
const DEFAULT_SUNDAY_HOURS = { open: "", close: "", enabled: false };

function buildDefaultHours(): PharmacyFormData["officeHours"] {
  return {
    lunes: { ...DEFAULT_WEEKDAY_HOURS },
    martes: { ...DEFAULT_WEEKDAY_HOURS },
    miercoles: { ...DEFAULT_WEEKDAY_HOURS },
    jueves: { ...DEFAULT_WEEKDAY_HOURS },
    viernes: { ...DEFAULT_WEEKDAY_HOURS },
    sabado: { ...DEFAULT_SATURDAY_HOURS },
    domingo: { ...DEFAULT_SUNDAY_HOURS },
  };
}

const INITIAL_FORM_DATA: PharmacyFormData = {
  businessName: "",
  rif: "",
  pharmacyType: "",
  licenseNumber: "",
  estadoCode: "",
  ciudad: "",
  address: "",
  officeHours: buildDefaultHours(),
  taxRate: 16,
  currencyDisplay: "both",
  deliveryEnabled: false,
  loyaltyEnabled: false,
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const RIF_REGEX = /^[JGVEP]-\d{8}-\d$/;

function validateStep(step: number, data: PharmacyFormData): StepError[] {
  const errors: StepError[] = [];

  if (step === 1) {
    if (!data.businessName.trim()) {
      errors.push({ field: "businessName", message: "El nombre es obligatorio" });
    }
    if (!data.rif.trim()) {
      errors.push({ field: "rif", message: "El RIF es obligatorio" });
    } else if (!RIF_REGEX.test(data.rif.toUpperCase())) {
      errors.push({ field: "rif", message: "Formato invalido. Ej: J-12345678-9" });
    }
    if (!data.pharmacyType) {
      errors.push({ field: "pharmacyType", message: "Seleccione el tipo de establecimiento" });
    }
  }

  if (step === 2) {
    if (!data.estadoCode) {
      errors.push({ field: "estadoCode", message: "Seleccione un estado" });
    }
    if (!data.ciudad) {
      errors.push({ field: "ciudad", message: "Seleccione una ciudad" });
    }
    if (!data.address.trim()) {
      errors.push({ field: "address", message: "La direccion es obligatoria" });
    }
  }

  if (step === 3) {
    const anyEnabled = Object.values(data.officeHours).some((d) => d.enabled);
    if (!anyEnabled) {
      errors.push({ field: "officeHours", message: "Debe habilitar al menos un dia" });
    }
    for (const [day, hours] of Object.entries(data.officeHours)) {
      if (hours.enabled && (!hours.open || !hours.close)) {
        errors.push({ field: `officeHours.${day}`, message: `Complete el horario del ${day}` });
      }
      if (hours.enabled && hours.open && hours.close && hours.open >= hours.close) {
        errors.push({ field: `officeHours.${day}`, message: `Hora de cierre debe ser mayor a apertura (${day})` });
      }
    }
  }

  if (step === 4) {
    if (data.taxRate < 0 || data.taxRate > 100) {
      errors.push({ field: "taxRate", message: "La tasa debe estar entre 0 y 100" });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// RIF Formatter
// ---------------------------------------------------------------------------

function formatRif(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^JGVEP0-9-]/g, "");

  // Auto-format: J12345678-9 -> J-12345678-9
  if (cleaned.length >= 2 && /^[JGVEP]\d/.test(cleaned) && cleaned[1] !== "-") {
    return cleaned[0] + "-" + cleaned.slice(1);
  }

  return cleaned.slice(0, 12); // J-12345678-9 = 12 chars max
}

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                  ${isActive ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/30" : ""}
                  ${isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : ""}
                  ${!isActive && !isCompleted ? "border-slate-200 bg-white text-slate-400" : ""}
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide uppercase ${
                  isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={`hidden sm:block h-0.5 w-8 rounded-full transition-all duration-300 ${
                  step.id < currentStep ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Datos de la Farmacia
// ---------------------------------------------------------------------------

function Step1({
  data,
  onChange,
  errors,
}: {
  data: PharmacyFormData;
  onChange: (partial: Partial<PharmacyFormData>) => void;
  errors: StepError[];
}) {
  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
        <Building2 className="h-4 w-4" />
        Datos de la Farmacia
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-slate-600 font-medium ml-1">
            Nombre del Negocio <span className="text-red-500">*</span>
          </Label>
          <Input
            value={data.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            placeholder="Farmacia El Buen Vivir"
            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
          />
          {getError("businessName") && (
            <p className="text-xs text-red-500 flex items-center gap-1 ml-1">
              <AlertCircle className="h-3 w-3" />
              {getError("businessName")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-600 font-medium ml-1">
              RIF <span className="text-red-500">*</span>
            </Label>
            <Input
              value={data.rif}
              onChange={(e) => onChange({ rif: formatRif(e.target.value) })}
              placeholder="J-12345678-9"
              maxLength={12}
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm font-mono"
            />
            {getError("rif") && (
              <p className="text-xs text-red-500 flex items-center gap-1 ml-1">
                <AlertCircle className="h-3 w-3" />
                {getError("rif")}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-600 font-medium ml-1">
              Numero de Licencia
            </Label>
            <Input
              value={data.licenseNumber}
              onChange={(e) => onChange({ licenseNumber: e.target.value })}
              placeholder="Ej: F-001234"
              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-600 font-medium ml-1">
            Tipo de Establecimiento <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.pharmacyType}
            onValueChange={(value) =>
              onChange({ pharmacyType: value as PharmacyFormData["pharmacyType"] })
            }
          >
            <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {PHARMACY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-slate-400" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getError("pharmacyType") && (
            <p className="text-xs text-red-500 flex items-center gap-1 ml-1">
              <AlertCircle className="h-3 w-3" />
              {getError("pharmacyType")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Ubicacion
// ---------------------------------------------------------------------------

function Step2({
  data,
  onChange,
  errors,
}: {
  data: PharmacyFormData;
  onChange: (partial: Partial<PharmacyFormData>) => void;
  errors: StepError[];
}) {
  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
        <MapPin className="h-4 w-4" />
        Ubicacion
      </div>

      <div className="space-y-4">
        <div>
          <StateCitySelector
            selectedEstadoCode={data.estadoCode}
            selectedCiudad={data.ciudad}
            onEstadoChange={(code) => onChange({ estadoCode: code, ciudad: "" })}
            onCiudadChange={(city) => onChange({ ciudad: city })}
          />
          {(getError("estadoCode") || getError("ciudad")) && (
            <p className="text-xs text-red-500 flex items-center gap-1 ml-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {getError("estadoCode") || getError("ciudad")}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-600 font-medium ml-1">
            Direccion Completa <span className="text-red-500">*</span>
          </Label>
          <Input
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Av. Principal, Centro Comercial ABC, Local 12"
            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
          />
          {getError("address") && (
            <p className="text-xs text-red-500 flex items-center gap-1 ml-1">
              <AlertCircle className="h-3 w-3" />
              {getError("address")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Horario
// ---------------------------------------------------------------------------

function Step3({
  data,
  onChange,
  errors,
}: {
  data: PharmacyFormData;
  onChange: (partial: Partial<PharmacyFormData>) => void;
  errors: StepError[];
}) {
  const hasGlobalError = errors.some((e) => e.field === "officeHours");

  const updateDayHours = (
    day: string,
    field: "open" | "close" | "enabled",
    value: string | boolean,
  ) => {
    const updated = {
      ...data.officeHours,
      [day]: { ...data.officeHours[day], [field]: value },
    };
    onChange({ officeHours: updated });
  };

  const applyPreset = () => {
    onChange({ officeHours: buildDefaultHours() });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
          <Clock className="h-4 w-4" />
          Horario de Atencion
        </div>
        <button
          type="button"
          onClick={applyPreset}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2"
        >
          L-V 7am-8pm, Sab 8am-2pm
        </button>
      </div>

      {hasGlobalError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Debe habilitar al menos un dia
        </p>
      )}

      <div className="space-y-3">
        {DAYS_OF_WEEK.map(({ key, label }) => {
          const day = data.officeHours[key];
          const dayError = errors.find((e) => e.field === `officeHours.${key}`);

          return (
            <div key={key}>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all hover:border-slate-300">
                <Switch
                  checked={day.enabled}
                  onCheckedChange={(checked) => updateDayHours(key, "enabled", checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className={`w-24 text-sm font-medium ${day.enabled ? "text-slate-700" : "text-slate-400"}`}>
                  {label}
                </span>

                {day.enabled && (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="time"
                      value={day.open}
                      onChange={(e) => updateDayHours(key, "open", e.target.value)}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <span className="text-slate-400 text-xs">a</span>
                    <input
                      type="time"
                      value={day.close}
                      onChange={(e) => updateDayHours(key, "close", e.target.value)}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}

                {!day.enabled && (
                  <span className="ml-auto text-xs text-slate-400 italic">Cerrado</span>
                )}
              </div>
              {dayError && (
                <p className="text-xs text-red-500 flex items-center gap-1 ml-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {dayError.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Configuracion Inicial
// ---------------------------------------------------------------------------

function Step4({
  data,
  onChange,
  errors,
}: {
  data: PharmacyFormData;
  onChange: (partial: Partial<PharmacyFormData>) => void;
  errors: StepError[];
}) {
  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
        <Settings className="h-4 w-4" />
        Configuracion Inicial
      </div>

      <div className="space-y-5">
        {/* IVA */}
        <div className="space-y-1.5">
          <Label className="text-slate-600 font-medium ml-1 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            Tasa de IVA (%)
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={data.taxRate}
            onChange={(e) => onChange({ taxRate: parseFloat(e.target.value) || 0 })}
            className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm w-32"
          />
          {getError("taxRate") && (
            <p className="text-xs text-red-500 flex items-center gap-1 ml-1">
              <AlertCircle className="h-3 w-3" />
              {getError("taxRate")}
            </p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <Label className="text-slate-600 font-medium ml-1">
            Moneda de Visualizacion
          </Label>
          <Select
            value={data.currencyDisplay}
            onValueChange={(value) =>
              onChange({ currencyDisplay: value as PharmacyFormData["currencyDisplay"] })
            }
          >
            <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Delivery</p>
                <p className="text-xs text-slate-400">Habilitar entregas a domicilio</p>
              </div>
            </div>
            <Switch
              checked={data.deliveryEnabled}
              onCheckedChange={(checked) => onChange({ deliveryEnabled: checked })}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                <Gift className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Programa de Fidelizacion</p>
                <p className="text-xs text-slate-400">Sistema de puntos y recompensas</p>
              </div>
            </div>
            <Switch
              checked={data.loyaltyEnabled}
              onCheckedChange={(checked) => onChange({ loyaltyEnabled: checked })}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Main Page
// ===========================================================================

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PharmacyFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<StepError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateFormData = useCallback((partial: Partial<PharmacyFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
    // Clear errors on change
    setErrors([]);
    setSubmitError(null);
  }, []);

  const handleNext = () => {
    const stepErrors = validateStep(step, formData);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors([]);
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setErrors([]);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(step, formData);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("No se pudo obtener la sesion del usuario. Intente iniciar sesion nuevamente.");
      }

      // Build office_hours JSONB
      const officeHours: Record<string, { open: string; close: string } | null> = {};
      for (const [day, hours] of Object.entries(formData.officeHours)) {
        officeHours[day] = hours.enabled ? { open: hours.open, close: hours.close } : null;
      }

      // Build servicios array
      const servicios: string[] = [];
      if (formData.deliveryEnabled) servicios.push("delivery");
      if (formData.loyaltyEnabled) servicios.push("fidelizacion");

      // 1. Insert pharmacy_details
      const { data: pharmacyData, error: pharmacyError } = await supabase
        .from("pharmacy_details")
        .insert({
          profile_id: user.id,
          business_name: formData.businessName.trim(),
          pharmacy_license: formData.licenseNumber.trim() || null,
          pharmacy_type: formData.pharmacyType,
          office_hours: officeHours,
          servicios,
          accepts_digital_prescriptions: true,
          rif: formData.rif.toUpperCase(),
          estado: formData.estadoCode,
          ciudad: formData.ciudad,
          direccion: formData.address.trim(),
        })
        .select("id")
        .single();

      if (pharmacyError) {
        throw new Error(pharmacyError.message);
      }

      // 2. Insert pharmacy_settings
      const { error: settingsError } = await supabase
        .from("pharmacy_settings")
        .insert({
          pharmacy_id: pharmacyData.id,
          default_tax_rate: formData.taxRate,
          currency_display: formData.currencyDisplay,
          auto_update_exchange_rate: true,
          low_stock_threshold: 10,
          expiry_warning_days: 90,
          delivery_enabled: formData.deliveryEnabled,
          loyalty_enabled: formData.loyaltyEnabled,
        });

      if (settingsError) {
        throw new Error(settingsError.message);
      }

      // 3. Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar los datos";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 border border-blue-200">
            <Pill className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Configurar Farmacia
          </h1>
          <p className="text-sm text-slate-500">
            Complete los datos para comenzar a usar el sistema
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Card */}
        <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {step === 1 && <Step1 data={formData} onChange={updateFormData} errors={errors} />}
            {step === 2 && <Step2 data={formData} onChange={updateFormData} errors={errors} />}
            {step === 3 && <Step3 data={formData} onChange={updateFormData} errors={errors} />}
            {step === 4 && <Step4 data={formData} onChange={updateFormData} errors={errors} />}

            {/* Submit error */}
            {submitError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-slate-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atras
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-lg shadow-blue-500/20"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Finalizar Configuracion
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Podra modificar estos datos despues desde Configuracion.
        </p>
      </div>
    </div>
  );
}
