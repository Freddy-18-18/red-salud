"use client";

import { useState } from "react";
import {
  Syringe,
  Plus,
  Calendar,
  Building,
  Hash,
  StickyNote,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
  Loader2,
  Check,
} from "lucide-react";
import {
  type VaccinationRecord as VaccRecord,
  type CreateVaccinationData,
} from "@/lib/services/documents-service";

// Common vaccines in Venezuela / Latin America
const COMMON_VACCINES = [
  "COVID-19 (Pfizer)",
  "COVID-19 (Moderna)",
  "COVID-19 (AstraZeneca)",
  "COVID-19 (Sinopharm)",
  "COVID-19 (Sputnik V)",
  "Influenza",
  "Hepatitis A",
  "Hepatitis B",
  "Fiebre Amarilla",
  "Tetanos",
  "Triple Viral (MMR)",
  "Varicela",
  "Neumococo",
  "Meningococo",
  "VPH",
  "Polio",
  "BCG",
  "Rotavirus",
  "DPT",
  "Otra",
];

interface VaccinationRecordProps {
  vaccinations: VaccRecord[];
  upcomingVaccines: VaccRecord[];
  loading: boolean;
  saving: boolean;
  onAdd: (data: CreateVaccinationData) => Promise<{ success: boolean }>;
  onDelete: (id: string) => Promise<{ success: boolean }>;
}

export function VaccinationRecord({
  vaccinations,
  upcomingVaccines,
  loading,
  saving,
  onAdd,
  onDelete,
}: VaccinationRecordProps) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form state
  const [vaccineName, setVaccineName] = useState("");
  const [customVaccine, setCustomVaccine] = useState("");
  const [doseNumber, setDoseNumber] = useState("");
  const [administeredDate, setAdministeredDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [providerName, setProviderName] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [nextDoseDate, setNextDoseDate] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setVaccineName("");
    setCustomVaccine("");
    setDoseNumber("");
    setAdministeredDate(new Date().toISOString().split("T")[0]);
    setProviderName("");
    setLotNumber("");
    setNextDoseDate("");
    setNotes("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = vaccineName === "Otra" ? customVaccine : vaccineName;
    if (!name.trim()) return;

    const result = await onAdd({
      vaccine_name: name.trim(),
      dose_number: doseNumber ? parseInt(doseNumber) : null,
      administered_date: administeredDate,
      provider_name: providerName.trim() || null,
      lot_number: lotNumber.trim() || null,
      next_dose_date: nextDoseDate || null,
      notes: notes.trim() || null,
    });

    if (result.success) {
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.success) setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-white border border-gray-100 rounded-xl skeleton"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upcoming vaccines alert */}
      {upcomingVaccines.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Proximas vacunas pendientes
              </p>
              <div className="mt-2 space-y-1">
                {upcomingVaccines.map((v) => (
                  <p key={v.id} className="text-sm text-amber-700">
                    {v.vaccine_name} - Proxima dosis:{" "}
                    {new Date(v.next_dose_date! + "T00:00:00").toLocaleDateString(
                      "es-VE",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar vacuna
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white border border-gray-100 rounded-xl space-y-3 animate-slide-down"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Nueva vacuna
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Vaccine name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Vacuna *
            </label>
            <select
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white"
            >
              <option value="">Seleccionar vacuna...</option>
              {COMMON_VACCINES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {vaccineName === "Otra" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nombre de la vacuna *
              </label>
              <input
                type="text"
                value={customVaccine}
                onChange={(e) => setCustomVaccine(e.target.value)}
                placeholder="Nombre de la vacuna"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>
          )}

          {/* Date + Dose */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha de aplicacion *
              </label>
              <input
                type="date"
                value={administeredDate}
                onChange={(e) => setAdministeredDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                No. de dosis
              </label>
              <input
                type="number"
                value={doseNumber}
                onChange={(e) => setDoseNumber(e.target.value)}
                min="1"
                max="10"
                placeholder="Ej: 2"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Provider + Lot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Centro de salud
              </label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Ej: Hospital XYZ"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                No. de lote
              </label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="Ej: AB1234"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Next dose date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Proxima dosis (si aplica)
            </label>
            <input
              type="date"
              value={nextDoseDate}
              onChange={(e) => setNextDoseDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={
              saving ||
              !vaccineName ||
              (vaccineName === "Otra" && !customVaccine.trim())
            }
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Registrar vacuna
              </>
            )}
          </button>
        </form>
      )}

      {/* Vaccination timeline */}
      {vaccinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-3">
            <Syringe className="h-7 w-7 text-teal-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Sin vacunas registradas
          </h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Registra tus vacunas para mantener un historial completo
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {vaccinations.map((vacc) => {
            const isExpanded = expandedId === vacc.id;
            const formattedDate = new Date(
              vacc.administered_date + "T00:00:00"
            ).toLocaleDateString("es-VE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={vacc.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : vacc.id)
                  }
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Syringe className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {vacc.vaccine_name}
                      </h4>
                      {vacc.dose_number && (
                        <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded">
                          Dosis {vacc.dose_number}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formattedDate}
                      {vacc.provider_name && ` - ${vacc.provider_name}`}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 animate-fade-in">
                    <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{formattedDate}</span>
                      </div>
                      {vacc.provider_name && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Building className="h-3.5 w-3.5 text-gray-400" />
                          <span>{vacc.provider_name}</span>
                        </div>
                      )}
                      {vacc.lot_number && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          <span>Lote: {vacc.lot_number}</span>
                        </div>
                      )}
                      {vacc.next_dose_date && (
                        <div className="flex items-center gap-2 text-xs text-amber-700">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>
                            Proxima:{" "}
                            {new Date(
                              vacc.next_dose_date + "T00:00:00"
                            ).toLocaleDateString("es-VE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      {vacc.notes && (
                        <div className="col-span-2 flex items-start gap-2 text-xs text-gray-600">
                          <StickyNote className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                          <span>{vacc.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    {confirmDelete === vacc.id ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-red-600 flex-1">
                          Eliminar este registro?
                        </p>
                        <button
                          onClick={() => handleDelete(vacc.id)}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                        >
                          Si, eliminar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setConfirmDelete(vacc.id)}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
