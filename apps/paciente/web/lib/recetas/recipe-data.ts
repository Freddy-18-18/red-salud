import { DoctorRecipeSettings } from "@/lib/supabase/services/recipe-settings";
import { VisualRecipePreviewProps } from "@/components/dashboard/recetas/visual-recipe-preview";
import { DoctorInfo } from "@/components/dashboard/recetas/recipe-preview";
import { Prescription, PrescriptionMedication } from "@/lib/supabase/types/medications";

// Define input type that accommodates known variances (like 'topic')
export interface RecipeInput extends Partial<Prescription> {
    topic?: { nombre_completo?: string };
    // Allow dynamic access for backward compatibility but encourage typed usage
    [key: string]: unknown;
}

// Helper to construct consistent preview/print data
export function constructRecipeData(
    recipe: RecipeInput,
    doctorProfile: DoctorInfo | null,
    settings: DoctorRecipeSettings | null
): VisualRecipePreviewProps["data"] {
    const patientName = recipe.topic?.nombre_completo ||
        recipe.paciente?.nombre_completo ||
        recipe.offline_patient?.nombre_completo ||
        "Paciente";

    // Calculate age if available
    let patientAge = "--";
    const birthDate = recipe.paciente?.fecha_nacimiento || recipe.offline_patient?.fecha_nacimiento;
    if (birthDate) {
        const age = Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / 3.15576e+10);
        patientAge = `${age} años`;
    }

    return {
        doctorName: doctorProfile?.nombre || "Dr.",
        doctorTitle: doctorProfile?.titulo || "Dr.",
        doctorSpecialty: doctorProfile?.especialidad || "",
        doctorProfessionalId: doctorProfile?.cedulaProfesional || "",

        clinicName: settings?.clinic_name || doctorProfile?.clinica || "",
        clinicAddress: settings?.clinic_address || doctorProfile?.direccion || "",
        clinicPhone: settings?.clinic_phone || doctorProfile?.telefono || "",
        clinicEmail: settings?.clinic_email || doctorProfile?.email || "",

        patientName: patientName,
        patientAge: patientAge,
        patientWeight: "--", // Not stored in prescription currently
        patientSex: recipe.paciente?.genero || "--",

        date: recipe.fecha_prescripcion ? new Date(recipe.fecha_prescripcion).toLocaleDateString("es-ES") : new Date().toLocaleDateString("es-ES"),

        medications: (recipe.medications as PrescriptionMedication[] || []).map((m: PrescriptionMedication) => ({
            name: (m.nombre_medicamento || m.medication?.nombre_comercial) +
                (m.medication?.forma_farmaceutica ? ` (${m.medication.forma_farmaceutica})` : ""),
            presentation: m.medication?.concentracion || "",
            frequency: m.frecuencia,
            duration: m.duracion_dias ? `${m.duracion_dias} días` : "",
            specialInstructions: m.instrucciones_especiales || ""
        })),
        diagnosis: recipe.diagnostico || ""
    };
}

export function constructRecipeSettings(settings: DoctorRecipeSettings | null): VisualRecipePreviewProps["settings"] {
    return {
        templateId: settings?.template_id || "plantilla-3",
        frameColor: settings?.frame_color || "#0da9f7",
        watermarkUrl: settings?.selected_watermark_url || null,
        showLogo: settings?.use_logo ?? true,
        showSignature: settings?.use_digital_signature ?? true,
        logoUrl: settings?.logo_url || null,
        signatureUrl: settings?.digital_signature_url || null
    };
}
