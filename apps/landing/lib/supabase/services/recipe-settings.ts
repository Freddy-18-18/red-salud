
import { supabase } from "@/lib/supabase/client";

export interface DoctorRecipeSettings {
    id: string;
    doctor_id: string;
    clinic_name: string | null;
    clinic_address: string | null;
    clinic_phone: string | null;
    clinic_email: string | null;
    use_digital_signature: boolean;
    digital_signature_url: string | null;
    use_logo: boolean;
    logo_url: string | null;
    template_id: string;
    frame_color: string;
    selected_watermark_url: string | null;
    watermark_config: {
        enabled: boolean;
        opacity: number;
        text: string;
    };
    created_at: string;
    updated_at: string;
}

export interface UpdateDoctorRecipeSettingsData {
    clinic_name?: string | null;
    clinic_address?: string | null;
    clinic_phone?: string | null;
    clinic_email?: string | null;
    use_digital_signature?: boolean;
    digital_signature_url?: string | null;
    use_logo?: boolean;
    logo_url?: string | null;
    template_id?: string;
    frame_color?: string;
    selected_watermark_url?: string | null;
    watermark_config?: {
        enabled?: boolean;
        opacity?: number;
        text?: string;
    };
}

export async function getDoctorRecipeSettings(doctorId: string, officeId?: string | null) {
    let query = supabase
        .from("doctor_recipe_settings")
        .select("*")
        .eq("doctor_id", doctorId);

    if (officeId) {
        query = query.eq("office_id", officeId);
    } else {
        query = query.is("office_id", null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        console.error("Error fetching recipe settings:", error.message, error);
        return { success: false, error };
    }

    // If no settings exist for this specific context, return null (UI will handle fallback/creation)
    if (!data) {
        // If requesting specific office but none exists, try to fetch global settings to use as base
        if (officeId) {
            const { data: globalData } = await supabase
                .from("doctor_recipe_settings")
                .select("*")
                .eq("doctor_id", doctorId)
                .is("office_id", null)
                .single();

            if (globalData) {
                return { success: true, data: { ...globalData, id: undefined, office_id: officeId } as DoctorRecipeSettings, isFallback: true };
            }
        }

        // Return default structure if nothing exists
        return {
            success: true,
            data: {
                doctor_id: doctorId,
                office_id: officeId || null,
                watermark_config: { enabled: false, opacity: 10, text: "" },
                frame_color: '#0da9f7',
                use_digital_signature: false,
                use_logo: false
            } as Partial<DoctorRecipeSettings>,
            isNew: true
        };
    }

    return { success: true, data: data as DoctorRecipeSettings };
}

export async function updateDoctorRecipeSettings(doctorId: string, updates: UpdateDoctorRecipeSettingsData, officeId?: string | null) {
    // Check if record exists first
    let query = supabase
        .from("doctor_recipe_settings")
        .select("id")
        .eq("doctor_id", doctorId);

    if (officeId) {
        query = query.eq("office_id", officeId);
    } else {
        query = query.is("office_id", null);
    }

    const { data: existing } = await query.maybeSingle();

    let result;
    if (existing) {
        result = await supabase
            .from("doctor_recipe_settings")
            .update(updates)
            .eq("id", existing.id)
            .select()
            .single();
    } else {
        result = await supabase
            .from("doctor_recipe_settings")
            .insert({
                ...updates,
                doctor_id: doctorId,
                office_id: officeId || null
            })
            .select()
            .single();
    }

    const { data, error } = result;

    if (error) {
        console.error("Error updating recipe settings:", error.message, error);
        return { success: false, error };
    }

    return { success: true, data: data as DoctorRecipeSettings };
}

export async function uploadRecipeAsset(
    doctorId: string,
    file: File,
    type: 'signature' | 'logo' | 'watermark'
) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${doctorId}_${type}_${Date.now()}.${fileExt}`;
    const filePath = `private_assets/${type}s/${fileName}`; // e.g., private_assets/signatures/123_signature_123.png

    const { error: uploadError } = await supabase.storage
        .from("private_assets")
        .upload(filePath, file);

    if (uploadError) {
        console.warn("Upload to private_assets failed...", uploadError);
        return { success: false, error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from("private_assets")
        .getPublicUrl(`${type}s/${fileName}`);

    return { success: true, url: publicUrl };
}
