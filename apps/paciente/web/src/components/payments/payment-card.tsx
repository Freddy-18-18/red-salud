"use client";

import {
  CreditCard,
  Download,
  ChevronRight,
  Stethoscope,
  FlaskConical,
  Pill,
  Activity,
  Ambulance,
  Video,
  MoreHorizontal,
} from "lucide-react";

import {
  type Payment,
  type PaymentType,
  formatBs,
  formatUsd,
  formatPaymentDate,
  getPaymentStatusConfig,
  getPaymentTypeLabel,
} from "@/lib/services/payments-service";

interface PaymentCardProps {
  payment: Payment;
  onPay?: () => void;
  onDownloadInvoice?: () => void;
  compact?: boolean;
}

const PAYMENT_TYPE_ICONS: Record<PaymentType, typeof Stethoscope> = {
  consulta: Stethoscope,
  laboratorio: FlaskConical,
  farmacia: Pill,
  procedimiento: Activity,
  emergencia: Ambulance,
  telemedicina: Video,
  otro: MoreHorizontal,
};

export function PaymentCard({
  payment,
  onPay,
  onDownloadInvoice,
  compact = false,
}: PaymentCardProps) {
  const statusConfig = getPaymentStatusConfig(payment.status);
  const TypeIcon = PAYMENT_TYPE_ICONS[payment.payment_type] ?? CreditCard;
  const isPending = payment.status === "pending" || payment.status === "processing";

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition">
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          <TypeIcon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {payment.description}
          </p>
          <p className="text-xs text-gray-500">
            {payment.provider_name} &middot; {formatPaymentDate(payment.created_at)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">
            {formatUsd(payment.amount_usd)}
          </p>
          <span
            className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isPending ? "bg-amber-50" : "bg-gray-50"
          }`}
        >
          <TypeIcon
            className={`h-5 w-5 ${isPending ? "text-amber-600" : "text-gray-600"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {payment.description}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {payment.provider_name}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${statusConfig.bg} ${statusConfig.text}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Monto</p>
          <p className="text-base font-bold text-gray-900">
            {formatUsd(payment.amount_usd)}
          </p>
          <p className="text-xs text-gray-400">
            {formatBs(payment.amount_bs)}
          </p>
        </div>
        {payment.insurance_covered > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Seguro cubre</p>
            <p className="text-sm font-semibold text-emerald-600">
              {formatUsd(payment.insurance_covered)}
            </p>
            <p className="text-xs text-gray-500">
              Tu pago: {formatUsd(payment.patient_responsibility)}
            </p>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>{getPaymentTypeLabel(payment.payment_type)}</span>
          <span>&middot;</span>
          <span>{formatPaymentDate(payment.created_at)}</span>
        </div>
        {payment.reference_number && (
          <span className="font-mono text-gray-400">
            {payment.reference_number}
          </span>
        )}
      </div>

      {/* Actions */}
      {(isPending || onDownloadInvoice) && (
        <div className="flex items-center gap-2 pt-1">
          {isPending && onPay && (
            <button
              onClick={onPay}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
            >
              <CreditCard className="h-4 w-4" />
              Pagar ahora
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
          {payment.status === "completed" && onDownloadInvoice && (
            <button
              onClick={onDownloadInvoice}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Download className="h-4 w-4" />
              Factura
            </button>
          )}
        </div>
      )}
    </div>
  );
}
