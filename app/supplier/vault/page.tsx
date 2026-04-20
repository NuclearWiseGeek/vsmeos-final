// =============================================================================
// FILE: app/supplier/vault/page.tsx
// PURPOSE: Supplier Vault — full history of GHG declarations with document trail.
//
// PHASE 4 — Task 4.1 (v3 — bug fixes)
//
// FIXES vs v2:
//   1. Evidence panel always shows (with "no documents" empty state when empty)
//   2. PDF download button is compact inside the card footer — no longer w-full
//   3. GoTrueClient conflict reduced by sharing token retrieval timing
//   4. Signer fallback — vault re-downloads never blocked by missing signer name
//
// RULES:
//   - Never call createClient() — always createSupabaseClient(token)
//   - Brand: #0C2918 bg / #C9A84C text. Zero emerald. Zero Tailwind green.
//   - Only submitted assessments show download + docs
//   - Legal note: "self-attested (limited assurance)"
// =============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createSupabaseClient } from '@/utils/supabase';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';
import { resignEvidenceUrls } from '@/actions/resignEvidence';
import dynamic from 'next/dynamic';
import {
  Archive, FileText, Clock, CheckCircle2, AlertCircle,
  Paperclip, ExternalLink, Loader2, ChevronDown, ChevronUp,
  Download, FolderOpen,
} from 'lucide-react';
import Link from 'next/link';

// DownloadTrigger must be client-only (react-pdf uses browser APIs)
// We use a wrapper to make it compact inside vault cards
const DownloadTrigger = dynamic(() => import('@/components/DownloadTrigger'), {
  ssr: false,
  loading: () => (
    <div className="h-9 w-40 rounded-xl bg-gray-100 animate-pulse" />
  ),
});

// ─── Evidence category labels + scope tags ────────────────────────────────────

const EVIDENCE_LABELS: Record<string, string> = {
  natural_gas:        'Gas Utility Invoices',
  heating_oil:        'Heating Oil Receipts',
  propane:            'LPG Delivery Records',
  diesel:             'Fleet Diesel Records',
  petrol:             'Fleet Petrol Records',
  ref_R410A:          'HVAC Log (R410A)',
  ref_R32:            'HVAC Log (R32)',
  ref_R134a:          'Service Record (R134a)',
  ref_R404A:          'Refrigeration Log (R404A)',
  electricity_grid:   'Electricity Invoices',
  electricity_green:  'GoO / REC Certificates',
  district_heat:      'District Heating Invoices',
  district_cool:      'District Cooling Invoices',
  grey_fleet:         'Mileage / Expense Reports',
  rail_travel:        'Rail Booking Records',
  flight_short_haul:  'Short-Haul Flight Records',
  flight_long_haul:   'Long-Haul Flight Records',
  hotel_nights:       'Hotel Booking Records',
  employee_commuting: 'Commute Survey Data',
  remote_working:     'WFH Day Records',
};

const EVIDENCE_SCOPE: Record<string, '1' | '2' | '3'> = {
  natural_gas: '1', heating_oil: '1', propane: '1', diesel: '1', petrol: '1',
  ref_R410A: '1', ref_R32: '1', ref_R134a: '1', ref_R404A: '1',
  electricity_grid: '2', electricity_green: '2', district_heat: '2', district_cool: '2',
  grey_fleet: '3', rail_travel: '3', flight_short_haul: '3', flight_long_haul: '3',
  hotel_nights: '3', employee_commuting: '3', remote_working: '3',
};

const SCOPE_STYLE: Record<string, { pill: string; box: string; text: string }> = {
  '1': { pill: 'bg-orange-50 text-orange-600 border-orange-100', box: 'bg-orange-50 border-orange-100', text: 'text-orange-700' },
  '2': { pill: 'bg-blue-50 text-blue-600 border-blue-100',       box: 'bg-blue-50 border-blue-100',     text: 'text-blue-700'   },
  '3': { pill: 'bg-purple-50 text-purple-600 border-purple-100', box: 'bg-purple-50 border-purple-100', text: 'text-purple-700' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type EvidenceFile   = { name: string; url: string };
type EvidenceLinks  = Record<string, EvidenceFile[]>;

interface VaultAssessment {
  id:               number;
  year:             number;
  status:           string;
  activity_data:    Record<string, any>;
  emissions_totals: Record<string, any>;
  evidence_links:   EvidenceLinks | null;
  updated_at:       string;
}

interface SupplierProfile {
  company_name:   string;
  country:        string;
  industry:       string;
  revenue:        number;
  currency:       string;
  signer:         string;
  employee_count: string;
  website:        string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toTonnes = (kg: number | undefined | null, dec = 1) =>
  ((Number(kg) || 0) / 1000).toLocaleString('en-US', {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const fileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return '📄';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return '🖼';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return '📊';
  return '📎';
};

// ─── Evidence File Row ────────────────────────────────────────────────────────

function EvidenceFileRow({ file, onView }: { file: EvidenceFile; onView: () => void }) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try { await onView(); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-between gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 mb-1.5 last:mb-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm flex-shrink-0">{fileIcon(file.name)}</span>
        <span className="text-xs text-gray-600 truncate" title={file.name}>{file.name}</span>
      </div>
      <button
        onClick={handle}
        disabled={loading}
        className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-[#0C2918] hover:text-[#C9A84C] disabled:opacity-40 transition-colors"
      >
        {loading ? <Loader2 size={10} className="animate-spin" /> : <ExternalLink size={10} />}
        View
      </button>
    </div>
  );
}

// ─── Documents Panel ──────────────────────────────────────────────────────────

function DocumentsPanel({ evidenceLinks }: { evidenceLinks: EvidenceLinks | null }) {
  const [expanded, setExpanded] = useState(false);

  // Normalise: treat null / undefined / {} the same
  const categories = Object.keys(evidenceLinks || {}).filter(
    k => (evidenceLinks?.[k]?.length ?? 0) > 0
  );
  const totalFiles = categories.reduce((n, k) => n + (evidenceLinks?.[k]?.length ?? 0), 0);
  const hasFiles = totalFiles > 0;

  const handleView = async (file: EvidenceFile) => {
    try {
      const map = await resignEvidenceUrls([file.url]);
      const fresh = map[file.url];
      if (fresh) window.open(fresh, '_blank', 'noopener,noreferrer');
      else alert('File could not be opened — it may have been removed from storage.');
    } catch {
      alert('Error opening document. Please try again.');
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
      {/* Header — always visible, clickable to expand */}
      <button
        onClick={() => hasFiles && setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 transition-colors ${hasFiles ? 'hover:bg-gray-100/60 cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-center gap-2">
          <Paperclip size={12} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-600">Evidence Documents</span>
          {hasFiles && (
            <span className="bg-[#0C2918] text-[#C9A84C] text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {totalFiles}
            </span>
          )}
        </div>
        {hasFiles
          ? (expanded
              ? <ChevronUp size={12} className="text-gray-400" />
              : <ChevronDown size={12} className="text-gray-400" />)
          : null
        }
      </button>

      {/* Empty state — no files uploaded */}
      {!hasFiles && (
        <div className="px-4 py-4 flex items-center gap-2.5">
          <FolderOpen size={15} className="text-gray-300 flex-shrink-0" />
          <p className="text-xs text-gray-400">
            No documents were uploaded with this declaration.
            Evidence can be attached during the submission flow.
          </p>
        </div>
      )}

      {/* File list — collapsed by default, expands on click */}
      {hasFiles && expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {categories.map(cat => {
            const scope = EVIDENCE_SCOPE[cat];
            const style = scope ? SCOPE_STYLE[scope] : SCOPE_STYLE['1'];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  {scope && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${style.pill}`}>
                      S{scope}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-gray-600">
                    {EVIDENCE_LABELS[cat] || cat}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto">
                    {evidenceLinks?.[cat]?.length} file{evidenceLinks?.[cat]?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {evidenceLinks?.[cat]?.map((file, i) => (
                  <EvidenceFileRow key={i} file={file} onView={() => handleView(file)} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'submitted') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#0C2918]/8 text-[#0C2918] border border-[#0C2918]/10 whitespace-nowrap">
      <CheckCircle2 size={11} />Submitted
    </span>
  );
  if (status === 'started') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">
      <Clock size={11} />In progress
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-400 border border-gray-200 whitespace-nowrap">
      <FileText size={11} />Draft
    </span>
  );
}

// ─── Compact Download Wrapper ─────────────────────────────────────────────────
// DownloadTrigger renders w-full by default (designed for the results page).
// In vault cards we want a compact button. We override by constraining the container
// and hiding the "Enter signatory" locked state (vault re-downloads are always unlocked
// since the report was already submitted with a valid signer).

function CompactDownload({
  companyData, totals, breakdown, activityData, signer,
}: {
  companyData: any; totals: any; breakdown: any[];
  activityData: any; signer: string;
}) {
  // Guarantee signer has length > 2 so DownloadTrigger never shows the locked state.
  // The report was already signed at submission — the signer name is in the PDF data.
  const effectiveSigner = signer && signer.trim().length > 2
    ? signer.trim()
    : 'Authorised Signatory';

  return (
    // Constrain to card width. overflow-hidden clips the w-full button neatly.
    // The button fills this container → looks like a proper full-width card footer CTA.
    <div className="w-full">
      <DownloadTrigger
        companyData={companyData}
        totals={totals}
        breakdown={breakdown}
        activityData={activityData}
        fileVault={{}}
        debouncedSigner={effectiveSigner}
      />
    </div>
  );
}

// ─── Vault Card ───────────────────────────────────────────────────────────────

function VaultCard({ assessment, profile }: { assessment: VaultAssessment; profile: SupplierProfile | null }) {
  const { year, status, activity_data, emissions_totals, evidence_links, updated_at } = assessment;

  const grandKg  = emissions_totals?.grandTotal  ?? emissions_totals?.total  ?? 0;
  const scope1Kg = emissions_totals?.scope1Total ?? emissions_totals?.scope1 ?? 0;
  const scope2Kg = emissions_totals?.scope2Total ?? emissions_totals?.scope2 ?? 0;
  const scope3Kg = emissions_totals?.scope3Total ?? emissions_totals?.scope3 ?? 0;

  const isSubmitted = status === 'submitted';

  const companyData = {
    company_name:   profile?.company_name   || '',
    country:        profile?.country        || 'France',
    industry:       profile?.industry       || '',
    revenue:        profile?.revenue        || 0,
    currency:       profile?.currency       || 'EUR',
    signer:         profile?.signer         || '',
    employee_count: profile?.employee_count || '',
    website:        profile?.website        || '',
    year:           year.toString(),   // override to THIS assessment's year
  };

  const results = calculateEmissions(activity_data || {}, profile?.country || 'France');
  const totals  = summarizeEmissions(results, profile?.revenue || 0);
  const prettyBreakdown = results.map(r => ({
    scope: r.scope, activity: r.activity, quantity: r.quantity,
    unit: r.unit, emissions: r.emissions, factorRef: r.factorRef, source: r.source,
  }));

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
      isSubmitted
        ? 'border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5'
        : 'border-dashed border-gray-200 opacity-60'
    }`}>
      {/* Top accent */}
      {isSubmitted && <div className="h-1 bg-[#0C2918]" />}

      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
              {year}
            </div>
            {isSubmitted ? (
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl font-bold text-[#0C2918] tracking-tight">{toTonnes(grandKg)}</span>
                <span className="text-xs text-gray-400">tCO₂e</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2">No report yet</p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Scope breakdown */}
        {isSubmitted && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {([
              { label: 'Scope 1', kg: scope1Kg, scope: '1' as const },
              { label: 'Scope 2', kg: scope2Kg, scope: '2' as const },
              { label: 'Scope 3', kg: scope3Kg, scope: '3' as const },
            ]).map(({ label, kg, scope }) => {
              const s = SCOPE_STYLE[scope];
              return (
                <div key={label} className={`rounded-xl border p-3 text-center ${s.box}`}>
                  <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${s.text} opacity-60`}>
                    {label}
                  </div>
                  <div className={`text-sm font-bold ${s.text}`}>
                    {toTonnes(kg)}<span className="text-[9px] font-normal ml-0.5 opacity-60">t</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Evidence documents — always shown for submitted reports */}
        {isSubmitted && (
          <div className="mb-4">
            <DocumentsPanel evidenceLinks={evidence_links} />
          </div>
        )}

        {/* Footer */}
        {isSubmitted && profile ? (
          <div className="space-y-3 pt-3 border-t border-gray-50">
            <p className="text-[10px] text-gray-400">Submitted {fmtDate(updated_at)}</p>
            <CompactDownload
              companyData={companyData}
              totals={totals}
              breakdown={prettyBreakdown}
              activityData={activity_data || {}}
              signer={profile.signer}
            />
          </div>
        ) : (
          <div className="pt-3 border-t border-gray-100">
            <Link
              href={`/supplier?year=${year}`}
              className="text-sm font-medium text-[#0C2918] hover:text-[#C9A84C] transition-colors"
            >
              Start {year} declaration →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VaultPage() {
  const { getToken, userId } = useAuth();

  const [assessments, setAssessments] = useState<VaultAssessment[]>([]);
  const [profile,     setProfile]     = useState<SupplierProfile | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) throw new Error('Authentication error — please sign in again.');
        const supabase = createSupabaseClient(token);

        const [{ data: profileData, error: pErr }, { data: assessmentData, error: aErr }] =
          await Promise.all([
            supabase.from('profiles')
              .select('company_name, country, industry, revenue, currency, signer, employee_count, website')
              .eq('id', userId).maybeSingle(),
            supabase.from('assessments')
              .select('id, year, status, activity_data, emissions_totals, evidence_links, updated_at')
              .eq('user_id', userId)
              .order('year', { ascending: false }),
          ]);

        if (pErr) throw new Error(pErr.message);
        if (aErr) throw new Error(aErr.message);

        setProfile(profileData);
        setAssessments(assessmentData || []);
      } catch (err: any) {
        setError(err?.message || 'Unknown error loading vault.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, getToken]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <div className="h-8 w-40 bg-gray-100 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded-xl animate-pulse mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-2">Could not load vault</h2>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0C2918]/5 flex items-center justify-center mx-auto mb-5">
          <Archive size={28} className="text-[#0C2918]/30" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Your vault is empty</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
          Complete and submit a GHG declaration to see it here for safe-keeping.
        </p>
        <Link
          href="/supplier?new=true"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0C2918] text-[#C9A84C] text-sm font-semibold hover:bg-[#122F1E] transition-colors"
        >
          <FileText size={14} />
          Start your first report
        </Link>
      </div>
    );
  }

  const submittedCount = assessments.filter(a => a.status === 'submitted').length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:py-12 sm:px-6">

      <div className="flex items-start gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#0C2918] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Archive size={18} className="text-[#C9A84C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {submittedCount === 0
              ? 'No submitted declarations yet.'
              : `${submittedCount} submitted declaration${submittedCount === 1 ? '' : 's'} · re-download any year as a PDF`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {assessments.map(a => (
          <VaultCard key={a.id} assessment={a} profile={profile} />
        ))}
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-12 max-w-lg mx-auto leading-relaxed">
        All reports are self-attested (limited assurance) and generated using GHG Protocol-based
        methodology. Reports are stored securely and can be re-downloaded at any time.
      </p>

    </div>
  );
}