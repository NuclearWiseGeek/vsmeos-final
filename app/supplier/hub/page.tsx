// =============================================================================
// FILE: app/supplier/hub/page.tsx
// PURPOSE: The Assessment Hub — the main "command centre" of the supplier
//          dashboard. This is where suppliers navigate between Scope 1, 2, 3
//          and see their real-time carbon footprint as they fill in data.
//
// KEY FEATURES:
//   - Real-time scope totals (recalculate on every render as data changes)
//   - Progress indicator: shows how many scopes have been started/completed
//   - Completion status per scope card (empty / in progress / complete)
//   - Country-aware calculations (uses companyData.country)
//   - tCO2e auto-conversion for large totals
//   - Clear path to finalise and download report
//
// WHEN TO MODIFY:
//   - When adding a new scope or assessment section
//   - When changing the progress logic (e.g. adding required fields)
//   - When adding Phase 3 Scope 3 categories (purchased goods, waste, etc.)
//
// DEPENDENCIES:
//   - ESGContext (useESG) — activityData, companyData, isLoading
//   - calculations.ts — calculateEmissions(), summarizeEmissions(), formatEmissions()
// =============================================================================

'use client';

import { useESG } from '@/context/ESGContext';
import {
  calculateEmissions,
  summarizeEmissions,
  formatEmissions,
  getCountryFactors
} from '@/utils/calculations';
import Link from 'next/link';
import {
  ArrowRight, ArrowLeft, CheckCircle2, Factory,
  Zap, Plane, TrendingUp, Clock, AlertCircle, Loader2
} from 'lucide-react';

// =============================================================================
// SECTION 1: HELPER — SCOPE COMPLETION LOGIC
// Determines the status of each scope card based on what data has been entered.
// "complete"    = at least one field in this scope has a value > 0
// "empty"       = all fields are still at zero (not started)
//
// NOTE: We intentionally don't require ALL fields — many companies genuinely
// don't have propane or refrigerants. A scope is "complete" if the supplier
// has engaged with it and entered any data.
// =============================================================================

function getScopeStatus(activityData: Record<string, number>, scope: 1 | 2 | 3): 'complete' | 'empty' {
  const scope1Keys = ['natural_gas','heating_oil','propane','diesel','petrol','ref_R410A','ref_R32','ref_R134a','ref_R404A'];
  const scope2Keys = ['electricity_grid','electricity_green','district_heat','district_cool'];
  const scope3Keys = ['grey_fleet','rail_travel','flight_short_haul','flight_long_haul','hotel_nights','employee_commuting','remote_working'];

  const keys = scope === 1 ? scope1Keys : scope === 2 ? scope2Keys : scope3Keys;
  const hasAnyData = keys.some(key => (activityData[key] || 0) > 0);
  return hasAnyData ? 'complete' : 'empty';
}

// =============================================================================
// SECTION 2: MAIN COMPONENT
// =============================================================================

export default function AssessmentHub() {
  const { activityData, companyData, isLoading, lastSaved } = useESG();

  // ─── Real-time calculations ───────────────────────────────────────────────
  // These recalculate every render so the flashcards update instantly as
  // the supplier enters data on scope pages and returns to the hub.
  // We pass companyData.country so the correct grid factor is used.
  const results = calculateEmissions(activityData, companyData.country || 'France');
  const totals  = summarizeEmissions(results, companyData.revenue || 0);

  // Format total intelligently — shows tonnes if over 1,000 kg
  const formattedTotal = formatEmissions(totals.total);

  // ─── Scope completion status ──────────────────────────────────────────────
  const scope1Status = getScopeStatus(activityData, 1);
  const scope2Status = getScopeStatus(activityData, 2);
  const scope3Status = getScopeStatus(activityData, 3);

  // Count how many scopes have been completed (for the progress bar)
  const completedScopes = [scope1Status, scope2Status, scope3Status]
    .filter(s => s === 'complete').length;

  // Progress percentage for the top bar (0%, 33%, 66%, 100%)
  const progressPercent = Math.round((completedScopes / 3) * 100);

  // ─── Number formatter ─────────────────────────────────────────────────────
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

  // ─── Last saved display ───────────────────────────────────────────────────
  const getLastSavedText = () => {
    if (!lastSaved) return null;
    const minutes = Math.round((Date.now() - lastSaved.getTime()) / 60000);
    if (minutes < 1) return 'Saved just now';
    if (minutes === 1) return 'Saved 1 min ago';
    return `Saved ${minutes} min ago`;
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-32 px-4 flex flex-col items-center justify-center gap-4 empty-state-enter">
        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading your assessment...</p>
      </div>
    );
  }

  // ─── First-visit empty state ──────────────────────────────────────────────
  // Show a warm welcome when the supplier has no company name set yet
  const isFirstVisit = !companyData.name || companyData.name === 'EMPTY';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:py-12 sm:px-6">

      {/* ================================================================
          FIRST-VISIT WELCOME BANNER
          Only shown when no company profile is set up yet.
          ================================================================ */}
      {isFirstVisit && (
        <div className="mb-8 bg-black text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 empty-state-enter">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">Welcome — let's set up your profile first</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Before you start entering emissions data, fill in your company profile. 
              Your country determines which emission factors we use for your calculations.
            </p>
          </div>
          <a
            href="/supplier"
            className="flex-shrink-0 px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            Set up profile <ArrowRight size={14} />
          </a>
        </div>
      )}

      {/* ================================================================
          HEADER ROW
          ================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Assessment Hub
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {companyData.name
              ? `${companyData.name} · FY ${companyData.year} · ${companyData.country}`
              : `FY ${companyData.year} Assessment`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Last saved indicator */}
          {lastSaved && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} /> {getLastSavedText()}
            </span>
          )}

          <Link
            href="/supplier"
            className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft size={14} /> Edit Profile
          </Link>
        </div>
      </div>

      {/* ================================================================
          PROGRESS BAR
          Shows overall assessment completion (0 / 1 / 2 / 3 scopes done).
          This is the single most important UX element to reduce drop-off —
          people complete things when they can see how close they are.
          ================================================================ */}
      <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              Assessment Progress
            </span>
            {completedScopes === 3 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                <CheckCircle2 size={10} /> Ready to Report
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-gray-900">
            {completedScopes} / 3 Scopes
          </span>
        </div>

        {/* Progress track */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              // Colour shifts from blue → green as completion increases
              background: completedScopes === 3
                ? '#16a34a'   // green-600 — complete
                : completedScopes === 2
                ? '#2563eb'   // blue-600 — nearly there
                : completedScopes === 1
                ? '#3b82f6'   // blue-500 — started
                : '#e5e7eb',  // gray-200 — not started
            }}
          />
        </div>

        {/* Scope labels under the bar */}
        <div className="flex justify-between mt-2">
          {(['Scope 1', 'Scope 2', 'Scope 3'] as const).map((label, i) => {
            const statuses = [scope1Status, scope2Status, scope3Status];
            const done = statuses[i] === 'complete';
            return (
              <span key={label} className={`text-[10px] font-bold uppercase tracking-widest ${done ? 'text-green-600' : 'text-gray-300'}`}>
                {done ? '✓ ' : ''}{label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ================================================================
          SCOPE CARDS GRID
          3 cards — one per scope. Each card shows:
          - Scope name and description
          - Current calculated total (updates live)
          - Completion status badge (Not Started / Data Entered)
          - Arrow CTA (Start Input / Edit Data)
          ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">

        {/* ── SCOPE 1 CARD ─────────────────────────────────── */}
        <Link href="/supplier/scope1" className="group">
          <div className={`bg-white p-6 sm:p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden ${
            scope1Status === 'complete'
              ? 'border-blue-200 hover:border-blue-300'
              : 'border-gray-100 hover:border-blue-200'
          }`}>

            {/* Decorative corner circle */}
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

            <div>
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-5 relative z-10">
                <Factory className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Title and status */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Scope 1</h3>
                {scope1Status === 'complete' ? (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-widest rounded-full">
                    <CheckCircle2 size={9} /> Done
                  </span>
                ) : (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold uppercase tracking-widest rounded-full">
                    <AlertCircle size={9} /> Empty
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Fuel combustion · Refrigerants
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                9 input fields · Fuels & leaks
              </p>
            </div>

            {/* Emissions total + CTA */}
            <div className="mt-6 sm:mt-7">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {fmt(totals.scope1)}{' '}
                <span className="text-xs sm:text-sm font-medium text-gray-400">kgCO₂e</span>
              </div>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                {scope1Status === 'complete' ? 'Edit Data' : 'Start Input'}
                <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </Link>

        {/* ── SCOPE 2 CARD ─────────────────────────────────── */}
        <Link href="/supplier/scope2" className="group">
          <div className={`bg-white p-6 sm:p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden ${
            scope2Status === 'complete'
              ? 'border-orange-200 hover:border-orange-300'
              : 'border-gray-100 hover:border-orange-200'
          }`}>

            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 sm:mb-5 relative z-10">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Scope 2</h3>
                {scope2Status === 'complete' ? (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-widest rounded-full">
                    <CheckCircle2 size={9} /> Done
                  </span>
                ) : (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold uppercase tracking-widest rounded-full">
                    <AlertCircle size={9} /> Empty
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Electricity · Heat · Cooling
              </p>
              {/* Show which country's factor is being used */}
              <p className="text-[10px] text-gray-400 mt-0.5">
                Grid factor: {getCountryFactors(companyData.country || 'France').electricityGrid} kgCO₂e/kWh · {companyData.country || 'France'}
              </p>
            </div>

            <div className="mt-6 sm:mt-7">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {fmt(totals.scope2)}{' '}
                <span className="text-xs sm:text-sm font-medium text-gray-400">kgCO₂e</span>
              </div>
              <div className="text-xs font-bold text-orange-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                {scope2Status === 'complete' ? 'Edit Data' : 'Start Input'}
                <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </Link>

        {/* ── SCOPE 3 CARD ─────────────────────────────────── */}
        <Link href="/supplier/scope3" className="group">
          <div className={`bg-white p-6 sm:p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden ${
            scope3Status === 'complete'
              ? 'border-purple-200 hover:border-purple-300'
              : 'border-gray-100 hover:border-purple-200'
          }`}>

            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-5 relative z-10">
                <Plane className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Scope 3</h3>
                {scope3Status === 'complete' ? (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-widest rounded-full">
                    <CheckCircle2 size={9} /> Done
                  </span>
                ) : (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold uppercase tracking-widest rounded-full">
                    <AlertCircle size={9} /> Empty
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Travel · Commuting · Remote Work
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                7 input fields · Flights split by haul
              </p>
            </div>

            <div className="mt-6 sm:mt-7">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {fmt(totals.scope3)}{' '}
                <span className="text-xs sm:text-sm font-medium text-gray-400">kgCO₂e</span>
              </div>
              <div className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                {scope3Status === 'complete' ? 'Edit Data' : 'Start Input'}
                <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </Link>

      </div>

      {/* ================================================================
          TOTAL FOOTPRINT SUMMARY BAR
          Shows the grand total + tCO2e conversion + intensity metric.
          Only shows intensity if revenue has been entered in the profile.
          ================================================================ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

          {/* Left: Total */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Total Carbon Footprint · FY {companyData.year}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tighter">
                {formattedTotal.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
              <span className="text-lg text-gray-400 font-medium">{formattedTotal.unit}</span>
            </div>
            {/* Also show kg if we displayed tonnes, for full context */}
            {formattedTotal.unit === 'tCO2e' && (
              <p className="text-xs text-gray-400 mt-0.5">
                = {fmt(totals.total)} kgCO₂e
              </p>
            )}
          </div>

          {/* Right: Scope breakdown pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400">Scope 1</p>
                <p className="text-sm font-bold text-blue-700">{fmt(totals.scope1)} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-orange-400">Scope 2</p>
                <p className="text-sm font-bold text-orange-700">{fmt(totals.scope2)} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400">Scope 3</p>
                <p className="text-sm font-bold text-purple-700">{fmt(totals.scope3)} kg</p>
              </div>
            </div>

            {/* Carbon intensity — only if revenue was entered */}
            {totals.intensity > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <TrendingUp size={14} className="text-gray-400" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Intensity</p>
                  <p className="text-sm font-bold text-gray-700">
                    {fmt(totals.intensity)} kg/M{companyData.currency || 'EUR'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================
          FINALISE CTA
          Enabled always — suppliers can generate a partial report.
          The results page will show which scopes have no data.
          ================================================================ */}
      <div className="flex flex-col items-center justify-center py-4">
        <Link href="/supplier/results" className="w-full sm:w-auto">
          <button className={`w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 text-base ${
            completedScopes > 0
              ? 'bg-black text-white hover:bg-gray-800 hover:shadow-2xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          // Prevent navigation if no data entered at all
          onClick={(e) => { if (completedScopes === 0) e.preventDefault(); }}
          >
            <CheckCircle2 size={20} />
            {completedScopes === 3
              ? 'Finalise & Generate Report'
              : completedScopes > 0
              ? `Continue to Report (${completedScopes}/3 scopes)`
              : 'Enter data above to continue'}
          </button>
        </Link>

        {completedScopes > 0 && completedScopes < 3 && (
          <p className="text-xs text-gray-400 mt-3 text-center">
            You can generate a report now — empty scopes will show as zero in the PDF.
            We recommend completing all 3 scopes for a full declaration.
          </p>
        )}
      </div>

    </div>
  );
}