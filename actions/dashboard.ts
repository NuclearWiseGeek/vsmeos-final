'use server';

// =============================================================================
// FILE: actions/dashboard.ts
// PURPOSE: Fetches all data needed for the supplier dashboard in parallel.
//          Single server action = one round trip instead of 5.
//
// RETURNS:
//   profile      — company info, target
//   assessments  — all years, ordered newest first
//   invites      — all buyer invites for this supplier email
//   benchmark    — cached Claude benchmark for (industry, country, latestYear)
//   recommendations — cached Claude recommendations for (userId, latestYear)
//
// CACHING STRATEGY:
//   Benchmark:       intelligence_cache key = "{industry}__{country}__{year}"
//   Recommendations: intelligence_cache key = "rec__{userId}__{year}"
//   Both are loaded if present; never auto-called (supplier must click Refresh)
//
// PHASE 4 — Supplier Dashboard
// =============================================================================

import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/utils/supabase';

export interface DashboardData {
  profile: {
    company_name:   string;
    country:        string;
    industry:       string;
    revenue:        number;
    currency:       string;
    signer:         string;
    role:           string;
    targets:        any | null;
  } | null;
  assessments: Array<{
    id:               number;
    year:             number;
    status:           string;
    emissions_totals: Record<string, any>;
    activity_data:    Record<string, any>;
    updated_at:       string;
  }>;
  invites: Array<{
    id:             string;
    buyer_name:     string;
    status:         string;
    financial_year: string;
    created_at:     string;
  }>;
  benchmark:        Record<string, any> | null;
  recommendations:  Record<string, any> | null;
}

export async function getDashboardData(): Promise<DashboardData> {
  const { userId, getToken } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { profile: null, assessments: [], invites: [], benchmark: null, recommendations: null };
  }

  const email = user.emailAddresses[0]?.emailAddress || '';
  const token = await getToken({ template: 'supabase' });

  if (!token) {
    return { profile: null, assessments: [], invites: [], benchmark: null, recommendations: null };
  }

  const supabase = createSupabaseClient(token);

  // ── Fetch everything in parallel ────────────────────────────────────────────
  const [profileRes, assessmentsRes, invitesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('company_name, country, industry, revenue, currency, signer, role, targets')
      .eq('id', userId)
      .maybeSingle(),

    supabase
      .from('assessments')
      .select('id, year, status, emissions_totals, activity_data, updated_at')
      .eq('user_id', userId)
      .order('year', { ascending: false }),

    supabase
      .from('supplier_invites')
      .select('id, buyer_name, status, financial_year, created_at')
      .eq('supplier_email', email)
      .order('created_at', { ascending: false }),
  ]);

  const profile    = profileRes.data   || null;
  const assessments = assessmentsRes.data || [];
  const invites    = invitesRes.data   || [];

  // ── Find latest submitted assessment ────────────────────────────────────────
  const latestSubmitted = assessments.find(a => a.status === 'submitted');
  const latestYear = latestSubmitted?.year || new Date().getFullYear();

  // ── Load cached intelligence (benchmark + recommendations) ─────────────────
  // These are loaded read-only — never auto-triggered from the dashboard
  let benchmark:       Record<string, any> | null = null;
  let recommendations: Record<string, any> | null = null;

  if (profile && latestSubmitted) {
    const bmKey  = `${profile.industry}__${profile.country}__${latestYear}`;
    const recKey = `rec__${userId}__${latestYear}`;

    const [bmRes, recRes] = await Promise.all([
      supabase
        .from('intelligence_cache')
        .select('result')
        .eq('cache_key', bmKey)
        .eq('mode', 'benchmark')
        .maybeSingle(),

      supabase
        .from('intelligence_cache')
        .select('result')
        .eq('cache_key', recKey)
        .eq('mode', 'recommendations')
        .maybeSingle(),
    ]);

    if (bmRes.data?.result) {
      benchmark = {
        ...bmRes.data.result,
        yourIntensity: latestSubmitted.emissions_totals?.intensity || 0,
      };
    }
    if (recRes.data?.result) recommendations = recRes.data.result;
  }

  return { profile, assessments, invites, benchmark, recommendations };
}