import { VisualRecipePreviewProps } from "@/components/dashboard/recetas/visual-recipe-preview";
import { generateRecipeHtml } from "./recipe-html";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    document.body.appendChild(container);

    try {
        // 2. Render the React component into this container
        const htmlContent = await generateRecipeHtml(data, settings);
        container.innerHTML = htmlContent;

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
