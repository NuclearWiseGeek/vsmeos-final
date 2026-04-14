// =============================================================================
// FILE: components/AutoSave.tsx
// PURPOSE: Debounced auto-save engine + toast notification.
//
//   - Loads data from localStorage (fast) then Supabase (authoritative)
//   - Saves 1 second after the last change to companyData or activityData
//   - Guards against saving all-zero activity data (prevents blank overwrites)
//   - Shows a polished bottom-right toast for: restoring / saving / saved / error
//
// FIXES IN THIS VERSION (April 2026):
//   - Removed currency + revenue from assessments upsert (columns dropped)
//   - Uses singleton createSupabaseClient from utils/supabase (fixes GoTrueClient flood)
//   - Revenue + currency now saved only to profiles table
//   - hasRealData guard: skips assessment upsert if all activity values are zero,
//     preventing blank default state from overwriting real data in Supabase
//
// TOAST STATES:
//   idle     → hidden
//   loading  → "Restoring session..." (blue, bounce icon)
//   saving   → "Saving..." (blue, spin icon)
//   saved    → "All changes saved" (gold, 2s then hides)
//   error    → "Saved locally" (amber, 3s then hides)
// =============================================================================

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useESG } from '@/context/ESGContext';
import { createSupabaseClient } from '@/utils/supabase';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';
import { Loader2, CloudOff, DownloadCloud, CheckCircle2 } from 'lucide-react';

type Status = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

// Returns true if at least one activity field has a non-zero value
// Used to guard against saving blank default state over real Supabase data
function hasRealData(activity: Record<string, number>): boolean {
  return Object.values(activity).some(v => v > 0);
}

// ── Toast UI ──────────────────────────────────────────────────────────────────
function SaveToast({ status }: { status: Status }) {
  if (status === 'idle') return null;

  const configs: Record<Exclude<Status, 'idle'>, {
    icon: React.ReactNode;
    label: string;
    bg: string;
    border: string;
    text: string;
  }> = {
    loading: {
      icon: <DownloadCloud size={14} className="text-blue-500 animate-bounce" />,
      label: 'Restoring session...',
      bg: 'bg-white/95',
      border: 'border-blue-100',
      text: 'text-blue-600',
    },
    saving: {
      icon: <Loader2 size={14} className="text-blue-500 animate-spin" />,
      label: 'Saving...',
      bg: 'bg-white/95',
      border: 'border-blue-100',
      text: 'text-blue-600',
    },
    saved: {
      icon: <CheckCircle2 size={14} className="text-[#C9A84C]" />,
      label: 'All changes saved',
      bg: 'bg-white/95',
      border: 'border-[#C9A84C]/30',
      text: 'text-[#C9A84C]',
    },
    error: {
      icon: <CloudOff size={14} className="text-amber-500" />,
      label: 'Saved locally',
      bg: 'bg-white/95',
      border: 'border-amber-100',
      text: 'text-amber-600',
    },
  };

  const { icon, label, bg, border, text } = configs[status];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] toast-enter">
      <div className={`
        flex items-center gap-2.5 px-4 py-2.5 rounded-full
        shadow-xl shadow-black/5 border backdrop-blur-md
        ${bg} ${border}
      `}>
        {icon}
        <span className={`text-xs font-bold tracking-wide ${text}`}>{label}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AutoSave() {
  const { companyData, setCompanyData, activityData, setActivityData } = useESG();
  const { getToken, userId, isLoaded } = useAuth();

  const companyDataRef  = useRef(companyData);
  const activityDataRef = useRef(activityData);
  useEffect(() => { companyDataRef.current  = companyData;  }, [companyData]);
  useEffect(() => { activityDataRef.current = activityData; }, [activityData]);

  const [status, setStatus] = useState<Status>('idle');
  const hasLoaded = useRef(false);

  // ── LOADER ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !userId || hasLoaded.current) return;
      setStatus('loading');
      let localName = '';

      try {
        // 1. Try localStorage first (instant)
        const localBackup = localStorage.getItem(`esg_backup_${userId}`);
        if (localBackup) {
          const parsed = JSON.parse(localBackup);
          if (parsed.company?.name) {
            setCompanyData(parsed.company);
            if (parsed.activity) setActivityData(parsed.activity);
            localName = parsed.company.name;
          }
        }

        // 2. Load from Supabase (authoritative — always wins over localStorage)
        const token = await getToken({ template: 'supabase' });
        if (token) {
          const supabase = createSupabaseClient(token);

          // Load profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          const dbName = profile?.company_name || '';

          if ((!dbName || dbName === 'EMPTY') && localName.length > 0) {
            // Keep local — cloud has no name yet
          } else if (dbName && dbName !== 'EMPTY') {
            setCompanyData(prev => ({
              ...prev,
              name:     profile.company_name,
              industry: profile.industry || prev.industry,
              country:  profile.country  || prev.country,
              revenue:  profile.revenue  || prev.revenue,
              currency: profile.currency || prev.currency,
              signer:   profile.signer   || prev.signer,
              year:     profile.year?.toString() || prev.year,
            }));
          }

          // Load most recently updated assessment
          const { data: assess } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (assess) {
            if (assess.activity_data) {
              setActivityData(prev => ({ ...prev, ...assess.activity_data }));
            }
            if (assess.year) {
              setCompanyData(prev => ({ ...prev, year: assess.year.toString() }));
            }
          }
        }
      } catch (err) {
        console.error('AutoSave load error:', err);
      } finally {
        hasLoaded.current = true;
        setStatus('idle');
      }
    };
    load();
  }, [isLoaded, userId, getToken, setCompanyData, setActivityData]);

  // ── SAVER ────────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!userId || !hasLoaded.current) return;
    setStatus('saving');

    try {
      const co = companyDataRef.current;
      const ac = activityDataRef.current;

      // Always save to localStorage as backup
      try {
        localStorage.setItem(`esg_backup_${userId}`, JSON.stringify({ company: co, activity: ac }));
      } catch (_) { /* non-fatal */ }

      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No token');
      const supabase = createSupabaseClient(token);

      // Always save profile (company name, country etc — safe to save even when empty)
      await supabase.from('profiles').upsert({
        id:           userId,
        company_name: co.name     || 'EMPTY',
        industry:     co.industry || 'General',
        country:      co.country  || 'France',
        revenue:      co.revenue  || 0,
        currency:     co.currency || 'EUR',
        signer:       co.signer   || '',
        year:         parseInt(co.year) || new Date().getFullYear(),
        updated_at:   new Date().toISOString(),
      });

      // Only save assessment if there is real data (at least one non-zero value)
      // This is the key guard — prevents blank default state from overwriting
      // real Supabase data when state initialises with zeros on fresh/incognito load
      if (hasRealData(ac)) {
        const results = calculateEmissions(ac, co.country || 'France');
        const totals  = summarizeEmissions(results, co.revenue || 0);

        // IMPORTANT: status is deliberately NOT included here.
        // AutoSave must never overwrite status — it is set only by explicit
        // user actions: hub sets 'started', results sets 'submitted'.
        // Including status: 'draft' here would silently revert submitted
        // assessments every time the supplier navigates within the portal.
        await supabase.from('assessments').upsert({
          user_id:          userId,
          year:             parseInt(co.year) || new Date().getFullYear(),
          activity_data:    ac,
          emissions_totals: {
            scope1Total: totals.scope1,
            scope2Total: totals.scope2,
            scope3Total: totals.scope3,
            grandTotal:  totals.total,
            totalTonnes: totals.totalTonnes,
            intensity:   totals.intensity,
          },
          updated_at:       new Date().toISOString(),
        }, { onConflict: 'user_id, year' });
      }

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);

    } catch (err) {
      console.error('AutoSave save error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [userId, getToken]);

  // ── TRIGGER (debounced 1s after last change) ──────────────────────────────
  useEffect(() => {
    if (!hasLoaded.current) return;
    const t = setTimeout(() => save(), 1000);
    return () => clearTimeout(t);
  }, [companyData, activityData, save]);

  return <SaveToast status={status} />;
}