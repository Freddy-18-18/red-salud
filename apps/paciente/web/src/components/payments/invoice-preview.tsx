"use client";

import {
  Download,
  Printer,
  FileText,
  Building2,
  User,
  X,
} from "lucide-react";

import {
  type Invoice,
  formatBs,
  formatUsd,
  getPaymentStatusConfig,
  formatPaymentDateTime,
} from "@/lib/services/payments-service";

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose?: () => void;
}

export function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
  const statusConfig = getPaymentStatusConfig(invoice.payment_status);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate a simple text-based receipt for download
    const lines = [
      `FACTURA #${invoice.invoice_number}`,
      `Fecha: ${formatPaymentDateTime(invoice.issued_at)}`,
      "",
      "--- PROVEEDOR ---",
      invoice.provider_name,
      invoice.provider_rif ? `RIF: ${invoice.provider_rif}` : "",
      invoice.provider_address ?? "",
      "",
      "--- PACIENTE ---",
      invoice.patient_name,
      invoice.patient_cedula ? `C.I.: ${invoice.patient_cedula}` : "",
      "",
      "--- SERVICIO ---",
      invoice.service_description,
      "",
      `Subtotal: ${formatUsd(invoice.subtotal_usd)} / ${formatBs(invoice.subtotal_bs)}`,
      `IVA: ${formatUsd(invoice.tax_usd)} / ${formatBs(invoice.tax_bs)}`,
      `Total: ${formatUsd(invoice.total_usd)} / ${formatBs(invoice.total_bs)}`,
      "",
      `Tasa de cambio: 1 USD = Bs. ${invoice.exchange_rate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`,
      invoice.payment_method_label
        ? `Metodo de pago: ${invoice.payment_method_label}`
        : "",
      `Estado: ${statusConfig.label}`,
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura-${invoice.invoice_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden print:border-none print:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-gray-900">
            Factura
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            title="Descargar"
          >
            <Download className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            title="Imprimir"
          >
            <Printer className="h-4 w-4 text-gray-500" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Invoice number & status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Factura</p>
            <p className="text-lg font-bold text-gray-900 font-mono">
              #{invoice.invoice_number}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Provider & Patient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Building2 className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Proveedor
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {invoice.provider_name}
            </p>
            {invoice.provider_rif && (
              <p className="text-xs text-gray-500">
                RIF: {invoice.provider_rif}
              </p>
            )}
            {invoice.provider_address && (
              <p className="text-xs text-gray-500">
                {invoice.provider_address}
              </p>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Paciente
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {invoice.patient_name}
            </p>
            {invoice.patient_cedula && (
              <p className="text-xs text-gray-500">
                C.I.: {invoice.patient_cedula}
              </p>
            )}
          </div>
        </div>

        {/* Service description */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Servicio
          </p>
          <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
            {invoice.service_description}
          </p>
        </div>

        {/* Amounts table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
            <span>Concepto</span>
            <span className="text-right">USD</span>
            <span className="text-right">Bs.</span>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-3 px-4 py-3 text-sm">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-right text-gray-900">
                {formatUsd(invoice.subtotal_usd)}
              </span>
              <span className="text-right text-gray-500">
                {formatBs(invoice.subtotal_bs)}
              </span>
            </div>
            {(invoice.tax_usd > 0 || invoice.tax_bs > 0) && (
              <div className="grid grid-cols-3 px-4 py-3 text-sm">
                <span className="text-gray-700">IVA</span>
                <span className="text-right text-gray-900">
                  {formatUsd(invoice.tax_usd)}
                </span>
                <span className="text-right text-gray-500">
                  {formatBs(invoice.tax_bs)}
                </span>
              </div>
            )}
            <div className="grid grid-cols-3 px-4 py-3 bg-emerald-50">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-right text-base font-bold text-emerald-700">
                {formatUsd(invoice.total_usd)}
              </span>
              <span className="text-right text-sm font-semibold text-emerald-600">
                {formatBs(invoice.total_bs)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
          <span>
            Tasa BCV: 1 USD = Bs.{" "}
            {invoice.exchange_rate.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
            })}
          </span>
          {invoice.payment_method_label && (
            <span>Metodo: {invoice.payment_method_label}</span>
          )}
          <span>Emitida: {formatPaymentDateTime(invoice.issued_at)}</span>
        </div>
      </div>
    </div>
  );
}
