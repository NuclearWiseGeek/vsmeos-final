// =============================================================================
// FILE: components/buyer/ExportButton.tsx
// PURPOSE: Phase 3.2 — CSV export button. Receives pre-fetched data from the
//          server component and triggers a browser download client-side.
//          No additional server round-trip needed.
// =============================================================================

'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface ExportRow {
  supplier_name:  string;
  supplier_email: string;
  status:         string;
  country:        string;
  scope1_tco2e:   number | string;
  scope2_tco2e:   number | string;
  scope3_tco2e:   number | string;
  total_tco2e:    number | string;
  report_date:    string;
}

interface ExportButtonProps {
  csvData: ExportRow[];
}

function escapeCSV(val: string | number): string {
  const str = String(val ?? '');
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSV(rows: ExportRow[]): string {
  const headers = [
    'Supplier Name',
    'Email',
    'Status',
    'Country',
    'Scope 1 (tCO₂e)',
    'Scope 2 (tCO₂e)',
    'Scope 3 (tCO₂e)',
    'Total (tCO₂e)',
    'Report Date',
  ];

  const lines = [
    headers.join(','),
    ...rows.map(row =>
      [
        row.supplier_name,
        row.supplier_email,
        row.status,
        row.country,
        row.scope1_tco2e,
        row.scope2_tco2e,
        row.scope3_tco2e,
        row.total_tco2e,
        row.report_date,
      ]
        .map(escapeCSV)
        .join(',')
    ),
  ];

  return lines.join('\r\n');
}

export default function ExportButton({ csvData }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  function handleExport() {
    if (csvData.length === 0) return;
    setLoading(true);

    try {
      const csv     = buildCSV(csvData);
      const blob    = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
      const url     = URL.createObjectURL(blob);
      const link    = document.createElement('a');
      const date    = new Date().toISOString().slice(0, 10);
      link.href     = url;
      link.download = `vsme-suppliers-${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  if (csvData.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0C2918] text-[#C9A84C] hover:bg-[#122F1E] transition-colors disabled:opacity-60"
      title="Export all supplier data as CSV"
    >
      {loading
        ? <Loader2 size={14} className="animate-spin" />
        : <Download size={14} />}
      Export CSV
    </button>
  );
}