export type ParsedTransactionRow = {
  rowNumber: number;
  raw: Record<string, string>;
  type: "income" | "expense" | null;
  amount: number | null;
  txDate: string | null; // normalized to YYYY-MM-DD
  categoryName: string | null;
  note: string | null;
  errors: string[];
};

/** Minimal RFC4180-ish CSV parser: handles quoted fields, commas and
 * escaped quotes ("") inside quotes. Good enough for spreadsheet
 * exports without pulling in a dependency for it. */
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // DD/MM/YYYY or MM/DD/YYYY — assume DD/MM/YYYY (more common outside the US);
  // if the first segment is > 12, it can only be a day, confirming that guess
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, a, b, year] = slashMatch;
    const day = Number(a) > 12 ? a : b;
    const month = Number(a) > 12 ? b : a;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

function normalizeAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Expects headers (case-insensitive, any order): date, amount, and
 * optionally type, category, note. If type is missing, it's inferred
 * from the amount's sign (negative = expense, positive = income).
 */
export function mapCsvToTransactions(rows: string[][]): ParsedTransactionRow[] {
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const dateIdx = headers.findIndex((h) => h === "date" || h === "tx_date");
  const amountIdx = headers.findIndex((h) => h === "amount");
  const typeIdx = headers.findIndex((h) => h === "type");
  const categoryIdx = headers.findIndex((h) => h === "category");
  const noteIdx = headers.findIndex((h) => h === "note" || h === "description");

  const dataRows = rows.slice(1);

  return dataRows.map((cells, i) => {
    const errors: string[] = [];
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => (raw[h] = cells[idx] ?? ""));

    let txDate: string | null = null;
    if (dateIdx === -1) {
      errors.push("No 'date' column found.");
    } else {
      txDate = normalizeDate(cells[dateIdx] ?? "");
      if (!txDate) errors.push(`Unrecognized date: "${cells[dateIdx]}"`);
    }

    let amount: number | null = null;
    if (amountIdx === -1) {
      errors.push("No 'amount' column found.");
    } else {
      amount = normalizeAmount(cells[amountIdx] ?? "");
      if (amount === null) errors.push(`Unrecognized amount: "${cells[amountIdx]}"`);
    }

    let type: "income" | "expense" | null = null;
    if (typeIdx !== -1) {
      const t = (cells[typeIdx] ?? "").trim().toLowerCase();
      if (t === "income" || t === "expense") type = t;
      else errors.push(`Unrecognized type: "${cells[typeIdx]}"`);
    } else if (amount !== null) {
      type = amount < 0 ? "expense" : "income";
    }

    if (amount !== null) amount = Math.abs(amount);

    return {
      rowNumber: i + 2, // +1 for header row, +1 for 1-indexing
      raw,
      type,
      amount,
      txDate,
      categoryName: categoryIdx !== -1 ? (cells[categoryIdx] ?? "").trim() || null : null,
      note: noteIdx !== -1 ? (cells[noteIdx] ?? "").trim() || null : null,
      errors,
    };
  });
}
