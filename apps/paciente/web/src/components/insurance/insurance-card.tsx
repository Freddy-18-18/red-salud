"use client";

import {
  Shield,
  Calendar,
  CreditCard,
  Users,
  User,
  Building,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import {
  type PatientInsurance,
  getCoverageTypeLabel,
  isInsuranceExpired,
  isInsuranceExpiringSoon,
} from "@/lib/services/insurance-service";

interface InsuranceCardProps {
  insurance: PatientInsurance;
  onViewCoverage?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-VE", {
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const COVERAGE_TYPE_ICONS = {
  individual: User,
  familiar: Users,
  colectivo: Building,
} as const;

export function InsuranceCard({
  insurance,
  onViewCoverage,
  onEdit,
  compact = false,
}: InsuranceCardProps) {
  const [copied, setCopied] = useState(false);

  const expired = isInsuranceExpired(insurance.valid_until);
  const expiringSoon = isInsuranceExpiringSoon(insurance.valid_until);
  const CoverageIcon =
    COVERAGE_TYPE_ICONS[insurance.coverage_type] ?? Shield;

  const handleCopyPolicy = async () => {
    try {
      await navigator.clipboard.writeText(insurance.policy_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  if (compact) {
    return (
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {insurance.insurance_company}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {insurance.plan_name}
            </p>
          </div>
          {insurance.is_active && !expired ? (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
              Activo
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700">
              {expired ? "Vencido" : "Inactivo"}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span className="text-sm font-medium opacity-90">Seguro Medico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CoverageIcon className="h-4 w-4 opacity-80" />
            <span className="text-xs opacity-80">
              {getCoverageTypeLabel(insurance.coverage_type)}
            </span>
          </div>
        </div>

        {/* Company & plan */}
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          {insurance.insurance_company}
        </h2>
        <p className="text-sm opacity-90 mb-5">Plan: {insurance.plan_name}</p>

        {/* Card details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
              Poliza
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold tracking-wide">
                {insurance.policy_number}
              </p>
              <button
                onClick={handleCopyPolicy}
                className="p-0.5 rounded hover:bg-white/20 transition"
                title="Copiar numero de poliza"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3 opacity-70" />
                )}
              </button>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
              Miembro ID
            </p>
            <p className="text-sm font-semibold">{insurance.member_id}</p>
          </div>
          {insurance.group_number && (
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                Grupo
              </p>
              <p className="text-sm font-semibold">
                {insurance.group_number}
              </p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
              Vigencia
            </p>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 opacity-70" />
              <p className="text-sm font-semibold">
                {formatDate(insurance.valid_from)} -{" "}
                {formatDate(insurance.valid_until)}
              </p>
            </div>
          </div>
        </div>

        {/* Status & actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <div className="flex items-center gap-2">
            {insurance.is_active && !expired ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                Activo
              </span>
            ) : expired ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-300" />
                Vencido
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Inactivo
              </span>
            )}

            {expiringSoon && !expired && (
              <span className="text-xs opacity-80">
                Vence pronto
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onViewCoverage && (
              <button
                onClick={onViewCoverage}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/20 hover:bg-white/30 transition"
              >
                Ver cobertura
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/20 hover:bg-white/30 transition"
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small "digital card" variant for sharing with providers
export function InsuranceDigitalCard({
  insurance,
}: {
  insurance: PatientInsurance;
}) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Tarjeta de Seguro Digital</p>
          <p className="text-sm font-bold text-gray-900">
            {insurance.insurance_company}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Plan</span>
          <span className="font-medium text-gray-900">
            {insurance.plan_name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Poliza</span>
          <span className="font-mono font-medium text-gray-900">
            {insurance.policy_number}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Miembro</span>
          <span className="font-mono font-medium text-gray-900">
            {insurance.member_id}
          </span>
        </div>
        {insurance.group_number && (
          <div className="flex justify-between">
            <span className="text-gray-500">Grupo</span>
            <span className="font-mono font-medium text-gray-900">
              {insurance.group_number}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Vigencia</span>
          <span className="font-medium text-gray-900">
            {formatDate(insurance.valid_from)} -{" "}
            {formatDate(insurance.valid_until)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tipo</span>
          <span className="font-medium text-gray-900">
            {getCoverageTypeLabel(insurance.coverage_type)}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center">
        {insurance.is_active ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Poliza Activa
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Poliza Inactiva
          </span>
        )}
      </div>
    </div>
  );
}
