"use client";

import {
  IdCard,
  AlertTriangle,
  Pill,
  Activity,
  Phone,
  Heart,
  Shield,
  Settings,
  ScanLine,
  CreditCard,
  Droplets,
  Edit3,
  Save,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { useState } from "react";

import { PrintableCard } from "@/components/medical-id/printable-card";
import { QRGenerator } from "@/components/medical-id/qr-generator";
import { QRScanner } from "@/components/medical-id/qr-scanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedicalId } from "@/hooks/use-medical-id";
import {
  BLOOD_TYPES,
  type QRPreferences,
} from "@/lib/services/medical-id-service";

type Tab = "qr" | "tarjeta" | "scanner";

export default function QRMedicoPage() {
  const {
    medicalData,
    preferences,
    qrContent,
    loading,
    saving,
    error,
    updatePreferences,
    updateMedicalInfo,
  } = useMedicalId();

  const [activeTab, setActiveTab] = useState<Tab>("qr");
  const [showScanner, setShowScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-[250px] w-[250px] rounded-2xl" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mi Identificacion Medica
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tu informacion medica en un codigo QR
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">Escanear</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition ${
              showSettings
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("qr")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "qr"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <IdCard className="h-4 w-4" />
            QR Code
          </div>
        </button>
        <button
          onClick={() => setActiveTab("tarjeta")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "tarjeta"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Tarjeta
          </div>
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <PreferencesPanel
          preferences={preferences}
          onChange={updatePreferences}
          saving={saving}
        />
      )}

      {/* Main content */}
      {activeTab === "qr" ? (
        <div className="flex flex-col items-center gap-6">
          {/* QR Code */}
          {qrContent ? (
            <QRGenerator
              data={qrContent}
              size={220}
              patientName={medicalData?.full_name || "paciente"}
            />
          ) : (
            <div className="w-[220px] h-[220px] bg-gray-100 rounded-2xl flex items-center justify-center">
              <p className="text-sm text-gray-400 text-center px-4">
                Completa tu informacion medica para generar el QR
              </p>
            </div>
          )}

          {/* Medical info summary */}
          {medicalData && (
            <div className="w-full max-w-md space-y-4">
              {/* Name + Age */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {medicalData.full_name || "Nombre no configurado"}
                </h2>
                {medicalData.age != null && (
                  <p className="text-sm text-gray-500">
                    {medicalData.age} anos
                  </p>
                )}
              </div>

              {/* Info cards */}
              <div className="space-y-2">
                {/* Blood type */}
                {medicalData.blood_type && (
                  <InfoRow
                    icon={Droplets}
                    label="Tipo de sangre"
                    value={medicalData.blood_type}
                    color="text-red-600 bg-red-50"
                  />
                )}

                {/* Allergies */}
                {medicalData.allergies.length > 0 && (
                  <InfoRow
                    icon={AlertTriangle}
                    label="Alergias"
                    value={medicalData.allergies.join(", ")}
                    color="text-red-600 bg-red-50"
                    highlight
                  />
                )}

                {/* Medications */}
                {medicalData.medications.length > 0 && (
                  <InfoRow
                    icon={Pill}
                    label="Medicamentos"
                    value={medicalData.medications.join(", ")}
                    color="text-blue-600 bg-blue-50"
                  />
                )}

                {/* Conditions */}
                {medicalData.conditions.length > 0 && (
                  <InfoRow
                    icon={Activity}
                    label="Condiciones"
                    value={medicalData.conditions.join(", ")}
                    color="text-amber-600 bg-amber-50"
                  />
                )}

                {/* Insurance */}
                {medicalData.insurance_company && (
                  <InfoRow
                    icon={Shield}
                    label="Seguro"
                    value={`${medicalData.insurance_company}${
                      medicalData.insurance_policy
                        ? ` - ${medicalData.insurance_policy}`
                        : ""
                    }`}
                    color="text-gray-600 bg-gray-100"
                  />
                )}

                {/* Emergency contact */}
                {medicalData.emergency_contact_name && (
                  <InfoRow
                    icon={Phone}
                    label="Emergencia"
                    value={`${medicalData.emergency_contact_name}${
                      medicalData.emergency_contact_phone
                        ? ` - ${medicalData.emergency_contact_phone}`
                        : ""
                    }`}
                    color="text-emerald-600 bg-emerald-50"
                  />
                )}

                {/* Organ donor */}
                {medicalData.organ_donor && (
                  <InfoRow
                    icon={Heart}
                    label="Donante de organos"
                    value="Si"
                    color="text-emerald-600 bg-emerald-50"
                  />
                )}
              </div>

              {/* Edit button */}
              <button
                onClick={() => setShowEdit(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
              >
                <Edit3 className="h-4 w-4" />
                Editar informacion medica
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Printable card tab */
        medicalData && qrContent ? (
          <PrintableCard
            data={medicalData}
            preferences={preferences}
            qrContent={qrContent}
          />
        ) : (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Completa tu informacion medica para generar la tarjeta
            </p>
          </div>
        )
      )}

      {/* QR Scanner */}
      <QRScanner open={showScanner} onClose={() => setShowScanner(false)} />

      {/* Edit medical info modal */}
      {showEdit && medicalData && (
        <EditMedicalInfoModal
          data={medicalData}
          onSave={updateMedicalInfo}
          onClose={() => setShowEdit(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

// --- Sub-components ---

function InfoRow({
  icon: Icon,
  label,
  value,
  color,
  highlight = false,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl ${
        highlight ? "bg-red-50 border border-red-100" : "bg-gray-50"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p
          className={`text-sm font-medium mt-0.5 ${
            highlight ? "text-red-800" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function PreferencesPanel({
  preferences,
  onChange,
  saving,
}: {
  preferences: QRPreferences;
  onChange: (prefs: Partial<QRPreferences>) => Promise<{ success: boolean }>;
  saving: boolean;
}) {
  const TOGGLES: { key: keyof QRPreferences; label: string }[] = [
    { key: "show_blood_type", label: "Tipo de sangre" },
    { key: "show_allergies", label: "Alergias" },
    { key: "show_medications", label: "Medicamentos" },
    { key: "show_conditions", label: "Condiciones medicas" },
    { key: "show_emergency_contact", label: "Contacto de emergencia" },
    { key: "show_insurance", label: "Seguro medico" },
    { key: "show_organ_donor", label: "Donante de organos" },
    { key: "show_notes", label: "Notas medicas" },
  ];

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl animate-slide-down">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Informacion visible en el QR
      </h3>
      <div className="space-y-2">
        {TOGGLES.map((toggle) => (
          <label
            key={toggle.key}
            className="flex items-center justify-between py-2 px-1 cursor-pointer"
          >
            <span className="text-sm text-gray-700">{toggle.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={preferences[toggle.key]}
              onClick={() =>
                onChange({ [toggle.key]: !preferences[toggle.key] })
              }
              disabled={saving}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                preferences[toggle.key] ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  preferences[toggle.key] ? "translate-x-4" : ""
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </div>
  );
}

function EditMedicalInfoModal({
  data,
  onSave,
  onClose,
  saving,
}: {
  data: {
    blood_type: string | null;
    allergies: string[];
    medications: string[];
    conditions: string[];
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    organ_donor: boolean;
    notes: string | null;
  };
  onSave: (
    info: Record<string, unknown>
  ) => Promise<{ success: boolean }>;
  onClose: () => void;
  saving: boolean;
}) {
  const [bloodType, setBloodType] = useState(data.blood_type || "");
  const [allergies, setAllergies] = useState(data.allergies.join(", "));
  const [medications, setMedications] = useState(data.medications.join(", "));
  const [conditions, setConditions] = useState(data.conditions.join(", "));
  const [ecName, setEcName] = useState(data.emergency_contact_name || "");
  const [ecPhone, setEcPhone] = useState(data.emergency_contact_phone || "");
  const [ecRelation, setEcRelation] = useState(
    data.emergency_contact_relationship || ""
  );
  const [organDonor, setOrganDonor] = useState(data.organ_donor);
  const [medNotes, setMedNotes] = useState(data.notes || "");
  const [success, setSuccess] = useState(false);

  const parseList = (val: string) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await onSave({
      tipo_sangre: bloodType || null,
      alergias: parseList(allergies),
      medicamentos: parseList(medications),
      condiciones: parseList(conditions),
      contacto_emergencia_nombre: ecName.trim() || null,
      contacto_emergencia_telefono: ecPhone.trim() || null,
      contacto_emergencia_parentesco: ecRelation.trim() || null,
      donante_organos: organDonor,
      notas_medicas: medNotes.trim() || null,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(onClose, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-down">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            Editar informacion medica
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-3 animate-scale-in">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              Informacion actualizada
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Blood type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de sangre
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white"
              >
                <option value="">No especificado</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alergias
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ej: Penicilina, Aspirina (separadas por coma)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Separa multiples alergias con comas
              </p>
            </div>

            {/* Medications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medicamentos actuales
              </label>
              <input
                type="text"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Ej: Losartan 50mg, Metformina 850mg"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condiciones medicas
              </label>
              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Ej: Hipertension, Diabetes T2"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>

            {/* Emergency contact */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">
                Contacto de emergencia
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={ecName}
                    onChange={(e) => setEcName(e.target.value)}
                    placeholder="Jose Garcia"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={ecPhone}
                    onChange={(e) => setEcPhone(e.target.value)}
                    placeholder="+58 412-555-1234"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Parentesco
                </label>
                <input
                  type="text"
                  value={ecRelation}
                  onChange={(e) => setEcRelation(e.target.value)}
                  placeholder="Ej: Esposo, Madre, Hermano"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Organ donor */}
            <label className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">
                  Donante de organos
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={organDonor}
                onClick={() => setOrganDonor(!organDonor)}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  organDonor ? "bg-emerald-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    organDonor ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </label>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas medicas adicionales
              </label>
              <textarea
                value={medNotes}
                onChange={(e) => setMedNotes(e.target.value)}
                placeholder="Informacion adicional relevante..."
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
