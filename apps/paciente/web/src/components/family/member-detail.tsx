"use client";

import {
  X,
  User,
  Droplets,
  AlertTriangle,
  Activity,
  Pill,
  Phone,
  Clock,
  Pencil,
  Trash2,
  CalendarPlus,
  IdCard,
} from "lucide-react";

import {
  type FamilyMember,
  calculateAge,
  getRelationshipLabel,
} from "@/lib/services/family-service";

interface MemberDetailProps {
  member: FamilyMember;
  onClose: () => void;
  onEdit: (member: FamilyMember) => void;
  onDelete?: (member: FamilyMember) => void;
}

export function MemberDetail({ member, onClose, onEdit, onDelete }: MemberDetailProps) {
  const age = member.date_of_birth ? calculateAge(member.date_of_birth) : null;

  const initials = member.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

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
            Perfil de salud
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Demographics card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
            <div className="flex items-center gap-4">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center">
                  <span className="text-lg font-bold text-emerald-600">
                    {initials}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {member.full_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
                  <span>{getRelationshipLabel(member.relationship)}</span>
                  {age !== null && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{age} {age === 1 ? "ano" : "anos"}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  {member.gender && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {member.gender.charAt(0).toUpperCase() + member.gender.slice(1)}
                    </span>
                  )}
                  {member.blood_type && (
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-red-400" />
                      {member.blood_type}
                    </span>
                  )}
                  {member.national_id && (
                    <span className="flex items-center gap-1">
                      <IdCard className="h-3 w-3" />
                      {member.national_id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Allergies card */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Alergias</h4>
            </div>
            {member.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {member.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin alergias registradas</p>
            )}
          </div>

          {/* Chronic conditions card */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Activity className="h-4 w-4 text-amber-500" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">
                Condiciones cronicas
              </h4>
            </div>
            {member.chronic_conditions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {member.chronic_conditions.map((condition) => (
                  <span
                    key={condition}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Sin condiciones cronicas registradas
              </p>
            )}
          </div>

          {/* Medications card */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Pill className="h-4 w-4 text-blue-500" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">
                Medicamentos actuales
              </h4>
            </div>
            {member.current_medications.length > 0 ? (
              <div className="space-y-2">
                {member.current_medications.map((med, i) => (
                  <div
                    key={`${med.name}-${i}`}
                    className="flex items-center gap-3 p-2.5 bg-blue-50 rounded-lg"
                  >
                    <Pill className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {med.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {med.dosage}
                        {med.frequency ? ` - ${med.frequency}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Sin medicamentos registrados
              </p>
            )}
          </div>

          {/* Emergency contact card */}
          {member.emergency_contact && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-purple-500" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Contacto de emergencia
                </h4>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-gray-900">
                  {member.emergency_contact.name}
                </p>
                <p className="text-gray-500">
                  {member.emergency_contact.phone}
                </p>
                {member.emergency_contact.relationship && (
                  <p className="text-gray-400 text-xs">
                    {member.emergency_contact.relationship}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`/dashboard/agendar?for=${member.id}`}
              className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <CalendarPlus className="h-4 w-4" />
              Agendar cita
            </a>
            <a
              href="/dashboard/historial"
              className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Clock className="h-4 w-4" />
              Ver historial
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-gray-100 bg-gray-50">
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(member)}
              className="px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => onEdit(member)}
            className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
