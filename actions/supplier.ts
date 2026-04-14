'use server';

import { createSupabaseClient } from '@/utils/supabase';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function getPendingInvite() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0].emailAddress;
  
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });
  if (!token) return null;

  const supabase = createSupabaseClient(token);

  const { data } = await supabase
    .from('supplier_invites')
    .select('buyer_name, status, supplier_name')
    .eq('supplier_email', email)
    .maybeSingle();

  return data;
}

// Saves company profile to supplier_invites and creates/updates assessment record.
// NOTE: revenue and currency are NOT saved to assessments (columns were dropped).
// They live in profiles only. The ESGContext saveToSupabase handles profiles.
export async function updateCompanyProfile(data: {
  country: string;
  industry: string;
  year: string;
  currency: string;
  revenue: number;
}) {
  const user = await currentUser();
  if (!user) return { error: 'Unauthorized' };
  
  const userId = user.id;
  const email = user.emailAddresses[0].emailAddress;

  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });

  if (!token) {
    return { error: 'No authentication token found' };
  }

  const supabase = createSupabaseClient(token);

  // 1. Update the supplier_invites record so buyer sees progress
  const { error: inviteError } = await supabase
    .from('supplier_invites')
    .update({
      country:        data.country,
      industry:       data.industry,
      financial_year: data.year,
      currency:       data.currency,
      revenue:        data.revenue,
      status:         'started',
      updated_at:     new Date().toISOString(),
    })
    .eq('supplier_email', email);

  if (inviteError) {
    console.error('Invite Update Error:', inviteError);
    return { success: false };
  }

  // 2. Look up the buyer_id from supplier_invites
  let buyerIdForAssessment: string | null = null;
  const { data: inviteRow } = await supabase
    .from('supplier_invites')
    .select('buyer_id')
    .eq('supplier_email', email)
    .maybeSingle();
  if (inviteRow?.buyer_id) {
    buyerIdForAssessment = inviteRow.buyer_id;
  }

  // 3. Create/update assessment record for this user + year.
  //    CRITICAL: never overwrite status if it's already 'submitted'.
  //    We do this by reading the current status first and only setting
  //    status: 'draft' if no row exists yet (INSERT path of upsert).
  //    For existing rows we do NOT include status in the update — Supabase
  //    upsert with onConflict merges only the supplied columns, so omitting
  //    status leaves it unchanged.
  //
  //    Implementation: check if a submitted row already exists. If so,
  //    skip the status field entirely. If not, set 'draft'.

  const { data: existing } = await supabase
    .from('assessments')
    .select('status')
    .eq('user_id', userId)
    .eq('year', parseInt(data.year))
    .maybeSingle();

  const isAlreadySubmitted = existing?.status === 'submitted';

  const upsertPayload: Record<string, any> = {
    user_id:    userId,
    year:       parseInt(data.year),
    buyer_id:   buyerIdForAssessment,
    updated_at: new Date().toISOString(),
  };

  // Only set status to 'draft' if this is a brand-new row.
  // If it's already 'submitted', leave the status column alone.
  if (!isAlreadySubmitted) {
    upsertPayload.status = existing ? 'started' : 'draft';
  }

  const { error: assessmentError } = await supabase
    .from('assessments')
    .upsert(upsertPayload, { onConflict: 'user_id, year' });

  if (assessmentError) {
    console.error('Assessment Update Error:', assessmentError);
    // Non-fatal — profile page still works without this
  }

  return { success: true };
}