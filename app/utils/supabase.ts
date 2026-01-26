import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client authenticated with the user's Clerk token.
 * Use this for all database actions (Uploads, Inserts, Selects).
 */
export const createSupabaseClient = (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};

/**
 * A basic client for public/anonymous actions (if needed later).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);