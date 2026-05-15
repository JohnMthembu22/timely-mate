import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TemplateData, getTemplateById } from './invoiceTemplates';

export interface PDFOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

export const generatePDF = async (
  templateId: string,
  data: TemplateData,
  options: PDFOptions = {}
): Promise<Blob> => {
  const {
    filename = `${data.documentType.toLowerCase()}-${data.documentNumber}.pdf`,
    format = 'a4',
    orientation = 'portrait',
    quality = 1.0
  } = options;

  // Get the template
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template with ID "${templateId}" not found`);
  }

  // Generate HTML
  const html = template.generateHTML(data);

  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '800px';
  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: container.scrollHeight
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

    // Return as blob
    return pdf.output('blob');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

export const downloadPDF = async (
  templateId: string,
  data: TemplateData,
  options: PDFOptions = {}
): Promise<void> => {
  const blob = await generatePDF(templateId, data, options);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = options.filename || `${data.documentType.toLowerCase()}-${data.documentNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const previewHTML = (templateId: string, data: TemplateData): void => {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template with ID "${templateId}" not found`);
  }

  const html = template.generateHTML(data);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  }
}; 