export function printContent(contentHtml: string) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();

  // Attempt to copy styles. Note: CORS might block accessing cssRules for some external sheets.
  // For a Next.js app, tailwind usually is in a <style> tag or local link
  let styles = "";
  Array.from(document.querySelectorAll("style, link[rel='stylesheet']")).forEach((node) => {
    styles += node.outerHTML;
  });

  doc.write(`
    <html>
      <head>
        ${styles}
        <style>
          @media print {
            @page {
              size: auto;
              margin: 0;
            }
            body {
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-container {
               width: 100%;
               height: 100%;
               display: flex;
               justify-content: center;
               align-items: flex-start;
            }
          }
          /* Ensure styles from the app's CSS (like Tailwind) are somewhat respected or basic reset */
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: white;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${contentHtml}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Wait for images/resources to load effectively before printing
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    // Remove iframe after a short delay to allow print dialog to open
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 250);
}
