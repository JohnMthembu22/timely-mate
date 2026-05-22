import { format } from 'date-fns';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { incidentCoordinatesMapUrl } from './incidentGeolocation';
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  type FieldIncidentReport,
} from './incidentReportTypes';

export type IncidentExportFormat = 'excel' | 'pdf' | 'email';

const BRAND = 'Timely Mate';
const PDF_MARGIN = 14;
const PDF_HEADER_BG: [number, number, number] = [79, 70, 229];
const PDF_ROW_ALT: [number, number, number] = [248, 250, 252];
const PDF_BORDER: [number, number, number] = [226, 232, 240];

function formatWhen(iso?: string): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'PPpp');
  } catch {
    return iso;
  }
}

function yesNo(value: boolean | undefined): string {
  if (value === undefined) return '—';
  return value ? 'Yes' : 'No';
}

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').slice(0, 48);
}

export function incidentExportBasename(report: FieldIncidentReport): string {
  const ref = report.referenceNumber ?? report.id;
  return `incident-${sanitizeFilenamePart(ref)}`;
}

export interface IncidentExportRow {
  Field: string;
  Value: string;
}

export interface IncidentExportSection {
  title: string;
  rows: IncidentExportRow[];
}

export function buildIncidentExportSections(report: FieldIncidentReport): IncidentExportSection[] {
  const mapUrl = incidentCoordinatesMapUrl(report.gpsCoordinates);
  const gpsDisplay = report.gpsCoordinates
    ? mapUrl
      ? `${report.gpsCoordinates} — ${mapUrl}`
      : report.gpsCoordinates
    : '—';

  return [
    {
      title: 'INCIDENT OVERVIEW',
      rows: [
        { Field: 'Reference', Value: report.referenceNumber ?? report.id },
        { Field: 'Title', Value: report.title },
        { Field: 'Status', Value: INCIDENT_STATUS_LABELS[report.status] },
        { Field: 'Category', Value: INCIDENT_CATEGORY_LABELS[report.category] },
        { Field: 'Severity', Value: INCIDENT_SEVERITY_LABELS[report.severity] },
        { Field: 'Reported by', Value: report.reportedByName },
        { Field: 'Reporter contact', Value: report.reporterContact ?? '—' },
      ],
    },
    {
      title: 'LOCATION & TIMING',
      rows: [
        { Field: 'Site', Value: report.siteName ?? '—' },
        { Field: 'Location on site', Value: report.locationLabel ?? '—' },
        { Field: 'GPS / coordinates', Value: gpsDisplay },
        { Field: 'Site conditions', Value: report.environmentalConditions ?? '—' },
        { Field: 'Incident occurred', Value: formatWhen(report.incidentOccurredAt) },
        { Field: 'Report filed', Value: formatWhen(report.reportedAt) },
        { Field: 'Last updated', Value: formatWhen(report.updatedAt) },
      ],
    },
    {
      title: 'INCIDENT NARRATIVE',
      rows: [
        { Field: 'Description', Value: report.description },
        { Field: 'Immediate actions', Value: report.immediateActions ?? '—' },
        { Field: 'Equipment involved', Value: report.equipmentInvolved ?? '—' },
        { Field: 'Contributing factors', Value: report.contributingFactors ?? '—' },
      ],
    },
    {
      title: 'PEOPLE & IMPACT',
      rows: [
        { Field: 'People involved', Value: report.peopleInvolved ?? '—' },
        { Field: 'Witnesses', Value: report.witnesses ?? '—' },
        { Field: 'Injuries reported', Value: yesNo(report.injuriesReported) },
        { Field: 'Injury details', Value: report.injuryDetails ?? '—' },
        { Field: 'Work stopped', Value: yesNo(report.workStopped) },
      ],
    },
    {
      title: 'ESCALATION & FOLLOW-UP',
      rows: [
        { Field: 'Authorities notified', Value: yesNo(report.authoritiesNotified) },
        { Field: 'Authority reference', Value: report.authorityReference ?? '—' },
        { Field: 'Follow-up required', Value: yesNo(report.followUpRequired) },
        { Field: 'Follow-up notes', Value: report.followUpNotes ?? '—' },
        { Field: 'Photos attached', Value: String(report.photos?.length ?? 0) },
      ],
    },
  ];
}

export function buildIncidentExportRows(report: FieldIncidentReport): IncidentExportRow[] {
  return buildIncidentExportSections(report).flatMap((s) => s.rows);
}

export function buildIncidentEmailPlainText(report: FieldIncidentReport): string {
  const generated = format(new Date(), 'PPpp');
  const header = [
    `${BRAND} — Field Incident Report`,
    `Reference: ${report.referenceNumber ?? report.id}`,
    `Generated: ${generated}`,
    '═'.repeat(48),
    '',
  ].join('\n');

  const sections = buildIncidentExportSections(report)
    .map((section) => {
      const lines = section.rows.map((r) => `  ${r.Field}: ${r.Value}`);
      return `${section.title}\n${'─'.repeat(32)}\n${lines.join('\n')}`;
    })
    .join('\n\n');

  const footer = [
    '',
    '═'.repeat(48),
    `View in app: ${typeof window !== 'undefined' ? `${window.location.origin}/offsite-work/incidents` : '/offsite-work/incidents'}`,
    report.photos?.length
      ? `\n${report.photos.length} photo(s) on file — export PDF from the app to include images.`
      : '',
  ].join('\n');

  return `${header}${sections}${footer}`;
}

function appendExcelSection(aoa: (string | number)[][], title: string, rows: IncidentExportRow[]): void {
  aoa.push([title]);
  aoa.push(['Field', 'Value']);
  for (const row of rows) {
    aoa.push([row.Field, row.Value]);
  }
  aoa.push([]);
}

function styleExcelSheet(ws: XLSX.WorkSheet, rowCount: number): void {
  ws['!cols'] = [{ wch: 26 }, { wch: 72 }];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
  ];
  if (rowCount > 0) {
    ws['!autofilter'] = { ref: `A1:B${rowCount}` };
  }
}

export function exportIncidentReportExcel(report: FieldIncidentReport): void {
  const generated = format(new Date(), 'PPpp');
  const sections = buildIncidentExportSections(report);
  const aoa: (string | number)[][] = [
    [`${BRAND} — Field Incident Report`],
    [`Reference: ${report.referenceNumber ?? report.id}  |  Generated: ${generated}`],
    [],
    ['QUICK SUMMARY'],
    ['Title', report.title],
    ['Severity', INCIDENT_SEVERITY_LABELS[report.severity]],
    ['Status', INCIDENT_STATUS_LABELS[report.status]],
    ['Category', INCIDENT_CATEGORY_LABELS[report.category]],
    ['Site', report.siteName ?? '—'],
    ['GPS', report.gpsCoordinates ?? '—'],
    [],
  ];

  for (const section of sections) {
    appendExcelSection(aoa, section.title, section.rows);
  }

  const workbook = XLSX.utils.book_new();
  const mainSheet = XLSX.utils.aoa_to_sheet(aoa);
  styleExcelSheet(mainSheet, aoa.length);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Incident Report');

  const checklistAoa: (string | number)[][] = [
    ['Incident checklist'],
    ['Item', 'Response'],
    ['Injuries reported', yesNo(report.injuriesReported)],
    ['Work stopped', yesNo(report.workStopped)],
    ['Authorities notified', yesNo(report.authoritiesNotified)],
    ['Follow-up required', yesNo(report.followUpRequired)],
    ['Photos attached', report.photos?.length ?? 0],
  ];
  const checklistSheet = XLSX.utils.aoa_to_sheet(checklistAoa);
  checklistSheet['!cols'] = [{ wch: 28 }, { wch: 40 }];
  checklistSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  XLSX.utils.book_append_sheet(workbook, checklistSheet, 'Checklist');

  if (report.photos?.length) {
    const photoAoa: (string | number)[][] = [
      ['Photo evidence index'],
      ['#', 'File name', 'Uploaded', 'Format', 'Notes'],
    ];
    report.photos.forEach((p, i) => {
      photoAoa.push([i + 1, p.name, formatWhen(p.uploadedAt), p.mimeType, 'See PDF export for embedded images']);
    });
    const photoSheet = XLSX.utils.aoa_to_sheet(photoAoa);
    photoSheet['!cols'] = [{ wch: 5 }, { wch: 24 }, { wch: 22 }, { wch: 12 }, { wch: 36 }];
    photoSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    XLSX.utils.book_append_sheet(workbook, photoSheet, 'Photos');
  }

  XLSX.writeFile(workbook, `${incidentExportBasename(report)}.xlsx`);
}

function ensurePdfSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - PDF_MARGIN) {
    doc.addPage();
    return PDF_MARGIN + 8;
  }
  return y;
}

function drawPdfBrandHeader(doc: jsPDF, report: FieldIncidentReport): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const bandHeight = 28;
  doc.setFillColor(...PDF_HEADER_BG);
  doc.rect(0, 0, pageWidth, bandHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(BRAND, PDF_MARGIN, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Field Incident Report', PDF_MARGIN, 18);

  doc.setFontSize(9);
  const metaRight = [
    report.referenceNumber ?? report.id,
    `${INCIDENT_SEVERITY_LABELS[report.severity]} · ${INCIDENT_STATUS_LABELS[report.status]}`,
    format(new Date(), 'PPpp'),
  ];
  let metaY = 10;
  for (const line of metaRight) {
    doc.text(line, pageWidth - PDF_MARGIN, metaY, { align: 'right' });
    metaY += 5;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  return bandHeight + 10;
}

function measurePdfRowHeight(doc: jsPDF, value: string, valueWidth: number): number {
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(value, valueWidth - 6) as string[];
  return Math.max(8, lines.length * 4.2 + 3);
}

function drawPdfTable(
  doc: jsPDF,
  startY: number,
  title: string,
  rows: IncidentExportRow[],
  labelWidth: number,
  valueWidth: number
): number {
  let y = ensurePdfSpace(doc, startY, 16);
  const startX = PDF_MARGIN;
  const totalWidth = labelWidth + valueWidth;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text(title, startX, y);
  y += 6;

  const headerH = 8;
  y = ensurePdfSpace(doc, y, headerH);
  doc.setFillColor(...PDF_HEADER_BG);
  doc.rect(startX, y - 5.5, totalWidth, headerH, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('Field', startX + 3, y);
  doc.text('Details', startX + labelWidth + 3, y);
  y += headerH;

  doc.setTextColor(15, 23, 42);
  for (let i = 0; i < rows.length; i++) {
    const rowH = measurePdfRowHeight(doc, rows[i].Value, valueWidth);
    y = ensurePdfSpace(doc, y, rowH + 2);

    if (i % 2 === 0) {
      doc.setFillColor(...PDF_ROW_ALT);
      doc.rect(startX, y - 5, totalWidth, rowH, 'F');
    }

    doc.setDrawColor(...PDF_BORDER);
    doc.rect(startX, y - 5, totalWidth, rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const labelLines = doc.splitTextToSize(rows[i].Field, labelWidth - 6) as string[];
    doc.text(labelLines[0] ?? rows[i].Field, startX + 3, y);

    doc.setFont('helvetica', 'normal');
    const valueLines = doc.splitTextToSize(rows[i].Value, valueWidth - 6) as string[];
    let vy = y;
    for (const line of valueLines) {
      doc.text(line, startX + labelWidth + 3, vy);
      vy += 4.2;
    }

    y += rowH + 1;
  }

  return y + 5;
}

function drawPdfSummaryStrip(doc: jsPDF, report: FieldIncidentReport, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - PDF_MARGIN * 2;
  y = ensurePdfSpace(doc, y, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(report.title, maxWidth) as string[];
  doc.text(titleLines[0] ?? report.title, PDF_MARGIN, y);
  y += 7;

  const chips = [
    INCIDENT_CATEGORY_LABELS[report.category],
    INCIDENT_SEVERITY_LABELS[report.severity],
    report.siteName ?? 'No site',
  ].join('   ·   ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(chips, PDF_MARGIN, y);
  y += 8;

  doc.setDrawColor(...PDF_BORDER);
  doc.line(PDF_MARGIN, y, pageWidth - PDF_MARGIN, y);
  return y + 6;
}

export function exportIncidentReportPdf(report: FieldIncidentReport): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PDF_MARGIN * 2;
  const labelWidth = 52;
  const valueWidth = contentWidth - labelWidth;

  let y = drawPdfBrandHeader(doc, report);
  y = drawPdfSummaryStrip(doc, report, y);

  for (const section of buildIncidentExportSections(report)) {
    y = drawPdfTable(doc, y, section.title, section.rows, labelWidth, valueWidth);
  }

  if (report.photos?.length) {
    y = ensurePdfSpace(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    doc.text('PHOTO EVIDENCE', PDF_MARGIN, y);
    y += 8;

    const imgWidth = (contentWidth - 6) / 2;
    const imgHeight = 42;
    let col = 0;

    for (const photo of report.photos) {
      if (col === 0) y = ensurePdfSpace(doc, y, imgHeight + 12);

      const x = PDF_MARGIN + col * (imgWidth + 6);
      doc.setDrawColor(...PDF_BORDER);
      doc.rect(x, y - 2, imgWidth, imgHeight + 8);

      try {
        doc.addImage(photo.dataUrl, 'JPEG', x + 1, y, imgWidth - 2, imgHeight);
      } catch {
        doc.setFontSize(9);
        doc.text(`[${photo.name}]`, x + 4, y + imgHeight / 2);
      }

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(photo.name, x + 2, y + imgHeight + 5);

      col += 1;
      if (col >= 2) {
        col = 0;
        y += imgHeight + 12;
      }
    }
    if (col === 1) y += imgHeight + 12;
  }

  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${p} of ${pageCount}  ·  ${BRAND} Field Operations`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`${incidentExportBasename(report)}.pdf`);
}

export function openIncidentReportEmail(
  report: FieldIncidentReport,
  options?: { to?: string }
): void {
  const subject = `Field incident: ${report.title} [${report.referenceNumber ?? report.id}]`;
  const body = buildIncidentEmailPlainText(report);
  const params = new URLSearchParams({ subject, body });
  const to = options?.to?.trim();
  const href = to ? `mailto:${to}?${params.toString()}` : `mailto:?${params.toString()}`;
  window.location.href = href;
}

export function runIncidentExport(
  report: FieldIncidentReport,
  format: IncidentExportFormat,
  options?: { emailTo?: string }
): void {
  if (format === 'excel') exportIncidentReportExcel(report);
  else if (format === 'pdf') exportIncidentReportPdf(report);
  else openIncidentReportEmail(report, { to: options?.emailTo });
}
