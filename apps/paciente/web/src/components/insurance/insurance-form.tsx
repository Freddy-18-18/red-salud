"use client";

import { Shield, X, ChevronDown } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  type CreateInsuranceData,
  type CoverageType,
  type CoverageDetails,
  type PatientInsurance,
  COVERAGE_TYPES,
  KNOWN_INSURANCE_COMPANIES,
} from "@/lib/services/insurance-service";

interface InsuranceFormProps {
  initialData?: PatientInsurance | null;
  onSubmit: (data: CreateInsuranceData) => Promise<{ success: boolean }>;
  onCancel: () => void;
  saving?: boolean;
}

const COVERAGE_KEYS = [
  { key: "consultas" as const, label: "Consultas" },
  { key: "laboratorio" as const, label: "Laboratorio" },
  { key: "farmacia" as const, label: "Farmacia" },
  { key: "emergencia" as const, label: "Emergencia" },
  { key: "hospitalizacion" as const, label: "Hospitalizacion" },
] as const;

export function InsuranceForm({
  initialData,
  onSubmit,
  onCancel,
  saving = false,
}: InsuranceFormProps) {
  const [company, setCompany] = useState(
    initialData?.insurance_company ?? ""
  );
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [planName, setPlanName] = useState(initialData?.plan_name ?? "");
  const [policyNumber, setPolicyNumber] = useState(
    initialData?.policy_number ?? ""
  );
  const [memberId, setMemberId] = useState(initialData?.member_id ?? "");
  const [groupNumber, setGroupNumber] = useState(
    initialData?.group_number ?? ""
  );
  const [coverageType, setCoverageType] = useState<CoverageType>(
    initialData?.coverage_type ?? "individual"
  );
  const [validFrom, setValidFrom] = useState(initialData?.valid_from ?? "");
  const [validUntil, setValidUntil] = useState(
    initialData?.valid_until ?? ""
  );

  // Coverage details
  const initialCoverage = initialData?.coverage_details ?? {};
  const [coverageDetails, setCoverageDetails] =
    useState<CoverageDetails>(initialCoverage);

  const filteredCompanies = company.trim()
    ? KNOWN_INSURANCE_COMPANIES.filter((c) =>
        c.toLowerCase().includes(company.toLowerCase())
      )
    : KNOWN_INSURANCE_COMPANIES;

  const handleCoverageChange = (
    key: keyof CoverageDetails,
    field: string,
    value: string
  ) => {
    setCoverageDetails((prev) => {
      const existing = prev[key] ?? {};
      const numValue = value === "" ? undefined : Number(value);
      if (field === "requires_preauth") {
        return {
          ...prev,
          [key]: { ...existing, requires_preauth: value === "true" },
        };
      }
      return {
        ...prev,
        [key]: { ...existing, [field]: numValue },
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const data: CreateInsuranceData = {
      insurance_company: company.trim(),
      plan_name: planName.trim(),
      policy_number: policyNumber.trim(),
      member_id: memberId.trim(),
      group_number: groupNumber.trim() || null,
      coverage_type: coverageType,
      valid_from: validFrom,
      valid_until: validUntil,
      coverage_details: coverageDetails,
    };

    const result = await onSubmit(data);
    if (result.success) {
      onCancel();
    }
  };

  const isValid =
    company.trim() &&
    planName.trim() &&
    policyNumber.trim() &&
    memberId.trim() &&
    validFrom &&
    validUntil;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {initialData ? "Editar Seguro" : "Agregar Seguro"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Basic info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Informacion del Seguro
        </h3>

        {/* Insurance company with autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aseguradora *
          </label>
          <div className="relative">
            <input
              type="text"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setShowCompanyDropdown(true);
              }}
              onFocus={() => setShowCompanyDropdown(true)}
              onBlur={() => {
                // Delay to allow click on dropdown item
                setTimeout(() => setShowCompanyDropdown(false), 200);
              }}
              placeholder="Ej: Seguros Horizonte"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              required
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {showCompanyDropdown && filteredCompanies.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredCompanies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCompany(c);
                    setShowCompanyDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Plan name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Plan *
          </label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Ej: Familiar Plus"
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            required
          />
        </div>

        {/* Policy number & Member ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero de Poliza *
            </label>
            <input
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="Ej: SH-2024-00123"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Miembro *
            </label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Ej: MBR-00456"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        {/* Group number & Coverage type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero de Grupo
            </label>
            <input
              type="text"
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
              placeholder="Opcional"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cobertura *
            </label>
            <select
              value={coverageType}
              onChange={(e) =>
                setCoverageType(e.target.value as CoverageType)
              }
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none"
            >
              {COVERAGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigencia Desde *
            </label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigencia Hasta *
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              required
            />
          </div>
        </div>
      </div>

      {/* Coverage details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Detalles de Cobertura
        </h3>
        <p className="text-xs text-gray-400">
          Configura los porcentajes y montos cubiertos por tu poliza. Todos
          los campos son opcionales.
        </p>

        <div className="space-y-3">
          {COVERAGE_KEYS.map(({ key, label }) => {
            const data = coverageDetails[key];
            return (
              <div
                key={key}
                className="p-3 bg-gray-50 border border-gray-100 rounded-xl"
              >
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {label}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">
                      Cubierto %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={data?.covered_pct ?? ""}
                      onChange={(e) =>
                        handleCoverageChange(
                          key,
                          "covered_pct",
                          e.target.value
                        )
                      }
                      placeholder="80"
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">
                      Copago Bs
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data?.copay ?? ""}
                      onChange={(e) =>
                        handleCoverageChange(key, "copay", e.target.value)
                      }
                      placeholder="0"
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">
                      Limite Bs
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data?.limit ?? ""}
                      onChange={(e) =>
                        handleCoverageChange(key, "limit", e.target.value)
                      }
                      placeholder="0"
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>
                {key === "hospitalizacion" && (
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          (
                            coverageDetails.hospitalizacion as
                              | CoverageDetails["hospitalizacion"]
                              | undefined
                          )?.requires_preauth ?? false
                        }
                        onChange={(e) =>
                          handleCoverageChange(
                            "hospitalizacion",
                            "requires_preauth",
                            e.target.checked ? "true" : "false"
                          )
                        }
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Requiere pre-autorizacion
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !isValid}
          className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving
            ? "Guardando..."
            : initialData
              ? "Guardar Cambios"
              : "Agregar Seguro"}
        </button>
      </div>
    </form>
  );
}
