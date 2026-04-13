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
      status:         'started',      // matches our status vocabulary
      updated_at:     new Date().toISOString(),
    })
    .eq('supplier_email', email);

  if (inviteError) {
    console.error('Invite Update Error:', inviteError);
    return { success: false };
  }

  // 2. Look up the buyer_id from supplier_invites so we can store it on the assessment.
  //    This is required for the buyers_read_supplier_assessments RLS policy in Phase 3.1.
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
  //    NO revenue or currency here — those columns were dropped from assessments.
  //    buyer_id is stored here so buyers can read submitted assessments via RLS.
  const { error: assessmentError } = await supabase
    .from('assessments')
    .upsert({
      user_id:    userId,
      year:       parseInt(data.year),
      status:     'draft',
      buyer_id:   buyerIdForAssessment,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id, year',
    });

  if (assessmentError) {
    console.error('Assessment Update Error:', assessmentError);
    // Non-fatal — profile page still works without this
  }

  return { success: true };
}