"use client";

import { useRef } from "react";
import { Printer, ShoppingCart } from "lucide-react";
import { Button } from "@red-salud/design-system";

// ─── Types ───────────────────────────────────────────────────────────

export interface ReceiptInvoice {
  invoice_number: string;
  created_at: string;
  customer_name?: string;
  customer_ci?: string;
  customer_rif?: string;
  subtotal_usd: number;
  discount_usd: number;
  tax_usd: number;
  total_usd: number;
  exchange_rate_used: number;
  total_bs: number;
  payment_method: string;
  payment_reference?: string;
  cashier_name?: string;
}

export interface ReceiptItem {
  product_name: string;
  quantity: number;
  unit_price_usd: number;
  subtotal_usd: number;
}

export interface ReceiptPharmacy {
  business_name: string;
  rif?: string;
  address?: string;
  phone?: string;
}

export interface ReceiptProps {
  invoice: ReceiptInvoice;
  items: ReceiptItem[];
  pharmacy: ReceiptPharmacy;
  onNewSale?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<string, string> = {
  cash_bs: "Efectivo Bs",
  cash_usd: "Efectivo USD",
  pago_movil: "Pago Movil",
  zelle: "Zelle",
  punto_venta: "Punto de Venta",
  transferencia: "Transferencia",
  mixed: "Pago Mixto",
};

function formatDateVE(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtBs(n: number): string {
  return `Bs ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;
}

/**
 * Trunca un string a maxLen caracteres. Si es mas largo, recorta con "..".
 */
function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 2) + "..";
}

/**
 * Rellena a la derecha con espacios hasta alcanzar el ancho deseado.
 */
function padRight(s: string, width: number): string {
  if (s.length >= width) return s;
  return s + " ".repeat(width - s.length);
}

/**
 * Rellena a la izquierda con espacios hasta alcanzar el ancho deseado.
 */
function padLeft(s: string, width: number): string {
  if (s.length >= width) return s;
  return " ".repeat(width - s.length) + s;
}

// ─── Component ───────────────────────────────────────────────────────

const LINE = "========================================";
const DASH = "----------------------------------------";
const WIDTH = 40; // Caracteres de ancho para impresora termica 80mm

export function Receipt({ invoice, items, pharmacy, onNewSale }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Construir lineas de items con formato monoespaciado
  // Cant  Producto           Precio    Total
  // 4 + 2 + 18 + 1 + 8 + 1 + 8 = 42 (ajustado a 40 col)
  const itemLines = items.map((item) => {
    const qty = padLeft(String(item.quantity), 3);
    const name = padRight(truncate(item.product_name, 16), 16);
    const price = padLeft(fmtUsd(item.unit_price_usd), 9);
    const total = padLeft(fmtUsd(item.subtotal_usd), 9);
    return `${qty}  ${name} ${price} ${total}`;
  });

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #receipt-printable,
          #receipt-printable * {
            visibility: visible !important;
          }
          #receipt-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 2mm;
          }
          .receipt-no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-4">
        {/* Receipt body */}
        <div
          id="receipt-printable"
          ref={receiptRef}
          className="bg-white text-black font-mono text-xs leading-relaxed w-full max-w-[320px] p-4 rounded border border-gray-200 shadow-sm"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {/* Header */}
          <pre className="whitespace-pre-wrap text-center text-[11px]">
            {LINE}
            {"\n"}
            {"       " + pharmacy.business_name}
            {pharmacy.rif && "\n       RIF: " + pharmacy.rif}
            {pharmacy.address && "\n       " + truncate(pharmacy.address, 30)}
            {pharmacy.phone && "\n       Tel: " + pharmacy.phone}
            {"\n"}
            {LINE}
          </pre>

          {/* Invoice info */}
          <pre className="whitespace-pre-wrap text-[11px] mt-1">
            {"Factura: " + invoice.invoice_number}
            {"\n"}
            {"Fecha: " + formatDateVE(invoice.created_at)}
            {invoice.cashier_name && "\nCajero: " + invoice.cashier_name}
            {invoice.customer_name && "\nCliente: " + invoice.customer_name}
            {invoice.customer_ci && "\nC.I.: " + invoice.customer_ci}
            {invoice.customer_rif && "\nRIF: " + invoice.customer_rif}
          </pre>

          {/* Items header */}
          <pre className="whitespace-pre-wrap text-[11px] mt-1">
            {DASH}
            {"\n"}
            {"Cant  Producto         Precio     Total"}
            {"\n"}
            {DASH}
          </pre>

          {/* Item lines */}
          <pre className="whitespace-pre-wrap text-[11px]">
            {itemLines.join("\n")}
          </pre>

          {/* Totals */}
          <pre className="whitespace-pre-wrap text-[11px] mt-1">
            {DASH}
            {"\n"}
            {padRight("Subtotal:", WIDTH - 9) + padLeft(fmtUsd(invoice.subtotal_usd), 9)}
            {"\n"}
            {padRight("Descuento:", WIDTH - 9) + padLeft("-" + fmtUsd(invoice.discount_usd), 9)}
            {"\n"}
            {padRight("IVA (16%):", WIDTH - 9) + padLeft(fmtUsd(invoice.tax_usd), 9)}
            {"\n"}
            {" ".repeat(WIDTH - 9) + "---------"}
            {"\n"}
            {padRight("TOTAL USD:", WIDTH - 9) + padLeft(fmtUsd(invoice.total_usd), 9)}
            {"\n"}
            {padRight("TOTAL Bs:", WIDTH - fmtBs(invoice.total_bs).length) +
              fmtBs(invoice.total_bs)}
            {"\n"}
            {" ".repeat(WIDTH - 9) + "---------"}
          </pre>

          {/* Payment info */}
          <pre className="whitespace-pre-wrap text-[11px] mt-1">
            {"Tasa BCV: " +
              new Intl.NumberFormat("es-VE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(invoice.exchange_rate_used) +
              " Bs/$"}
            {"\n"}
            {"Metodo: " + (PAYMENT_LABELS[invoice.payment_method] || invoice.payment_method)}
            {invoice.payment_reference && "\nRef: " + invoice.payment_reference}
          </pre>

          {/* Footer */}
          <pre className="whitespace-pre-wrap text-center text-[11px] mt-2">
            {DASH}
            {"\n"}
            {"    Gracias por su compra!"}
            {"\n"}
            {LINE}
          </pre>
        </div>

        {/* Action buttons (hidden in print) */}
        <div className="receipt-no-print flex gap-3 w-full max-w-[320px]">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          {onNewSale && (
            <Button className="flex-1" onClick={onNewSale}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
