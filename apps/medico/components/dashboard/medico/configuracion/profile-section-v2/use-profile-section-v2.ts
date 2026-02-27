import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface ProfileData {
    nombre_completo: string;
    email: string;
    telefono: string;
    cedula: string;
    especialidad: string;
    especialidades_adicionales: string[];
    biografia: string;
    avatar_url: string | null;
    is_verified: boolean;
    is_sacs_user: boolean;  // Nuevo: indica si el usuario viene del SACS
    especialidades_permitidas: string[];
}

export interface ProfileCompleteness {
    percentage: number;
    level: "basic" | "complete" | "professional" | "elite";
    missingFields: string[];
    nextLevelRequirements: string[];
}

export function useProfileSectionV2() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        nombre_completo: "",
        email: "",
        telefono: "+58 ",
        cedula: "",
        especialidad: "",
        especialidades_adicionales: [],
        biografia: "",
        avatar_url: null,
        is_verified: false,
        is_sacs_user: false,
        especialidades_permitidas: [],
    });

    const [completeness, setCompleteness] = useState<ProfileCompleteness>({
        percentage: 0,
        level: "basic",
        missingFields: [],
        nextLevelRequirements: [],
    });

    /**
     * Calcula la completitud del perfil
     */
    const calculateCompleteness = useCallback((data: ProfileData): ProfileCompleteness => {
        const fields = {
            avatar_url: { weight: 20, label: "Foto profesional", required: true },
            nombre_completo: { weight: 10, label: "Nombre completo", required: true },
            email: { weight: 5, label: "Correo electrónico", required: true },
            telefono: { weight: 15, label: "Teléfono", required: true },
            cedula: { weight: 10, label: "Cédula", required: true },
            biografia: { weight: 40, label: "Biografía profesional", required: true },
            // Especialidades adicionales son opcionales
            especialidades_adicionales: { weight: 0, label: "Especialidades adicionales", required: false },
        };

        let totalWeight = 0;
        const missing: string[] = [];

        Object.entries(fields).forEach(([key, config]) => {
            const value = data[key as keyof ProfileData];

            if (key === "biografia") {
                if (value && typeof value === "string" && value.length >= 150) {
                    totalWeight += config.weight;
                } else if (config.required) {
                    missing.push(config.label);
                }
            } else if (key === "especialidades_adicionales") {
                return;
            } else if (value) {
                totalWeight += config.weight;
            } else if (config.required) {
                missing.push(config.label);
            }
        });

        let level: "basic" | "complete" | "professional" | "elite" = "basic";
        if (totalWeight >= 95) level = "elite";
        else if (totalWeight >= 80) level = "professional";
        else if (totalWeight >= 60) level = "complete";

        const nextRequirements: string[] = [];
        if (level === "basic") {
            nextRequirements.push("Completa tu biografía (mín. 150 caracteres)");
            nextRequirements.push("Agrega una foto profesional");
        } else if (level === "complete") {
            nextRequirements.push("Agrega especialidades adicionales (opcional)");
            nextRequirements.push("Mejora tu biografía");
        } else if (level === "professional") {
            nextRequirements.push("Agrega especialidades adicionales (opcional)");
            nextRequirements.push("Mantén tu perfil actualizado");
        }

        return {
            percentage: totalWeight,
            level,
            missingFields: missing,
            nextLevelRequirements: nextRequirements,
        };
    }, []);

    /**
     * Carga el perfil del médico
     */
    const loadProfile = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            const { data: doctorData } = await supabase
                .from("doctor_details")
                .select(`
                  *,
                  especialidad:specialties(id, name),
                  sacs_data
                `)
                .eq("profile_id", user.id)
                .single();

            const sacsData = doctorData?.sacs_data;
            const sacsPostgrados = sacsData?.postgrados || [];
            const especialidadPrincipal = sacsData?.especialidad_display || doctorData?.especialidad?.name || "";
            
            const especialidadesAdicionales = sacsPostgrados
                .map((pg: { postgrado: string }) => pg.postgrado)
                .filter((pg: string) => pg !== especialidadPrincipal);

            const profileState: ProfileData = {
                nombre_completo: profileData?.nombre_completo || "",
                email: user.email || "",
                telefono: profileData?.telefono || "+58 ",
                cedula: profileData?.cedula || "",
                especialidad: especialidadPrincipal,
                especialidades_adicionales: especialidadesAdicionales,
                biografia: doctorData?.biografia || "",
                avatar_url: profileData?.avatar_url || null,
                is_verified: doctorData?.verified || false,
                is_sacs_user: profileData?.sacs_verificado || doctorData?.sacs_verified || false,
                especialidades_permitidas: [
                    especialidadPrincipal,
                    ...especialidadesAdicionales
                ].filter(Boolean) || [],
            };

            setProfile(profileState);
            setCompleteness(calculateCompleteness(profileState));
        } catch (error) {
            console.error("[ProfileSectionV2] Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    }, [calculateCompleteness]);

    const uploadAvatar = async (file: File): Promise<string> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay usuario autenticado");

            // Generar nombre único
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Subir archivo
            const { error: uploadError } = await supabase.storage
                .from("profiles")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from("profiles")
                .getPublicUrl(filePath);

            // Actualizar perfil local y remoto
            await updateProfile({ avatar_url: publicUrl });

            // Persistir URL en base de datos inmediatamente
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", user.id);

            if (updateError) throw updateError;

            return publicUrl;
        } catch (error) {
            console.error("[useProfileSectionV2] Error uploading avatar:", error);
            throw error;
        }
    };

    const removeAvatar = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay usuario autenticado");

            await updateProfile({ avatar_url: null });

            const { error } = await supabase
                .from("profiles")
                .update({ avatar_url: null })
                .eq("id", user.id);

            if (error) throw error;
        } catch (error) {
            console.error("[useProfileSectionV2] Error removing avatar:", error);
            throw error;
        }
    };


    const updateProfile = (updates: Partial<ProfileData>) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        setCompleteness(calculateCompleteness(newProfile));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay usuario autenticado");

            const profileUpdate: Record<string, string | boolean> = {
                telefono: profile.telefono,
            };

            // Si NO es usuario SACS, puede editar el nombre completo
            // Los usuarios SACS tienen su nombre verificado del SACS
            if (!profile.is_sacs_user) {
                profileUpdate.nombre_completo = profile.nombre_completo;
            }

            const { error: profileError } = await supabase
                .from("profiles")
                .update(profileUpdate)
                .eq("id", user.id);

            if (profileError) {
                console.error("[ProfileSectionV2] Profile update error:", profileError);
                throw profileError;
            }

            const doctorUpdate: Record<string, string | number | boolean | null | string[]> = {
                biografia: profile.biografia,
            };

            // Si NO es usuario SACS, puede editar especialidad y subespecialidades
            // Los usuarios SACS tienen su especialidad verificada del SACS
            if (!profile.is_sacs_user) {
                if (profile.especialidad) {
                    const { data: specialtyData } = await supabase
                        .from("specialties")
                        .select("id")
                        .eq("name", profile.especialidad)
                        .maybeSingle();

                    if (specialtyData) {
                        doctorUpdate.specialty_id = specialtyData.id;
                    }
                }

                if (profile.especialidades_adicionales?.length > 0) {
                    doctorUpdate.subespecialidades = profile.especialidades_adicionales;
                } else {
                    doctorUpdate.subespecialidades = [];
                }
            }

            const { error: doctorError } = await supabase
                .from("doctor_details")
                .update(doctorUpdate)
                .eq("profile_id", user.id);

            if (doctorError) {
                console.error("[ProfileSectionV2] Doctor details update error:", doctorError);
                throw doctorError;
            }

            toast.success("Cambios guardados correctamente");

        } catch (error) {
            console.error("[ProfileSectionV2] Error saving:", error);
            toast.error("Error al guardar los cambios. Por favor intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return {
        profile,
        completeness,
        loading,
        saving,
        updateProfile,
        handleSave,
        uploadAvatar,
        removeAvatar,
    };
}
