function csvCell(value: string) {
  return /[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function exportCsv(options: {
  filenamePrefix: string;
  header: string[];
  rows: string[][];
}): void {
  const { filenamePrefix, header, rows } = options;
  const csv = [header, ...rows].map((cols) => cols.map(csvCell).join(",")).join("\n");
  // Prepend a UTF-8 BOM so Excel renders Cyrillic/accented names correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
