"use client";

import { useState, useEffect } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import {
  RELATIONSHIPS,
  BLOOD_TYPES,
  GENDERS,
  COMMON_ALLERGIES,
  COMMON_CONDITIONS,
  type FamilyMember,
  type CreateFamilyMember,
  type EmergencyContact,
  type Medication,
} from "@/lib/services/family-service";
import { TagInput } from "./tag-input";
import { MedicationInput } from "./medication-input";

interface MemberFormProps {
  member?: FamilyMember | null;
  onSubmit: (data: CreateFamilyMember) => Promise<{ success: boolean }>;
  onClose: () => void;
  saving?: boolean;
}

export function MemberForm({ member, onSubmit, onClose, saving }: MemberFormProps) {
  const isEditing = Boolean(member);

  const [fullName, setFullName] = useState(member?.full_name ?? "");
  const [relationship, setRelationship] = useState(member?.relationship ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(member?.date_of_birth ?? "");
  const [gender, setGender] = useState(member?.gender ?? "");
  const [bloodType, setBloodType] = useState(member?.blood_type ?? "");
  const [nationalId, setNationalId] = useState(member?.national_id ?? "");
  const [allergies, setAllergies] = useState<string[]>(member?.allergies ?? []);
  const [chronicConditions, setChronicConditions] = useState<string[]>(member?.chronic_conditions ?? []);
  const [medications, setMedications] = useState<Medication[]>(member?.current_medications ?? []);
  const [emergencyName, setEmergencyName] = useState(member?.emergency_contact?.name ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(member?.emergency_contact?.phone ?? "");
  const [emergencyRelationship, setEmergencyRelationship] = useState(member?.emergency_contact?.relationship ?? "");

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim()) {
      setValidationError("El nombre es obligatorio");
      return;
    }
    if (!relationship) {
      setValidationError("La relacion es obligatoria");
      return;
    }

    let emergencyContact: EmergencyContact | null = null;
    if (emergencyName.trim() && emergencyPhone.trim()) {
      emergencyContact = {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relationship: emergencyRelationship.trim(),
      };
    }

    const data: CreateFamilyMember = {
      full_name: fullName.trim(),
      relationship,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      blood_type: bloodType || null,
      national_id: nationalId.trim() || null,
      allergies,
      chronic_conditions: chronicConditions,
      current_medications: medications,
      emergency_contact: emergencyContact,
    };

    const result = await onSubmit(data);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Editar familiar" : "Agregar familiar"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-5">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg">
              {validationError}
            </div>
          )}

          {/* Basic info */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Datos basicos
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre y apellido"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Parentesco *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="">Seleccionar</option>
                  {RELATIONSHIPS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Genero
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="">Seleccionar</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo de sangre
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="">Seleccionar</option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cedula / DNI
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Numero de identificacion (opcional)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Medical info */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Informacion medica
            </h3>

            <TagInput
              label="Alergias"
              tags={allergies}
              onChange={setAllergies}
              suggestions={COMMON_ALLERGIES}
              placeholder="Buscar o agregar alergia..."
            />

            <TagInput
              label="Condiciones cronicas"
              tags={chronicConditions}
              onChange={setChronicConditions}
              suggestions={COMMON_CONDITIONS}
              placeholder="Buscar o agregar condicion..."
            />

            <MedicationInput
              medications={medications}
              onChange={setMedications}
            />
          </section>

          {/* Emergency contact */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Contacto de emergencia
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Nombre del contacto"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+58 412 1234567"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Parentesco
                </label>
                <input
                  type="text"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  placeholder="Ej: Madre, Esposo"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="member-form"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Guardar cambios"
            ) : (
              "Agregar familiar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
