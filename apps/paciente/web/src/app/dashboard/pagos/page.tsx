"use client";

import { useState } from "react";
import {
  Wallet,
  Plus,
  CreditCard,
  Filter,
  Receipt,
  Trash2,
  Star,
  Smartphone,
  Building2,
  Mail,
  Banknote,
  ChevronRight,
} from "lucide-react";

import { PaymentCard } from "@/components/payments/payment-card";
import { PaymentSummary } from "@/components/payments/payment-summary";
import { PaymentMethodForm } from "@/components/payments/payment-method-form";
import { InvoicePreview } from "@/components/payments/invoice-preview";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";

import {
  usePayments,
  usePendingPayments,
  usePaymentMethods,
  usePaymentStats,
  useExchangeRate,
  useProcessPayment,
  useInvoice,
} from "@/hooks/use-payments";

import {
  type PaymentStatus,
  type PaymentType,
  type PaymentFilters,
  type PaymentMethodType,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_TYPE_LABELS,
  PAYMENT_METHOD_TYPE_LABELS,
  getMethodTypeLabel,
} from "@/lib/services/payments-service";

type TabValue = "pending" | "history" | "methods";

const METHOD_TYPE_ICONS: Record<PaymentMethodType, typeof CreditCard> = {
  tarjeta_credito: CreditCard,
  tarjeta_debito: CreditCard,
  pago_movil: Smartphone,
  transferencia: Building2,
  zelle: Mail,
  efectivo: Banknote,
};

export default function PagosPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("pending");
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedInvoicePaymentId, setSelectedInvoicePaymentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Data hooks
  const { payments, loading: paymentsLoading } = usePayments(filters);
  const { pendingPayments, loading: pendingLoading } = usePendingPayments();
  const {
    methods,
    loading: methodsLoading,
    saving: methodsSaving,
    addMethod,
    deleteMethod,
  } = usePaymentMethods();
  const { stats, loading: statsLoading } = usePaymentStats();
  const { rate: exchangeRate, updatedAt: exchangeRateUpdatedAt } = useExchangeRate();
  const { process: processPayment, loading: processingPayment } = useProcessPayment();
  const { invoice, loading: invoiceLoading } = useInvoice(selectedInvoicePaymentId);

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "Pendientes", value: "pending", count: pendingPayments.length },
    { label: "Historial", value: "history", count: payments.length },
    { label: "Metodos", value: "methods", count: methods.length },
  ];

  const handlePayNow = async (paymentId: string) => {
    const defaultMethod = methods.find((m) => m.is_default);
    if (!defaultMethod) {
      setActiveTab("methods");
      setShowAddMethod(true);
      return;
    }
    await processPayment(paymentId, defaultMethod.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Pagos
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus pagos y metodos de pago
          </p>
        </div>
        <button
          onClick={() => {
            setActiveTab("methods");
            setShowAddMethod(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar metodo</span>
        </button>
      </div>

      {/* Invoice preview modal */}
      {selectedInvoicePaymentId && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <InvoicePreview
              invoice={invoice}
              onClose={() => setSelectedInvoicePaymentId(null)}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      <PaymentSummary
        stats={stats}
        exchangeRate={exchangeRate}
        exchangeRateUpdatedAt={exchangeRateUpdatedAt}
        loading={statsLoading}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value
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

      {/* ── Pending Tab ── */}
      {activeTab === "pending" && (
        <div className="space-y-3">
          {pendingLoading ? (
            <SkeletonList count={2} />
          ) : pendingPayments.length > 0 ? (
            pendingPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPay={() => handlePayNow(payment.id)}
              />
            ))
          ) : (
            <EmptyState
              icon={Wallet}
              title="Sin pagos pendientes"
              description="No tienes pagos por realizar en este momento"
            />
          )}
        </div>
      )}

      {/* ── History Tab ── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter className="h-4 w-4" />
            Filtrar
            <ChevronRight
              className={`h-3.5 w-3.5 transition ${showFilters ? "rotate-90" : ""}`}
            />
          </button>

          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 bg-white border border-gray-100 rounded-xl">
              {/* Status filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Estado
                </label>
                <select
                  value={filters.status ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      status: (e.target.value as PaymentStatus) || undefined,
                    }))
                  }
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Type filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Tipo
                </label>
                <select
                  value={filters.type ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      type: (e.target.value as PaymentType) || undefined,
                    }))
                  }
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Todos</option>
                  {Object.entries(PAYMENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Date from */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.date_from ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      date_from: e.target.value || undefined,
                    }))
                  }
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              {/* Date to */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.date_to ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      date_to: e.target.value || undefined,
                    }))
                  }
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              {/* Clear */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({})}
                  className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {/* Payment list */}
          {paymentsLoading ? (
            <SkeletonList count={4} />
          ) : payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onDownloadInvoice={() =>
                    setSelectedInvoicePaymentId(payment.id)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="Sin historial de pagos"
              description="Tus pagos completados apareceran aqui"
            />
          )}
        </div>
      )}

      {/* ── Methods Tab ── */}
      {activeTab === "methods" && (
        <div className="space-y-4">
          {/* Add method form */}
          {showAddMethod && (
            <PaymentMethodForm
              onSubmit={async (data) => {
                const result = await addMethod(data);
                if (result.success) setShowAddMethod(false);
                return result;
              }}
              onCancel={() => setShowAddMethod(false)}
              saving={methodsSaving}
            />
          )}

          {/* Methods list */}
          {methodsLoading ? (
            <SkeletonList count={2} />
          ) : methods.length > 0 ? (
            <div className="space-y-3">
              {methods.map((method) => {
                const Icon =
                  METHOD_TYPE_ICONS[method.type] ?? CreditCard;
                return (
                  <div
                    key={method.id}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
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
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getMethodTypeLabel(method.type)}
                        {method.card_last_four &&
                          ` **** ${method.card_last_four}`}
                        {method.bank_name && ` - ${method.bank_name}`}
                        {method.zelle_email && ` - ${method.zelle_email}`}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMethod(method.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : !showAddMethod ? (
            <EmptyState
              icon={CreditCard}
              title="Sin metodos de pago"
              description="Agrega un metodo de pago para realizar transacciones"
            />
          ) : null}

          {/* Add button (when form is hidden) */}
          {!showAddMethod && (
            <button
              onClick={() => setShowAddMethod(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition"
            >
              <Plus className="h-4 w-4" />
              Agregar metodo de pago
            </button>
          )}
        </div>
      )}
    </div>
  );
}
