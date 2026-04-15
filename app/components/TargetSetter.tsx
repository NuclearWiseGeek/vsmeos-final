// =============================================================================
// FILE: app/components/TargetSetter.tsx
// PURPOSE: Phase 4.5 — Reduction target setting widget.
//
// SHOWN ON: results page, below IntelligenceCards, above evidence vault.
// SHOWN ON: hub page (read-only progress view via TargetProgress component).
//
// UX FLOW:
//   1. Supplier sees their current total (e.g. 44.4 tCO₂e for 2024)
//   2. Sets a reduction % target (10–50%) via a slider
//   3. Sets a target year (next year to +5 years)
//   4. Sees real-time preview: "Reduce to 35.5 tCO₂e by 2027"
//   5. Clicks "Set Target" — saves to profiles.targets via server action
//   6. Confirmation shown, target visible on hub page
//
// BRAND: #0C2918 / #C9A84C. Zero emerald. Zero Tailwind green.
// LEGAL: No third-party verification implied — this is a self-set internal goal.
// =============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { saveTarget, loadTarget, ReductionTarget } from '@/actions/targets';
import { Target, CheckCircle2, Loader2, Edit2 } from 'lucide-react';

interface TargetSetterProps {
  currentTotalKg:  number;
  currentYear:     string;
  currency:        string;
}

const fmt = (n: number) =>
  (n / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function TargetSetter({ currentTotalKg, currentYear, currency }: TargetSetterProps) {
  const baseYear    = parseInt(currentYear) || new Date().getFullYear();
  const minTargetYr = baseYear + 1;
  const maxTargetYr = baseYear + 5;

  const [existing,    setExisting]    = useState<ReductionTarget | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [editing,     setEditing]     = useState(false);
  const [reductionPct, setReductionPct] = useState(20);
  const [targetYear,  setTargetYear]  = useState(minTargetYr + 1);

  // Load existing target on mount
  useEffect(() => {
    loadTarget().then(t => {
      if (t) setExisting(t);
      setLoading(false);
    });
  }, []);

  // Derived values
  const targetKg      = currentTotalKg * (1 - reductionPct / 100);
  const savedTargetKg = existing ? existing.baselineKg * (1 - existing.reductionPct / 100) : 0;

  // Progress vs existing target (if baseline year matches current year)
  const progressPct = existing && existing.baselineKg > 0
    ? Math.min(100, Math.max(0,
        ((existing.baselineKg - currentTotalKg) / (existing.baselineKg - savedTargetKg)) * 100
      ))
    : null;

  const handleSave = async () => {
    setSaving(true);
    const t: ReductionTarget = {
      reductionPct,
      targetYear,
      baselineYear: baseYear,
      baselineKg:   currentTotalKg,
      setAt:        new Date().toISOString(),
    };
    const result = await saveTarget(t);
    if (result.success) {
      setExisting(t);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return null;

  // ── Has existing target and not editing ──────────────────────────────────
  if (existing && !editing) {
    const yearsLeft = existing.targetYear - new Date().getFullYear();
    const onTrack   = progressPct !== null && progressPct >= (100 / (existing.targetYear - existing.baselineYear)) * (new Date().getFullYear() - existing.baselineYear);

    return (
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <div className="h-1 bg-[#0C2918]" />
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0C2918] flex items-center justify-center flex-shrink-0">
                <Target size={16} className="text-[#C9A84C]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                  Reduction Target
                </p>
                <p className="text-sm font-bold text-gray-900">
                  −{existing.reductionPct}% by {existing.targetYear}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setReductionPct(existing.reductionPct);
                setTargetYear(existing.targetYear);
                setEditing(true);
              }}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              <Edit2 size={11} /> Edit
            </button>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Baseline</p>
              <p className="text-base font-black text-gray-700 tracking-tight">
                {fmt(existing.baselineKg)}<span className="text-xs font-normal ml-0.5">t</span>
              </p>
              <p className="text-[9px] text-gray-400">{existing.baselineYear}</p>
            </div>
            <div className="bg-[#0C2918]/5 rounded-xl p-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#0C2918]/50 mb-1">Target</p>
              <p className="text-base font-black text-[#0C2918] tracking-tight">
                {fmt(savedTargetKg)}<span className="text-xs font-normal ml-0.5">t</span>
              </p>
              <p className="text-[9px] text-[#0C2918]/50">{existing.targetYear}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${onTrack ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${onTrack ? 'text-green-600' : 'text-amber-600'}`}>
                This year
              </p>
              <p className={`text-base font-black tracking-tight ${onTrack ? 'text-green-700' : 'text-amber-700'}`}>
                {fmt(currentTotalKg)}<span className="text-xs font-normal ml-0.5">t</span>
              </p>
              <p className={`text-[9px] ${onTrack ? 'text-green-500' : 'text-amber-500'}`}>{currentYear}</p>
            </div>
          </div>

          {/* Progress bar */}
          {progressPct !== null && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-semibold text-gray-400 mb-1.5">
                <span>Progress toward target</span>
                <span>{progressPct.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width:      `${progressPct}%`,
                    background: progressPct >= 50 ? '#0C2918' : '#C9A84C',
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">
                {yearsLeft > 0
                  ? `${yearsLeft} year${yearsLeft !== 1 ? 's' : ''} remaining to reach ${fmt(savedTargetKg)} tCO₂e`
                  : 'Target year reached'
                }
              </p>
            </div>
          )}

          <p className="text-[9px] text-gray-400">
            Self-set internal goal. Not independently verified.
            Set {new Date(existing.setAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.
          </p>
        </div>
      </div>
    );
  }

  // ── Target setting form ───────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <div className="h-1 bg-[#C9A84C]" />
      <div className="p-5 sm:p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#0C2918]/8 flex items-center justify-center flex-shrink-0">
            <Target size={16} className="text-[#0C2918]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
              {editing ? 'Update Target' : 'Set a Reduction Target'}
            </p>
            <p className="text-sm font-bold text-gray-900">
              Where do you want to be?
            </p>
          </div>
        </div>

        {/* Current baseline */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
          <span className="text-xs text-gray-500">Your {currentYear} baseline</span>
          <span className="text-sm font-bold text-gray-900">{fmt(currentTotalKg)} tCO₂e</span>
        </div>

        {/* Reduction % slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-700">Reduction target</label>
            <span className="text-lg font-black text-[#0C2918] tracking-tight">−{reductionPct}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={reductionPct}
            onChange={e => setReductionPct(Number(e.target.value))}
            className="w-full accent-[#0C2918]"
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-1">
            <span>5%</span><span>25%</span><span>50%</span>
          </div>
        </div>

        {/* Target year */}
        <div className="mb-5">
          <label className="text-xs font-bold text-gray-700 block mb-2">Target year</label>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 5 }, (_, i) => minTargetYr + i).map(yr => (
              <button
                key={yr}
                onClick={() => setTargetYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  targetYear === yr
                    ? 'bg-[#0C2918] text-[#C9A84C] border-[#0C2918]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#0C2918]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className={`rounded-xl border p-4 mb-5 transition-colors ${
          reductionPct >= 30 ? 'bg-green-50 border-green-100' : 'bg-[#0C2918]/4 border-[#0C2918]/10'
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0C2918]/50 mb-1">
            Your goal
          </p>
          <p className="text-base font-black text-[#0C2918] tracking-tight">
            Reduce from {fmt(currentTotalKg)} → {fmt(targetKg)} tCO₂e
          </p>
          <p className="text-xs text-[#0C2918]/60 mt-0.5">
            by {targetYear} · saving {fmt(currentTotalKg - targetKg)} tCO₂e/year
          </p>
          {reductionPct >= 30 && (
            <p className="text-[10px] text-green-600 font-semibold mt-1.5">
              ✓ Aligned with SBTi 1.5°C pathway targets for your sector
            </p>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-[#0C2918] text-[#C9A84C] hover:bg-[#122F1E]'
          }`}
        >
          {saving
            ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
            : saved
            ? <><CheckCircle2 size={15} /> Target saved</>
            : <><Target size={15} /> {editing ? 'Update Target' : 'Set This Target'}</>
          }
        </button>

        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="w-full mt-2 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}

        <p className="text-[9px] text-gray-400 text-center mt-3">
          Self-set internal goal. Not a regulatory commitment or independently verified target.
        </p>
      </div>
    </div>
  );
}