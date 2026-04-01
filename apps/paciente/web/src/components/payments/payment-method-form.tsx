"use client";

import {
  CreditCard,
  Smartphone,
  Building2,
  Mail,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";

import {
  type PaymentMethodType,
  type CreatePaymentMethodData,
  VENEZUELAN_BANKS,
  PAYMENT_METHOD_TYPE_LABELS,
} from "@/lib/services/payments-service";

interface PaymentMethodFormProps {
  onSubmit: (data: CreatePaymentMethodData) => Promise<{ success: boolean }>;
  onCancel: () => void;
  saving?: boolean;
}

const METHOD_TABS: { type: PaymentMethodType; icon: typeof CreditCard; label: string }[] = [
  { type: "tarjeta_credito", icon: CreditCard, label: "Tarjeta" },
  { type: "pago_movil", icon: Smartphone, label: "Pago Movil" },
  { type: "transferencia", icon: Building2, label: "Transferencia" },
  { type: "zelle", icon: Mail, label: "Zelle" },
];

export function PaymentMethodForm({
  onSubmit,
  onCancel,
  saving = false,
}: PaymentMethodFormProps) {
  const [selectedType, setSelectedType] = useState<PaymentMethodType>("tarjeta_credito");
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardType, setCardType] = useState<"credito" | "debito">("credito");

  // Pago Movil fields
  const [bankCode, setBankCode] = useState("");
  const [phone, setPhone] = useState("");
  const [cedula, setCedula] = useState("");

  // Transfer fields
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  // Zelle fields
  const [zelleEmail, setZelleEmail] = useState("");

  const resetFields = () => {
    setLabel("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setBankCode("");
    setPhone("");
    setCedula("");
    setAccountNumber("");
    setBankName("");
    setZelleEmail("");
    setError(null);
  };

  const handleTypeChange = (type: PaymentMethodType) => {
    setSelectedType(type);
    resetFields();
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length >= 4) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return digits;
  };

  const validate = (): boolean => {
    if (!label.trim()) {
      setError("Ingresa un nombre para este metodo de pago");
      return false;
    }

    switch (selectedType) {
      case "tarjeta_credito":
      case "tarjeta_debito": {
        const digits = cardNumber.replace(/\s/g, "");
        if (digits.length < 15) {
          setError("Numero de tarjeta invalido");
          return false;
        }
        if (cardExpiry.length < 5) {
          setError("Fecha de vencimiento invalida");
          return false;
        }
        if (cardCvv.length < 3) {
          setError("CVV invalido");
          return false;
        }
        break;
      }
      case "pago_movil": {
        if (!bankCode) {
          setError("Selecciona un banco");
          return false;
        }
        const phoneDigits = phone.replace(/\D/g, "");
        if (phoneDigits.length < 11) {
          setError("Numero de telefono invalido (11 digitos)");
          return false;
        }
        if (!cedula.trim()) {
          setError("Ingresa tu cedula");
          return false;
        }
        break;
      }
      case "transferencia": {
        if (!bankName.trim()) {
          setError("Selecciona un banco");
          return false;
        }
        if (accountNumber.replace(/\D/g, "").length < 10) {
          setError("Numero de cuenta invalido");
          return false;
        }
        break;
      }
      case "zelle": {
        if (!zelleEmail.trim() || !zelleEmail.includes("@")) {
          setError("Ingresa un email valido de Zelle");
          return false;
        }
        break;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const methodType =
      selectedType === "tarjeta_credito" && cardType === "debito"
        ? "tarjeta_debito"
        : selectedType;

    const data: CreatePaymentMethodData = {
      type: methodType,
      label: label.trim(),
      is_default: isDefault,
    };

    switch (selectedType) {
      case "tarjeta_credito":
      case "tarjeta_debito": {
        const digits = cardNumber.replace(/\s/g, "");
        data.card_last_four = digits.slice(-4);
        data.card_brand = detectCardBrand(digits);
        data.card_expiry = cardExpiry;
        break;
      }
      case "pago_movil":
        data.bank_code = bankCode;
        data.phone_number = phone.replace(/\D/g, "");
        data.cedula = cedula.trim();
        data.bank_name = VENEZUELAN_BANKS.find((b) => b.code === bankCode)?.name ?? "";
        break;
      case "transferencia":
        data.bank_name = bankName;
        data.account_number = accountNumber.replace(/\D/g, "");
        break;
      case "zelle":
        data.zelle_email = zelleEmail.trim();
        break;
    }

    const result = await onSubmit(data);
    if (result.success) {
      resetFields();
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          Agregar metodo de pago
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 p-2 mx-4 mt-3 bg-gray-100 rounded-xl">
        {METHOD_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedType === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => handleTypeChange(tab.type)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nombre del metodo
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={`Ej: Mi ${PAYMENT_METHOD_TYPE_LABELS[selectedType]}`}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Card fields */}
        {(selectedType === "tarjeta_credito" || selectedType === "tarjeta_debito") && (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCardType("credito")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition ${
                  cardType === "credito"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                Credito
              </button>
              <button
                type="button"
                onClick={() => setCardType("debito")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition ${
                  cardType === "debito"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                Debito
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Numero de tarjeta
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Vencimiento
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/AA"
                  maxLength={5}
                  className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  CVV
                </label>
                <input
                  type="password"
                  value={cardCvv}
                  onChange={(e) =>
                    setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="000"
                  maxLength={4}
                  className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Pago Movil fields */}
        {selectedType === "pago_movil" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Banco
              </label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="">Seleccionar banco</option>
                {VENEZUELAN_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.code} - {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Telefono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="0414-1234567"
                maxLength={12}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Cedula
              </label>
              <div className="flex gap-2">
                <select className="px-2 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="V">V</option>
                  <option value="E">E</option>
                  <option value="J">J</option>
                  <option value="P">P</option>
                </select>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) =>
                    setCedula(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="12345678"
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Transfer fields */}
        {selectedType === "transferencia" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Banco
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="">Seleccionar banco</option>
                {VENEZUELAN_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Numero de cuenta
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 20))
                }
                placeholder="01020000000000000000"
                maxLength={20}
                className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </>
        )}

        {/* Zelle fields */}
        {selectedType === "zelle" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email de Zelle
            </label>
            <input
              type="email"
              value={zelleEmail}
              onChange={(e) => setZelleEmail(e.target.value)}
              placeholder="ejemplo@email.com"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        )}

        {/* Default checkbox */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-600">
            Usar como metodo de pago predeterminado
          </span>
        </label>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function detectCardBrand(digits: string): string {
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Otra";
}
