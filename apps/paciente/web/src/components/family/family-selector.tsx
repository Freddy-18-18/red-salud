"use client";

import { ChevronDown, User, Users, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import type { FamilyMember } from "@/lib/services/family-service";
import { calculateAge, getRelationshipLabel } from "@/lib/services/family-service";

interface FamilySelectorProps {
  /** All family members (from useFamily hook) */
  members: FamilyMember[];
  /** The currently selected member id, or null for "myself" */
  selectedId: string | null;
  /** Callback when selection changes */
  onSelect: (member: FamilyMember | null) => void;
  /** Current user's name for the "myself" option */
  userName?: string;
  /** Loading state */
  loading?: boolean;
  /** Label shown above the selector */
  label?: string;
}

export function FamilySelector({
  members,
  selectedId,
  onSelect,
  userName = "Yo",
  loading,
  label = "Agendar para...",
}: FamilySelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedMember = selectedId
    ? members.find((m) => m.id === selectedId) ?? null
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1.5">{label}</p>
        <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // If no family members, don't show selector at all
  if (members.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <p className="text-sm font-medium text-gray-700 mb-1.5">{label}</p>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          {selectedMember ? (
            <span className="text-xs font-semibold text-emerald-600">
              {selectedMember.full_name
                .split(" ")
                .slice(0, 2)
                .map((n) => n.charAt(0))
                .join("")}
            </span>
          ) : (
            <User className="h-4 w-4 text-emerald-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {selectedMember ? selectedMember.full_name : userName}
          </p>
          {selectedMember && (
            <p className="text-xs text-gray-500">
              {getRelationshipLabel(selectedMember.relationship)}
              {selectedMember.date_of_birth
                ? ` - ${calculateAge(selectedMember.date_of_birth)} anos`
                : ""}
            </p>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Myself option */}
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-emerald-50 transition-colors ${
              !selectedId ? "bg-emerald-50" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">Para mi</p>
            </div>
            {!selectedId && (
              <Check className="h-4 w-4 text-emerald-600" />
            )}
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Familiares
              </span>
            </div>
          </div>

          {/* Family members */}
          {members.map((member) => {
            const isSelected = member.id === selectedId;
            const age = member.date_of_birth
              ? calculateAge(member.date_of_birth)
              : null;

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  onSelect(member);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-emerald-50 transition-colors ${
                  isSelected ? "bg-emerald-50" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {member.full_name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n.charAt(0))
                      .join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRelationshipLabel(member.relationship)}
                    {age !== null ? ` - ${age} anos` : ""}
                  </p>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
