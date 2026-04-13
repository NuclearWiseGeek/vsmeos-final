'use server';

import { createSupabaseClient } from '@/utils/supabase';
import { auth } from '@clerk/nextjs/server';

export async function saveUserRole(role: 'buyer' | 'supplier') {
  const { userId, getToken } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const token = await getToken({ template: 'supabase' });
  if (!token) return { error: 'No auth token' };

  const supabase = createSupabaseClient(token);

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id:         userId,
      role:       role,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error('saveUserRole error:', error);
    return { error: 'Failed to save role' };
  }

  return { success: true };
}