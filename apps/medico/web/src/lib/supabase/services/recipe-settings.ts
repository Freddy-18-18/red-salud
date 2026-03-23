// TODO: Implement recipe settings service
// This is a stub to allow the app to compile.

export interface DoctorRecipeSettings {
  id?: string;
  doctor_id?: string;
  template_id?: string;
  frame_color?: string;
  selected_watermark_url?: string | null;
  use_logo?: boolean;
  use_digital_signature?: boolean;
  logo_url?: string | null;
  digital_signature_url?: string | null;
  clinic_name?: string;
  clinic_address?: string;
  clinic_phone?: string;
  clinic_email?: string;
  office_id?: string | null;
}

export async function getDoctorRecipeSettings(
  doctorId: string,
  officeId: string | null
): Promise<{ success: boolean; data: DoctorRecipeSettings | null }> {
  console.warn('Recipe settings service not configured yet.');
  return { success: false, data: null };
}
