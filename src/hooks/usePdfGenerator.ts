import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function usePdfGenerator() {
  const generatePdfBase64 = useCallback(async (
    element: HTMLElement | null,
    filename: string = "document"
  ): Promise<{ base64: string; filename: string } | null> => {
    if (!element) {
      console.error("No element provided for PDF generation");
      return null;
    }

    try {
      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = "210mm"; // A4 width
      clone.style.background = "white";
      document.body.appendChild(clone);

      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Get base64 without the data URL prefix
      const pdfBase64 = pdf.output("datauristring").split(",")[1];
      
      return {
        base64: pdfBase64,
        filename: `${filename}.pdf`,
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  }, []);

  return { generatePdfBase64 };
}
