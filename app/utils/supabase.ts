import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let client: SupabaseClient | null = null;
let currentToken: string | null = null;

/**
 * Returns a singleton Supabase client authenticated with the user's Clerk token.
 * Reuses the same instance as long as the token hasn't changed — prevents the
 * "Multiple GoTrueClient instances" warning and undefined behaviour between pages.
 *
 * SECURITY: Respects Row Level Security (RLS). Each user only sees their own data.
 * NEVER use SUPABASE_SERVICE_ROLE_KEY in user-facing code — it bypasses RLS.
 */
export const createSupabaseClient = (clerkToken: string): SupabaseClient => {
  // Reuse existing client if token is the same
  if (client && currentToken === clerkToken) {
    return client;
  }

  // Create new client (first load or token refreshed)
  currentToken = clerkToken;
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });

  return client;
};