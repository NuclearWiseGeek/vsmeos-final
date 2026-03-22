import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client authenticated with the user's Clerk token.
 * Use this for ALL database actions (reads, writes, deletes).
 *
 * SECURITY: This client respects Row Level Security (RLS) policies.
 * Each user can only access their own data because the JWT contains
 * their Clerk userId, and RLS policies filter on that.
 *
 * NEVER use SUPABASE_SERVICE_ROLE_KEY in user-facing code — it bypasses RLS.
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

// NOTE: The anonymous client export was removed (March 2026, security audit).
// An unauthenticated client bypasses RLS and should never be used for
// user-facing operations. If you need an admin client for a server action,
// use SUPABASE_SERVICE_ROLE_KEY inside that specific server action only
// (see actions/uploadEvidence.ts for the pattern).