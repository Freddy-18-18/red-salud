"use client";

import { useState, type FormEvent } from "react";
import { useInsurance } from "@/hooks/use-insurance";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import {
  FileCheck,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Shield,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  type CreatePreauthorizationData,
  getPreauthorizationStatusConfig,
  formatCurrency,
} from "@/lib/services/insurance-service";

type TabValue = "all" | "pending" | "approved" | "denied";

export default function PreauthorizationsPage() {
  const {
    preauthorizations,
    activeInsurances,
    loading,
    saving,
    error,
    requestPreauthorization,
  } = useInsurance();

  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [insuranceId, setInsuranceId] = useState("");
  const [procedureCode, setProcedureCode] = useState("");
  const [procedureDescription, setProcedureDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const filtered =
    activeTab === "all"
      ? preauthorizations
      : preauthorizations.filter((p) => p.status === activeTab);

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "Todas", value: "all", count: preauthorizations.length },
    {
      label: "Pendientes",
      value: "pending",
      count: preauthorizations.filter((p) => p.status === "pending").length,
    },
    {
      label: "Aprobadas",
      value: "approved",
      count: preauthorizations.filter((p) => p.status === "approved").length,
    },
    {
      label: "Denegadas",
      value: "denied",
      count: preauthorizations.filter((p) => p.status === "denied").length,
    },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data: CreatePreauthorizationData = {
      insurance_id: insuranceId,
      procedure_code: procedureCode.trim() || null,
      procedure_description: procedureDescription.trim(),
      estimated_cost: parseFloat(estimatedCost) || 0,
    };

    const result = await requestPreauthorization(data);
    if (result.success) {
      setShowForm(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setInsuranceId(activeInsurances[0]?.id ?? "");
    setProcedureCode("");
    setProcedureDescription("");
    setEstimatedCost("");
  };

  const formValid =
    insuranceId && procedureDescription.trim() && parseFloat(estimatedCost) > 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return CheckCircle2;
      case "denied":
        return XCircle;
      case "expired":
        return AlertCircle;
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
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Solicitar Pre-autorizacion
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
              Necesitas tener al menos un seguro activo para solicitar
              pre-autorizaciones.
            </p>
            <a
              href="/dashboard/seguro"
              className="inline-flex items-center mt-3 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
            >
              Agregar Seguro
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Procedure description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procedimiento *
              </label>
              <input
                type="text"
                value={procedureDescription}
                onChange={(e) => setProcedureDescription(e.target.value)}
                placeholder="Ej: Consulta Cardiologia, Resonancia Magnetica..."
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Procedure code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codigo del Procedimiento
              </label>
              <input
                type="text"
                value={procedureCode}
                onChange={(e) => setProcedureCode(e.target.value)}
                placeholder="Opcional, ej: CPT-99213"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Estimated cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo Estimado (Bs.) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                required
              />
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
                {saving ? "Enviando..." : "Solicitar Autorizacion"}
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
              Autorizaciones
            </h1>
            <p className="text-gray-500 mt-1">
              Pre-autorizaciones de tu seguro
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
          <span className="hidden sm:inline">Solicitar</span>
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
          {filtered.map((preauth) => {
            const statusConfig = getPreauthorizationStatusConfig(
              preauth.status
            );
            const StatusIcon = getStatusIcon(preauth.status);

            return (
              <div
                key={preauth.id}
                className="p-4 bg-white border border-gray-100 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig.bg}`}
                  >
                    <StatusIcon className={`h-5 w-5 ${statusConfig.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {preauth.procedure_description}
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
                          {preauth.insurance?.insurance_company ?? "Seguro"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(preauth.created_at)}</span>
                      </div>
                      {preauth.procedure_code && (
                        <span className="font-mono text-gray-400">
                          {preauth.procedure_code}
                        </span>
                      )}
                    </div>

                    {/* Financial details */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">Estimado:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(preauth.estimated_cost)}
                        </span>
                      </div>
                      {preauth.covered_amount > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span className="text-gray-500">Cubierto:</span>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(preauth.covered_amount)}
                          </span>
                        </div>
                      )}
                      {preauth.copay_amount > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-500">Copago:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(preauth.copay_amount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {preauth.authorization_number && (
                      <p className="text-xs text-gray-500 mt-1.5">
                        No. Autorizacion:{" "}
                        <span className="font-mono font-medium text-gray-700">
                          {preauth.authorization_number}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileCheck}
          title={
            activeTab === "all"
              ? "No tienes autorizaciones"
              : `No hay autorizaciones ${
                  activeTab === "pending"
                    ? "pendientes"
                    : activeTab === "approved"
                      ? "aprobadas"
                      : "denegadas"
                }`
          }
          description={
            activeTab === "all"
              ? "Solicita una pre-autorizacion para tus procedimientos medicos"
              : undefined
          }
        />
      )}
    </div>
  );
}
