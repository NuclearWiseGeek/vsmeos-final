// =============================================================================
// FILE: app/supplier/page.tsx
// PURPOSE: Company Profile page — the first page a supplier sees after login.
//          This is where they define the entity being reported:
//          company name, country, industry, financial year, revenue, currency.
//
// CRITICAL: The country field here drives WHICH emission factors are used
//           across the entire assessment. Getting this right is essential.
//           It is now a searchable dropdown — not free text — so we always
//           get a valid country name that maps to our database.
//
// FLOW:
//   1. If supplier arrived via a buyer invite → name is pre-filled and locked
//   2. If supplier signed up organically (no invite) → name is editable
//   3. On "Save & Continue" → profile saved to Supabase → redirect to hub
//
// WHEN TO MODIFY:
//   - When adding new profile fields (e.g. number of employees in Phase 4)
//   - When adding new currencies
//   - When updating the industry list
//
// DEPENDENCIES:
//   - ESGContext (useESG) — companyData, setCompanyData, saveToSupabase
//   - calculations.ts — getSupportedCountries() for dropdown options
//   - actions/supplier.ts — getPendingInvite(), updateCompanyProfile()
// =============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, Loader2, Search, Lock, ChevronDown } from 'lucide-react';
import { useESG } from '@/context/ESGContext';
import { getPendingInvite, updateCompanyProfile } from '@/actions/supplier';
import { getSupportedCountries } from '@/utils/calculations';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// =============================================================================
// SECTION 1: STATIC DATA — INDUSTRY LIST & CURRENCIES
// =============================================================================

// GICS Sectors + Key Verticals most relevant to SME suppliers.
// Update this list when adding new verticals in Phase 3.
const INDUSTRIES = [
  "Agriculture & Food Production",
  "Automotive & Transportation",
  "Banking & Financial Services",
  "Chemicals & Materials",
  "Construction & Real Estate",
  "Consumer Goods (FMCG)",
  "Education & Training",
  "Energy (Oil, Gas, Mining)",
  "Energy (Renewables)",
  "Healthcare & Pharmaceuticals",
  "Hospitality, Tourism & Leisure",
  "Information Technology & SaaS",
  "Logistics & Supply Chain",
  "Manufacturing (Heavy)",
  "Manufacturing (Light)",
  "Media & Telecommunications",
  "Professional Services (Consulting, Legal)",
  "Public Sector & Government",
  "Retail & E-Commerce",
  "Textiles & Apparel",
  "Utilities & Waste Management",
  "Other",
];

// Supported reporting currencies.
// Add more as we expand globally in Phase 3.
const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { code: 'CAD', symbol: '$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', label: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
];

// =============================================================================
// SECTION 2: COUNTRY DROPDOWN COMPONENT
// A searchable dropdown built from our getSupportedCountries() list.
// This ensures country names always match our emission factor database exactly.
// =============================================================================

interface CountryDropdownProps {
  value: string;
  onChange: (country: string) => void;
}

function CountryDropdown({ value, onChange }: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the full list of supported countries from calculations.ts
  const allCountries = getSupportedCountries();

  // Filter based on what the user is typing in the search box
  const filtered = allCountries.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button — shows selected country or placeholder */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-left flex items-center justify-between focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-300'}>
          {value || 'Select country...'}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">

          {/* Search input inside dropdown */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search countries..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>

          {/* Country list */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-gray-400 text-center">
                No country found for "{search}"
              </div>
            ) : (
              filtered.map(country => (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                    country === value
                      ? 'bg-[#0C2918] text-[#C9A84C] hover:bg-black font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {country}
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 text-center">
              {allCountries.length} countries supported · IEA / EMBER / National databases
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SECTION 3: MAIN COMPONENT
// =============================================================================

// ─── YearParamReader ──────────────────────────────────────────────────────
// Tiny component that reads ?year= from the URL and syncs it to ESGContext.
// Must be in its own component because useSearchParams() requires Suspense.
function YearParamReader() {
  const searchParams = useSearchParams();
  const { companyData, setCompanyData } = useESG();

  useEffect(() => {
    const yearParam = searchParams.get('year');
    if (yearParam && yearParam !== companyData.year) {
      setCompanyData((prev: any) => ({ ...prev, year: yearParam }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  return null; // renders nothing — side-effect only
}

export default function SupplierProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { companyData, setCompanyData, saveToSupabase } = useESG();
  const [invite, setInvite] = useState<any>(null);

  // Local display state for formatted revenue (shows "1,000,000" not "1000000")
  const [displayRevenue, setDisplayRevenue] = useState('');

  // ─── Redirect returning suppliers to dashboard ───────────────────────────
  // Skip redirect when:
  //   ?new=true  — supplier clicked "New declaration" in dashboard
  //   ?year=XXXX — supplier came from a buyer invite link in dashboard
  // In both cases, show the profile form pre-filled with their saved data.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasYear = params.has('year');
    const isNew   = params.get('new') === 'true';
    if (hasYear || isNew) return; // stay on form — user wants to fill/review

    if (companyData.name && companyData.name !== 'EMPTY' && companyData.name.trim().length > 1) {
      router.replace('/supplier/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — companyData loads from Supabase via ESGContext

  // ─── Check for buyer invite on mount ────────────────────────────────────
  // If a buyer has invited this supplier, we pre-fill the company name
  // and lock it so it matches exactly what the buyer expects.
  useEffect(() => {
    getPendingInvite().then((data) => {
      if (data) {
        setInvite(data);
        // Pre-fill the locked company name from the invite
        if (data.supplier_name) {
          setCompanyData((prev: any) => ({ ...prev, name: data.supplier_name }));
        }
      }
    });
  }, [setCompanyData]);

  // ─── Sync revenue display when companyData loads from Supabase ──────────
  useEffect(() => {
    if (companyData.revenue && companyData.revenue > 0) {
      setDisplayRevenue(companyData.revenue.toLocaleString('en-US'));
    }
  }, [companyData.revenue]);

  // ─── Revenue input handlers ──────────────────────────────────────────────
  // We format with commas in the display but store the raw number in state
  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '' || (!isNaN(Number(rawValue)) && Number(rawValue) >= 0)) {
      setCompanyData({ ...companyData, revenue: parseFloat(rawValue) || 0 });
      setDisplayRevenue(rawValue === '' ? '' : Number(rawValue).toLocaleString('en-US'));
    }
  };

  const handleRevenueBlur = () => {
    if (companyData.revenue > 0) {
      setDisplayRevenue(companyData.revenue.toLocaleString('en-US'));
    }
  };

  // ─── Save & Continue ─────────────────────────────────────────────────────
  // Validates minimum required fields, saves to Supabase, redirects to hub
  const handleSaveAndContinue = async () => {
    // Guard: name must be at least 2 characters
    if (!companyData.name || companyData.name.trim().length < 2) return;
    // Guard: country must be selected
    if (!companyData.country) return;

    setSaving(true);

    try {
      // 1. Save the company profile fields via server action
      await updateCompanyProfile({
        country:  companyData.country,
        industry: companyData.industry,
        year:     companyData.year,
        currency: companyData.currency,
        revenue:  companyData.revenue,
      });

      // 2. Also trigger ESGContext save (persists to assessments table too)
      await saveToSupabase();

      // 3. Redirect to the assessment hub
      router.push('/supplier/hub');

    } catch (err) {
      console.error('[VSME OS] Failed to save company profile:', err);
      // Non-fatal — still redirect so user isn't stuck
      router.push('/supplier/hub');
    } finally {
      setSaving(false);
    }
  };

  // ─── Validation: is the form ready to submit? ────────────────────────────
  const isValid =
    companyData.name?.trim().length >= 2 &&
    companyData.country?.length > 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Read ?year= URL param — wrapped in Suspense as required by Next.js */}
      <Suspense fallback={null}>
        <YearParamReader />
      </Suspense>

      {/* ================================================================
          BUYER INVITE BANNER
          Only shown when supplier arrived via a buyer's invite link.
          Explains why the company name is locked and what's expected.
          ================================================================ */}
      {invite && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg mt-0.5 flex-shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-base">
              Invited by {invite.buyer_name || 'Your Partner'}
            </h3>
            <p className="text-blue-700 mt-1 text-sm leading-relaxed">
              You have been invited to submit your carbon footprint data.
              Please complete your company profile below, then fill in your
              emissions data across Scopes 1, 2, and 3 to generate your report.
            </p>
            {invite.deadline && (
              <p className="text-blue-600 mt-2 text-xs font-bold">
                📅 Submission deadline: {new Date(invite.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          PAGE HEADER
          ================================================================ */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
          Company Profile
        </h1>
        <p className="text-sm text-gray-500">
          Define the entity you are reporting for. Your country selection
          determines which emission factors are applied to your data.
        </p>
      </div>

      {/* ================================================================
          PROFILE FORM
          ================================================================ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 space-y-8">

          {/* ── 1. LEGAL COMPANY NAME ────────────────────────────────── */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
              Legal Company Name
            </label>
            <p className="text-xs text-gray-400">
              This name will appear on the cover page of your generated PDF report.
            </p>

            {/* Locked state (from buyer invite) */}
            {invite ? (
              <div className="relative group">
                <input
                  type="text"
                  value={companyData.name}
                  readOnly
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 cursor-not-allowed select-none focus:outline-none pr-24"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-200 text-gray-500 px-2 py-1 rounded text-[10px] font-bold">
                  <Lock size={10} /> LOCKED
                </div>
              </div>
            ) : (
              /* Editable state (organic signup — no invite) */
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                placeholder="e.g. Dupont Industries SAS"
                className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder-gray-300"
              />
            )}
          </div>

          {/* ── 2. COUNTRY & INDUSTRY ────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Country — SEARCHABLE DROPDOWN */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Headquarters / Primary Operations Country
              </label>
              <p className="text-xs text-gray-400">
                Determines electricity grid emission factor and national calculator used.
              </p>
              <CountryDropdown
                value={companyData.country}
                onChange={(c) => setCompanyData({ ...companyData, country: c })}
              />
              {/* Show which factor will be used — educational transparency */}
              {companyData.country && (
                <p className="text-[10px] text-blue-600 font-medium mt-1">
                  ✓ Emission factors available for {companyData.country}
                </p>
              )}
            </div>

            {/* Industry Sector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Industry Sector
              </label>
              <p className="text-xs text-gray-400">
                Used for industry benchmarking in Phase 3.
              </p>
              <div className="relative">
                <select
                  value={companyData.industry || ''}
                  onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select sector...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

          </div>

          {/* ── 3. FINANCIAL YEAR & CURRENCY ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Financial Year */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Reporting Financial Year
              </label>
              <p className="text-xs text-gray-400">
                The calendar year your emissions data covers (e.g. 2024 = Jan–Dec 2024).
              </p>
              <input
                type="number"
                value={companyData.year}
                onChange={(e) => setCompanyData({ ...companyData, year: e.target.value })}
                min="2020"
                max="2030"
                placeholder="2024"
                className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder-gray-300"
              />
            </div>

            {/* Reporting Currency */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Reporting Currency
              </label>
              <p className="text-xs text-gray-400">
                Used for the carbon intensity metric (kgCO₂e per million revenue).
              </p>
              <div className="relative">
                <select
                  value={companyData.currency || 'EUR'}
                  onChange={(e) => setCompanyData({ ...companyData, currency: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all cursor-pointer appearance-none"
                >
                  {CURRENCIES.map(({ code, symbol, label }) => (
                    <option key={code} value={code}>
                      {code} ({symbol}) — {label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

          </div>

          {/* ── 4. ANNUAL REVENUE ────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
              Annual Revenue ({companyData.currency || 'EUR'})
            </label>
            <p className="text-xs text-gray-400">
              Used to calculate your carbon intensity metric (kgCO₂e per million {companyData.currency || 'EUR'} revenue).
              This metric allows your buyer to fairly compare suppliers of different sizes.
            </p>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm pointer-events-none">
                {CURRENCIES.find(c => c.code === companyData.currency)?.symbol || '€'}
              </div>
              <input
                type="text"
                value={displayRevenue}
                onChange={handleRevenueChange}
                onBlur={handleRevenueBlur}
                placeholder="0"
                className="w-full p-4 pl-8 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder-gray-300"
              />
            </div>
          </div>

        </div>

        {/* ================================================================
            FORM FOOTER — SAVE BUTTON
            ================================================================ */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Validation message */}
          {!isValid && (
            <p className="text-xs text-gray-400">
              {!companyData.name?.trim()
                ? '⚠️ Company name is required'
                : !companyData.country
                ? '⚠️ Please select a country to continue'
                : ''}
            </p>
          )}
          {isValid && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Profile ready — emission factors loaded for {companyData.country}
            </p>
          )}

          <button
            onClick={handleSaveAndContinue}
            disabled={saving || !isValid}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 ${
              isValid
                ? 'bg-[#0C2918] text-[#C9A84C] hover:bg-[#122F1E] shadow-gray-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {saving ? (
              <><Loader2 className="animate-spin" size={16} /> Saving...</>
            ) : (
              <>Save & Continue to Hub <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}