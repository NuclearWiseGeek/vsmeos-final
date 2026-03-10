// =============================================================================
// FILE: components/AutoSave.tsx
// PURPOSE: Debounced auto-save engine + toast notification.
//
//   - Loads data from localStorage (fast) then Supabase (authoritative)
//   - Saves 1 second after the last change to companyData or activityData
//   - Shows a polished bottom-right toast for: restoring / saving / saved / error
//
// TOAST STATES:
//   idle     → hidden
//   loading  → "Restoring session..." (blue, bounce icon)
//   saving   → "Saving..." (blue, spin icon)
//   saved    → "All changes saved" (green, 2s then hides)
//   error    → "Saved locally" (amber, 3s then hides)
// =============================================================================

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useESG } from '@/context/ESGContext';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';
import { Loader2, CloudOff, DownloadCloud, CheckCircle2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createClerkSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

type Status = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

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
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
      label: 'All changes saved',
      bg: 'bg-white/95',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
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

  const [status, setStatus]   = useState<Status>('idle');
  const hasLoaded = useRef(false);

  // ── LOADER ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !userId || hasLoaded.current) return;
      setStatus('loading');
      let localName = '';

      try {
        const localBackup = localStorage.getItem(`esg_backup_${userId}`);
        if (localBackup) {
          const parsed = JSON.parse(localBackup);
          if (parsed.company?.name) {
            setCompanyData(parsed.company);
            if (parsed.activity) setActivityData(parsed.activity);
            localName = parsed.company.name;
          }
        }

        const token = await getToken({ template: 'supabase' });
        if (token) {
          const supabase = createClerkSupabaseClient(token);
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', userId).maybeSingle();
          const dbName = profile?.company_name || '';

          if ((!dbName || dbName === 'EMPTY') && localName.length > 0) {
            // Keep local — cloud is empty
          } else if (dbName && dbName !== 'EMPTY') {
            setCompanyData(prev => ({
              ...prev,
              name: profile.company_name,
              industry: profile.industry || prev.industry,
              country: profile.country   || prev.country,
            }));
          }

          const { data: assess } = await supabase
            .from('assessments').select('*').eq('user_id', userId)
            .order('updated_at', { ascending: false }).limit(1).maybeSingle();
          if (assess) {
            if (assess.activity_data) setActivityData(prev => ({ ...prev, ...assess.activity_data }));
            if (assess.year) setCompanyData(prev => ({ ...prev, year: assess.year.toString() }));
          }
        }
      } catch (err) {
        console.error('Load error:', err);
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

      localStorage.setItem(`esg_backup_${userId}`, JSON.stringify({ company: co, activity: ac }));

      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No token');
      const supabase = createClerkSupabaseClient(token);

      await supabase.from('profiles').upsert({
        id: userId,
        company_name: co.name || 'EMPTY',
        industry:     co.industry || 'General',
        country:      co.country  || 'France',
        updated_at:   new Date().toISOString(),
      });

      const results = calculateEmissions(ac);
      const totals  = summarizeEmissions(results, co.revenue || 0);
      await supabase.from('assessments').upsert({
        user_id:          userId,
        year:             parseInt(co.year) || 2024,
        activity_data:    ac,
        emissions_totals: totals,
        status:           'draft',
        updated_at:       new Date().toISOString(),
      }, { onConflict: 'user_id, year' });

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [userId, getToken]);

  // ── TRIGGER (debounced 1s) ────────────────────────────────────────────────
  useEffect(() => {
    if (!hasLoaded.current) return;
    const t = setTimeout(() => save(), 1000);
    return () => clearTimeout(t);
  }, [companyData, activityData, save]);

  return <SaveToast status={status} />;
}