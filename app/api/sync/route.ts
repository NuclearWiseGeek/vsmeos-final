import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Check Security (Clerk) - ADDED "await" HERE 👇
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the Data the user sent
    const body = await req.json();

    // 3. Connect to Database (using Master Key)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Save to "assessments" table
    const { error } = await supabase
      .from('assessments')
      .upsert(
        { 
          user_id: userId,          // The Clerk ID
          company_name: body.companyName, 
          data: body                // Save the ENTIRE state as JSON
        }, 
        { onConflict: 'user_id' }   // If ID exists, update it. If not, create new.
      );

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}