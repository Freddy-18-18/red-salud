"use client";

import {
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Mail,
  Plus,
  Smartphone,
  Star,
  Trash2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import {
  describeMethod,
  useCreatePatientPaymentMethod,
  useDeletePatientPaymentMethod,
  usePatientPaymentMethods,
  useUpdatePatientPaymentMethod,
  type CreatePatientPaymentMethodData,
  type PatientPaymentMethod,
  type PatientPaymentMethodType,
} from "@/hooks/use-patient-payment-methods";

const TYPE_OPTIONS: Array<{
  value: PatientPaymentMethodType;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "pago_movil", label: "Pago Móvil", icon: Smartphone },
  { value: "transferencia", label: "Transferencia", icon: Wallet },
  { value: "zelle", label: "Zelle", icon: Mail },
  { value: "tarjeta_credito", label: "Tarjeta de crédito", icon: CreditCard },
  { value: "tarjeta_debito", label: "Tarjeta de débito", icon: CreditCard },
  { value: "efectivo", label: "Efectivo", icon: Banknote },
];

const TYPE_ICON: Record<PatientPaymentMethodType, LucideIcon> = {
  pago_movil: Smartphone,
  transferencia: Wallet,
  zelle: Mail,
  tarjeta_credito: CreditCard,
  tarjeta_debito: CreditCard,
  efectivo: Banknote,
};

export function SavedMethodsManager() {
  const { methods, loading, error, refresh } = usePatientPaymentMethods();
  const { remove } = useDeletePatientPaymentMethod();
  const { update } = useUpdatePatientPaymentMethod();

  const [showForm, setShowForm] = useState(false);

  const handleSetDefault = async (id: string) => {
    await update(id, { is_default: true });
    void refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este método guardado?")) return;
    await remove(id);
    void refresh();
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Métodos guardados
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Auto-completá la información cuando registres un pago
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar método
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {showForm && (
        <AddMethodForm
          onCancel={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            void refresh();
          }}
        />
      )}

      {loading && !methods.length ? (
        <p className="text-xs text-gray-400">Cargando...</p>
      ) : methods.length === 0 && !showForm ? (
        <p className="text-xs text-gray-500 bg-gray-50 px-3 py-3 rounded-lg">
          No tenés métodos guardados. Agregá uno para acelerar tus próximos
          pagos.
        </p>
      ) : (
        <ul className="space-y-2">
          {methods.map((method) => (
            <SavedMethodRow
              key={method.id}
              method={method}
              onSetDefault={() => handleSetDefault(method.id)}
              onDelete={() => handleDelete(method.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface SavedMethodRowProps {
  method: PatientPaymentMethod;
  onSetDefault: () => void;
  onDelete: () => void;
}

function SavedMethodRow({ method, onSetDefault, onDelete }: SavedMethodRowProps) {
  const Icon = TYPE_ICON[method.type] ?? CreditCard;
  return (
    <li className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {method.label}
          </p>
          {method.is_default && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 rounded-full">
              <Star className="h-2.5 w-2.5" />
              Principal
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {describeMethod(method)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {!method.is_default && (
          <button
            type="button"
            onClick={onSetDefault}
            className="p-2 rounded-lg hover:bg-amber-50 transition"
            title="Marcar como principal"
            aria-label="Marcar como principal"
          >
            <Star className="h-4 w-4 text-gray-400 hover:text-amber-500" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 transition"
          title="Eliminar"
          aria-label="Eliminar"
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>
    </li>
  );
}

interface AddMethodFormProps {
  onCancel: () => void;
  onSaved: () => void;
}

function AddMethodForm({ onCancel, onSaved }: AddMethodFormProps) {
  const { create, loading } = useCreatePatientPaymentMethod();
  const [type, setType] = useState<PatientPaymentMethodType>("pago_movil");
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Channel-specific fields
  const [pagoMovilPhone, setPagoMovilPhone] = useState("");
  const [pagoMovilBank, setPagoMovilBank] = useState("");
  const [pagoMovilCedula, setPagoMovilCedula] = useState("");
  const [zelleEmail, setZelleEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountLastFour, setAccountLastFour] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");
  const [cardBrand, setCardBrand] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CreatePatientPaymentMethodData = {
      type,
      label: label.trim() || `${labelForType(type)} ${defaultSuffix(type)}`,
      is_default: isDefault,
    };

    if (type === "pago_movil") {
      payload.pago_movil_phone = pagoMovilPhone.trim() || null;
      payload.pago_movil_bank_code = pagoMovilBank.trim() || null;
      payload.pago_movil_cedula = pagoMovilCedula.trim() || null;
    } else if (type === "zelle") {
      payload.zelle_email = zelleEmail.trim() || null;
    } else if (type === "transferencia") {
      payload.bank_name = bankName.trim() || null;
      payload.account_last_four = accountLastFour.trim() || null;
    } else if (type === "tarjeta_credito" || type === "tarjeta_debito") {
      payload.card_last_four = cardLastFour.trim() || null;
      payload.card_brand = cardBrand.trim() || null;
    }

    const result = await create(payload);
    if (result.success) {
      onSaved();
    } else {
      setError(result.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-100 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">
          Nuevo método guardado
        </p>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="p-1 rounded-lg hover:bg-gray-100"
          aria-label="Cancelar"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Type picker */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600">
          Tipo
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((opt) => {
            const TypeIcon = opt.icon;
            const isSelected = type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                disabled={loading}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition flex items-center gap-2 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <TypeIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <label
          htmlFor="method-label"
          className="block text-xs font-medium text-gray-600"
        >
          Nombre {`(opcional)`}
        </label>
        <input
          id="method-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={80}
          disabled={loading}
          placeholder="Ej: Mi Pago Móvil personal"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Channel-specific fields */}
      {type === "pago_movil" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormInput
            label="Teléfono"
            value={pagoMovilPhone}
            onChange={setPagoMovilPhone}
            placeholder="0414-1234567"
            required
            disabled={loading}
          />
          <FormInput
            label="Banco (código)"
            value={pagoMovilBank}
            onChange={setPagoMovilBank}
            placeholder="0102"
            disabled={loading}
          />
          <FormInput
            label="Cédula"
            value={pagoMovilCedula}
            onChange={setPagoMovilCedula}
            placeholder="V-12345678"
            disabled={loading}
          />
        </div>
      )}
      {type === "zelle" && (
        <FormInput
          label="Email Zelle"
          type="email"
          value={zelleEmail}
          onChange={setZelleEmail}
          placeholder="tu@email.com"
          required
          disabled={loading}
        />
      )}
      {type === "transferencia" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormInput
            label="Banco"
            value={bankName}
            onChange={setBankName}
            placeholder="Ej: Banesco"
            disabled={loading}
          />
          <FormInput
            label="Últimos 4 dígitos cuenta"
            value={accountLastFour}
            onChange={setAccountLastFour}
            placeholder="1234"
            disabled={loading}
          />
        </div>
      )}
      {(type === "tarjeta_credito" || type === "tarjeta_debito") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormInput
            label="Marca"
            value={cardBrand}
            onChange={setCardBrand}
            placeholder="Visa / Mastercard"
            disabled={loading}
          />
          <FormInput
            label="Últimos 4 dígitos"
            value={cardLastFour}
            onChange={setCardLastFour}
            placeholder="1234"
            required
            disabled={loading}
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          disabled={loading}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20"
        />
        Marcar como método principal
      </label>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Guardar
        </button>
      </div>
    </form>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
}: FormInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
      />
    </div>
  );
}

function labelForType(type: PatientPaymentMethodType): string {
  return TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function defaultSuffix(type: PatientPaymentMethodType): string {
  switch (type) {
    case "pago_movil":
      return "principal";
    case "zelle":
      return "personal";
    case "transferencia":
      return "principal";
    case "tarjeta_credito":
    case "tarjeta_debito":
      return "principal";
    case "efectivo":
      return "";
    default:
      return "";
  }
}
