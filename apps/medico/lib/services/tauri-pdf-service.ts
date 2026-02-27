import { invoke } from "@tauri-apps/api/core";

export interface PdfRecetaData {
  paciente?: { id: string; nombre: string };
  doctor?: { nombre: string };
  medicamentos?: Array<{ nombre: string; dosis: string; frecuencia: string; indicaciones?: string }>;
}

export interface PdfHistoriaData {
  paciente?: { id: string; nombre: string };
  diagnostico?: string;
  tratamiento?: string;
}

export const tauriPdfService = {
  async generateRecetaPDF(receta: PdfRecetaData): Promise<string> {
    try {
      // Generate HTML content
      const html = generateRecetaHTML(receta);

      // Save using Tauri command (save_file_locally from commands.rs)
      // Note: commands.rs has save_file_locally which takes vector of bytes.
      // We need to convert string to bytes.
      const encoder = new TextEncoder();
      const data = encoder.encode(html);

      const fileName = `receta_${receta.paciente?.id || 'unknown'}_${Date.now()}.html`;

      const filePath = await invoke<string>("save_file_locally", {
        appHandle: undefined, // Tauri handles this automatically
        filename: fileName,
        data: Array.from(data),
        subfolder: "recetas"
      });

      return filePath;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  },

  async generateHistoriaClinicaPDF(historia: PdfHistoriaData): Promise<string> {
    try {
      const html = generateHistoriaHTML(historia);
      const encoder = new TextEncoder();
      const data = encoder.encode(html);

      const fileName = `historia_${historia.paciente?.id || 'unknown'}_${Date.now()}.html`;

      const filePath = await invoke<string>("save_file_locally", {
        filename: fileName,
        data: Array.from(data),
        subfolder: "historias"
      });

      return filePath;
    } catch (error) {
      console.error("Error generating clinical history:", error);
      throw error;
    }
  }
};

// Helper functions to generate simple HTML templates
function generateRecetaHTML(receta: PdfRecetaData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receta Médica</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0891B2; padding-bottom: 20px; }
    .header h1 { color: #0891B2; margin: 0; }
    .info { margin-bottom: 30px; }
    .medicines { margin: 20px 0; }
    .medicine-item { background: #f9fafb; padding: 15px; margin-bottom: 10px; border-radius: 8px; }
    .footer { margin-top: 60px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RED SALUD</h1>
    <p>Receta Médica Digital</p>
  </div>
  <div class="info">
    <p><strong>Paciente:</strong> ${receta.paciente?.nombre || 'N/A'}</p>
    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Dr/a:</strong> ${receta.doctor?.nombre || 'N/A'}</p>
  </div>
  <div class="medicines">
    <h3>Medicamentos Prescritos</h3>
    ${receta.medicamentos?.map((m) => `
      <div class="medicine-item">
        <strong>${m.nombre}</strong> <br>
        <small>${m.dosis} - ${m.frecuencia}</small>
        <p>${m.indicaciones || ''}</p>
      </div>
    `).join('') || '<p>No hay medicamentos registrados.</p>'}
  </div>
  <div class="footer">
    <p>Documento generado electrónicamente por Red Salud</p>
  </div>
</body>
</html>
  `;
}

function generateHistoriaHTML(historia: PdfHistoriaData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Historia Clínica</title>
  <style>
    body { font-family: sans-serif; padding: 40px; }
    h1 { color: #0891B2; }
    .section { margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Resumen de Historia Clínica</h1>
  <div class="section">
    <strong>Paciente:</strong> ${historia.paciente?.nombre}
  </div>
  <div class="section">
    <h3>Diagnóstico</h3>
    <p>${historia.diagnostico || 'Sin diagnóstico'}</p>
  </div>
  <div class="section">
    <h3>Tratamiento</h3>
    <p>${historia.tratamiento || 'Sin tratamiento'}</p>
  </div>
</body>
</html>
  `;
}
