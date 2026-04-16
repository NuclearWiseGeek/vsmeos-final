// =============================================================================
// FILE: app/supplier/dashboard/page.tsx
// PURPOSE: Supplier command centre — permanent home for returning suppliers.
//
// SECTIONS:
//   1. KPI row      — total emissions, YoY change, sector percentile, target
//   2. Intelligence — benchmark card + recommendations card (both cached, both
//                     have explicit Refresh buttons — no auto API calls)
//   3. Activity     — reports history, buyer invites, reduction target progress
//   4. Coming soon  — Carbon Passport teaser (Phase 6 placeholder)
//
// DATA: Single call to getDashboardData() loads everything in parallel.
//       No waterfalls, no individual useEffects per section.
//
// AI BRANDING: All Claude references show as "VERO" (configurable via AI_NAME).
//              Change AI_NAME constant to rename across the entire dashboard.
//
// BRAND: #0C2918 bg · #C9A84C text · #F5F5F7 page bg · zero emerald/green.
// PHASE 4 — Supplier Dashboard
// =============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getDashboardData, DashboardData } from '@/actions/dashboard';
import { calculateEmissions, summarizeEmissions, getCountryFactors } from '@/utils/calculations';
import Link from 'next/link';
import {
  BarChart3, Sparkles, FileText, Users, Target,
  TrendingDown, TrendingUp, ArrowRight, Download,
  RefreshCw, CheckCircle2, ChevronDown,
  ChevronUp, Loader2, Lock,
} from 'lucide-react';

// ─── AI branding — change this one constant to rename everywhere ──────────────
const AI_NAME = 'VESQ3';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toT = (kg: number, dec = 1) =>
  ((kg || 0) / 1000).toLocaleString('en-US', {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  });

const fmtK = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Shared card primitives ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[.1em] text-gray-400 mb-3 mt-6">
      {children}
    </p>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  icon, title, badge, badgeStyle = 'gray',
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeStyle?: 'green' | 'gold' | 'gray' | 'amber';
}) {
  const badgeClasses = {
    green: 'bg-[#e8f5ee] text-[#1a7a45]',
    gold:  'bg-[#0C2918] text-[#C9A84C]',
    gray:  'bg-gray-100 text-gray-500',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[9px] bg-[#0C2918] flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <span className="text-[13px] font-bold text-gray-900">{title}</span>
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeClasses[badgeStyle]}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, unit, delta, deltaGood, accentTop = false,
}: {
  label: string; value: string; unit?: string;
  delta?: string; deltaGood?: boolean; accentTop?: boolean;
}) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-5 ${accentTop ? 'border-t-2 border-t-[#0C2918]' : ''}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[.07em] text-gray-400 mb-2">{label}</p>
      <p className="text-[26px] font-[800] text-gray-900 tracking-[-0.05em] leading-none">
        {value}
        {unit && <span className="text-[13px] font-normal text-gray-400 ml-1.5">{unit}</span>}
      </p>
      {delta && (
        <p className={`text-[11px] font-semibold mt-2 flex items-center gap-1 ${
          deltaGood === true  ? 'text-[#1a7a45]'
          : deltaGood === false ? 'text-red-500'
          : 'text-gray-400'
        }`}>
          {deltaGood === true  && <TrendingDown size={11} />}
          {deltaGood === false && <TrendingUp   size={11} />}
          {delta}
        </p>
      )}
    </div>
  );
}

// ─── Benchmark Card ───────────────────────────────────────────────────────────

function BenchmarkCard({
  data, industry, country, intensity, onRefresh, refreshing,
}: {
  data: Record<string, any> | null;
  industry: string; country: string;
  intensity: number; onRefresh: () => void; refreshing: boolean;
}) {
  const [showDetail, setShowDetail] = useState(false);

  // Build percentile trend from benchmark data if available
  // (In production this would pull from intelligence_cache for prior years)
  const hasBenchmark = data && data.median_intensity;

  const pct = hasBenchmark
    ? ((intensity - data.median_intensity) / data.median_intensity) * 100
    : 0;
  const isBelow = pct < -5;
  const isAbove = pct >  5;

  // Range bar positioning
  const barMin = hasBenchmark ? Math.min(data.p25_intensity * 0.6, intensity * 0.7) : 0;
  const barMax = hasBenchmark ? Math.max(data.p75_intensity * 1.4, intensity * 1.3) : 1;
  const toPos  = (v: number) => `${Math.min(Math.max(((v - barMin) / (barMax - barMin)) * 88 + 6, 4), 93)}%`;

  return (
    <Card>
      <CardHeader
        icon={<BarChart3 size={14} className="text-[#C9A84C]" />}
        title={`Industry benchmark · ${AI_NAME}`}
        badge={hasBenchmark ? (isBelow ? `${Math.abs(pct).toFixed(1)}% below median` : isAbove ? `${Math.abs(pct).toFixed(1)}% above median` : 'Near median') : 'Not generated'}
        badgeStyle={hasBenchmark ? (isBelow ? 'green' : isAbove ? 'amber' : 'gray') : 'gray'}
      />
      <div className="p-5">
        {!hasBenchmark ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <BarChart3 size={20} className="text-gray-300" />
            </div>
            <p className="text-[13px] font-semibold text-gray-700 mb-1">
              No benchmark generated yet
            </p>
            <p className="text-[11px] text-gray-400 mb-5 max-w-xs mx-auto">
              {AI_NAME} will analyse your position vs {industry} peers in {country} — country-specific, citing the right national authority.
            </p>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0C2918] text-[#C9A84C] rounded-xl text-[11px] font-bold hover:bg-[#122F1E] transition-colors disabled:opacity-50"
            >
              {refreshing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Generate benchmark · ~$0.006
            </button>
          </div>
        ) : (
          <>
            {/* Headline */}
            <p className="text-[13px] font-bold text-gray-900 mb-1 leading-snug">
              {data.headline}
            </p>
            <p className="text-[11px] text-gray-500 mb-4">
              Your intensity: <span className="font-bold text-gray-700">{fmtK(intensity)} kgCO₂e/€M</span>
              {' · '}
              Sector median: <span className="font-bold text-gray-700">{fmtK(data.median_intensity)}</span>
              {' · '}
              {data.your_percentile}th percentile
            </p>

            {/* Range bar */}
            <div className="relative h-2 rounded-full bg-gray-100 mb-1.5 overflow-visible">
              <div
                className="absolute top-0 h-2 rounded-full opacity-20"
                style={{ left: toPos(data.p25_intensity), right: `${100 - parseFloat(toPos(data.p75_intensity))}%`, background: isBelow ? '#2563eb' : isAbove ? '#d97706' : '#6b7280' }}
              />
              <div className="absolute top-[-3px] w-0.5 h-5 rounded-full opacity-40"
                style={{ left: toPos(data.median_intensity), background: isBelow ? '#2563eb' : isAbove ? '#d97706' : '#6b7280' }} />
              <div
                className="absolute top-[-4px] w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ left: toPos(intensity), transform: 'translateX(-50%)', background: isBelow ? '#2563eb' : isAbove ? '#d97706' : '#6b7280' }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 mb-3">
              <span>Best-in-class</span><span>Median</span><span>Laggards</span>
            </div>

            {/* Context */}
            <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{data.context_sentence}</p>

            {/* Detail toggle */}
            <button
              onClick={() => setShowDetail(d => !d)}
              className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-3"
            >
              {showDetail ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {showDetail ? 'Hide sources' : 'Show sources & methodology'}
            </button>

            {showDetail && (
              <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
                <p className="text-[10px] text-gray-600">
                  <span className="font-semibold">Country note:</span> {data.country_factor_note}
                </p>
                <p className="text-[9px] text-gray-400">{data.primary_source}</p>
                <p className="text-[9px] text-gray-400 italic">
                  AI-generated · indicative only · not a substitute for third-party benchmarking.
                </p>
              </div>
            )}

            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 hover:border-[#0C2918] hover:text-[#0C2918] transition-colors disabled:opacity-50"
            >
              {refreshing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              {refreshing ? 'Refreshing…' : `Refresh · ~$0.006`}
            </button>
          </>
        )}
      </div>
    </Card>
  );
}

// ─── Recommendations Card ─────────────────────────────────────────────────────

function RecommendationsCard({
  data, onRefresh, refreshing,
}: {
  data: Record<string, any> | null; onRefresh: () => void; refreshing: boolean;
}) {
  const DIFF = {
    low:    { label: 'Quick win',  cls: 'bg-[#e8f5ee] text-[#1a7a45]' },
    medium: { label: 'Moderate',   cls: 'bg-amber-50 text-amber-700'   },
    high:   { label: 'Investment', cls: 'bg-purple-50 text-purple-700' },
  } as Record<string, { label: string; cls: string }>;

  return (
    <Card>
      <CardHeader
        icon={<Sparkles size={14} className="text-[#C9A84C]" />}
        title={`AI reduction roadmap · ${AI_NAME}`}
        badge={data ? `${toT(data.total_potential_reduction_kg)} t potential` : 'Not generated'}
        badgeStyle={data ? 'gold' : 'gray'}
      />
      <div className="p-5">
        {!data ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={20} className="text-gray-300" />
            </div>
            <p className="text-[13px] font-semibold text-gray-700 mb-1">
              No recommendations generated yet
            </p>
            <p className="text-[11px] text-gray-400 mb-5 max-w-xs mx-auto">
              {AI_NAME} will give you 3 specific, quantified reduction actions based on your actual scope breakdown and country.
            </p>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0C2918] text-[#C9A84C] rounded-xl text-[11px] font-bold hover:bg-[#122F1E] transition-colors disabled:opacity-50"
            >
              {refreshing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Generate roadmap · ~$0.012
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="bg-[#0C2918]/5 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#0C2918]">Total reduction potential</p>
                <p className="text-[10px] text-[#0C2918]/60 mt-0.5">{data.priority_note}</p>
              </div>
              <div className="text-right">
                <p className="text-[18px] font-[800] text-[#0C2918] tracking-tight">
                  {toT(data.total_potential_reduction_kg)}<span className="text-xs font-normal ml-0.5">t</span>
                </p>
                <p className="text-[9px] text-[#0C2918]/50">
                  {data.total_potential_reduction_pct?.toFixed(1)}% of total
                </p>
              </div>
            </div>

            {/* Recs */}
            {data.recommendations?.map((rec: any) => (
              <div key={rec.rank} className="py-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-[5px] bg-[#0C2918]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-[800] text-[#0C2918]">{rec.rank}</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 leading-snug">{rec.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${(DIFF[rec.difficulty] || DIFF.medium).cls}`}>
                          {(DIFF[rec.difficulty] || DIFF.medium).label}
                        </span>
                        <span className="text-[10px] text-gray-400">{rec.payback_period}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-[800] text-[#0C2918] tracking-tight">
                      −{toT(rec.estimated_reduction_kg)}<span className="text-[9px] font-normal ml-0.5">t</span>
                    </p>
                    <p className="text-[9px] text-gray-400">{rec.estimated_reduction_pct?.toFixed(1)}%</p>
                  </div>
                </div>
                {rec.country_specific_tip && (
                  <div className="mt-2 ml-7 bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      <span className="font-semibold text-gray-700">Local tip: </span>
                      {rec.country_specific_tip}
                    </p>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 hover:border-[#0C2918] hover:text-[#0C2918] transition-colors disabled:opacity-50"
            >
              {refreshing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              {refreshing ? `${AI_NAME} is thinking…` : `Refresh · ~$0.012`}
            </button>
          </>
        )}
      </div>
    </Card>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function SupplierDashboard() {
  // auth handled by server action and fetch() cookies

  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingBm,  setRefreshingBm]  = useState(false);
  const [refreshingRec, setRefreshingRec] = useState(false);

  // Load all dashboard data on mount
  useEffect(() => {
    getDashboardData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  // ── Intelligence refresh handlers ─────────────────────────────────────────
  const refreshBenchmark = useCallback(async () => {
    if (!data?.profile || refreshingBm) return;
    setRefreshingBm(true);

    const latest = data.assessments.find(a => a.status === 'submitted');
    if (!latest) { setRefreshingBm(false); return; }

    const cf = getCountryFactors(data.profile.country || 'France');
    const intensity = latest.emissions_totals?.intensity || 0;

    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode:              'benchmark',
          industry:          data.profile.industry || 'Other',
          country:           data.profile.country  || 'France',
          year:              latest.year,
          yourIntensity:     intensity,
          gridFactor:        cf.electricityGrid,
          primaryCalculator: cf.primaryCalculator,
        }),
      });
      if (res.ok) {
        const bm = await res.json();
        setData(prev => prev ? { ...prev, benchmark: { ...bm, yourIntensity: intensity } } : prev);
      }
    } catch (e) { console.error('Benchmark refresh:', e); }

    setRefreshingBm(false);
  }, [data, refreshingBm]);

  const refreshRecommendations = useCallback(async () => {
    if (!data?.profile || refreshingRec) return;
    setRefreshingRec(true);

    const latest = data.assessments.find(a => a.status === 'submitted');
    if (!latest) { setRefreshingRec(false); return; }

    const cf       = getCountryFactors(data.profile.country || 'France');
    const results  = calculateEmissions(latest.activity_data || {}, data.profile.country || 'France');
    const totals   = summarizeEmissions(results, data.profile.revenue || 0);
    const topSources = [...results]
      .filter(r => r.emissions > 0)
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5)
      .map(r => ({ activity: r.activity, emissionsKg: r.emissions, pctOfTotal: totals.total > 0 ? (r.emissions / totals.total) * 100 : 0 }));

    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode:                   'recommendations',
          industry:               data.profile.industry || 'Other',
          country:                data.profile.country  || 'France',
          year:                   latest.year,
          currency:               data.profile.currency || 'EUR',
          scope1Kg:               totals.scope1,
          scope2Kg:               totals.scope2,
          scope3Kg:               totals.scope3,
          totalKg:                totals.total,
          intensityKgPerMRevenue: totals.intensity,
          topSources,
          activityData:           latest.activity_data || {},
          gridFactor:             cf.electricityGrid,
          primaryCalculator:      cf.primaryCalculator,
        }),
      });
      if (res.ok) {
        const rec = await res.json();
        setData(prev => prev ? { ...prev, recommendations: rec } : prev);
      }
    } catch (e) { console.error('Recommendations refresh:', e); }

    setRefreshingRec(false);
  }, [data, refreshingRec]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white border border-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[1,2].map(i => <div key={i} className="h-64 bg-white border border-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, assessments, invites, benchmark, recommendations } = data;

  // Derived values
  const latestSubmitted  = assessments.find(a => a.status === 'submitted');
  const prevSubmitted    = assessments.filter(a => a.status === 'submitted')[1] || null;
  const latestDraft      = assessments.find(a => a.status !== 'submitted');

  const currentKg  = latestSubmitted?.emissions_totals?.grandTotal ?? latestSubmitted?.emissions_totals?.total ?? 0;
  const prevKg     = prevSubmitted?.emissions_totals?.grandTotal   ?? prevSubmitted?.emissions_totals?.total   ?? 0;
  const yoyPct     = prevKg > 0 ? ((currentKg - prevKg) / prevKg) * 100 : null;
  const intensity  = latestSubmitted?.emissions_totals?.intensity  ?? 0;
  const percentile = benchmark?.your_percentile ?? null;

  const target       = profile?.targets as any;
  const targetKg     = target ? target.baselineKg * (1 - target.reductionPct / 100) : 0;
  const targetSaved  = target ? target.baselineKg - targetKg : 0;
  const targetSoFar  = target ? target.baselineKg - currentKg : 0;
  const targetPct    = targetSaved > 0 ? Math.min(100, Math.max(0, (targetSoFar / targetSaved) * 100)) : 0;

  const pendingInvites = invites.filter(i => i.status === 'sent' || i.status === 'started');

  const companyName = profile?.company_name || 'Your company';
  const latestYear  = latestSubmitted?.year || new Date().getFullYear();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:py-10 sm:px-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-[800] text-gray-900 tracking-[-0.04em] leading-tight">
            {companyName}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {profile?.industry && (
              <span className="text-[11px] text-gray-400">{profile.industry}</span>
            )}
            {profile?.country && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[11px] text-gray-400">{profile.country}</span>
              </>
            )}
            {latestSubmitted && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[11px] text-gray-400">FY {latestYear}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {latestSubmitted && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#e8f5ee] text-[#1a7a45]">
              <CheckCircle2 size={11} /> Report submitted
            </span>
          )}
          <Link
            href="/supplier"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#0C2918] text-[#C9A84C] hover:bg-[#122F1E] transition-colors"
          >
            New declaration <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      {latestSubmitted ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
          <KpiCard
            label="Total emissions"
            value={toT(currentKg)}
            unit="tCO₂e"
            delta={yoyPct !== null
              ? `${Math.abs(yoyPct).toFixed(1)}% vs ${prevSubmitted?.year}`
              : `FY ${latestYear}`
            }
            deltaGood={yoyPct !== null ? yoyPct < 0 : undefined}
            accentTop
          />
          <KpiCard
            label="Year on year"
            value={yoyPct !== null ? `${Math.abs(yoyPct).toFixed(1)}%` : '—'}
            delta={yoyPct !== null
              ? yoyPct < 0 ? `Down from ${toT(prevKg)}t in ${prevSubmitted?.year}` : `Up from ${toT(prevKg)}t`
              : 'No prior year data yet'
            }
            deltaGood={yoyPct !== null ? yoyPct < 0 : undefined}
          />
          <KpiCard
            label="Sector percentile"
            value={percentile ? `${percentile}${percentile === 1 ? 'st' : percentile === 2 ? 'nd' : percentile === 3 ? 'rd' : 'th'}` : '—'}
            delta={percentile ? `${profile?.industry || 'your sector'} · ${profile?.country}` : 'Generate benchmark to see'}
            deltaGood={percentile ? percentile < 50 : undefined}
          />
          <KpiCard
            label="Carbon intensity"
            value={fmtK(intensity)}
            unit="kg/€M"
            delta={intensity > 0 ? 'kgCO₂e per €1M revenue' : 'Add revenue to see'}
          />
        </div>
      ) : (
        <div className="bg-[#0C2918]/4 border border-[#0C2918]/10 rounded-2xl p-6 mb-6 text-center">
          <p className="text-[14px] font-bold text-[#0C2918] mb-1">No submitted report yet</p>
          <p className="text-[12px] text-gray-500 mb-4">Complete your first GHG declaration to unlock your full dashboard.</p>
          <Link
            href="/supplier"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0C2918] text-[#C9A84C] rounded-xl text-[12px] font-bold hover:bg-[#122F1E] transition-colors"
          >
            Start your first declaration <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* ── Carbon Intelligence ───────────────────────────────────────────── */}
      {latestSubmitted && (
        <>
          <SectionLabel>Carbon intelligence · {AI_NAME}</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <BenchmarkCard
              data={benchmark}
              industry={profile?.industry || 'Other'}
              country={profile?.country   || 'France'}
              intensity={intensity}
              onRefresh={refreshBenchmark}
              refreshing={refreshingBm}
            />
            <RecommendationsCard
              data={recommendations}
              onRefresh={refreshRecommendations}
              refreshing={refreshingRec}
            />
          </div>
        </>
      )}

      {/* ── Activity row ──────────────────────────────────────────────────── */}
      <SectionLabel>My activity</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        {/* Reports */}
        <Card>
          <CardHeader
            icon={<FileText size={13} className="text-[#C9A84C]" />}
            title="Reports"
            badge={`${assessments.filter(a => a.status === 'submitted').length} submitted`}
            badgeStyle="green"
          />
          <div className="p-5 space-y-3">
            {assessments.slice(0, 2).map(a => (
              <div key={a.id} className={`rounded-xl p-3.5 ${a.status === 'submitted' ? 'bg-gray-50' : 'border border-dashed border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[20px] font-[800] text-gray-900 tracking-[-0.05em] leading-none">{a.year}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {a.status === 'submitted'
                        ? `${toT(a.emissions_totals?.grandTotal ?? a.emissions_totals?.total ?? 0)} tCO₂e`
                        : 'Not submitted'
                      }
                    </p>
                  </div>
                  {a.status === 'submitted' ? (
                    <Link
                      href="/supplier/vault"
                      className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 bg-[#0C2918] text-[#C9A84C] rounded-lg hover:bg-[#122F1E] transition-colors"
                    >
                      <Download size={10} /> PDF
                    </Link>
                  ) : (
                    <Link
                      href={`/supplier?year=${a.year}`}
                      className="text-[10px] font-bold text-[#0C2918] hover:text-[#C9A84C] transition-colors"
                    >
                      Continue →
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {assessments.length === 0 && (
              <div className="text-center py-4">
                <p className="text-[11px] text-gray-400 mb-3">No declarations yet</p>
                <Link
                  href="/supplier"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 bg-[#0C2918] text-[#C9A84C] rounded-lg"
                >
                  Start first report
                </Link>
              </div>
            )}
            <Link
              href="/supplier/vault"
              className="flex items-center justify-center gap-1.5 w-full text-[10px] font-bold text-gray-400 hover:text-[#0C2918] transition-colors py-1"
            >
              View all reports <ArrowRight size={10} />
            </Link>
          </div>
        </Card>

        {/* Buyer invites */}
        <Card>
          <CardHeader
            icon={<Users size={13} className="text-[#C9A84C]" />}
            title="Buyer invites"
            badge={pendingInvites.length > 0 ? `${pendingInvites.length} action needed` : 'All done'}
            badgeStyle={pendingInvites.length > 0 ? 'amber' : 'green'}
          />
          <div className="p-5">
            {invites.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[11px] text-gray-400">No invites received yet.</p>
                <p className="text-[10px] text-gray-400 mt-1">Buyers will appear here when they request your data.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {invites.slice(0, 3).map(inv => (
                  <div key={inv.id} className="py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[12px] font-bold text-gray-900">{inv.buyer_name}</p>
                        <p className="text-[10px] text-gray-400">FY {inv.financial_year} · {fmtDate(inv.created_at)}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        inv.status === 'submitted' ? 'bg-[#e8f5ee] text-[#1a7a45]'
                        : inv.status === 'started' ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                      }`}>
                        {inv.status === 'submitted' ? 'Done' : inv.status === 'started' ? 'In progress' : 'Pending'}
                      </span>
                    </div>
                    {(inv.status === 'sent' || inv.status === 'started') && (
                      <Link
                        href={`/supplier?year=${inv.financial_year}`}
                        className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#0C2918] hover:text-[#C9A84C] transition-colors"
                      >
                        {inv.status === 'started' ? 'Continue' : 'Start'} {inv.buyer_name} {inv.financial_year} declaration →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Reduction target */}
        <Card>
          <CardHeader
            icon={<Target size={13} className="text-[#C9A84C]" />}
            title="Reduction target"
            badge={target ? `${Math.round(targetPct)}% on track` : 'Not set'}
            badgeStyle={target ? (targetPct >= 50 ? 'green' : 'amber') : 'gray'}
          />
          <div className="p-5">
            {!target ? (
              <div className="text-center py-4">
                <p className="text-[11px] text-gray-400 mb-3">Set a reduction target on your results page.</p>
                {latestSubmitted && (
                  <Link
                    href="/supplier/results"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 bg-[#0C2918] text-[#C9A84C] rounded-lg"
                  >
                    Set target <ArrowRight size={10} />
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-[18px] font-[800] text-gray-900 tracking-[-0.04em]">
                    −{target.reductionPct}% by {target.targetYear}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {toT(target.baselineKg)}t ({target.baselineYear}) → goal {toT(targetKg)}t
                  </p>
                </div>

                <div className="flex justify-between text-[10px] font-semibold text-gray-400 mb-1.5">
                  <span>Progress</span>
                  <span>{Math.round(targetPct)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${targetPct}%`, background: targetPct >= 50 ? '#0C2918' : '#C9A84C' }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mb-4">
                  {toT(currentKg)}t this year · {target.targetYear - new Date().getFullYear()} yr remaining
                </p>

                <div className={`rounded-xl p-3 ${targetPct >= 30 ? 'bg-[#0C2918]/5' : 'bg-amber-50'}`}>
                  <p className={`text-[11px] font-bold ${targetPct >= 30 ? 'text-[#0C2918]' : 'text-amber-700'}`}>
                    {targetPct >= 30 ? 'On track' : 'Behind schedule'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {targetPct >= 30
                      ? 'Keep it up — you are ahead of the linear reduction path.'
                      : `Need to reach ${toT(targetKg)}t. Consider acting on ${AI_NAME}'s recommendations.`
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

      </div>

      {/* ── Carbon Passport teaser ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Lock size={15} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-700">Carbon Passport</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              A public, shareable verification page — vsmeos.fr/passport/{companyName.toLowerCase().replace(/\s+/g, '-')}. Share with buyers instead of emailing PDFs.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 flex-shrink-0 whitespace-nowrap">
          Coming soon
        </span>
      </div>

    </div>
  );
}