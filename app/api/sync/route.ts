import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 1. Setup Database Connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// SAVE DATA (POST)
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}

// READ DATA (GET) - This is the new part! 👇
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ask Database for this user's data
    const { data, error } = await supabase
      .from('assessments')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 just means "no data found yet"
      throw error;
    }

    // If we found data, return it. If not, return null.
    return NextResponse.json(data?.data || null);

  } catch (error) {
    console.error("Read Error:", error);
    return NextResponse.json({ error: "Failed to read" }, { status: 500 });
  }
}