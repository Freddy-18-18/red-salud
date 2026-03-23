// TODO: Implement print utilities
// This is a stub to allow the app to compile.

/**
 * Opens a print dialog with the given HTML content.
 */
export function printContent(htmlContent: string): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    console.error('Could not open print window. Check popup blocker.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head><title>Imprimir</title></head>
      <body>${htmlContent}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
