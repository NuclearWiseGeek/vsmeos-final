// =============================================================================
// FILE: app/buyer/dashboard/page.tsx
// PURPOSE: The Buyer Dashboard — the procurement manager's command centre.
//          Shows the real-time status of their entire supplier carbon programme.
//
// KPI CARDS (all dynamic, calculated from live Supabase data):
//   1. Total Suppliers     — count of all supplier_invites for this buyer
//   2. Invites Sent        — count where status = 'sent'
//   3. In Progress         — count where status = 'started' (supplier opened but not submitted)
//   4. Completed           — count where status = 'submitted' (report generated)
//   5. Data Coverage %     — (submitted ÷ total) × 100
//   6. Pending (not sent)  — count where status = 'draft' (added but not yet invited)
//
// PHASE 3.1 ADDITIONS:
//   7. Total tCO₂e         — sum of grandTotal from all submitted assessments
//   8. Avg Intensity        — tCO₂e per €M revenue across submitted suppliers
//   9. EmissionsPanel       — per-supplier scope 1/2/3 breakdown table + bar chart
//
// PHASE 3.2 ADDITIONS:
//   10. ExportButton        — downloads all supplier data + emissions as .csv
//
// STATUS VALUES (from supplier_invites table):
//   'draft'     → Added to list but invite email not yet sent
//   'sent'      → Invite email sent, supplier hasn't started yet
//   'started'   → Supplier has opened the assessment (in progress)
//   'submitted' → Supplier has generated their PDF report (complete)
//
// WHEN TO MODIFY:
//   - Phase 4: Add anomaly detection flags on the supplier table
//   - Phase 6: Add procurement marketplace filters
//
// DEPENDENCIES:
//   - actions/buyer.ts — getSuppliers(), getSupplierEmissions(), getCSVExportData()
//   - components/buyer/CSVUploader, InviteTable, ManualEntry
//   - components/buyer/EmissionsPanel (Phase 3.1)
//   - components/buyer/ExportButton   (Phase 3.2)
// =============================================================================

import React from 'react';
import CSVUploader from '@/components/buyer/CSVUploader';
import InviteTable from '@/components/buyer/InviteTable';
import ManualEntry from '@/components/buyer/ManualEntry';
import ProgressRing from '@/components/ProgressRing';
import EmissionsPanel from '@/components/buyer/EmissionsPanel';
import ExportButton from '@/components/buyer/ExportButton';
import { getSuppliers, getSupplierEmissions, getCSVExportData } from '@/actions/buyer';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/utils/supabase';
import {
  Users, Send, Clock, CheckCircle2,
  PieChart, TrendingUp, UserPlus, Wind
} from 'lucide-react';

// =============================================================================
// SECTION 1: KPI CALCULATION HELPERS
// Pure functions — no side effects, easy to test.
// =============================================================================

/**
 * Calculates all dashboard KPIs from the raw suppliers array.
 * This runs server-side so there's no client-side calculation delay.
 */
function calculateKPIs(suppliers: any[]) {
  const total     = suppliers.length;
  const pending   = suppliers.filter(s => s.status === 'draft').length;
  const sent      = suppliers.filter(s => s.status === 'sent').length;
  const inProgress = suppliers.filter(s => s.status === 'started').length;
  const completed = suppliers.filter(s => s.status === 'submitted').length;

  // Coverage = what % of suppliers have submitted their report
  // Guard against divide-by-zero when list is empty
  const coverage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Response rate = what % of invited suppliers have at least started
  // (sent + started + submitted) who have taken ANY action
  const responded = inProgress + completed;
  const responseRate = (sent + responded) > 0
    ? Math.round((responded / (sent + responded)) * 100)
    : 0;

  return { total, pending, sent, inProgress, completed, coverage, responseRate };
}

/**
 * Calculates emission KPIs from submitted assessment data.
 * Handles both new key format (scope1Total/grandTotal) and legacy (scope1/total).
 */
function calculateEmissionKPIs(emissionsData: any[]) {
  let totalTCO2e = 0;
  let totalRevenue = 0;

  for (const row of emissionsData) {
    const totals = row.emissions_totals;
    if (!totals) continue;
    // Support new keys (grandTotal) and legacy keys (total)
    const grand = typeof totals.grandTotal === 'number' ? totals.grandTotal
                : typeof totals.total      === 'number' ? totals.total
                : 0;
    totalTCO2e += grand;

    // Revenue lives on the joined supplier_invites row
    const invite = Array.isArray(row.supplier_invites) ? row.supplier_invites[0] : row.supplier_invites;
    const rev = invite?.revenue;
    if (rev && rev > 0) totalRevenue += rev;
  }

  // Avg intensity = tCO₂e per €M revenue
  const avgIntensity = totalRevenue > 0
    ? Math.round((totalTCO2e / (totalRevenue / 1_000_000)) * 10) / 10
    : null;

  return {
    totalTCO2e: Math.round(totalTCO2e * 10) / 10,
    avgIntensity,
    suppliersWithData: emissionsData.length,
  };
}

// =============================================================================
// SECTION 2: COVERAGE BAR COMPONENT
// Visual representation of data coverage percentage
// =============================================================================

function CoverageBar({ percent }: { percent: number }) {
  // Colour based on coverage level
  const colour =
    percent >= 80 ? '#16a34a' :  // green — good coverage
    percent >= 50 ? '#2563eb' :  // blue — moderate
    percent >= 25 ? '#d97706' :  // amber — low
                    '#dc2626';   // red — very low

  return (
    <div className="mt-3">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percent}%`, backgroundColor: colour }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">
        {percent >= 80
          ? 'Strong coverage — ready for CSRD reporting'
          : percent >= 50
          ? 'Good progress — keep inviting'
          : percent >= 25
          ? 'Low coverage — send reminders'
          : 'Getting started — invite suppliers'}
      </p>
    </div>
  );
}

// =============================================================================
// SECTION 3: MAIN DASHBOARD COMPONENT (Server Component)
// =============================================================================

export default async function BuyerDashboard() {

  // Auto-save buyer role silently on first load (Option B — no onboarding screen)
  const { userId, getToken } = await auth();
  if (userId) {
    try {
      const token = await getToken({ template: 'supabase' });
      if (token) {
        const supabase = createSupabaseClient(token);
        await supabase
          .from('profiles')
          .upsert({ id: userId, role: 'buyer', updated_at: new Date().toISOString() }, { onConflict: 'id' });
      }
    } catch (e) { /* non-fatal */ }
  }

  // Fetch all data in parallel — no sequential waterfall
  const [suppliers, emissionsData, csvData] = await Promise.all([
    getSuppliers(),
    getSupplierEmissions(),
    getCSVExportData(),
  ]);

  // Calculate all KPIs from the fetched data
  const kpis         = calculateKPIs(suppliers);
  const emissionKPIs = calculateEmissionKPIs(emissionsData);

  // Find the most recently active suppliers (for activity feed)
  const recentlySubmitted = suppliers
    .filter(s => s.status === 'submitted')
    .slice(0, 3);

  // ── Empty state — no suppliers yet ──────────────────────────────────────
  if (kpis.total === 0) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Supply Chain Carbon Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Track your suppliers' carbon reporting progress in real time.</p>
          </div>
        </div>

        {/* Empty state card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center empty-state-enter">
          <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserPlus size={26} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Start building your supplier list</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mb-8">
            Add suppliers manually or upload a CSV. Once invited, they complete their carbon assessment
            and you see real emission data here in real time.
          </p>
          <div className="max-w-lg mx-auto space-y-4">
            <ManualEntry />
            <CSVUploader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6">

      {/* ================================================================
          PAGE HEADER
          ================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Supply Chain Carbon Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your suppliers' carbon reporting progress in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Phase 3.2: CSV Export */}
          <ExportButton csvData={csvData} />
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            Live · Updates when suppliers submit
          </p>
        </div>
      </div>

      {/* ================================================================
          KPI CARDS — 4-column grid
          Each card is fully dynamic — calculated from live Supabase data.
          ================================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* CARD 1: Total Suppliers */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Suppliers
            </span>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users size={15} className="text-gray-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {kpis.total}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {kpis.pending > 0 ? `${kpis.pending} not yet invited` : 'All invited'}
          </p>
        </div>

        {/* CARD 2: Invites Sent */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-wider">
              Invited
            </span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Send size={15} className="text-blue-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">
            {kpis.sent}
          </div>
          <p className="text-xs text-blue-400 mt-1">
            Awaiting response
          </p>
        </div>

        {/* CARD 3: In Progress */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock size={15} className="text-amber-500" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 tracking-tight">
            {kpis.inProgress}
          </div>
          <p className="text-xs text-amber-500 mt-1">
            Filling in data now
          </p>
        </div>

        {/* CARD 4: Completed */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-green-600 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={15} className="text-green-500" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-green-600 tracking-tight">
            {kpis.completed}
          </div>
          <p className="text-xs text-green-500 mt-1">
            Reports generated
          </p>
        </div>

      </div>

      {/* ================================================================
          PHASE 3.1: EMISSION KPI CARDS
          Only shown once at least one supplier has submitted a report.
          ================================================================ */}
      {emissionKPIs.suppliersWithData > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Total tCO₂e */}
          <div className="bg-[#0C2918] p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider">
                Total Scope 3 Emissions
              </span>
              <div className="w-8 h-8 bg-[#122F1E] rounded-lg flex items-center justify-center">
                <Wind size={15} className="text-[#C9A84C]" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-white tracking-tight">
              {emissionKPIs.totalTCO2e.toLocaleString('en-GB')}
            </div>
            <p className="text-sm text-[#C9A84C]/70 mt-1">
              tCO₂e · from {emissionKPIs.suppliersWithData} submitted supplier{emissionKPIs.suppliersWithData !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Average Intensity */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Avg Emission Intensity
              </span>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={15} className="text-gray-400" />
              </div>
            </div>
            {emissionKPIs.avgIntensity !== null ? (
              <>
                <div className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {emissionKPIs.avgIntensity.toLocaleString('en-GB')}
                </div>
                <p className="text-xs text-gray-400 mt-1">tCO₂e per €M revenue</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-300 mt-2">—</div>
                <p className="text-xs text-gray-400 mt-1">Revenue data needed from suppliers</p>
              </>
            )}
          </div>

        </div>
      )}

      {/* ================================================================
          DATA COVERAGE SUMMARY BAR
          Wide card showing overall programme health at a glance.
          ================================================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

          {/* Left: Coverage ring */}
          <div className="flex items-center gap-6">
            <ProgressRing percent={kpis.coverage} size={110} stroke={9} />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PieChart size={14} className="text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Data Coverage
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-bold text-gray-900">{kpis.completed}</span> of{' '}
                <span className="font-bold text-gray-900">{kpis.total}</span> suppliers reported
              </p>
              <CoverageBar percent={kpis.coverage} />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-20 bg-gray-100" />

          {/* Right: Status breakdown */}
          <div className="flex flex-wrap sm:flex-col gap-4 sm:gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                <span className="font-bold text-gray-900">{kpis.pending}</span> not yet invited
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                <span className="font-bold text-blue-600">{kpis.sent}</span> invite sent
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                <span className="font-bold text-amber-600">{kpis.inProgress}</span> in progress
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                <span className="font-bold text-green-600">{kpis.completed}</span> submitted
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ================================================================
          PHASE 3.1: PER-SUPPLIER EMISSIONS BREAKDOWN
          Only shown once there is at least one submitted report with data.
          ================================================================ */}
      {emissionKPIs.suppliersWithData > 0 && (
        <EmissionsPanel emissionsData={emissionsData} />
      )}

      {/* ================================================================
          RECENTLY COMPLETED — quick wins panel
          Only shown when at least one supplier has submitted.
          Hidden once emission panel is showing (redundant info).
          ================================================================ */}
      {recentlySubmitted.length > 0 && emissionKPIs.suppliersWithData === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green-600" />
            <h3 className="text-sm font-bold text-green-800 uppercase tracking-widest">
              Recently Submitted
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {recentlySubmitted.map((s: any) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-xl"
              >
                <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700">{s.supplier_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================
          BULK INVITE — CSV UPLOAD
          ================================================================ */}
      <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Bulk Invite Suppliers
            </h3>
            <p className="text-sm text-gray-500">
              Upload a CSV file with supplier names and emails to invite them all at once.
              Each will receive a personalised invitation email.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              CSV format: <span className="font-mono bg-gray-50 px-1 rounded">name, email</span> — one row per supplier
            </p>
          </div>
          <CSVUploader />
        </div>
      </div>

      {/* ================================================================
          MANUAL SINGLE ADD
          ================================================================ */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Add Single Supplier</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Invite one supplier at a time by entering their name and email.
          </p>
        </div>
        <div className="p-8">
          <ManualEntry />
        </div>
      </div>

      {/* ================================================================
          SUPPLIER STATUS TABLE — full activity feed
          ================================================================ */}
      {kpis.total > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Supplier Status</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {kpis.total} supplier{kpis.total !== 1 ? 's' : ''} in your programme
              </p>
            </div>
            {/* Status legend */}
            <div className="hidden sm:flex items-center gap-4">
              {[
                { label: 'Not Sent',    colour: 'bg-gray-200' },
                { label: 'Invited',     colour: 'bg-blue-400' },
                { label: 'In Progress', colour: 'bg-amber-400' },
                { label: 'Complete',    colour: 'bg-green-500' },
              ].map(({ label, colour }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${colour}`} />
                  <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <InviteTable suppliers={suppliers} />
        </div>
      )}

    </div>
  );
}