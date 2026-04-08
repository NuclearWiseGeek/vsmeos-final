// =============================================================================
// FILE: components/AutoSave.tsx
// PURPOSE: Debounced auto-save engine + toast notification.
//
//   IMPORTANT ARCHITECTURE NOTE:
//   This component ONLY saves. It never loads data.
//   Loading is handled entirely by ESGContext on mount.
//   Having two components both load and set state created a race condition
//   where blank default state overwrote real Supabase data in fresh/incognito
//   sessions. Removing load logic from here fixes that permanently.
//
//   SAVE TRIGGERS:
//   - 1 second after the last change to companyData or activityData
//   - Only fires after ESGContext has finished its initial load (isLoading = false)
//
// TOAST STATES:
//   idle     → hidden
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
import { Loader2, CloudOff, CheckCircle2 } from 'lucide-react';

type Status = 'idle' | 'saving' | 'saved' | 'error';

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
  const { companyData, activityData, isLoading } = useESG();
  const { getToken, userId } = useAuth();

  // Refs so the save callback always reads the latest values
  const companyDataRef  = useRef(companyData);
  const activityDataRef = useRef(activityData);
  useEffect(() => { companyDataRef.current  = companyData;  }, [companyData]);
  useEffect(() => { activityDataRef.current = activityData; }, [activityData]);

  const [status, setStatus] = useState<Status>('idle');

  // ── SAVER ─────────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!userId) return;
    setStatus('saving');

    try {
      const co = companyDataRef.current;
      const ac = activityDataRef.current;

      // Always write to localStorage as an offline backup
      try {
        localStorage.setItem(`esg_backup_${userId}`, JSON.stringify({ company: co, activity: ac }));
      } catch (_) { /* localStorage unavailable (incognito storage full etc) — non-fatal */ }

      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No token');
      const supabase = createSupabaseClient(token);

      // Save profile — revenue + currency live here ONLY
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

      // Save assessment — no revenue/currency (columns don't exist on assessments)
      const results = calculateEmissions(ac, co.country || 'France');
      const totals  = summarizeEmissions(results, co.revenue || 0);

      await supabase.from('assessments').upsert({
        user_id:          userId,
        year:             parseInt(co.year) || new Date().getFullYear(),
        activity_data:    ac,
        emissions_totals: totals,
        status:           'draft',
        updated_at:       new Date().toISOString(),
      }, { onConflict: 'user_id, year' });

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);

    } catch (err) {
      console.error('AutoSave error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [userId, getToken]);

  // ── TRIGGER ───────────────────────────────────────────────────────────────
  // Only fires after ESGContext has finished loading (isLoading = false)
  // This is the key guard — prevents saving blank defaults during initial load
  useEffect(() => {
    if (isLoading) return;   // ESGContext still loading — do not save yet
    const t = setTimeout(() => save(), 1000);
    return () => clearTimeout(t);
  }, [companyData, activityData, save, isLoading]);

  return <SaveToast status={status} />;
}