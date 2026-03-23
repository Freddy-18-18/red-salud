"use client";

import { User, Pencil, AlertTriangle, Droplets, Pill } from "lucide-react";
import {
  type FamilyMember,
  calculateAge,
  getRelationshipLabel,
} from "@/lib/services/family-service";

interface MemberCardProps {
  member: FamilyMember;
  isSelf?: boolean;
  onEdit: (member: FamilyMember) => void;
  onClick: (member: FamilyMember) => void;
}

export function MemberCard({ member, isSelf, onEdit, onClick }: MemberCardProps) {
  const age = member.date_of_birth ? calculateAge(member.date_of_birth) : null;
  const hasAllergies = member.allergies.length > 0;
  const hasConditions = member.chronic_conditions.length > 0;
  const hasMedications = member.current_medications.length > 0;

  const initials = member.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className="group bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
      onClick={() => onClick(member)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <span className="text-sm font-semibold text-emerald-600">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {member.full_name}
              </h3>
              {isSelf && (
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-medium rounded">
                  Yo
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              {!isSelf && (
                <span>{getRelationshipLabel(member.relationship)}</span>
              )}
              {age !== null && (
                <>
                  {!isSelf && <span className="text-gray-300">|</span>}
                  <span>{age} {age === 1 ? "ano" : "anos"}</span>
                </>
              )}
              {member.blood_type && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-0.5">
                    <Droplets className="h-3 w-3 text-red-400" />
                    {member.blood_type}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Edit button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(member);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        {/* Health badges */}
        {(hasAllergies || hasConditions || hasMedications) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {member.allergies.map((allergy) => (
              <span
                key={allergy}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-[11px] font-medium rounded-md"
              >
                <AlertTriangle className="h-2.5 w-2.5" />
                {allergy}
              </span>
            ))}
            {member.chronic_conditions.map((condition) => (
              <span
                key={condition}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[11px] font-medium rounded-md"
              >
                {condition}
              </span>
            ))}
            {hasMedications && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-md">
                <Pill className="h-2.5 w-2.5" />
                {member.current_medications.length} medicamento{member.current_medications.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* No health info hint */}
        {!hasAllergies && !hasConditions && !hasMedications && !member.blood_type && (
          <p className="text-xs text-gray-400 mt-2 italic">
            Sin informacion medica registrada
          </p>
        )}
      </div>
    </div>
  );
}
