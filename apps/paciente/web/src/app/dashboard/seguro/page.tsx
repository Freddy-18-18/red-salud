"use client";

import {
  Shield,
  Plus,
  ShieldCheck,
  FileCheck,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

import { CoverageDetail } from "@/components/insurance/coverage-detail";
import { InsuranceCard } from "@/components/insurance/insurance-card";
import { InsuranceForm } from "@/components/insurance/insurance-form";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { useInsurance } from "@/hooks/use-insurance";
import {
  type PatientInsurance,
  type CreateInsuranceData,
  getPreauthorizationStatusConfig,
  getClaimStatusConfig,
  getClaimTypeLabel,
  formatCurrency,
} from "@/lib/services/insurance-service";

type ModalView = "none" | "add" | "edit" | "coverage";

export default function InsuranceHubPage() {
  const {
    insurances,
    activeInsurances,
    recentPreauthorizations,
    recentClaims,
    loading,
    saving,
    error,
    addInsurance,
    updateInsurance,
  } = useInsurance();

  const [modalView, setModalView] = useState<ModalView>("none");
  const [selectedInsurance, setSelectedInsurance] =
    useState<PatientInsurance | null>(null);

  const handleAdd = async (data: CreateInsuranceData) => {
    const result = await addInsurance(data);
    return { success: result.success };
  };

  const handleEdit = async (data: CreateInsuranceData) => {
    if (!selectedInsurance) return { success: false };
    return updateInsurance(selectedInsurance.id, data);
  };

  const openEdit = (insurance: PatientInsurance) => {
    setSelectedInsurance(insurance);
    setModalView("edit");
  };

  const openCoverage = (insurance: PatientInsurance) => {
    setSelectedInsurance(insurance);
    setModalView("coverage");
  };

  const closeModal = () => {
    setModalView("none");
    setSelectedInsurance(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <SkeletonList count={2} />
      </div>
    );
  }

  // Show modal overlays
  if (modalView === "add") {
    return (
      <div className="max-w-2xl mx-auto">
        <InsuranceForm
          onSubmit={handleAdd}
          onCancel={closeModal}
          saving={saving}
        />
      </div>
    );
  }

  if (modalView === "edit" && selectedInsurance) {
    return (
      <div className="max-w-2xl mx-auto">
        <InsuranceForm
          initialData={selectedInsurance}
          onSubmit={handleEdit}
          onCancel={closeModal}
          saving={saving}
        />
      </div>
    );
  }

  if (modalView === "coverage" && selectedInsurance) {
    return (
      <div className="max-w-2xl mx-auto">
        <CoverageDetail insurance={selectedInsurance} onClose={closeModal} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mi Seguro
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus polizas, autorizaciones y reclamos
          </p>
        </div>
        <button
          onClick={() => setModalView("add")}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Agregar Poliza</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Insurance cards */}
      {insurances.length > 0 ? (
        <div className="space-y-4">
          {insurances.map((ins) => (
            <InsuranceCard
              key={ins.id}
              insurance={ins}
              onViewCoverage={() => openCoverage(ins)}
              onEdit={() => openEdit(ins)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Shield}
          title="No tienes seguros registrados"
          description="Agrega tu poliza de seguro para gestionar coberturas, autorizaciones y reclamos"
          action={{
            label: "Agregar Poliza",
            href: "#",
          }}
        />
      )}

      {/* Quick stats */}
      {activeInsurances.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {activeInsurances.length}
                </p>
                <p className="text-xs text-gray-500">Polizas activas</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    recentPreauthorizations.filter(
                      (p) => p.status === "pending"
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    recentPreauthorizations.filter(
                      (p) => p.status === "approved"
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-500">Aprobadas</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {recentClaims.filter((c) => c.status === "paid").length}
                </p>
                <p className="text-xs text-gray-500">Pagadas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Preauthorizations */}
      {recentPreauthorizations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Autorizaciones Recientes
            </h2>
            <a
              href="/dashboard/seguro/autorizaciones"
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="space-y-2">
            {recentPreauthorizations.map((preauth) => {
              const statusConfig = getPreauthorizationStatusConfig(
                preauth.status
              );
              const StatusIcon =
                preauth.status === "approved"
                  ? CheckCircle2
                  : preauth.status === "denied"
                    ? XCircle
                    : preauth.status === "expired"
                      ? AlertCircle
                      : Clock;
              return (
                <div
                  key={preauth.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusConfig.bg}`}
                  >
                    <StatusIcon
                      className={`h-4 w-4 ${statusConfig.text}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {preauth.procedure_description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {preauth.insurance?.insurance_company ?? "Seguro"}{" "}
                      {preauth.covered_amount > 0 &&
                        `-- ${formatCurrency(preauth.covered_amount)} cubierto`}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Claims */}
      {recentClaims.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Reclamaciones
            </h2>
            <a
              href="/dashboard/seguro/reclamaciones"
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="space-y-2">
            {recentClaims.map((claim) => {
              const statusConfig = getClaimStatusConfig(claim.status);
              const StatusIcon =
                claim.status === "paid"
                  ? DollarSign
                  : claim.status === "approved" ||
                      claim.status === "partially_approved"
                    ? CheckCircle2
                    : claim.status === "denied"
                      ? XCircle
                      : claim.status === "in_review" ||
                          claim.status === "submitted"
                        ? ClipboardList
                        : FileText;
              return (
                <div
                  key={claim.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusConfig.bg}`}
                  >
                    <StatusIcon
                      className={`h-4 w-4 ${statusConfig.text}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getClaimTypeLabel(claim.claim_type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(claim.total_amount)} reclamado
                      {claim.covered_amount > 0 &&
                        ` -- ${formatCurrency(claim.covered_amount)} cubierto`}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No data prompts */}
      {insurances.length > 0 &&
        recentPreauthorizations.length === 0 &&
        recentClaims.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/dashboard/seguro/autorizaciones"
              className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 mb-3 group-hover:scale-110 transition-transform">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Autorizaciones
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Solicita pre-autorizaciones para procedimientos
              </p>
            </a>
            <a
              href="/dashboard/seguro/reclamaciones"
              className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Reclamaciones
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Crea y gestiona tus reclamos de seguro
              </p>
            </a>
          </div>
        )}
    </div>
  );
}
