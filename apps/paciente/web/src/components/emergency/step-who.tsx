"use client";

import { User, Users } from "lucide-react";
import type { FamilyMember } from "@/lib/services/emergency-service";

interface StepWhoProps {
  familyMembers: FamilyMember[];
  onSelect: (familyMemberId: string | null) => void;
}

/**
 * Step 1: Who needs help?
 * Allows selecting self or a family member.
 */
export function StepWho({ familyMembers, onSelect }: StepWhoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">¿Quién necesita ayuda?</h2>
        <p className="text-sm text-gray-500 mt-1">Seleccioná la persona que necesita atención</p>
      </div>

      <div className="space-y-3">
        {/* Self */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="w-full flex items-center gap-4 p-4 bg-white border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Yo</p>
            <p className="text-sm text-gray-500">Necesito ayuda para mí</p>
          </div>
        </button>

        {/* Family members */}
        {familyMembers.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <Users className="h-4 w-4 text-gray-400" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Familiares
              </p>
            </div>

            {familyMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelect(member.id)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {member.nombre_completo.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{member.nombre_completo}</p>
                  <p className="text-sm text-gray-500 capitalize">{member.parentesco}</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
