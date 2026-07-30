"use client";

import { useState } from "react";
import Link from "next/link";
import { parseCsvText, mapCsvToTransactions, type ParsedTransactionRow } from "@/lib/csv";
import { importCsvRows } from "@/lib/actions";

export function CsvImporter({
  categoryNames,
  currency,
}: {
  categoryNames: string[];
  currency: string;
}) {
  const [rows, setRows] = useState<ParsedTransactionRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ importedCount: number; skippedCount: number } | null>(null);

  const knownCategories = new Set(categoryNames.map((c) => c.toLowerCase()));

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = mapCsvToTransactions(parseCsvText(text));
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  async function handleImport() {
    setImporting(true);
    try {
      const res = await importCsvRows(
        validRows.map((r) => ({
          type: r.type!,
          amount: r.amount!,
          txDate: r.txDate!,
          categoryName: r.categoryName,
          note: r.note,
        }))
      );
      setResult(res);
      setRows([]);
      setFileName(null);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <label className="block text-xs text-ink-soft mb-1">
          CSV file (columns: date, amount, and optionally type, category, note)
        </label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="text-sm"
        />
      </div>

      {result && (
        <div className="ledger-rule pt-4 mb-6">
          <p className="text-sm text-sage mb-1">
            Imported {result.importedCount} transaction{result.importedCount === 1 ? "" : "s"}
            {result.skippedCount > 0 && `, skipped ${result.skippedCount} with errors`}.
          </p>
          {result.importedCount > 0 && (
            <p className="text-sm text-ink-soft">
              Head to{" "}
              <Link href="/dashboard/overview" className="underline text-ink">
                Overview
              </Link>{" "}
              to see them reflected in your summary and category breakdown, or{" "}
              <Link href="/dashboard/budget" className="underline text-ink">
                Budget
              </Link>{" "}
              to check them against any monthly budgets you've set.
            </p>
          )}
        </div>
      )}

      {fileName && rows.length > 0 && (
        <div className="mb-8">
          <p className="text-sm text-ink mb-1">
            {fileName}: <span className="tabular">{validRows.length}</span> ready to import
            {invalidRows.length > 0 && (
              <span className="text-rust">, {invalidRows.length} with errors (will be skipped)</span>
            )}
          </p>

          <div className="max-h-96 overflow-y-auto ledger-rule pt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft uppercase tracking-wide">
                  <th className="py-1.5 font-normal">Row</th>
                  <th className="py-1.5 font-normal">Date</th>
                  <th className="py-1.5 font-normal">Type</th>
                  <th className="py-1.5 font-normal">Category</th>
                  <th className="py-1.5 font-normal text-right">Amount</th>
                  <th className="py-1.5 font-normal">Note</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rowNumber} className={`ledger-rule ${r.errors.length > 0 ? "bg-rust-soft" : ""}`}>
                    <td className="py-1.5 tabular text-xs text-ink-soft">{r.rowNumber}</td>
                    {r.errors.length > 0 ? (
                      <td colSpan={5} className="py-1.5 text-xs text-rust">
                        {r.errors.join(" ")}
                      </td>
                    ) : (
                      <>
                        <td className="py-1.5 tabular">{r.txDate}</td>
                        <td className="py-1.5 capitalize">{r.type}</td>
                        <td className="py-1.5">
                          {r.categoryName ? (
                            knownCategories.has(r.categoryName.toLowerCase()) ? (
                              r.categoryName
                            ) : (
                              <span className="text-ink-soft">{r.categoryName} (new/unmatched)</span>
                            )
                          ) : (
                            <span className="text-ink-soft">&mdash;</span>
                          )}
                        </td>
                        <td className="py-1.5 tabular text-right">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(r.amount!)}
                        </td>
                        <td className="py-1.5 text-ink-soft text-xs">{r.note ?? ""}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={importing || validRows.length === 0}
            className="mt-4 rounded-full border border-ink bg-ink text-parchment px-5 py-2.5 text-sm hover:bg-transparent hover:text-ink transition-colors disabled:opacity-50"
          >
            {importing
              ? "Importing\u2026"
              : `Import ${validRows.length} transaction${validRows.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </div>
  );
}
