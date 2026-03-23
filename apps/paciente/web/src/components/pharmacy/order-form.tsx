"use client";

import { useState } from "react";
import {
  Truck,
  ShoppingBag,
  MapPin,
  CreditCard,
  FileText,
  AlertCircle,
  Loader2,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import {
  formatBs,
  type FulfillmentOption,
  type DeliveryType,
  type PaymentMethod,
  type CreateOrderData,
  type OrderItem,
} from "@/lib/services/pharmacy-comparator-service";

interface OrderFormProps {
  option: FulfillmentOption;
  deliveryType: DeliveryType;
  patientId: string;
  onSubmit: (orderData: CreateOrderData) => Promise<void>;
  onBack: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  {
    value: "pago_movil",
    label: "Pago Movil",
    description: "Transferencia rapida desde tu banco",
  },
  {
    value: "zelle",
    label: "Zelle",
    description: "Transferencia en USD",
  },
  {
    value: "transferencia",
    label: "Transferencia Bancaria",
    description: "Transferencia directa entre bancos",
  },
  {
    value: "efectivo",
    label: "Efectivo",
    description: "Pago al momento de la entrega/retiro",
  },
];

export function OrderForm({
  option,
  deliveryType,
  patientId,
  onSubmit,
  onBack,
}: OrderFormProps) {
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDelivery = deliveryType === "delivery";
  const deliveryFee =
    isDelivery && option.delivery_fee ? option.delivery_fee : 0;
  const totalWithDelivery = option.total_price_bs + deliveryFee;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (isDelivery && !address.trim()) {
      newErrors.address = "Ingresa tu direccion de entrega";
    }

    if (!paymentMethod) {
      newErrors.payment = "Selecciona un metodo de pago";
    }

    if (
      paymentMethod &&
      paymentMethod !== "efectivo" &&
      !paymentReference.trim()
    ) {
      newErrors.reference = "Ingresa el numero de referencia del pago";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const items: OrderItem[] = option.items
        .filter((item) => item.in_stock)
        .map((item) => ({
          medication_name: item.medication_name,
          quantity: 1,
          price_bs: item.price_bs,
          price_usd: item.price_usd,
        }));

      const orderData: CreateOrderData = {
        patient_id: patientId,
        pharmacy_id: option.pharmacy_id,
        prescription_id: option.prescription_id,
        items,
        total_bs: totalWithDelivery,
        delivery_type: deliveryType,
        delivery_address: isDelivery ? address : undefined,
        payment_method: paymentMethod!,
        payment_reference: paymentReference || undefined,
        notes: notes || undefined,
      };

      await onSubmit(orderData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a comparacion
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Confirmar Pedido</h1>
        <p className="text-gray-500 mt-1">
          {option.pharmacy_name} &mdash;{" "}
          {isDelivery ? "Delivery" : "Retiro en tienda"}
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          Resumen del pedido
        </h2>

        <div className="space-y-2">
          {option.items
            .filter((item) => item.in_stock)
            .map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-gray-700">{item.medication_name}</span>
                </div>
                <span className="font-medium text-gray-900 tabular-nums">
                  {formatBs(item.price_bs)}
                </span>
              </div>
            ))}
        </div>

        <div className="border-t border-gray-100 pt-2 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-700">
              {formatBs(option.total_price_bs)}
            </span>
          </div>
          {isDelivery && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className="text-gray-700">
                {deliveryFee > 0 ? formatBs(deliveryFee) : "Gratis"}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-bold pt-1">
            <span className="text-gray-900">Total</span>
            <span className="text-emerald-600">
              {formatBs(totalWithDelivery)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      {isDelivery && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            Direccion de entrega
          </h2>

          <div>
            <textarea
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((prev) => ({ ...prev, address: "" }));
              }}
              placeholder="Ej: Av. Principal, Edificio Central, Piso 3, Apto 3-B, Caracas"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.address ? "border-red-300" : "border-gray-200"
              }`}
              rows={3}
            />
            {errors.address && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.address}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Truck className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Tiempo estimado de entrega: 1-3 horas. Te notificaremos cuando el
              pedido este en camino.
            </p>
          </div>
        </div>
      )}

      {/* Pickup info */}
      {!isDelivery && option.pharmacy && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-gray-400" />
            Lugar de retiro
          </h2>

          <div className="p-3 bg-gray-50 rounded-lg space-y-1.5">
            <p className="text-sm font-medium text-gray-900">
              {option.pharmacy_name}
            </p>
            {option.pharmacy.direccion && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {option.pharmacy.direccion}
                {option.pharmacy.ciudad && `, ${option.pharmacy.ciudad}`}
              </p>
            )}
            <p className="text-xs text-blue-600">
              Tu pedido estara listo para retirar en aproximadamente 30 minutos
            </p>
          </div>
        </div>
      )}

      {/* Payment method */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          Metodo de pago
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              onClick={() => {
                setPaymentMethod(method.value);
                setErrors((prev) => ({ ...prev, payment: "" }));
              }}
              className={`p-3 border rounded-lg text-left transition-all ${
                paymentMethod === method.value
                  ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  paymentMethod === method.value
                    ? "text-emerald-700"
                    : "text-gray-900"
                }`}
              >
                {method.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {method.description}
              </p>
            </button>
          ))}
        </div>
        {errors.payment && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {errors.payment}
          </p>
        )}

        {/* Payment reference */}
        {paymentMethod && paymentMethod !== "efectivo" && (
          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">
              Numero de referencia
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => {
                setPaymentReference(e.target.value);
                setErrors((prev) => ({ ...prev, reference: "" }));
              }}
              placeholder="Ej: 12345678"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.reference ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.reference && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.reference}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Notas adicionales (opcional)
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instrucciones especiales para la farmacia..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          rows={2}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Confirmar pedido &mdash; {formatBs(totalWithDelivery)}
          </>
        )}
      </button>
    </div>
  );
}
