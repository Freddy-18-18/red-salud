import { createClient } from "@/lib/supabase/client";
import { PrescriptionTemplate } from "@/lib/supabase/types/medications";

const supabase = createClient();

/**
 * Obtiene todas las plantillas de un médico
 * Ordenadas por uso más frecuente
 */
export async function getDoctorTemplates(medicoId: string) {
    try {
        const { data, error } = await supabase
            .from("prescription_templates")
            .select("*")
            .eq("medico_id", medicoId)
            .order("uso_count", { ascending: false });

        if (error) throw error;
        return { success: true, data: data as PrescriptionTemplate[] };
    } catch (error) {
        console.error("Error fetching templates:", error);
        return { success: false, error, data: [] };
    }
}

/**
 * Obtiene una plantilla específica por ID
 */
export async function getTemplate(templateId: string) {
    try {
        const { data, error } = await supabase
            .from("prescription_templates")
            .select("*")
            .eq("id", templateId)
            .single();

        if (error) throw error;
        return { success: true, data: data as PrescriptionTemplate };
    } catch (error) {
        console.error("Error fetching template:", error);
        return { success: false, error, data: null };
    }
}

/**
 * Crea una nueva plantilla
 */
export async function createTemplate(
    template: Omit<
        PrescriptionTemplate,
        "id" | "created_at" | "updated_at" | "uso_count" | "ultima_uso"
    >
) {
    try {
        const { data, error } = await supabase
            .from("prescription_templates")
            .insert(template)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data: data as PrescriptionTemplate };
    } catch (error) {
        console.error("Error creating template:", error);
        return { success: false, error, data: null };
    }
}

/**
 * Actualiza una plantilla existente
 */
export async function updateTemplate(
    templateId: string,
    updates: Partial<Omit<PrescriptionTemplate, "id" | "medico_id" | "created_at" | "updated_at">>
) {
    try {
        const { data, error } = await supabase
            .from("prescription_templates")
            .update(updates)
            .eq("id", templateId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data: data as PrescriptionTemplate };
    } catch (error) {
        console.error("Error updating template:", error);
        return { success: false, error, data: null };
    }
}

/**
 * Incrementa el contador de uso de una plantilla
 */
export async function useTemplate(templateId: string) {
    try {
        // Get current template
        const { data: template, error: fetchError } = await supabase
            .from("prescription_templates")
            .select("uso_count")
            .eq("id", templateId)
            .single();

        if (fetchError) throw fetchError;

        // Update with incremented count
        const { data, error } = await supabase
            .from("prescription_templates")
            .update({
                uso_count: (template.uso_count || 0) + 1,
                ultima_uso: new Date().toISOString(),
            })
            .eq("id", templateId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data: data as PrescriptionTemplate };
    } catch (error) {
        console.error("Error using template:", error);
        return { success: false, error, data: null };
    }
}

/**
 * Elimina una plantilla
 */
export async function deleteTemplate(templateId: string) {
    try {
        const { error } = await supabase
            .from("prescription_templates")
            .delete()
            .eq("id", templateId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error deleting template:", error);
        return { success: false, error };
    }
}
