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
    .select('buyer_name, status, supplier_name') // <--- 🟢 ADDED supplier_name
    .eq('supplier_email', email)
    .maybeSingle();

  return data;
}

// 🟢 UPDATED: Saves to BOTH 'supplier_invites' and 'assessments'
export async function updateCompanyProfile(data: {
  country: string;
  industry: string;
  year: string;
  currency: string;
  revenue: number;
}) {
  const user = await currentUser();
  if (!user) return { error: 'Unauthorized' };
  
  // Get the Clerk User ID (needed for assessments table)
  const userId = user.id; 
  const email = user.emailAddresses[0].emailAddress;

  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });

  // 🟢 FIX: Ensure token is not null before proceeding
  if (!token) {
    return { error: 'No authentication token found' };
  }

  const supabase = createSupabaseClient(token);

  // 1. Update the Invite (So the Buyer sees "In Progress")
  const { error: inviteError } = await supabase
    .from('supplier_invites')
    .update({
      country: data.country,
      industry: data.industry,
      financial_year: data.year,
      currency: data.currency,
      revenue: data.revenue,
      status: 'in_progress'
    })
    .eq('supplier_email', email);

  if (inviteError) {
    console.error('Invite Update Error:', inviteError);
    return { success: false };
  }

  // 2. Create/Update the Assessment (So YOU have the data for the report)
  const { error: assessmentError } = await supabase
    .from('assessments')
    .upsert({
      user_id: userId,        // The Clerk ID
      year: parseInt(data.year),
      revenue: data.revenue,
      currency: data.currency,
      status: 'draft'         // Default status
    }, { 
      onConflict: 'user_id, year' // Ensure we don't create duplicates for the same year
    });

  if (assessmentError) {
    console.error('Assessment Update Error:', assessmentError);
  }

  return { success: true };
}