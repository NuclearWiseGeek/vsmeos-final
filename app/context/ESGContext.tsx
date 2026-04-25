// =============================================================================
// FILE: app/context/ESGContext.tsx
// PURPOSE: The "brain" and memory of the entire VSME OS supplier dashboard.
//          This file manages ALL shared state across the app — company profile,
//          activity data (emission inputs), and loading/saving to Supabase.
//
// HOW IT WORKS:
//   1. When a supplier logs in, we immediately load their saved data from
//      Supabase so they can resume where they left off (even after closing tab)
//   2. As they fill in inputs, data is held in React state (fast, instant UI)
//   3. AutoSave component triggers saveToSupabase() every 30 seconds + on exit
//   4. When they click "Save & Return to Hub", saveToSupabase() is called again
//
// WHEN TO MODIFY THIS FILE:
//   - When adding a new input field (add its key to activityData defaults)
//   - When adding a new company profile field (add to CompanyData interface,
//     INITIAL_COMPANY_DATA, load block in Section 5, save block in Section 6)
//   - When changing the Supabase table structure (remember to update the SQL
//     migration too — see supabase_schema.md)
//
// CATEGORY A AUDIT FIELDS (April 2026):
//   reportingPeriodStart/End, consolidationApproach, financialReportUrl
//   → stored on `profiles` (ALTER TABLE ran 23 Apr 2026)
//   → rendered on Page 1 of PDF + methodology footer
//   → all optional, safe defaults for legacy profiles
//
// DEPENDENCIES:
//   - Clerk (useUser, useAuth) — for user identity and Supabase auth token
//   - Supabase — for persistent storage (see app/utils/supabase.ts)
//   - calculations.ts — getSupportedCountries() for the country dropdown
// =============================================================================

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { createSupabaseClient } from '@/utils/supabase';

// =============================================================================
// SECTION 1: TYPE DEFINITIONS
// =============================================================================

/**
 * All fields that describe the company being assessed.
 * These appear on Page 1 of the generated PDF report.
 */
interface CompanyData {
  name: string;         // Legal company name (locked if from buyer invite)
  country: string;      // Country — CRITICAL: drives which emission factors are used
  industry: string;     // GICS sector (e.g. "Manufacturing (Heavy)")
  revenue: number;      // Annual revenue in chosen currency (used for intensity metric)
  currency: string;     // Reporting currency (EUR, USD, GBP, etc.)
  year: string;         // Financial year being reported (e.g. "2024")
  signer: string;       // Name of the person signing/attesting the report

  // ── Category A audit fields (April 2026) ──────────────────────────────────
  // These appear in the PDF title block and methodology footer. All optional —
  // the form provides sensible defaults, and the PDF renders "Not specified"
  // for legacy reports that don't have them.
  reportingPeriodStart?: string;   // ISO YYYY-MM-DD (HTML5 date input native format)
  reportingPeriodEnd?:   string;   // ISO YYYY-MM-DD
  consolidationApproach?: 'operational' | 'financial' | 'equity';
  financialReportUrl?:   string;   // Optional link to publicly-filed accounts
}

/**
 * Context shape — everything that components in the dashboard can access
 * by calling useESG()
 */
interface ESGContextType {
  // Company profile data and setter
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;

  // Activity inputs (emission quantities entered by supplier)
  // Keys match the keys in calculations.ts LABELS (e.g. "natural_gas", "diesel")
  activityData: Record<string, number>;
  setActivityData: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  // Convenience function to update a single activity value
  updateActivity: (key: string, value: number) => void;

  // Manually trigger a save to Supabase (called by Save buttons)
  saveToSupabase: () => Promise<void>;

  // Clear all data and start fresh
  resetAssessment: () => void;

  // UI state flags
  isSaving: boolean;       // True while a Supabase write is in progress
  isLoading: boolean;      // True while initial data is being loaded from Supabase
  lastSaved: Date | null;  // Timestamp of last successful save (shown in UI)
}

// =============================================================================
// SECTION 2: INITIAL / DEFAULT STATE
// All fields start empty or zero — they get filled either by the user
// or by loading from Supabase on mount.
// =============================================================================

const INITIAL_COMPANY_DATA: CompanyData = {
  name: '',
  country: 'France',     // Default to France since that's our primary market
  industry: '',
  revenue: 0,
  currency: 'EUR',
  year: new Date().getFullYear().toString(),
  signer: '',

  // ── Category A audit defaults ──
  // Dates start empty; the profile form pre-fills them based on the selected
  // reporting year (or the year from a buyer invite ?year=XXXX param).
  reportingPeriodStart:  '',
  reportingPeriodEnd:    '',
  consolidationApproach: 'operational',
  financialReportUrl:    '',
};

// All known activity keys initialised to 0.
// IMPORTANT: When you add a new input field to a scope page, add its key here too.
// If you don't, the field will work but won't be included in auto-save.
const INITIAL_ACTIVITY_DATA: Record<string, number> = {
  // Scope 1 — Stationary Combustion
  natural_gas: 0,
  heating_oil: 0,
  propane: 0,
  // Scope 1 — Mobile Combustion
  diesel: 0,
  petrol: 0,
  // Scope 1 — Fugitive Emissions (Refrigerants)
  ref_R410A: 0,
  ref_R32: 0,
  ref_R134a: 0,
  ref_R404A: 0,
  // Scope 2 — Purchased Energy
  electricity_grid: 0,
  electricity_green: 0,
  district_heat: 0,
  district_cool: 0,
  // Scope 3 — Business Travel
  grey_fleet: 0,
  rail_travel: 0,
  flight_short_haul: 0,   // NEW: replaces old single "air_travel" field
  flight_long_haul: 0,    // NEW: replaces old single "air_travel" field
  hotel_nights: 0,
  // Scope 3 — Employee Commuting & Remote Work (NEW)
  employee_commuting: 0,
  remote_working: 0,
};

// =============================================================================
// SECTION 3: CONTEXT CREATION
// =============================================================================

const ESGContext = createContext<ESGContextType | undefined>(undefined);

// =============================================================================
// SECTION 4: PROVIDER COMPONENT
// Wrap the entire supplier dashboard in this provider (done in layout.tsx).
// =============================================================================

export function ESGProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { getToken, userId } = useAuth();

  // --- State ---
  const [companyData, setCompanyData] = useState<CompanyData>(INITIAL_COMPANY_DATA);
  const [activityData, setActivityData] = useState<Record<string, number>>(INITIAL_ACTIVITY_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);   // Start true — we load on mount
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // =============================================================================
  // SECTION 5: LOAD DATA FROM SUPABASE ON MOUNT
  // This runs once when the component first renders (when supplier opens dashboard).
  // It fetches any previously saved data so they can resume their assessment.
  // =============================================================================

  useEffect(() => {
    // Don't attempt to load if Clerk hasn't identified the user yet
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadFromSupabase = async () => {
      try {
        setIsLoading(true);

        const token = await getToken({ template: 'supabase' });
        if (!token) {
          console.warn('[VSME OS] No Supabase token — user may not be fully authenticated yet');
          setIsLoading(false);
          return;
        }

        const supabase = createSupabaseClient(token);

        // Load company profile from the 'profiles' table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = row not found (new user, no profile yet) — that's fine
          console.error('[VSME OS] Error loading profile:', profileError);
        }

        if (profileData) {
          // Map database columns back to our CompanyData shape
          setCompanyData(prev => ({
            ...prev,
            name:     profileData.company_name || prev.name,
            country:  profileData.country       || prev.country,
            industry: profileData.industry      || prev.industry,
            revenue:  profileData.revenue       || prev.revenue,
            currency: profileData.currency      || prev.currency,
            year:     profileData.year?.toString() || prev.year,
            signer:   profileData.signer        || prev.signer,

            // ── Category A audit fields ──
            // Supabase returns `date` columns as ISO 'YYYY-MM-DD' strings,
            // which matches HTML5 <input type="date"> value format exactly.
            // Nullish coalescing to '' keeps inputs controlled components.
            reportingPeriodStart:  profileData.reporting_period_start ?? '',
            reportingPeriodEnd:    profileData.reporting_period_end   ?? '',
            consolidationApproach: profileData.consolidation_approach ?? 'operational',
            financialReportUrl:    profileData.financial_report_url   ?? '',
          }));
        }

        // Load the most recently UPDATED assessment — order by updated_at not year
        // This ensures we get the row with real data, not a blank newer-year row
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (assessmentError && assessmentError.code !== 'PGRST116') {
          console.error('[VSME OS] Error loading assessment:', assessmentError);
        }

        if (assessmentData?.activity_data) {
          // Merge saved data with our defaults (so new keys added later don't break things)
          setActivityData(prev => ({
            ...INITIAL_ACTIVITY_DATA,
            ...assessmentData.activity_data,
          }));
        }

      } catch (err) {
        // Non-fatal — user just starts fresh if load fails
        console.error('[VSME OS] Failed to load data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromSupabase();
  }, [userId]); // Re-run if the user changes (e.g. after sign-in)

  // =============================================================================
  // SECTION 6: SAVE COMPANY PROFILE TO SUPABASE
  // Called by: supplier/page.tsx on "Save & Continue" from the profile form.
  //
  // IMPORTANT — DOES NOT WRITE TO `assessments`.
  // The assessments table is the authoritative source of truth for a supplier's
  // report and its `status` field ('draft' | 'sent' | 'started' | 'submitted').
  // Only two things are allowed to touch `assessments`:
  //   1. AutoSave.tsx         — writes activity_data + emissions_totals,
  //                             never writes `status`, guarded by hasRealData.
  //   2. Explicit user actions — supplier/hub sets 'started',
  //                              supplier/results sets 'submitted'.
  //
  // Historical bug: this function used to upsert `assessments` with
  // status: 'draft'. Because onConflict was (user_id, year), it silently
  // reverted previously submitted reports to draft every time a supplier
  // edited their profile. Removed April 2026.
  // =============================================================================

  const saveToSupabase = useCallback(async () => {
    // Don't try to save if user isn't authenticated or already saving
    if (!userId || isSaving) return;

    try {
      setIsSaving(true);

      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No Supabase auth token available');

      const supabase = createSupabaseClient(token);

      // Save/update company profile
      // onConflict: 'id' means: if a row with this id already exists, UPDATE it
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id:           userId,
          company_name: companyData.name     || 'Unknown',
          country:      companyData.country  || 'France',
          industry:     companyData.industry || 'General',
          revenue:      companyData.revenue  || 0,
          currency:     companyData.currency || 'EUR',
          year:         parseInt(companyData.year) || new Date().getFullYear(),
          signer:       companyData.signer   || '',

          // ── Category A audit fields ──
          // Coerce empty strings to null — `date` columns reject '' ("invalid
          // input syntax for type date"), and `text` columns are cleaner with
          // null than empty string. consolidation_approach always has a value
          // (form radio always selects one).
          reporting_period_start: companyData.reportingPeriodStart  || null,
          reporting_period_end:   companyData.reportingPeriodEnd    || null,
          consolidation_approach: companyData.consolidationApproach || 'operational',
          financial_report_url:   companyData.financialReportUrl    || null,

          updated_at:   new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Record the successful save time (shown as "Last saved 2 min ago" in UI)
      setLastSaved(new Date());

    } catch (err) {
      console.error('[VSME OS] Failed to save to Supabase:', err);
      // We don't alert the user here — AutoSave will retry. Save buttons
      // on individual pages handle their own error display.
    } finally {
      setIsSaving(false);
    }
  }, [userId, companyData, isSaving, getToken]);

  // =============================================================================
  // SECTION 7: HELPER FUNCTIONS
  // =============================================================================

  /**
   * Updates a single activity field (e.g. when user types in a Scope 1 input).
   * This is the main function called by NumberInput onChange handlers.
   */
  const updateActivity = useCallback((key: string, value: number) => {
    setActivityData(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Clears all data and resets to blank state.
   * Called from the "Start New Assessment" button on the results page.
   */
  const resetAssessment = useCallback(() => {
    if (confirm('Are you sure you want to start a new assessment? All current data will be cleared.')) {
      setCompanyData(prev => ({ ...INITIAL_COMPANY_DATA, name: prev.name })); // ← keeps name
      setActivityData(INITIAL_ACTIVITY_DATA);
      setLastSaved(null);
    }
  }, []);

  // =============================================================================
  // SECTION 8: PROVIDE CONTEXT TO CHILDREN
  // =============================================================================

  return (
    <ESGContext.Provider value={{
      companyData,
      setCompanyData,
      activityData,
      setActivityData,
      updateActivity,
      saveToSupabase,
      resetAssessment,
      isSaving,
      isLoading,
      lastSaved,
    }}>
      {children}
    </ESGContext.Provider>
  );
}

// =============================================================================
// SECTION 9: CUSTOM HOOK
// Components access the context via: const { companyData, updateActivity } = useESG();
// =============================================================================

export const useESG = () => {
  const context = useContext(ESGContext);
  if (!context) {
    throw new Error('[VSME OS] useESG() must be used inside an <ESGProvider>. Check that the component is inside the supplier layout.');
  }
  return context;
};