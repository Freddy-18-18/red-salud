import { DoctorRecipeSettings } from "@/lib/supabase/services/recipe-settings";
import { VisualRecipePreview, VisualRecipePreviewProps } from "@/components/dashboard/recetas/visual-recipe-preview";
import { DoctorInfo } from "@/components/dashboard/recetas/recipe-preview";
import { Prescription } from "@/lib/supabase/types/medications"; // Import core type
import ReactDOMServer from "react-dom/server";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";

// Define input type that accommodates known variances (like 'topic')
interface RecipeInput extends Partial<Prescription> {
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

export async function generateRecipeHtml(
    data: VisualRecipePreviewProps["data"],
    settings: VisualRecipePreviewProps["settings"]
): Promise<string> {
    const printElement = (
        <div style={{ width: "216mm", height: "auto", minHeight: "279mm", margin: "0 auto" }}>
            <VisualRecipePreview
                data={data}
                settings={settings}
            />
        </div>
    );

    return ReactDOMServer.renderToStaticMarkup(printElement);
}

export async function downloadRecipePdf(
    data: VisualRecipePreviewProps["data"],
    settings: VisualRecipePreviewProps["settings"],
    fileName: string = "receta-medica.pdf"
) {
    // 1. Create a container in the DOM to render the receipt
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "216mm"; // Carta width
    // container.style.height = "279mm"; // Carta height
    document.body.appendChild(container);

    try {
        // 2. Render the React component into this container
        // We need to hydrate/render it properly. specialized root might be better but static html injection works for html2canvas often
        // Using static markup + hydration tricks or just innerHTML
        const htmlContent = await generateRecipeHtml(data, settings);
        container.innerHTML = htmlContent;

        // Force images to load if possible? 
        // A small delay helps html2canvas capture images
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Generate Canvas
        const canvas = await html2canvas(container, {
            scale: 2, // Higher quality
            useCORS: true, // For images from clean urls
            logging: false,
            windowWidth: 816, // approx 216mm in pixels at 96dpi
        });

        // 4. Create PDF
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "letter"
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(fileName);

    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    } finally {
        document.body.removeChild(container);
    }
}
