"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface UsePdfGenerationOptions {
    fileName?: string;
    scale?: number;
}

export function usePdfGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = async (elementId: string, options: UsePdfGenerationOptions = {}) => {
        setIsGenerating(true);
        const { fileName = "documento.pdf", scale = 2 } = options;

        try {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Element with id '${elementId}' not found`);
            }

            // Capture the element as a canvas
            const canvas = await html2canvas(element, {
                scale: scale, // Higher scale for better quality
                useCORS: true, // Allow loading cross-origin images (Supabase storage)
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 816, // Force width to match design
                windowHeight: 1056
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);

            // Initialize jsPDF (Letter size: 8.5 x 11 inches)
            // in points: 612 x 792
            // We will fit our canvas into this.
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "letter",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate dimensions to fit/fill
            // In our case, the component is already designed for aspect ratio 8.5/11
            // So we can stretch to full width/height
            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

            pdf.save(fileName);
            return true;
        } catch (error) {
            console.error("Error generating PDF:", error);
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        generatePdf,
        isGenerating,
    };
}
