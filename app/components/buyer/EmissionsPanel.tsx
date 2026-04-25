'use client';

// =============================================================================
// FILE: components/buyer/EmissionsPanel.tsx
// PURPOSE: Per-supplier emissions breakdown with year filter.
//
// CHANGE: Added year selector dropdown. Filters both the bar chart and the
//         table to only show suppliers who submitted for the selected year.
//         Prevents double-counting when the same supplier (e.g. BumbleCorp)
//         has submitted for multiple years — each year is a separate row in
//         the assessments table and should be reported separately.
//
// The year selector also affects KPI labels so buyers know which year's data
// is being summarised.
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { BarChart2, Calendar } from 'lucide-react';

interface EmissionsPanelProps {
  emissionsData: any[];
}

// Normalise a raw assessment row into a flat display object.
// Attaches the reporting year from the assessment row itself.
function normaliseRow(row: any) {
  const invite = Array.isArray(row.supplier_invites)
    ? row.supplier_invites[0]
    : row.supplier_invites;
  const totals = row.emissions_totals || {};
  return {
    name:   invite?.supplier_name || 'Unknown Supplier',
    year:   row.year ?? null,
    scope1: typeof totals.scope1Total === 'number' ? totals.scope1Total : (totals.scope1 ?? 0),
    scope2: typeof totals.scope2Total === 'number' ? totals.scope2Total : (totals.scope2 ?? 0),
    scope3: typeof totals.scope3Total === 'number' ? totals.scope3Total : (totals.scope3 ?? 0),
    total:  typeof totals.grandTotal  === 'number' ? totals.grandTotal  : (totals.total  ?? 0),
    date:   row.updated_at
      ? new Date(row.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—',
  };
}

function fmt(n: number) {
  if (n === 0) return '0';
  if (n < 0.1) return '<0.1';
  return n.toLocaleString('en-GB', { maximumFractionDigits: 1 });
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function EmissionsBarChart({ rows }: { rows: ReturnType<typeof normaliseRow>[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr     = window.devicePixelRatio || 1;
    const sorted  = [...rows].sort((a, b) => b.total - a.total).slice(0, 8);
    const maxVal  = Math.max(...sorted.map(r => r.total), 1);

    const barH     = 32;
    const gap      = 12;
    const labelW   = 160;
    const valW     = 70;
    const logicalW = canvas.offsetWidth || 640;
    const chartW   = logicalW - labelW - valW - 20;
    const totalH   = sorted.length * (barH + gap) + 40;

    canvas.width        = logicalW * dpr;
    canvas.height       = totalH * dpr;
    canvas.style.width  = logicalW + 'px';
    canvas.style.height = totalH + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, totalH);

    ctx.fillStyle = '#6b7280';
    ctx.font      = '11px system-ui, sans-serif';
    ctx.fillText('tCO₂e by supplier (submitted reports)', labelW, 16);

    sorted.forEach((row, i) => {
      const y = 32 + i * (barH + gap);

      ctx.fillStyle = '#374151';
      ctx.font      = '600 12px system-ui, sans-serif';
      const label   = row.name.length > 22 ? row.name.slice(0, 22) + '…' : row.name;
      ctx.fillText(label, 0, y + barH / 2 + 4);

      const scopes = [
        { val: row.scope1, colour: '#0C2918' },
        { val: row.scope2, colour: '#1A5C3A' },
        { val: row.scope3, colour: '#C9A84C' },
      ];
      let xOff = labelW;
      for (const { val, colour } of scopes) {
        const w = (val / maxVal) * chartW;
        if (w > 0) {
          ctx.fillStyle = colour;
          ctx.beginPath();
          ctx.roundRect(xOff, y, w, barH, 4);
          ctx.fill();
          xOff += w;
        }
      }
      if (row.total === 0) {
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.roundRect(labelW, y, 4, barH, 2);
        ctx.fill();
      }

      ctx.fillStyle = '#111827';
      ctx.font      = '600 12px system-ui, sans-serif';
      // CRITICAL: row.total is in kg — must divide by 1000 to display in tonnes.
      // Unit is tCO₂e (tonnes of CO₂ equivalent) — never just "t".
      ctx.fillText(`${fmt(row.total / 1000)} tCO₂e`, labelW + chartW + 8, y + barH / 2 + 4);
    });
  }, [rows]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={200}
      className="w-full h-auto"
      style={{ display: 'block' }}
    />
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-5 text-xs text-gray-500 flex-wrap">
      {[
        { label: 'Scope 1 (Direct)',                              colour: '#0C2918' },
        { label: 'Scope 2 (Location-Based)',                      colour: '#1A5C3A' },
        { label: 'Scope 3 (Cat. 6 & 7 — Travel & Commuting)',     colour: '#C9A84C' },
      ].map(({ label, colour }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: colour }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EmissionsPanel({ emissionsData }: EmissionsPanelProps) {
  const allRows = React.useMemo(
    () => emissionsData.map(normaliseRow),
    [emissionsData]
  );

  // Derive the set of available years from the data (memoised by year values)
  const availableYears = React.useMemo(
    () =>
      Array.from(new Set(allRows.map(r => r.year).filter(Boolean)))
        .sort((a, b) => (b as number) - (a as number)) as number[],
    [allRows]
  );

  // Default to the most recent year present in data
  const [selectedYear, setSelectedYear] = useState<number | null>(
    availableYears[0] ?? null
  );

  // Re-sync when the available years change (e.g. real-time Supabase update
  // brings in a new year, or the currently-selected year disappears from data).
  // Depend on the stringified year list so React fires only when year values
  // actually change — not on every parent re-render.
  const yearsKey = availableYears.join(',');
  useEffect(() => {
    if (selectedYear === null && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    } else if (selectedYear !== null && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearsKey]);

  // Filter rows to the selected year (or all if no year data)
  const rows = selectedYear !== null
    ? allRows.filter(r => r.year === selectedYear)
    : allRows;

  // Aggregates for the filtered set
  const totalTCO2e = rows.reduce((s, r) => s + r.total, 0) / 1000;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0C2918]/10 rounded-lg flex items-center justify-center">
            <BarChart2 size={15} className="text-[#0C2918]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Supplier Emissions Breakdown</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              GHG Protocol Scope 1, 2 &amp; 3 from submitted reports
              {rows.length > 0 && (
                <> · <span className="font-medium text-gray-700">{fmt(totalTCO2e)} tCO₂e total{selectedYear ? ` in FY ${selectedYear}` : ''}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Year filter — only shown when there are multiple years */}
        {availableYears.length > 1 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Calendar size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Financial Year:</span>
            <div className="flex items-center gap-1">
              {availableYears.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedYear === y
                      ? 'bg-[#0C2918] text-[#C9A84C]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {y}
                </button>
              ))}
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedYear === null
                    ? 'bg-[#0C2918] text-[#C9A84C]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="px-8 py-12 text-center text-sm text-gray-400">
          No submitted reports{selectedYear ? ` for FY ${selectedYear}` : ''}.
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <div className="px-8 pt-6 pb-4">
            <EmissionsBarChart rows={rows} />
            <div className="mt-4">
              <Legend />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50 text-left">
                  <th className="px-8 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Supplier</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">FY</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Scope 1</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Scope 2</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Scope 3</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="px-8 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Report Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-8 py-4">
                      <span className="font-medium text-gray-900">{row.name}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {row.year ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-gray-600 text-xs">
                      {fmt(row.scope1 / 1000)} t
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-gray-600 text-xs">
                      {fmt(row.scope2 / 1000)} t
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-gray-600 text-xs">
                      {fmt(row.scope3 / 1000)} t
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#0C2918]/10 text-[#0C2918]">
                        {fmt(row.total / 1000)} tCO₂e
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs text-gray-400">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] text-gray-400">
          All figures in tCO₂e · GHG Protocol aligned · Sources: DEFRA 2025, ADEME Base Carbone V23.6 (2025), IEA 2025
          {availableYears.length > 1 && selectedYear && (
            <> · Showing FY {selectedYear} only — use year buttons above to switch or view all</>
          )}
        </p>
      </div>
    </div>
  );
}