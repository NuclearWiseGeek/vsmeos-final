// =============================================================================
// FILE: app/api/sync/route.ts
// PURPOSE: Syncs supplier assessment data to/from Supabase.
//
// SECURITY: Uses Clerk-authenticated Supabase client (RLS enforced).
//           NEVER use SUPABASE_SERVICE_ROLE_KEY in user-facing API routes.
//
// NOTE: This route is a legacy fallback. The primary save/load mechanism
//       is ESGContext.tsx + AutoSave.tsx which use Clerk tokens directly.
//       Consider deprecating this route once all clients use the context path.
// =============================================================================

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function createAuthenticatedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );
}

// SAVE DATA (POST)
export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = await getToken({ template: 'supabase' });
    if (!token) return NextResponse.json({ error: "No auth token" }, { status: 401 });

    const supabase = createAuthenticatedClient(token);
    const body = await req.json();

    const { error } = await supabase
      .from('assessments')
      .upsert(
        { user_id: userId, company_name: body.companyName, data: body },
        { onConflict: 'user_id' }
      );

    if (error) throw error;
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[VSME OS] Sync POST error:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}

// READ DATA (GET)
export async function GET() {
  try {
    const { userId, getToken } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = await getToken({ template: 'supabase' });
    if (!token) return NextResponse.json({ error: "No auth token" }, { status: 401 });

    const supabase = createAuthenticatedClient(token);

    const { data, error } = await supabase
      .from('assessments')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json(data?.data || null);

  } catch (error) {
    console.error("[VSME OS] Sync GET error:", error);
    return NextResponse.json({ error: "Failed to read" }, { status: 500 });
  }
}