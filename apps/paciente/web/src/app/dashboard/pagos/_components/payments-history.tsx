"use client";

import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  Receipt,
  Smartphone,
  Stethoscope,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useDollarRate } from "@/hooks/use-currency";
import { formatBs, formatUsd } from "@/lib/services/currency-service";

export interface PaymentRow {
  id: string;
  amount: number | string;
  currency: string;
  exchange_rate: number | string | null;
  reference_number: string | null;
  bank_origin: string | null;
  bank_destination: string | null;
  payment_date: string;
  status: "pending" | "approved" | "rejected";
  payment_method: string | null;
  payment_type: string | null;
  description: string | null;
  appointment_id: string | null;
  created_at: string;
  appointment?:
    | {
        id: string;
        scheduled_at: string;
        doctor?:
          | { full_name?: string | null }
          | Array<{ full_name?: string | null }>
          | null;
      }
    | Array<{
        id: string;
        scheduled_at: string;
        doctor?:
          | { full_name?: string | null }
          | Array<{ full_name?: string | null }>
          | null;
      }>
    | null;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_CONFIG: Record<
  PaymentRow["status"],
  { label: string; bg: string; text: string; icon: LucideIcon }
> = {
  pending: {
    label: "Pendiente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: Clock,
  },
  approved: {
    label: "Aprobado",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rechazado",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: XCircle,
  },
};

const METHOD_ICON: Record<string, LucideIcon> = {
  pago_movil: Smartphone,
  transferencia: Wallet,
  zelle: Mail,
  efectivo: Banknote,
  tarjeta_credito: CreditCard,
  tarjeta_debito: CreditCard,
};

const METHOD_LABEL: Record<string, string> = {
  pago_movil: "Pago Móvil",
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  zelle: "Zelle",
  tarjeta_credito: "Tarjeta de crédito",
  tarjeta_debito: "Tarjeta de débito",
};

const TYPE_LABEL: Record<string, string> = {
  consulta: "Consulta",
  laboratorio: "Laboratorio",
  farmacia: "Farmacia",
  procedimiento: "Procedimiento",
  emergencia: "Emergencia",
  telemedicina: "Telemedicina",
  otro: "Otro",
};

function unwrap<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDateLong(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

interface PaymentsHistoryProps {
  payments: PaymentRow[];
}

export function PaymentsHistory({ payments }: PaymentsHistoryProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const { rate } = useDollarRate("oficial");

  const filtered = useMemo(() => {
    if (filter === "all") return payments;
    return payments.filter((p) => p.status === filter);
  }, [payments, filter]);

  const totals = useMemo(() => {
    let approvedUsd = 0;
    let pendingUsd = 0;
    for (const p of payments) {
      const amount = Number(p.amount);
      const inUsd =
        p.currency === "USD"
          ? amount
          : Number(p.exchange_rate ?? 0) > 0
            ? amount / Number(p.exchange_rate)
            : 0;
      if (p.status === "approved") approvedUsd += inUsd;
      else if (p.status === "pending") pendingUsd += inUsd;
    }
    return { approvedUsd, pendingUsd, count: payments.length };
  }, [payments]);

  const tabs: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: "all", label: "Todos", count: payments.length },
    {
      value: "pending",
      label: "Pendientes",
      count: payments.filter((p) => p.status === "pending").length,
    },
    {
      value: "approved",
      label: "Aprobados",
      count: payments.filter((p) => p.status === "approved").length,
    },
    {
      value: "rejected",
      label: "Rechazados",
      count: payments.filter((p) => p.status === "rejected").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Historial de pagos
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Tus pagos registrados en Red-Salud
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          icon={CheckCircle2}
          tone="emerald"
          label="Pagado y confirmado"
          primary={formatUsd(totals.approvedUsd)}
          secondary={
            rate ? formatBs(totals.approvedUsd * rate.rate) : "—"
          }
        />
        <SummaryCard
          icon={Clock}
          tone="amber"
          label="Pendiente de verificación"
          primary={formatUsd(totals.pendingUsd)}
          secondary={
            rate ? formatBs(totals.pendingUsd * rate.rate) : "—"
          }
        />
        <SummaryCard
          icon={Receipt}
          tone="gray"
          label="Movimientos"
          primary={String(totals.count)}
          secondary="últimos 100"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg transition ${
              filter === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.value
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <Receipt className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900">
            Sin pagos en esta categoría
          </p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Cuando registres pagos en tus citas aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} bcvRate={rate?.rate ?? null} />
          ))}
        </ul>
      )}
    </div>
  );
}

interface SummaryCardProps {
  icon: LucideIcon;
  tone: "emerald" | "amber" | "gray";
  label: string;
  primary: string;
  secondary: string;
}

function SummaryCard({ icon: Icon, tone, label, primary, secondary }: SummaryCardProps) {
  const palette =
    tone === "emerald"
      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 border-amber-100 text-amber-700"
        : "bg-gray-50 border-gray-200 text-gray-700";
  return (
    <div className={`p-4 rounded-2xl border ${palette}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="text-xl font-semibold mt-1">{primary}</p>
      <p className="text-xs opacity-80 mt-0.5">{secondary}</p>
    </div>
  );
}

interface PaymentCardProps {
  payment: PaymentRow;
  bcvRate: number | null;
}

function PaymentCard({ payment, bcvRate }: PaymentCardProps) {
  const status = STATUS_CONFIG[payment.status];
  const StatusIcon = status.icon;
  const MethodIcon: LucideIcon = payment.payment_method
    ? (METHOD_ICON[payment.payment_method] ?? Wallet)
    : Wallet;

  const appointment = unwrap(payment.appointment);
  const doctor = unwrap(appointment?.doctor ?? null);
  const doctorName = doctor?.full_name ?? null;

  const amount = Number(payment.amount);
  const exchangeRate = Number(payment.exchange_rate ?? 0);
  const isUsd = payment.currency === "USD";
  const usdAmount = isUsd
    ? amount
    : exchangeRate > 0
      ? amount / exchangeRate
      : 0;
  const bsAmount = isUsd
    ? exchangeRate > 0
      ? amount * exchangeRate
      : bcvRate != null
        ? amount * bcvRate
        : null
    : amount;

  const card = (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition">
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bg}`}
        >
          <StatusIcon className={`h-5 w-5 ${status.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {payment.description ??
                  TYPE_LABEL[payment.payment_type ?? ""] ??
                  "Pago"}
              </p>
              {doctorName && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Dr. {doctorName}
                </p>
              )}
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text} whitespace-nowrap`}
            >
              {status.label}
            </span>
          </div>

          {/* Amount */}
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className="text-base font-semibold text-gray-900">
              {formatUsd(usdAmount)}
            </span>
            {bsAmount != null && (
              <span className="text-xs text-gray-500">
                ({formatBs(bsAmount)})
              </span>
            )}
            {exchangeRate > 0 && (
              <span className="text-[10px] text-gray-400">
                · BCV {exchangeRate.toFixed(2)}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(payment.payment_date)}
            </span>
            {payment.payment_method && (
              <span className="flex items-center gap-1">
                <MethodIcon className="h-3 w-3" />
                {METHOD_LABEL[payment.payment_method] ?? payment.payment_method}
              </span>
            )}
            {payment.reference_number && (
              <span className="text-gray-600">
                Ref. {payment.reference_number}
              </span>
            )}
          </div>

          {payment.bank_origin && (
            <p className="text-xs text-gray-500 mt-1">
              Origen: {payment.bank_origin}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Wrap in a link to the related appointment when available.
  if (payment.appointment_id) {
    return (
      <li>
        <Link href={`/dashboard/citas/${payment.appointment_id}`} className="block">
          {card}
        </Link>
      </li>
    );
  }
  return <li>{card}</li>;
}

// `AlertCircle` import was kept for potential future error states; suppress
// the unused-warning from strict TS by aliasing it.
void AlertCircle;
