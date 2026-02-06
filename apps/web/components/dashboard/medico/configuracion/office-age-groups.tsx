"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Users } from "lucide-react";
import { AGE_GROUPS } from "./constants/profile-data";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface OfficeAgeGroupsProps {
    officeId?: string;
    value?: string[];
    readonly?: boolean;
    onChange?: (groups: string[]) => void;
}

export function OfficeAgeGroups({ officeId, value = [], readonly = false, onChange }: OfficeAgeGroupsProps) {
    const [selectedGroups, setSelectedGroups] = useState<string[]>(value);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (value) {
            setSelectedGroups(value);
        }
    }, [value]);

    const loadOfficeAgeGroups = useCallback(async () => {
        if (!officeId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("doctor_offices")
                .select("patient_age_groups")
                .eq("id", officeId)
                .single();

            if (error) throw error;
            if (data && data.patient_age_groups) {
                // Ensure it's an array
                const groups = Array.isArray(data.patient_age_groups) ? data.patient_age_groups : [];
                setSelectedGroups(groups);
                if (onChange) onChange(groups);
            }
        } catch (error) {
            console.error("Error loading age groups:", error);
        } finally {
            setLoading(false);
        }
    }, [officeId, onChange]);

    useEffect(() => {
        if (officeId) {
            loadOfficeAgeGroups();
        }
    }, [officeId, loadOfficeAgeGroups]);

    const toggleGroup = async (groupValue: string) => {
        if (readonly) return;

        const newGroups = selectedGroups.includes(groupValue)
            ? selectedGroups.filter(g => g !== groupValue)
            : [...selectedGroups, groupValue];

        setSelectedGroups(newGroups);
        if (onChange) onChange(newGroups);

        if (officeId) {
            try {
                const { error } = await supabase
                    .from("doctor_offices")
                    .update({ patient_age_groups: newGroups })
                    .eq("id", officeId);

                if (error) throw error;
            } catch (error) {
                console.error("Error saving age groups:", error);
                toast.error("Error al guardar cambios");
                // Revert UI on error
                setSelectedGroups(selectedGroups);
            }
        }
    };

    if (readonly) {
        return (
            <div className="flex flex-wrap gap-2">
                {selectedGroups.length > 0 ? (
                    selectedGroups.map((groupVal) => {
                        const group = AGE_GROUPS.find(g => g.value === groupVal);
                        return (
                            <Badge key={groupVal} variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50">
                                {group?.label || groupVal}
                            </Badge>
                        );
                    })
                ) : (
                    <span className="text-sm text-gray-500">No especificado</span>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                    <Label className="font-semibold text-gray-900 dark:text-gray-100">
                        Público Objetivo
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        ¿A qué grupos de edad atiendes en este consultorio?
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((grupo) => {
                    const isSelected = selectedGroups.includes(grupo.value);
                    return (
                        <button
                            key={grupo.value}
                            type="button"
                            onClick={() => toggleGroup(grupo.value)}
                            disabled={loading && !!officeId} // Disable only if saving to DB directly
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${isSelected
                                ? "bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/40 dark:border-cyan-800 dark:text-cyan-300 shadow-sm"
                                : "bg-white dark:bg-gray-800 border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400 hover:border-cyan-300 hover:text-cyan-600"
                                }`}
                        >
                            {grupo.label}
                        </button>
                    );
                })}
            </div>
            {!officeId && (
                <p className="text-xs text-amber-600 mt-2">
                    * Guarda el consultorio primero para asegurar los cambios.
                </p>
            )}
        </div>
    );
}
