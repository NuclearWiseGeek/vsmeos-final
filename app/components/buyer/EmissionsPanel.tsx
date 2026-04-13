// =============================================================================
// FILE: components/buyer/EmissionsPanel.tsx
// PURPOSE: Phase 3.1 — Per-supplier emissions breakdown table + bar chart.
//          Shows scope 1/2/3 split and total tCO₂e for each submitted supplier.
//          Client component (needs Chart.js).
// =============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { BarChart2 } from 'lucide-react';

interface EmissionsPanelProps {
  emissionsData: any[];
}

// Normalise a row into a flat display object
function normaliseRow(row: any) {
  const invite = Array.isArray(row.supplier_invites)
    ? row.supplier_invites[0]
    : row.supplier_invites;
  const totals = row.emissions_totals || {};
  // Support both new key format (scope1Total/grandTotal) and legacy (scope1/total)
  // so suppliers who submitted before Phase 3.1 still show correctly.
  return {
    name:    invite?.supplier_name || 'Unknown Supplier',
    scope1:  typeof totals.scope1Total === 'number' ? totals.scope1Total : (totals.scope1 ?? 0),
    scope2:  typeof totals.scope2Total === 'number' ? totals.scope2Total : (totals.scope2 ?? 0),
    scope3:  typeof totals.scope3Total === 'number' ? totals.scope3Total : (totals.scope3 ?? 0),
    total:   typeof totals.grandTotal  === 'number' ? totals.grandTotal  : (totals.total  ?? 0),
    date:    row.updated_at
      ? new Date(row.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—',
  };
}

function fmt(n: number) {
  if (n === 0) return '0';
  if (n < 0.1) return '<0.1';
  return n.toLocaleString('en-GB', { maximumFractionDigits: 1 });
}

// ── Simple horizontal bar chart via canvas ────────────────────────────────────
function EmissionsBarChart({ rows }: { rows: ReturnType<typeof normaliseRow>[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fix blurriness on retina/high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const sorted = [...rows].sort((a, b) => b.total - a.total).slice(0, 8);
    const maxVal = Math.max(...sorted.map(r => r.total), 1);

    const barH   = 32;
    const gap    = 12;
    const labelW = 160;
    const valW   = 70;
    const logicalW = canvas.offsetWidth || 640;
    const chartW = logicalW - labelW - valW - 20;
    const totalH = sorted.length * (barH + gap) + 40;

    // Set actual pixel size scaled by DPR
    canvas.width  = logicalW * dpr;
    canvas.height = totalH * dpr;

    // Scale canvas back down via CSS
    canvas.style.width  = logicalW + 'px';
    canvas.style.height = totalH + 'px';

    // Scale all drawing operations
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, logicalW, totalH);

    // Title
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('tCO₂e by supplier (submitted reports)', labelW, 16);

    sorted.forEach((row, i) => {
      const y = 32 + i * (barH + gap);

      // Label
      ctx.fillStyle = '#374151';
      ctx.font = '600 12px system-ui, sans-serif';
      const maxLabel = 22;
      const label = row.name.length > maxLabel ? row.name.slice(0, maxLabel) + '…' : row.name;
      ctx.fillText(label, 0, y + barH / 2 + 4);

      // Scope bars (stacked)
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
      // Minimum visible tick
      if (row.total === 0) {
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.roundRect(labelW, y, 4, barH, 2);
        ctx.fill();
      }

      // Value
      ctx.fillStyle = '#111827';
      ctx.font = '600 12px system-ui, sans-serif';
      ctx.fillText(`${fmt(row.total)} t`, labelW + chartW + 8, y + barH / 2 + 4);
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

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex items-center gap-5 text-xs text-gray-500 flex-wrap">
      {[
        { label: 'Scope 1 (Direct)',      colour: '#0C2918' },
        { label: 'Scope 2 (Energy)',      colour: '#1A5C3A' },
        { label: 'Scope 3 (Value chain)', colour: '#C9A84C' },
      ].map(({ label, colour }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: colour }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function EmissionsPanel({ emissionsData }: EmissionsPanelProps) {
  const rows = emissionsData.map(normaliseRow);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#0C2918]/10 rounded-lg flex items-center justify-center">
          <BarChart2 size={15} className="text-[#0C2918]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Supplier Emissions Breakdown</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            GHG Protocol Scope 1, 2 &amp; 3 from submitted reports
          </p>
        </div>
      </div>

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
              <th className="px-8 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Supplier</th>
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
                <td className="px-4 py-4 text-right font-mono text-gray-600 text-xs">
                  {fmt(row.scope1)} t
                </td>
                <td className="px-4 py-4 text-right font-mono text-gray-600 text-xs">
                  {fmt(row.scope2)} t
                </td>
                <td className="px-4 py-4 text-right font-mono text-gray-600 text-xs">
                  {fmt(row.scope3)} t
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#0C2918]/10 text-[#0C2918]">
                    {fmt(row.total)} tCO₂e
                  </span>
                </td>
                <td className="px-8 py-4 text-xs text-gray-400">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="px-8 py-4 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] text-gray-400">
          All figures in tCO₂e · GHG Protocol compliant · Sources: DEFRA 2025, ADEME V23.3, IEA 2025
        </p>
      </div>
    </div>
  );
}