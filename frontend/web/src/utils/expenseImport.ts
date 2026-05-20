/** Helpers for expense / cashbook CSV import mapping and validation */

export const EXPENSE_SYSTEM_FIELDS = [
  'date',
  'amount',
  'category',
  'description',
  'project',
  'mileage',
  'liters',
  'pricePerLiter',
  'location',
] as const;

const FIELD_ALIASES: Record<string, string[]> = {
  date: ['date', 'transaction date', 'trans date', 'expense date', 'when', 'datum', 'posted'],
  amount: ['amount', 'cost', 'price', 'total', 'value', 'debit', 'credit', 'betrag', 'sum'],
  category: ['category', 'type', 'expense type', 'class'],
  description: ['description', 'desc', 'details', 'notes', 'memo', 'narration', 'particulars', 'item'],
  project: ['project', 'job', 'site', 'client', 'work order'],
  mileage: ['mileage', 'km', 'miles', 'distance'],
  liters: ['liters', 'litres', 'volume', 'fuel volume'],
  pricePerLiter: ['price per liter', 'priceperliter', 'rate', 'unit price'],
  location: ['location', 'place', 'address', 'vendor'],
  type: ['type', 'transaction type', 'income', 'expense', 'dr', 'cr', 'debit', 'credit'],
  reference: ['reference', 'ref', 'invoice', 'receipt', 'id', 'number'],
};

export function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, '');
}

export function detectCsvDelimiter(firstLine: string): ',' | ';' | '\t' {
  const line = stripBom(firstLine);
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const ch of line) {
    if (ch in counts) counts[ch as keyof typeof counts]++;
  }
  if (counts[';'] > counts[','] && counts[';'] > counts['\t']) return ';';
  if (counts['\t'] > counts[','] && counts['\t'] > counts[';']) return '\t';
  return ',';
}

export function parseCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  values.push(current.trim());
  return values.map((v) => v.replace(/^"|"$/g, '').trim());
}

export function normalizeHeaderKey(header: string): string {
  return stripBom(header).trim().toLowerCase();
}

const AUTO_MAP_FIELD_ORDER = [
  ...EXPENSE_SYSTEM_FIELDS,
  'type',
  'reference',
] as const;

/** Auto-map file column headers → system field names */
export function buildAutoHeaderMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedFields = new Set<string>();

  headers.forEach((header) => {
    const normalized = normalizeHeaderKey(header);
    if (!normalized) return;

    let matched: string | undefined;

    for (const field of AUTO_MAP_FIELD_ORDER) {
      if (usedFields.has(field)) continue;
      const aliases = FIELD_ALIASES[field] ?? [field];
      if (
        normalized === field ||
        aliases.some((a) => normalized === a || normalized.includes(a) || a.includes(normalized))
      ) {
        matched = field;
        break;
      }
    }

    if (matched) {
      mapping[header] = matched;
      usedFields.add(matched);
    }
  });

  return mapping;
}

export function mapImportRow(
  row: Record<string, unknown>,
  headerMapping: Record<string, string>
): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const [fileHeader, systemField] of Object.entries(headerMapping)) {
    if (!systemField) continue;
    const raw = row[fileHeader];
    if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
      mapped[systemField] = String(raw).trim();
    }
  }

  for (const field of ['date', 'amount', 'description', 'category', 'project', 'type', 'reference'] as const) {
    if (mapped[field]) continue;
    for (const [key, raw] of Object.entries(row)) {
      if (raw === undefined || raw === null || String(raw).trim() === '') continue;
      const nk = normalizeHeaderKey(key);
      const aliases = FIELD_ALIASES[field] ?? [field];
      if (
        nk === field ||
        aliases.some((a) => nk === a || nk.includes(a) || a.includes(nk))
      ) {
        mapped[field] = String(raw).trim();
        break;
      }
    }
  }

  return mapped;
}

export function normalizeImportAmount(raw: string): string | null {
  const cleaned = raw
    .replace(/[^\d.,\-]/g, '')
    .replace(/,(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const n = parseFloat(cleaned);
  if (Number.isNaN(n)) return null;
  return String(n);
}

export function normalizeImportDate(raw: string): string | null {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const dmy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    return `${dmy[3]}-${month}-${day}`;
  }

  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }
  return null;
}

export function normalizeExpenseImportRow(row: Record<string, string>): Record<string, string> {
  const out = { ...row };
  if (out.date) {
    const d = normalizeImportDate(out.date);
    if (d) out.date = d;
  }
  if (out.amount) {
    const a = normalizeImportAmount(out.amount);
    if (a) out.amount = a;
  }
  if (out.description) {
    out.description = out.description.trim();
  }
  return out;
}

export function getMissingRequiredMappings(
  headerMapping: Record<string, string>,
  required: string[] = ['date', 'amount', 'description']
): string[] {
  const mapped = new Set(Object.values(headerMapping).filter(Boolean));
  const labels: Record<string, string> = {
    date: 'Date',
    amount: 'Amount',
    description: 'Description',
    type: 'Type (income/expense)',
  };
  return required.filter((f) => !mapped.has(f)).map((f) => labels[f] ?? f);
}

export function mapImportRows(
  data: Record<string, unknown>[],
  headerMapping: Record<string, string>
): Record<string, string>[] {
  return data.map((row) => normalizeExpenseImportRow(mapImportRow(row, headerMapping)));
}
