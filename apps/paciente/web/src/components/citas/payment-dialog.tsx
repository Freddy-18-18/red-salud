"use client";

import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Smartphone,
  Sparkles,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useDollarRate } from "@/hooks/use-currency";
import {
  describeMethod,
  suggestReferenceForMethod,
  usePatientPaymentMethods,
  type PatientPaymentMethod,
} from "@/hooks/use-patient-payment-methods";
import { formatBs, formatUsd } from "@/lib/services/currency-service";
import { postJson } from "@/lib/utils/fetch";

interface PaymentDialogProps {
  appointmentId: string;
  amountUsd: number;
  onSubmitted: (method: PaymentMethod) => void;
  onClose: () => void;
}

type PaymentMethod =
  | "pago_movil"
  | "transferencia"
  | "efectivo"
  | "zelle"
  | "tarjeta_credito"
  | "tarjeta_debito";

interface MethodOption {
  value: PaymentMethod;
  label: string;
  hint: string;
  icon: LucideIcon;
  needsReference: boolean;
}

const METHODS: MethodOption[] = [
  {
    value: "pago_movil",
    label: "Pago Móvil",
    hint: "Banco + cédula + teléfono",
    icon: Smartphone,
    needsReference: true,
  },
  {
    value: "transferencia",
    label: "Transferencia",
    hint: "Bancos venezolanos",
    icon: Wallet,
    needsReference: true,
  },
  {
    value: "zelle",
    label: "Zelle",
    hint: "USD desde el exterior",
    icon: Sparkles,
    needsReference: true,
  },
  {
    value: "tarjeta_credito",
    label: "Tarjeta de crédito",
    hint: "Pago en línea",
    icon: CreditCard,
    needsReference: true,
  },
  {
    value: "efectivo",
    label: "Efectivo",
    hint: "Pagás al llegar a la consulta",
    icon: Banknote,
    needsReference: false,
  },
];

interface ApiResponse {
  payment_id: string;
  amount_usd: number;
  amount_bs: number;
  exchange_rate: number;
  status: string;
}

export function PaymentDialog({
  appointmentId,
  amountUsd,
  onSubmitted,
  onClose,
}: PaymentDialogProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { rate, loading: rateLoading } = useDollarRate("oficial");
  const { methods: savedMethods } = usePatientPaymentMethods();
  const amountBs = rate ? amountUsd * rate.rate : null;
  const selectedMethod = METHODS.find((m) => m.value === selected);

  const handlePickSavedMethod = (saved: PatientPaymentMethod) => {
    setSelected(saved.type);
    const suggested = suggestReferenceForMethod(saved);
    if (suggested) setReference(suggested);
    setError(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submitting, onClose]);

  const handleSubmit = async () => {
    setError(null);
    if (!selected) {
      setError("Elegí un método de pago.");
      return;
    }
    if (selectedMethod?.needsReference && !reference.trim()) {
      setError("Ingresá la referencia o número de operación.");
      return;
    }
    setSubmitting(true);
    try {
      await postJson<ApiResponse>(
        `/api/appointments/${appointmentId}/payment`,
        {
          method: selected,
          reference_number: reference.trim() || null,
        },
      );
      setSuccess(true);
      setTimeout(() => onSubmitted(selected), 1200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos registrar el pago. Intenta de nuevo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3
                id="payment-dialog-title"
                className="text-base font-semibold text-gray-900"
              >
                Registrar pago de la cita
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                El médico verificará y confirmará el pago
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Pago registrado
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                El médico verá el pago pendiente de verificación. Te avisaremos
                cuando lo confirme.
              </p>
            </div>
          ) : (
            <>
              {/* Amount summary */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Monto a pagar</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatUsd(amountUsd)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Equivalente BCV</span>
                  <span>
                    {rateLoading
                      ? "Cargando..."
                      : amountBs != null
                        ? formatBs(amountBs)
                        : "—"}
                  </span>
                </div>
                {rate && (
                  <p className="text-[10px] text-gray-400 pt-0.5">
                    Tasa BCV: 1 USD = Bs. {rate.rate.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Saved methods (auto-fill chips) */}
              {savedMethods.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">
                    Tus métodos guardados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {savedMethods.map((saved) => (
                      <button
                        key={saved.id}
                        type="button"
                        onClick={() => handlePickSavedMethod(saved)}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 transition disabled:opacity-50"
                        title={describeMethod(saved)}
                      >
                        {saved.is_default && (
                          <span
                            aria-hidden
                            className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"
                          />
                        )}
                        <span className="truncate max-w-[160px]">
                          {saved.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Method picker */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600">
                  Método de pago
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {METHODS.map((m) => {
                    const Icon = m.icon;
                    const isSelected = selected === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => {
                          setSelected(m.value);
                          setError(null);
                        }}
                        disabled={submitting}
                        className={`text-left p-3 rounded-xl border transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {m.label}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {m.hint}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reference */}
              {selectedMethod?.needsReference && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="payment-reference"
                    className="block text-xs font-medium text-gray-600"
                  >
                    Número de referencia / operación
                  </label>
                  <input
                    id="payment-reference"
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    disabled={submitting}
                    maxLength={120}
                    placeholder="Ej: 12345678"
                    className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>
              )}

              {selectedMethod?.value === "efectivo" && (
                <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                  Vas a pagar en efectivo al llegar a la consulta. Confirmá la
                  intención para que el médico lo sepa.
                </p>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || !selected}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition border-l border-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar pago"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
