import { createClient } from "@/lib/supabase/client";
import type { DoctorSettings, PrescriptionFrame, PrescriptionWatermark } from "@/lib/supabase/types/settings";

const supabase = createClient();

/**
 * Get doctor settings with active frame and watermark
 */
export async function getDoctorSettings(doctorId: string) {
    try {
        const { data, error } = await supabase
            .from("doctor_settings")
            .select(`
        *,
        active_frame:prescription_frames(*),
        active_watermark:prescription_watermarks(*)
      `)
            .eq("doctor_id", doctorId)
            .single();

        if (error) {
            // If no settings exist, return null (not an error)
            if (error.code === 'PGRST116') {
                return { success: true, data: null };
            }
            throw error;
        }

        return { success: true, data: data as DoctorSettings };
    } catch (error) {
        // Only log if it's a real error (not empty object)
        if (typeof error === 'object' && error !== null && Object.keys(error).length > 0) {
            console.error("Error fetching doctor settings:", error);
        }
        return { success: false, error, data: null };
    }
}

/**
 * Get all available frames (generic + doctor's own)
 */
export async function getAvailableFrames(doctorId: string) {
    try {
        const { data, error } = await supabase
            .from("prescription_frames")
            .select("*")
            .or(`is_generic.eq.true,doctor_id.eq.${doctorId}`)
            .order("is_generic", { ascending: false })
            .order("name");

        if (error) throw error;
        return { success: true, data: data as PrescriptionFrame[] };
    } catch (error) {
        // Only log if it's a real error (not empty object)
        if (typeof error === 'object' && error !== null && Object.keys(error).length > 0) {
            console.error("Error fetching frames:", error);
        }
        return { success: false, error, data: [] };
    }
}

/**
 * Get all available watermarks (generic + doctor's own)
 */
export async function getAvailableWatermarks(doctorId: string) {
    try {
        const { data, error } = await supabase
            .from("prescription_watermarks")
            .select("*")
            .or(`is_generic.eq.true,doctor_id.eq.${doctorId}`)
            .order("is_generic", { ascending: false })
            .order("name");

        if (error) throw error;
        return { success: true, data: data as PrescriptionWatermark[] };
    } catch (error) {
        // Only log if it's a real error (not empty object)
        if (typeof error === 'object' && error !== null && Object.keys(error).length > 0) {
            console.error("Error fetching watermarks:", error);
        }
        return { success: false, error, data: [] };
    }
}
