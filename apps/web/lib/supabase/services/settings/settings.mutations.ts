import { createClient } from "@/lib/supabase/client";
import type { DoctorSettings, DoctorSettingsUpdate, PrescriptionWatermark } from "@/lib/supabase/types/settings";

const supabase = createClient();

/**
 * Create or update doctor settings
 */
export async function upsertDoctorSettings(doctorId: string, settings: DoctorSettingsUpdate) {
    try {
        const { data, error } = await supabase
            .from("doctor_settings")
            .upsert({
                doctor_id: doctorId,
                ...settings,
            }, {
                onConflict: 'doctor_id'
            })
            .select(`
        *,
        active_frame:prescription_frames(*),
        active_watermark:prescription_watermarks(*)
      `)
            .single();

        if (error) throw error;
        return { success: true, data: data as DoctorSettings };
    } catch (error) {
        console.error("Error upserting doctor settings:", error);
        return { success: false, error, data: null };
    }
}

/**
 * Upload signature image to storage
 */
export async function uploadSignature(doctorId: string, base64Image: string) {
    try {
        // Convert base64 to blob
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const binaryData = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: 'image/png' });

        const fileName = `${doctorId}/signature_${Date.now()}.png`;

        const { error } = await supabase.storage
            .from('signatures')
            .upload(fileName, blob, {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('signatures')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("Error uploading signature:", error);
        return { success: false, error, url: null };
    }
}

/**
 * Upload logo image to storage
 */
export async function uploadLogo(doctorId: string, file: File) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${doctorId}/logo_${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from('logos')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("Error uploading logo:", error);
        return { success: false, error, url: null };
    }
}

/**
 * Upload custom watermark to storage and create record
 */
export async function uploadWatermark(doctorId: string, file: File, name: string) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${doctorId}/watermark_${Date.now()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('watermarks')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('watermarks')
            .getPublicUrl(fileName);

        // Create watermark record
        const { data, error } = await supabase
            .from('prescription_watermarks')
            .insert({
                name: name || file.name,
                image_url: publicUrl,
                is_generic: false,
                doctor_id: doctorId,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: data as PrescriptionWatermark };
    } catch (error) {
        console.error("Error uploading watermark:", error);
        return { success: false, error, data: null };
    }
}

/**
 * Delete a custom watermark
 */
export async function deleteWatermark(watermarkId: string) {
    try {
        const { error } = await supabase
            .from('prescription_watermarks')
            .delete()
            .eq('id', watermarkId)
            .eq('is_generic', false); // Only allow deleting non-generic

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error deleting watermark:", error);
        return { success: false, error };
    }
}
