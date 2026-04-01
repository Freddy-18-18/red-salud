"use client";

import {
  FileText,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  ClipboardList,
  X,
  Shield,
  Calendar,
  Send,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { useInsurance } from "@/hooks/use-insurance";
import {
  type CreateClaimData,
  type ClaimType,
  type ClaimStatus,
  getClaimStatusConfig,
  getClaimTypeLabel,
  formatCurrency,
  CLAIM_TYPES,
} from "@/lib/services/insurance-service";

type TabValue = "all" | "active" | "paid" | "denied";

export default function ClaimsPage() {
  const {
    claims,
    activeInsurances,
    loading,
    saving,
    error,
    createClaim,
    submitClaim,
  } = useInsurance();

  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [showForm, setShowForm] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Form state
  const [insuranceId, setInsuranceId] = useState("");
  const [claimType, setClaimType] = useState<ClaimType>("consulta");
  const [totalAmount, setTotalAmount] = useState("");

  const activeClaims = claims.filter((c) =>
    ["draft", "submitted", "in_review"].includes(c.status)
  );
  const paidClaims = claims.filter((c) =>
    ["approved", "partially_approved", "paid"].includes(c.status)
  );
  const deniedClaims = claims.filter((c) => c.status === "denied");

  const filtered =
    activeTab === "all"
      ? claims
      : activeTab === "active"
        ? activeClaims
        : activeTab === "paid"
          ? paidClaims
          : deniedClaims;

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "Todos", value: "all", count: claims.length },
    { label: "Activos", value: "active", count: activeClaims.length },
    { label: "Pagados", value: "paid", count: paidClaims.length },
    { label: "Denegados", value: "denied", count: deniedClaims.length },
  ];

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    const data: CreateClaimData = {
      insurance_id: insuranceId,
      claim_type: claimType,
      total_amount: parseFloat(totalAmount) || 0,
    };

    const result = await createClaim(data);
    if (result.success) {
      setShowForm(false);
      resetForm();
    }
  };

  const handleSubmitClaim = async (claimId: string) => {
    setSubmittingId(claimId);
    await submitClaim(claimId);
    setSubmittingId(null);
  };

  const resetForm = () => {
    setInsuranceId(activeInsurances[0]?.id ?? "");
    setClaimType("consulta");
    setTotalAmount("");
  };

  const formValid =
    insuranceId && claimType && parseFloat(totalAmount) > 0;

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case "paid":
        return DollarSign;
      case "approved":
      case "partially_approved":
        return CheckCircle2;
      case "denied":
        return XCircle;
      case "in_review":
      case "submitted":
        return ClipboardList;
      default:
        return Clock;
    }
  };

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("es-VE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <SkeletonList count={3} />
      </div>
    );
  }

  // Show form
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Nuevo Reclamo
            </h2>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeInsurances.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              Necesitas tener al menos un seguro activo para crear reclamos.
            </p>
            <a
              href="/dashboard/seguro"
              className="inline-flex items-center mt-3 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
            >
              Agregar Seguro
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            {/* Select insurance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seguro *
              </label>
              <select
                value={insuranceId}
                onChange={(e) => setInsuranceId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none"
                required
              >
                <option value="">Seleccionar seguro</option>
                {activeInsurances.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.insurance_company} - {ins.plan_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Claim type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Reclamo *
              </label>
              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value as ClaimType)}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none"
                required
              >
                {CLAIM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Total (Bs.) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                El reclamo se creara como borrador. Podras enviarlo a tu
                aseguradora una vez que estes listo.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !formValid}
                className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Creando..." : "Crear Reclamo"}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard/seguro"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Reclamaciones
            </h1>
            <p className="text-gray-500 mt-1">
              Gestiona tus reclamos de seguro
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Reclamo</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg transition whitespace-nowrap ${
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((claim) => {
            const statusConfig = getClaimStatusConfig(claim.status);
            const StatusIcon = getStatusIcon(claim.status);

            return (
              <div
                key={claim.id}
                className="p-4 bg-white border border-gray-100 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig.bg}`}
                  >
                    <StatusIcon
                      className={`h-5 w-5 ${statusConfig.text}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {getClaimTypeLabel(claim.claim_type)}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        <span>
                          {claim.insurance?.insurance_company ?? "Seguro"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(claim.created_at)}</span>
                      </div>
                      {claim.claim_number && (
                        <span className="font-mono text-gray-400">
                          #{claim.claim_number}
                        </span>
                      )}
                    </div>

                    {/* Financial details */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">Total:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(claim.total_amount)}
                        </span>
                      </div>
                      {claim.covered_amount > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span className="text-gray-500">Cubierto:</span>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(claim.covered_amount)}
                          </span>
                        </div>
                      )}
                      {claim.patient_responsibility > 0 &&
                        claim.status !== "draft" && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-gray-500">Tu parte:</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(claim.patient_responsibility)}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Status timeline for active claims */}
                    {["draft", "submitted", "in_review"].includes(
                      claim.status
                    ) && (
                      <div className="flex items-center gap-1 mt-3">
                        {(
                          [
                            "draft",
                            "submitted",
                            "in_review",
                            "approved",
                          ] as const
                        ).map((step, index) => {
                          const stepOrder = [
                            "draft",
                            "submitted",
                            "in_review",
                            "approved",
                          ];
                          const currentIndex = stepOrder.indexOf(
                            claim.status
                          );
                          const isCompleted = index <= currentIndex;
                          const isCurrent = step === claim.status;
                          return (
                            <div key={step} className="flex items-center gap-1">
                              {index > 0 && (
                                <div
                                  className={`h-0.5 w-4 sm:w-8 rounded-full ${
                                    isCompleted
                                      ? "bg-emerald-400"
                                      : "bg-gray-200"
                                  }`}
                                />
                              )}
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isCurrent
                                    ? "bg-emerald-500 ring-2 ring-emerald-200"
                                    : isCompleted
                                      ? "bg-emerald-400"
                                      : "bg-gray-200"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions for draft claims */}
                    {claim.status === "draft" && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleSubmitClaim(claim.id)}
                          disabled={
                            saving || submittingId === claim.id
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" />
                          {submittingId === claim.id
                            ? "Enviando..."
                            : "Enviar Reclamo"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={
            activeTab === "all"
              ? "No tienes reclamaciones"
              : `No hay reclamos ${
                  activeTab === "active"
                    ? "activos"
                    : activeTab === "paid"
                      ? "pagados"
                      : "denegados"
                }`
          }
          description={
            activeTab === "all"
              ? "Crea un reclamo para solicitar reembolso de gastos medicos"
              : undefined
          }
        />
      )}
    </div>
  );
}
