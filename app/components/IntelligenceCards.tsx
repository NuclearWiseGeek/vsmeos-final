// =============================================================================
// FILE: app/components/IntelligenceCards.tsx
// PURPOSE: Phase 4.3 + 4.4 UI — renders the Claude-powered benchmark card
//          and AI reduction recommendations on the results page.
//
// ARCHITECTURE:
//   - Single component, two sections (benchmark + recommendations)
//   - Both triggered by the parent (results page) after PDF download completes
//     (so the user has already committed to the assessment before we spend tokens)
//   - Calls /api/intelligence with mode="benchmark" then mode="recommendations"
//     sequentially — shows each as it arrives
//   - Handles loading, error, and empty states gracefully
//   - Zero dependency on ESGContext — receives all data as props so it can be
//     used standalone in the vault page (Phase 4 future) if needed
//
// BRAND: #0C2918 bg / #C9A84C text. Zero emerald. Zero Tailwind green.
// LEGAL: Benchmark and recommendations marked as "AI-generated, indicative"
// =============================================================================

'use client';

import React, { useState, useCallback } from 'react';
import {
  Sparkles, TrendingDown, TrendingUp, Minus,
  ChevronDown, ChevronUp, Loader2, AlertCircle,
  Zap, Target, BarChart3, ArrowRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopSource {
  activity:    string;
  emissionsKg: number;
  pctOfTotal:  number;
}

export interface IntelligenceProps {
  // Company
  industry:    string;
  country:     string;
  year:        string;
  currency:    string;
  // Emissions
  scope1Kg:    number;
  scope2Kg:    number;
  scope3Kg:    number;
  totalKg:     number;
  intensityKgPerMRevenue: number;
  topSources:  TopSource[];
  activityData: Record<string, any>;
  // Country context (from getCountryFactors)
  gridFactor:          number;
  primaryCalculator:   string;
}

interface BenchmarkResult {
  median_intensity:          number;
  p25_intensity:             number;
  p75_intensity:             number;
  your_percentile:           number;
  headline:                  string;
  context_sentence:          string;
  reduction_opportunity_pct: number;
  primary_source:            string;
  secondary_source:          string;
  country_factor_note:       string;
  yourIntensity:             number;
  cached:                    boolean;
}

interface Recommendation {
  rank:                    number;
  title:                   string;
  target_source:           string;
  action:                  string;
  estimated_reduction_kg:  number;
  estimated_reduction_pct: number;
  how_calculated:          string;
  country_specific_tip:    string;
  difficulty:              'low' | 'medium' | 'high';
  payback_period:          string;
  csrd_relevance:          string;
}

interface RecommendationsResult {
  recommendations:                Recommendation[];
  total_potential_reduction_kg:   number;
  total_potential_reduction_pct:  number;
  priority_note:                  string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

const fmtT = (kg: number) =>
  (kg / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  low:    { label: 'Quick win',   color: 'bg-green-50 text-green-700 border-green-100' },
  medium: { label: 'Moderate',    color: 'bg-amber-50 text-amber-700 border-amber-100' },
  high:   { label: 'Investment',  color: 'bg-purple-50 text-purple-700 border-purple-100' },
};

// ─── Benchmark Card ───────────────────────────────────────────────────────────

function BenchmarkCard({ data }: { data: BenchmarkResult }) {
  const [showDetail, setShowDetail] = useState(false);

  const yourI   = data.yourIntensity;
  const median  = data.median_intensity;
  const p25     = data.p25_intensity;
  const p75     = data.p75_intensity;
  const pct     = ((yourI - median) / median) * 100;
  const isBelow = pct < -5;
  const isAbove = pct >  5;

  const bgClass   = isBelow ? 'bg-blue-50 border-blue-100'   : isAbove ? 'bg-amber-50 border-amber-100'   : 'bg-gray-50 border-gray-100';
  const textClass = isBelow ? 'text-blue-900'                 : isAbove ? 'text-amber-900'                 : 'text-gray-800';
  const subClass  = isBelow ? 'text-blue-600'                 : isAbove ? 'text-amber-600'                 : 'text-gray-500';
  const dotColor  = isBelow ? '#2563eb'                       : isAbove ? '#d97706'                       : '#6b7280';

  // Bar positioning — clamp to visible range
  const barMin   = Math.min(p25 * 0.5, yourI * 0.8);
  const barMax   = Math.max(p75 * 1.3, yourI * 1.2);
  const barRange = barMax - barMin;

  const toPos = (v: number) =>
    `${Math.min(Math.max(((v - barMin) / barRange) * 90 + 5, 4), 94)}%`;

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${bgClass}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isBelow ? 'bg-blue-100' : isAbove ? 'bg-amber-100' : 'bg-gray-100'
        }`}>
          <BarChart3 size={16} className={isBelow ? 'text-blue-600' : isAbove ? 'text-amber-600' : 'text-gray-500'} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-[10px] font-bold uppercase tracking-widest ${subClass}`}>
              Industry Benchmark · AI Analysis
            </p>
            {data.cached && (
              <span className="text-[9px] text-gray-400 font-medium">cached</span>
            )}
          </div>
          <p className={`text-sm font-bold leading-snug ${textClass}`}>
            {data.headline}
          </p>
        </div>
        <div className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-sm ${
          isBelow ? 'bg-blue-100 text-blue-700' : isAbove ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {isBelow ? <TrendingDown size={13} /> : isAbove ? <TrendingUp size={13} /> : <Minus size={13} />}
          {Math.abs(pct).toFixed(1)}%
        </div>
      </div>

      {/* Your percentile */}
      <div className={`text-xs mb-4 ${subClass}`}>
        Your intensity: <span className="font-bold">{fmt(yourI)} kgCO₂e/€M</span>
        {' · '}
        Sector median: <span className="font-bold">{fmt(median)} kgCO₂e/€M</span>
        {' · '}
        You rank in the <span className="font-bold">{data.your_percentile}th percentile</span>
      </div>

      {/* Visual range bar */}
      <div className="mb-4">
        <div className="relative h-2 rounded-full bg-white/70 overflow-visible mb-1">
          {/* Range band p25–p75 */}
          <div
            className="absolute top-0 h-2 rounded-full opacity-25"
            style={{ left: toPos(p25), right: `${100 - parseFloat(toPos(p75))}%`, background: dotColor }}
          />
          {/* p25 tick */}
          <div className="absolute top-[-3px] w-0.5 h-4 rounded-full opacity-40"
            style={{ left: toPos(p25), background: dotColor }} />
          {/* Median tick */}
          <div className="absolute top-[-4px] w-0.5 h-5 rounded-full opacity-70"
            style={{ left: toPos(median), background: dotColor }} />
          {/* p75 tick */}
          <div className="absolute top-[-3px] w-0.5 h-4 rounded-full opacity-40"
            style={{ left: toPos(p75), background: dotColor }} />
          {/* Your dot */}
          <div
            className="absolute top-[-4px] w-4 h-4 rounded-full border-2 border-white shadow-md"
            style={{ left: toPos(yourI), transform: 'translateX(-50%)', background: dotColor }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-medium opacity-40 mt-1">
          <span>Top performers</span>
          <span>Median</span>
          <span>Laggards</span>
        </div>
      </div>

      {/* Context */}
      <p className={`text-xs leading-relaxed mb-3 ${subClass}`}>
        {data.context_sentence}
      </p>

      {/* Expand for detail */}
      <button
        onClick={() => setShowDetail(d => !d)}
        className={`flex items-center gap-1.5 text-[11px] font-semibold ${subClass} hover:opacity-80 transition-opacity`}
      >
        {showDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {showDetail ? 'Less detail' : 'Show methodology & sources'}
      </button>

      {showDetail && (
        <div className={`mt-3 pt-3 border-t space-y-2 ${isBelow ? 'border-blue-100' : isAbove ? 'border-amber-100' : 'border-gray-200'}`}>
          <p className={`text-[11px] ${subClass}`}>
            <span className="font-semibold">Country grid context:</span> {data.country_factor_note}
          </p>
          <p className={`text-[11px] ${subClass}`}>
            <span className="font-semibold">Reduction opportunity:</span> Best-practice peers
            in your sector achieve ~{data.reduction_opportunity_pct}% lower intensity.
          </p>
          <p className={`text-[9px] opacity-50 leading-relaxed`}>
            Primary source: {data.primary_source}
            {data.secondary_source && ` · ${data.secondary_source}`}
          </p>
          <p className={`text-[9px] opacity-40`}>
            AI-generated benchmark. Figures are indicative — actual peer intensity varies
            by company size, operating model, and sub-sector. Not a substitute for
            third-party benchmarking studies.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────

function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFFICULTY_LABELS[rec.difficulty] || DIFFICULTY_LABELS.medium;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Rank stripe */}
      <div className="h-1 bg-[#0C2918]" style={{ opacity: 1 - rank * 0.2 }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0C2918]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-black text-[#0C2918]">{rank}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{rec.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{rec.target_source}</p>
            </div>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border ${diff.color}`}>
            {diff.label}
          </span>
        </div>

        {/* Impact numbers */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#0C2918]/4 rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#0C2918]/50 mb-0.5">
              Annual saving
            </p>
            <p className="text-base font-black text-[#0C2918] tracking-tight">
              {fmtT(rec.estimated_reduction_kg)}
              <span className="text-xs font-normal ml-0.5">t</span>
            </p>
            <p className="text-[9px] text-[#0C2918]/40">{fmt(rec.estimated_reduction_kg)} kgCO₂e</p>
          </div>
          <div className="bg-[#C9A84C]/8 rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#C9A84C]/70 mb-0.5">
              Of total emissions
            </p>
            <p className="text-base font-black text-[#0C2918] tracking-tight">
              {rec.estimated_reduction_pct.toFixed(1)}%
            </p>
            <p className="text-[9px] text-[#0C2918]/40">reduction</p>
          </div>
        </div>

        {/* Action */}
        <p className="text-xs text-gray-700 leading-relaxed mb-3">{rec.action}</p>

        {/* Country tip */}
        {rec.country_specific_tip && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-3">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-700">Local tip: </span>
              {rec.country_specific_tip}
            </p>
          </div>
        )}

        {/* Expand for more */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {expanded ? 'Less' : 'How calculated · CSRD relevance'}
        </button>

        {expanded && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-50 space-y-2">
            <p className="text-[10px] text-gray-500">
              <span className="font-semibold">Methodology: </span>{rec.how_calculated}
            </p>
            <p className="text-[10px] text-gray-500">
              <span className="font-semibold">Payback: </span>{rec.payback_period}
            </p>
            <p className="text-[10px] text-gray-500">
              <span className="font-semibold">CSRD / ESRS E1: </span>{rec.csrd_relevance}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IntelligenceCards(props: IntelligenceProps) {
  const [benchmarkData,  setBenchmarkData]  = useState<BenchmarkResult | null>(null);
  const [recsData,       setRecsData]       = useState<RecommendationsResult | null>(null);
  const [benchmarkState, setBenchmarkState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [recsState,      setRecsState]      = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [triggered,      setTriggered]      = useState(false);

  const run = useCallback(async () => {
    if (triggered) return;
    setTriggered(true);

    const {
      industry, country, year, currency,
      scope1Kg, scope2Kg, scope3Kg, totalKg,
      intensityKgPerMRevenue, topSources, activityData,
      gridFactor, primaryCalculator,
    } = props;

    // ── 1. Benchmark ─────────────────────────────────────────────────────────
    setBenchmarkState('loading');
    try {
      const res = await fetch('/api/intelligence', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'benchmark',
          industry, country, year,
          yourIntensity: intensityKgPerMRevenue,
          gridFactor, primaryCalculator,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBenchmarkData(data);
      setBenchmarkState('done');
    } catch (err) {
      console.error('Benchmark error:', err);
      setBenchmarkState('error');
    }

    // ── 2. Recommendations ───────────────────────────────────────────────────
    setRecsState('loading');
    try {
      const res = await fetch('/api/intelligence', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'recommendations',
          industry, country, year, currency,
          scope1Kg, scope2Kg, scope3Kg, totalKg,
          intensityKgPerMRevenue,
          topSources, activityData,
          gridFactor, primaryCalculator,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecsData(data);
      setRecsState('done');
    } catch (err) {
      console.error('Recommendations error:', err);
      setRecsState('error');
    }
  }, [props, triggered]);

  // ── Idle state — CTA button ───────────────────────────────────────────────
  if (!triggered) {
    return (
      <div className="rounded-2xl border border-dashed border-[#0C2918]/20 bg-[#0C2918]/3 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#0C2918] flex items-center justify-center mx-auto mb-4">
          <Sparkles size={20} className="text-[#C9A84C]" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          AI Carbon Intelligence
        </h3>
        <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
          Get your country-specific industry benchmark and 3 personalised
          reduction recommendations — powered by Claude.
        </p>
        <button
          onClick={run}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0C2918] text-[#C9A84C] rounded-xl font-bold text-sm hover:bg-[#122F1E] transition-colors"
        >
          <Sparkles size={14} />
          Generate AI Analysis
          <ArrowRight size={14} />
        </button>
        <p className="text-[10px] text-gray-400 mt-3">
          Takes ~10 seconds · Uses Claude Sonnet · Results are indicative
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Section header ── */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#0C2918] flex items-center justify-center">
          <Sparkles size={14} className="text-[#C9A84C]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">AI Carbon Intelligence</h3>
          <p className="text-xs text-gray-400">Powered by Claude · Country-specific analysis</p>
        </div>
      </div>

      {/* ── Benchmark ── */}
      {benchmarkState === 'loading' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 flex items-center gap-3">
          <Loader2 size={16} className="animate-spin text-[#0C2918]" />
          <div>
            <p className="text-sm font-semibold text-gray-700">Analysing industry benchmarks…</p>
            <p className="text-xs text-gray-400">Checking {props.industry} peers in {props.country}</p>
          </div>
        </div>
      )}
      {benchmarkState === 'done' && benchmarkData && (
        <BenchmarkCard data={benchmarkData} />
      )}
      {benchmarkState === 'error' && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600">Benchmark unavailable — please try again later.</p>
        </div>
      )}

      {/* ── Recommendations ── */}
      {recsState === 'loading' && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 flex items-center gap-3">
          <Loader2 size={16} className="animate-spin text-[#0C2918]" />
          <div>
            <p className="text-sm font-semibold text-gray-700">Building your reduction roadmap…</p>
            <p className="text-xs text-gray-400">Analysing your top emission sources</p>
          </div>
        </div>
      )}
      {recsState === 'done' && recsData && (
        <div>
          {/* Summary */}
          <div className="bg-[#0C2918]/4 rounded-2xl p-4 mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Target size={16} className="text-[#0C2918] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#0C2918]">Total reduction potential</p>
                <p className="text-[10px] text-[#0C2918]/60">{recsData.priority_note}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-black text-[#0C2918] tracking-tight">
                {fmtT(recsData.total_potential_reduction_kg)}
                <span className="text-xs font-normal ml-0.5">tCO₂e</span>
              </p>
              <p className="text-[10px] text-[#0C2918]/60">
                {recsData.total_potential_reduction_pct.toFixed(1)}% of your total
              </p>
            </div>
          </div>

          {/* Individual recommendation cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {recsData.recommendations.map(rec => (
              <RecommendationCard key={rec.rank} rec={rec} rank={rec.rank} />
            ))}
          </div>

          <p className="text-[9px] text-gray-400 text-center mt-4 leading-relaxed">
            AI-generated recommendations. Reduction estimates are indicative and based on
            industry averages — actual savings depend on implementation. Always verify with
            qualified energy or sustainability advisors before capital investment.
          </p>
        </div>
      )}
      {recsState === 'error' && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600">Recommendations unavailable — please try again later.</p>
        </div>
      )}

    </div>
  );
}