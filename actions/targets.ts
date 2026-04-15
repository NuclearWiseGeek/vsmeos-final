'use server';

// =============================================================================
// FILE: actions/targets.ts
// PURPOSE: Save and load supplier reduction targets.
//
// DATA MODEL:
//   profiles.targets jsonb — { reductionPct: number, targetYear: number, baselineYear: number, setAt: string }
//
// PHASE 4 — Task 4.5
//
// RULES:
//   - Never call createClient() — always createSupabaseClient(token)
//   - RLS: profiles policy already covers this (auth.jwt() ->> 'sub' = id)
//   - Stored on profiles not assessments — targets are per-supplier not per-year
// =============================================================================

import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/utils/supabase';

export interface ReductionTarget {
  reductionPct:  number;  // e.g. 20 = "reduce 20%"
  targetYear:    number;  // e.g. 2027
  baselineYear:  number;  // the year the baseline assessment was taken
  baselineKg:    number;  // grandTotal kgCO2e at baseline — stored for progress calc
  setAt:         string;  // ISO timestamp
}

export async function saveTarget(target: ReductionTarget): Promise<{ success: boolean; error?: string }> {
  const { userId, getToken } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const token = await getToken({ template: 'supabase' });
  if (!token) return { success: false, error: 'No auth token' };

  const supabase = createSupabaseClient(token);

  const { error } = await supabase
    .from('profiles')
    .update({
      targets:    target,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[Targets] Save error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function loadTarget(): Promise<ReductionTarget | null> {
  const { userId, getToken } = await auth();
  if (!userId) return null;

  const token = await getToken({ template: 'supabase' });
  if (!token) return null;

  const supabase = createSupabaseClient(token);

  const { data, error } = await supabase
    .from('profiles')
    .select('targets')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data?.targets) return null;
  return data.targets as ReductionTarget;
}