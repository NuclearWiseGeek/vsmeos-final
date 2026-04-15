// =============================================================================
// FILE: app/supplier/results/page.tsx
// PURPOSE: The Results & Report Generation page.
//
// FIXES IN THIS VERSION (April 2026):
//   - supplier_invites status update now uses actual email (not company name)
//   - Added useUser import for correct email lookup
// =============================================================================

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

function useCountUp(target: number, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const startTime  = useRef<number | null>(null);
  const frameRef   = useRef<number>(0);
  const prevTarget = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setDisplay(0); return; }
    const startValue = prevTarget.current === target ? display : 0;
    prevTarget.current = target;
    startTime.current  = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed  = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(startValue + (target - startValue) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { uploadEvidence } from '../../../actions/uploadEvidence';
import {
  CheckCircle2, RotateCcw, ArrowLeft, FileText,
  X, File, AlertCircle, Loader2, Save, CloudUpload,
  TrendingUp, TrendingDown, Scale
} from 'lucide-react';
import { useESG } from '@/context/ESGContext';
import {
  calculateEmissions,
  summarizeEmissions,
  formatEmissions
} from '@/utils/calculations';
import { useAuth, useUser } from '@clerk/nextjs'; // ← added useUser
import IntelligenceCards from '@/components/IntelligenceCards';
import TargetSetter from '@/components/TargetSetter';
import { getCountryFactors } from '@/utils/calculations';
import { createSupabaseClient } from '@/utils/supabase';

const DownloadTrigger = dynamic(() => import('@/components/DownloadTrigger'), {
  ssr: false,
  loading: () => (
    <div className="w-full py-4 text-center text-gray-400 text-sm animate-pulse">
      Loading PDF engine...
    </div>
  )
});

const EVIDENCE_MAP: Record<string, string> = {
  natural_gas:        'Gas Utility Invoices (annual total kWh)',
  heating_oil:        'Heating Oil Delivery Receipts (litres)',
  propane:            'LPG Delivery Receipts or Bottle Records',
  diesel:             'Fuel Card Statements — Fleet Diesel',
  petrol:             'Fuel Card Statements — Fleet Petrol',
  ref_R410A:          'HVAC Maintenance Log (R410A top-up kg)',
  ref_R32:            'HVAC Maintenance Log (R32 top-up kg)',
  ref_R134a:          'Vehicle / HVAC Service Record (R134a kg)',
  ref_R404A:          'Refrigeration Maintenance Log (R404A kg)',
  electricity_grid:   'Electricity Utility Invoices (annual kWh)',
  electricity_green:  'Guarantee of Origin (GoO) / REC Certificates',
  district_heat:      'District Heating Network Invoices (kWh)',
  district_cool:      'District Cooling Network Invoices (kWh)',
  grey_fleet:         'Mileage Reimbursement Records / Expense Reports',
  rail_travel:        'Train Booking Records or Travel Expense Reports',
  flight_short_haul:  'Flight Booking Records — Short-Haul (< 3,700 km)',
  flight_long_haul:   'Flight Booking Records — Long-Haul (> 3,700 km)',
  hotel_nights:       'Hotel Booking Records or Accommodation Expenses',
  employee_commuting: 'Employee Survey Data or Commute Distance Estimates',
  remote_working:     'HR Records or Manager-Confirmed WFH Day Count',
};

const PRESCRIBED_ORDER = [
  'natural_gas', 'heating_oil', 'propane', 'diesel', 'petrol',
  'ref_R410A', 'ref_R32', 'ref_R134a', 'ref_R404A',
  'electricity_grid', 'electricity_green', 'district_heat', 'district_cool',
  'grey_fleet', 'rail_travel', 'flight_short_haul', 'flight_long_haul',
  'hotel_nights', 'employee_commuting', 'remote_working',
];

export default function ResultsPage() {
  const { companyData, setCompanyData, activityData, resetAssessment } = useESG();
  const { getToken, userId } = useAuth();
  const { user } = useUser(); // ← get actual email from Clerk
  const router = useRouter();

  const [isClient,    setIsClient]    = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [saveStatus,  setSaveStatus]  = useState<'idle' | 'success' | 'error'>('idle');
  const [fileVault,   setFileVault]   = useState<Record<string, Array<{ name: string; url: string }>>>({});
  const [debouncedSigner, setDebouncedSigner] = useState(companyData.signer || '');
  // Phase 4.2 — previous year comparison
  const [prevYearData, setPrevYearData] = useState<{ grandTotal: number; year: number } | null>(null);

  const results = calculateEmissions(activityData, companyData.country || 'France');
  const totals  = summarizeEmissions(results, companyData.revenue || 0);
  const formattedTotal = formatEmissions(totals.total);
  const animatedValue  = useCountUp(formattedTotal.value, 1200);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const requiredEvidence = PRESCRIBED_ORDER.filter(key => {
    const val = parseFloat(String(activityData[key] || 0));
    return val > 0 && EVIDENCE_MAP[key];
  });

  // ── SAVE TO DATABASE ────────────────────────────────────────────────────────
  const saveToDatabase = useCallback(async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No auth token');
      const supabase = createSupabaseClient(token);

      // Save company profile
      await supabase.from('profiles').upsert({
        id:           userId,
        company_name: companyData.name     || 'Unknown',
        industry:     companyData.industry || 'General',
        country:      companyData.country  || 'France',
        revenue:      companyData.revenue  || 0,
        currency:     companyData.currency || 'EUR',
        year:         parseInt(companyData.year) || new Date().getFullYear(),
        signer:       companyData.signer   || '',
        updated_at:   new Date().toISOString(),
      }, { onConflict: 'id' });

      // ── Fetch buyer_id so Phase 3.1 buyer aggregation works ─────────────────
      // buyers_read_supplier_assessments RLS requires buyer_id on assessments.
      const supplierEmail = user?.emailAddresses[0]?.emailAddress;
      let buyerIdForAssessment: string | null = null;
      if (supplierEmail) {
        const { data: inviteRow } = await supabase
          .from('supplier_invites')
          .select('buyer_id')
          .eq('supplier_email', supplierEmail)
          .maybeSingle();
        if (inviteRow?.buyer_id) buyerIdForAssessment = inviteRow.buyer_id;
      }

      // Save assessment. Keys use grandTotal/scope1Total/scope2Total/scope3Total
      // so getSupplierEmissions() reads them without remapping.
      // No revenue/currency (dropped from assessments table).
      await supabase.from('assessments').upsert({
        user_id:          userId,
        year:             parseInt(companyData.year) || new Date().getFullYear(),
        activity_data:    activityData,
        emissions_totals: {
          scope1Total: totals.scope1,
          scope2Total: totals.scope2,
          scope3Total: totals.scope3,
          grandTotal:  totals.total,
          totalTonnes: totals.totalTonnes,
          intensity:   totals.intensity,
        },
        evidence_links: fileVault,
        buyer_id:       buyerIdForAssessment,
        status:         'submitted',
        updated_at:     new Date().toISOString(),
      }, { onConflict: 'user_id, year' });

      // ── Update supplier_invites status → 'submitted' ─────────────────────
      if (supplierEmail) {
        await supabase
          .from('supplier_invites')
          .update({
            status: 'submitted',
            updated_at: new Date().toISOString(),
          })
          .eq('supplier_email', supplierEmail)
          .neq('status', 'submitted');
      }

      setSaveStatus('success');

    } catch (err) {
      console.error('[VSME OS] Results save error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [userId, user, companyData, activityData, totals, fileVault, getToken]);

  // ── FILE UPLOAD ─────────────────────────────────────────────────────────────
  const handleAddFile = (key: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.png,.jpg,.jpeg,.csv,.xlsx';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsUploading(true);
      try {
        const filePath = `${userId}/${companyData.year || 'general'}/${key}/${Date.now()}_${file.name}`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', filePath);
        const publicUrl = await uploadEvidence(formData);
        setFileVault(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), { name: file.name, url: publicUrl }]
        }));
      } catch (error: any) {
        console.error('[VSME OS] Upload failed:', error);
        alert(`Upload failed: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  const removeFile = (key: string, idx: number) => {
    setFileVault(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx)
    }));
  };

  useEffect(() => { setIsClient(true); }, []);

  // Phase 4.2 — fetch previous year submitted assessment for YoY comparison
  useEffect(() => {
    if (!userId || !companyData.year) return;
    const py = parseInt(companyData.year) - 1;
    if (isNaN(py)) return;

    (async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) return;
        const supabase = createSupabaseClient(token);
        const { data } = await supabase
          .from('assessments')
          .select('year, emissions_totals')
          .eq('user_id', userId)
          .eq('year', py)
          .eq('status', 'submitted')
          .maybeSingle();

        if (data?.emissions_totals) {
          const gt = data.emissions_totals.grandTotal ?? data.emissions_totals.total ?? 0;
          if (Number(gt) > 0) setPrevYearData({ grandTotal: Number(gt), year: py });
        }
      } catch { /* non-fatal */ }
    })();
  }, [userId, companyData.year, getToken]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSigner(companyData.signer || ''), 500);
    return () => clearTimeout(t);
  }, [companyData.signer]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new assessment? This will clear all current data.')) {
      resetAssessment();
      router.push('/supplier/hub');
    }
  };

  const simpleFileVault = Object.keys(fileVault).reduce((acc, key) => {
    acc[key] = fileVault[key].map(f => f.name);
    return acc;
  }, {} as Record<string, string[]>);

  const prettyBreakdown = results.map(row => ({
    scope:     row.scope,
    activity:  row.activity,
    quantity:  row.quantity,
    unit:      row.unit,
    emissions: row.emissions,
    factorRef: row.factorRef,
    source:    row.source,
  }));

  if (!isClient) {
    return (
      <div className="p-12 text-center text-gray-400 animate-pulse text-sm">
        Loading calculation engine...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:py-12 sm:px-6">

      {/* TOP NAV */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Link href="/supplier/hub" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Back to Assessment Hub
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={saveToDatabase}
            disabled={isSaving}
            className={`text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              saveStatus === 'success'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : saveStatus === 'error'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-white border border-gray-200 hover:border-black text-gray-700'
            }`}
          >
            {isSaving
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : saveStatus === 'success'
              ? <><CheckCircle2 size={14} /> Saved</>
              : <><Save size={14} /> Save Progress</>
            }
          </button>
          <button onClick={handleReset} className="text-sm text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors">
            <RotateCcw size={14} /> Start New
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div className="bg-green-50 p-3 rounded-2xl flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-500 stroke-[2.5px]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Assessment Complete</h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl">
            Calculations are complete using{' '}
            <span className="font-medium text-gray-700">{companyData.country || 'France'}</span>'s
            national emission factors. Review your totals below, attach supporting evidence,
            sign the declaration, and download your GHG Protocol / ISO 14064-1 compliant report.
          </p>
          {saveStatus === 'success' && (
            <p className="text-green-600 text-xs font-bold mt-2">
              ✓ Assessment data synced to your account. Your buyer has been notified.
            </p>
          )}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10">

        {/* EMISSIONS SUMMARY CARD */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Total Carbon Footprint · FY {companyData.year}
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="count-up-number text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tighter">
              {animatedValue.toLocaleString('en-US', { maximumFractionDigits: 3 })}
            </span>
            <span className="text-lg text-gray-400 font-medium">{formattedTotal.unit}</span>
          </div>
          {formattedTotal.unit === 'tCO2e' && (
            <p className="text-xs text-gray-400 mb-6">= {fmt(totals.total)} kgCO₂e</p>
          )}
          {formattedTotal.unit === 'kgCO2e' && (
            <p className="text-xs text-gray-400 mb-6">
              = {(totals.total / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 })} tCO₂e
            </p>
          )}
          <div className="space-y-5 flex-1">
            {[
              { label: 'Scope 1', sub: 'Direct Emissions',    value: totals.scope1, colour: 'bg-blue-600',   ring: 'ring-blue-50'   },
              { label: 'Scope 2', sub: 'Indirect Energy',     value: totals.scope2, colour: 'bg-orange-500', ring: 'ring-orange-50' },
              { label: 'Scope 3', sub: 'Travel & Commuting',  value: totals.scope3, colour: 'bg-purple-500', ring: 'ring-purple-50' },
            ].map(({ label, sub, value, colour, ring }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colour} ring-4 ${ring} flex-shrink-0`} />
                  <div>
                    <span className="block font-bold text-gray-900 text-sm">{label}</span>
                    <span className="block text-[10px] text-gray-400">{sub}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-gray-900 block">{fmt(value)} kg</span>
                  <span className="text-[10px] text-gray-400">
                    {totals.total > 0 ? ((value / totals.total) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          {totals.intensity > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-gray-400" />
                  <div>
                    <span className="block text-xs font-bold text-gray-700">Carbon Intensity</span>
                    <span className="block text-[10px] text-gray-400">
                      kgCO₂e per M{companyData.currency || 'EUR'} revenue
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-gray-900">{fmt(totals.intensity)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ATTESTATION & DOWNLOAD CARD */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              ★ Attestation & Download
            </h3>
            <div className="mb-8">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                Authorised Signatory Name
              </label>
              <input
                type="text"
                value={companyData.signer || ''}
                onChange={(e) => setCompanyData({ ...companyData, signer: e.target.value })}
                className="w-full border-b-2 border-gray-200 py-3 text-xl font-medium focus:border-black outline-none bg-transparent transition-colors placeholder-gray-300 text-gray-900"
                placeholder="e.g. Jean Dupont"
              />
              <div className="mt-5 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  <span className="font-bold text-gray-900">Legal Declaration: </span>
                  By generating this document, you attest that all activity data is accurate
                  to the best of your knowledge. Your name will appear as the authorised
                  signatory on the Declaration of Conformity (Page 3 of the report).
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {['GHG Protocol', 'ISO 14064-1:2018', 'EU (2025/1710)', 'CSRD ESRS E1'].map(badge => (
                <span key={badge} className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-[9px] font-bold text-gray-600 uppercase tracking-wider">
                  <Scale size={9} className="text-green-500" /> {badge}
                </span>
              ))}
            </div>
          </div>
          <DownloadTrigger
            companyData={companyData}
            totals={totals}
            breakdown={prettyBreakdown}
            activityData={activityData}
            fileVault={simpleFileVault}
            debouncedSigner={debouncedSigner}
            onDownloadComplete={saveToDatabase}
          />
        </div>
      </div>

      {/* ── YEAR-ON-YEAR COMPARISON — Phase 4.2 ─────────────────────────────── */}
      {prevYearData && totals.total > 0 && (() => {
        const currentKg  = totals.total;
        const previousKg = prevYearData.grandTotal;
        const pct        = ((currentKg - previousKg) / previousKg) * 100;
        const isDown     = pct < -0.5;
        const isUp       = pct >  0.5;
        const absPct     = Math.abs(pct).toFixed(1);
        const currentT   = (currentKg  / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        const previousT  = (previousKg / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

        return (
          <div className={`mb-8 rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 ${
            isDown ? 'bg-green-50 border-green-100' : isUp ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
          }`}>
            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDown ? 'bg-green-100' : isUp ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {isDown
                ? <TrendingDown size={20} className="text-green-600" />
                : isUp
                ? <TrendingUp   size={20} className="text-red-500"   />
                : <TrendingUp   size={20} className="text-gray-400"  />
              }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold mb-0.5 ${
                isDown ? 'text-green-800' : isUp ? 'text-red-700' : 'text-gray-700'
              }`}>
                {isDown
                  ? `Your emissions decreased ${absPct}% vs ${prevYearData.year} ↓`
                  : isUp
                  ? `Your emissions increased ${absPct}% vs ${prevYearData.year} ↑`
                  : `Your emissions are roughly the same as ${prevYearData.year}`
                }
              </p>
              <p className={`text-xs ${isDown ? 'text-green-600' : isUp ? 'text-red-500' : 'text-gray-500'}`}>
                {prevYearData.year}: <span className="font-semibold">{previousT} tCO₂e</span>
                {' '}→{' '}
                {companyData.year}: <span className="font-semibold">{currentT} tCO₂e</span>
                {' '}
                ({isDown ? '-' : isUp ? '+' : ''}{absPct}%)
              </p>
            </div>

            {/* Delta pill */}
            <div className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm ${
              isDown ? 'bg-green-100 text-green-700' : isUp ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {isDown ? '−' : isUp ? '+' : '±'}{absPct}%
            </div>
          </div>
        );
      })()}

      {/* ── AI CARBON INTELLIGENCE — Phase 4.3 + 4.4 ─────────────────────── */}
      {totals.total > 0 && (() => {
        const cf = getCountryFactors(companyData.country || 'France');
        // Build top sources from breakdown, sorted by emission size
        const topSources = [...prettyBreakdown]
          .filter(r => r.emissions > 0)
          .sort((a, b) => b.emissions - a.emissions)
          .slice(0, 5)
          .map(r => ({
            activity:    r.activity,
            emissionsKg: r.emissions,
            pctOfTotal:  totals.total > 0 ? (r.emissions / totals.total) * 100 : 0,
          }));

        return (
          <div className="mb-10">
            <IntelligenceCards
              industry={companyData.industry || 'Other'}
              country={companyData.country || 'France'}
              year={companyData.year || '2024'}
              currency={companyData.currency || 'EUR'}
              scope1Kg={totals.scope1}
              scope2Kg={totals.scope2}
              scope3Kg={totals.scope3}
              totalKg={totals.total}
              intensityKgPerMRevenue={totals.intensity}
              topSources={topSources}
              activityData={activityData}
              gridFactor={cf.electricityGrid}
              primaryCalculator={cf.primaryCalculator}
            />
          </div>
        );
      })()}

      {/* ── REDUCTION TARGET — Phase 4.5 ────────────────────────────────────── */}
      {totals.total > 0 && (
        <div className="mb-10">
          <TargetSetter
            currentTotalKg={totals.total}
            currentYear={companyData.year || new Date().getFullYear().toString()}
            currency={companyData.currency || 'EUR'}
          />
        </div>
      )}

      {/* EVIDENCE VAULT */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-gray-900" />
            Verification Evidence Vault
            {isUploading && (
              <span className="text-xs text-blue-500 animate-pulse ml-2 font-normal">Uploading...</span>
            )}
          </h3>
          <span className="text-xs font-medium text-gray-400">
            {Object.values(fileVault).flat().length} file{Object.values(fileVault).flat().length !== 1 ? 's' : ''} attached
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {requiredEvidence.length === 0 ? (
            <div className="p-16 text-center text-gray-400 bg-gray-50/30">
              <p className="text-sm">No emission data entered. Go back and fill in your Scope 1, 2, and 3 data.</p>
              <Link href="/supplier/hub" className="text-sm text-blue-600 hover:underline mt-3 block">
                ← Return to Assessment Hub
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {requiredEvidence.map((key) => {
                const files = fileVault[key] || [];
                return (
                  <div key={key} className="p-6 sm:p-8 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          files.length > 0 ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'bg-gray-50 text-gray-300'
                        }`}>
                          {files.length > 0 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{EVIDENCE_MAP[key]}</p>
                          <p className="text-[10px] mt-0.5 mb-3">
                            {files.length > 0
                              ? <span className="text-[#C9A84C] font-bold uppercase tracking-widest">✓ Evidence Linked</span>
                              : <span className="text-gray-400">Awaiting documentation</span>}
                          </p>
                          {files.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {files.map((file, idx) => (
                                <div key={idx} className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-600">
                                  <File size={11} />
                                  <span className="max-w-[180px] truncate">{file.name}</span>
                                  <button onClick={() => removeFile(key, idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFile(key)}
                        disabled={isUploading}
                        className="flex-shrink-0 px-5 py-2.5 bg-white border border-gray-100 text-gray-900 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:border-black transition-all flex items-center gap-2"
                      >
                        {isUploading
                          ? <><Loader2 size={13} className="animate-spin" /> Uploading...</>
                          : <><CloudUpload size={13} /> Add File</>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {requiredEvidence.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-3 px-1 leading-relaxed">
            Supporting documents are stored securely and linked to your assessment record.
            They are not included in the PDF but are available for audit upon request.
            Under CSRD, these must be retained for a minimum of 5 years.
          </p>
        )}
      </div>

    </div>
  );
}